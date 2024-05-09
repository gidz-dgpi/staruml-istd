/**
 * Get UMLPackage Element that matches the name
 * @param {Array} elements 
 * @param {String} name 
 * @returns UMLPackage | undefined
 */
function getUMLPackagElementByName(elements, name) {
    return elements.find(element => (element.name == name) && (element instanceof type.UMLPackage))
}

exports.getUMLPackagElementByName = getUMLPackagElementByName