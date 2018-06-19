const request = require('request')

class Hue {
  constructor (ip, user) {
    this.api = `http://${ip}/api/${user}`
  }

  getColors () {
    return {
      RED: [0.7006, 0.2993],
      GREEN: [0.1724, 0.7468],
      BLUE: [0.1355, 0.03988],
      WHITE: [0.3227, 0.329],
      WHITE_RELAXED: [0.4281, 0.4009]
    }
  }

  getLights (cb) {
    this._apiGet('/lights/', cb)
  }

  setLightState (light, lightState, cb) {
    this._apiPut(`/lights/${light}/state`, lightState, cb)
  }

  setAllLightState (lightState, cb) {
    this._apiPut('/groups/0/action', lightState, cb)
  }

  turnAllOn (lightState, cb) {
    this.setAllLightState({
      on: true
    }, cb)
  }

  turnAllOff (lightState, cb) {
    this.setAllLightState({
      on: false
    }, cb)
  }

  setColor (xyColor, bri, cb) {
    this.setAllLightState({
      bri: bri || 254,
      xy: xyColor,
      transitiontime: 0
    }, () => {
      if (cb) { cb() }
    })
  }

  fadeAllTo (xyColor, ms = 1000, bri = 254, cb) {
    this.setAllLightState({
      bri,
      xy: xyColor,
      transitiontime: ms / 100
    }, () => {
      setTimeout(() => {
        if (cb) { cb() }
      }, ms)
    })
  }

  /* http helper functions */
  _apiGet (path, cb) {
    const url = this.api + path
    request.get({
      url,
      json: true
    }, (err, res) => {
      if (cb) { err ? cb(err) : cb(null, res.body) }
    })
  }

  _apiPut (path, payload, cb) {
    const url = this.api + path
    request.put({
      url,
      json: true,
      body: payload
    }, (err, res) => {
      if (cb) { err ? cb(err) : cb(null, res.body) }
    })
  }

  getXYFromRGB (red, green, blue) {
    // Gamma correction
    red = (red > 0.04045) ? (red + 0.055) / (1.0 + 0.055) ** 2.4 : (red / 12.92)
    green = (green > 0.04045) ? (green + 0.055) / (1.0 + 0.055) ** 2.4 : (green / 12.92)
    blue = (blue > 0.04045) ? (blue + 0.055) / (1.0 + 0.055) ** 2.4 : (blue / 12.92)

    // Apply wide gamut conversion D65
    const X = red * 0.664511 + green * 0.154324 + blue * 0.162028
    const Y = red * 0.283881 + green * 0.668433 + blue * 0.047685
    const Z = red * 0.000088 + green * 0.072310 + blue * 0.986039

    let fx = X / (X + Y + Z)
    let fy = Y / (X + Y + Z)

    if (isNaN(fx)) { fx = 0.0 }
    if (isNaN(fy)) { fy = 0.0 }

    return [parseFloat(fx.toPrecision(4)), parseFloat(fy.toPrecision(4))]
  }
}

module.exports = Hue
