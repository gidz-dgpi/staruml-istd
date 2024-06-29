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
 * Write Object as JSON to a File
 * @param {Object} json 
 * @param {String} filePath 
 */
function saveJsonToFile(json, filePath) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(json, null, '\t'))
  } catch (err) {
    console.error(err)
  }
}

/**
 * Save iStandaard Model to file
 * @param {Project} project
 * @param {string} filePath
 */
function saveBerichtModelToFile(project, filePath) {
  console.log(`Saving ${project.name}-${project.version} To ${filePath}`)
  const json = istd.buildBerichtModelJson(project)
  saveJsonToFile(json, filePath)
}

exports.saveBerichtModelToFile = saveBerichtModelToFile