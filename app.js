const Hue = require('./hue')
const IoTService = require('./iotservice')

const fs = require('fs')

const HUE_BRIDGE = {
  IP: '192.168.8.101',
  USER: 'FUVve1na8CMxo23JJZdXpimguQS36od5hVkwDz2Q'
}

const IOT = {
  TENANT_ID: 'hack2sol-master',
  CERTIFICATE: {
    KEY: fs.readFileSync('./certificate/key', 'utf8'),
    CERT: fs.readFileSync('./certificate/cert', 'utf8'),
    PASSPHRASE: fs.readFileSync('./certificate/passphrase', 'utf8')
  }
}

const DEVICE = {
  ID: 'f833f3c1-ea3e-4681-b865-1d18e80c026e',
  SENSOR_ALTERNATE_ID: '2482d776-4d37-43c4-93a0-bad9638ccdd1',
  CAPABILITY_ALTERNATE_ID: 'bfebef751b9bf768'
}

function getMeasure () {
  return {
    'on': true,
    'bri': 255,
    'hue': 30000,
    'sat': 200,
    'reachable': true
  }
}

function main () {
// eslint-disable-next-line no-new
  new Hue(HUE_BRIDGE.IP, HUE_BRIDGE.USER)
  let iotService = new IoTService(IOT.TENANT_ID, DEVICE.ID, IOT.CERTIFICATE.KEY, IOT.CERTIFICATE.CERT, IOT.CERTIFICATE.PASSPHRASE)

  iotService.connect(function () {
    setInterval(function () {
      iotService.publish(DEVICE.ID, DEVICE.SENSOR_ALTERNATE_ID, DEVICE.CAPABILITY_ALTERNATE_ID,
                [getMeasure()]
            )
    }, 1000)
  })
}

main()
