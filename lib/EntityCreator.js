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

    let sensors = await this.iotServiceRestClient.getSensors()

    let alreadyMappedSensorIds = []
    for (let thing of things) {
      let sensorMappings = await this.iotAEClient.getSensorMapping(thing._id)
      let sensorId
      sensorMappings.some((mapping) => {
        let hasSensor = sensors.some((sensor) => sensor.deviceId === '4' && sensor.id === mapping.SENSOR_ID)
        if (hasSensor) {
          sensorId = mapping.SENSOR_ID
        }
        return hasSensor
      })

      if (sensorId) {
        alreadyMappedSensorIds.push(sensorId)
        console.log(`sensor ${sensorId} is already mapped`)
      }
    }

    let alreadyMappedSensors = alreadyMappedSensorIds.map((sensorId) => sensors.find((sensor) => sensor.id === sensorId))
    let lightsWithoutSensors = lights.filter((light) => {
      return !alreadyMappedSensors.some((sensor) => {
        return sensor.alternateId === light.uniqueid
      })
    })
    console.log(`found lights that have no sensors mapped ${lightsWithoutSensors.map(light => light.uniqueid).join(',')}`)
    for (let light of lightsWithoutSensors) {
      let hasThing = things.some(thing => thing._alternateId === light.uniqueid)
      if (!hasThing) {
        allThingsCreations.push(this.iotAEClient.createThing(light.uniqueid))
      }
    }

    await Promise.all(allThingsCreations)
    console.log('all missing things are created')
    thingsResponse = await this.iotAEClient.getThings()
    things = thingsResponse.value
    let uidToThing = {}

    // things are created - reiterate the lightsWithoutSensors to create the sensor mappings + hierarchy
    let missingSensors = []
    let missingHierarchies = []
    let sensorGets = []

    lightsWithoutSensors.forEach((light) => {
      let thing = things.find((thing) => thing._alternateId === light.uniqueid)
      if (!thing) {
        // thing has an already connected sensor
        return
      }
      let thingId = thing._id

      uidToThing[light.uniqueid] = thingId
      sensorGets.push(this.iotAEClient.getSensorMapping(thingId))
    })

    let hierarchieElements = (await this.iotAEClient.getHierarchyElements()).d.ThingHierarchyElements.results
    let sensorsMappings = await Promise.all(sensorGets)

    lightsWithoutSensors.forEach((light) => {
      let thing = things.find((thing) => thing._alternateId === light.uniqueid)
      if (!thing) {
        // thing has an already connected sensor
        return
      }

      let thingId = uidToThing[light.uniqueid]
      let hasSensormapping = sensorsMappings.some((mappings) => {
        return mappings.some((mapping) => {
          return mapping.THING_ID === thingId
        })
      })
      if (!hasSensormapping) {
        missingSensors.push(light.uniqueid)
      }

      let hasHierarchy = hierarchieElements.some((element) => {
        return element.ThingID === light.uniqueid
      })
      if (!hasHierarchy) {
        missingHierarchies.push(light.uniqueid)
      }
    })

    let sensorsAndHierarchyCreations = []
    missingSensors.forEach((uid) => {
      sensorsAndHierarchyCreations.push(this.iotAEClient.createSensorMapping(uid, uidToThing[uid]))
    })

    await Promise.all(sensorsAndHierarchyCreations)
  }
}

module.exports = EntityCreator
