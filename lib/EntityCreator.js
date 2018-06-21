class EntityCreator {
  constructor (hueApi, iotServiceRestClient, iotAEClient) {
    this.hueApi = hueApi
    this.iotServiceRestClient = iotServiceRestClient
    this.iotAEClient = iotAEClient
  }
  async createMissingEntities () {
    let lights = await (await this.hueApi.lights()).lights
    lights.forEach((light) => {
      // ae service does not like the ':' character
      light.uniqueid = light.uniqueid.replace(/:/g, '')
    })
    // create in the iot service first
    await this._createMissingLights(lights)
    // then ar service so the mappings to the iot service can be created
    await this._createMissingThings(lights)
  }

  async _createMissingLights (lights) {
    let sensors = await this.iotServiceRestClient.getSensors()
    let allSensorCreations = []
    lights.forEach((light) => {
      let hasSensor = sensors.some(sensor => sensor.alternateId === light.uniqueid)
      if (!hasSensor) {
        allSensorCreations.push(this.iotServiceRestClient.createSensor(light.uniqueid))
      }
    })
    await Promise.all(allSensorCreations)
  }

  async _createMissingThings (lights) {
    let thingsResponse = await this.iotAEClient.getThings()
    let things = thingsResponse.value
    let allThingsCreations = []
    lights.forEach((light) => {
      let hasThing = things.some(thing => thing._alternateId === light.uniqueid)
      if (!hasThing) {
        allThingsCreations.push(this.iotAEClient.createThing(light.uniqueid))
      }
    })
    await Promise.all(allThingsCreations)
    console.log('all missing things are created')
    thingsResponse = await this.iotAEClient.getThings()
    things = thingsResponse.value
    let uidToThing = {}

    // things are created - reiterate the lights to create the sensor mappings + hierarchy
    let missingsSensors = []
    let missingHierarchies = []
    let sensorGets = []

    lights.forEach((light) => {
      let thingId = things.find((thing) => thing._alternateId === light.uniqueid)._id
      uidToThing[light.uniqueid] = thingId
      sensorGets.push(this.iotAEClient.getSensorMapping(thingId))
    })

    let hierarchieElements = (await this.iotAEClient.getHierarchyElements()).d.ThingHierarchyElements.results
    let sensorsMappings = await Promise.all(sensorGets)

    lights.forEach((light) => {
      let thingId = uidToThing[light.uniqueid]
      let hasSensormapping = sensorsMappings.some((mappings) => {
        return mappings.some((mapping) => {
          return mapping.THING_ID === thingId
        })
      })
      if (!hasSensormapping) {
        missingsSensors.push(light.uniqueid)
      }

      let hasHierarchy = hierarchieElements.some((element) => {
        return element.ThingID === light.uniqueid
      })
      if (!hasHierarchy) {
        missingHierarchies.push(light.uniqueid)
      }
    })

    let sensorsAndHierarchyCreations = []
    missingsSensors.forEach((uid) => {
      sensorsAndHierarchyCreations.push(this.iotAEClient.createSensorMapping(uid, uidToThing[uid]))
    })

    await Promise.all(sensorsAndHierarchyCreations)
  }
}

module.exports = EntityCreator
