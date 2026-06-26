const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    console.log('[login] openid:', openid)

    return {
      code: 0,
      message: 'success',
      data: { openid }
    }
  } catch (err) {
    console.error('[login] error:', err)
    return {
      code: -1,
      message: err.message || '登录失败',
      data: null
    }
  }
}