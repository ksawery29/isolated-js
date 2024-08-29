import { EventHandlerType } from "../types/iframe";
import { IsolatedSettings } from "../types/main";

// an event handler for all messages
export default function eventHandler(
    iframe: HTMLIFrameElement,
    settings: IsolatedSettings
) {
    window.addEventListener(
        "message",
        (event: MessageEvent<EventHandlerType>) => {
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

                        settings.onConsole(event.data.method, event.data.args);
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
                            settings.predefinedFunctions[functionName](
                                ...functionArgs
                            );
                        } else {
                            console.error("isolated-js: unknown function");
                        }

                        break;
                    default:
                        console.warn(
                            "isolated-js: unknown action got in the event handler!"
                        );
                }
            } catch (error) {
                console.error(
                    "isolated-js: failed to parse the message from iframe",
                    error
                );
            }
        }
    );
}
