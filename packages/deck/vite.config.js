import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [solidPlugin(), inspect()],
})

// function bundleWorker() {
//   return {
//     name: 'vite-plugin-bundle-worker',
//     transform(_, id) {
//       if (/\?worker/.test(id)) {
//         id = id.slice(0, -'?worker'.length)
//         const code = buildSync({
//           bundle: true,
//           entryPoints: [id],
//           minify: true,
//           write: false, // required in order to retrieve the result code
//         }).outputFiles[0].text

//         const url = this.emitFile({
//           fileName: id.match(/[\w\.-\_\/]+\/([\w\.-\_]+)$/)[1], // get file name
//           type: 'asset',
//           source: code,
//         })
//         // now the file ends with '?worker' would be treated as a code which exports Worker constructor
//         return `export default function(){
//           return new Worker("__VITE_ASSET__${url}__")
//         }`
//       }
//     },
//   }
// }
