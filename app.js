const { HueApi } = require('node-hue-api')
const lightStateChangeEmitter = require('./lightStateChangeEmitter')

const HUE_BRIDGE = {
  IP: '192.168.8.101',
  USER: 'FUVve1na8CMxo23JJZdXpimguQS36od5hVkwDz2Q'
}

const DEVICE = {
  ID: 'f833f3c1-ea3e-4681-b865-1d18e80c026e',
  SENSOR_ALTERNATE_ID: '2482d776-4d37-43c4-93a0-bad9638ccdd1',
  CAPABILITY_ALTERNATE_ID: 'bfebef751b9bf768'
}

const iotService = require('./iotServiceFactory').create(DEVICE.ID)
const hueApi = new HueApi(HUE_BRIDGE.IP, HUE_BRIDGE.USER)

lightStateChangeEmitter.on('change', function (allLightsResponse) {
  if (iotService) {
    iotService.publish(
      DEVICE.SENSOR_ALTERNATE_ID,
      DEVICE.CAPABILITY_ALTERNATE_ID,
      {})
  } else {
    console.log('light state change detected')
  }
})

async function pollApi () {
  lightStateChangeEmitter.updateState((await hueApi.lights()).lights)

  setTimeout(async function () {
    pollApi()
  }, 1000)
}

function main () {
  if (iotService) {
    iotService.connect(function () {
      pollApi()
    })
  } else {
    pollApi()
  }
}

main()
