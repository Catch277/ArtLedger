import { Geist_Mono, Inter } from 'next/font/google';

/**
 * Brand typefaces. Source of truth: DESIGN.md section 3 (Typography).
 *
 * Inter carries UI and display, Geist Mono the technical strings - the pairing
 * primereact.dev uses. Both ship a Vietnamese subset, so diacritics come from
 * the same family instead of dropping to a fallback mid-word.
 */

/** Inter - headings, body, labels. Variable weight, so hierarchy is real (400-700). */
export const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
});

/** Geist Mono - token ids, addresses, hashes and CIDs. Never for prose. */
export const geistMono = Geist_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-geist-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'Consolas', 'monospace'],
});