import eventHandler from "./iframe/event-handler.js";
import generateSrcdoc from "./iframe/srcdoc.js";
import { type IsolatedSettings } from "./types/main";

export default class Isolated {
    settings: IsolatedSettings;
    userCode: string;
    uniqueId: string;

    constructor(userCode: string, settings?: IsolatedSettings) {
        this.settings = settings ?? {};

        this.settings.hide = this.settings.hide ?? true;
        this.settings.timeout = this.settings.timeout ?? 5000;
        this.userCode = userCode;
        this.uniqueId = `isolated-js-iframe-${Math.random()
            .toString(36)
            .slice(2, 11)}`;
    }

    public async start(): Promise<HTMLIFrameElement> {
        const srcDoc = generateSrcdoc(
            this.settings.predefinedFunctions,
            this.userCode
        );

        // get how many iframes are there
        const iframes = document.querySelectorAll(`[data-isolated-js="true"]`);

        if (
            this.settings.maxIframes &&
            iframes.length >= this.settings.maxIframes
        ) {
            throw new Error("isolated-js: max iframes reached");
        }

        let iframe: HTMLIFrameElement;

        // create a new iframe
        iframe = document.createElement("iframe");
        if (this.settings.beforeInit) this.settings.beforeInit(iframe); // run the beforeInit function

        return await new Promise<HTMLIFrameElement>((resolve, reject) => {
            let id: number;
            if (this.settings.timeout !== -1) {
                id = setTimeout(() => {
                    const err = () => {
                        if (this.settings.onConsole)
                            this.settings.onConsole("error", "canceled");
                        console.error("isolated-js: execution timed out");
                        reject("execution timed out");
                    };

                    // remove the iframe after the timeout
                    iframe.remove();
                    err();
                }, this.settings.timeout);
            }

            const cleanup = eventHandler(iframe, this.settings, () => {
                if (this.settings.timeout != -1) clearTimeout(id);
                iframe.remove();

                resolve(iframe);
            }); // initialize the event handler

            iframe.setAttribute("sandbox", "allow-scripts");
            iframe.setAttribute("srcDoc", srcDoc);
            iframe.setAttribute("id", this.uniqueId);
            iframe.setAttribute("data-isolated-js", "true");
            iframe.onerror = (error) => {
                reject(error);
            };

            if (this.settings.hide)
                iframe.setAttribute("style", "display: none;"); // hide the iframe

            // append the iframe to the body
            document.body.appendChild(iframe);

            return cleanup();
        });
    }
}
