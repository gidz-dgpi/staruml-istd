/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Bericht XSD Import
 */

const fs = require('fs')
const convert = require('xml-js');
const utils = require('./dgpi-utils')

const BERICHTEN_PACKAGE = {
    name: 'Berichten'
}

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
    var berichtPkg = utils.getUMLPackagElementByName(berichtenPkg.ownedElements, berichtNaam)

    if (berichtPkg == undefined) {
        // Bericht Package doesn't exist
        // Create Bericht Package with Classes
        berichtPkg = app.factory.createModel({
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

}


/**
 * Import iStandaard Bericht from bericht-Object
 * @param {Object} bericht 
 */
function importBericht(bericht) {
    try {
        const project = app.repository.select('@Project')[0]
        //var berichtenPkg = project.ownedElements.find(element => (element.name == BERICHTEN_PACKAGE.name) && (element instanceof type.UMLPackage))
        var berichtenPkg = utils.getUMLPackagElementByName(project.ownedElements, BERICHTEN_PACKAGE.name)

        if (berichtenPkg == undefined) {
            // Berichten Package doesn't exist
            // Create Berichten Package
            berichtenPkg = app.factory.createModel({
                id: 'UMLPackage',
                parent: project,
                modelInitializer: elem => {
                    elem.name = BERICHTEN_PACKAGE.name
                }
            })
        }

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