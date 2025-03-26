/**
 * StarUML iStandaard Source Data Repository Functions
 */

const istGlobals = require('../istd/istd-globals')
const codelijstenPkgId = require('../istd/istd-codelijsten').codelijstenPkgId
const primitiveTypesPkgId = require('../istd/istd-primitive-types').primitiveTypesPkgId
const utils = require('../dgpi/dgpi-utils')
const trans = require('./repo-trans-source-data')

const GitLabCommitAction = require('./gitlab-commit-action.js')

/**
 * Get Repository Selection Options from Repo List
 * @param {String[]} repoList
 */
function getRepoOptions(repoList) {
    const repoOptions = []

    for (let i = 0; i < repoList.length; i++) {
        repoOptions.push({
            text: String(repoList[i].name),
            value: String(repoList[i].id)
        })
    }

    return repoOptions
}

/**
 * Get Branche Options from Branche List
 * @param {String[]} brancheList 
 */
function getBrancheOptions(brancheList) {
    const brancheOptions = []

    for (let i = 0; i < brancheList.length; i++) {
        const branchName = String(brancheList[i].name)
        brancheOptions.push({
            text: branchName,
            value: branchName
        })
    }

    return brancheOptions
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
 * Retrieve StarUML Source Meta Data from Repository
 */
function retrieveSourceDataFromRepo() {
    // Initialize process vars
    let modelDataRepoOptions = []
    let modelDataRepoSelection = {
        id: undefined,
        name: undefined,
        branch: undefined,
    }
    let metaModelRoot = undefined
    trans.init()

    /**
     * (0) Get available Model Data Repos 
     */
    trans.getModelDataRepoList()
        /**
         * (1.a) Select a Model Data Repo
         */
        .then(modelDataRepoList => {
            modelDataRepoOptions = getRepoOptions(modelDataRepoList)
            return selectModelDataRepo(modelDataRepoOptions)
        })
        /**
         * (1.b) Get available Work Branches
         */
        .then(({ buttonId, returnValue }) => {

            if (buttonId === 'ok') {
                const option = modelDataRepoOptions.find(item => item.value == returnValue)
                modelDataRepoSelection.id = option.value
                modelDataRepoSelection.name = option.text
                return trans.getWorkBranches(modelDataRepoSelection.id)
            } else {
                return Promise.reject('Geen Model Data repository geselecteerd!!')
            }

        })
        /**
         * (1.c) Select a Work Branch 
         */
        .then(workBrancheList => {
            const brancheOptions = getBrancheOptions(workBrancheList)

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
                return trans.getMetaDataRoot(modelDataRepoSelection.id, modelDataRepoSelection.branch)
            } else {
                return Promise.reject('Geen werk-branche geselecteerd!')
            }

        })
        /**
         * (2.b) 
         * - Create Project from Root Meta Data
         * - Retrieve Generic Source Data Fragment
         */
        .then(response => {
            metaModelRoot = trans.createMetaDataRoot(response.data.content, modelDataRepoSelection.id, modelDataRepoSelection.branch)
            return trans.getMetaDataGenericModel(modelDataRepoSelection.id, modelDataRepoSelection.branch)
        })
        /**
         * (2.c) 
         * - Create UMLPackage from Generic Meta Data Fragment
         * - Retrieve Specific Meta Data Fragment
         */
        .then(response => {
            metaModelGenericPkg = trans.addMetaDataToRoot(metaModelRoot, response.data.content)
            return trans.getMetaDataSpecificModel(modelDataRepoSelection.id, modelDataRepoSelection.branch)
        })
        /**
         * (2.d) 
         * - Create UMLPackage from Specific Meta Data Fragment
         * - Retrieve Release Info Data Fragment
         */
        .then(response => {
            metaSpecficModelPkg = trans.addMetaDataToRoot(metaModelRoot, response.data.content)
            return trans.getReleaseInfoModel(modelDataRepoSelection.id, modelDataRepoSelection.branch)
        })
        /**
         * (2.e)
         * = Create UMLPackage from Release Info Data Fragment
         * - Alert Successful Retrieval
         */
        .then(response => {
            trans.addMetaDataToRoot(metaModelRoot, response.data.content)
            return app.dialogs.showInfoDialog(
                `Bron Meta Data Model succesvol opgehaald van repository=[${modelDataRepoSelection.name}] branch=[${modelDataRepoSelection.branch}] !`
            )
        })

        /**
         * Handle Rejections
         */
        .catch(error => {
            // handle error
            console.log(error)
            return app.dialogs.showAlertDialog(
                `Fout bij ophalen brondata Meta Model van repository=[${modelDataRepoSelection.name}] branch=[${modelDataRepoSelection.branch}]\n${error}`
            )
            .then(() => { return })
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

        if (attribute.isID) {
            attributeData['isID'] = attribute.isID
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
            source: {
                $ref: String(dependency.source._id)
            },
            target: {
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
        if (attributes) {
            dataTypeData['attributes'] = attributes
        }

        // only Simple DataTypes can have Dependencies (DataWaarden)
        const ownedElements = buildDependencyDataList(dataType.ownedElements)
        if (ownedElements) {
            dataTypeData['ownedElements'] = ownedElements
        }

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
 * Build Array of Tag
 * @param {Tag} tags 
 * @param {String} parentId 
 * @returns {Array}
 */
function buildPackageTagList(tags, parentId) {
    const result = []

    tags.forEach(tag => {
        result.push({
            _parent: {
                $ref: String(parentId)
            },
            name: tag.name,
            value: tag.value,
            _type: "Tag"
        })
    })

    return result
}

/**
 * Build Source Bericht Package Data Array
 * @param {Array<UMLPackage>} ownedElements 
 * @returns 
 */
function buildBerichtPkgDataList(ownedElements) {
    const berichtPkgDataList = []
    const berichtPkgList = ownedElements.filter(element => element instanceof type.UMLPackage)

    berichtPkgList.forEach(berichtPkg => {
        const berichtPkgData = {
            _type: 'UMLPackage',
            _id: String(berichtPkg._id),
            _parent: {
                $ref: String(berichtPkg._parent._id)
            },
            tags: buildPackageTagList(berichtPkg.tags, berichtPkg._id),
            name: String(berichtPkg.name),
            documentation: String(berichtPkg.documentation),
            ownedElements: buildBerichtClassDataList(berichtPkg.ownedElements)
        }
        berichtPkgDataList.push(berichtPkgData)
    })

    return berichtPkgDataList
}

/**
 * Get the generic source data (codelijsten, primitive data types, datatypes, and so on)
 * @param {Project} root 
 * @returns 
 */
function getGenericSourceData(root) {
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
    return {
        _type: 'UMLPackage',
        _id: genericPkgId,
        _parent: {
            $ref: root._id
        },
        name: String(genericPkg.name),
        documentation: String(genericPkg.documentation),
        ownedElements: [
            primitieveTypenPkgData,
            codeLijstenPkgData,
            gegevensModelPkgData
        ]
    }
}

/**
 * Get the project (root) source data
 * @param {Project} root 
 * @returns 
 */
function getRootSourceData(root) {
    return {
        _type: 'Project',
        _id: String(root._id),
        name: String(root.name),
        version: String(root.version)
    }
}

/**
 * Get the specific source data (berichten)
 * @param {Project} root 
 * @returns 
 */
function getSpecificSourceData(root) {
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
    return {
        _type: 'UMLPackage',
        _id: specificPkgId,
        _parent: {
            $ref: root._id
        },
        name: String(specificPkg.name),
        documentation: String(specificPkg.documentation),
        ownedElements: [berichtenModelPkgData]
    }
}

/**
 * 
 * @param {Project} root 
 * @returns {UMLPackage}
 */
function getReleaseInfoData(root) {
    const releaseInfoPkg = utils.getUMLPackagElementByName(root.ownedElements, istGlobals.RELEASE_INFO_PACKAGE.name)
    const releaseInfoPkgId = String(releaseInfoPkg._id)

    console.log(releaseInfoPkg)

    const ownedElements = []
    // Only save the child packages and their tags.
    console.log('Start building ownedElements for Release info package...')
    releaseInfoPkg.ownedElements.filter(
        item => item.constructor.name == 'UMLPackage'
    ).forEach(
        packageItem => {
            console.log(`Processing UMLPackage ${packageItem.name}`)
            ownedElements.push({
                _type: 'UMLPackage',
                _id: packageItem._id,
                _parent: {
                    $ref: releaseInfoPkgId,
                },
                name: String(packageItem.name),
                documentation: String(packageItem.documentation),
                tags: buildPackageTagList(packageItem.tags, packageItem._id)
            })
        }
    )

    return {
        _type: 'UMLPackage',
        _id: releaseInfoPkgId,
        _parent: {
            $ref: root._id
        },
        name: String(releaseInfoPkg.name),
        documentation: String(releaseInfoPkg.documentation),
        tags: buildPackageTagList(releaseInfoPkg.tags, releaseInfoPkgId),
        ownedElements: ownedElements
    }
}

/**
 * 
 * @param {Project} root 
 * @returns {GitLabCommitAction}
 */
function prepCommitGenericSourceDataToRepo(root) {
    return trans.getGenericSourceDataActions(getGenericSourceData(root))
}

/**
 * 
 * @param {Project} root 
 * @returns {GitLabCommitAction}
 */
function prepCommitRootSourceDataToRepo(root) {
    return trans.getRootSourceDataActions(getRootSourceData(root))
}

/**
 * 
 * @param {Project} root 
 * @returns {GitLabCommitAction}
 */
function prepCommitSpecificSourceDataToRepo(root) {
    return trans.getSpecificSourceDataActions(getSpecificSourceData(root))
}

/**
 * 
 * @param {Project} root 
 * @returns {GitLabCommitAction}
 */
function prepCommitReleaseInfoSourceDataToRepo(root) {
    return trans.getReleaseInfoSourceDataActions(getReleaseInfoData(root))
}

/**
 * Prepares commit actions for storing the source data to the repository
 * @param {Project} root 
 * @returns {Array[GitLabCommitAction]}
 */
function prepCommitActions(root) {
    return [
        prepCommitRootSourceDataToRepo(root),
        prepCommitGenericSourceDataToRepo(root),
        prepCommitSpecificSourceDataToRepo(root),
        prepCommitReleaseInfoSourceDataToRepo(root),
    ]
}

exports.prepCommitActions = prepCommitActions
exports.retrieve = retrieveSourceDataFromRepo
