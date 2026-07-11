const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    const { imageUrl, reading, confidence, meterType = 'water', meterNumber, location, notes, status = 'pending' } = event

    console.log('[createMeterRecord] openid:', openid, 'reading:', reading, 'meterType:', meterType)

    // 创建记录
    const result = await db.collection('meter_records').add({
      data: {
        _openid: openid,
        imageUrl,
        reading,
        confidence,
        meterType,
        meterNumber: meterNumber || '',
        timestamp: db.serverDate(),
        location: location || '',
        notes: notes || '',
        status
      }
    })

    console.log('[createMeterRecord] created:', result._id)

    return {
      code: 0,
      message: 'success',
      data: { recordId: result._id }
    }
  } catch (err) {
    console.error('[createMeterRecord] error:', err)
    return {
      code: -1,
      message: err.message || '创建失败',
      data: null
    }
  }
}