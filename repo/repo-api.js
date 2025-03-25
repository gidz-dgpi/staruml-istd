/**
 * GitLab Repository Api Module for StarUML Extension
 * Based on https://docs.gitlab.com/ee/api
 */

const axios = require('axios')
const GitLabCommitAction = require('./gitlab-commit-action.js')
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
    return getGroupId(namespace)
        .then(groupId => {
            const url = '/groups/' + groupId + '/projects?pagination=keyset&per_page=100&order_by=id&sort=asc'
            var params = {}
            params['include_subgroups'] = 'true'
            return gitLabApi.get(url, { params: params })
        })
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

/**
 * Build the API url for the commits API
 * @param {String | Number} projectId 
 * @returns 
 */
function buildCommitUrl(projectId) {
    return `/projects/${projectId}/repository/commits`
}

/**
 * Determines the action GitLab should perform on the given file.
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {GitLabCommitAction} path 
 * @returns 'update' when the file needs to be updated, 'create' when the file needs to be created
 */
function determineActionForCommitAction(projectId, branch, commitAction) {
    return getFileFromRepo(projectId, commitAction.filePath, branch)
        .then(response => {
            if (response.status >= 200 && response.status < 300) {
                return {
                    file_path: commitAction.filePath,
                    content: commitAction.content,
                    action: 'update'
                }
            } else {
                throw `Cannot determine action for file ${path}: API returned status ${response.status}`
            }
        })
        .catch(error => {
            if (error.status == 404) {
                return {
                    file_path: commitAction.filePath,
                    content: commitAction.content,
                    action: 'create'
                }
            } else {
                throw error
            }
        })
}

/**
 * For each commitAction, set the correct action: update if the file exists, or create if it doesn't exist.
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {Array} commitActions 
 * @returns {Array[GitLabCommitAction]}
 */
function determineActionForCommitActions(projectId, branch, commitActions) {
    return Promise.allSettled(
        commitActions.map(action => determineActionForCommitAction(projectId, branch, action))
    )
        .then(results => {
            return results.map(result => (result.value))
        })
        .catch(error => {
            throw error.reason
        })
}

/**
 * 
 * @param {String | Number} projectId 
 * @param {String} branch 
 * @param {String} commitMessage 
 * @param {Array[GitLabCommitAction]} commitActions 
 */
function commitToRepo(projectId, branch, commitMessage, commitActions) {
    return determineActionForCommitActions(projectId, branch, commitActions)
        .then((actions) => {
            const data = {
                branch: branch,
                commit_message: commitMessage,
                actions: actions
            }
            const url = buildCommitUrl(projectId)
            return gitLabApi.post(url, data)
        })
}

exports.commitToRepo = commitToRepo
exports.init = init
exports.listProjectsForGroup = listProjectsForGroup
exports.listRepoBranches = listRepoBranches
exports.getFileFromRepo = getFileFromRepo
exports.createNewFileInRepo = createNewFileInRepo
exports.updateExistingFileInRepo = updateExistingFileInRepo