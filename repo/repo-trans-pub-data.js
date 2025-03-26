const pubData = require('./repo-globals').pubData
const utils = require('../dgpi/dgpi-utils')
const GitLabCommitAction = require('./gitlab-commit-action.js')

/**
 * Prepare commit actions for updating berichten title and reply data in branch
 * @param {JsonObject} berichtenTitleAndReplyData 
 * @returns {GitLabCommitAction}
 */
function getBerichtTitleAndReplyActions(berichtenTitleAndReplyData) {
    return new GitLabCommitAction(
        `${pubData.path}/${pubData.berichtenTitleAndReplyFile}`,
        'update',
        utils.jsonToString(berichtenTitleAndReplyData)
    )
}

function getReleaseInfoActions(releaseInfoData) {
    return new GitLabCommitAction(
        `${pubData.path}/${pubData.releaseInfoFile}`,
        'update',
        utils.jsonToString(releaseInfoData)
    )
}

exports.getBerichtTitleAndReplyActions = getBerichtTitleAndReplyActions
exports.getReleaseInfoActions = getReleaseInfoActions
