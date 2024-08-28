import generateSrcdoc from "./iframe/srcdoc";

export default class Isolated {
    constructor() {
        // create a new iframe
        const iframe = document.createElement("iframe");
        iframe.setAttribute("sandbox", "allow-scripts");

        // append the iframe to the body
        document.body.appendChild(iframe);

        console.log(
            generateSrcdoc({
                example: () => {},
                another: (arg1: string, arg2: number) => {},
            })
        );
    }
}

// for testing
new Isolated();
