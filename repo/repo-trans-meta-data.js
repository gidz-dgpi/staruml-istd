/**
 * iStandaard Repository Source Data Transactions
 */
const utils = require('../dgpi/dgpi-utils')
const api = require('./repo-api')
const metaData = require('./repo-globals').metaData
const repoPrefs = require('./repo-prefs')

/**
 * Initialize Transaction Connection(s)
 */
function init() {
    api.init()
}

/**
 * Update Specific Meta Data in Branch
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {JsonObject} specificMetaData 
 * @param {String} commitMessage 
 */
function updateSpecificMetaData(projectId, branch, specificMetaData, commitMessage) {
    return api.updateExistingFileInRepo(
        projectId,
        branch,
        `${metaData.path}/${metaData.specificModelMetaDataFile}`,
        utils.jsonToString(specificMetaData),
        commitMessage)
}

/**
 * Update Generic Meta Data in Branch
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {JsonObject} genericMetaData 
 * @param {String} commitMessage 
 */
function updateGenericMetaData(projectId, branch, genericMetaData, commitMessage) {
    return api.updateExistingFileInRepo(
        projectId,
        branch,
        `${metaData.path}/${metaData.genericModelMetaDataFile}`,
        utils.jsonToString(genericMetaData),
        commitMessage)
}

/**
 * Update Context Meta Data in Branch
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {LdJsonObject} contextMetaData 
 * @param {String} commitMessage 
 */
function updateContextMetaData(projectId, branch, contextMetaData, commitMessage) {
    return api.updateExistingFileInRepo(
        projectId,
        branch,
        `${metaData.path}/${metaData.contextModelMetaDataFile}`,
        utils.jsonToString(contextMetaData),
        commitMessage)
}

exports.init = init
exports.updateContextMetaData = updateContextMetaData
exports.updateGenericMetaData = updateGenericMetaData
exports.updateSpecificMetaData = updateSpecificMetaData
