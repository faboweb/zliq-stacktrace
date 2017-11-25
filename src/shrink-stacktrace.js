import {mapStackTrace} from 'sourcemapped-stacktrace/sourcemapped-stacktrace.js'

/*
* ATTENTION: Enable sourcemaps in Chrome!!
* ATTENTION: Use "devtool: '#eval-source-map'" for webpack
*/
export function shrinkStacktrace (
  blackList = /node_modules\/zliq/,
  whiteList = /.*/
) {
  return (error) => {
    try {
      mapStackTrace(error.stack, function(mappedStack) {
        let filteredStack = mappedStack.filter(line => {
          // we check the sourcemapped frames for filenames blacklisted / whitelisted
          return blackList.test(line) ? false
                : whiteList.test(line)
        })
        console.error('ZLIQ (stripped stacktrace):', error.message + '\n' + filteredStack.join('\n'))
      })
    } catch (e) {
      console.error('ZLIQ (failed to process error):', e)
    }
    // // stacktrace.js gives us the sourcemappes filenames
    // StackTrace.fromError(error, {
    //   offline: true
    // })
    // .then(frames => {
    //   let filteredFrames = frames.filter(frame => {
    //       // we check the sourcemapped frames for filenames blacklisted / whitelisted
    //     return blackList.test(frame.fileName) ? false
    //           : whiteList.test(frame.fileName)
    //   })
    //   .map(frame => frame.source)
  
    //   console.error('ZLIQ (stripped stacktrace):', error.message + '\n' + filteredFrames.join('\n'))
    // })
    // .catch(console.error)

    // disable native output
    return true;
  }
}
