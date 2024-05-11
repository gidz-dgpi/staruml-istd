/*
 * Copied from https://github.com/staruml/staruml-xmi/blob/master/xmi21-writer.js
 * 
 * Changes:
 * - saveToFile
 *   - // Convert to XML - Block removed
 *   - // Save to File - Block changed to writing JSON
 * 
 */

const fs = require('fs')
const istd = require('./istd-json-export')

/**
 * Save to file
 *
 * @param {string} filename
 * @return {$.Promise}
 */
function saveToFile(filename) {
  try {
    // Build intermediate JSON representations
    var root = app.project.getProject()
    var json = istd.buildBerichtModelJson(root)

    // Save to File
    fs.writeFileSync(filename, JSON.stringify(json, null, '\t'))
  } catch (err) {
    console.error(err)
  }
}

exports.saveToFile = saveToFile