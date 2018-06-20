const { HueApi } = require('node-hue-api')
const lightStateChangeEmitter = require('./lightStateChangeEmitter')

const HUE_BRIDGE = {
  IP: '192.168.8.101',
  USER: 'FUVve1na8CMxo23JJZdXpimguQS36od5hVkwDz2Q'
}

const DEVICE = {
  ID: 'Hack2Sol_A-Team',
  SENSOR_ALTERNATE_ID: 'bulb2',
  CAPABILITY_ALTERNATE_ID: 'bulbState'
}

const iotService = require('./iotServiceFactory').create(DEVICE.ID)
const hueApi = new HueApi(HUE_BRIDGE.IP, HUE_BRIDGE.USER)

lightStateChangeEmitter.on('change', function (allLightsResponse) {
  if (iotService) {
    iotService.publish(
      DEVICE.SENSOR_ALTERNATE_ID,
      DEVICE.CAPABILITY_ALTERNATE_ID,
      {
        reachable: true
      })
    console.log(`published light state change to iot service `)
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
