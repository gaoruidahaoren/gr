import Taro from '@tarojs/taro';
import { LLMService } from './llm';
import { appConfig } from '@/config/llm';
import { imageToBase64 } from '@/utils';
import type { RecognitionResult } from '@/types/meter';

const llmService = new LLMService(appConfig.llm);

export const recognizeMeter = async (imagePath: string): Promise<RecognitionResult> => {
  console.log('[MeterService] 开始识别水表:', imagePath);

  if (!appConfig.llm.apiKey) {
    console.warn('[MeterService] 未配置API Key，使用模拟结果');
    return getMockResult();
  }

  try {
    const compressedPath = await compressImage(imagePath);
    const base64Data = await imageToBase64(compressedPath);

    console.log('[MeterService] 图片Base64长度:', base64Data.length);

    const result = await llmService.recognize(base64Data);

    console.log('[MeterService] 识别结果:', result);
    return result;
  } catch (error) {
    console.error('[MeterService] 识别失败:', error);
    return {
      reading: 0,
      confidence: 0,
      success: false,
      message: error instanceof Error ? error.message : '识别失败',
    };
  }
};

const getMockResult = (): RecognitionResult => {
  const mockReading = Math.floor(Math.random() * 1000) + 100;
  const mockConfidence = Math.random() * 0.2 + 0.8;

  return {
    reading: mockReading,
    confidence: mockConfidence,
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
      quality: 80,
    });

    console.log('[MeterService] 图片压缩成功:', res.tempFilePath);
    return res.tempFilePath;
  } catch (error) {
    console.error('[MeterService] 图片压缩失败:', error);
    throw error;
  }
};