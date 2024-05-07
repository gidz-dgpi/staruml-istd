/*
 * Copied from https://github.com/staruml/staruml-xmi/blob/master/main.js
 * 
 * Changes:
 * - Removed existing XMI-Import-functionality
 * - Changed existing XMI-Export-functionality to JSON-export-functionality
 * 
 */

const jsonWriter = require('./json-writer')
require('./uml2-json-export')

const JSON_FILE_FILTERS = [
  {name: 'JSON Files', extensions: ['json']},
  {name: 'All Files', extensions: ['*']}
]

function _handleJsonExport (fullPath) {
  if (fullPath) {
    jsonWriter.saveToFile(fullPath)
  } else {
    var _filename = app.project.getProject().name
    var filename = app.dialogs.showSaveDialog('Export Project As JSON', _filename + '.json', JSON_FILE_FILTERS)
    if (filename) {
        jsonWriter.saveToFile(filename)
    }
  }
}

function init () {
  app.commands.register('json:export', _handleJsonExport)
}

exports.init = init