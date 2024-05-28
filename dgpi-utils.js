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
 * Get the Annotation Element from an XS Element
 * @param {XSDObject} element 
 * @returns {XSDObject | undefined}
 */
function getXsAnnotation(element) {
    var xsAnnotation = undefined

    if (element.elements) {
        const elements = element.elements

        if (Array.isArray(elements)) {
            xsAnnotation = elements.find(element => element.name == 'xs:annotation')
        }

    }

    return xsAnnotation
}

/**
 * Get the XS Annotation Documentation Element Text
 * @param {XSObject} element
 * @returns {XSDObject | undefined}
 */
function getXsAnnotationDocumentationText(element) {
    const xsAnnotation = getXsAnnotation(element)
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
 * @param {undefined | '0..1'} attrMultiplicity
 * @param {undefined | String} attrDocumentation 
 * @returns {UMLAttribute}
 */
function addUMLAttribute(parentClass, attrName, attrType, attrMultiplicity, attrDocumentation) {
    return app.factory.createModel({
        id: 'UMLAttribute',
        parent: parentClass,
        field: 'attributes',
        modelInitializer: elem => {
            elem.name = attrName
            elem.type = attrType
            elem.multiplicity = attrMultiplicity
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

/**
 * Get UMLAttribute Muliplicity Value from XSD minOccurs-attribute 
 * @param {XSDAttributes} attributes 
 * @returns {undefined | '0..1'}
 */
function getUMLAttributeMultiplicity(attributes) {
    var attrMultiplicity = undefined

    if (attributes.minOccurs) {

        if (attributes.minOccurs == '0') {
            attrMultiplicity = '0..1'
        }

    }

    return attrMultiplicity
}

/**
 * Get UMLDataType from Gegevensmodel Package
 * @param {UMLPackage} gegevensModelPkg 
 * @param {String} attrDataTypeName 
 * @returns {UMLDataType | undefined}
 */
function getUMLDataType(gegevensModelPkg, attrDataTypeName) {
    return gegevensModelPkg.ownedElements.find(element => element._type = 'UMLDataType' && element.name == attrDataTypeName)
}

exports.getUMLPackagElementByName = getUMLPackagElementByName
exports.getUMLClassElementByName = getUMLClassElementByName
exports.getXsAnnotation = getXsAnnotation
exports.getXsAnnotationDocumentationText = getXsAnnotationDocumentationText
exports.getXsRestriction = getXsRestriction
exports.addUMLAttribute = addUMLAttribute
exports.getDataTypeName = getDataTypeName
exports.getUMLAttributeMultiplicity = getUMLAttributeMultiplicity
exports.getUMLDataType = getUMLDataType