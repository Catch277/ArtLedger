<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Working rules for AI coding agents and contributors on **ArtLedger**.
`CLAUDE.md` imports this file (`@AGENTS.md`): keep this the single source of truth and do not duplicate the
rules there.

## Project

ArtLedger is a demo web app that proves ownership of digital artworks with an **ERC-721 contract on Ethereum
Sepolia** and **IPFS (Pinata)** for the file and its metadata. The wallet is the identity: there is **no
database, no auth server and no separate backend**. Reads work without a wallet (public RPC), writes are
signed in MetaMask, and the only server code is a handful of Next.js route handlers that hide the Pinata JWT.

UI copy is Vietnamese; code, identifiers and comments are English. The visual contract is `DESIGN.md`.

### Current status

| Area | State |
| --- | --- |
| Design tokens, Inter + Geist Mono, landing page | **done** — `app/globals.css`, `app/fonts/`, `app/(site)/page.tsx` |
| Domain, use cases, infrastructure, API routes, business screens | **done** — `lib/domain`, `lib/usecases`, `lib/infrastructure`, `app/api/*`, `app/(site)/*` |
| Contract reference source | **done** — `contracts/TacPhamNFT.sol` + `contracts/README.md`. Reconstructed from the ABI, not built or tested here; the deployment is authoritative. |
| Landing market preview + `/profile` | **done** — `components/artwork/MarketPreview.tsx`, `app/(site)/profile/page.tsx`. Profile draft is device-local (`LocalStorageProfileStore`), publishing pins to IPFS; no database. |

## Layers

| Layer | Where | Rule |
| --- | --- | --- |
| Presentation | `app/**/page.tsx`, `components/**` | React 19 + Tailwind v4 using tokens from `DESIGN.md`. No business rules, no direct `ethers` calls. |
| Transport | `app/api/**/route.ts` (+ private `app/api/_lib/`) | HTTP only: parse, validate, call exactly one use case, map typed errors to status codes. |
| Application | `lib/usecases/*UseCase.ts` | Business rules. Depends only on port interfaces from `lib/domain`. |
| Domain | `lib/domain/**` | Entities, value types, port interfaces, zod schemas, typed errors. Framework-free. |
| Infrastructure | `lib/infrastructure/**` | Implements the ports: ethers v6, `window.ethereum`, Pinata, Web Crypto. |

Dependency direction is one-way: presentation → application → domain ← infrastructure.

Hard boundaries:

- `lib/domain` imports nothing but `zod` and its own files — no `next`, no `ethers`, no `window`.
- `ethers` and `window.ethereum` appear **only** under `lib/infrastructure/web3`.
- `PINATA_JWT` is read only in `lib/infrastructure/config/env.ts` and only called from route handlers.
- A use case never throws an HTTP status: it throws a typed domain error and the route maps it.
- Adapters are constructed at the edge (route handler or client component), never inside another adapter or
  a use case.

## Ports

| Port | Methods | Adapters |
| --- | --- | --- |
| `IIpfsReader` | `toGatewayUrl`, `readJson` | `GatewayIpfsReader` |
| `IIpfsPinner` | `pinFile`, `pinJson` | `ApiRouteIpfsPinner` (browser → `/api/pin-*`), `PinataIpfsPinner` (server) |
| `IProfilePublisher` | `publish` | `ApiRouteProfilePublisher` (browser → `/api/pin-profile`), `PinataProfilePublisher` (server) |
| `IProfileStore` | `read`, `write`, `clear` | `LocalStorageProfileStore` (device-local draft, no server) |
| `IWalletGateway` | `isAvailable`, `connect`, `disconnect`, `getAddress`, `getChainId`, `switchToSepolia`, `getBalance`, `onAccountsChanged`, `onChainChanged` | `MetamaskWalletGateway` |
| `IArtworkQueryGateway` | `getTotalSupply`, `getOwnerOf`, `getTokenUri`, `findTokenIdByTokenUri`, `getTransferHistory`, `getAccountTransactions` | `JsonRpcArtworkQueryGateway` |
| `IArtworkWriteGateway` | `simulateMint`, `mint`, `simulateTransfer`, `transfer` | `MetamaskArtworkWriteGateway` |

Reads go through the public RPC on purpose: the verifier persona must work with no wallet and no extension.
Writes and `eth_call` simulations need a signer, so they live behind the MetaMask adapter.

## Commands

