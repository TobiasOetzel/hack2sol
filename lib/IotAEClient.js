const request = require('request-promise-native')
const credentials = require('../credentials')

class IotAEClient {
  getThings () {
    return this._iotAERequest('Things')
  }
  createThing (uid) {
    console.log(`creating thing ${uid}`)
    return this._iotAERequest('Things', {
      '_thingType': ['hack2sol.team0.hack2sol.ateam:bulb'],
      '_description': {
        en: uid
      },
      '_alternateId': uid,
      '_name': uid,
      '_objectGroup': '858F754DBE104D25BA4A9A6D5D170E6F',
    }, 'POST')
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
  async _iotAERequest (path, payload, method) {
    let token
    try {
      let tokenResponse = await this._getToken()
      token = 'Bearer ' + JSON.parse(tokenResponse).access_token
    } catch (e) {
      throw e
    }
    let options = {
      method: method || 'GET',
      json: true,
      headers: {
        'Authorization': token
      }
    }
    if (payload) {
      options.body = payload
    }
    return request(`https://appiot-mds.cfapps.eu10.hana.ondemand.com/${path}`, options)
  }
}

module.exports = IotAEClient
