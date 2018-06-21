const express = require('express')
const lights = require('./data/lights')
const morgan = require('morgan')

function startMonkey (bulbId, reachable) {
  lights[bulbId].state.reachable = reachable
  let zeroToTenSeconds = Math.floor(Math.random() * 10000) + 1
  setTimeout(function () {
    startMonkey(bulbId, !reachable)
  }, zeroToTenSeconds)
}

module.exports = {
  startFakeHueBridge: function (user, useChaosMonkey) {
    const app = express()
    app.use(morgan('tiny'))

    if (useChaosMonkey) {
      startMonkey('1', true)
      startMonkey('2', true)
    }

    app.get(`/api/${user}/lights`, function (req, res) {
      res.json(lights)
    })

    app.post(`/api/${user}/lights`, function (req, res) {
      res.json({})
    })

    app.get(`/api/${user}/lights/new`, function (req, res) {
      res.json({
        lastscan: 'active'
      })
    })

    return new Promise((resolve) => {
      app.listen(3000, function () {
        console.log('fake hue app started on port 3000')
        resolve(app)
      })
    })
  }
}
