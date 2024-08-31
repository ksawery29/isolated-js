import eventHandler from "./iframe/event-handler.js";
import generateSrcdoc from "./iframe/srcdoc.js";
import { IsolatedSettings } from "./types/main";

export default class Isolated {
    settings: IsolatedSettings;
    userCode: string;

    constructor(userCode: string, settings?: IsolatedSettings) {
        this.settings = settings ?? {};

        this.settings.hide = this.settings.hide ?? true;
        this.settings.timeout = this.settings.timeout ?? 5000;
        this.userCode = userCode;
    }

    public init(): void {
        const srcDoc = generateSrcdoc(
            this.settings.predefinedFunctions,
            this.userCode
        );

        // create a new iframe
        const iframe = document.createElement("iframe");
        if (this.settings.beforeInit) this.settings.beforeInit(iframe); // run the beforeInit function

        const id = setTimeout(() => {
            const err = () => {
                if (this.settings.onConsole)
                    this.settings.onConsole("error", "execution timed out");
                console.error("isolated-js: execution timed out");
            };

            // remove the iframe after the timeout
            iframe.remove();
            err();
        }, this.settings.timeout);

        eventHandler(iframe, this.settings, () => {
            clearTimeout(id);
            iframe.remove();
        }); // initialize the event handler

        iframe.setAttribute("sandbox", "allow-scripts");
        iframe.setAttribute("srcDoc", srcDoc);

        if (this.settings.hide) iframe.setAttribute("style", "display: none;"); // hide the iframe

        // append the iframe to the body
        document.body.appendChild(iframe);
    }
}
