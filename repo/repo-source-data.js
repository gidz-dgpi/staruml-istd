const istGlobals = require('../istd/istd-globals')
const codelijstenPkgId = require('../istd/istd-codelijsten').codelijstenPkgId
const primitiveTypesPkgId = require('../istd/istd-primitive-types').primitiveTypesPkgId
const sourceData = require('./repo-globals').sourceData
const repoPrefs = require('./repo-prefs')
const api = require('./repo-api')
const utils = require('../dgpi/dgpi-utils')

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
 * Get Promise to retrieve Meta Data for the Specific Model from selected Branch in Repository
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

/**
 * Get Model Data Repository Selection Options from all avalailable GitLab Repositories
 * @param {Array<GitLabRepoData>} repoList all avalailable GitLab Repositories
 */
function getModelDataRepoOptions(repoList) {
    const modelGroupPath = app.preferences.get(repoPrefs.keys.repoModelGroupPath)
    const modelDataRepoList = repoList.filter(item => item.namespace.full_path.startsWith(modelGroupPath) && item.name != 'gitlab-profile')
    const modelDataRepoOptions = []

    for (let i = 0; i < modelDataRepoList.length; i++) {
        modelDataRepoOptions.push({
            text: String(modelDataRepoList[i].name),
            value: String(modelDataRepoList[i].id)
        })
    }

    return modelDataRepoOptions
}

function getModelDataRepoBrancheOptions(brancheList) {
    const workBrancheList = brancheList.filter(item => !item.protected)
    const modelDataRepoBrancheOptions = []

    for (let i = 0; i < workBrancheList.length; i++) {
        modelDataRepoBrancheOptions.push({
            text: workBrancheList[i].name,
            value: workBrancheList[i].name
        })
    }

    return modelDataRepoBrancheOptions
}

function getRepoList() {
    return api.listProjects(false, undefined, true)
}

/**
 * Select a Model Data Repo Option
 * @param {{text: string, value: string}[]} options 
 * @returns {Promise<dialog>}
 */
function selectModelDataRepo(options) {
    return app.dialogs.showSelectDropdownDialog(
        'Selecteer een Model Data repository.',
        options)
}

/**
 * Retrieve StarUML Source Meta Data from GitLab Repository
 */
function retrieveSourceDataFromRepo() {
    // Initialize process vars
    let modelDataRepoOptions = []
    let modelDataRepoSelection = {
        id: undefined,
        name: undefined,
        branch: undefined,
    }
    metaModelRoot = undefined 
    genericModelPkg = undefined
    api.init()

    /**
     * (0) Get available Model Data Repos 
     */
    getRepoList()
        /**
         * (1.a) Select a Model Data Repo
         */
        .then(response => {
            modelDataRepoOptions = getModelDataRepoOptions(response.data)
            return selectModelDataRepo(modelDataRepoOptions)
        })
        /**
         * (1.b) Get available Branches
         */
        .then(({ buttonId, returnValue }) => {

            if (buttonId === 'ok') {
                const option = modelDataRepoOptions.find(item => item.value == returnValue)
                modelDataRepoSelection.id = option.value
                modelDataRepoSelection.name = option.text
                return api.listRepoBranches(modelDataRepoSelection.id)
            } else {
                return Promise.reject('Geen Model Data repository geselecteerd!!')
            }

        })
        /**
         * (1.c) Select a non-protected Branch 
         */
        .then(response => {
            const brancheOptions = getModelDataRepoBrancheOptions(response.data)

            if (brancheOptions.length > 0) {
                return app.dialogs.showSelectDropdownDialog(
                    `Selecteer "werk-branche" in repo "${modelDataRepoSelection.name}"`,
                    brancheOptions
                )
            } else {
                const error = 'Geen (non-protected) werk-branches beschikbaar!'
                app.dialogs.showAlertDialog(error)
                return Promise.reject(error)
            }

        })
        /**
         * (2.a) Load Root Meta Data
         */
        .then(({ buttonId, returnValue }) => {

            if (buttonId === 'ok') {
                modelDataRepoSelection.branch = returnValue
                return getMetaDataRoot(modelDataRepoSelection.id, modelDataRepoSelection.branch)
            } else {
                return Promise.reject('Geen werk-branche geselecteerd!')
            }

        })
        /**
         * (2.b) 
         * - Create Project from Root Meta Data
         * - Retrieve Generic Meta Data Fragment
         */
        .then(response => {
            metaModelRoot = createMetaDataRoot(response.data.content, modelDataRepoSelection.id, modelDataRepoSelection.branch)
            return getMetaDataGenericModel(modelDataRepoSelection.id, modelDataRepoSelection.branch)
        })
        /**
         * (2.c) 
         * - Create UMLPacpakge from Generic Meta Data Fragment
         * - Retrieve Specific Meta Data Fragment
         */
        .then(response => {
            genericModelPkg = addMetaDataGenericModel(metaModelRoot, response.data.content)
            return getMetaDataSpecificModel(modelDataRepoSelection.id, modelDataRepoSelection.branch)
        })
        /**
         * (2.d) 
         * - Create UMLPacpakge from Generic Meta Data Fragment
         * - Retrieve Specific Meta Data Fragment
         */
        .then(response => {
            specficModelPkg = addMetaDataSpecficModel(metaModelRoot, response.data.content)
            app.dialogs.showAlertDialog(
                `Bron Meta Data Model succesvol opgehaald van repository=[${modelDataRepoSelection.name}] branch=[${modelDataRepoSelection.branch}] !`
            )
        })

        /**
         * Handle Rejections
         */
        .catch(error => {
            // handle error
            console.log(error)
        })

}

