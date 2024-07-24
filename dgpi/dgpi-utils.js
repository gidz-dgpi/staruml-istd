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
            elem.multiplicity = ['', '1'].find(value => attrMultiplicity == value) ? undefined : attrMultiplicity
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
 * Build a UML Multiplicity Value from a XSD Occurence Attributes
 * @param {String | undefined} minOccurs 
 * @param {String | undefined} maxOccurs 
 * @returns 
 */
function buildUMLMultiplicityFromXsOccursAttr(minOccurs, maxOccurs) {
    const minRelationSet = minOccurs ? String(minOccurs) : '1'
    const maxRelationSet = maxOccurs ? String(maxOccurs).replace('unbounded', '*') : '1'

    return (minRelationSet != '1' || maxRelationSet != '1') ? `${minRelationSet}..${maxRelationSet}` : '1'
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

/**
 * Add a String Type Tag to a Project or UMLObjectType
 * @param {Project | UMLObjectType} parent 
 * @param {String} tagName 
 * @param {String} tagValue 
 * @returns {Tag}
 */
function addStringTag(parent, tagName, tagValue) {
    return app.factory.createModel({
        id: "Tag",
        parent: parent,
        field: "tags",
        modelInitializer: tag => {
            tag.name = tagName
            tag.kind = type.Tag.TK_STRING; // or TK_BOOLEAN, TK_NUMBER, TK_REFERENCE, TK_HIDDEN
            tag.value = tagValue
            // tag.checked = true; // for TK_BOOLEAN
            // tag.number = 100; // for TK_NUMBER
            // tag.reference = ...; // for TK_REFERENCE
        }
    })
}

/**
 * Get Text from XSD Appinfo Element
 * @param {XSDAppInfo} appInfoElement 
 * @returns String
 */
function getAppInfoElementText(appInfoElement) {
    return String(appInfoElement.elements[0].text)
}

/**
 * Get XSD AppInfo MetaData
 * @param {XSDAppInfo} xsAppinfo 
 * @returns 
 */
function getXsdMetaData(xsAppinfo) {
    const standaardInfo = xsAppinfo.elements.find(element => element.name.match(':standaard'))
    const standaard = getAppInfoElementText(standaardInfo)

    return {
        standaard: standaard,
        bericht: getAppInfoElementText(xsAppinfo.elements.find(element => element.name == standaard + ':bericht')),
        release: getAppInfoElementText(xsAppinfo.elements.find(element => element.name == standaard + ':release'))
    }
}

exports.getUMLPackagElementByName = getUMLPackagElementByName
exports.getUMLClassElementByName = getUMLClassElementByName
exports.getXsAnnotation = getXsAnnotation
exports.getXsAnnotationDocumentationText = getXsAnnotationDocumentationText
exports.getXsRestriction = getXsRestriction
exports.addUMLAttribute = addUMLAttribute
exports.getDataTypeName = getDataTypeName
exports.getUMLDataType = getUMLDataType
exports.addStringTag = addStringTag
exports.getAppInfoElementText = getAppInfoElementText
exports.getXsdMetaData = getXsdMetaData
exports.buildUMLMultiplicityFromXsOccursAttr = buildUMLMultiplicityFromXsOccursAttr