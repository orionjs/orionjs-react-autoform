const path = require('path')
const {defineConfig} = require('vite')
const {visualizer} = require('rollup-plugin-visualizer')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'orionjs-react-autoform',
      fileName: format => `orionjs-react-autoform.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react', '@orion-js/schema', 'graphql', 'simple-react-form'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React'
        }
      }
    }
  },
  plugins: [visualizer()]
})
