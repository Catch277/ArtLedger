/** The browser refused or lost the local record; the profile itself is still valid. */
export class ProfileStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileStorageError';
  }
}
