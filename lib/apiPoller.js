const LightStateChangeEmitter = require('./LightStateChangeEmitter')
const SENSOR = {
  CAPABILITY_ALTERNATE_ID: 'bulbState'
}

module.exports = {
  init: async function (hueApi, iotServiceMqtt, iotServiceRestClient) {
    let sensors = await iotServiceRestClient.getSensors()

    async function createMissingLights () {
      let lights = await (await hueApi.lights()).lights
      let allSensorCreations = []
      lights.forEach((light) => {
        let hasSensor = sensors.some(sensor => sensor.alternateId === light.uniqueid)
        if (!hasSensor) {
          allSensorCreations.push(iotServiceRestClient.createSensor(light.uniqueid))
        }
      })
      await Promise.all(allSensorCreations)
    }

    await createMissingLights()

    const lightStateChangeEmitter = new LightStateChangeEmitter(sensors, hueApi)

    lightStateChangeEmitter.on('newLight', function () {
      createMissingLights()
    })

    lightStateChangeEmitter.on('reachableStateChanged', function (allLightsResponse) {
      allLightsResponse.forEach((light) => {
        let sensorAlternateId = light.uniqueid
        let stateToSend = {
          reachable: light.state.reachable
        }
        let logMessage = `light state change detected sending ${sensorAlternateId} and ${SENSOR.CAPABILITY_ALTERNATE_ID} and state ${JSON.stringify(stateToSend)}`

        if (iotServiceMqtt) {
          iotServiceMqtt.publish(
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

    if (iotServiceMqtt) {
      iotServiceMqtt.connect(function () {
        pollApi()
      })
    } else {
      pollApi()
    }
  }
}
