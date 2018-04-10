var request = require('request');
 
function Hue(ip, user) {
    this.api = "http://" + ip + "/api/" + user;
};
 
Hue.prototype.COLOR_XY = {
    RED: [0.7006, 0.2993],
    GREEN: [0.1724, 0.7468],
    BLUE: [0.1355, 0.03988],
    WHITE: [0.3227, 0.329],
    WHITE_RELAXED: [0.4281, 0.4009]
};
 
Hue.prototype.getLights = function (cb) {
    this._api_get("/lights/", cb);
};
 
Hue.prototype.setLightState = function (light, lightState) {
    this._api_put("/lights/" + light + "/state", lightState, cb);
};
 
Hue.prototype.setAllLightState = function (lightState, cb) {
    this._api_put("/groups/0/action", lightState, cb);
};
 
Hue.prototype.turnAllOn = function (lightState) {
    this.setAllLightState({
        on: true
    });
};
 
Hue.prototype.turnAllOff = function (lightState) {
    this.setAllLightState({
        on: false
    });
};
 
Hue.prototype.setColor = function (xyColor, bri, cb) {
    this.setAllLightState({
        bri: bri || 254,
        xy: xyColor,
        transitiontime: 0
    }, function () {
        if (cb)
            cb();
    });
};
 
Hue.prototype.fadeAllTo = function (xyColor, ms, bri, cb) {
    bri = bri || 254;
    ms = ms || 1000;
 
    this.setAllLightState({
        bri: bri,
        xy: xyColor,
        transitiontime: ms / 100
    }, function () {
        setTimeout(function () {
            if (cb)
                cb();
        }, ms);
    });
};
 
 
/* http helper functions */
 
Hue.prototype._api_get = function (path, cb) {
    var url = this.api + path;
    request.get({
        url: url,
        json: true
    }, function (err, res) {
        if (cb)
            err ? cb(err) : cb(null, res.body);
    });
};
 
Hue.prototype._api_put = function (path, payload, cb) {
    var url = this.api + path;
    request.put({
        url: url,
        json: true,
        body: payload
    }, function (err, res) {
        if (cb)
            err ? cb(err) : cb(null, res.body);
    });
};
 
Hue.prototype.getXYFromRGB = function (red, green, blue) {
    //Gamma correction
    red = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
    green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
    blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);
 
    //Apply wide gamut conversion D65
    var X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
    var Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
    var Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
 
    var fx = X / (X + Y + Z);
    var fy = Y / (X + Y + Z);
 
    if (isNaN(fx))
        fx = 0.0;
    if (isNaN(fy))
        fy = 0.0;
 
    return [parseFloat(fx.toPrecision(4)), parseFloat(fy.toPrecision(4))];
}
 
module.exports = Hue;
 
 
 //test code
var HUE_BRIDGE_IP = '192.168.8.102';
var HUE_USER = '3DHj4Ynx6eqovFpksBUtPlUyOfQ15teZ-iljTpB-';
 
var hue = new Hue(HUE_BRIDGE_IP, HUE_USER);