/**
 * Build Source Data Attributes Data Array
 * @param {Array<UMLAttribute>} attributes 
 * @returns 
 */
function buildAttributeDataList(attributes) {
    const attributDataList = []

    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i]
        const attributeData = {
            _type: 'UMLAttribute',
            _id: String(attribute._id),
            _parent: {
                $ref: String(attribute._parent._id)
            },
            name: String(attribute.name),
            documentation: String(attribute.documentation),
            type: {
                $ref: String(attribute.type._id)
            }
        }

        if (attribute.multiplicity) {
            if (attribute.multiplicity != '1') {
                attributeData['multiplicity'] = attribute.multiplicity
            }
        }

        attributDataList.push(attributeData)
    }

    return attributDataList.length > 0 ? attributDataList : undefined
}

/**
 * Build Source Data Dependency Data Array
 * @param {Array<UMLDependency>} ownedElements 
 * @returns 
 */
function buildDependencyDataList(ownedElements) {
    const dependencyeDataList = []
    const dependencyList = ownedElements.filter(element => element instanceof type.UMLDependency)

    for (let i = 0; i < dependencyList.length; i++) {
        const dependency = dependencyList[i]
        const dependencyeData = {
            _type: 'UMLDependency',
            _id: String(dependency._id),
            _parent: {
                $ref: String(dependency._parent._id)
            },
            _source: {
                $ref: String(dependency.source._id)
            },
            _target: {
                $ref: String(dependency.target._id)
            },
        }
        dependencyeDataList.push(dependencyeData)
    }

    return dependencyeDataList.length > 0 ? dependencyeDataList : undefined
}

/**
 * Build Source Data Type Data Array
 * @param {Array<UMLDataType>} ownedElements 
 * @returns 
 */
function buildDataTypeList(ownedElements) {
    const dataTypeDataList = []
    const dataTypeList = ownedElements.filter(element => element instanceof type.UMLDataType)

    for (let i = 0; i < dataTypeList.length; i++) {
        const dataType = dataTypeList[i]
        const dataTypeData = {
            _type: 'UMLDataType',
            _id: String(dataType._id),
            _parent: {
                $ref: String(dataType._parent._id)
            },
            name: String(dataType.name),
            documentation: String(dataType.documentation),
        }
        // only Complex DataTypes can have Attributes (Elementen)
        const attributes = buildAttributeDataList(dataType.attributes)
        if (attributes) dataTypeData['attributes'] = attributes
        // only Simple DataTypes can have Dependencies (DataWaarden)
        const ownedElements = buildDependencyDataList(dataType.ownedElements)
        if (ownedElements) dataTypeData['ownedElements'] = ownedElements
        // add element with the relevant data for the standaard
        dataTypeDataList.push(dataTypeData)
    }

    return dataTypeDataList
}

