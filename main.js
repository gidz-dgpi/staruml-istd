const istdMain = require('./istd/istd-main')
const repoMain = require('./repo/repo-main')

function init() {
    istdMain.init()
    repoMain.init()
}

exports.init = init