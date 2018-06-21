module.exports = {
  searchForNewLights: async function (hueApi) {
    await hueApi.searchForNewLights()

    async function pollForScanDone () {
      let newLights = await hueApi.newLights()
      if (newLights.lastscan === 'active') {
        console.log('scan is still active')
        setTimeout(async function () {
          pollForScanDone()
        }, 500)
      } else {
        console.log(`scan is done ${JSON.stringify(newLights, null, 3)}`)
      }
    }

    pollForScanDone()
  }
}
