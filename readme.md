## isolated-js ✨
![NPM Downloads](https://img.shields.io/npm/dw/isolated-js)
![NPM Version](https://img.shields.io/npm/v/isolated-js)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/isolated-js)

A simple and isolated JavaScript environment for running untrusted code on the web.

### Features
- **Isolated**: The code runs in a separate iframe, so it can't access the parent page.
- **Lightweight**: The library is small and has no dependencies.
- **Customizable**: You can pass custom functions to the isolated environment.

### Installation
```bash
yarn add isolated-js # you can alos use npm or pnpm
```

### Simple usage
```js
const userCode = `
    const sum = (a, b) => a + b;
    sum(1, 2);

    // this will crash the isolated environment (because of the timeout)
    new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 15000);
    }); // <- all isolated envs have top-level await
`;

// create a new isolated environment
import Isolated from 'isolated-js';

const isolated = new Isolated(userCode, /* options */);
await isolated.run()
```

### Known limitations
- If your predefined functions return a value, the user must use `await` to get the result.
