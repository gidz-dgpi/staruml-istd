const api = require('./repo-api')
const prefsMetaData = require('./repo-prefs').metaData
const repoSourceData = require('./repo-source-data')
const repoMetaData = require('./repo-meta-data')
const utils = require('../dgpi/dgpi-utils')

function _handleRepoRetrieveModelData() {
    repoSourceData.retrieve()
}

function _handleRepoStoreAndPublishModelData() {
    let commitMessage = `StarUML Model data bewaren en publiceren d.d. ${new Date()}`

    app.dialogs.showInputDialog('Geef commit message op:', commitMessage)
        .then(dialogResult => {
            if (dialogResult.returnValue.trim().length == 0 || dialogResult.buttonId != 'ok') {
                app.dialogs.showAlertDialog('De commit message mag niet leeg zijn!')
                return
            } else {
                commitMessage = dialogResult.returnValue.trim()

                const root = app.project.getProject()
                const branch = utils.getTagValue(root, 'branch')
                const projectId = utils.getTagValue(root, 'projectId')

                const commitActions = repoSourceData.prepCommitActions(root)
                repoMetaData.prepCommitActions(root).forEach(metaItem => {
                    commitActions.push(metaItem)
                })                

                api.commitToRepo(projectId, branch, commitMessage, commitActions)
                    .then(response => {
                        app.dialogs.showInfoDialog(`Project bewaard en gepubliceerd in branch[${branch}]. status[${response.status}]`)
                    })
                    .catch(error => {
                        app.dialogs.showAlertDialog(`Fout bij bewaren en publiceren naar branch [${branch}]!\n${error}`)
                        console.error(error)
                    })
            }
        })
}

function init() {
    app.preferences.register(prefsMetaData)
    app.commands.register('repo:retrieve:model:data', _handleRepoRetrieveModelData)
    app.commands.register('repo:store-and-publish:model:data', _handleRepoStoreAndPublishModelData)

    api.init()
}

exports.init = init