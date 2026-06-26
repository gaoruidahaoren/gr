const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const { id, name, formula, unitPrice, description, isDefault } = event

    console.log('[updateCalculationRule] openid:', openid, 'id:', id)

    // 构建更新数据
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (formula !== undefined) updateData.formula = formula
    if (unitPrice !== undefined) updateData.unitPrice = unitPrice
    if (description !== undefined) updateData.description = description
    if (isDefault !== undefined) {
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
      updateData.isDefault = isDefault
    }

    // 更新规则（需验证所有权）
    const result = await db.collection('calculation_rules')
      .where({
        _id: id,
        _openid: openid
      })
      .update({
        data: updateData
      })

    console.log('[updateCalculationRule] updated:', result.stats.updated)

    return {
      code: 0,
      message: 'success',
      data: { success: result.stats.updated > 0 }
    }
  } catch (err) {
    console.error('[updateCalculationRule] error:', err)
    return {
      code: -1,
      message: err.message || '更新失败',
      data: null
    }
  }
}