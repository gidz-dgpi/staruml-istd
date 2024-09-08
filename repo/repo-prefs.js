const keys = {
    repoServerURL: 'repository.server.url',
    repoAuthToken: 'repository.auth.token',
    repoModelGroupPath: 'repository.model.group.path'
}

const schema = {}
schema[keys.repoServerURL] = {
    text: 'GitLab Repository Server URL',
    description: 'Repository Server EndPoint URL',
    type: 'string',
    default: 'https://repository.istandaarden.nl'
}
schema[keys.repoAuthToken] = {
    text: 'GitLab Auth Token',
    description: 'Kopieer je GitLab Autorisatie Token hierin',
    type: 'string',
    default: ''
}
schema[keys.repoModelGroupPath] = {
    text: 'Model Groep Path',
    description: 'Repository Groepspad naar de Model Data',
    type: 'string',
    default: 'dgpi/modelleren/dgpi-model-data'
}
/**
 * StarUML Repository Preferences Keys
 */
exports.keys = keys
/**
 * StarUML Repository Preferences Schema
 */
exports.metaData = {
    id: 'repository',
    name: 'Repository',
    schema: schema
}