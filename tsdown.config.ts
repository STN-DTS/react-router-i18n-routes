import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    'index': './src/index.ts',
    'react': './src/react/index.ts',
    'route-config': './src/route-config/index.ts',
  },
  platform: 'neutral',
  dts: true,
  clean: true,
  sourcemap: true,
  // Validate the published package shape (exports, types) on every build.
  publint: { level: 'error' },
  attw: { profile: 'esm-only', level: 'error' },
});
