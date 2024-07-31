const repoMetaData = require('./repo-prefs').metaData
const repoSourceData = require('./repo-source-data')

function _handleRepoRerieveModelData() {
    repoSourceData.retrieve()
}

function _handleRepoStoreModelData() {
    repoSourceData.store()
}

function init() {
    app.preferences.register(repoMetaData)
    app.commands.register('repo:retrieve:model:data', _handleRepoRerieveModelData)
    app.commands.register('repo:store:model:data', _handleRepoStoreModelData)
}

exports.init = init