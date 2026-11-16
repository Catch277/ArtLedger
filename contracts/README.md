# contracts/

Reference source for the ERC-721 registry the app talks to. **This folder is not built here.**

There is no Solidity toolchain in this repository by design: no Hardhat, no Foundry, no `solc`, no
Solidity test runner. `AGENTS.md` stays the single contract for commands, and adding one is an ask-first
change. Nothing in `npm install`, `npx tsc --noEmit`, `npm run lint` or `npm run build` touches this folder.

## Provenance: read this before trusting the file

`TacPhamNFT.sol` is a **reconstruction**, not the source of the deployed bytecode.

The app was built against a contract deployed outside this repository. The client only ever held a hand-written
ABI subset (`lib/infrastructure/web3/erc721Abi.ts`) plus an address from `NEXT_PUBLIC_CONTRACT_ADDRESS`. The
original `.sol` was not in this repository and was not on the author's machine when this file was written, so
the source was reconstructed from the ABI plus the behaviour the client depends on.

- **Authoritative:** the verified source on Etherscan for `NEXT_PUBLIC_CONTRACT_ADDRESS`, and the bytecode at
  that address.
- **This file:** documentation of the mapping and the invariants, written so the client code can be reviewed
  next to a readable contract.
- If the original source turns up, **replace this file with it** and delete this section.

## ABI map

Every member the client calls, and where it is called from:

| Contract member | Client call site | Notes |
| --- | --- | --- |
| `tongSoTacPham() view returns (uint256)` | `JsonRpcArtworkQueryGateway.getTotalSupply` | total minted, drives `/library` and the landing stats |
| `ownerOf(uint256) view returns (address)` | `getOwnerOf`, `MetamaskArtworkWriteGateway` | must revert for unknown ids, which becomes `TokenNotFoundError` |
| `tokenURI(uint256) view returns (string)` | `getTokenUri`, `findTokenIdByTokenUri` | `ipfs://<cid>` strings only; the client never stores gateway URLs |
| `mintTacPham(address to, string tokenURI) returns (uint256)` | `MetamaskArtworkWriteGateway.mint` | recipient is explicit; simulated with `staticCall` before MetaMask opens |
| `transferFrom(address,address,uint256)` | `MetamaskArtworkWriteGateway.transfer` | also simulated first |
| `event Transfer(address indexed,address indexed,uint256 indexed)` | `/api/history`, `getTransferHistory` | `tokenId` must stay indexed - `eth_getLogs` filters on `topics[3]` |

`lib/infrastructure/web3/erc721Abi.ts` is the *client subset* of this surface. Keep the two in sync by hand;
there is no codegen, on purpose.

## Facts confirmed against the live deployment

Probed on Sepolia with a public RPC (`name()`, `symbol()`, `tongSoTacPham()`, `ownerOf`, `tokenURI`, deploy
receipt), so these are observed values, not assumptions:

| Fact | Value |
| --- | --- |
| Address | `0x78364d2B6c396594db0552e5a2670bb98A96d169` |
| `name()` / `symbol()` | `Tac Pham Nghe Thuat So` / `TPNT` |
| Deploy transaction | `0xec8afdfe…20da2`, block **11906987**, gas 16 539 165, 0 logs |
| Bytecode | ~20.7 KB |
| `tongSoTacPham()` | `2` (ids 1 and 2) |
| `totalSupply()` | **does not exist** — the call reverts; the app only ever calls `tongSoTacPham()` |
| Token 1 | owner `0xdcd5…094a7`, `tokenURI` `ipfs://bafkreiewgae…` |
| Token 2 | owner `0x13C3…921ef` (deployer), `tokenURI` `ipfs://bafkreidzfob…` |
| Metadata dialect | ERC-721 `attributes`: `tac_gia`, `Nam sang tac`, no `sha256` |
| Mint signature | `mintTacPham(address to, string tokenURI)` — selector `0xba17ac6f`. **`mintTacPham(string)` does not exist**, and calling it hits the fallback, which reverts with no data |
| Duplicate URI | reverts with `Error("URI da duoc su dung")` — a string reason, so the revert data is decodable |
| Other members | `transferFrom`, `safeTransferFrom` ×2, `approve`, `setApprovalForAll`, `isApprovedForAll`, `supportsInterface`, `balanceOf`, `getApproved` all present; **no** `totalSupply()`, **no** `transferOwnership`, **no** pause/price getters |

The metadata row matters: `lib/domain/schemas/artworkMetadata.ts` accepts **both** that dialect and the flat
`author` / `year` shape this app mints, and normalises them into one entity. Dropping the attribute dialect
would make every token minted by the original client read as broken metadata.

Two consequences for the reference source: `name` and `symbol` above were corrected to the observed values, and
the 1-based id assumption is confirmed (ids run `1..tongSoTacPham()`).

## Invariants the client depends on

1. Token ids are `1..tongSoTacPham()`, contiguous, never reused. `ListLibraryUseCase` walks that range
   backwards and `findTokenIdByTokenUri` does the same, because there is no indexer.
2. `tokenURI` is unique per collection. A duplicate mint reverts, which is what makes the `/register` and
   `/lab` simulations useful (a rejected call costs no gas and prompts no signature).
3. `ownerOf` and `tokenURI` revert for unknown ids rather than returning `address(0)` / `""`.
4. `Transfer` keeps `tokenId` indexed so the log scan can filter per token.
5. Global indexers (`totalSupply`, `balanceOf`, `transferFrom`) are safe to call from the public RPC without a
   wallet, which is what lets the verifier persona work with no MetaMask.

## Environment

| Variable | Meaning |
| --- | --- |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | deployed `TacPhamNFT` address on Sepolia; empty → the app shows a setup notice instead of failing |
| `NEXT_PUBLIC_DEPLOY_BLOCK` | block the contract was deployed at; bounds the `eth_getLogs` scan in `/api/history` |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | public RPC used for every read |

## Redeploying

Deploying a new instance changes the address, so:

1. existing token ids and every shared `/verify?tokenId=N` link point at the old contract - the library starts
   empty again, and the IPFS pins stay valid but orphaned;
2. update `NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_DEPLOY_BLOCK` together, or history scans start from
   genesis and `/library` silently reads the wrong deployment;
3. verify the new source on Etherscan, otherwise this file is the only description of the contract and the
   "you can verify this" claim stops being true for the contract itself.

## Deliberate differences from a production ERC-721

- **Open mint.** Anyone may register an artwork; an owner-only guard would break `/register` for visitors.
  Acceptable for a Sepolia demo, not for a real registry.
- **No enumeration extension** (`tokenOfOwnerByIndex`), no royalties, no per-token metadata mutation: the
  artwork is immutable once minted, which is the point.
- **`sha256` lives in the metadata, not on chain.** The contract stores only the `ipfs://` URI; the integrity
  check is `/check` comparing hashes client-side. Moving it on chain would cost gas per artwork and change the
  ABI.
