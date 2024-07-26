const istGlobals = require('../istd/istd-globals')
const codelijstenPkgId = require('../istd/istd-codelijsten').codelijstenPkgId
const primitiveTypesPkgId = require('../istd/istd-primitive-types').primitiveTypesPkgId
const sourceData = require('./repo-globals').sourceData
const repoPrefs = require('./repo-prefs')
const api = require('./repo-api')
const utils = require('../dgpi/dgpi-utils')


function loadMetaDataFragments(root, projectId, branch) {

    api.getFileFromRepo(projectId, `${sourceData.path}/${sourceData.genericModelMetaDataFile}`, branch)
        .then(response => {
            app.project.importFromJson(root, utils.encodeBase64JsonStrToObj(response.data.content))

            api.getFileFromRepo(projectId, `${sourceData.path}/${sourceData.specificModelMetaDataFile}`, branch)
                .then(response => {
                    app.project.importFromJson(root, utils.encodeBase64JsonStrToObj(response.data.content))
                })
                .catch(reason => {
                    console.log(reason)
                })

        })
        .catch(reason => {
            console.log(reason)
        })

}

function LoadMetaDataRootAndFragments(projectId, branch) {
    api.getFileFromRepo(projectId, `${sourceData.path}/${sourceData.rootMetaDataFile}`, branch)
        .then(response => {
            // create new application root object
            const root = app.project.loadFromJson(utils.encodeBase64JsonStrToObj(response.data.content))
            // add Tags that are used to keep repository storage locations info
            utils.addStringTag(root, 'projectId', projectId)
            utils.addStringTag(root, 'branch', branch)
            console.log(root)
            // add Meta Data Fragments for different levels
            loadMetaDataFragments(root, projectId, branch)
        })
        .catch(reason => {
            console.log(reason)
        })
}

/**
 * Select Model Data Repository and Load Source Data
 */
function selectRepoAndLoadSourceData() {
    api.init()
    api.listProjects(false, undefined, true)
        .then(response => {
            const repoList = response.data
            const modelGroupPath = app.preferences.get(repoPrefs.keys.repoModelGroupPath)
            const modelDataList = repoList.filter(item => item.namespace.full_path.startsWith(modelGroupPath) && item.name != 'gitlab-profile')
            const options = []

            for (let i = 0; i < modelDataList.length; i++) {
                options.push({
                    text: modelDataList[i].name,
                    value: modelDataList[i].id
                })
            }

            app.dialogs.showSelectDropdownDialog("Selecteer een Model Data repository.", options).then(({ buttonId, returnValue }) => {
                if (buttonId === 'ok') {
                    const branch = 'test' // branch selection in later phase
                    const projectId = returnValue
                    LoadMetaDataRootAndFragments(projectId, branch)
                } else {
                    console.log("User canceled")
                }
            })

        })
        .catch(error => {
            console.log(error)
        })
        .finally(() => {
            // always executed

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
 * Store StarUML Project Root Data in Repository
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
            const genericPkg = utils.getUMLPackagElementByName(root.ownedElements, istGlobals.GENERIC_MODEL_PACKAGE.name)
            update_Generic_Specfic_SourceDataInRepo(genericPkg, branch, projectId, commitMessage)
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
 * Store StarUML Project Root Data in Repository
 * @param {UMLPackage} genericPkg 
 * @param {String} genericPkgId 
 * @param {String} branch 
 * @param {String | Number} projectId 
 * @param {String} commitMessage 
 */
function update_Generic_Specfic_SourceDataInRepo(genericPkg, branch, projectId, commitMessage) {
    // build gegevens model data
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

    // update generic package data
    const genericModelMetaDataFilePath = `${sourceData.path}/${sourceData.genericModelMetaDataFile}`
    const genericModelMetaData = {
        _type: 'UMLPackage',
        _id: genericPkgId,
        _parent: {
            $ref: gegevensModelPkg._parent._id
        },
        name: String(genericPkg.name),
        documentation: String(genericPkg.documentation),
        ownedElements: [
            gegevensModelPkgData,
            primitieveTypenPkgData,
            codeLijstenPkgData
        ]
    }
    api.updateExistingFileInRepo(projectId, branch, genericModelMetaDataFilePath, utils.jsonToString(genericModelMetaData), commitMessage)
        .then(response => {
            // handle success
            console.log('update generic source data')
            console.log('==========================')
            console.log(response.status)
            console.log(response.data)
            // store specific package
            
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


exports.selectAndLoad = selectRepoAndLoadSourceData
exports.store = storeSourceDataInRepo