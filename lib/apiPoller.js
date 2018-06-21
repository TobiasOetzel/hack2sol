const LightStateChangeEmitter = require('./LightStateChangeEmitter')
const IotAEClient = require('./IotAEClient')
const EntityCreator = require('./EntityCreator')
const iotAEClient = new IotAEClient()
const SENSOR = {
  CAPABILITY_ALTERNATE_ID: 'bulbState'
}

module.exports = {
  init: async function (hueApi, iotServiceMqtt, iotServiceRestClient) {
    let entityCreator = new EntityCreator(hueApi, iotServiceRestClient, iotAEClient)

    await entityCreator.createMissingEntities()

    const lightStateChangeEmitter = new LightStateChangeEmitter(await iotServiceRestClient.getSensors(), hueApi)

    lightStateChangeEmitter.on('newLight', function () {
      entityCreator.createMissingEntities()
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
