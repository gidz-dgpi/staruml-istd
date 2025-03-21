/**
 * iStandaard Repository Source Data Transactions
 */
const utils = require('../dgpi/dgpi-utils')
const api = require('./repo-api')
const metaData = require('./repo-globals').metaData

const GitLabCommitAction = require('./gitlab-commit-action.js')

/**
 * Initialize Transaction Connection(s)
 */
function init() {
    api.init()
}

/**
 * Prepare commit actions for updating Context Meta Data in branch
 * @param {LdJsonObject} contextMetaData 
 * @returns {GitLabCommitAction}
 */
function getContextMetaDataActions(contextMetaData) {
    return new GitLabCommitAction(
        `${metaData.path}/${metaData.contextModelMetaDataFile}`,
        'update',
        utils.jsonToStringCompact(contextMetaData)
    )
}

/**
 * Prepare commit actions for updating Generic Meta Data in branch
 * @param {JsonObject} genericMetaData 
 * @returns {GitLabCommitAction}
 */
function getGenericMetaDataActions(genericMetaData) {
    return new GitLabCommitAction(
        `${metaData.path}/${metaData.genericModelMetaDataFile}`,
        'update',
        utils.jsonToStringCompact(genericMetaData)
    )
}

/**
 * Prepare commit actions for updating Specific Meta Data in branch
 * @param {JsonObject} specificMetaData 
 * @returns {GitLabCommitAction}
 */
function getSpecificMetaDataActions(specificMetaData) {
    return new GitLabCommitAction(
        `${metaData.path}/${metaData.specificModelMetaDataFile}`,
        'update',
        utils.jsonToStringCompact(specificMetaData)
    )
}

exports.getContextMetaDataActions = getContextMetaDataActions
exports.getGenericMetaDataActions = getGenericMetaDataActions
exports.getSpecificMetaDataActions = getSpecificMetaDataActions
exports.init = init
