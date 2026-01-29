import 'dotenv/config';

export function loadEnv(env: string) {
  return process.env[env] || '';
}
