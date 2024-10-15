import { type EventListener } from "../types/main";

// predefined functions can be also used as event listeners
// example: { myEventListener: eventListener("addSomething") }
// user code: myEventListener(() => {console.log("something happened...")})
// max: -1 = infinite
// pre: an optional check if the event listener should be created, if false it will return null and not create the listener
export function eventListener(name: string, max: number = -1, pre?: () => boolean): EventListener | null {
    if (pre !== undefined && pre() === false) {
        console.debug("isolated-js: event listener not created, predicate returned false");
        return null;
    }

    return {
        eventListener: { name, max },
    };
}
