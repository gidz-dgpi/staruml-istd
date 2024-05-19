/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Basisschema XSD Import
 */

const fs = require('fs')
const convert = require('xml-js');
const utils = require('./dgpi-utils')
const primitiveTypes = require('./istd-primitive-types')
const codelijsten = require('./istd-codelijsten')

const GEGEVENS_MODEL_PACKAGE = {
    name: 'Gegevens',
    documentation: 'Datatypen voor iStandaarden (CDT = Complextype en LDT = Simpletype)'
}

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
    console.log('simpleType')
    console.log(simpleType)
    const dataTypeId = app.repository.generateGuid()
    const dataTypeName = simpleType.attributes.name
    const dataTypeDocumentation = utils.getXsAnnotationDocumentationText(simpleType.elements)
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
    console.log('complexType')
    console.log(complexType)

}

/**
 * Importeer Basisschema XSD Elementen als UML-DataTypen 
 * @param {UMLPackage} gegevensModelPkg 
 * @param {UMLPackage} primitiveTypePkg
 * @param {UMLPackage} codelijstenPkg
 * @param {XSDObject} basisSchema 
 */
function importDataTypes(gegevensModelPkg, codelijstenPkg, basisSchema) {
    const modelElements = basisSchema.elements[0].elements
    //console.log('modelElements')
    //console.log(modelElements)
    const xsAnnotation = utils.getXsAnnotation(modelElements)
    const xsAppinfo = xsAnnotation.elements.find(element => element.name == 'xs:appinfo')
    const standaardInfo = xsAppinfo.elements.find(element => element.name.match(':standaard'))
    const standaardInfoElement = standaardInfo.elements[0]
    const standaardId = standaardInfoElement.text
    console.log('standaardId = ' + standaardId)

    const simpleTypes = modelElements.filter(element => element.name == 'xs:simpleType')
    for (let i = 0; i < simpleTypes.length; i++) {
        addSimpleType(gegevensModelPkg, codelijstenPkg, standaardId, simpleTypes[i])
    }

    const complexTypes = modelElements.filter(element => element.name == 'xs:complexType')
    for (let i = 0; i < complexTypes.length; i++) {
        addComplexType(gegevensModelPkg, codelijstenPkg, standaardId, complexTypes[i])
    }
    
}

/**
 * Import iStandaard Bericht from bericht-Object
 * @param {Object} bericht 
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
                elem.name = GEGEVENS_MODEL_PACKAGE.name
                elem.documentation = GEGEVENS_MODEL_PACKAGE.documentation
            }
        })

        importDataTypes(gegevensModelPkg, codelijstenPkg, basisSchema)
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