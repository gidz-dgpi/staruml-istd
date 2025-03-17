/**
 * Global Constants for iStandaarden Repository
 */

/**
 * Location and Filenaming Configuration Data Storage for iStandaarden Repository
 */
const configData = {
    path: 'config-data',
    xsdConfigDataFile: 'xsd-config-data.json',
}

/**
 * Location and Filenaming Source Data Storage for iStandaarden Repository
 */
const sourceData = {
    path: 'source-data',
    rootMetaDataFile: 'root-meta-data.mdj',
    genericModelMetaDataFile: 'generic-model-meta-data.mfj',
    specificModelMetaDataFile: 'specific-model-meta-data.mfj'
}

/**
 * Location and Filenaming Meta Data Storage for iStandaarden Repository
 */
const metaData = {
    path: 'meta-data',
    contextModelMetaDataFile: 'context-model-meta-data.jsonld',
    genericModelMetaDataFile: 'generic-model-meta-data.json',
    specificModelMetaDataFile: 'specific-model-meta-data.json'
}

exports.configData = configData
exports.sourceData = sourceData
exports.metaData = metaData