// login 云函数 mock
export default function loginMock(_params?: any) {
  return {
    openid: 'mock_openid_' + Date.now(),
  };
}