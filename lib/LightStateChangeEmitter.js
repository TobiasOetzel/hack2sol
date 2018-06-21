const EventEmitter = require('events')

function lightsAreEqual (light1, light2) {
  return light1.state.reachable === light2.state.reachable
}

class LightChangeEmitter extends EventEmitter {
  constructor (currentSensors) {
    super(arguments)
    this.currentSensors = currentSensors
    this.currentLightState = []
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

  _emitReachableStateChanged (allLightsResponse) {
    this.currentLightState = allLightsResponse
    this.emit('reachableStateChanged', allLightsResponse)
  }
}

module.exports = LightChangeEmitter
