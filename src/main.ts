import generateSrcdoc from "./iframe/srcdoc.js";
import { IsolatedSettings } from "./types/main.js";

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
        // create a new iframe
        const iframe = document.createElement("iframe");
        iframe.setAttribute("sandbox", "allow-scripts");

        // append the iframe to the body
        document.body.appendChild(iframe);

        generateSrcdoc(this.settings.predefinedFunctions, this.userCode);
    }
}

// for testing
new Isolated("");
