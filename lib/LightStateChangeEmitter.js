const EventEmitter = require('events')

function lightsAreEqual (light1, light2) {
  return light1.state.reachable === light2.state.reachable
}

class LightChangeEmitter extends EventEmitter {
  constructor (currentSensors, hueApi) {
    super(arguments)
    this.currentSensors = currentSensors
    this.currentLightState = []
    this._searchForNewLights(hueApi)
  }

  updateState (lightsReponse) {
    if (lightsReponse.length !== this.currentLightState.length) {
      this._emitReachableStateChanged(lightsReponse)
    }

    for (let lightOfNewState of lightsReponse) {
      let lightInCurrentState = this.currentLightState.find(light => light.uniqueid === lightOfNewState.uniqueid)
      if (!lightInCurrentState) {
        this._emitReachableStateChanged(lightsReponse)
        return
      }

      if (!lightsAreEqual(lightInCurrentState, lightOfNewState)) {
        this._emitReachableStateChanged(lightsReponse)
        return
      }
    }
  }

  async _searchForNewLights (hueApi) {
    await hueApi.searchForNewLights()
    console.log('starting new scan for lights')

    const pollForScanDone = async function () {
      let newLights = await hueApi.newLights()
      if (newLights.lastscan === 'active') {
        setTimeout(async function () {
          pollForScanDone()
        }, 500)
      } else {
        if (Object.keys(newLights).length > 1) {
          this.emit('newLight')
        }
        console.log(`scan is done ${JSON.stringify(newLights, null, 3)}`)
        this._searchForNewLights(hueApi)
      }
    }.bind(this)

    return pollForScanDone()
  }

  _emitReachableStateChanged (allLightsResponse) {
    this.currentLightState = allLightsResponse
    this.emit('reachableStateChanged', allLightsResponse)
  }
}

module.exports = LightChangeEmitter
