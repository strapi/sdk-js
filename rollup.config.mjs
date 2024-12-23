import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * This configuration is designed to bundle the Strapi SDK for Node.js environments.
 *
 * It produces two outputs: one for the older CommonJS module system and one for the modern ES Module
 * system, ensuring compatibility with a wide range of tools and runtimes.
 *
 * Outputs:
 * - CommonJS (dist/bundle.cjs.js): for environments using `require`.
 * Compatible with older tools and Node.js versions.
 * Includes source maps for debugging.
 *
 * - ES Module (dist/bundle.esm.js): for modern import/export environments.
 * Supports tree-shaking for smaller builds and also includes source maps.
 *
 * Plugins Used:
 * - `nodeResolve`: resolves third-party and core Node.js modules from node_modules.
 * - `commonjs`: converts CommonJS modules (for example, from dependencies) to ES modules for bundling.
 * - `typescript`: transpiles TypeScript code into JavaScript for broad compatibility.
 * - `replace`: replaces process.env variables like NODE_ENV during the build, enabling environment-specific behavior.
 * - `terser`: minifies the output in production mode, reducing file size for better performance.
 *
 * @type {import('rollup').RollupOptions}
 */
const node_build = {
  input: 'src/index.ts',
  cache: true,
  output: [
    // CommonJS build
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      sourcemap: isProduction ? 'hidden' : true,
      exports: 'named',
    },
    // ESM build
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      sourcemap: isProduction ? 'hidden' : true,
      exports: 'named',
    },
  ],
  plugins: [
    // Locate modules using the Node resolution algorithm, for using third party modules in node_modules
    nodeResolve({
      browser: false, // "browser" properties in package files are ignored
      preferBuiltins: true, // Prefer built-in modules
    }),
    // Convert CommonJS modules to ES6, so they can be included in a Rollup bundle
    commonjs(),
    // Transpile
    typescript({ tsconfig: './tsconfig.build.json' }),
    // Set env and global variables for browser builds
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      preventAssignment: true,
    }),
    // Only minify in production
    isProduction && terser(),
  ],
};

/**
 * This configuration is designed to bundle the Strapi SDK for browser environments.
 *
 * It produces two outputs in the IIFE format, which are suitable for use in web browsers.
 *
 * The bundle provides a globally available `strapi` variable and includes source maps for debugging.
 * In production, the bundle is minified for better performance.
 *
 * Outputs:
 * - IIFE Minified (dist/bundle.browser.min.js): a minified browser build, optimized for performance, with source maps.
 *
 * Plugins Used:
 * - `nodeResolve`: resolves browser-compatible modules from `node_modules` while ignoring Node.js built-ins.
 * - `commonjs`: converts CommonJS modules (for example, dependencies) to ES modules for bundling.
 * - `typescript`: transpiles TypeScript code into JavaScript to ensure compatibility with browsers.
 * - `replace`: replaces `process.env` variables and includes a `process.browser` variable for browser-specific code.
 * - `terser`: minifies the production output to improve loading performance and reduce file size.
 *
 * @type {import('rollup').RollupOptions}
 */
const browser_build = {
  input: 'src/index.ts',
  cache: true,
  output: [
    {
      file: 'dist/bundle.browser.min.js',
      format: 'iife',
      name: 'strapi',
      sourcemap: true,
      plugins: [terser()],
      globals: {
        debug: () => () => {}, // Override debug to a no-op function
      },
    },
  ],
  external: ['debug'], // Don't include the debug package in the browser build
  plugins: [
    // Locate modules using the Node resolution algorithm, for using third party modules in node_modules
    nodeResolve({
      browser: true, // Only resolve browser-compatible modules
      preferBuiltins: false, // Disable Node.js built-ins
    }),
    // Convert CommonJS modules to ES6, so they can be included in a Rollup bundle
    commonjs(),
    // Transpile
    typescript({ tsconfig: './tsconfig.build.json' }),
    // Set env and global variables for browser builds
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.browser': true,
      preventAssignment: true,
    }),
  ],
};

// Export configurations
export default [node_build, browser_build];
