import Image from 'next/image';

/**
 * The twenty brand marks the product owner supplied, vendored verbatim into `public/brand/chains/` and
 * normalised onto a 96px canvas (rendered at 44px). Their palette is the brand's, not ours - never tint one,
 * never recolour it with a token (DESIGN.md 6.2).
 *
 * `live` flags the chain this deployment actually uses. Three of the twenty could not be identified with
 * certainty from the artwork alone, so they keep neutral slugs (`mark-*`) rather than a guessed ticker: the band
 * renders no names, so nothing false reaches the screen, and naming one later is a one-line change here.
 */
type ChainBadge = {
  file: string;
  /** The Sepolia deployment - the only chain that can actually be read and written here. */
  live?: boolean;
};

const CHAINS: readonly ChainBadge[] = [
  { file: 'btc' },
  { file: 'eth', live: true },
  { file: 'usdt' },
  { file: 'bnb' },
  { file: 'xrp' },
  { file: 'sol' },
  { file: 'sei' },
  { file: 'link' },
  { file: 'ada' },
  { file: 'xmr' },
  { file: 'uni' },
  { file: 'avax' },
  { file: 'ltc' },
  { file: 'sui' },
  { file: 'dot' },
  { file: 'pol' },
  { file: 'arb' },
  { file: 'mark-bars' },
  { file: 'mark-arcs' },
  { file: 'mark-e' },
];

/**
 * One pass of the strip. `min-w-[100vw]` plus `justify-around` makes a single list at least a viewport wide, so
 * the -50% shift always lands on identical content; `pr-8` is the same width as `gap-8`, which keeps the seam
 * between the two lists indistinguishable from the gaps inside them. `data-duplicate` is what the reduced-motion
 * rule in globals.css hides.
 */
function ChainList({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      data-duplicate={duplicate ? 'true' : undefined}
      className='flex min-w-[100vw] shrink-0 items-center justify-around gap-8 pr-8'
    >
      {CHAINS.map((chain) => (
        <li key={chain.file} className='flex shrink-0 items-center gap-3'>
          {/* The hairline ring is what keeps the pale marks (Ethereum and the three white discs) from dissolving
              into the band; the live chain's badge takes the green ring instead. */}
          <span
            className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full ${
              chain.live ? 'ring-2 ring-accent' : 'ring-1 ring-hairline'
            }`}
          >
            <Image src={`/brand/chains/${chain.file}.png`} alt='' width={44} height={44} className='h-11 w-11 object-contain' />
          </span>
          {chain.live ? <span className='font-mono text-sm font-medium text-ink'>Sepolia</span> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * The full-bleed ticker that sits flush under the header (DESIGN.md 7.27). The strip is ornament: it makes no
 * claim about support, so the track is `aria-hidden` and the only sentence a screen reader gets is the
 * `sr-only` one below. The single labelled badge - Sepolia, ringed green - carries the real chain, and there is
 * no hover pause on purpose: a strip that freezes under a resting pointer reads as broken.
 */
export function ChainMarquee() {
  return (
    <div className='w-full overflow-hidden border-b border-hairline bg-surface py-4'>
      <div aria-hidden className='chain-marquee'>
        <ChainList />
        <ChainList duplicate />
      </div>
      <p className='sr-only'>
        ArtLedger hiện chỉ đọc và ghi trên Sepolia. Các huy hiệu chuỗi còn lại chỉ để tham chiếu hệ sinh thái,
        không phải chuỗi được hỗ trợ.
      </p>
    </div>
  );
}
