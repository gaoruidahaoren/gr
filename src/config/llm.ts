export interface LLMConfig {
  provider: 'zhipu' | 'baidu' | 'openai' | 'custom';
  apiKey: string;
  apiBaseUrl?: string;
  model: string;
  timeout: number;
}

export const defaultLLMConfig: LLMConfig = {
  provider: 'zhipu',
  apiKey: '',
  apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  model: 'glm-4v-plus',
  timeout: 30000,
};

export interface AppConfig {
  llm: LLMConfig;
  cloud: {
    env: string;
  };
}

export const appConfig: AppConfig = {
  llm: defaultLLMConfig,
  cloud: {
    env: '',
  },
};
