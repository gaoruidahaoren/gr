import Taro from '@tarojs/taro';

export const imageToBase64 = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 检查是否为 H5 环境
    if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
      // H5 环境使用 FileReader
      console.log('[Utils] H5环境，使用FileReader转换Base64');

      // 如果是 http/https URL，使用 fetch
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        fetch(filePath)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // 移除 data:image/xxx;base64, 前缀
              const base64Data = result.split(',')[1];
              console.log('[Utils] 图片转Base64成功');
              console.log('[Utils] Base64长度:', base64Data.length);
              resolve(base64Data);
            };
            reader.onerror = () => reject(new Error('图片读取失败'));
            reader.readAsDataURL(blob);
          })
          .catch(err => {
            console.error('[Utils] fetch图片失败:', err);
            reject(new Error('图片读取失败'));
          });
      } else {
        // 对于 blob URL 或其他本地 URL
        fetch(filePath)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64Data = result.split(',')[1];
              console.log('[Utils] 图片转Base64成功');
              console.log('[Utils] Base64长度:', base64Data.length);
              resolve(base64Data);
            };
            reader.onerror = () => reject(new Error('图片读取失败'));
            reader.readAsDataURL(blob);
          })
          .catch(err => {
            console.error('[Utils] fetch图片失败:', err);
            reject(new Error('图片读取失败'));
          });
      }
    } else {
      // 小程序环境使用 FileSystemManager
      console.log('[Utils] 小程序环境，使用FileSystemManager');
      const fileManager = Taro.getFileSystemManager();
      fileManager.readFile({
        filePath,
        encoding: 'base64',
        success: (res) => {
          const base64Data = res.data as string;
          console.log('[Utils] 图片转Base64成功');
          console.log('[Utils] Base64长度:', base64Data.length);

          // 检查 Base64 大小（通常视觉模型限制 4MB-20MB）
          const maxSize = 10 * 1024 * 1024;  // 10MB
          if (base64Data.length > maxSize) {
            console.warn('[Utils] Base64数据过大，可能超出API限制');
          }

          resolve(base64Data);
        },
        fail: (err) => {
          console.error('[Utils] 图片转Base64失败:', err);
          reject(new Error('图片读取失败'));
        },
      });
    }
  });
};

export const preprocessImage = async (filePath: string): Promise<string> => {
  console.log('[Utils] 预处理图片:', filePath);

  try {
    // H5 环境下直接返回，让浏览器处理
    if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
      console.log('[Utils] H5环境，跳过预处理');
      return filePath;
    }

    // 获取图片信息
    const imageInfo = await Taro.getImageInfo({ src: filePath });
    console.log('[Utils] 原始图片尺寸:', imageInfo.width, 'x', imageInfo.height);

    // 如果尺寸超过限制，进行压缩
    const MAX_SIZE = 2048;  // 最大边长
    if (imageInfo.width > MAX_SIZE || imageInfo.height > MAX_SIZE) {
      console.log('[Utils] 图片尺寸超过限制，进行压缩');
      const compressedPath = await compressImage(filePath);
      return compressedPath;
    }

    return filePath;
  } catch (error) {
    console.error('[Utils] 图片预处理失败:', error);
    return filePath;
  }
};

export const compressImage = async (filePath: string): Promise<string> => {
  console.log('[Utils] 压缩图片:', filePath);

  // H5 环境不支持 compressImage
  if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
    console.log('[Utils] H5环境，跳过压缩');
    return filePath;
  }

  try {
    const res = await Taro.compressImage({
      src: filePath,
      quality: 70,
    });

    console.log('[Utils] 图片压缩成功:', res.tempFilePath);
    return res.tempFilePath;
  } catch (error) {
    console.warn('[Utils] 图片压缩失败，使用原始图片:', error);
    return filePath;
  }
};

export const formatNumber = (num: number, decimals: number = 3): string => {
  return num.toFixed(decimals);
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
