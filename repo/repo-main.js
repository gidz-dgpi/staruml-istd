const prefsMetaData = require('./repo-prefs').metaData
const repoSourceData = require('./repo-source-data')
const repoMetaData = require('./repo-meta-data')

function _handleRepoRetrieveModelData() {
    repoSourceData.retrieve()
}

function _handleRepoStoreModelData() {
    repoSourceData.store()
}

function _handleRepoPublishMetaData() {
    repoMetaData.publish()
}

function init() {
    app.preferences.register(prefsMetaData)
    app.commands.register('repo:retrieve:model:data', _handleRepoRetrieveModelData)
    app.commands.register('repo:store:model:data', _handleRepoStoreModelData)
    app.commands.register('repo:publish:meta:data', _handleRepoPublishMetaData)
}

exports.init = init