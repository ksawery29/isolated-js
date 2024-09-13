import { type EventListener } from "../types/main";

// predefined functions can be also used as event listeners
// example: { myEventListener: eventListener("addSomething") }
// user code: myEventListener(() => {console.log("something happened...")})
// max: -1 = infinite
export function eventListener(name: string, max: number = -1): EventListener {
    return {
        eventListener: { name, max },
    };
}
