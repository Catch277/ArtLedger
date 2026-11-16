# ArtLedger

Sổ đăng ký và xác thực quyền sở hữu tác phẩm nghệ thuật số: mỗi tác phẩm là một **NFT ERC-721 trên Ethereum
Sepolia**, tệp gốc và metadata nằm trên **IPFS**, và mã băm **SHA-256** cho phép phát hiện bản bị chỉnh sửa.

Không có cơ sở dữ liệu, không có máy chủ ứng dụng riêng. Danh tính là địa chỉ ví; chữ ký giao dịch do
MetaMask thực hiện. Người xác minh không cần ví vẫn tra cứu được toàn bộ thông tin.

## What it does

| Route | Screen (vi) | Job | Status |
| --- | --- | --- | --- |
| `/` | Tổng quan | Giải thích sản phẩm, dẫn vào các nghiệp vụ | **built** |
| `/library` | Thư viện | Liệt kê tác phẩm đã đăng ký (`tongSoTacPham` + `tokenURI`) | **built** |
| `/register` | Đăng ký tác phẩm | Ảnh → IPFS → mô phỏng mint → ký giao dịch | **built** |
| `/transfer` | Chuyển nhượng | Chủ sở hữu chuyển NFT cho ví khác | **built** |
| `/verify` | Tra cứu & xác thực | Đọc on-chain + metadata IPFS + timeline, không cần ví | **built** |
| `/lab` | Phòng thí nghiệm | Giả lập mint trùng / chuyển nhượng trái phép bằng `eth_call` | **built** |
| `/check` | Kiểm tra ảnh | So sánh SHA-256 của tệp với dấu vân tay đã đăng ký | **built** |
| `/profile` | Hồ sơ | Tên hiển thị, ảnh đại diện, liên kết; số dư Sepolia, NFT đang giữ và lịch sử giao dịch kèm phí gas | **built** |

## How the flow works

1. Người dùng chọn ảnh (PNG/JPG/WEBP/GIF ≤ 4 MB) và nhập metadata.
2. Trình duyệt tính **SHA-256** bằng Web Crypto — cùng thuật toán với `sha256sum` trên máy.
3. `POST /api/pin-file` đẩy ảnh lên Pinata và trả `image_cid`; `POST /api/pin-json` pin metadata.
4. `tokenURI = ipfs://<metadata_cid>`.
5. Hệ thống gọi `eth_call` mô phỏng `mintTacPham(tokenURI)`. Nếu contract revert vì URI đã dùng, giao dịch
   **không bao giờ được gửi** và UI chỉ ra token đã tồn tại.
6. Người dùng ký `mint` trong MetaMask; chờ block; hiển thị `tokenId`, `txHash`, link Etherscan.
7. Bất kỳ ai mở `/verify`, nhập Token ID: đọc `ownerOf` + `tokenURI`, tải metadata từ gateway, dựng timeline
   từ sự kiện `Transfer`.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16.4 (App Router, Turbopack) + React 19.3 |
| Language | TypeScript 5, `strict: true`, no `any` |
| Styling | Tailwind CSS v4 through `@tailwindcss/turbopack` |
| Icons | `lucide-react` - 16/18/24px, `strokeWidth={2}` (DESIGN.md §6) |
| Fonts | Inter (UI + tiêu đề) + Geist Mono (dữ liệu), nạp qua `next/font/google` với subset tiếng Việt |
| Web3 | `ethers` v6 (`BrowserProvider` for writes, `JsonRpcProvider` for reads) |
| Chain | Ethereum Sepolia, chainId `11155111` |
| Storage | IPFS via Pinata (JWT stays server-side) |
| Validation | `zod` v4 — metadata, API bodies, query params |
| Database | none — on-chain state + IPFS |
## Architecture

Clean Architecture with a one-way dependency flow. HTTP concerns stay in route handlers, business rules in use
cases, and only the infrastructure layer knows about ethers, MetaMask or Pinata.

