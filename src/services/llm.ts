import Taro from '@tarojs/taro';
import type { LLMConfig } from '@/config/llm';
import { getPromptByMeterType } from '@/config/prompt';
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

  async recognize(imageBase64: string, meterType: 'water' | 'electric'): Promise<RecognitionResult> {
    console.log('[LLMService] 开始调用多模态LLM识别');
    console.log('[LLMService] Provider:', this.config.provider);
    console.log('[LLMService] Model:', this.config.model);
    console.log('[LLMService] API Base URL:', this.config.apiBaseUrl);
    console.log('[LLMService] Image Base64 长度:', imageBase64.length);
    console.log('[LLMService] 仪表类型:', meterType);

    try {
      let result: LLMResponse;

      switch (this.config.provider) {
        case 'zhipu':
          result = await this.callZhipuAPI(imageBase64, meterType);
          break;
        case 'baidu':
          result = await this.callBaiduAPI(imageBase64, meterType);
          break;
        case 'openai':
          result = await this.callOpenAIAPI(imageBase64, meterType);
          break;
        case 'qwen':
          result = await this.callQwenAPI(imageBase64, meterType);
          break;
        default:
          throw new Error('不支持的LLM提供商');
      }

      console.log('[LLMService] 原始返回内容:', result.content);
      return this.parseResult(result.content, meterType);
    } catch (error) {
      console.error('[LLMService] 识别失败:', error);
      return {
        reading: 0,
        confidence: 0,
        meterType: 'water',
        success: false,
        message: error instanceof Error ? error.message : '识别失败',
      };
    }
  }

  private async callZhipuAPI(imageBase64: string, meterType: 'water' | 'electric'): Promise<LLMResponse> {
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
            { type: 'text', text: getPromptByMeterType(meterType) },
            { type: 'image', image: imageBase64 },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 300,
    };

    const response = await Taro.request({
      url,
      method: 'POST',
      header: headers,
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

  private async callBaiduAPI(imageBase64: string, meterType: 'water' | 'electric'): Promise<LLMResponse> {
    console.log('[LLMService] 调用百度API');

    const url = `${this.config.apiBaseUrl || 'https://aip.baidubce.com'}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro`;

    const response = await Taro.request({
      url,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      data: {
        model: this.config.model || 'wenxin-plus',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: getPromptByMeterType(meterType) },
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

  private async callOpenAIAPI(imageBase64: string, meterType: 'water' | 'electric'): Promise<LLMResponse> {
    console.log('[LLMService] 调用OpenAI API');

    const url = `${this.config.apiBaseUrl || 'https://api.openai.com'}/v1/chat/completions`;

    const response = await Taro.request({
      url,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      data: {
        model: this.config.model || 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: getPromptByMeterType(meterType) },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 300,
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

  private async callQwenAPI(imageBase64: string, meterType: 'water' | 'electric'): Promise<LLMResponse> {
    console.log('[LLMService] 调用通义千问API (OpenAI兼容格式)');
    console.log('[LLMService] API URL:', `${this.config.apiBaseUrl}/chat/completions`);
    console.log('[LLMService] API Key 前8位:', this.config.apiKey?.substring(0, 8) + '...');

    // 使用 OpenAI 兼容格式的端点
    const url = `${this.config.apiBaseUrl}/chat/completions`;
    const prompt = getPromptByMeterType(meterType);

    try {
      const response = await Taro.request({
        url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        data: {
          model: this.config.model || 'qwen-vl-max',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的表计读数识别助手，能够准确识别水表和电表的读数。请严格按照用户的要求进行识别，确保读数准确无误。',
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          temperature: 0,
          max_tokens: 300,
        },
        timeout: 60000,
      });

      console.log('[LLMService] 响应状态码:', response.statusCode);
      console.log('[LLMService] 响应数据:', JSON.stringify(response.data).substring(0, 500));

      if (response.statusCode !== 200) {
        const errorMsg = response.data?.error?.message || response.data?.message || 'API调用失败';
        throw new Error(`HTTP ${response.statusCode}: ${errorMsg}`);
      }

      const data = response.data as {
        choices: { message: { content: string } }[];
        model: string;
      };

      return {
        content: data.choices[0].message.content,
        model: data.model || this.config.model || 'qwen-vl-max',
      };
    } catch (error: any) {
      console.error('[LLMService] API调用异常:', error);
      throw error;
    }
  }

  private parseResult(content: string, meterType: 'water' | 'electric'): RecognitionResult {
    console.log('[LLMService] 解析识别结果:', content);

    try {
      // 清理 JSON 字符串，移除可能的 markdown 标记
      let jsonStr = content.trim();

      // 移除 ```json 和 ``` 标记
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // 移除可能的前缀文字（如果模型返回了非 JSON 内容）
      const jsonMatch = jsonStr.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      console.log('[LLMService] 清理后的 JSON:', jsonStr);

      const result = JSON.parse(jsonStr);

      let reading = parseFloat(result.reading);
      let confidence = parseFloat(result.confidence);
      const meterNumber = result.meterNumber || null;

      if (isNaN(reading) || reading < 0) {
        throw new Error('无效的读数');
      }

      // 添加读数合理性范围校验
      const maxReading = meterType === 'water' ? 99999 : 999999;
      if (reading > maxReading) {
        console.warn('[LLMService] 读数超出合理范围:', reading);
        // 不直接拒绝，但降低置信度
        confidence = Math.max(0.3, confidence - 0.3);
      }

      if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        throw new Error('无效的置信度');
      }

      // 添加表号格式校验（如果有的话）
      let validMeterNumber = meterNumber;
      if (meterNumber && !/^[A-Za-z0-9]{6,12}$/.test(meterNumber)) {
        console.warn('[LLMService] 表号格式不符合预期:', meterNumber);
        validMeterNumber = null;
      }

      // 使用用户选择的 meterType，而不是模型返回的
      return {
        reading,
        confidence,
        meterType,
        meterNumber: validMeterNumber,
        success: true,
        message: '识别成功',
      };
    } catch (error) {
      console.error('[LLMService] JSON解析失败:', error);

      // 降级处理：尝试从文本中提取数字
      const match = content.match(/(\d+\.?\d*)/);
      if (match) {
        console.log('[LLMService] 降级提取到数字:', match[1]);
        return {
          reading: parseFloat(match[1]),
          confidence: 0.5,
          meterType,
          success: true,
          message: '识别成功（解析降级）',
        };
      }

      return {
        reading: 0,
        confidence: 0,
        meterType,
        success: false,
        message: '无法解析识别结果',
      };
    }
  }
}
