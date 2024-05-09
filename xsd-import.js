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
 * Import Bericht Klassen from bericht
 * 
 * @param {UMLPackage} berichtenPkg - StarUML UMLPackage Model Object
 * @param {Object} bericht - XSD-import Object
 */
function importBerichtKlassen(berichtenPkg, bericht) {
    // Get XSD Schema Data
    const xsSchema = bericht.elements.find((element) => element.name == 'xs:schema')
    const xsAnnotation = xsSchema.elements.find((element) => element.name == 'xs:annotation')
    // Get AppInfo Data
    const xsAppinfo = xsAnnotation.elements.find((element) => element.name == 'xs:appinfo')
    // Get Bericht Info Data
    const berichtInfo = xsAppinfo.elements[1]
    const berichtInfoElement = berichtInfo.elements[0]

    // Get Name from XSD Bericht Info Data and lookup any existing Bericht Package
    const berichtNaam = berichtInfoElement.text.toUpperCase()
    var berichtIndex = -1
    var i = 0
    var berichtPkgTest = berichtenPkg.ownedElements.find(element => (element.name == berichtNaam) && (element instanceof type.UMLPackage))
    console.log(berichtPkgTest)
//    var berichtPkg;

//    if (berichtIndex == -1) {
        // Bericht Package doesn't exist
        // Create Bericht Package
        const berichtPkg = app.factory.createModel({
            id: 'UMLPackage',
            parent: berichtenPkg,
            modelInitializer: elem => {
                elem.name = berichtNaam
            }
        })
//    } else {
        // Bericht Package does exits
        // Get Bericht Package Reference
//        berichtPkg = berichtPkg.ownedElements[berichtIndex]
//   }

    console.log(berichtPkg);

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