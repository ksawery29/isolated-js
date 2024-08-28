import generateSrcdoc from "./iframe/srcdoc.js";
import { IsolatedSettings } from "./types/main.js";

export default class Isolated {
    settings: IsolatedSettings;

    constructor(settings?: IsolatedSettings) {
        this.settings = settings ?? {
            // default settings
            onConsole: (type, content) => console[type](content),
        };

        // create a new iframe
        const iframe = document.createElement("iframe");
        iframe.setAttribute("sandbox", "allow-scripts");

        // append the iframe to the body
        document.body.appendChild(iframe);

        generateSrcdoc(
            {
                example: () => {},
                another: (arg1: string, arg2: number) => {},
            },
            "console.log('hello from user code');",
        );
    }
}

// for testing
new Isolated();
