import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  cache: true,
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  ],
  plugins: [typescript({ tsconfig: './tsconfig.build.json' })],
};
