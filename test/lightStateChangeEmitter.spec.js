const lightStateChangeEmitter = require('../lightStateChangeEmitter')
const sinon = require('sinon')

function createResponse () {
  return [
    {id: '1', state: {}},
    {id: '2', state: {}}
  ]
}

describe('the light change emitter', function () {
  beforeEach(function () {
    this.hueLightsResponse = createResponse()
  })

  afterEach(function () {
    lightStateChangeEmitter.updateState([])
  })

  it('fires a change event', function () {
    let eventSpy = sinon.spy()

    lightStateChangeEmitter.once('change', eventSpy)

    lightStateChangeEmitter.updateState(this.hueLightsResponse)

    sinon.assert.calledWith(eventSpy, this.hueLightsResponse)
  })

  describe('with 2 lights as a new state', function () {
    beforeEach(function () {
      lightStateChangeEmitter.updateState(this.hueLightsResponse)

      this.eventSpy = sinon.spy()
      lightStateChangeEmitter.once('change', this.eventSpy)
    })

    it('does not fire an event if the state is the same', function () {
      // Act
      lightStateChangeEmitter.updateState(this.hueLightsResponse)

      sinon.assert.notCalled(this.eventSpy)
    })

    it('fires the event if one light is gone from the state', function () {
      let newState = [ this.hueLightsResponse[0] ]
      lightStateChangeEmitter.updateState(newState)

      sinon.assert.calledWith(this.eventSpy, newState)
    })

    it('first the event if one item is added to the state', function () {
      let newState = [ this.hueLightsResponse[0], this.hueLightsResponse[1], this.hueLightsResponse[0] ]
      lightStateChangeEmitter.updateState(newState)

      sinon.assert.calledWith(this.eventSpy, newState)
    })

    describe('reachable status', function () {
      it('fires a change event when one light is reachable', function () {
        // Arrange
        let newState = createResponse()
        newState[0].state.reachable = true

        // Act
        lightStateChangeEmitter.updateState(newState)

        // Assert
        sinon.assert.calledWith(this.eventSpy, newState)
      })
    })
  })
})
