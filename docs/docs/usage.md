---
sidebar_position: 3
---

# 📚 Usage
## Creating an Isolated Environment
To create an isolated environment, you can use the `Isolated` class. The `Isolated` class takes the user code and an optional configuration object as arguments. The user code is the code that you want to run in the isolated environment. The configuration object allows you to specify options such as custom functions, timeout, and more.

### Basic Example
```javascript
import { Isolated } from 'isolated-js';

const isolated = new Isolated(`
  console.log('Hello, World!');
`).start();
```
That's it! The code inside the `Isolated` constructor will be executed in an isolated environment. 🎉

### Configuration Options
The `Isolated` class takes an optional configuration object as the second argument. Here are some of the available configuration options:

- **onConsole**: A function that will be called when the code calls `console.log`, `console.error`, or `console.warn`. It sends the type of the console message and the arguments passed to the console function. Example:
```javascript
onConsole: (type, args) => {
    console[type](...args);
}
```

---------

- **predefinedFunctions**: An object containing predefined functions that can be called from the user code. Example:
```javascript
predefinedFunctions: {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
}
```
You can also add event listeners there, so the user can listen to events from the isolated environment. Example:
```javascript
predefinedFunctions: {
    addEventListener: eventListener("my-cool-event")
}
```
See more about sending the events in the [Sending Events](#sending-events) section.

---------

- **timeout**: The maximum time (in milliseconds) that the code is allowed to run. If the code takes longer than the specified timeout, it will be terminated. Example:
```javascript
timeout: 1000
```
Default: `5000` (5 seconds)

---------

- **beforeInit**: A function that will be called before the user code is executed. It gives you the iframe element as an argument. Example:
```javascript
beforeInit: (iframe) => {
    iframe.style.border = "1px solid red";
}
```

---------

- **maxIframes**: The maximum number of iframes that can be created. If the limit is reached, it will throw an error. Example:
```javascript
maxIframes: 5
```

---------

- **removeOnFinish**: A boolean that specifies whether the iframe should be removed after the code finishes executing. Example:
```javascript
removeOnFinish: true
```
Default: `true`

⚠️ **Warning**: to use event listeners, `removeOnFinish` **must** be set to `false`. Otherwise the iframe will probably be removed before the event is sent.

---------

- **showErrorOnBadOrigin**: A boolean that specifies whether an internal error should be thrown if the origin of the message is not the same.
```javascript
showErrorOnBadOrigin: true
```
Default: `false`

⚠️ **Warning**: if you use react-devtools, after enabling this option, you will see a lot of errors in the console in a fixed interval. This is because react-devtools sends a bunch of random messages to the iframe.
You can try it by yourself by adding an event listener for all messages:
```javascript
window.addEventListener("message", (e) => {
    console.log(e);
});
```
If you have the extension installed you will see a lot of messages in the console. This is a known issue with react-devtools and it's not related to IsolatedJS. See https://github.com/facebook/react/issues/27529

### Sending Events
You can send events from the parent window to the isolated environment using the `postMessage` function. Here's an example of how you can send an event to the isolated environment:
```javascript
// first, create the isolated environment
const isolated = new Isolated(`
  myCoolEvent(() => console.log("aaawesome!"));
`, {
    predefinedFunctions: {
        // this function will be called from the isolated environment to listen to the event:
        myCoolEvent: eventListener("myCoolEvent")
    }
});

// wait until the isolated code executed fully
const {dispatch} = await isolated.start()

// finally, send the event
dispatch("myCoolEvent");

// optionally, you can also send data
dispatch("myCoolEvent", "some data");
```

### A few notes
- `isolated.start` returns a promise that resolves with an object containing the dispatch function and the iframe element. You can use the dispatch function to send events to the isolated environment or use the iframe element to manipulate the iframe.
- IsolatedJS is still in **WIP**. It was primarily made for [my](https://github.com/ksawery29) side project (🔜) so you might find some features missing. If you want, you can help me by contributing and make this project better! 🙌

Happy coding! 🚀
