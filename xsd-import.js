/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Bericht XSD Import
 */

const fs = require('fs')
const convert = require('xml-js');

function addBericht(bericht) {
    try {
        fs.writeFileSync('testset/bericht.json', JSON.stringify(bericht, null, '\t'))
        var berichtenPkg = app.repository.select('Berichten')
        if (berichtenPkg[0] instanceof type.UMLPackage) {
                
        }
        
    } catch (err) {
        fs.writeFileSync('testset/error.json', err.message)
        console.error(err);
    }
}


function importBerichtXsdFile(xsdFile) {

    try {
        const xsdStr = fs.readFileSync(xsdFile, 'utf8');
        try {
            const bericht = convert.xml2js(xsdStr)
            try {
                addBericht(bericht)
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