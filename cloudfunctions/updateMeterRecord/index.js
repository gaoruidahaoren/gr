const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const { id, reading, notes, status } = event

    console.log('[updateMeterRecord] openid:', openid, 'id:', id)

    // 构建更新数据
    const updateData = {}
    if (reading !== undefined) updateData.reading = reading
    if (notes !== undefined) updateData.notes = notes
    if (status !== undefined) updateData.status = status

    // 更新记录（需验证所有权）
    const result = await db.collection('meter_records')
      .where({
        _id: id,
        _openid: openid
      })
      .update({
        data: updateData
      })

    console.log('[updateMeterRecord] updated:', result.stats.updated)

    return {
      code: 0,
      message: 'success',
      data: { success: result.stats.updated > 0 }
    }
  } catch (err) {
    console.error('[updateMeterRecord] error:', err)
    return {
      code: -1,
      message: err.message || '更新失败',
      data: null
    }
  }
}