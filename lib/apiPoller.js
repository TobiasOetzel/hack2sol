const lightStateChangeEmitter = require('./lightStateChangeEmitter')
const SENSOR = {
  SENSOR_ALTERNATE_ID: 'bulb2',
  CAPABILITY_ALTERNATE_ID: 'bulbState'
}

module.exports = {
  init: function (hueApi, iotService) {
    lightStateChangeEmitter.on('change', function (allLightsResponse) {
      if (iotService) {
        iotService.publish(
          SENSOR.SENSOR_ALTERNATE_ID,
          SENSOR.CAPABILITY_ALTERNATE_ID,
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

    if (iotService) {
      iotService.connect(function () {
        pollApi()
      })
    } else {
      pollApi()
    }
  }
}
