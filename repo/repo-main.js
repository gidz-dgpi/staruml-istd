const repoMetaData = require('./repo-prefs').metaData
const repoSourceData = require('./repo-source-data')

function _handleRepoLoadModelData() {
    repoSourceData.selectAndLoad()
}

function _handleRepoStoreModelData() {
    repoSourceData.store()
}

function init() {
    app.preferences.register(repoMetaData)
    app.commands.register('repo:load:model:data', _handleRepoLoadModelData)
    app.commands.register('repo:store:model:data', _handleRepoStoreModelData)
}

exports.init = init