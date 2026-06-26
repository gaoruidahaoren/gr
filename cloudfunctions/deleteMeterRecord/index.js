const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const { id } = event

    console.log('[deleteMeterRecord] openid:', openid, 'id:', id)

    // 删除记录（需验证所有权）
    const result = await db.collection('meter_records')
      .where({
        _id: id,
        _openid: openid
      })
      .remove()

    console.log('[deleteMeterRecord] removed:', result.stats.removed)

    return {
      code: 0,
      message: 'success',
      data: { success: result.stats.removed > 0 }
    }
  } catch (err) {
    console.error('[deleteMeterRecord] error:', err)
    return {
      code: -1,
      message: err.message || '删除失败',
      data: null
    }
  }
}