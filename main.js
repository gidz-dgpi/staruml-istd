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
const repositoryPreferences = require('./repository/repository-preferences')

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

function execIstdBerichtModelExport(project, filePath) {
    try {
        jsonWriter.saveBerichtModelToFile(project, filePath)
    } catch (err) {
        console.error(err)
    }
}
function _handleIstdBerichtModelExport(fullPath) {
    const project = app.project.getProject()

    if (fullPath) {
        execIstdBerichtModelExport(project, fullPath)
    } else {
        const _filePath = project.name + '-' + project.version + '.json'
        const selectRes = app.dialogs.showSaveDialog('Export Berichtmodel As JSON', _filePath, JSON_FILE_FILTERS)
        // StarUML 6.1.2 changed dialogs working to Async
        if (selectRes instanceof Promise) {
            selectRes.then(
                (filePath => {
                    execIstdBerichtModelExport(project, filePath)
                }),
                (err => console.error(err))
            )
        } else {
            // StarUML 6.1.0 dialogs works Sync
            execIstdBerichtModelExport(project, selectRes)
        }
    }
}

function manualIstBerichtImport(files) {
    if (files && files.length > 0) {
        try {
            istdBerichtXsdImport.importBerichtXsdFile(files[0])
        } catch (err) {
            app.dialogs.showErrorDialog('Geen bestand kunnen selecteren.', err)
            console.error(err)
        }
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
        const selectRes = app.dialogs.showOpenDialog('Selecteer een Bericht (.xsd)', null, XSD_FILE_FILTERS)
        // StarUML 6.1.2 changed dialogs working to Async
        if (selectRes instanceof Promise) {
            selectRes.then(
                (files => {
                    manualIstBerichtImport(files)
                }),
                (err => console.error(err))
            )
        } else {
            // StarUML 6.1.0 dialogs works Sync
            manualIstBerichtImport(selectRes)
        }
    }
}

function manualIstdBasisSchemaImport(files) {
    if (files && files.length > 0) {
        try {
            istdBasisSchemaXsdImport.importBasisSchemaXsdFile(files[0])
        } catch (err) {
            app.dialogs.showErrorDialog('Geen bestand kunnen selecteren.', err)
            console.error(err)
        }
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
        const selectRes = app.dialogs.showOpenDialog('Selecteer een Basisschema (.xsd)', null, XSD_FILE_FILTERS)
        // StarUML 6.1.2 changed dialog working to Async
        if (selectRes instanceof Promise) {
            selectRes.then(
                (files => {
                    manualIstdBasisSchemaImport(files)
                }),
                (err => console.error(err))
            )
        } else {
            // StarUML 6.1.0 dialogs works Sync
            manualIstdBasisSchemaImport(selectRes)
        }
    }
}

function manualIstdRegelRapportImport(files) {
    if (files && files.length > 0) {
        try {
            istdRegelRapportXlsxImport.importRegelRapportXlsxFile(files[0])
        } catch (err) {
            app.dialogs.showErrorDialog('Geen bestand kunnen selecteren.', err)
            console.error(err)
        }
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
        const selectRes = app.dialogs.showOpenDialog('Selecteer een Regelrapport (.xlsx)', null, XLSX_FILE_FILTERS)
        // StarUML 6.1.2 changed dialog working to Async
        if (selectRes instanceof Promise) {
            selectRes.then(
                (files => {
                    manualIstdRegelRapportImport(files)
                }),
                (err => console.error(err))
            )
        } else {
            // StarUML 6.1.0 dialogs works Sync
            manualIstdRegelRapportImport(selectRes)
        }
    }
}

function init() {
    app.commands.register('istd:berichtmodel:export', _handleIstdBerichtModelExport)
    app.commands.register('istd:bericht:import', _handleIstdBerichtImport)
    app.commands.register('istd:basisschema:import', _handleIstdBasisSchemaImport)
    app.commands.register('istd:regelrapport:import', _handleIstdRegelRapportImport)
    console.log(`appPath ${app.getAppPath()}`)
    console.log(`userPath ${app.getUserPath()}`)
    console.log(repositoryPreferences.dataSchema)
    app.preferences.register(repositoryPreferences.dataSchema)
}

exports.init = init