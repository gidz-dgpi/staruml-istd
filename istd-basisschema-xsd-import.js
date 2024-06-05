/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Basisschema XSD Import
 */

const fs = require('fs')
const convert = require('xml-js');
const globals = require('./istd-globals')
const utils = require('./dgpi-utils')
const primitiveTypes = require('./istd-primitive-types')
const codelijsten = require('./istd-codelijsten')

/**
 * Build a UMLDependency Object Element To Import
 * @param {String} sourceId 
 * @param {String} targetId 
 * @returns {Object}
 */
function buildUMLDependency(sourceId, targetId) {
    return {
        _type: 'UMLDependency',
        _id: app.repository.generateGuid(),
        _parent: {
            $ref: sourceId
        },
        source: {
            $ref: sourceId
        },
        target: {
            $ref: targetId
        }
    }
}

/**
 * Add a UML DataType as a iStandaard Simple Type
 * @param {UMLPackage} gegevensModelPkg 
 * @param {UMLPackage} codelijstenPkg
 * @param {String} standaardId
 * @param {XSDObject} simpleType 
 * @returns {UMLDataType}
 */
function addSimpleType(gegevensModelPkg, codelijstenPkg, standaardId, simpleType) {
    const dataTypeId = app.repository.generateGuid()
    const dataTypeName = simpleType.attributes.name
    const dataTypeDocumentation = utils.getXsAnnotationDocumentationText(simpleType)
    const xsRestriction = utils.getXsRestriction(simpleType.elements)
    const primitiveTypeId = primitiveTypes.getTypeId(xsRestriction.attributes.base)
    const dataTypeElements = []
    dataTypeElements.push(buildUMLDependency(dataTypeId, primitiveTypeId))

    const codelijstId = codelijsten.getCodelijstId(codelijstenPkg, standaardId, xsRestriction)
    if (codelijstId) {
        dataTypeElements.push(buildUMLDependency(dataTypeId, codelijstId))
    }

    const dataTypeElem = {
        _type: 'UMLDataType',
        _id: dataTypeId,
        _parent: {
            $ref: gegevensModelPkg._id
        },
        name: dataTypeName,
        documentation: dataTypeDocumentation,
        ownedElements: dataTypeElements
    }
    return app.project.importFromJson(gegevensModelPkg, dataTypeElem) 
}

/**
 * Add a UML DataType as a iStandaard Complex Type
 * @param {UMLPackage} gegevensModelPkg 
 * @param {UMLPackage} codelijstenPkg
 * @param {String} standaardId
 * @param {XSDObject} simpleType 
 * @returns {UMLDataType}
 */
function addComplexType(gegevensModelPkg, codelijstenPkg, standaardId, complexType) {
    const dataTypeId = app.repository.generateGuid()
    const dataTypeName = complexType.attributes.name
    const dataTypeDocumentation = utils.getXsAnnotationDocumentationText(complexType)
    const dataTypeElem = {
        _type: 'UMLDataType',
        _id: dataTypeId,
        _parent: {
            $ref: gegevensModelPkg._id
        },
        name: dataTypeName,
        documentation: dataTypeDocumentation
    }
    return app.project.importFromJson(gegevensModelPkg, dataTypeElem) 
}

/**
 * Add a UML DataType Attributes from Complex Type Sequence
 * @param {UMLPackage} gegevensModelPkg 
 * @param {UMLPackage} codelijstenPkg
 * @param {String} standaardId
 * @param {XSDObject} simpleType 
 * @returns {UMLDataType}
 */
function addComplexTypeAttributes(gegevensModelPkg, codelijstenPkg, standaardId, complexType) {
    const dataTypeName = complexType.attributes.name 
    const complexDataType = gegevensModelPkg.ownedElements.find(element => element._type = 'UMLDataType' && element.name == dataTypeName)
    const seqElems = complexType.elements.find(element => element.name == 'xs:sequence').elements

    for (let i = 0; i < seqElems.length; i++) {
        const seqElem = seqElems[i]
        //console.log(seqElem)
        const attrName = seqElem.attributes.name
        const attrTypeName = utils.getDataTypeName(seqElem.attributes.type)
        const attrType = utils.getUMLDataType(gegevensModelPkg, attrTypeName)
        const attrMultiplicity = utils.getUMLAttributeMultiplicity(seqElem.attributes)
        const  attrDocumentation = utils.getXsAnnotationDocumentationText(seqElem)
        utils.addUMLAttribute(complexDataType, attrName, attrType, attrMultiplicity, attrDocumentation)
    }

    app.modelExplorer.collapse(complexDataType)
}

