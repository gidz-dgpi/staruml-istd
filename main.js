/*
 * Copied from https://github.com/staruml/staruml-xmi/blob/master/main.js
 * 
 * Changes:
 * - Removed existing XMI-Import-functionality
 * - Changed existing XMI-Export-functionality to JSON-export-functionality
 * 
 */

const jsonWriter = require('./json-writer')
const istdBerichtXsdImport = require('./istd-bericht-xsd-import')
const istdBasisSchemaXsdImport = require('./istd-basisschema-xsd-import')
const istdRegelRapportXlsxImport = require('./istd-regelrapport-xlsx-import')

const JSON_FILE_FILTERS = [
    { name: 'JSON Files', extensions: ['json'] },
    { name: 'All Files', extensions: ['*'] }
]

const XSD_FILE_FILTERS = [
    { name: 'XSD Files', extensions: ['xsd'] },
    { name: 'All Files', extensions: ['*'] }
]

const XLSX_FILE_FILTERS = [
    { name: 'XLSX Files', extensions: ['xlsx'] },
    { name: 'All Files', extensions: ['*'] }
]

function _handleBerichtModelExport(fullPath) {
    const project = app.project.getProject()

    if (fullPath) {
        try {
            jsonWriter.saveBerichtModelToFile(project, fullPath)
        } catch (err) {
            console.error(err)
        }
    } else {
        const _filePath = project.name + '-' + project.version + '.json'
        app.dialogs.showSaveDialog('Export Berichtmodel As JSON', _filePath, JSON_FILE_FILTERS).then(
            (filePath => {
                try {
                    jsonWriter.saveBerichtModelToFile(project, filePath)
                } catch (err) {
                    console.error(err)
                }
            }),
            (err => console.error(err))
        )
    }
}


function _handleIstdBerichtImport(fullPath) {
    if (fullPath) {
        try {
            istdBerichtXsdImport.importBerichtXsdFile(fullPath)
        } catch (err) {
            console.error(err)
        }
    } else {
        app.dialogs.showOpenDialog('Selecteer een Bericht (.xsd)', null, XSD_FILE_FILTERS).then(
            (files => {
                if (files && files.length > 0) {
                    try {
                        istdBerichtXsdImport.importBerichtXsdFile(files[0])
                    } catch (err) {
                        app.dialogs.showErrorDialog('Geen bestand kunnen selecteren.', err)
                        console.error(err)
                    }
                }
            }),
            (err => console.error(err))
        )
    }
}

function _handleIstdBasisSchemaImport(fullPath) {
    if (fullPath) {
        try {
            istdBasisSchemaXsdImport.importBasisSchemaXsdFile(fullPath)
        } catch (err) {
            console.error(err)
        }
    } else {
        app.dialogs.showOpenDialog('Selecteer een Basisschema (.xsd)', null, XSD_FILE_FILTERS).then(
            (files => {
                if (files && files.length > 0) {
                    try {
                        istdBasisSchemaXsdImport.importBasisSchemaXsdFile(files[0])
                    } catch (err) {
                        app.dialogs.showErrorDialog('Geen bestand kunnen selecteren.', err)
                        console.error(err)
                    }
                }
            }),
            (err => console.error(err))
        )
    }
}

function _handleIstdRegelRapportImport(fullPath) {
    if (fullPath) {
        try {
            istdRegelRapportXlsxImport.importRegelRapportXlsxFile(fullPath)
        } catch (err) {
            console.error(err)
        }
    } else {
        app.dialogs.showOpenDialog('Selecteer een Regelrapport (.xlsx)', null, XLSX_FILE_FILTERS).then(
            (files => {
                if (files && files.length > 0) {
                    try {
                        istdRegelRapportXlsxImport.importRegelRapportXlsxFile(files[0])
                    } catch (err) {
                        app.dialogs.showErrorDialog('Geen bestand kunnen selecteren.', err)
                        console.error(err)
                    }
                }
            }),
            (err => console.error(err))
        )
    }
}

function init() {
    app.commands.register('istd:berichtmodel:export', _handleBerichtModelExport)
    app.commands.register('istd:bericht:import', _handleIstdBerichtImport)
    app.commands.register('istd:basisschema:import', _handleIstdBasisSchemaImport)
    app.commands.register('istd:regelrapport:import', _handleIstdRegelRapportImport)
}

exports.init = init