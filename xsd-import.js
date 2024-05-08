/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Bericht XSD Import
 */

const fs = require('fs')
const convert = require('xml-js');

/**
 * 
 * @param {UMLPackage} berichtenPkg 
 * @param {Object} bericht 
 */
function importBerichtKlassen(berichtenPkg, bericht) {
    const xsSchema = bericht.elements.find((element) => element.name == 'xs:schema')
    const xsAnnotation = xsSchema.elements.find((element) => element.name == 'xs:annotation')
    const xsAppinfo = xsAnnotation.elements.find((element) => element.name == 'xs:appinfo')
    const berichtInfo = xsAppinfo.elements[1]
    const berichtInfoElement = berichtInfo.elements[0]

    const berichtNaam = berichtInfoElement.text.toUpperCase()
    const berichtPkg = app.factory.createModel({ 
        id: 'UMLPackage', 
        parent: berichtenPkg,
        modelInitializer: elem => {
            elem.name = berichtNaam
        } 
    })
    
    const xsComplexTypes = xsSchema.elements.filter((element) => element.name == 'xs:complexType')
    xsComplexTypes.forEach(xsComplexType => {
        const berichtClass = app.factory.createModel({ 
            id: 'UMLClass', 
            parent: berichtPkg,
            modelInitializer: elem => {
                elem.name = xsComplexType.attributes.name
            } 
        })    
    });
    
}


/**
 * Import iStandaard Bericht from bericht-Object
 * @param {Object} bericht 
 */
function importBericht(bericht) {
    try {
        const project = app.repository.select('@Project')[0]
        const berichtenPkg = app.factory.createModel({ 
            id: 'UMLPackage', 
            parent: project,
            modelInitializer: elem => {
                elem.name = 'Berichten'
            } 
        })
        importBerichtKlassen(berichtenPkg, bericht)
        
    } catch (err) {
        fs.writeFileSync('testset/error.json', err.message)
        console.error(err);
    }
}

/**
 * Import XSD File of a iStandaard Bericht
 * @param {String} xsdFile 
 */
function importBerichtXsdFile(xsdFile) {

    try {
        const xsdStr = fs.readFileSync(xsdFile, 'utf8');
        try {
            const bericht = convert.xml2js(xsdStr)
            try {
                importBericht(bericht)
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

exports.importBerichtXsdFile = importBerichtXsdFile