const request = require('request-promise-native')
const credentials = require('../credentials')

class IotAEClient {
  getThings () {
    return this._iotAEMdsRequest('Things')
  }
  createThing (uid) {
    console.log(`creating thing ${uid}`)
    return this._iotAEMdsRequest('Things', {
      '_thingType': ['hack2sol.team0.hack2sol.ateam:bulb'],
      '_description': {
        en: uid
      },
      '_alternateId': uid,
      '_name': uid,
      '_objectGroup': '858F754DBE104D25BA4A9A6D5D170E6F'
    }, 'POST')
  }
  getSensorMapping (uid) {
    return this._mappingRequest(`mappings/sensorthing?thingId=${uid}`)
  }
  getSensors () {
    return this._mappingRequest(`sensors`)
  }
  async createSensorMapping (uid, thingId) {
    let sensors = await this.getSensors()
    let foundSensor = sensors.find(sensor => sensor.NAME === uid)
    let sensorId = foundSensor.ID
    console.log(`creating sensor mapping for ${thingId} and sensor id ${sensorId}`)
    return this._mappingRequest(`mappings/sensorthing`, [
      {
        'thingId': thingId,
        'sensorId': sensorId
      }
    ], 'POST')
  }
  getHierarchyElements () {
    return this._iotAEThingHierarchyRequest(`ThingHierarchy/v1/ThingHierarchies('A3CB03F0B166D51216000B02288EC14B')?$expand=ThingHierarchyElements`)
  }

  _getToken () {
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    return request('https://hack2sol-team0.authentication.eu10.hana.ondemand.com/oauth/token', {
      form: {
        'grant_type': 'client_credentials',
        'response_type': 'token',
        'client_id': credentials.iotAeUser,
        'client_secret': credentials.iotAePassword
      },
      method: 'POST',
      headers: headers
    })
  }
  async _mappingRequest (path, payload, method) {
    return this._iotAERequest(`https://tm-data-mapping.cfapps.eu10.hana.ondemand.com/${path}`, payload, method)
  }
  async _iotAEMdsRequest (path, payload, method) {
    return this._iotAERequest(`https://appiot-mds.cfapps.eu10.hana.ondemand.com/${path}`, payload, method)
  }
  async _iotAEThingHierarchyRequest (path, payload, method) {
    return this._iotAERequest(`https://appiot-thing-hierarchy.cfapps.eu10.hana.ondemand.com/${path}`, payload, method)
  }
  async _refreshToken () {
    let tokenResponse = await this._getToken()
    this.token = 'Bearer ' + JSON.parse(tokenResponse).access_token

    // just refresh the token every minute so it does not expire
    setTimeout(async () => {
      await this._refreshToken()
    }, 60000)
  }
  async _iotAERequest (url, payload, method) {
    if (!this.token) {
      await this._refreshToken()
    }
    let options = {
      method: method || 'GET',
      json: true,
      headers: {
        'Authorization': this.token
      }
    }
    if (payload) {
      options.body = payload
    }
    return request(url, options)
  }
}

module.exports = IotAEClient
