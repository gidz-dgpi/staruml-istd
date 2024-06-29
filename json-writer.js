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

function saveJsonToFile(json, filePath) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(json, null, '\t'))
  } catch (err) {
    console.error(err)
  }
}

/**
 * Save iStandaard Model to file
 * @param {string} filePath
 */
function saveBerichtModelToFile(filePath) {
  console.log(`filePath = ${filePath}`)
  const root = app.project.getProject()
  const json = istd.buildBerichtModelJson(root)
  saveJsonToFile(json, filePath)
}

exports.saveBerichtModelToFile = saveBerichtModelToFile