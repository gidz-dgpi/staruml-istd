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

const XSD_FILE_FILTERS = [
    { name: 'XSD Files', extensions: ['xsd'] },
    { name: 'All Files', extensions: ['*'] }
]

function _handleIstdJsonExport(fullPath) {
    if (fullPath) {
        try {
            jsonWriter.saveToFile(fullPath)
        } catch (err) {
            console.error(err)
        }
    } else {
        var _filename = app.project.getProject().name
        var filename = app.dialogs.showSaveDialog('Export Berichtmodel As JSON', _filename + '.json', JSON_FILE_FILTERS)
        if (filename) {
            try {
                jsonWriter.saveToFile(filename)
            } catch (err) {
                console.error(err)
            }
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
    } else {
        var _filename = app.project.getProject().name
        var filename = app.dialogs.showOpenDialog('Import Bericht As XSD', _filename + '.json', XSD_FILE_FILTERS)
        if (filename) {
            try {
                xsdImport.importBerichtXsdFile(filename)
            } catch (err) {
                console.error(err)
            }
        }
    }
}

function init() {
    app.commands.register('istd:json:export', _handleIstdJsonExport)
    app.commands.register('istd:bericht:import', _handleIstdBerichtImport)
}

exports.init = init