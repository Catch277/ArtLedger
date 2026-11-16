// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * TacPhamNFT - the ERC-721 registry behind ArtLedger.
 *
 * STATUS: reference source, NOT the deployed bytecode's source.
 * --------------------------------------------------------------------------
 * The app was built against a contract deployed outside this repository: the
 * client only ever held a hand-written ABI subset
 * (lib/infrastructure/web3/erc721Abi.ts) plus NEXT_PUBLIC_CONTRACT_ADDRESS.
 * This file was reconstructed from that ABI and from the behaviour the client
 * depends on, so it documents the contract rather than reproducing it. The
 * deployment is authoritative - if the original .sol turns up, replace this.
 *
 * Invariants the client relies on. Changing any of them means updating
 * lib/infrastructure/web3/JsonRpcArtworkQueryGateway.ts and
 * lib/usecases/ListLibraryUseCase.ts in the same change:
 *   1. token ids are 1..tongSoTacPham(), contiguous and never reused;
 *   2. tongSoTacPham() counts every token ever minted;
 *   3. tokenURI is unique across the collection - a duplicate mint reverts,
 *      which is what /register and /lab simulate before asking for a signature;
 *   4. Transfer keeps tokenId as an indexed topic, because /api/history filters
 *      eth_getLogs by token and there is no indexer;
 *   5. ownerOf and tokenURI revert on unknown ids, which the client maps to
 *      TokenNotFoundError instead of a zero address.
 *
 * Nothing in this repository compiles, tests or deploys this file: there is no
 * Solidity toolchain here by design (see AGENTS.md and contracts/README.md).
 */
contract TacPhamNFT {
    string public constant name = 'Tac Pham Nghe Thuat So';
    string public constant symbol = 'TPNT';

    uint256 private _totalSupply;
    mapping(uint256 tokenId => address owner) private _owners;
    mapping(address owner => uint256 count) private _balances;
    mapping(uint256 tokenId => string uri) private _tokenUris;
    mapping(uint256 tokenId => address approved) private _tokenApprovals;
    mapping(address owner => mapping(address operator => bool approved)) private _operatorApprovals;
    /** keccak256(tokenURI) => tokenId, so the duplicate check is O(1) and not a loop. */
    mapping(bytes32 uriHash => uint256 tokenId) private _tokenIdByUriHash;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    error ZeroAddress();
    error SelfApproval();
    error EmptyTokenUri();
    error DuplicateTokenUri(string tokenUri);
    error NonexistentToken(uint256 tokenId);
    error NotOwnerOrApproved(address caller, uint256 tokenId);
    error FromIsNotOwner(address from, uint256 tokenId);
    error UnsafeRecipient(address to);

    /* ---------------------------------------------------------------- reads */

    /// @notice Number of artworks registered so far. The client calls this `tongSoTacPham`.
    function tongSoTacPham() external view returns (uint256) {
        return _totalSupply;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) external view returns (uint256) {
        if (owner == address(0)) revert ZeroAddress();
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        if (owner == address(0)) revert NonexistentToken(tokenId);
        return owner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        if (_owners[tokenId] == address(0)) revert NonexistentToken(tokenId);
        return _tokenUris[tokenId];
    }

    /* ---------------------------------------------------------------- mint */

    /**
     * @notice Registers a new artwork for `to`. Open to anyone on purpose: the demo
     * mints from whichever wallet is connected, so an owner-only guard would break
     * /register for every visitor.
     * @dev Returns the new id instead of nothing, because the client reads it
     * back from the receipt to build the /verify link.
     */
    function mintTacPham(address to, string calldata tokenUri) external returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddress();
        if (bytes(tokenUri).length == 0) revert EmptyTokenUri();

        bytes32 uriHash = keccak256(bytes(tokenUri));
        if (_tokenIdByUriHash[uriHash] != 0) revert DuplicateTokenUri(tokenUri);

        tokenId = ++_totalSupply; // 1-based: 0 doubles as "not registered"
        _owners[tokenId] = to;
        _balances[to] += 1;
        _tokenUris[tokenId] = tokenUri;
        _tokenIdByUriHash[uriHash] = tokenId;

        emit Transfer(address(0), to, tokenId);
    }

    /* ------------------------------------------------------------ approvals */

    function approve(address to, uint256 tokenId) external {
        address owner = ownerOf(tokenId);
        if (msg.sender != owner && !_operatorApprovals[owner][msg.sender]) {
            revert NotOwnerOrApproved(msg.sender, tokenId);
        }
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        if (_owners[tokenId] == address(0)) revert NonexistentToken(tokenId);
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        if (operator == address(0)) revert ZeroAddress();
        if (operator == msg.sender) revert SelfApproval();
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address owner, address operator) external view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /* ------------------------------------------------------------- transfer */

    function transferFrom(address from, address to, uint256 tokenId) public {
        if (to == address(0)) revert ZeroAddress();

        address owner = ownerOf(tokenId);
        if (owner != from) revert FromIsNotOwner(from, tokenId);
        if (msg.sender != owner && msg.sender != _tokenApprovals[tokenId] && !_operatorApprovals[owner][msg.sender]) {
            revert NotOwnerOrApproved(msg.sender, tokenId);
        }

        delete _tokenApprovals[tokenId];
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        transferFrom(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, '');
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external {
        transferFrom(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, data);
    }

    /// @dev The registry only ever holds itself; a contract recipient must still
    /// acknowledge the callback, the way ERC-721 requires.
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) private {
        if (to.code.length == 0) return;

        (bool ok, bytes memory returned) = to.call(
            abi.encodeWithSelector(bytes4(0x150b7a02), msg.sender, from, tokenId, data)
        );
        if (!ok || returned.length < 32 || abi.decode(returned, (bytes4)) != bytes4(0x150b7a02)) {
            revert UnsafeRecipient(to);
        }
    }

    /* ------------------------------------------------------------ ERC-165 */

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 || interfaceId == 0x80ac58cd; // ERC-165, ERC-721
    }
}
