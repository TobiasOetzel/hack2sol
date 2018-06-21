const IoTService = require('./iotserviceMqtt')
const fs = require('fs')

module.exports = {
  create: function (tenantId, deviceId) {
    console.log(`creating an iotService with the tenant ${tenantId} and for the device ${deviceId}`)

    let iotService
    try {
      let IOT = {
        CERTIFICATE: {
          KEY: fs.readFileSync('./certificate/key', 'utf8'),
          CERT: fs.readFileSync('./certificate/cert', 'utf8'),
          PASSPHRASE: fs.readFileSync('./certificate/passphrase', 'utf8')
        }
      }
      iotService = new IoTService(tenantId, deviceId, IOT.CERTIFICATE.KEY, IOT.CERTIFICATE.CERT, IOT.CERTIFICATE.PASSPHRASE)
    } catch (e) {
      console.log(e)
    }
    return iotService
  }
}
