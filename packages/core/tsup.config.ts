import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'adapters/fetch': 'src/adapters/fetch.ts',
    'adapters/axios': 'src/adapters/axios.ts',
    'adapters/express': 'src/adapters/express.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['axios', 'express'],
});

// 
