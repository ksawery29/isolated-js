import { type PredefinedFunctions } from "../types/main";

// content for the iframe (see "Isolated" class)
const generateSrcdoc = (predefined: PredefinedFunctions, userCode: string) => {
    // from predefined functions generate "getters" for them
    // this is probably not the best way to do it, but works for now
    const getters = Object.keys(predefined).map((key) => {
        const toStr = predefined[key].toString();
        const args = toStr.slice(toStr.indexOf("(") + 1, toStr.indexOf(")"));

        const f = `function ${key}(${args}) {
            return p({type: "function", name: "${key}", args: Array.from(arguments)}, "*");
        }`;

        // post processing: remove newlines and extra spaces
        return f.replace(/\n/g, "").replace(/\s+/g, " ");
    });

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

            // a basic helper function to send messages to the parent window
            const p = (...args) => window.parent.postMessage(args, "*");

            // all predefined functions are below, if any
            ${getters.join("\n")}

            ${userCode}
        })()
    </script>
</body>
</html>
`;
};

export default generateSrcdoc;
