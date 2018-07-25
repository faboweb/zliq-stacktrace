# ZLIQ-Stacktrace

## !!This project is currently not maintained!!

## [ZLIQ](https://faboweb.github.io/zliq/)

Wrapper around [Stacktrace.js](www.stacktracejs.com) to easyly add it to zliq.
It will remove calls inside zliq from the stacktrace, making it easier to read.

## Quickstart
To use ZLIQ-stacktrace in your project, first install it as an dependency:
```bash
$ npm install --save zliq-stacktrace
```

IMPORTANT: Activate sourcemaps in your development environment.

Then activate the stacktrace shrinking.
```js
import {shrinkStacktrace} from 'zliq-stacktrace';

// shrinkStacktrace returns an errorhandler
// how your environment returns the files is very different, just create a regex to filter node_modules or similar
const errorHandler = shrinkStacktrace(
    /node_modules\/zliq/, // blackList (optional)
    /.*/ // whitelist (optional)
);

// use it globaly
window.onerror = (messageOrEvent, source, lineno, colno, error) => {
    return errorHandler(error);
};

// or use it locally
try {
    // CODE BLOCK
} catch (error) {
    errorHandler(error)
}

```

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[dependencyci-badge]: https://dependencyci.com/github/faboweb/zliq/badge?style=flat-square
[dependencyci]: https://dependencyci.com/github/faboweb/zliq
[version-badge]: https://img.shields.io/npm/v/zliq.svg?style=flat-square
[package]: https://www.npmjs.com/package/zliq
[downloads-badge]: https://img.shields.io/npm/dm/zliq.svg?style=flat-square
[npm-stat]: http://npm-stat.com/charts.html?package=zliq
[license-badge]: https://img.shields.io/npm/l/zliq.svg?style=flat-square
[license]: https://github.com/faboweb/zliq/blob/master/LICENSE
[github-watch-badge]: https://img.shields.io/github/watchers/faboweb/zliq.svg?style=social
[github-watch]: https://github.com/faboweb/zliq/watchers
[github-star-badge]: https://img.shields.io/github/stars/faboweb/zliq.svg?style=social
[github-star]: https://github.com/faboweb/zliq/stargazers
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
[gzip-badge]: http://img.badgesize.io/https://unpkg.com/zliq/lib/zliq.js?compression=gzip&label=gzip%20size&style=flat-square
[size-badge]: http://img.badgesize.io/https://unpkg.com/zliq/lib/zliq.js?label=size&style=flat-square
[tiny-gzip-badge]: http://img.badgesize.io/https://unpkg.com/zliq/lib/zliq.min.js?compression=gzip&label=gzip%20size&style=flat-square
[tiny-size-badge]: http://img.badgesize.io/https://unpkg.com/zliq/lib/zliq.min.js?label=size&style=flat-square
[unpkg-dist]: https://unpkg.com/zliq/
[module-formats-badge]: https://img.shields.io/badge/module%20formats-es%20umd-green.svg?style=flat-square
