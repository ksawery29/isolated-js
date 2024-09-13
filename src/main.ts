import eventHandler from "./iframe/event-handler.js";
import generateSrcdoc from "./iframe/srcdoc.js";
import { StartReturn, type IsolatedSettings } from "./types/main";

export default class Isolated {
    settings: IsolatedSettings;
    userCode: string;
    uniqueId: string;

    constructor(userCode: string, settings?: IsolatedSettings) {
        this.settings = settings ?? {};

        // default settings
        this.settings.hide = this.settings.hide ?? true;
        this.settings.timeout = this.settings.timeout ?? 5000;
        this.userCode = userCode;
        this.uniqueId = `isolated-js-iframe-${Math.random().toString(36).slice(2, 11)}`;
        this.settings.removeOnFinish = this.settings.removeOnFinish ?? true;

        this.settings.allowEventCreationAfterInit = this.settings.allowEventCreationAfterInit ?? false;
        this.settings.maxGlobalEventListeners = this.settings.maxGlobalEventListeners ?? -1;

        // this is by default false because react devtools sends a bunch of messages to the parent window when the page and the react team wont do anything about it
        // see: https://github.com/facebook/react/issues/27529
        this.settings.showErrorOnBadOrigin = this.settings.showErrorOnBadOrigin ?? false;
    }

    public async start(): Promise<StartReturn> {
        const srcDoc = generateSrcdoc(this.settings.predefinedFunctions, this.userCode);

        // get how many iframes are there
        const iframes = document.querySelectorAll(`[data-isolated-js="true"]`);
        if (this.settings.maxIframes && iframes.length >= this.settings.maxIframes) {
            throw new Error("isolated-js: max iframes reached");
        }

        let iframe: HTMLIFrameElement;

        // create a new iframe
        iframe = document.createElement("iframe");
        if (this.settings.beforeInit) this.settings.beforeInit(iframe); // run the beforeInit function

        return await new Promise<StartReturn>((resolve, reject) => {
            let id: number;
            if (this.settings.timeout !== -1) {
                id = setTimeout(() => {
                    const err = () => {
                        if (this.settings.onConsole) this.settings.onConsole("error", "canceled");
                        console.error("isolated-js: execution timed out");
                        reject("execution timed out");
                    };

                    // remove the iframe after the timeout
                    if (this.settings.removeOnFinish) iframe.remove();
                    err();
                }, this.settings.timeout);
            }

            const cleanup = eventHandler(iframe, this.settings, () => {
                if (this.settings.timeout != -1) clearTimeout(id);
                if (this.settings.removeOnFinish) iframe.remove();

                resolve({
                    element: iframe,
                    dispatch: (name: string, args: object) => {
                        if (!this.settings.predefinedFunctions) {
                            console.error("isolated-js: no predefined functions defined");
                            return;
                        }

                        // check if there are any event listeners with this name to dispatch
                        if (this.settings.predefinedFunctions[name] == undefined) {
                            console.error(`isolated-js: no event listener with the name ${name}`);
                            return;
                        }

                        // check if the iframe is still there
                        if (!iframe.contentWindow) {
                            console.error(
                                "isolated-js: iframe is not there. It was probably automatically removed by timeout. Set removeOnFinish to false to prevent this"
                            );
                            return;
                        }

                        // finally dispatch the event
                        try {
                            iframe.contentWindow.postMessage({ type: "event", name, args: JSON.stringify(args) }, "*");
                        } catch (e) {
                            console.error("isolated-js:", e);
                        }
                    },
                });
            }); // initialize the event handler

            iframe.setAttribute("sandbox", "allow-scripts");
            iframe.setAttribute("srcDoc", srcDoc);
            iframe.setAttribute("id", this.uniqueId);
            iframe.setAttribute("data-isolated-js", "true");
            iframe.onerror = (error) => {
                reject(error);
            };

            if (this.settings.hide) iframe.setAttribute("style", "display: none;"); // hide the iframe

            // append the iframe to the body
            document.body.appendChild(iframe);

            return cleanup();
        });
    }
}