```text
app/**/page.tsx, components/**     Presentation   React 19 + Tailwind tokens (Vietnamese copy)
        |
        v
lib/usecases/*UseCase.ts           Application    one class per action, constructor injection
        |
        v
lib/domain/**                      Domain         entities, ports, zod schemas, typed errors
        ^
        | implements
lib/infrastructure/**              Infrastructure ethers v6, window.ethereum, Pinata, Web Crypto

app/api/{pin-file,pin-json,history} Transport      parse -> validate -> one use case -> map errors
```

- **No database.** Ownership is `ownerOf(tokenId)` on chain; the file and metadata are content-addressed on
  IPFS. Nothing needs reconciling, so there is nothing to migrate.
- **No backend.** The three route handlers exist only to hide `PINATA_JWT` and to normalise errors; they hold
  no state and write nothing.
- **Reads are wallet-free.** A public Sepolia RPC serves `/verify`, `/library` and `/api/history`, which is what
  makes the verifier persona possible.
- **Writes are simulated first.** `eth_call` reproduces the contract's verdict for free, so a duplicate URI
  or a non-owner transfer is rejected before the user is asked to sign anything.

## Hợp đồng thông minh

Hợp đồng ERC-721 (`TacPhamNFT`) được triển khai **bên ngoài** kho này. Ứng dụng chỉ giữ một tập ABI tối thiểu
trong `lib/infrastructure/web3/erc721Abi.ts` và đọc địa chỉ từ `NEXT_PUBLIC_CONTRACT_ADDRESS`.

| Thành phần | Vị trí |
| --- | --- |
| ABI mà client dùng | `lib/infrastructure/web3/erc721Abi.ts` |
| Mã nguồn tham chiếu | `contracts/TacPhamNFT.sol` — dựng lại từ ABI, **không** biên dịch hay kiểm thử trong kho này |
| Ghi chú thiết kế + bất biến | `contracts/README.md` |

- Token ID là `1..tongSoTacPham()`, liên tục và không tái sử dụng; `tokenURI` là duy nhất nên mint trùng bị
  revert ngay ở bước mô phỏng `eth_call`.
- Sự kiện `Transfer` giữ `tokenId` ở dạng indexed để `/api/history` lọc `eth_getLogs` mà không cần indexer.
- `contracts/` là tài liệu tham chiếu: kho này không có `solc`, Hardhat hay Foundry, và theo `AGENTS.md` việc
  thêm toolchain là thay đổi phải hỏi trước. Đổi chữ ký hàm trong hợp đồng thì phải sửa `erc721Abi.ts` trong
  cùng commit.
- Nguồn có thẩm quyền là mã đã verify trên Etherscan tại địa chỉ đang cấu hình, không phải tệp trong
  `contracts/`.

## Project structure

```text
artledger/
├── app/
│   ├── api/                    Route handlers (pin-file, pin-json, pin-profile, history)
│   ├── fonts/                  Inter + Geist Mono wiring (SVN kit kept as source art)
│   ├── globals.css             Design tokens (@theme) and base typography
│   ├── layout.tsx              Shell: fonts, metadata, lang=vi
│   └── (site)/                 Shell layout, landing page and the seven business screens
├── public/brand/               Logo lockup + mark (favicon comes from app/icon.png)
├── components/                 Shell, wallet cluster, slot-based UI primitives
├── contracts/                  TacPhamNFT.sol reference source + README (not built here)
├── lib/
│   ├── domain/                 Entities, ports, schemas, errors, Sepolia/IPFS config
│   ├── usecases/               ConnectWallet, ListLibrary, VerifyArtwork, RegisterArtwork, ...
│   ├── infrastructure/         web3/, ipfs/, storage/, crypto/, config/env.ts
│   └── domain/format/          Wei → ETH formatting (no ethers in the domain)
├── DESIGN.md                   Visual contract: colour, type, components, states
├── AGENTS.md / CLAUDE.md       Rules for contributors and AI agents
└── .env.example                The three environment variables
```

## Getting started

### Prerequisites

