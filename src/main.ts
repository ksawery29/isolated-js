import generateSrcdoc from "./iframe/srcdoc.js";

export default class Isolated {
    constructor() {
        // create a new iframe
        // const iframe = document.createElement("iframe");
        // iframe.setAttribute("sandbox", "allow-scripts");

        // // append the iframe to the body
        // document.body.appendChild(iframe);

        (async () => {
            try {
                let a = await generateSrcdoc(
                    {
                        example: () => {},
                        another: (arg1: string, arg2: number) => {},
                    },
                    "console.log('hello from user code';"
                );
                console.log(a);
            } catch (error) {
                console.error(error);
            }
        })();
    }
}

// for testing
new Isolated();
