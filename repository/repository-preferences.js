const repoServerURL = 'repository.server.url'
const repoAuthToken = 'repository.auth.token'
const schema = {}
schema[repoServerURL] = {
            text: 'GitLab Repository Server URL',
            type: 'string',
            default: 'https://repository.istandaarden.nl'
        } 
schema[repoAuthToken] = {
            text: 'GitLab Repository Auth Token',
            description: 'Kopieer je GitLab Token hierin',
            type: 'string',
            default: ''
        } 

exports.repoServerURL = repoServerURL
exports.repoAuthToken = repoAuthToken
exports.dataSchema = {
    id: 'repository',
    name: 'Repository',
    schema: schema
}