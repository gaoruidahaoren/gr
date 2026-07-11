/**
 * 本地配置文件
 */
export const localConfig = {
  apiKeys: {
    qwen: process.env.VITE_QWEN_API_KEY || '',
    zhipu: process.env.VITE_ZHIPU_API_KEY || '',
  },
  cloud: {
    env: process.env.VITE_CLOUD_ENV || '',
  },
};
