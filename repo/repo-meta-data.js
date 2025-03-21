/**
 * StarUML iStandaard Meta Data Repository Functions
 */

const trans = require('./repo-trans-meta-data')
const jsonExport = require('../istd/istd-json-export')
const pub = require('./repo-trans-pub-data')

const GitLabCommitAction = require('./gitlab-commit-action.js')

/**
 * 
 * @param {Project} root 
 * @param {GitLabCommitAction}
 */
function prepSpecificMetaDataInRepo(root) {
    return trans.getSpecificMetaDataActions(jsonExport.buildSpecificMetaDataJson(root))
}

/**
 * 
 * @param {Project} root 
 * @returns {GitLabCommitAction}
 */
function prepBerichtTitleAndReplyInRepo(root) {
    return pub.getBerichtTitleAndReplyActions(jsonExport.buildBerichtenTitleAndReply(root))
}

/**
 * Prepares required commit actions for creating a commitset containing the Generic Meta Data
 * @param {Project} root 
 * @returns {GitLabCommitAction}
 */
function prepCommitGenericMetaDataInRepo(root) {
    return trans.getGenericMetaDataActions(jsonExport.buildGenericMetaDataJson(root))
}

/**
 * Prepares required commit actions for creating a commitset containing the Context Meta Data
 * @returns {GitLabCommitAction}
 */
function prepCommitContextMetaDataToRep() {
    console.log(jsonExport.jsonLdContext())
    return trans.getContextMetaDataActions(jsonExport.jsonLdContext())
}

/**
 * Prepares commit actions for storing the source data to the repository
 * @param {Project} root 
 * @returns {Array[GitLabCommitAction]}
 */
function prepCommitActions(root) {
    return [
        prepCommitContextMetaDataToRep(),
        prepCommitGenericMetaDataInRepo(root),
        prepSpecificMetaDataInRepo(root),
        prepBerichtTitleAndReplyInRepo(root)
    ]
}

exports.prepCommitActions = prepCommitActions
