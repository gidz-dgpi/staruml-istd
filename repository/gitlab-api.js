/**
 * GitLab Repository Api Module for StarUML Extension
 * Based on https://docs.gitlab.com/ee/api
 */

const axios = require('axios')
const apiPath = '/api/v4'
var gitLabApi

/**
 * Initialize GitLab Api Settings
 * @param {String} serverURL 
 * @param {String} token 
 */
function init(serverURL, token) {
    const baseURL = serverURL + apiPath
    gitLabApi = axios.create({
        baseURL: baseURL,
        headers: {
            'Content-Type': 'application/json',
            'PRIVATE-TOKEN': token
        }
    })
}

/**
 * Based on: https://docs.gitlab.com/ee/api/repositories.html#list-repository-tree
 * @param {String} projecPath 
 * @param {String | undefined} filePath 
 * @param {Boolean | undefined} recursive 
 * @param {String | undefined} ref 
 * @returns {Promise<axios.get>}
 */
function listRepoFileTree(projecPath, filePath, recursive, ref) {
    const id = encodeURIComponent(projecPath)
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
 * @param {String} projecPath 
 * @param {String} filePath 
 * @returns {encodedURI}
 */
function buildRepoFilesPath(projecPath, filePath) {
    const id = encodeURIComponent(projecPath)
    const ueFilePath =  encodeURIComponent(filePath)
    return `/projects/${id}/repository/files/${ueFilePath}`
}

/**
 * Based on: https://docs.gitlab.com/ee/api/repository_files.html#get-file-from-repository
 * @param {String} projecPath 
 * @param {String} filePath 
 * @param {String} ref 
 * @returns {Promise<axios.get>}
 */
function getFileFromRepo(projecPath, filePath, ref) {
    const config = { params: { ref: ref } }
    return gitLabApi.get(buildRepoFilesPath(projecPath, filePath), config)
}

/**
 * Based on: https://docs.gitlab.com/ee/api/repository_files.html#create-new-file-in-repository
 * @param {String} projecPath 
 * @param {String} branch 
 * @param {String} filePath 
 * @param {String} content 
 * @param {String} commitMessage 
 * @returns {Promise<axios.post>}
 */
function createNewFileInRepo(projecPath, branch, filePath, content, commitMessage) {
    const data = {
        branch: branch,
        content: content,
        commit_message: commitMessage
    }
    return gitLabApi.post(buildRepoFilesPath(projecPath, filePath), data)
}

/**
 * Based on: https://docs.gitlab.com/ee/api/repository_files.html#update-existing-file-in-repository
 * @param {String} projecPath 
 * @param {String} branch 
 * @param {String} filePath 
 * @param {String} content 
 * @param {String} commitMessage 
 * @returns {Promise<axios.post>}
 */
function updateExistingFileInRepo(projecPath, branch, filePath, content, commitMessage) {
    const data = {
        branch: branch,
        content: content,
        commit_message: commitMessage
    }
    return gitLabApi.put(buildRepoFilesPath(projecPath, filePath), data)
}

exports.init = init
exports.listRepoFileTree = listRepoFileTree
exports.getFileFromRepo = getFileFromRepo
exports.createNewFileInRepo = createNewFileInRepo
exports.updateExistingFileInRepo = updateExistingFileInRepo