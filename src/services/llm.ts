import Taro from '@tarojs/taro';
import type { LLMConfig } from '@/config/llm';
import { promptTemplate } from '@/config/prompt';
import type { RecognitionResult } from '@/types/meter';

export interface LLMResponse {
  content: string;
  model: string;
}

export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async recognize(imageBase64: string): Promise<RecognitionResult> {
    console.log('[LLMService] 开始调用多模态LLM识别');

    try {
      let result: LLMResponse;

      switch (this.config.provider) {
        case 'zhipu':
          result = await this.callZhipuAPI(imageBase64);
          break;
        case 'baidu':
          result = await this.callBaiduAPI(imageBase64);
          break;
        case 'openai':
          result = await this.callOpenAIAPI(imageBase64);
          break;
        default:
          throw new Error('不支持的LLM提供商');
      }

      return this.parseResult(result.content);
    } catch (error) {
      console.error('[LLMService] 识别失败:', error);
      return {
        reading: 0,
        confidence: 0,
        success: false,
        message: error instanceof Error ? error.message : '识别失败',
      };
    }
  }

  private async callZhipuAPI(imageBase64: string): Promise<LLMResponse> {
    console.log('[LLMService] 调用智谱API');

    const url = `${this.config.apiBaseUrl}/chat/completions`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };

    const body = {
      model: this.config.model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: promptTemplate },
            { type: 'image', image: imageBase64 },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 100,
    };

    const response = await Taro.request({
      url,
      method: 'POST',
      headers,
      data: body,
      timeout: this.config.timeout,
    });

    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}: ${response.data?.message || 'API调用失败'}`);
    }

    const data = response.data as {
      choices: { message: { content: string } }[];
      model: string;
    };

    return {
      content: data.choices[0].message.content,
      model: data.model,
    };
  }

  private async callBaiduAPI(imageBase64: string): Promise<LLMResponse> {
    console.log('[LLMService] 调用百度API');

    const url = `${this.config.apiBaseUrl || 'https://aip.baidubce.com'} /rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro`;

    const response = await Taro.request({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      data: {
        model: this.config.model || 'wenxin-plus',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptTemplate },
              { type: 'image_url', image_url: `data:image/jpeg;base64,${imageBase64}` },
            ],
          },
        ],
      },
      timeout: this.config.timeout,
    });

    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}: ${response.data?.message || 'API调用失败'}`);
    }

    const data = response.data as {
      result: string;
      model: string;
    };

    return {
      content: data.result,
      model: data.model,
    };
  }

  private async callOpenAIAPI(imageBase64: string): Promise<LLMResponse> {
    console.log('[LLMService] 调用OpenAI API');

    const url = `${this.config.apiBaseUrl || 'https://api.openai.com'} /v1/chat/completions`;

    const response = await Taro.request({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      data: {
        model: this.config.model || 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptTemplate },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 100,
      },
      timeout: this.config.timeout,
    });

    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}: ${response.data?.message || 'API调用失败'}`);
    }

    const data = response.data as {
      choices: { message: { content: string } }[];
      model: string;
    };

    return {
      content: data.choices[0].message.content,
      model: data.model,
    };
  }

  private parseResult(content: string): RecognitionResult {
    console.log('[LLMService] 解析识别结果:', content);

    try {
      const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(jsonStr);

      const reading = parseFloat(result.reading);
      const confidence = parseFloat(result.confidence);

      if (isNaN(reading) || reading < 0) {
        throw new Error('无效的读数');
      }

      if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        throw new Error('无效的置信度');
      }

      return {
        reading,
        confidence,
        success: true,
        message: '识别成功',
      };
    } catch (error) {
      console.error('[LLMService] 解析失败:', error);

      const match = content.match(/(\d+\.?\d*)/);
      if (match) {
        return {
          reading: parseFloat(match[1]),
          confidence: 0.7,
          success: true,
          message: '识别成功（解析降级）',
        };
      }

      return {
        reading: 0,
        confidence: 0,
        success: false,
        message: '无法解析识别结果',
      };
    }
  }
}
