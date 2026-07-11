import { localConfig } from './config.local';

export interface LLMConfig {
  provider: 'zhipu' | 'baidu' | 'openai' | 'qwen' | 'custom';
  apiKey: string;
  apiBaseUrl?: string;
  model: string;
  timeout: number;
}

export const defaultLLMConfig: LLMConfig = {
  provider: 'zhipu',
  apiKey: localConfig?.apiKeys?.zhipu || '',
  apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4v-plus',
  timeout: 30000,
};

export const qwenLLMConfig: LLMConfig = {
  provider: 'qwen',
  apiKey: localConfig?.apiKeys?.qwen || '',
  // 使用 OpenAI 兼容模式的端点
  apiBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: 'qwen-vl-max',
  timeout: 30000,
};

export interface AppConfig {
  llm: LLMConfig;
  cloud: {
    env: string;
  };
}

export const appConfig: AppConfig = {
  llm: qwenLLMConfig,
  cloud: {
    env: localConfig?.cloud?.env || '',
  },
};
