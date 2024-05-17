/**
 * Get UMLPackage Element that matches the name
 * @param {Array} elements 
 * @param {String} name 
 * @returns UMLPackage | undefined
 */
function getUMLPackagElementByName(elements, name) {
    return elements.find(element => (element.name == name) && (element instanceof type.UMLPackage))
}

/**
 * Get UMLClass Element that matches the name
 * @param {Array} elements 
 * @param {String} name 
 * @returns UMLClass | undefined
 */
function getUMLClassElementByName(elements, name) {
    return elements.find(element => (element.name == name) && (element instanceof type.UMLClass))
}

/**
 * Get the XS Annotation Element
 * @param {Array} elements 
 * @returns {XSDObject}
 */
function getXsAnnotation(elements) {
    return elements.find(element => element.name == 'xs:annotation')
}

exports.getUMLPackagElementByName = getUMLPackagElementByName
exports.getUMLClassElementByName = getUMLClassElementByName
exports.getXsAnnotation = getXsAnnotation