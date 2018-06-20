const EventEmitter = require('events')

let currentLightsState = []

function emitChange (allLightsResponse) {
  currentLightsState = allLightsResponse
  lightStateChangeEmitter.emit('change', allLightsResponse)
}

function lightsAreEqual (light1, light2) {
  return light1.state.reachable === light2.state.reachable
}

class LightChangeEmitter extends EventEmitter {
  updateState (lightsReponse) {
    if (lightsReponse.length !== currentLightsState.length) {
      emitChange(lightsReponse)
    }

    for (let lightOfNewState of lightsReponse) {
      let lightInCurrentState = currentLightsState.find(light => light.id === lightOfNewState.id)
      if (!lightInCurrentState) {
        emitChange(lightsReponse)
        return
      }

      if (!lightsAreEqual(lightInCurrentState, lightOfNewState)) {
        emitChange(lightsReponse)
        return
      }
    }
  }
}

const lightStateChangeEmitter = new LightChangeEmitter()

module.exports = lightStateChangeEmitter
