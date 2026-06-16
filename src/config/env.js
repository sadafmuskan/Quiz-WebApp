const ENV    = import.meta.env.VITE_APP_ENV            || 'development';
const PREFIX = import.meta.env.VITE_APP_STORAGE_PREFIX  || 'edu_dev_';

export const config = {
  env:           ENV,
  appName:       import.meta.env.VITE_APP_NAME           || 'EduApp',
  storagePrefix: PREFIX,
  apiUrl:        import.meta.env.VITE_APP_API_URL         || '',
  logLevel:      import.meta.env.VITE_APP_LOG_LEVEL       || 'debug',
  showEnvBadge:  import.meta.env.VITE_APP_SHOW_ENV_BADGE  === 'true',
  isDev:     ENV === 'development',
  isStaging: ENV === 'staging',
  isProd:    ENV === 'production',
};

/* ── Logger ─────────────────────────────────────────────────────
   Only logs at or above the configured level reach the console.
   Production default is 'error' → no debug/info noise in prod.
──────────────────────────────────────────────────────────────── */
const LEVEL_ORDER = { debug: 0, info: 1, warn: 2, error: 3 };
const current = LEVEL_ORDER[config.logLevel] ?? 0;

export const logger = {
  debug: (...a) => current <= 0 && console.debug(`[${ENV.toUpperCase()}][DEBUG]`, ...a),
  info:  (...a) => current <= 1 && console.info( `[${ENV.toUpperCase()}][INFO]`,  ...a),
  warn:  (...a) => current <= 2 && console.warn( `[${ENV.toUpperCase()}][WARN]`,  ...a),
  error: (...a) => current <= 3 && console.error(`[${ENV.toUpperCase()}][ERROR]`, ...a),
};
