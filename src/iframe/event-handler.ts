// an event handler for all messages
export default function eventHandler(iframe: HTMLIFrameElement) {
    window.addEventListener("message", (event: MessageEvent<any>) => {
        // ensure this came from the same origin
        if (event.source !== iframe.contentWindow) return;

        // get the message and parse it
        try {
            switch (event.data.type) {
                case "console":
                case "action":
                    break;
                default:
                    console.warn(
                        "isolated-js: unknown action got in the event handler!",
                    );
            }
        } catch (error) {
            console.error(
                "isolated-js: failed to parse the message from iframe",
                error,
            );
        }
    });
}
