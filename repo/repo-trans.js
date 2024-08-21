const utils = require('../dgpi/dgpi-utils')
const api = require('./repo-api')
const sourceData = require('./repo-globals').sourceData

/**
 * Promise to get all available Repositories
 */
function getRepoList() {
    return api.listProjects(false, undefined, true)
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

exports.getRepoList = getRepoList
exports.addMetaDataSpecficModel = addMetaDataSpecficModel
exports.getMetaDataSpecificModel = getMetaDataSpecificModel
exports.addMetaDataGenericModel = addMetaDataGenericModel
exports.getMetaDataGenericModel = getMetaDataGenericModel
exports.createMetaDataRoot = createMetaDataRoot
exports.getMetaDataRoot = getMetaDataRoot