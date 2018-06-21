const request = require('')

class IotServiceRestClient {
  constructor (user, password, deviceId) {
    this.user = user
    this.password = password
    this.deviceId = deviceId
  }

  createSensor (sensorId) {
    return this._iotRequest(`sensors`, {
      'deviceId': this.deviceId,
      // sensore type = 'bulb'
      'sensorTypeId': '95ae50f0-da91-47c9-8013-40ae18099800',
      'name': sensorId,
      'alternateId': sensorId
    }, 'POST')
  }

  _iotRequest (path, payload, method) {
    let options = {
      method: method || 'GET',
      json: true,
      'auth': {
        'user': this.user,
        'pass': this.password
      }
    }
    if (payload) {
      options.body = JSON.stringify(payload)
    }
    return request(`https://47f584a3-765d-4503-a5ba-37f922a2c222.eu10.cp.iot.sap/iot/core/api/v1/${path}`, options)
  }
}

module.exports = IotServiceRestClient
