/**
 * iStandaard Repository Source Data Transactions
 */
const utils = require('../dgpi/dgpi-utils')
const GitLabCommitAction = require('./gitlab-commit-action.js')
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
    return api.listProjectsForGroup(app.preferences.get(repoPrefs.keys.repoModelGroupPath))
        .then(response => {
            return response.data.filter(item => item.name != 'gitlab-profile')
        })
}

/**
 * Get available Work Branches
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
function addMetaDataSpecificModel(root, specficDataContent) {
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
 * Setup commit action for root source data
 * @param {ProjectJson} rootSourceData 
 * @returns {GitLabCommitAction}
 */
function getRootSourceDataActions(rootSourceData) {
    return new GitLabCommitAction(
        `${sourceData.path}/${sourceData.rootMetaDataFile}`,
        'update',
        utils.jsonToString(rootSourceData)
    )
}

/**
 * 
 * @param {Object} genericSourceData 
 * @returns {GitLabCommitAction}
 */
function getGenericSourceDataActions(genericSourceData) {
    return new GitLabCommitAction(
        `${sourceData.path}/${sourceData.genericModelMetaDataFile}`,
        'update',
        utils.jsonToString(genericSourceData)
    )
}

/**
 * 
 * @param {Object} specificSourceData 
 * @returns {GitLabCommitAction}
 */
function getSpecificSourceDataActions(specificSourceData) {
    return new GitLabCommitAction(
        `${sourceData.path}/${sourceData.specificModelMetaDataFile}`,
        'update',
        utils.jsonToString(specificSourceData)
    )
}

exports.addMetaDataGenericModel = addMetaDataGenericModel
exports.addMetaDataSpecificModel = addMetaDataSpecificModel
exports.createMetaDataRoot = createMetaDataRoot
exports.init = init
exports.getGenericSourceDataActions = getGenericSourceDataActions
exports.getMetaDataGenericModel = getMetaDataGenericModel
exports.getMetaDataSpecificModel = getMetaDataSpecificModel
exports.getModelDataRepoList = getModelDataRepoList
exports.getRootSourceDataActions = getRootSourceDataActions
exports.getSpecificSourceDataActions = getSpecificSourceDataActions
exports.getWorkBranches = getWorkBranches
exports.getMetaDataRoot = getMetaDataRoot
