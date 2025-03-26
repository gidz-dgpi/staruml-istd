/**
 * Global Constants for iStandaarden Repository
 */

/**
 * Location and Filenames Source Data Storage for iStandaarden Repository
 */
const sourceData = {
    path: 'source-data',
    rootMetaDataFile: 'root-meta-data.mdj',
    genericModelMetaDataFile: 'generic-model-meta-data.mfj',
    specificModelMetaDataFile: 'specific-model-meta-data.mfj',
    releaseInfoMetaDataFile: 'release-info-model-meta-data.mfj',
}

/**
 * Location and Filenames Meta Data Storage for iStandaarden Repository
 */
const metaData = {
    path: 'meta-data',
    contextModelMetaDataFile: 'context-model-meta-data.jsonld',
    genericModelMetaDataFile: 'generic-model-meta-data.json',
    specificModelMetaDataFile: 'specific-model-meta-data.json',
}

/**
 * Location and Filenames Publication Data Storage for iStandaarden Repository
 */
const pubData = {
    path: 'pub-data',
    berichtenTitleAndReplyFile: 'berichten_title_and_reply.json',
    releaseInfoFile: 'release-info.json',
}

exports.pubData = pubData
exports.sourceData = sourceData
exports.metaData = metaData