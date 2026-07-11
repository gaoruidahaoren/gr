import { useEffect } from 'react';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
// 全局样式
import './app.scss';

function App(props) {
  // 初始化云开发（仅微信平台）
  useEffect(() => {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({
        env: '', // 部署后会替换为真实环境ID
        traceUser: true,
      });
      console.log('[App] 云开发初始化成功');
    }
  }, []);

  // 对应 onShow
  useDidShow(() => {
    console.log('[App] App Show');
  });

  // 对应 onHide
  useDidHide(() => {
    console.log('[App] App Hide');
  });

  return props.children;
}

export default App;
