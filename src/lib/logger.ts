/**
 * Development-only logger.
 * In production (NODE_ENV === 'production'), all methods are no-ops.
 * Prevents noisy console output in production but keeps debug info in dev.
 */
const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  error: (msg: string, err?: unknown) => {
    if (isDev) console.error(`[IHA] ${msg}:`, err);
  },
  warn: (msg: string, data?: unknown) => {
    if (isDev) console.warn(`[IHA] ${msg}`, data);
  },
  info: (msg: string, data?: unknown) => {
    if (isDev) console.info(`[IHA] ${msg}`, data);
  },
};
