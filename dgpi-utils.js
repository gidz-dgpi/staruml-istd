/**
 * Get UMLPackage Element that matches the name
 * @param {Array} elements 
 * @param {String} name 
 * @returns {UMLPackage | undefined}
 */
function getUMLPackagElementByName(elements, name) {
    return elements.find(element => (element.name == name) && (element instanceof type.UMLPackage))
}

/**
 * Get UMLClass Element that matches the name
 * @param {Array} elements 
 * @param {String} name 
 * @returns {UMLClass | undefined}
 */
function getUMLClassElementByName(elements, name) {
    return elements.find(element => (element.name == name) && (element instanceof type.UMLClass))
}

/**
 * Get the XS Annotation Element
 * @param {Array} elements 
 * @returns {XSDObject | undefined}
 */
function getXsAnnotation(elements) {
    return elements.find(element => element.name == 'xs:annotation')
}

/**
 * Get the XS Annotation Documentation Element Text
 * @param {Array} elements 
 * @returns {XSDObject | undefined}
 */
function getXsAnnotationDocumentationText(elements) {
    const xsAnnotation = getXsAnnotation(elements)
    var xsDocumentationText = undefined

    if (xsAnnotation) {
        const xsDocumentation = xsAnnotation.elements.find(element => element.name == 'xs:documentation')

        if (xsDocumentation) {
            const textElem = xsDocumentation.elements.find(element => element.type == 'text')

            if (textElem) {
                xsDocumentationText = textElem.text
            }

        }

    }

    return xsDocumentationText
}

/**
 * Get the XS Restriction Element
 * @param {Array} elements 
 * @returns {XSDObject | undefined}
 */
function getXsRestriction(elements) {
    return elements.find(element => element.name == 'xs:restriction')
}

/**
 * Add UMLAttribute
 * @param {UMLClass | UMLDataType} parentClass 
 * @param {String} attrName 
 * @param {String | UMLDataType } attrType 
 * @param {String | undefined} attrDocumentation 
 * @returns {UMLAttribute}
 */
function addUMLAttribute(parentClass, attrName, attrType, attrDocumentation) {
    return app.factory.createModel({
        id: 'UMLAttribute',
        parent: parentClass,
        field: 'attributes',
        modelInitializer: elem => {
            elem.name = attrName
            elem.type = attrType
            elem.documentation = attrDocumentation
        }
    })
}

/**
 * Get DataType Name from element type value
 * @param {String} typeValue 
 * @returns {String}
 */
function getDataTypeName(typeValue) {
    return typeValue.split(':')[1]
}

exports.getUMLPackagElementByName = getUMLPackagElementByName
exports.getUMLClassElementByName = getUMLClassElementByName
exports.getXsAnnotation = getXsAnnotation
exports.getXsAnnotationDocumentationText = getXsAnnotationDocumentationText
exports.getXsRestriction = getXsRestriction
exports.addUMLAttribute = addUMLAttribute
exports.getDataTypeName = getDataTypeName