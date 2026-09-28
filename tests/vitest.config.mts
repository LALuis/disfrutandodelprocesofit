import { defineConfig } from 'vitest/config';

/**
 * Emulator-backed integration tests. Run through `npm run test:emulator`, which starts the
 * Firebase emulators, executes this suite and shuts them down.
 */
export default defineConfig({
  test: {
    include: ['tests/emulator/**/*.spec.ts'],
    environment: 'node',
    testTimeout: 30_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
