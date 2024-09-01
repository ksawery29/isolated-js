import { type EventHandlerType } from "../types/iframe";
import { type IsolatedSettings } from "../types/main";

// an event handler for all messages
export default function eventHandler(
    iframe: HTMLIFrameElement,
    settings: IsolatedSettings,
    onFinished: () => void
): () => void {
    const handler = (event: MessageEvent<EventHandlerType>) => {
        // ensure this came from the same origin
        if (event.source !== iframe.contentWindow) return;

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

                    if (settings.onConsole && event.data.args[0])
                        settings.onConsole(
                            event.data.method,
                            (event.data.args as string[]).join(" ")
                        );
                    break;
                case "function":
                    if (settings.predefinedFunctions == undefined) {
                        console.error(
                            "isolated-js: predefined functions are undefined but got requested"
                        );
                        return;
                    }

                    const functionName = event.data.name;
                    if (functionName == undefined) {
                        console.error(
                            "isolated-js: got empty name for function"
                        );
                        return;
                    }
                    const functionArgs = event.data.args || [];

                    // check if that function requested is a thing
                    if (settings.predefinedFunctions[functionName]) {
                        const val = settings.predefinedFunctions[functionName](
                            ...functionArgs
                        );

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

                    break;
                case "finished_execution":
                    onFinished();
                    break;
                default:
                    console.warn(
                        "isolated-js: unknown action got in the event handler!",
                        event.data
                    );
            }
        } catch (error) {
            console.error(
                "isolated-js: failed to parse the message from iframe",
                error
            );
        }
    };

    window.addEventListener(
        "message",
        (event: MessageEvent<EventHandlerType>) => {
            handler(event);
        }
    );

    return () => {
        console.log("remove");
        window.removeEventListener("message", handler);
    };
}
