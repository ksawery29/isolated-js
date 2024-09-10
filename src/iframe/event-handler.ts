import { type EventHandlerType } from "../types/iframe";
import { type IsolatedSettings } from "../types/main";

// an event handler for all messages
export default function eventHandler(
    iframe: HTMLIFrameElement,
    settings: IsolatedSettings,
    onFinished: () => void
): () => void {
    const handler = async (event: MessageEvent<EventHandlerType>) => {
        // ensure this came from the same origin
        if (event.source !== iframe.contentWindow) {
            if (settings.showErrorOnBadOrigin)
                console.error("isolated-js: event source is not the iframe. aborting...", {
                    eventSource: event.source,
                    iframeSource: iframe.contentWindow,
                });
            return;
        }

        // get the message and parse it
        try {
            switch (event.data.type) {
                case "console":
                    if (event.data.method == undefined) {
                        console.error(
                            "isolated-js: event.data.method is somehow undefined. this is probably a bug, please report it"
                        );
                        return;
                    }

                    if (settings.onConsole && event.data.args) {
                        // if it can be parsed as JSON, then do it
                        try {
                            event.data.args = JSON.parse(event.data.args as string);
                        } catch (e) {
                            // if it can't be parsed as json, then just keep it as a string
                            event.data.args = event.data.args as string;
                        }

                        // combine all the args into an array
                        if (Array.isArray(event.data.args)) {
                            event.data.args = event.data.args.map((arg) => {
                                try {
                                    return JSON.parse(arg);
                                } catch {
                                    return arg;
                                }
                            });
                        } else {
                            event.data.args = [event.data.args];
                        }

                        settings.onConsole(event.data.method, ...event.data.args);
                    }

                    break;
                case "function":
                    if (settings.predefinedFunctions == undefined) {
                        console.error("isolated-js: predefined functions are undefined but got requested");
                        return;
                    }

                    const functionName = event.data.name;
                    if (functionName == undefined) {
                        console.error("isolated-js: got empty name for function");
                        return;
                    }
                    const functionArgs = event.data.args || [];

                    // check if that function requested is a thing
                    if (
                        settings.predefinedFunctions[functionName] &&
                        typeof settings.predefinedFunctions[functionName] === "function"
                    ) {
                        const val = await settings.predefinedFunctions[functionName](...functionArgs);

                        // send the result back
                        iframe.contentWindow?.postMessage(
                            {
                                type: "function_result_return",
                                name: functionName,
                                args: JSON.stringify(val),
                            },
                            "*"
                        );
                    } else {
                        console.error("isolated-js: unknown function");
                    }

                    // send back a notification that the function has been executed
                    iframe.contentWindow?.postMessage({ type: "function_executed", name: functionName }, "*");

                    break;
                case "finished_execution":
                    onFinished();
                    break;
                default:
                    console.warn("isolated-js: unknown action got in the event handler!", event.data);
            }
        } catch (error) {
            console.error("isolated-js: failed to parse the message from iframe", error);
        }
    };

    window.addEventListener("message", async (event: MessageEvent<EventHandlerType>) => {
        await handler(event);
    });

    return () => {
        window.removeEventListener("message", handler);
    };
}