/**
 * Build Source Data Type Data Array
 * @param {Array<UMLPrimitiveType>} ownedElements 
 * @returns 
 */
function buildPrimitieveTypesDataList(ownedElements) {
    const primitieveTypeDataList = []
    const primitieveTypeList = ownedElements.filter(element => element instanceof type.UMLPrimitiveType)

    for (let i = 0; i < primitieveTypeList.length; i++) {
        const primitieveType = primitieveTypeList[i]
        const primitieveTypeData = {
            _type: 'UMLPrimitiveType',
            _id: String(primitieveType._id),
            _parent: {
                $ref: String(primitieveType._parent._id)
            },
            name: String(primitieveType.name),
        }
        primitieveTypeDataList.push(primitieveTypeData)
    }

    return primitieveTypeDataList
}

/**
 * Build Source Codelijst Data Array
 * @param {Array<UMLEnumeration>} ownedElements 
 * @returns 
 */
function buildCodeLijstDataList(ownedElements) {
    const codeLijstDataList = []
    const codeLijstList = ownedElements.filter(element => element instanceof type.UMLEnumeration)

    for (let i = 0; i < codeLijstList.length; i++) {
        const codeLijst = codeLijstList[i]
        const codeLijstData = {
            _type: 'UMLEnumeration',
            _id: String(codeLijst._id),
            _parent: {
                $ref: String(codeLijst._parent._id)
            },
            name: String(codeLijst.name),
            documentation: String(codeLijst.documentation),
        }
        codeLijstDataList.push(codeLijstData)
    }

    return codeLijstDataList
}

/**
 * Build Source Bericht Class Association Data Array
 * @param {Array<UMLAssociation>} ownedElements 
 * @returns 
 */
function buildBerichtClassAssociationDataList(ownedElements) {
    const associationDataList = []
    const associationList = ownedElements.filter(element => element instanceof type.UMLAssociation)


    for (let i = 0; i < associationList.length; i++) {
        const association = associationList[i]
        const associationData = {
            _type: 'UMLAssociation',
            _id: String(association._id),
            _parent: {
                $ref: String(association._parent._id)
            },
            name: String(association.name),
            end1: {
                _type: 'UMLAssociationEnd',
                _id: String(association.end1._id),
                _parent: {
                    $ref: String(association.end1._parent._id)
                },
                reference: {
                    $ref: String(association.end1.reference._id)
                },
                aggregation: String(association.end1.aggregation)
            },
            end2: {
                _type: 'UMLAssociationEnd',
                _id: String(association.end2._id),
                _parent: {
                    $ref: String(association.end2._parent._id)
                },
                reference: {
                    $ref: String(association.end2.reference._id)
                },
                multiplicity: String(association.end2.multiplicity)
            },
        }
        associationDataList.push(associationData)
    }

    return associationDataList
}

/**
 * Build Source Bericht Class Data Array
 * @param {Array<UMLClass>} ownedElements 
 * @returns 
 */
function buildBerichtClassDataList(ownedElements) {
    const berichtClassDataList = []
    const berichtClassList = ownedElements.filter(element => element instanceof type.UMLClass)

    for (let i = 0; i < berichtClassList.length; i++) {
        const berichtClass = berichtClassList[i]
        const berichtClassData = {
            _type: 'UMLClass',
            _id: String(berichtClass._id),
            _parent: {
                $ref: String(berichtClass._parent._id)
            },
            name: String(berichtClass.name),
            documentation: String(berichtClass.documentation)
        }

        if (berichtClass.attributes) {
            berichtClassData['attributes'] = buildAttributeDataList(berichtClass.attributes)
        }

        if (berichtClass.ownedElements) {
            berichtClassData['ownedElements'] = buildBerichtClassAssociationDataList(berichtClass.ownedElements)
        }

        berichtClassDataList.push(berichtClassData)
    }

    return berichtClassDataList
}

