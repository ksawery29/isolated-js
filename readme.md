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
yarn add isolated-js # you can also use npm or pnpm
```

### Simple usage
```js
const userCode = `
    const sum = (a, b) => a + b;
    sum(1, 2);

    // this will crash the isolated environment (because max execution time by default is 5 seconds)
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
- Every predefined function is async for the isolated environment.

*These liminations are due to the need to communicate between the parent page and the isolated environment.*

### Isolated environment options
```ts
export interface PredefinedFunctions {
    [key: string]: AnyFunction;
}
export interface IsolatedSettings {
    onConsole?: (
        type: "log" | "warn" | "error", // <- type of the log
        content: string // <- content of the log
    ) => void | Promise<void>; // <- this will be called when the isolated environment logs something

    predefinedFunctions?: PredefinedFunctions | undefined; // <- predefined functions that the isolated environment can use, example:
    /* {
    myFunction: (a: number, b: number) => {
        return a + b;
    };
    }*/

    hide?: boolean; // <- if true, the iframe will be hidden (default: true)
    
    timeout?: number; // <- max execution time in milliseconds (default: 5000)
    
    beforeInit?: (element: HTMLIFrameElement) => void | Promise<void>; // <- this will be called before the isolated environment is initialized

    maxIframes?: number; // <- max number of iframes that can be created
}
```

### License
MIT