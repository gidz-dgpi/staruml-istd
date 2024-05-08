/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Bericht XSD Import
 */

const fs = require('fs')
const convert = require('xml-js');

function importBerichtXsdFile(xsdFile) {

    try {
        const xsdStr = fs.readFileSync(xsdFile, 'utf8');
        try {
            const xsdObj = convert.xml2js(xsdStr)
            try {
                fs.writeFileSync('/Users/theonno/Downloads/bericht.json', JSON.stringify(xsdObj, null, '\t'))
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