export interface EventHandlerType {
    type: "console" | "function" | "finished_execution";
    method?: "log" | "warn" | "error"; // used for console only
    name?: string; // used for functions only
    args: string;
}
