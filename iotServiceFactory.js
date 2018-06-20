const IoTService = require('./iotservice')
const fs = require('fs')

module.exports = {
  create: function (deviceId) {
    let iotService
    try {
      let IOT = {
        TENANT_ID: 'hack2sol-master',
        CERTIFICATE: {
          KEY: fs.readFileSync('./certificate/key', 'utf8'),
          CERT: fs.readFileSync('./certificate/cert', 'utf8'),
          PASSPHRASE: fs.readFileSync('./certificate/passphrase', 'utf8')
        }
      }
      iotService = new IoTService(IOT.TENANT_ID, deviceId, IOT.CERTIFICATE.KEY, IOT.CERTIFICATE.CERT, IOT.CERTIFICATE.PASSPHRASE)
    } catch (e) {
      console.log(e)
    }
    return iotService
  }
}