/**
 * Build Source Bericht Package Data Array
 * @param {Array<UMLPackage>} ownedElements 
 * @returns 
 */
function buildBerichtPkgDataList(ownedElements) {
    const berichtPkgDataList = []
    const berichtPkgList = ownedElements.filter(element => element instanceof type.UMLPackage)

    for (let i = 0; i < berichtPkgList.length; i++) {
        const berichtPkg = berichtPkgList[i]
        const berichtPkgData = {
            _type: 'UMLPackage',
            _id: String(berichtPkg._id),
            _parent: {
                $ref: String(berichtPkg._parent._id)
            },
            name: String(berichtPkg.name),
            documentation: String(berichtPkg.documentation),
            ownedElements: buildBerichtClassDataList(berichtPkg.ownedElements)
        }
        berichtPkgDataList.push(berichtPkgData)
    }

    return berichtPkgDataList
}

/**
 * Store StarUML Project Specfic Data in Repository
 * @param {Project} root 
 * @param {String} branch 
 * @param {String | Number} projectId 
 * @param {String} commitMessage 
 */
function update_Specfic_SourceDataInRepo(root, branch, projectId, commitMessage) {
    // build bericht model data
    const specificPkg = utils.getUMLPackagElementByName(root.ownedElements, istGlobals.SPECIFIC_MODEL_PACKAGE.name)
    const specificPkgId = String(specificPkg._id)
    const berichtenModelPkg = utils.getUMLPackagElementByName(specificPkg.ownedElements, istGlobals.BERICHTEN_PACKAGE.name)
    const berichtenModelPkgId = String(berichtenModelPkg._id)

    const berichtenModelPkgData = {
        _type: 'UMLPackage',
        _id: berichtenModelPkgId,
        _parent: {
            $ref: specificPkgId
        },
        name: istGlobals.BERICHTEN_PACKAGE.name,
        documentation: istGlobals.BERICHTEN_PACKAGE.documentation,
        ownedElements: buildBerichtPkgDataList(berichtenModelPkg.ownedElements)
    }

    // build specific model data
    const specificModelMetaData = {
        _type: 'UMLPackage',
        _id: specificPkgId,
        _parent: {
            $ref: root._id
        },
        name: String(specificPkg.name),
        documentation: String(specificPkg.documentation),
        ownedElements: [berichtenModelPkgData]
    }

    // update specific source data
    api.updateExistingFileInRepo(
        projectId,
        branch,
        `${sourceData.path}/${sourceData.specificModelMetaDataFile}`,
        utils.jsonToString(specificModelMetaData),
        commitMessage
    )
        .then(response => {
            // handle success
            console.log('update specific source data')
            console.log('==========================')
            console.log(response.status)
            console.log(response.data)
        })
        .catch(error => {
            // handle error
            console.log(error)
        })
        .finally(() => {
            // always executed

        })
}

/**
 * Store StarUML Project Generic and Specfic Data in Repository
 * @param {Project} root 
 * @param {String} branch 
 * @param {String | Number} projectId 
 * @param {String} commitMessage 
 */
