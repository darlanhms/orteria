//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    // Avoid linting generated artifacts / fetched design assets.
    ignores: [".output/**", ".stitch/**", "docs/**", "pnpm-lock.yaml"],
  },
]