Run from the repository root with **npm**:

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Dev server | `npm run dev` (http://localhost:3000) |
| Production build | `npm run build` |
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |

No test runner exists in this repository. **Never claim tests were run.** Verify with the typecheck, lint, a
production build and the screen or endpoint you changed. Adding a test runner, CI or Docker is an ask-first
change. `contracts/` holds reference Solidity that nothing here compiles or deploys — adding `solc`, Hardhat
or Foundry is the same ask-first change, and a contract edit that changes a signature must update
`lib/infrastructure/web3/erc721Abi.ts` in the same commit.
## Repo map

```text
d:/artledger
├── app/
│   ├── api/_lib/                 # private helpers (not routable): JSON parsing, error mapping
│   ├── api/pin-file/route.ts     # POST image  -> Pinata        (done)
│   ├── api/pin-json/route.ts     # POST metadata -> Pinata      (done)
│   ├── api/pin-profile/route.ts  # POST profile  -> Pinata      (done)
│   ├── api/history/route.ts      # GET Transfer logs            (done)
│   ├── fonts/                    # Inter + Geist Mono via next/font/google   (done)
│   ├── globals.css               # design tokens                (done)
│   ├── layout.tsx                # shell: fonts, metadata, lang=vi    (done)
│   ├── page.tsx                  # landing                      (done)
│   └── <segment>/page.tsx        # library, register, transfer, verify, lab, check, profile (done)
├── components/                   # shell, wallet cluster, artwork, profile, brand marks, slot-based UI primitives (done)
├── contracts/                    # TacPhamNFT.sol reference source + README (not built here)
├── public/brand/                 # logo lockup (retired) + mark, chains/ = 20 vendored chain badges (§6.2)
├── lib/
│   ├── domain/                   # entities, ports, schemas, errors, config (done)
│   ├── usecases/                 # one class per business action  (done)
│   ├── infrastructure/           # web3, ipfs, crypto, env        (done)
│   └── domain/format/            # wei -> ETH formatting            (done)
├── DESIGN.md                     # visual contract
├── AGENTS.md / CLAUDE.md         # these rules
├── .env.example                  # the three variables, empty
└── .clineignore                  # keeps agents out of build output and secrets
```

## Route handler recipe

1. `export async function POST(request: Request)` — no default export.
2. Parse defensively:

```ts
let body: unknown;
try {
  body = await request.json();
} catch {
  return NextResponse.json({ error: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
}
```

3. Validate with a zod schema from `lib/domain/schemas`; on failure answer `400` naming the offending fields,
   in Vietnamese.
4. `/api/pin-file` enforces the allowlist **before** any network call: MIME `image/png|jpeg|webp|gif` → `415`,
   size ≤ 4 MB → `413`.
5. Construct the adapter and exactly one use case:

```ts
const pinner = new PinataIpfsPinner(serverEnv.pinataJwt());
const result = await new PinArtworkFileUseCase(pinner).execute(input);
```

6. Map failures: `IpfsUploadError` → `502`, `MetadataValidationError` → `400`, anything else →
   `console.error('<action>', error)` plus a generic `500`. Never echo `error.message` or a stack trace from
   the catch-all branch.
7. Answer with `NextResponse.json(payload, { status })`; `201` when something was created.

Shared parsing lives in `app/api/_lib/` (`_folder` is opted out of routing) instead of being copied into two
handlers.

## Web3 rules

- **Sepolia only** (`chainId 11155111`). Wrong network → `WrongNetworkError`, a banner, disabled writes and a
  `switchToSepolia()` button.
- **Simulate before writing.** Every mint and transfer goes through `eth_call` (`staticCall`) first; a revert
  stops the flow before MetaMask opens, so a duplicate URI costs no gas and produces no signature prompt.
- **User rejection is not an error.** ethers' `ACTION_REJECTED` (code 4001) maps to
  `Bạn đã hủy giao dịch. Không có thay đổi nào được ghi lên chuỗi.` — neutral styling, retry allowed.
- **Never handle secrets.** No private keys, no seed phrases, no `eth_sign`; signing happens only in MetaMask.
- **Reads never require a wallet.** `/verify`, `/library` and `/api/history` use a `JsonRpcProvider` built from
  `NEXT_PUBLIC_SEPOLIA_RPC_URL`.
- React to `accountsChanged` and `chainChanged`; a stale address in the UI is a bug, not a cosmetic issue.
- Token ids are decimal **strings** in the domain and `bigint` only inside adapters. Addresses are
  `WalletAddress` = ``0x${string}``. Never `any`.
- A receipt is not a result: wait for one confirmation, then re-read `ownerOf`.
- **Gas comes from the receipt, never from a guess.** `/profile` shows `gasUsed × effectiveGasPrice` for the
  wallet's own transactions, at six decimals; a row the wallet did not send is marked as the sender's cost.
  Without an indexer the only enumerable history is the contract's `Transfer` logs — say so rather than
  implying the wallet's full activity.

## IPFS rules

- Store `ipfs://<cid>` on chain. Convert for display with `IIpfsReader.toGatewayUrl`; never persist a gateway
  URL.
- Metadata is validated with the zod schema on the way **in** (before pinning) and on the way **out** (after
  fetching from the gateway): `name` (≤100), `author`, `description` (≤500), `year` (1900..current),
  `image` (`ipfs://…`), optional `sha256`.
- `sha256` is an additive ERC-721 metadata extension; it is what `/check` compares against. Do not drop it
  without replacing the integrity check.
- Pinning is two steps: file, then the JSON that references the file CID. A failure surfaces at that step and
  is retryable without re-reading the file.
- `PINATA_JWT` never reaches the browser; the client calls `/api/pin-file` and `/api/pin-json`.
- A profile is **not** artwork metadata. The draft lives on the device (`IProfileStore` → `localStorage`) and
  `Công bố` pins it through `/api/pin-profile`. A published profile carries no signature, so the UI must never
  call it "đã xác thực" — the address inside it is a claim, not proof.

## Code conventions

- One exported class or interface per file, file named after the export; named exports in `lib/`, default
  exports only where Next.js requires them.
- Naming: `XxxUseCase`, ports `I<Name>`, adapters `<Technology><Port>` (`PinataIpfsPinner`,
  `MetamaskWalletGateway`), errors `XxxError`.
- Constructor injection only: `constructor(private readonly pinner: IIpfsPinner) {}`. No module-level
  singletons except the typed `window.ethereum` accessor.
- Inject nondeterminism (`now`, ids) so a use case stays testable.
- Domain errors extend `Error`, call `super(...)` and set `this.name`.
- No `any`. Narrow `unknown` with `typeof`/`in`/zod. `import type` for type-only imports; `async/await` only.
- Imports: `next/*` first, then `@/lib/...`, then local. `@/*` maps to the project root.
- Comments explain *why* (chain id, gateway choice, gas-free simulation), not *what*.

## UI rules

- Tokens only — never a literal hex in a component. `DESIGN.md` §2 is the palette, §7 the recipes, and
  §4.4 the four page patterns (landing, task, browse, proof) every route must follow.
- Inter carries UI and headings (headings stay at 400 with `tracking-tight`); Geist Mono is for hashes,
  addresses and token ids. Icons come from `lucide-react` only.
- Vietnamese copy, sentence case, a verb on every button. Every failure sentence says what happened and what
  to do next.
- Every async surface implements four states: loading, empty, error, success.
- Wallet and transaction states follow `DESIGN.md` §8 — especially *rejected* (neutral) versus *reverted*
  (danger).

## Definition of done

- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.
- The screen or endpoint you touched was walked through, including its error path.
- A new colour, font or component variant is added to `DESIGN.md` in the same change.
- A new screen is added to the README table; a new API route to its API table.
- No secret, gateway URL or private key appears in the client bundle or a log line.

## Tóm tắt (Tiếng Việt)

- ArtLedger là web demo xác thực quyền sở hữu tác phẩm số bằng NFT ERC-721 trên Sepolia; tệp và metadata nằm
  trên IPFS (Pinata). Không có cơ sở dữ liệu, không có backend riêng.
- Kiến trúc một chiều: `app/**` (giao diện) → `lib/usecases` (nghiệp vụ) → `lib/domain` (entities, ports,
  zod, lỗi) ← `lib/infrastructure` (ethers, MetaMask, Pinata, Web Crypto). `lib/domain` không được import
  `next` hay `ethers`.
- Chỉ route handler trong `app/api/**` được đọc `PINATA_JWT`; khoá bí mật không bao giờ mang tiền tố
  `NEXT_PUBLIC_`.
- Trước mọi giao dịch ghi phải mô phỏng bằng `eth_call`; người dùng huỷ ký là trạng thái bình thường, không
  phải lỗi đỏ.
- Giao diện tiếng Việt, mã nguồn tiếng Anh; màu và phông chữ lấy từ `DESIGN.md`, không viết mã màu trực tiếp.
- Kiểm tra bằng `npx tsc --noEmit`, `npm run lint`, `npm run build` — dự án chưa có test runner nên không
  được nói là đã chạy test.
