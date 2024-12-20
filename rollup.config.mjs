import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

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
  plugins: [
    // convert CommonJS modules to ES6, so they can be included in a Rollup bundle
    commonjs(),
    // locates modules using the Node resolution algorithm, for using third party modules in node_modules
    nodeResolve(),
    // seamless integration between Rollup and TypeScript
    typescript({ tsconfig: './tsconfig.build.json' }),
  ],
};
