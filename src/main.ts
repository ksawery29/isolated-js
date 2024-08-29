import eventHandler from "./iframe/event-handler.js";
import generateSrcdoc from "./iframe/srcdoc.js";
import { IsolatedSettings } from "./types/main";

export default class Isolated {
    settings: IsolatedSettings;
    userCode: string;

    constructor(userCode: string, settings?: IsolatedSettings) {
        this.settings = settings ?? {
            // default settings
            onConsole: (type, content) => console[type](content),
        };
        this.userCode = userCode;
    }

    public init(): void {
        const srcDoc = generateSrcdoc(
            this.settings.predefinedFunctions,
            this.userCode
        );

        // create a new iframe
        const iframe = document.createElement("iframe");
        eventHandler(iframe, this.settings); // initialize the event handler
        iframe.setAttribute("sandbox", "allow-scripts");
        iframe.setAttribute("srcDoc", srcDoc);

        // append the iframe to the body
        document.body.appendChild(iframe);
    }
}
