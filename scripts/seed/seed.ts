/**
 * Seeds the Firebase EMULATORS with demo data. Run with `npm run seed`.
 *
 * Safety: refuses to run unless the project is a `demo-*` emulator project and the Auth and
 * Firestore emulators are reachable. It never receives real credentials, so it cannot reach
 * production even if misconfigured.
 */
import {
  applyEmulatorEnv,
  assertEmulatorsReachable,
  resolveEmulatorTarget,
} from './emulator-guard';

async function main(): Promise<void> {
  const target = resolveEmulatorTarget();
  await assertEmulatorsReachable(target);
  applyEmulatorEnv(target);

  // Imported after the env vars are set so the Admin SDK binds to the emulators.
  const { runSeed } = await import('./run-seed');
  await runSeed(target.projectId);
}

main().catch((error: unknown) => {
  console.error(`\n✖ Seed failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
