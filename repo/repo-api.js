/**
 * GitLab Repository Api Module for StarUML Extension
 * Based on https://docs.gitlab.com/ee/api
 */

const axios = require('axios')
const preferenceKeys = require('./repo-prefs').keys
const apiPath = '/api/v4'
var gitLabApi = undefined

/**
 * Initialize Generic Axios GitLab Api Settings
 * @param {String} serverURL
 * @param {String} token
 */
function init() {
    const serverURL = app.preferences.get(preferenceKeys.repoServerURL)
    const authToken = app.preferences.get(preferenceKeys.repoAuthToken)
    const baseURL = serverURL + apiPath
    gitLabApi = axios.create({
        baseURL: baseURL,
        headers: {
            'Content-Type': 'application/json',
            'PRIVATE-TOKEN': authToken
        }
    })
}

/**
 * Based on https://docs.gitlab.com/ee/api/groups.html#list-a-groups-subgroups
 * @param {String} groupPath 
 * @returns {Promise<axios.get>}
 */
function listSubGroups(groupPath) {
    const id = encodeURIComponent(groupPath)
    const url = `/groups/${id}/subgroups`
    return gitLabApi.get(url)
}

/**
 * Based on https://docs.gitlab.com/ee/api/projects.html#list-all-projects
 * @param {Boolean} searchNamespaces 
 * @param {String} search 
 * @param {Boolean} simple 
 * @returns {Promise<axios.get>}
 */
function listProjects(searchNamespaces, search, simple) {
    const url = `/projects`
    var params = {}
    if (searchNamespaces) params['searchNamespaces'] = searchNamespaces
    if (search) params['search'] = search
    if (simple) params['simple'] = simple
    const config = params != {} ? { params: params } : undefined
    return gitLabApi.get(url, config)
}

/**
 * Based on: https://docs.gitlab.com/ee/api/repositories.html#list-repository-tree
 * @param {String} projectId 
 * @param {String | undefined} filePath 
 * @param {Boolean | undefined} recursive 
 * @param {String | undefined} ref 
 * @returns {Promise<axios.get>}
 */
function listRepoFileTree(projectId, filePath, recursive, ref) {
    const id = encodeURIComponent(projectId)
    const url = `/projects/${id}/repository/tree`
    var params = {}
    if (filePath) params['path'] = encodeURIComponent(filePath)
    if (recursive) params['recursive'] = recursive
    if (ref) params['ref'] = ref
    const config = params != {} ? { params: params } : undefined
    console.log(config)
    return gitLabApi.get(url, config)
}

/**
 * Based on https://docs.gitlab.com/ee/api/repository_files.html
 * @param {String} projectId 
 * @param {String} filePath 
 * @returns {encodedURI}
 */
function buildRepoFilesPath(projectId, filePath) {
    const id = encodeURIComponent(projectId)
    const ueFilePath = encodeURIComponent(filePath)
    return `/projects/${id}/repository/files/${ueFilePath}`
}

/**
 * Based on: https://docs.gitlab.com/ee/api/repository_files.html#get-file-from-repository
 * @param {String} projectId 
 * @param {String} filePath 
 * @param {String} ref 
 * @returns {Promise<axios.get>}
 */
function getFileFromRepo(projectId, filePath, ref) {
    const config = { params: { ref: ref } }
    return gitLabApi.get(buildRepoFilesPath(projectId, filePath), config)
}

/**
 * Based on: https://docs.gitlab.com/ee/api/repository_files.html#create-new-file-in-repository
 * @param {String} projectId 
 * @param {String} branch 
 * @param {String} filePath 
 * @param {String} content 
 * @param {String} commitMessage 
 * @returns {Promise<axios.post>}
 */
function createNewFileInRepo(projectId, branch, filePath, content, commitMessage) {
    const data = {
        branch: branch,
        content: content,
        commit_message: commitMessage
    }
    return gitLabApi.post(buildRepoFilesPath(projectId, filePath), data)
}

/**
 * Based on: https://docs.gitlab.com/ee/api/repository_files.html#update-existing-file-in-repository
 * @param {String} projectId 
 * @param {String} branch 
 * @param {String} filePath 
 * @param {String} content 
 * @param {String} commitMessage 
 * @returns {Promise<axios.put>}
 */
function updateExistingFileInRepo(projectId, branch, filePath, content, commitMessage) {
    const data = {
        branch: branch,
        content: content,
        commit_message: commitMessage
    }
    return gitLabApi.put(buildRepoFilesPath(projectId, filePath), data)
}

exports.init = init
exports.listSubGroups = listSubGroups
exports.listProjects = listProjects
exports.listRepoFileTree = listRepoFileTree
exports.getFileFromRepo = getFileFromRepo
exports.createNewFileInRepo = createNewFileInRepo
exports.updateExistingFileInRepo = updateExistingFileInRepo