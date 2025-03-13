const api = require('./repo-api')
const pubData = require('./repo-globals').pubData
const utils = require('../dgpi/dgpi-utils')

/**
 * Initialize Transaction Connection(s)
 */
function init() {
    api.init()
}

/**
 * 
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {JsonObject} berichtenTitleAndReplyData 
 * @param {String} commitMessage 
 * @returns 
 */
function createBerichtenTitleAndReplyData(projectId, branch, berichtenTitleAndReplyData, commitMessage) {
    return api.createNewFileInRepo(
        projectId,
        branch,
        `${pubData.path}/${pubData.berichtenTitleAndReplyDataFile}`,
        utils.jsonToString(berichtenTitleAndReplyData),
        commitMessage
    )
}

/**
 * Update publication data berichten_title_and_reply.json
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {JsonObject} berichtenTitleAndReplyData 
 * @param {String} commitMessage 
 * @returns 
 */
function updateBerichtenTitleAndReplyData(projectId, branch, berichtenTitleAndReplyData, commitMessage) {
    return api.updateExistingFileInRepo(
        projectId,
        branch,
        `${pubData.path}/${pubData.berichtenTitleAndReplyDataFile}`,
        utils.jsonToString(berichtenTitleAndReplyData),
        commitMessage
    )
}

exports.createBerichtenTitleAndReplyData = createBerichtenTitleAndReplyData
exports.updateBerichtenTitleAndReplyData = updateBerichtenTitleAndReplyData