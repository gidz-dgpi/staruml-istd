/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Basisschema XSD Import
 */

const fs = require('fs')
const convert = require('xml-js');
const utils = require('./dgpi-utils')

const GEGEVENS_MODEL_PACKAGE = {
    name: 'Gegevens'
}


/**
 * Add a UML DataType as a iStandaard Simple Type
 * @param {UMLPackage} gegevensModelPkg 
 * @param {XSDObject} simpleType 
 * @returns {UMLDataType}
 */
function addSimpleType(gegevensModelPkg, simpleType) {
    console.log('simpleType')
    console.log(simpleType)
    const dataTypeId = app.repository.generateGuid()
    const dataTypeName = simpleType.attributes.name
    const dataTypeElem = {
        _type: 'UMLDataType',
        _id: dataTypeId,
        _parent: {
            $ref: gegevensModelPkg._id
        },
        name: dataTypeName
    }
    return app.project.importFromJson(gegevensModelPkg, dataTypeElem)
}

function addComplexType(gegevensModelPkg, complexType) {
    console.log('complexType')
    console.log(complexType)

}

/**
 * Importeer Basisschema XSD Elementen als UML-DataTypen 
 * @param {UMLPackage} gegevensModelPkg 
 * @param {XSDObject} basisSchema 
 */
function importDataTypen(gegevensModelPkg, basisSchema) {
    const modelElements = basisSchema.elements[0].elements
    //console.log('modelElements')
    //console.log(modelElements)
    const xsAnnotation = utils.getXsAnnotation(modelElements)
    const xsAppinfo = xsAnnotation.elements.find(element => element.name == 'xs:appinfo')
    const standaardInfo = xsAppinfo.elements.find(element => element.name.match(':standaard'))
    const standaardInfoElement = standaardInfo.elements[0]
    const standaardName = standaardInfoElement.text
    console.log('standaard = ' + standaardName)

    const simpleTypes = modelElements.filter(element => element.name == 'xs:simpleType')
    for (let i = 0; i < simpleTypes.length; i++) {
        addSimpleType(gegevensModelPkg, simpleTypes[i])
    }

    const complexTypes = modelElements.filter(element => element.name == 'xs:complexType')
    for (let i = 0; i < complexTypes.length; i++) {
        addComplexType(gegevensModelPkg, complexTypes[i])
    }
    
}

/**
 * Import iStandaard Bericht from bericht-Object
 * @param {Object} bericht 
 */
function importGegevensModel(basisSchema) {
    try {
        const project = app.project.getProject()
        gegevensModelPkg = app.factory.createModel({
            id: 'UMLPackage',
            parent: project,
            modelInitializer: elem => {
                elem.name = GEGEVENS_MODEL_PACKAGE.name
            }
        })

        importDataTypen(gegevensModelPkg, basisSchema)
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