const LightStateChangeEmitter = require('../lib/LightStateChangeEmitter')
const sinon = require('sinon')

function createResponse () {
  return [
    {uniqueid: '1', state: {}},
    {uniqueid: '2', state: {}}
  ]
}

describe('the light change emitter', function () {
  beforeEach(function () {
    this.lightStateChangeEmitter = new LightStateChangeEmitter()
    this.hueLightsResponse = createResponse()
  })

  it('fires a change event', function () {
    let eventSpy = sinon.spy()

    this.lightStateChangeEmitter.once('reachableStateChanged', eventSpy)

    this.lightStateChangeEmitter.updateState(this.hueLightsResponse)

    sinon.assert.calledWith(eventSpy, this.hueLightsResponse)
  })

  describe('with 2 lights as a new state', function () {
    beforeEach(function () {
      this.lightStateChangeEmitter.updateState(this.hueLightsResponse)

      this.eventSpy = sinon.spy()
      this.lightStateChangeEmitter.once('reachableStateChanged', this.eventSpy)
    })

    it('does not fire an event if the state is the same', function () {
      // Act
      this.lightStateChangeEmitter.updateState(this.hueLightsResponse)

      sinon.assert.notCalled(this.eventSpy)
    })

    it('fires the event if one light is gone from the state', function () {
      let newState = [ this.hueLightsResponse[0] ]
      this.lightStateChangeEmitter.updateState(newState)

      sinon.assert.calledWith(this.eventSpy, newState)
    })

    it('first the event if one item is added to the state', function () {
      let newState = [ this.hueLightsResponse[0], this.hueLightsResponse[1], this.hueLightsResponse[0] ]
      this.lightStateChangeEmitter.updateState(newState)

      sinon.assert.calledWith(this.eventSpy, newState)
    })

    describe('reachable status', function () {
      it('fires a change event when one light is reachable', function () {
        // Arrange
        let newState = createResponse()
        newState[0].state.reachable = true

        // Act
        this.lightStateChangeEmitter.updateState(newState)

        // Assert
        sinon.assert.calledWith(this.eventSpy, newState)
      })
    })
  })
})
