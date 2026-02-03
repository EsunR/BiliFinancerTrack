import 'dotenv/config';

export function loadEnv(env: string) {
  return process.env[env] || '';
}

export function checkEnv() {
  const requiredEnvs = ['GROQ_SK', 'LLM_API_KEY', 'LLM_BASE_URL'];
  const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);
  if (missingEnvs.length > 0) {
    throw new Error(`缺少必要的环境变量: ${missingEnvs.join(', ')}`);
  }
}