function update_Generic_Specfic_SourceDataInRepo(root, branch, projectId, commitMessage) {
    // build gegevens model data
    const genericPkg = utils.getUMLPackagElementByName(root.ownedElements, istGlobals.GENERIC_MODEL_PACKAGE.name)
    const genericPkgId = String(genericPkg._id)
    const gegevensModelPkg = utils.getUMLPackagElementByName(genericPkg.ownedElements, istGlobals.GEGEVENS_MODEL_PACKAGE.name)
    const gegevensModelPkgId = String(gegevensModelPkg._id)
    const gegevensModelPkgData = {
        _type: 'UMLPackage',
        _id: gegevensModelPkgId,
        _parent: {
            $ref: genericPkgId
        },
        name: istGlobals.GEGEVENS_MODEL_PACKAGE.name,
        documentation: istGlobals.GEGEVENS_MODEL_PACKAGE.documentation,
        ownedElements: buildDataTypeList(gegevensModelPkg.ownedElements)
    }

    // build primtive types data
    const primitieveTypenPkg = genericPkg.ownedElements.find(element => element._id == primitiveTypesPkgId && element instanceof type.UMLPackage)
    const primitieveTypenPkgData = {
        _type: 'UMLPackage',
        _id: primitieveTypenPkg._id,
        _parent: {
            $ref: genericPkgId
        },
        name: String(primitieveTypenPkg.name),
        documentation: String(primitieveTypenPkg.documentation),
        ownedElements: buildPrimitieveTypesDataList(primitieveTypenPkg.ownedElements)
    }

    // build codelijsten data
    const codeLijstenPkg = genericPkg.ownedElements.find(element => element._id == codelijstenPkgId && element instanceof type.UMLPackage)
    const codeLijstenPkgData = {
        _type: 'UMLPackage',
        _id: codeLijstenPkg._id,
        _parent: {
            $ref: genericPkgId
        },
        name: String(codeLijstenPkg.name),
        documentation: String(codeLijstenPkg.documentation),
        ownedElements: buildCodeLijstDataList(codeLijstenPkg.ownedElements)
    }

    // build generic model data
    const genericModelMetaData = {
        _type: 'UMLPackage',
        _id: genericPkgId,
        _parent: {
            $ref: root._id
        },
        name: String(genericPkg.name),
        documentation: String(genericPkg.documentation),
        ownedElements: [
            gegevensModelPkgData,
            primitieveTypenPkgData,
            codeLijstenPkgData
        ]
    }

    // update generic package data
    api.updateExistingFileInRepo(
        projectId,
        branch,
        `${sourceData.path}/${sourceData.genericModelMetaDataFile}`,
        utils.jsonToString(genericModelMetaData),
        commitMessage
    )
        .then(response => {
            // handle success
            console.log('update generic source data')
            console.log('==========================')
            console.log(response.status)
            console.log(response.data)
            update_Specfic_SourceDataInRepo(root, branch, projectId, commitMessage)
        })
        .catch(error => {
            // handle error
            console.log(error)
        })
        .finally(() => {
            // always executed

        })
}

/**
 * Store StarUML Project Root, Generic and Specfic Data in Repository
 * @param {Project} root 
 * @param {String} rootId 
 * @param {String} branch 
 * @param {String | Number} projectId 
 * @param {String} commitMessage 
 */
function update_Root_Generic_Specfic_SourceDataInRepo(root, branch, projectId, commitMessage) {
    const rootMetaDataFilePath = `${sourceData.path}/${sourceData.rootMetaDataFile}`
    const rootMetaData = {
        _type: 'Project',
        _id: String(root._id),
        name: String(root.name),
        version: String(root.version)
    }
    api.updateExistingFileInRepo(projectId, branch, rootMetaDataFilePath, utils.jsonToString(rootMetaData), commitMessage)
        .then(response => {
            // handle success
            console.log('update root source data')
            console.log('=======================')
            console.log(response.status)
            console.log(response.data)
            update_Generic_Specfic_SourceDataInRepo(root, branch, projectId, commitMessage)
        })
        .catch(error => {
            // handle error
            console.log(error)
        })
        .finally(() => {
            // always executed

        })
}

/**
 * Store StarUML Project Source Data in Repository
 */
function storeSourceDataInRepo() {
    // initialize store data
    const root = app.project.getProject()
    const branch = utils.getTagValue(root, 'branch')
    const projectId = utils.getTagValue(root, 'projectId')
    const commitMessage = 'StarUML.storeSourceDataInRepo-functie d.d. ' + new Date()

    // store all source data
    update_Root_Generic_Specfic_SourceDataInRepo(root, branch, projectId, commitMessage)
}


exports.retrieve = retrieveSourceDataFromRepo
exports.store = storeSourceDataInRepo