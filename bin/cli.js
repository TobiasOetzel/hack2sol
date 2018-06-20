const { start } = require('../app')
const { startFakeHueBridge } = require('../mock/fakeHueBridge')
const argv = require('yargs')
  .option('hueIp', {
    alias: 'b',
    describe: 'the ip of the hue bridge',
    default: '192.168.8.101'
  }).option('hueUser', {
    alias: 'u',
    describe: 'the hue user',
    default: 'FUVve1na8CMxo23JJZdXpimguQS36od5hVkwDz2Q'
  }).option('huePort', {
    alias: 'p',
    describe: 'the port of the hue bridge',
    default: '80'
  }).option('deviceId', {
    alias: 'd',
    describe: 'the alternate id of the iotservice device',
    default: 'Hack2Sol_A-Team'
  }).option('tenantId', {
    alias: 't',
    describe: 'the subaccount tenant',
    default: '47f584a3-765d-4503-a5ba-37f922a2c222'
  }).option('mock', {
    alias: 'm',
    describe: 'mocks the hue bridge - do not specify huePort and hueIp when using this',
    default: false
  }).argv

let hueIp = argv.hueIp
let huePort = argv.huePort
let user = argv.hueUser

if (argv.mock) {
  huePort = 3000
  hueIp = '127.0.0.1'
  startFakeHueBridge(user)
}

start({
  hueConfig: {
    ip: hueIp,
    user: user,
    port: huePort
  },
  iotService: {
    deviceId: argv.deviceId,
    tenantId: argv.tenantId
  }
})
