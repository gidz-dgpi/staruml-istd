/**
 * iStandaard Repository Source Data Transactions
 */
const utils = require('../dgpi/dgpi-utils')
const api = require('./repo-api')
const sourceData = require('./repo-globals').sourceData
const repoPrefs = require('./repo-prefs')

/**
 * Initialize Transaction Connection(s)
 */
function init() {
    api.init()
}

/**
 * Promise to get Model Data Repositories
 * @returns {Promise<String[]>}
 */
function getModelDataRepoList() {
    return api.listProjects(false, undefined, true)
        .then(response => {
            const repoList = response.data
            const modelGroupPath = app.preferences.get(repoPrefs.keys.repoModelGroupPath)
            return repoList.filter(item => item.namespace.full_path.startsWith(modelGroupPath) && item.name != 'gitlab-profile')
        })
}

/**
 * Get avlailable Work Branches
 * @param {String | Number} projectId 
 * @returns {Promise<String[]>}
 */
function getWorkBranches(projectId) {
    return api.listRepoBranches(projectId)
        .then(response => {
            const branchList = response.data
            return branchList.filter(item => !item.protected)
        })
}

/**
 * Add StarUML UMLPackage from Repository Specific Model Data
 * @param {Project} root 
 * @param {Base64JsonString} specficDataContent 
 * @returns {UMLPackage}
 */
function addMetaDataSpecficModel(root, specficDataContent) {
    return app.project.importFromJson(root, utils.encodeBase64JsonStrToObj(specficDataContent))
}

/**
 * Promise to retrieve Meta Data for the Specific Model from selected Branch in Repository
 * @param {String | Number} projectId 
 * @param {String} branche  
 */
function getMetaDataSpecificModel(projectId, branche) {
    return api.getFileFromRepo(projectId, `${sourceData.path}/${sourceData.specificModelMetaDataFile}`, branche)
}

/**
 * Add StarUML UMLPackage from Repository Generic Model Data
 * @param {Project} root 
 * @param {Base64JsonString} genericDataContent 
 * @returns {UMLPackage}
 */
function addMetaDataGenericModel(root, genericDataContent) {
    return app.project.importFromJson(root, utils.encodeBase64JsonStrToObj(genericDataContent))
}

/**
 * Get Promise to retrieve Meta Data for the Generic Model from selected Branch in Repository
 * @param {String | Number} projectId 
 * @param {String} branche  
 */
function getMetaDataGenericModel(projectId, branche) {
    return api.getFileFromRepo(projectId, `${sourceData.path}/${sourceData.genericModelMetaDataFile}`, branche)
}

/**
 * Create new StarUML Project from Repository Root Data Content
 * @param {Base64JsonString} rootDataContent 
 * @param {String | Number} projectId
 * @param {String} branch
 * @returns {Project}
 */
function createMetaDataRoot(rootDataContent, projectId, branch) {
    // create new application root object
    const root = app.project.loadFromJson(utils.encodeBase64JsonStrToObj(rootDataContent))
    // add Tags that are used to keep repository storage locations info
    utils.addStringTag(root, 'projectId', projectId)
    utils.addStringTag(root, 'branch', branch)
    console.log(root)
    return root
}

/**
 * Get Promise to retrieve Meta Data Root from selected Branch in Repository
 * @param {Strung | Number} projectId 
 * @param {String} branche  
 */
function getMetaDataRoot(projectId, branche) {
    return api.getFileFromRepo(projectId, `${sourceData.path}/${sourceData.rootMetaDataFile}`, branche)
}

/**
 * Update Root Resource Data in Branch
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {ProjectJson} rootResourceData 
 * @param {String} commitMessage 
 */
function updateRootSourceData(projectId, branch, rootSourceData, commitMessage) {
    return api.updateExistingFileInRepo(
        projectId,
        branch,
        `${sourceData.path}/${sourceData.rootMetaDataFile}`,
        utils.jsonToString(rootSourceData),
        commitMessage)
}

/**
 * Update Generic Resource Data in Branch
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {UMLPackageJson} genericResourceData 
 * @param {String} commitMessage 
 */
function updateGenericSourceData(projectId, branch, genericSourceData, commitMessage) {
    return api.updateExistingFileInRepo(
        projectId,
        branch,
        `${sourceData.path}/${sourceData.genericModelMetaDataFile}`,
        utils.jsonToString(genericSourceData),
        commitMessage
    )
}

/**
 * Update Specific Resource Data in Branch
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {UMLPackageJson} specificResourceData 
 * @param {String} commitMessage 
 */
function updateSpecificSourceData(projectId, branch, specificSourceData, commitMessage) {
    return api.updateExistingFileInRepo(
        projectId,
        branch,
        `${sourceData.path}/${sourceData.specificModelMetaDataFile}`,
        utils.jsonToString(specificSourceData),
        commitMessage
    )
}

exports.init = init
exports.getModelDataRepoList = getModelDataRepoList
exports.getWorkBranches = getWorkBranches
exports.addMetaDataSpecficModel = addMetaDataSpecficModel
exports.getMetaDataSpecificModel = getMetaDataSpecificModel
exports.addMetaDataGenericModel = addMetaDataGenericModel
exports.getMetaDataGenericModel = getMetaDataGenericModel
exports.createMetaDataRoot = createMetaDataRoot
exports.getMetaDataRoot = getMetaDataRoot
exports.updateRootSourceData = updateRootSourceData
exports.updateGenericSourceData = updateGenericSourceData
exports.updateSpecificSourceData = updateSpecificSourceData