const lightStateChangeEmitter = require('./lightStateChangeEmitter')
const SENSOR = {
  CAPABILITY_ALTERNATE_ID: 'bulbState'
}

let bulbToSensorId = {}

bulbToSensorId['1'] = 'bulb1'
bulbToSensorId['2'] = 'bulb2'

module.exports = {
  init: function (hueApi, iotService) {
    lightStateChangeEmitter.on('change', function (allLightsResponse) {
      allLightsResponse.forEach((light) => {
        let sensorAlternateId = bulbToSensorId[light.id]
        let stateToSend = {
          reachable: light.state.reachable
        }
        let logMessage = `light state change detected sending ${sensorAlternateId} and ${SENSOR.CAPABILITY_ALTERNATE_ID} and state ${JSON.stringify(stateToSend)}`

        if (iotService) {
          iotService.publish(
            sensorAlternateId,
            SENSOR.CAPABILITY_ALTERNATE_ID,
            stateToSend)
          logMessage += ' published to iot service'
        }
        console.log(logMessage)
      })
      console.log('light state change detected')
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
