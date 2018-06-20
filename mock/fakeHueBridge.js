const express = require('express')
const lights = require('./data/lights')
const morgan = require('morgan')

module.exports = {
  startFakeHueBridge: function (user) {
    const app = express()
    app.use(morgan('tiny'))

    app.get(`/api/${user}/lights`, function (req, res) {
      res.json(lights)
    })

    return new Promise((resolve) => {
      app.listen(3000, function () {
        console.log('fake hue app started on port 3000')
        resolve(app)
      })
    })
  }
}
