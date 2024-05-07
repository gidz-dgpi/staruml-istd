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

/**
 * XMLWriter
 */
class XMLWriter {
  /**
   * @constructor
   */
  constructor (indentString) {
    /** @member {Array.<string>} lines */
    this.lines = []

    /** @member {string} indentString */
    this.indentString = indentString || '\t' // default tab

    /** @member {Array.<string>} indentations */
    this.indentations = []
  }

  /**
   * Indent
   */
  indent () {
    this.indentations.push(this.indentString)
  }

  /**
   * Outdent
   */
  outdent () {
    this.indentations.splice(this.indentations.length - 1, 1)
  }

  /**
   * Write a line
   * @param {string} line
   */
  writeLine (line) {
    if (line) {
      this.lines.push(this.indentations.join('') + line)
    } else {
      this.lines.push('')
    }
  }

  /**
   * Return as all string data
   * @return {string}
   */
  getData () {
    return this.lines.join('\n')
  }
}

/**
 * Map for Enumeration Writers
 */
var enumerations = {}

/**
 * Map for Element Writers
 */
var elements = {}

/**
 * Nodes to be added later
 */
var deferedNodes = []

/**
 * Add a value to an array field
 * @param {object} json
 * @param {string} name
 * @param {?} value
 */
function addTo (json, name, value) {
  if (!Array.isArray(json[name])) {
    json[name] = []
  }
  json[name].push(value)
}

/**
 * Append elements to an array field
 * @param {object} json
 * @param {string} name
 * @param {Array.<Element>} elements
 */
function appendTo (json, name, elements) {
  if (!Array.isArray(json[name])) {
    json[name] = []
  }
  var arr = json[name]
  elements.forEach(function (elem) {
    if (!arr.includes(elem) && !arr.some(function (item) { return item._id === elem._id })) {
      arr.push(elem)
    }
  })
}

/**
 * Add a node to deferedNodes
 * @param{object} node
 */
function addToDeferedNode (node) {
  if (node['xmi:id'] && !deferedNodes.some(function (n) { return (n['xmi:id'] === node['xmi:id']) })) {
    deferedNodes.push(node)
  }
}

/**
 * Set xmi:type
 * @param {object} json
 * @param {string} typeName
 */
function setType (json, typeName) {
  json['xmi:type'] = typeName
}

/**
 * Write a string value as an attribute
 * @param {object} json
 * @param {string} name
 * @param {string} value
 */
function writeString (json, name, value) {
  if (value && value.length > 0) {
    json[name] = value
  }
}

/**
 * Write a boolean value as an attribute
 * @param {object} json
 * @param {string} name
 * @param {boolean} value
 */
function writeBoolean (json, name, value) {
  if (value) {
    json[name] = 'true'
  } else {
    json[name] = 'false'
  }
}

/**
 * Write enumeration
 * @param {object} json
 * @param {string} name
 * @param {?} value
 */
function writeEnum (json, name, type, value) {
  var fun = enumerations[type]
  if (fun) {
    json[name] = fun(value)
  }
}

/**
 * Write an element
 * @param {object} json
 * @param {string} name
 * @param {Element} elem
 */
function writeElement (json, name, elem) {
  var fun = elements[elem.getClassName()]
  var node = null
  if (fun) {
    node = fun(elem)
    addTo(json, name, node)
  }
  return node
}

/**
 * Write an array of elements
 * @param {object} json
 * @param {string} name
 * @param {Array.<Element>} elems
 */
function writeElementArray (json, name, elems) {
  elems.forEach(function (elem) {
    var fun = elements[elem.getClassName()]
    if (fun) {
      var node = fun(elem)
      addTo(json, name, node)
    }
  })
}

/**
 * Write a reference to an element
 * @param {object} json
 * @param {string} name
 * @param {Element} elem
 */
function writeRef (json, name, elem) {
  if (elem) {
    json[name] = elem._id
  }
}

