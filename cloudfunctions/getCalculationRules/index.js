const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    console.log('[getCalculationRules] openid:', openid)

    // 查询用户的规则
    const result = await db.collection('calculation_rules')
      .where({
        _openid: openid
      })
      .orderBy('createdAt', 'desc')
      .get()

    console.log('[getCalculationRules] found:', result.data.length)

    return {
      code: 0,
      message: 'success',
      data: { rules: result.data }
    }
  } catch (err) {
    console.error('[getCalculationRules] error:', err)
    return {
      code: -1,
      message: err.message || '查询失败',
      data: null
    }
  }
}