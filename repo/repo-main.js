const repoPrefs = require('./repo-prefs')
const api = require('./repo-api')

function setApiPrefs() {
    api.init(
        app.preferences.get(repoPrefs.keys.repoServerURL),
        app.preferences.get(repoPrefs.keys.repoAuthToken)
    )
}

/**
 * Select Model Data Dialog and Load Model Data
 * @param {Array<RepoData>} repoList 
 */
function selectRepoAndLoadModelData(repoList) {
    const modelGroupPath = app.preferences.get(repoPrefs.keys.repoModelGroupPath)
    const modelDataList = repoList.filter(item => item.namespace.full_path.startsWith(modelGroupPath) && item.name != 'gitlab-profile')
    const options = []

    for (let i = 0; i < modelDataList.length; i++) {
        options.push({
            text: modelDataList[i].name,
            value: modelDataList[i].id
        })
    }

    app.dialogs.showSelectDropdownDialog("Selecteer een Model Data repository.", options).then(({ buttonId, returnValue }) => {
        if (buttonId === 'ok') {
            console.log(returnValue)
            api.getFileFromRepo(returnValue, 'model-data.mdj', 'main')
            .then(response => {
                const modelData = JSON.parse(atob(response.data.content))
                console.log(modelData)
                //per laag impoeteren
                app.project.importFromJson(app.project.getProject(), modelData)
            })
            .catch(reason => {
                console.log(reason)
            })
        } else {
            console.log("User canceled")
        }
    })
}


function _handleRepoLoadModelData() {
    setApiPrefs()
    api.listProjects(false, undefined, true)
        .then(response => {
            selectRepoAndLoadModelData(response.data)
        })
        .catch(error => {
            console.log(error)
        })
        .finally(() => {
            // always executed

        })
}

function _handleRepoStoreModelData() {
    console.log('_handleRepoStoreModelData')

}

function init() {
    app.preferences.register(repoPrefs.metaData)
    app.commands.register('repo:load:model:data', _handleRepoLoadModelData)
    app.commands.register('repo:store:model:data', _handleRepoStoreModelData)
}

exports.init = init