/**
 * Legacy Environment Accessor (main.ys)
 * 
 * Re-exports the unified, validated configuration from `@/lib/config`
 * to maintain complete backward compatibility with existing imports.
 */
export * from "./config";
export { env, config, default } from "./config";
