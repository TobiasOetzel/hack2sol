const { HueApi } = require('node-hue-api')
const { init } = require('./lib/apiPoller')
const { create } = require('./lib/iotServiceFactory')

module.exports = {
  start: function (options) {
    const hueConfig = options.hueConfig
    const iotServiceConfig = options.iotService

    const iotService = create(iotServiceConfig.tenantId, iotServiceConfig.deviceId)
    console.log(`using the hue api on ${hueConfig.ip}:${hueConfig.port}, with the user ${hueConfig.user}`)
    const hueApi = new HueApi(hueConfig.ip, hueConfig.user, /* timeout - default = */ 0, hueConfig.port)

    init(hueApi, iotService)
  }
}
