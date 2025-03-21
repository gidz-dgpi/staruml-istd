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
        `${pubData.path}/${pubData.berichtenTitleAndReplyDataFile}`,
        'update',
        utils.jsonToStringCompact(berichtenTitleAndReplyData)
    )
}

exports.getBerichtTitleAndReplyActions = getBerichtTitleAndReplyActions
