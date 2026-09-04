/**
 * Structured logger for Cloudflare Workers
 * Outputs JSON-formatted logs for easy parsing in production dashboards
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  ts: string;
  level: LogLevel;
  msg: string;
  [key: string]: unknown;
}

function formatEntry(level: LogLevel, msg: string, data?: Record<string, unknown>): string {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...data,
  };
  return JSON.stringify(entry);
}

export const log = {
  debug(msg: string, data?: Record<string, unknown>) {
    console.debug(formatEntry("debug", msg, data));
  },
  info(msg: string, data?: Record<string, unknown>) {
    console.info(formatEntry("info", msg, data));
  },
  warn(msg: string, data?: Record<string, unknown>) {
    console.warn(formatEntry("warn", msg, data));
  },
  error(msg: string, data?: Record<string, unknown>) {
    console.error(formatEntry("error", msg, data));
  },
};
