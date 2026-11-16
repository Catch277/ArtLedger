export type RegistrationStep =
  | 'hashing'
  | 'pinning-image'
  | 'pinning-metadata'
  | 'simulating'
  | 'signing'
  | 'confirmed';