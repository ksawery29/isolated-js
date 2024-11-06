export interface EventHandlerType {
    type: "console" | "function" | "finished_execution" | "register_event_listener" | "error" | "heap_size";
    method?: "log" | "warn" | "error" | "debug"; // used for console only
    name?: string; // used for functions only
    args: string | string[] | number; // used for console, functions, error and heap size
    secret: string;
}
