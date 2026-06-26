const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const { name, formula, unitPrice, description, isDefault = false } = event

    console.log('[createCalculationRule] openid:', openid, 'name:', name)

    // 如果设置为默认，先取消其他默认规则
    if (isDefault) {
      await db.collection('calculation_rules')
        .where({
          _openid: openid,
          isDefault: true
        })
        .update({
          data: { isDefault: false }
        })
    }

    // 创建规则
    const result = await db.collection('calculation_rules').add({
      data: {
        _openid: openid,
        name,
        formula,
        unitPrice,
        description,
        isDefault,
        createdAt: db.serverDate()
      }
    })

    console.log('[createCalculationRule] created:', result._id)

    return {
      code: 0,
      message: 'success',
      data: { ruleId: result._id }
    }
  } catch (err) {
    console.error('[createCalculationRule] error:', err)
    return {
      code: -1,
      message: err.message || '创建失败',
      data: null
    }
  }
}