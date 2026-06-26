export const imageToBase64 = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileManager = Taro.getFileSystemManager();
    fileManager.readFile({
      filePath,
      encoding: 'base64',
      success: (res) => {
        console.log('[Utils] 图片转Base64成功');
        resolve(res.data);
      },
      fail: (err) => {
        console.error('[Utils] 图片转Base64失败:', err);
        reject(new Error('图片读取失败'));
      },
    });
  });
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
