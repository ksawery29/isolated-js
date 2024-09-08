export interface EventHandlerType {
    type: "console" | "function" | "finished_execution";
    method?: "log" | "warn" | "error" | "debug"; // used for console only
    name?: string; // used for functions only
    args: string | string[]; // used for console and functions
}
