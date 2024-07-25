const sourceData = require('./repo-globals').sourceData
const repoPrefs = require('./repo-prefs')
const api = require('./repo-api')

function loadMetaDataFragments(root, projectPath, branch) {

    api.getFileFromRepo(projectPath, `${sourceData.path}/${sourceData.genericModelMetaDataFile}`, branch)
    .then(response => {
        app.project.importFromJson(root, JSON.parse(atob(response.data.content)))

        api.getFileFromRepo(projectPath, `${sourceData.path}/${sourceData.specificModelMetaDataFile}`, branch)
        .then(response => {
            app.project.importFromJson(root, JSON.parse(atob(response.data.content)))
        })
        .catch(reason => {
            console.log(reason)
        })

    })
    .catch(reason => {
        console.log(reason)
    })

}


/**
 * Select Model Data Repository and Load Source Data
 */
function selectRepoAndLoadSourceData() {
    api.init()
    api.listProjects(false, undefined, true)
        .then(response => {
        const repoList = response.data
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
                const branch = 'main' // branch selection in later phase
                const projectPath = returnValue
                api.getFileFromRepo(projectPath, `${sourceData.path}/${sourceData.rootMetaDataFile}`, branch)
                    .then(response => {
                        const rootMetaData = JSON.parse(atob(response.data.content))
                        root = app.project.loadFromJson(rootMetaData)
                        loadMetaDataFragments(root, projectPath, branch)
                    })
                    .catch(reason => {
                        console.log(reason)
                    })
            } else {
                console.log("User canceled")
            }
        })
        
    })
        .catch (error => {
            console.log(error)
    })
        .finally(() => {
        // always executed

    })
}

exports.selectAndLoad = selectRepoAndLoadSourceData