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
      // map stacktrace with source maps
      mapStackTrace(error.stack, function(mappedStack) {
        let filteredStack = mappedStack.filter(line => {
          // we check the sourcemapped frames for filenames blacklisted / whitelisted
          return blackList.test(line) ? false
                : whiteList.test(line)
        })
        // the resolved path does not match the correct path to the file in Chrome
        // here we fix this path
        let fixedWebpackPathStack = filteredStack.map(line => {
          const webpackPrefix = 'webpack:///'
          if (line.indexOf(webpackPrefix) !== -1) {
            return line.replace(webpackPrefix, webpackPrefix + './')
          }
          return line
        })
        console.error('ZLIQ (stripped stacktrace):', error.message + '\n' + fixedWebpackPathStack.join('\n'))
      })
    } catch (e) {
      console.error('ZLIQ (failed to process error):', e)
    }

    // disable native error output
    return true;
  }
}
