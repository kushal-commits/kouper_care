export const featureFlags = {
  allowAnonymousChat: true,
  persistAnonLocally: true,
  useDemoSeedData: true,
} as const;

export type FeatureFlags = typeof featureFlags;