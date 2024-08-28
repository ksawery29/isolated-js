import { PredefinedFunctions } from "../types/main";

// content for the iframe (see "Isolated" class)
const generateSrcdoc = (predefined: PredefinedFunctions) => {
    // from predefined functions generate "getters" for them
    // this is probably not the best way to do it, but works for now
    const getters = Object.keys(predefined).map((key) => {
        const toStr = predefined[key].toString();
        const args = toStr.slice(toStr.indexOf("(") + 1, toStr.indexOf(")"));

        return `function ${key}(${args}) {
            return window.parent.postMessage({type: "function", name: "${key}", args: Array.from(arguments)}, "*");
        }`;
    });

    return getters;

    return `
<!DOCTYPE html>
<html lang="en">
<body>
    <script>
        (() => {
            // override the default console.[log/error/warn] methods to send messages to the parent window
            ["log", "error", "warn"].forEach(method => {
                console[method] = (...args) => {
                    window.parent.postMessage({type: "console", method, args}, "*");
                }
            });

            // all predefined functions are below, if any
        })
    </script>
</body>
</html>
`;
};

export default generateSrcdoc;