- Node.js 20+ and npm (developed on Node 22 / npm 10).
- MetaMask for the write paths; reads work without it.
- A Pinata account (JWT) for pinning, and a Sepolia RPC endpoint.

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env.local` and fill it in. `.env*` is git-ignored.

| Variable | Purpose |
| --- | --- |
| `PINATA_JWT` | Server-only Pinata token. Never prefix it with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Public Sepolia JSON-RPC endpoint used for all reads. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed ERC-721 address; empty shows a setup notice instead of failing. |
| `NEXT_PUBLIC_DEPLOY_BLOCK` | Optional block the contract was deployed at, to bound the `eth_getLogs` scan. |

Missing values do not break the build: the request that needs one fails at runtime with a readable message.

**`PINATA_JWT`** — server-only, never prefixed with `NEXT_PUBLIC_` (anything public is inlined into the client
bundle). To get one:

1. Sign in at [app.pinata.cloud](https://app.pinata.cloud).
2. **API Keys → New Key**, enable `pinFileToIPFS` and `pinJSONToIPFS` (or Admin), name it `artledger`.
3. Copy the **JWT** — three dot-separated segments starting with `eyJ` — not the API Key / Secret pair.
4. Paste it as `PINATA_JWT=eyJ…`, then restart the dev server: env values are read at boot.

If `/api/pin-*` answers `502 … INVALID_CREDENTIALS … token contains an invalid number of segments`, the API key
was pasted instead of the JWT.

**`NEXT_PUBLIC_SEPOLIA_RPC_URL`** — any Sepolia JSON-RPC endpoint. Reads only, so a public one is enough:

| Provider | URL |
| --- | --- |
| OnFinality (public) | `https://eth-sepolia.api.onfinality.io/public` |
| Ankr (public) | `https://rpc.ankr.com/eth_sepolia` |
| Alchemy | dashboard → new app on Sepolia → `https://eth-sepolia.g.alchemy.com/v2/<key>` |
| Infura | `https://sepolia.infura.io/v3/<key>` |

Public endpoints rate-limit. If `/library` times out, switch provider rather than retrying.

**`NEXT_PUBLIC_CONTRACT_ADDRESS`** — the deployed `TacPhamNFT`. Nothing in this repo deploys it (`contracts/`
is reference-only), so it comes from whoever deployed the contract, or from your own deployment:

