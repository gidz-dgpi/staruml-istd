/*
 * Based on example https://github.com/staruml/staruml-xmi/blob/master/main.js
 */

const jsonLdContextFileName = require('./istd-globals').jsonLdContextFileName
const jsonWriter = require('./istd-json-writer')
const berichtXsdImport = require('./istd-bericht-xsd-import')
const basisSchemaXsdImport = require('./istd-basisschema-xsd-import')
const regelRapportXlsxImport = require('./istd-regelrapport-xlsx-import')

const JSON_FILE_FILTERS = [
    { name: 'JSON Files', extensions: ['json'] },
    { name: 'All Files', extensions: ['*'] }
]

const JSON_LD_FILE_FILTERS = [
    { name: 'JSON Files', extensions: ['jsonld'] },
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

function manualIstdBasisSchemaImport(files) {
    if (files && files.length > 0) {
        try {
            basisSchemaXsdImport.importBasisSchemaXsdFile(files[0])
        } catch (err) {
            app.dialogs.showErrorDialog('Geen bestand kunnen selecteren.', err)
            console.error(err)
        }
    }
}
function _handleIstdBasisSchemaImport(fullPath) {
    if (fullPath) {
        try {
            basisSchemaXsdImport.importBasisSchemaXsdFile(fullPath)
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


function manualIstBerichtImport(files) {
    if (files && files.length > 0) {
        try {
            berichtXsdImport.importBerichtXsdFile(files[0])
        } catch (err) {
            app.dialogs.showErrorDialog('Geen bestand kunnen selecteren.', err)
            console.error(err)
        }
    }
}
function _handleIstdBerichtImport(fullPath) {
    if (fullPath) {
        try {
            berichtXsdImport.importBerichtXsdFile(fullPath)
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


function manualIstdRegelRapportImport(files) {
    if (files && files.length > 0) {
        try {
            regelRapportXlsxImport.importRegelRapportXlsxFile(files[0])
        } catch (err) {
            app.dialogs.showErrorDialog('Geen bestand kunnen selecteren.', err)
            console.error(err)
        }
    }
}
function _handleIstdRegelRapportImport(fullPath) {
    if (fullPath) {
        try {
            regelRapportXlsxImport.importRegelRapportXlsxFile(fullPath)
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


function execIstdLdContextMetaDataExport(filePath) {
    try {
        jsonWriter.saveLdContextMetaDataToFile(filePath)
    } catch (err) {
        console.error(err)
    }
}
function _handleIstdLdContextMetaDataExport(fullPath) {
    const project = app.project.getProject()

    if (fullPath) {
        execIstdBerichtModelExport(project, fullPath)
    } else {
        const _filePath = jsonLdContextFileName
        const selectRes = app.dialogs.showSaveDialog('Exporteer Linked Data Context Meta Data in JSON+LD-formaat', _filePath, JSON_LD_FILE_FILTERS)
        // StarUML 6.1.2 changed dialogs working to Async
        if (selectRes instanceof Promise) {
            selectRes.then(
                (filePath => {
                    execIstdLdContextMetaDataExport(filePath)
                }),
                (err => console.error(err))
            )
        } else {
            // StarUML 6.1.0 dialogs works Sync
            execIstdLdContextMetaDataExport(selectRes)
        }
    }
}


function execIstdGenericMetaDataExport(project, filePath) {
    try {
        jsonWriter.saveGenericMetaDataToFile(project, filePath)
    } catch (err) {
        console.error(err)
    }
}
function _handleIstdGenericMetaDataExport(fullPath) {
    const project = app.project.getProject()

    if (fullPath) {
        execIstdBerichtModelExport(project, fullPath)
    } else {
        const _filePath = project.name + '-' + project.version + '-generic-meta-data.json'
        const selectRes = app.dialogs.showSaveDialog('Exporteer Generieke Meta Data in JSON-formaat', _filePath, JSON_FILE_FILTERS)
        // StarUML 6.1.2 changed dialogs working to Async
        if (selectRes instanceof Promise) {
            selectRes.then(
                (filePath => {
                    execIstdGenericMetaDataExport(project, filePath)
                }),
                (err => console.error(err))
            )
        } else {
            // StarUML 6.1.0 dialogs works Sync
            execIstdGenericMetaDataExport(project, selectRes)
        }
    }
}


function execIstSpecificMetaDataExport(project, filePath) {
    try {
        jsonWriter.saveSpecificMetaDataToFile(project, filePath)
    } catch (err) {
        console.error(err)
    }
}
function _handleIstdSpecificMetaDataExport(fullPath) {
    const project = app.project.getProject()

    if (fullPath) {
        execIstdBerichtModelExport(project, fullPath)
    } else {
        const _filePath = project.name + '-' + project.version + '-specific-meta-data.json'
        const selectRes = app.dialogs.showSaveDialog('Exporteer Specifieke Meta Data in JSON-formaat', _filePath, JSON_FILE_FILTERS)
        // StarUML 6.1.2 changed dialogs working to Async
        if (selectRes instanceof Promise) {
            selectRes.then(
                (filePath => {
                    execIstSpecificMetaDataExport(project, filePath)
                }),
                (err => console.error(err))
            )
        } else {
            // StarUML 6.1.0 dialogs works Sync
            execIstSpecificMetaDataExport(project, selectRes)
        }
    }
}


function init() {
    app.commands.register('istd:basisschema:import', _handleIstdBasisSchemaImport)
    app.commands.register('istd:bericht:import', _handleIstdBerichtImport)
    app.commands.register('istd:regelrapport:import', _handleIstdRegelRapportImport)
    app.commands.register('istd:context:meta:data:export', _handleIstdLdContextMetaDataExport)
    app.commands.register('istd:generic:meta:data:export', _handleIstdGenericMetaDataExport)
    app.commands.register('istd:specific:meta:data:export', _handleIstdSpecificMetaDataExport)
}

exports.init = init