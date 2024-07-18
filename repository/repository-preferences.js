const keys = {
    repoServerURL: 'repository.server.url',
    repoAuthToken: 'repository.auth.token'
}

const schema = {}
schema[keys.repoServerURL] = {
    text: 'GitLab Repository Server URL',
    type: 'string',
    default: 'https://repository.istandaarden.nl'
}
schema[keys.repoAuthToken] = {
    text: 'GitLab Repository Auth Token',
    description: 'Kopieer je GitLab Token hierin',
    type: 'string',
    default: ''
}

exports.keys = keys
exports.dataSchema = {
    id: 'repository',
    name: 'Repository',
    schema: schema
}