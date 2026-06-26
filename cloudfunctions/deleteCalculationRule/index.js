const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const { id } = event

    console.log('[deleteCalculationRule] openid:', openid, 'id:', id)

    // 删除规则（需验证所有权）
    const result = await db.collection('calculation_rules')
      .where({
        _id: id,
        _openid: openid
      })
      .remove()

    console.log('[deleteCalculationRule] removed:', result.stats.removed)

    return {
      code: 0,
      message: 'success',
      data: { success: result.stats.removed > 0 }
    }
  } catch (err) {
    console.error('[deleteCalculationRule] error:', err)
    return {
      code: -1,
      message: err.message || '删除失败',
      data: null
    }
  }
}