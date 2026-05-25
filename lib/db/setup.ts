import { runBridgeMigrate } from '@/lib/db-bridge'

/** Ensure CRM tables/columns exist on InfinityFree — safe to call on every admin load */
export async function ensureDbSetup(): Promise<void> {
  await runBridgeMigrate()
}
