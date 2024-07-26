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
const utils = require('../dgpi/dgpi-utils')
const jsonExport = require('./istd-json-export')

/**
 * Write Object as JSON to a File
 * @param {Object} json 
 * @param {String} filePath 
 */
function saveJsonToFile(json, filePath) {
  try {
    fs.writeFileSync(filePath, utils.jsonToString(json))
  } catch (err) {
    console.error(err)
  }
}


/**
 * Save iStandaard Meta Data Linked Data Context to file
 * @param {string} filePath
 */
function saveLdContextMetaDataToFile(filePath) {
  console.log(`Saving Linked Data Context To ${filePath}`)
  saveJsonToFile(jsonExport.jsonLdContext, filePath)
}

/**
 * Save Generieke iStandaard Meta Data to file
 * @param {Project} project
 * @param {string} filePath
 */
function saveGenericMetaDataToFile(project, filePath) {
  const json = jsonExport.buildGenericMetaDataJson(project)
  console.log(`Saving ${project.name}-${project.version} To ${filePath}`)
  saveJsonToFile(json, filePath)
}

/**
 * Save Specifieke iStandaard Meta Data to file
 * @param {Project} project
 * @param {string} filePath
 */
function saveSpecificMetaDataToFile(project, filePath) {
  const json = jsonExport.buildSpecificMetaDataJson(project)
  console.log(`Saving ${project.name}-${project.version} To ${filePath}`)
  saveJsonToFile(json, filePath)
}

exports.saveLdContextMetaDataToFile = saveLdContextMetaDataToFile
exports.saveGenericMetaDataToFile = saveGenericMetaDataToFile
exports.saveSpecificMetaDataToFile = saveSpecificMetaDataToFile