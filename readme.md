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
const {element, dispatch} = await isolated.run() // returns the iframe element and a function to dispatch events (see below) 
```

### Known limitations
- If your predefined functions return a value, the user must use `await` to get the result.
- Every predefined function is async for the isolated environment.
- Predefined functions cant return a function.

*These liminations are due to the need to communicate between the parent page and the isolated environment.*

### Isolated environment options
```ts
export type EventListener = { eventListener: { name: string } };
type AnyFunction = (...args: any[]) => any | EventListener;
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

    maxIframes?: number; // <- max number of iframes that can be created at once

    removeOnFinish?: boolean; // <- if true, the iframe will be removed after the execution (default: true)
}
```

### Event listeners
The untrusted code can listen to events from your predefined functions. To do this, you will need to create a predefined function using eventListener("name") and then call the function from the untrusted code. Args **must** be passed as either an object, an array, a string, or a number.

```js
// your code, predefined functions
const predefined = {
    example: eventListener("example") // <- the untrusted code can listen to this function
}

// untrusted code
example(() => {
    console.log("an event was triggered");
})

// you can now dispatch the event straight to the untrusted code
dispatch("example", {...optional args...}) // <- get the dispatch function from the isolated.run() function (see above)
```

### License
MIT