import { type EventListener } from "../types/main";

// predefined functions can be also used as event listeners
// example: { myEventListener: eventListener("addSomething") }
// user code: myEventListener(() => {console.log("something happened...")})
export function eventListener(name: string): EventListener {
    return {
        eventListener: { name },
    };
}