/**
 * Get BasisSchema XSD AppInfo MetaData
 * @param {XSDAppInfo} xsAppinfo 
 * @returns 
 */
function getXsdBasisSchemaMetaData(xsAppinfo) {
    const xsdMetaData = utils.getXsdMetaData(xsAppinfo)

    return {
        standaard: xsdMetaData.standaard,
        bericht: xsdMetaData.bericht,
        release: xsdMetaData.release,
        basisschemaXsdVersie: utils.getAppInfoElementText(xsAppinfo.elements.find(element => element.name == xsdMetaData.standaard + ':BasisschemaXsdVersie')),
        basisschemaXsdMinVersie: utils.getAppInfoElementText(xsAppinfo.elements.find(element => element.name == xsdMetaData.standaard + ':BasisschemaXsdMinVersie')),
        basisschemaXsdMaxVersie: utils.getAppInfoElementText(xsAppinfo.elements.find(element => element.name == xsdMetaData.standaard + ':BasisschemaXsdMaxVersie')),
    }
}

/**
 * Importeer Basisschema XSD Elementen als UML-DataTypen 
 * @param {UMLPackage} gegevensModelPkg 
 * @param {UMLPackage} primitiveTypePkg
 * @param {UMLPackage} codelijstenPkg
 * @param {XSDObject} basisSchema 
 */
function importDataTypes(gegevensModelPkg, codelijstenPkg, basisSchema) {
    const modelBase = basisSchema.elements[0]
    const modelElements = modelBase.elements
    const xsAnnotation = utils.getXsAnnotation(modelBase)
    const xsAppinfo = xsAnnotation.elements.find(element => element.name == 'xs:appinfo')
    const xsdMetaData = getXsdBasisSchemaMetaData(xsAppinfo)
    console.log(xsdMetaData)
    utils.addStringTag(gegevensModelPkg, 'standaard', xsdMetaData.standaard)

    const simpleTypes = modelElements.filter(element => element.name == 'xs:simpleType')
    for (let i = 0; i < simpleTypes.length; i++) {
        addSimpleType(gegevensModelPkg, codelijstenPkg, xsdMetaData.standaard, simpleTypes[i])
    }

    const complexTypes = modelElements.filter(element => element.name == 'xs:complexType')
    for (let i = 0; i < complexTypes.length; i++) {
        addComplexType(gegevensModelPkg, codelijstenPkg, xsdMetaData.standaard, complexTypes[i])
    }
    for (let i = 0; i < complexTypes.length; i++) {
        addComplexTypeAttributes(gegevensModelPkg, codelijstenPkg, xsdMetaData.standaard, complexTypes[i])
    }
    
}

/**
 * Import iStandaard Gegevensmodel (incl. Codelijsten) from Basisschema XSD-Object
 * @param {XSDObject} basisSchema 
 */
function importGegevensModel(basisSchema) {
    try {
        const root = app.project.getProject()
        const primitiveTypePkg = primitiveTypes.init(root)
        const codelijstenPkg = codelijsten.init(root)
        gegevensModelPkg = app.factory.createModel({
            id: 'UMLPackage',
            parent: root,
            modelInitializer: elem => {
                elem.name = globals.GEGEVENS_MODEL_PACKAGE.name
                elem.documentation = globals.GEGEVENS_MODEL_PACKAGE.documentation
            }
        })

        importDataTypes(gegevensModelPkg, codelijstenPkg, basisSchema)
        app.modelExplorer.collapse(primitiveTypePkg)
        app.modelExplorer.collapse(codelijstenPkg)
        app.modelExplorer.collapse(gegevensModelPkg)
    } catch (err) {
        console.error(err);
    }
}

/**
 * Import XSD File of a iStandaard Basisschema
 * @param {String} xsdFile 
 */
function importBasisSchemaXsdFile(xsdFile) {

    try {
        const xsdStr = fs.readFileSync(xsdFile, 'utf8');
        try {
            const basisSchema = convert.xml2js(xsdStr)
            try {
                importGegevensModel(basisSchema)
            } catch (err) {
                console.error(err);
            }
        } catch (err) {
            console.error(err);
        }
    } catch (err) {
        console.error(err);
    }

}

exports.importBasisSchemaXsdFile = importBasisSchemaXsdFile