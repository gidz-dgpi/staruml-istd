/*
 * Copied from https://github.com/staruml/staruml-xmi/blob/master/main.js
 * 
 * Changes:
 * - Removed existing XMI-Import-functionality
 * - Changed existing XMI-Export-functionality to JSON-export-functionality
 * 
 */

const jsonWriter = require('./json-writer')
const xsdImport = require('./xsd-import')

const JSON_FILE_FILTERS = [
    { name: 'JSON Files', extensions: ['json'] },
    { name: 'All Files', extensions: ['*'] }
]

function _handleIstdJsonExport(fullPath) {
    if (fullPath) {
        try {
            jsonWriter.saveToFile(fullPath)
        } catch (err) {
            console.error(err)
        }
    }
}

function _handleIstdBerichtImport(fullPath) {
    if (fullPath) {
        try {
            xsdImport.importBerichtXsdFile(fullPath)
        } catch (err) {
            console.error(err)
        }
    }
}

function init() {
    app.commands.register('istd:json:export', _handleIstdJsonExport)
    app.commands.register('istd:bericht:import', _handleIstdBerichtImport)
}

exports.init = init