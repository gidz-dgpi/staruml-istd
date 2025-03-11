/**
 * GitLab Repository Api Module for StarUML Extension
 * Based on https://docs.gitlab.com/ee/api
 */

const axios = require('axios')
const preferenceKeys = require('./repo-prefs').keys
const apiPath = '/api/v4'
var gitLabApi = undefined

/**
 * Initialize Generic Axios GitLab Api Settings from StarUML Preferences
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
 * Based on https://docs.gitlab.com/ee/api/users.html#list-current-user
 * @returns {Promise<axios.get>}
 */
function listCurrentUser() {
    return gitLabApi.get('/user')
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
 * @param {Attributes} params 
 * @returns {Promise<axios.get>}
 */
function listProjects(params) {
    const url = `/projects?pagination=keyset&per_page=100&order_by=id&sort=asc`
    const config = params ? { params: params } : undefined
    return gitLabApi.get(url, config)
}

/**
 * Based on https://docs.gitlab.com/ee/api/branches.html#list-repository-branches
 * @param {String} projectId 
 * @returns {Promise<axios.get>}
 */
function listRepoBranches(projectId) {
    const id = encodeURIComponent(projectId)
    const url = `/projects/${id}/repository/branches`
    return gitLabApi.get(url)
}


/**
 * Get the id of the group which has given namespace
 * @param {string} namespace
 * @returns {number}
 */
function getGroupId(namespace) {
    console.log('getGroupId(' + namespace + ')')
    const url = '/groups'
    var params = {}
    params['search'] = namespace
    return gitLabApi.get(url, { params: params })
        .then(response => {
            return response.data[0].id
        })
}

/**
 * List the projects belonging to given group (namespace)
 * @param {string} namespace
 * @returns {Promise<axios.get>}
 */
function listProjectsForGroup(namespace) {
    console.log('listProjectsForGroup(' + namespace + ')')
    return getGroupId(namespace)
        .then(groupId => {
            console.log('listProjectsForGroup => getGroupId yielded ' + groupId)
            const url = '/groups/' + groupId + '/projects?pagination=keyset&per_page=100&order_by=id&sort=asc'
            console.log('listProjectsForGroup => using url ' + url)
            var params = {}
            params['include_subgroups'] = 'true'
            return gitLabApi.get(url, { params: params })
        })
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
exports.listCurrentUser = listCurrentUser
exports.listSubGroups = listSubGroups
exports.listProjects = listProjects
exports.listProjectsForGroup = listProjectsForGroup
exports.listRepoBranches = listRepoBranches
exports.listRepoFileTree = listRepoFileTree
exports.getFileFromRepo = getFileFromRepo
exports.createNewFileInRepo = createNewFileInRepo
exports.updateExistingFileInRepo = updateExistingFileInRepo