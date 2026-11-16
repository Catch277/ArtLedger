/** Only the members the app calls, as a human-readable ABI. */
export const ERC721_ABI = [
  // The deployed contract mints to an explicit recipient: mintTacPham(address,string), not (string).
  'function mintTacPham(address to, string tokenURI) returns (uint256)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function tongSoTacPham() view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

export const TRANSFER_EVENT = 'Transfer(address,address,uint256)';