import { EventHandlerType } from "./iframe";

export type EventListener = { eventListener: { name: string } };
type AnyFunction = (...args: any[]) => any;
export interface PredefinedFunctions {
    [key: string]: AnyFunction | EventListener;
}

export interface IsolatedSettings {
    onConsole?: (type: EventHandlerType["method"], content: string | Object) => void | Promise<void>; // on console.(log/warn/err)
    predefinedFunctions?: PredefinedFunctions | undefined;
    hide?: boolean;
    timeout?: number;
    beforeInit?: (element: HTMLIFrameElement) => void | Promise<void>;
    maxIframes?: number;
    removeOnFinish?: boolean;
}

export interface StartReturn {
    element: HTMLIFrameElement;
    dispatch: (name: string, args: object) => void;
}
