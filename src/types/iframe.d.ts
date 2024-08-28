export interface EventHandlerType {
    type: "console" | "function";
    method?: "log" | "warn" | "error"; // used for console only
    name?: string; // used for functions only
    args: string;
}
