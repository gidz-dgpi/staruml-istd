const istdMain = require('./istd/istd-main')
const repoMain = require('./repo/repo-main')

function init() {
    console.log(`appPath ${app.getAppPath()}`)
    console.log(`userPath ${app.getUserPath()}`)
    istdMain.init()
    repoMain.init()
}

exports.init = init