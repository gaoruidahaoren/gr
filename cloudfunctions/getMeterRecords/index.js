const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const { limit = 20, skip = 0 } = event

    console.log('[getMeterRecords] openid:', openid, 'limit:', limit, 'skip:', skip)

    // 查询用户的记录
    const result = await db.collection('meter_records')
      .where({
        _openid: openid
      })
      .orderBy('timestamp', 'desc')
      .skip(skip)
      .limit(limit)
      .get()

    console.log('[getMeterRecords] found:', result.data.length)

    return {
      code: 0,
      message: 'success',
      data: {
        records: result.data,
        total: result.data.length
      }
    }
  } catch (err) {
    console.error('[getMeterRecords] error:', err)
    return {
      code: -1,
      message: err.message || '查询失败',
      data: null
    }
  }
}