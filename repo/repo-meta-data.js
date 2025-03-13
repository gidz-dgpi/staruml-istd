/**
 * StarUML iStandaard Meta Data Repository Functions
 */

const utils = require('../dgpi/dgpi-utils')
const trans = require('./repo-trans-meta-data')
const pub = require('./repo-trans-pub-data')
const jsonExport = require('../istd/istd-json-export')

/**
 * Publish Specific Meta Data in Repository
 * @param {Project} root 
 * @param {String} branch 
 * @param {String | Number} projectId 
 * @param {String} commitMessage 
 */
function publishSpecificMetaDataInRepo(root, branch, projectId, commitMessage) {
    const specificMetaData = jsonExport.buildSpecificMetaDataJson(root)

    return trans.updateSpecificMetaData(
        projectId,
        branch,
        specificMetaData,
        commitMessage
    )
}

/**
 * 
 * @param {Project} root 
 * @param {String} branch 
 * @param {String | Number} projectId 
 * @param {String} commitMessage 
 * @returns 
 */
function publishBerichtTitleAndReplyInRepo(root, branch, projectId, commitMessage) {
    const berichtenTitleAndReply = jsonExport.buildBerichtenTitleAndReply(root)

    return pub.updateBerichtenTitleAndReplyData(
        projectId,
        branch,
        berichtenTitleAndReply,
        commitMessage
    )
    .catch(error => {
        // Okay, that failed... Then try to post the file as a new one.
        return pub.createBerichtenTitleAndReplyData(
            projectId,
            branch,
            berichtenTitleAndReply,
            commitMessage
        )
    })
}

/**
 * Publish Generic Meta Data in Repository
 * @param {Project} root 
 * @param {String} rootId 
 * @param {String} branch 
 * @param {String | Number} projectId 
 * @param {String} commitMessage 
 */
function publishGenericMetaDataInRepo(root, branch, projectId, commitMessage) {
    const genericMetaData = jsonExport.buildGenericMetaDataJson(root)

    return trans.updateGenericMetaData(
        projectId,
        branch,
        genericMetaData,
        commitMessage)
}

/**
 * Publish Context Meta Data in Repository
 * @param {String} rootId 
 * @param {String} branch 
 * @param {String | Number} projectId 
 * @param {String} commitMessage 
 */
function publishContextMetaDataInRepo(branch, projectId, commitMessage) {
    const contextMetaData = jsonExport.jsonLdContext
    
    return trans.updateContextMetaData(
        projectId,
        branch,
        contextMetaData,
        commitMessage)
}

/**
 * Publish iStandaard Project Meta Data in Repository
 */
function publishMetaDataInRepo() {
    // initialize process vars
    const root = app.project.getProject()
    const branch = utils.getTagValue(root, 'branch')
    const projectId = utils.getTagValue(root, 'projectId')
    const commitMessage = 'StarUML.publishMetaDataInRepo-functie d.d. ' + new Date()
    trans.init()

    publishContextMetaDataInRepo(branch, projectId, commitMessage)
        .then(response => {
            console.log(`update Context Meta Data, status = ${response.status}`)
            return publishGenericMetaDataInRepo(root, branch, projectId, commitMessage)
        })
        .then(response => {
            console.log(`update Generic Meta Data, status = ${response.status}`)
            return publishSpecificMetaDataInRepo(root, branch, projectId, commitMessage)
        })
        .then(response => {
            console.log(`update Specific Meta Data, status = ${response.status}`)
            return publishBerichtTitleAndReplyInRepo(root, branch, projectId, commitMessage)
        })
        .then(response => {
            app.dialogs.showAlertDialog(`Meta Data gepubliceerd in branch[${branch}]. status[${response.status}]`) 
        })
        /**
         * Handle Rejections
         */
        .catch(error => {
            // handle error
            console.log(error)
        })

}

exports.publish = publishMetaDataInRepo
