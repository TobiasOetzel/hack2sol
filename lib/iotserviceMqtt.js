const mqtt = require('mqtt')

class IotserviceMqtt {
  constructor (tenant, deviceId, key, cert, passphrase) {
    this.tenant = tenant
    this.deviceId = deviceId
    this.key = key
    this.cert = cert
    this.passphrase = passphrase
  }

  connect (cb) {
    if (!this.client) {
      this.client = mqtt.connect({
        host: `${this.tenant}.eu10.cp.iot.sap`,
        port: 8883,
        clientId: this.deviceId,
        protocol: 'mqtts',
        key: this.key,
        cert: this.cert,
        passphrase: this.passphrase
      })

      this.client.on('connect', () => {
        console.log('connected')
        if (cb) { cb() }
      })
    }
  }

  publish (sensorAlternateID, capabilityAlternateID, measures) {
    let payload = {
      'capabilityAlternateId': capabilityAlternateID,
      'sensorAlternateId': sensorAlternateID,
      'measures': measures
    }

    let topic = `measures/${this.deviceId}`
    this.client.publish(topic, JSON.stringify(payload))

    console.log(`sent: , ${JSON.stringify(payload)} to ${topic}`)
  }
}

module.exports = IotserviceMqtt
