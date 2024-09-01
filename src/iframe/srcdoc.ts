// content for the iframe (see "Isolated" class)

import { type PredefinedFunctions } from "../types/main";

const generateSrcdoc = (
    predefined: PredefinedFunctions | undefined,
    userCode: string
) => {
    // from predefined functions generate "getters" for them
    // this is probably not the best way to do it, but works for now
    let getters: string[] | undefined;
    if (predefined !== undefined) {
        // how it works: the function is being executed in the iframe, then it sends a message to the parent window to actually execute the function
        // after that the result is sent back to the iframe
        getters = Object.keys(predefined).map((key) => {
            if (typeof predefined[key] !== "function") return "";
            const toStr = predefined[key].toString();
            const args = toStr.slice(
                toStr.indexOf("(") + 1,
                toStr.indexOf(")")
            );

            const isAsync = toStr.includes("async") ? "async" : "";
            const sendFunctionRequest = `window.parent.postMessage({type: "function", name: "${key}", args: Array.from(arguments)}, "*");`;
            const waitForResult = `return new Promise((resolve) => {
                ${sendFunctionRequest}
                window.addEventListener("message", function handler(event) {
                    if (event.data.type === "function_result_return" && event.data.name === "${key}") {
                        resolve(JSON.parse(event.data.args));
                        window.removeEventListener("message", handler);
                    }
                });
            });`;

            const f = `${isAsync} function ${key}(${args}) {${waitForResult}}`;
            return f;
        });
    }

    // override the default console.[log/error/warn] methods to send messages to the parent window
    const customLogHandler = `
    (() => {
        const methods = ["log", "error", "warn"];
        methods.forEach((method) => {
            const original = console[method].bind(console);
            console[method] = (...args) => {
                try {
                    const serializableArgs = args.map((arg) => {
                        if (arg instanceof Promise) {
                            return 'Got [Promise]. You should await this to get the result.';
                        }
                        try {
                            JSON.stringify(arg);
                            return arg;
                        } catch {
                            return Object.prototype.toString.call(arg);
                        }
                    });

                    window.parent.postMessage({ type: "console", method, args: serializableArgs }, "*");
                } catch (e) {
                    original("isolated-js:", e);
                }
            };
        });
    })();`;

    const csp =
        "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline'\">";
    const end = `window.parent.postMessage({type: "finished_execution", args: ""}, "*");`;

    return `${csp}<script>(async () => {${customLogHandler};${
        getters && getters.join(" ")
    };${userCode};${end}})()</script>`;
};

export default generateSrcdoc;
