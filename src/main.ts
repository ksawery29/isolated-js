import eventHandler from "./iframe/event-handler.js";
import generateSrcdoc from "./iframe/srcdoc.js";
import { type IsolatedSettings } from "./types/main";

export default class Isolated {
    settings: IsolatedSettings;
    userCode: string;

    constructor(userCode: string, settings?: IsolatedSettings) {
        this.settings = settings ?? {};

        this.settings.hide = this.settings.hide ?? true;
        this.settings.timeout = this.settings.timeout ?? 5000;
        this.settings.removeAfterExecution =
            this.settings.removeAfterExecution ?? true;
        this.userCode = userCode;
    }

    public async start(): Promise<HTMLIFrameElement> {
        const srcDoc = generateSrcdoc(
            this.settings.predefinedFunctions,
            this.userCode
        );

        let iframe: HTMLIFrameElement;
        let exists: boolean = false;

        // the iframe might exist from previous executions
        const mightExist = document.getElementById("isolated-js-iframe");
        if (mightExist) {
            iframe = mightExist as HTMLIFrameElement;
            exists = true;
        } else {
            // create a new iframe
            iframe = document.createElement("iframe");
            if (this.settings.beforeInit) this.settings.beforeInit(iframe); // run the beforeInit function
        }

        return await new Promise<HTMLIFrameElement>((resolve, reject) => {
            let id: number;
            if (this.settings.timeout !== -1) {
                id = setTimeout(() => {
                    const err = () => {
                        if (this.settings.onConsole)
                            this.settings.onConsole(
                                "error",
                                "execution timed out"
                            );
                        console.error("isolated-js: execution timed out");
                        reject("execution timed out");
                    };

                    // remove the iframe after the timeout
                    iframe.remove();
                    err();
                }, this.settings.timeout);
            }

            if (!exists) {
                eventHandler(iframe, this.settings, () => {
                    if (this.settings.timeout != -1) clearTimeout(id);
                    if (this.settings.removeAfterExecution) iframe.remove();

                    resolve(iframe);
                }); // initialize the event handler
            }

            iframe.setAttribute("sandbox", "allow-scripts");
            iframe.setAttribute("srcDoc", srcDoc);
            iframe.setAttribute("id", "isolated-js-iframe");
            iframe.onerror = (error) => {
                reject(error);
            };

            if (this.settings.hide)
                iframe.setAttribute("style", "display: none;"); // hide the iframe

            // append the iframe to the body
            document.body.appendChild(iframe);
        });
    }
}
