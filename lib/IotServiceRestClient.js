const request = require('request-promise-native')

class IotServiceRestClient {
  constructor (user, password) {
    this.user = user
    this.password = password
    this.deviceId = '4'
  }

  getSensors () {
    return this._iotRequest(`sensors?deviceId=${this.deviceId}`)
  }

  createSensor (sensorId) {
    console.log(`creating sensor ${sensorId}`)
    return this._iotRequest(`sensors`, {
      'deviceId': this.deviceId,
      // sensor type = 'bulb'
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
      options.body = payload
    }
    return request(`https://47f584a3-765d-4503-a5ba-37f922a2c222.eu10.cp.iot.sap/iot/core/api/v1/${path}`, options)
  }
}

module.exports = IotServiceRestClient