/**
 * Write an array of references
 * @param {object} json
 * @param {string} name
 * @param {Array.<Element>} elems
 */
function writeRefArray (json, name, elems) {
  elems.forEach(function (elem) {
    if (elem) {
      var node = { 'xmi:idref': elem._id }
      addTo(json, name, node)
    }
  })
}

/**
 * Write a value specification
 * @param {object} json
 * @param {string} name
 * @param {string} valueType
 * @param {string} value
 */
function writeValueSpec (json, name, valueType, value) {
  value = String(value)
  if (valueType === 'uml:OpaqueExpression') {
    if (value && value.length > 0) {
      json[name] = {
        'xmi:id': app.repository.generateGuid(),
        'xmi:type': valueType,
        'body': value
      }
    }
  } else {
    if (value && value.length > 0) {
      json[name] = {
        'xmi:id': app.repository.generateGuid(),
        'xmi:type': valueType,
        'value': value
      }
    }
  }
}

/**
 * Write xmi:Extension
 * @param {object} json
 * @param {object} valueMap
 */
function writeExtension (json, valueMap) {
  var node = json['xmi:Extension']
  if (!node) {
    node = {
      'extender': 'StarUML'
    }
    json['xmi:Extension'] = node
  }
  for (var key in valueMap) {
    node[key] = valueMap[key]
  }
}

/**
 * Convert JSON to XML
 * @param{object} json
 * @param{XMLWriter} xmlWriter
 * @param{string} tagName
 */
function convertJsonToXML (json, xmlWriter, tagName) {
  tagName = tagName || json['xmi:type']

  var line = '<' + tagName

  // Convert attributes
  var childCount = 0
  var key, val
  for (key in json) {
    val = json[key]
    if (typeof val === 'string') {
      line += ' ' + key + '="' + encodeURI(val) + '"'
    } else if (!(typeof val === 'object')) {
      line += ' ' + key + '="' + val + '"'
    } else {
      childCount++
    }
  }

  if (childCount > 0) {
    line += '>'
    xmlWriter.writeLine(line)
    xmlWriter.indent()
    // Convert children
    for (key in json) {
      val = json[key]
      if (Array.isArray(val)) {
        val.forEach(function (item) {
          convertJsonToXML(item, xmlWriter, key)
        })
      } else if (typeof val === 'object') {
        convertJsonToXML(val, xmlWriter, key)
      }
    }
    xmlWriter.outdent()
    xmlWriter.writeLine('</' + tagName + '>')
  } else {
    line += '/>'
    xmlWriter.writeLine(line)
  }
}

/**
 * Save to file
 *
 * @param {string} filename
 * @return {$.Promise}
 */
function saveToFile (filename) {
  try {
    // Build intermediate JSON representations
    var project = app.project.getProject()
    var root = {
      'xmi:id': app.repository.generateGuid(),
      'xmi:type': 'uml:Model',
      'name': 'RootModel',
      'packagedElement': []
    }
    writeElementArray(root, 'packagedElement', project.ownedElements)
    deferedNodes.forEach(function (node) {
      addTo(root, 'packagedElement', node)
    })

    // Save to File
    fs.writeFileSync(filename, JSON.stringify(root))
  } catch (err) {
    console.error(err)
  }
}

exports.enumerations = enumerations
exports.elements = elements
exports.deferedNodes = deferedNodes

exports.addTo = addTo
exports.appendTo = appendTo
exports.addToDeferedNode = addToDeferedNode
exports.setType = setType
exports.writeString = writeString
exports.writeBoolean = writeBoolean
exports.writeEnum = writeEnum
exports.writeElement = writeElement
exports.writeElementArray = writeElementArray
exports.writeRef = writeRef
exports.writeRefArray = writeRefArray
exports.writeValueSpec = writeValueSpec
exports.writeExtension = writeExtension

exports.saveToFile = saveToFile