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
 * Importeer Basisschema XSD Elementen als UML-DataTypen 
 * @param {UMLPackage} gegevensModelPkg 
 * @param {XSDObject} basisSchema 
 */
function importDataTypen(gegevensModelPkg, basisSchema) {
    const modelElements = basisSchema.elements[0].elements
    console.log('modelElements')
    console.log(modelElements)
    const xsAnnotation = modelElements.find(element => element.name == 'xs:annotation')
    const xsAppinfo = xsAnnotation.elements.find(element => element.name == 'xs:appinfo')
    const standaardInfo = xsAppinfo.elements.find(element => element.name.match(':standaard'))
    const standaardInfoElement = standaardInfo.elements[0]
    const standaardName = standaardInfoElement.text
    console.log('standaard = ' + standaardName)

    const xsSimpleTypes = modelElements.filter(element => element.name == 'xs:simpleType')
    console.log('xsSimpleTypes')
    console.log(xsSimpleTypes)


    console.log('gegevensModelPkg')
    console.log(gegevensModelPkg)
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