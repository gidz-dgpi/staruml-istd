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
 * @param {String} standaardId
 * @param {UMLPackage} gegevensModelPkg 
 * @param {XSDObject} simpleType 
 * @returns {UMLDataType}
 */
function addSimpleType(standaardId, gegevensModelPkg, simpleType) {
    console.log('simpleType')
    console.log(simpleType)
    const dataTypeId = app.repository.generateGuid()
    const dataTypeName = simpleType.attributes.name
    const dataTypeDocumentation = utils.getXsAnnotationDocumentationText(simpleType.elements)
    const xsRestriction = utils.getXsRestriction(simpleType.elements)
    const primitiveTypeId = primitiveTypes.getTypeId(xsRestriction.attributes.base)
    const dataTypeElements = []
    dataTypeElements.push(buildUMLDependency(dataTypeId, primitiveTypeId))
    const xsRestrictionAnnotation = utils.getXsAnnotation(xsRestriction.elements)
    if (xsRestrictionAnnotation) {
        const xsAppInfo = xsRestrictionAnnotation.elements.find(element => element.name == 'xs:appinfo')

        if (xsAppInfo) {
            const codelijstId = standaardId + ':codelijstNaam'
            const codeLijst = xsAppInfo.elements.find(element => element.name == codelijstId)
            const codeLijstTextObject = codeLijst.elements.find(element => element.type == 'text')

            if (codeLijstTextObject) {
                const codeLijstTextParts = codeLijstTextObject.text.split(':')
                const codeLijstId = codeLijstTextParts[0].trim()
                console.log(codeLijstId)
                const codeLijstDocumentation = codeLijstTextParts[1].trim()
                console.log(codeLijstDocumentation)
            }

        }

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

function addComplexType(standaardId, gegevensModelPkg, complexType) {
    console.log('complexType')
    console.log(complexType)

}

/**
 * Importeer Basisschema XSD Elementen als UML-DataTypen 
 * @param {UMLPackage} gegevensModelPkg 
 * @param {XSDObject} basisSchema 
 */
function importDataTypes(gegevensModelPkg, basisSchema) {
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
        addSimpleType(standaardId, gegevensModelPkg, simpleTypes[i])
    }

    const complexTypes = modelElements.filter(element => element.name == 'xs:complexType')
    for (let i = 0; i < complexTypes.length; i++) {
        addComplexType(standaardId, gegevensModelPkg, complexTypes[i])
    }
    
}

/**
 * Import iStandaard Bericht from bericht-Object
 * @param {Object} bericht 
 */
function importGegevensModel(basisSchema) {
    try {
        const project = app.project.getProject()
        primitiveTypes.init(project)
        gegevensModelPkg = app.factory.createModel({
            id: 'UMLPackage',
            parent: project,
            modelInitializer: elem => {
                elem.name = GEGEVENS_MODEL_PACKAGE.name
                elem.documentation = GEGEVENS_MODEL_PACKAGE.documentation
            }
        })

        importDataTypes(gegevensModelPkg, basisSchema)
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