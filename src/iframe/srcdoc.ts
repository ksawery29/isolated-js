// content for the iframe (see "Isolated" class)

import { type PredefinedFunctions, type EventListener, IsolatedSettings } from "../types/main";

const generateSrcdoc = (
    predefined: PredefinedFunctions | undefined,
    userCode: string,
    maxHeapSize: number,
    secret: string,
    heapReporter: IsolatedSettings["reportHeapSize"],
    before?: string
) => {
    // from predefined functions generate "getters" for them
    // this is probably not the best way to do it, but works for now
    let getters: string[] | undefined;
    if (predefined !== undefined) {
        const isEventListener = (value: any): value is EventListener => {
            return (
                value != null &&
                typeof value === "object" &&
                "eventListener" in value &&
                typeof value.eventListener === "object" &&
                "name" in value.eventListener &&
                typeof value.eventListener.name === "string"
            );
        };

        // how it works: the function is being executed in the iframe, then it sends a message to the parent window to actually execute the function
        // after that the result is sent back to the iframe
        getters = Object.keys(predefined).map((key) => {
            if (isEventListener(predefined[key])) {
                return `function ${key}(fn) {
                    // try to register the event listener
                    window.parent.postMessage({type: "register_event_listener", name: "${predefined[key].eventListener.name}", secret: "${secret}"}, "*");
                    
                    const h = (event) => {
                        if (event.data.type === "event_listener_not_registered") {
                            console.error("isolated-js: failed to register event listener with name:", event.data.name);
                            window.removeEventListener("message", h);
                            return;
                        }
                        
                        if (event.data.type === "event" && event.data.name === "${predefined[key].eventListener.name}") {    
                            const args = event.data.args;
                            if (args === undefined) return fn();
                            try {fn(JSON.parse(args));} catch (e) {console.error(e);}
                        }
                    } 
                    window.addEventListener("message", h);
                }`;
            }

            if (typeof predefined[key] !== "function") return "";
            const toStr = predefined[key].toString();
            const args = toStr.slice(toStr.indexOf("(") + 1, toStr.indexOf(")"));

            const sendFunctionRequest = `window.parent.postMessage({type: "function", name: "${key}", args: Array.from(arguments), secret: "${secret}"}, "*");`;
            const waitForResult = `return new Promise((resolve) => {
                ${sendFunctionRequest}
                window.addEventListener("message", function handler(event) {
                    if (event.data.type === "function_result_return" && event.data.name === "${key}") {
                        window.removeEventListener("message", handler);
                        if (event.data.args === undefined) resolve();
                        else resolve(JSON.parse(event.data.args));
                    }
                });
            });`;

            const f = `async function ${key}(${args}) {${waitForResult}}`;
            return f;
        });
    } else {
        console.debug("isolated-js: no predefined functions found, skipping");
    }

    // override the default console.[log/error/warn] methods to send messages to the parent window
    const customLogHandler = `
    (() => {
        const methods = ["log", "error", "warn", "debug"];
        methods.forEach((method) => {
            const original = console[method].bind(console);
            console[method] = (...args) => {
                try {
                    const serializableArgs = args.map((arg) => {
                        if (arg instanceof Promise) {
                            return "Got [Promise]. You should await this to get the result.";
                        }
                        if (typeof arg === "number") {
                            return arg;
                        }
                        if (arg === undefined) {
                            return "undefined";
                        }
                        if (typeof arg !== "string") {
                            try {
                                arg = JSON.stringify(arg);
                            } catch {}
                        }
                        return arg?.toString();
                    });
    
                    window.parent.postMessage({ type: "console", method, args: serializableArgs, secret: "${secret}" }, "*");
                } catch (e) {
                    original("isolated-js:", e);
                }
            };
        });
    })();`;

    const heapSizeLimiterIntervalId = `_${Math.random().toString(36).slice(2, 11)}`;
    const heapSizeLimiter = `
        // check the memory usage of the iframe every 100ms
        const ${heapSizeLimiterIntervalId} = setInterval(() => {
            const usage = window.performance.memory.usedJSHeapSize;
            if (usage > ${maxHeapSize}) {
                console.error("isolated-js: memory usage exceeded, killing the iframe");
                throw new Error("security: memory usage exceeded");
            }
        }, 100);
    `;

    const heapIntervalListenerId = `_${Math.random().toString(36).slice(2, 11)}`;
    let heapReport = "";
    if (heapReporter?.shouldReport) {
        heapReport = `
            const ${heapIntervalListenerId} = setInterval(() => {
                const usage = window.performance.memory.usedJSHeapSize;
                window.parent.postMessage({type: "heap_size", args: usage, secret: "${secret}"}, "*");
            }, ${heapReporter.interval});
        `;
    }

    const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; connect-src 'none'; style-src 'none'; img-src 'none'; font-src 'none'; object-src 'none'; media-src 'none'; frame-src 'none';">`;

    const end = `window.parent.postMessage({type: "finished_execution", args: "", secret: "${secret}"}, "*");`;
    const sendError = `window.parent.postMessage({
        type: "error",
        args: JSON.stringify({name: e.name, message: e.message, stack: e.stack, e}),
        secret: "${secret}"
    }, "*");`;

    const clearHeapIntervalListener = heapReporter?.shouldReport ? `clearInterval(${heapIntervalListenerId});` : "";
    const clearHeapSizeLimiterInterval = `clearInterval(${heapSizeLimiterIntervalId});`;
    const cleanup = `${end}; ${clearHeapIntervalListener}; ${clearHeapSizeLimiterInterval};`;

    return `${csp}<script>(async () => { ${heapReport}; ${before ?? ""}; ${heapSizeLimiter}; try {${customLogHandler}; ${
        getters && getters.join(" ")
    }; ${userCode}; ${cleanup} } catch (e) { ${sendError}; ${cleanup}; }; })();/*isolated-js*/</script>`;
};

export default generateSrcdoc;
