import Taro from '@tarojs/taro';
import { LLMService } from './llm';
import { appConfig } from '@/config/llm';
import { imageToBase64 } from '@/utils';
import type { RecognitionResult } from '@/types/meter';

const llmService = new LLMService(appConfig.llm);

export const recognizeMeter = async (imagePath: string, meterType: 'water' | 'electric' = 'water'): Promise<RecognitionResult> => {
  console.log('[MeterService] 开始识别:', imagePath);
  console.log('[MeterService] 仪表类型:', meterType);
  console.log('[MeterService] API Key 配置:', appConfig.llm.apiKey ? '已配置' : '未配置');
  console.log('[MeterService] Provider:', appConfig.llm.provider);
  console.log('[MeterService] Model:', appConfig.llm.model);

  if (!appConfig.llm.apiKey) {
    console.warn('[MeterService] 未配置API Key，使用模拟结果');
    return getMockResult(meterType);
  }

  try {
    console.log('[MeterService] 开始压缩图片...');
    let compressedPath: string;
    try {
      compressedPath = await compressImage(imagePath);
      console.log('[MeterService] 图片压缩完成:', compressedPath);
    } catch (compressError) {
      console.warn('[MeterService] 图片压缩失败，使用原始图片:', compressError);
      compressedPath = imagePath;
    }

    console.log('[MeterService] 开始转换为Base64...');
    const base64Data = await imageToBase64(compressedPath);

    console.log('[MeterService] 图片Base64长度:', base64Data.length);
    console.log('[MeterService] Base64前50字符:', base64Data.substring(0, 50) + '...');

    console.log('[MeterService] 开始调用LLM识别...');
    const result = await llmService.recognize(base64Data);

    console.log('[MeterService] 识别完成，结果:', JSON.stringify(result));
    return result;
  } catch (error: any) {
    console.error('[MeterService] 识别失败:', error);
    console.error('[MeterService] 错误详情:', error.message);
    console.error('[MeterService] 错误堆栈:', error.stack);
    return {
      reading: 0,
      confidence: 0,
      meterType,
      success: false,
      message: error instanceof Error ? error.message : '识别失败',
    };
  }
};

const getMockResult = (): RecognitionResult => {
  const mockReading = Math.floor(Math.random() * 1000) + 100;
  const mockConfidence = Math.random() * 0.2 + 0.8;
  const mockMeterType = Math.random() > 0.5 ? 'water' : 'electric';

  return {
    reading: mockReading,
    confidence: mockConfidence,
    meterType: mockMeterType,
    meterNumber: `TEST-${Math.floor(Math.random() * 1000)}`,
    success: true,
    message: '识别成功（模拟）',
  };
};

export const chooseImage = async (): Promise<string> => {
  console.log('[MeterService] 选择图片');

  try {
    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    });

    if (res.tempFilePaths && res.tempFilePaths.length > 0) {
      console.log('[MeterService] 图片选择成功:', res.tempFilePaths[0]);
      return res.tempFilePaths[0];
    }

    throw new Error('未选择图片');
  } catch (error) {
    console.error('[MeterService] 图片选择失败:', error);
    throw error;
  }
};

export const compressImage = async (filePath: string): Promise<string> => {
  console.log('[MeterService] 压缩图片:', filePath);

  try {
    const res = await Taro.compressImage({
      src: filePath,
      quality: 90,
    });

    console.log('[MeterService] 图片压缩成功:', res.tempFilePath);
    return res.tempFilePath;
  } catch (error) {
    console.warn('[MeterService] 图片压缩失败，使用原始图片:', error);
    return filePath;
  }
};