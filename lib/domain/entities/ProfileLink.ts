/** A profile holds at most three links, and each one carries a known label. */
export type ProfileLinkLabel = 'website' | 'x' | 'instagram';

export interface ProfileLink {
  label: ProfileLinkLabel;
  url: string;
}