1. Open [remix.ethereum.org](https://remix.ethereum.org) and paste `contracts/TacPhamNFT.sol`.
2. Compiler `0.8.24` (or newer with the same pragma), **Deploy & Run → Injected Provider — MetaMask**, network
   Sepolia.
3. Deploy, copy the address under *Deployed Contracts*, and verify the source on
   [sepolia.etherscan.io](https://sepolia.etherscan.io) so anyone can check it.

Left empty — or on the `0x...` placeholder — the app shows a setup notice instead of failing.

**`NEXT_PUBLIC_DEPLOY_BLOCK`** — optional. The block the contract was created in (Etherscan → the deployment
transaction). It bounds the `eth_getLogs` scan behind `/api/history` and the transfer timeline; without it the
scan starts at genesis.

### 3. Sepolia

1. Add the network to MetaMask (chainId `11155111`, currency `SepoliaETH`).
2. Get test ETH from a Sepolia faucet — minting needs gas.
3. Put the deployed contract address in `NEXT_PUBLIC_CONTRACT_ADDRESS`, plus its deploy block in
   `NEXT_PUBLIC_DEPLOY_BLOCK` (see §2).

The deployment this repo was built against: `0x78364d2B6c396594db0552e5a2670bb98A96d169` (block `11906987`,
`Tac Pham Nghe Thuat So` / `TPNT`, two tokens). `contracts/README.md` records what was verified on chain.

### 4. Run

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the build
```

## API

Four internal route handlers; there is no REST backend behind them. Status codes are shared across all four:
`400` invalid body, `413` file too large, `415` unsupported media type, `502` upstream (Pinata/IPFS/RPC),
`500` unexpected. None of them stores anything: they exist to keep `PINATA_JWT` on the server.

| Method & path | Body / query | Returns |
| --- | --- | --- |
| `POST /api/pin-file` | `multipart/form-data` with `file` (PNG/JPG/WEBP/GIF, ≤ 4 MB) | `{ cid, uri }` |
| `POST /api/pin-json` | metadata JSON (validated by the zod schema) | `{ cid, tokenUri }` |
| `POST /api/pin-profile` | profile JSON (`version`, `address`, `displayName`, `bio`, `avatar`, `links`, `updatedAt`) | `{ cid, uri }` |
| `GET /api/history?tokenId=<id>` | decimal token id | `{ tokenId, transfers: [...] }` |

## Data model

On-chain (`TacPhamNFT`, ERC-721):

| Member | Meaning |
| --- | --- |
| `mintTacPham(address,string)` | Registers a work for an explicit recipient; reverts when the URI was already used |
| `transferFrom(address,address,uint256)` | Moves ownership; history comes from the event |
| `ownerOf(uint256)` | Current owner of a token |
| `tokenURI(uint256)` | `ipfs://<metadata_cid>` |
| `tongSoTacPham()` | Total minted tokens, used by `/library` |
| `Transfer(address,address,uint256)` | Event that builds the timeline |

Off-chain metadata JSON (validated with zod in both directions):

| Field | Rule |
| --- | --- |
| `name` | required, ≤ 100 characters |
| `author` | required (this app's dialect) |
| `description` | optional, ≤ 500 characters |
| `year` | 1900 .. current year |
| `image` | `ipfs://<image_cid>` |
| `sha256` | optional additive extension — the fingerprint `/check` compares |
| `tac_gia` | accepted as an alias of `author`: the deployed collection's dialect |
| `attributes[]` | accepted; `Tac gia` and `Nam sang tac` supply author and year when the flat fields are absent |

Both dialects are accepted and normalised into one entity, because the deployed tokens (minted by the original
client) carry `tac_gia` and `attributes` rather than `author` / `year`, and carry no `sha256` at all.

### Hồ sơ (profile)

- Tên hiển thị, giới thiệu, ảnh đại diện và liên kết **không** nằm trên chuỗi và không nằm trên máy chủ nào: bản
  nháp lưu trong `localStorage` theo địa chỉ ví (`artledger:profile:v1:<address>`), nên nó thuộc về thiết bị
  đang dùng, không đi theo ví sang máy khác.
- Nút `Công bố lên IPFS` pin JSON qua `/api/pin-profile` và trả về `ipfs://<cid>`; CID được lưu cùng bản nháp
  và mở được ở `/profile?uri=ipfs://<cid>`.
- Tài liệu đã pin là bất biến: chỉnh sửa sau đó tạo CID mới, bản cũ vẫn đọc được bằng CID cũ. Không có cách
  "xóa" một CID.
- Không có chữ ký: tài liệu khai báo địa chỉ ví nhưng không chứng minh ai viết, nên giao diện gọi nó là hồ sơ
  công bố chứ không phải hồ sơ "đã xác thực".
- Số dư và danh sách NFT thì là dữ liệu thật: `getBalance` qua MetaMask, và `ownerOf` quét `1..tongSoTacPham()`
  vì hợp đồng không có hàm liệt kê.

## Acceptance checks

| Criterion | How to check it by hand |
| --- | --- |
| AC-1 file allowlist | Pick a PDF or a 5 MB PNG: rejected in the picker, before any upload |
| AC-2 hash parity | Compare the SHA-256 shown in the UI with `sha256sum <file>` (`Get-FileHash` on Windows) |
| AC-3 cancelled signature | Reject in MetaMask: the message says the transaction was cancelled, not a system error |
| AC-4 duplicate URI | Register the same image twice: blocked before signing, with a link to the existing token |
| AC-5 profile draft survives reload | Save a profile on `/profile`, reload: it comes back. Switch wallet in MetaMask: a different draft (or none) appears |
| AC-6 owned NFT list | The count on `/profile` matches the tokens you can prove with `ownerOf` on Sepolia; after a transfer in, press `Làm mới` |
| AC-7 publish is immutable | Press `Công bố lên IPFS`, open the `Xem bản công bố` link, then edit the draft: the link still shows the old document |

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Write buttons disabled, banner says wrong network | MetaMask is not on Sepolia. Press `Chuyển sang Sepolia`, or switch manually (chainId 11155111) |
| Button asks to install a wallet | `window.ethereum` is absent. Install MetaMask and reload |
| `Bạn đã hủy giao dịch.` | Expected: the signature was rejected. Nothing was written; retry when ready |
| Mint blocked with an existing token link | The metadata URI already exists on chain (AC-4). Open the linked token instead of minting again |
| `502` on `/api/pin-*` with an auth error | `PINATA_JWT` is missing, expired or lacks pinning scope. Check `.env.local` and the Pinata dashboard |
| `/api/history` returns `500`, server log says `could not coalesce error` | The RPC refuses wide `eth_getLogs` ranges. The scan already walks 10k-block windows; a provider with a lower cap needs another endpoint (Alchemy or Ankr with a key) |
| Reads work one minute and 429 the next | Public RPC rate limit. `https://eth-sepolia.api.onfinality.io/public` throttles aggressively; `https://ethereum-sepolia-rpc.publicnode.com` is a steadier default |
| Pinata asks for a username/password when opening an artwork | Nothing is private: `gateway.pinata.cloud` answers `401` + a Basic-auth challenge once an IP exceeds its anonymous quota, and Firefox renders that as a sign-in dialog. The content is public (the JSON still loads). `lib/domain/config/ipfs.ts` lists fallback gateways, and `ArtworkImage` retries the next one on error |
| `/register` fails with `execution reverted` and no reason | The ABI does not match the deployment: that selector hits the fallback. Here it was `mintTacPham(string)` vs the deployed `mintTacPham(address,string)`. Compare `Interface.getFunction(name).selector` against the bytecode's `PUSH4` constants before sending a transaction |
| Metadata loads slowly or times out | The public gateway is rate-limited. Retry; a dedicated gateway URL can be configured in one place |
| Library shows a setup notice | `NEXT_PUBLIC_CONTRACT_ADDRESS` is empty or not a `0x…` address |
| Text renders in Arial | The font files under `app/fonts/` are missing from the deployment; they are committed, so check the build output |

## Related documents

| File | Content |
| --- | --- |
| `DESIGN.md` | Colour, typography, components, states and the accessibility rules |
| `AGENTS.md` (imported by `CLAUDE.md`) | Architecture, layering, route/Web3/IPFS rules for contributors and agents |
| `.env.example` | The three variables, with comments |

## Tóm tắt (Tiếng Việt)

- ArtLedger đăng ký tác phẩm số thành NFT ERC-721 trên Sepolia, lưu ảnh và metadata trên IPFS qua Pinata.
  Danh tính là ví MetaMask; không có cơ sở dữ liệu và không có backend riêng.
- Kiến trúc Clean Architecture: giao diện trong `app/`, nghiệp vụ trong `lib/usecases`, hợp đồng dữ liệu trong
  `lib/domain`, còn ethers/MetaMask/Pinata chỉ nằm ở `lib/infrastructure`. Route handler trong `app/api` chỉ
  đọc request, kiểm tra bằng zod, gọi đúng một use case rồi ánh xạ lỗi sang mã HTTP.
- Cài đặt: `npm install`, tạo `.env.local` từ `.env.example` gồm `PINATA_JWT`,
  `NEXT_PUBLIC_SEPOLIA_RPC_URL`, `NEXT_PUBLIC_CONTRACT_ADDRESS`, sau đó `npm run dev`.
- Trước khi ghi lên chuỗi, hệ thống mô phỏng bằng `eth_call` để chặn mint trùng và chuyển nhượng trái phép
  mà không tốn gas; người xác minh không cần ví vẫn tra cứu được.
- Bộ nhận diện đã hoàn chỉnh: màu, phông Inter/Geist Mono, token trong `app/globals.css`; tám màn hình, use case
  và route API đều đã xong (xem bảng trạng thái trong `AGENTS.md`).
- Trang chủ mở đầu bằng chợ tác phẩm: bốn NFT mới nhất đọc từ hợp đồng, kèm trạng thái trống/lỗi rõ ràng; không
  bịa giá vì hợp đồng không có trường giá.
- Hồ sơ cá nhân (`/profile`): sửa tên hiển thị, ảnh đại diện, liên kết; xem số dư Sepolia và NFT đang giữ. Bản
  nháp nằm trên thiết bị, bản công bố nằm trên IPFS — nêu rõ giới hạn này để không ai tưởng là dữ liệu on-chain.
