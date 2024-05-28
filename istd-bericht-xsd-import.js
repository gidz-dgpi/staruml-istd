/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Bericht XSD Import
 */

const fs = require('fs')
const convert = require('xml-js');
const globals = require('./istd-globals')
const utils = require('./dgpi-utils')

/**
 * 
 * @param {Object} complexElem 
 * @param {String} relationPre 
 * @returns {Boolean}
 */
function isRelationClass(complexElem, relationPre) {
    var retVal = false

    if (complexElem.elements.length == 1) {

        if (complexElem.elements[0].elements.length == 1) {
            retVal = complexElem.elements[0].elements[0].attributes.type.startsWith(relationPre)
        }

    }

    return retVal
}

/**
 * Get UMLDataType from Gegevensmodel (when available)
 * @param {UMLPackage | undefined} gegevensModelPkg 
 * @param {String} attrTypeName 
 * @returns {UMLDataType | undefined}
 */
function getBerichtClassAttrType(gegevensModelPkg, attrTypeName) {
    var attrType = undefined

    if (gegevensModelPkg) {
        attrType = utils.getUMLDataType(gegevensModelPkg, attrTypeName)
    }

    return attrType
}

/**
 * Add UMLClass for BerichtClass to BerichtPackage
 * @param {UMLPackage} berichtPkg 
 * @param {String} berichtClassName
 * @param {String | undefined} berichtClassDocumentation
 * @returns {UMLClass}
 */
function addBerichtClass(berichtPkg, berichtClassName, berichtClassDocumentation) {
    return app.factory.createModel({
        id: 'UMLClass',
        parent: berichtPkg,
        modelInitializer: elem => {
            elem.name = berichtClassName
            elem.documentation = berichtClassDocumentation
        }
    })
}

/**
 * Add UMLAssociation to a BerichtClass
 * @param {UMLClass} parentClass 
 * @param {UMLClass} childClass 
 * @param {String} associationName 
 * @param {String} childMultiplicity 
 * @returns {UMLAssociation}
 */
function addBerichtClassAssociation(parentClass, childClass, associationName, childMultiplicity) {
    const associationId = app.repository.generateGuid()
    const associationElem = {
        _type: 'UMLAssociation',
        _id: associationId,
        _parent: {
            $ref: parentClass._id
        },
        name: associationName,
        end1: {
            _type: 'UMLAssociationEnd',
            _id: app.repository.generateGuid(),
            _parent: {
                $ref: associationId
            },
            reference: {
                $ref: parentClass._id
            },
            aggregation: 'shared'
        },
        end2: {
            _type: 'UMLAssociationEnd',
            _id: app.repository.generateGuid(),
            _parent: {
                $ref: associationId
            },
            reference: {
                $ref: childClass._id
            },
            multiplicity: childMultiplicity
        }
    }
    return app.project.importFromJson(parentClass, associationElem)
}

/**
 * 
 * Import Bericht Klassen from bericht
 * @param {UMLPackage | undefined} gegevensModelPkg - StarUML UMLPackage Gegevensmodel Object (if available)
 * @param {UMLPackage} berichtenPkg - StarUML UMLPackage Berichtmodel Object
 * @param {Object} bericht - XSD-import Object
 */
function importBerichtKlassen(gegevensModelPkg, berichtenPkg, bericht) {
    // Get XSD Schema Data
    const xsSchema = bericht.elements.find((element) => element.name == 'xs:schema')
    const xsAnnotation = utils.getXsAnnotation(xsSchema)
    // Get AppInfo Data
    const xsAppinfo = xsAnnotation.elements.find(element => element.name == 'xs:appinfo')
    // Get Standaard info Data
    const standaardInfo = xsAppinfo.elements.find(element => element.name.match(':standaard'))
    const standaardInfoElement = standaardInfo.elements[0]
    // Get standaard name
    const standaardName = standaardInfoElement.text
    console.log(standaardName)
    // Get Bericht Info Data
    const berichtInfo = xsAppinfo.elements[1]
    const berichtInfoElement = berichtInfo.elements[0]

    // Get Name from XSD Bericht Info Data and lookup any existing Bericht Package
    const berichtName = berichtInfoElement.text.toUpperCase()
    const relationPre = berichtName.toLowerCase() + ':'
    var berichtPkg = utils.getUMLPackagElementByName(berichtenPkg.ownedElements, berichtName)

    if (berichtPkg == undefined) {
        // Bericht Package doesn't exist
        // Create Bericht Package with Classes
        berichtPkg = app.factory.createModel({
            id: 'UMLPackage',
            parent: berichtenPkg,
            modelInitializer: elem => {
                elem.name = berichtName
            }
        })
        const complexElems = xsSchema.elements.filter(element => element.name == 'xs:complexType')
        const relationElems = []
        const relationClasses = []

        for (let i = 0; i < complexElems.length; i++) {
            const complexElem = complexElems[i]

            if (isRelationClass(complexElem, relationPre)) {
                relationClasses.push(complexElem)
            } else {
                const complexElemName = complexElem.attributes.name
                const complexElemDocumentation = utils.getXsAnnotationDocumentationText(complexElem)
                const berichtClass = addBerichtClass(berichtPkg, complexElemName, complexElemDocumentation)
                const xsSequence = complexElem.elements.find(element => element.name == 'xs:sequence')
                const xsElements = xsSequence.elements.filter(element => element.name == 'xs:element')

                for (let j = 0; j < xsElements.length; j++) {
                    const xsElement = xsElements[j]
                    const attrName = xsElement.attributes.name
                    var xsAttrType = xsElement.attributes.type

                    if (xsAttrType == undefined) {
                        // Restriction on a SimpleType Defined
                        const xsSimpleType = xsElement.elements.find(element => element.name == 'xs:simpleType')
                        const xsRestriction = xsSimpleType.elements.find(element => element.name == 'xs:restriction')
                        const attrTypeName = utils.getDataTypeName(xsRestriction.attributes.base)
                        const attrType = getBerichtClassAttrType(gegevensModelPkg, attrTypeName)
                        const attrDocumentation = utils.getXsAnnotationDocumentationText(xsElement)
                        const attrMultiplicity = utils.getUMLAttributeMultiplicity(xsElement.attributes)
                        const berichtClassAttribute = utils.addUMLAttribute(berichtClass, attrName, attrType, attrMultiplicity, attrDocumentation)
                    } else {

                        if (xsAttrType.startsWith(relationPre)) {
                            relationElems.push({
                                parentClass: berichtClass,
                                element: xsElement
                            })

                        } else {
                            const attrTypeName = utils.getDataTypeName(xsAttrType)
                            const attrType = getBerichtClassAttrType(gegevensModelPkg, attrTypeName)
                            const attrDocumentation = utils.getXsAnnotationDocumentationText(xsElement)
                            const attrMultiplicity = utils.getUMLAttributeMultiplicity(xsElement.attributes)
                            const berichtClassAttribute = utils.addUMLAttribute(berichtClass, attrName, attrType, attrMultiplicity, attrDocumentation)
                        }
                    }
                }

                app.modelExplorer.collapse(berichtClass)
            }
        }

        for (let i = 0; i < relationElems.length; i++) {
            const relationElem = relationElems[i]
            const relationElemName = relationElem.element.attributes.name
            var associationName = relationElemName
            const parentClass = relationElem.parentClass
            // Lookup direct relation ChildClass reference
            var childClass = utils.getUMLClassElementByName(berichtPkg.ownedElements, relationElemName)
            var childMultiplicity = '1'
            const childMinOccurs = relationElem.element.attributes.minOccurs ? relationElem.element.attributes.minOccurs : '1'

            if (!childClass) {
                // Lookup for indirect relation using a Relation Class
                const relationClass = relationClasses.find(element => element.attributes.name == relationElemName)
                associationName = relationClass.attributes.name
                const childClassAttributes = relationClass.elements[0].elements[0].attributes
                const childClassName = childClassAttributes.name
                childClass = utils.getUMLClassElementByName(berichtPkg.ownedElements, childClassName)
                const childMaxOccurs = childClassAttributes.maxOccurs ? childClassAttributes.maxOccurs : '1'

                if (childMaxOccurs == 'unbounded') {
                    childMultiplicity = childMinOccurs + '..' + '*'
                } else {
                    childMultiplicity = childMinOccurs + '..' + childMaxOccurs
                }

            } else if (childMinOccurs == '0') {
                childMultiplicity = childMinOccurs + '..' + '1'
            }

            const associationMember = addBerichtClassAssociation(parentClass, childClass, associationName, childMultiplicity)
            app.modelExplorer.collapse(parentClass)
        }

        app.modelExplorer.collapse(berichtPkg)
    }
}


/**
 * Import iStandaard Bericht from bericht-Object
 * @param {Object} bericht 
 */
function importBericht(bericht) {
    try {
        const project = app.project.getProject()
        var berichtenPkg = utils.getUMLPackagElementByName(project.ownedElements, globals.BERICHTEN_PACKAGE.name)

        if (berichtenPkg == undefined) {
            // Berichten Package doesn't exist
            // Create Berichten Package
            berichtenPkg = app.factory.createModel({
                id: 'UMLPackage',
                parent: project,
                modelInitializer: elem => {
                    elem.name = globals.BERICHTEN_PACKAGE.name
                }
            })
        }

        var gegevensModelPkg = utils.getUMLPackagElementByName(project.ownedElements, globals.GEGEVENS_MODEL_PACKAGE.name)
        importBerichtKlassen(gegevensModelPkg, berichtenPkg, bericht)
    } catch (err) {
        console.error(err);
    }
}

/**
 * Import XSD File of a iStandaard Bericht
 * @param {String} xsdFile 
 */
function importBerichtXsdFile(xsdFile) {

    try {
        const xsdStr = fs.readFileSync(xsdFile, 'utf8');
        try {
            const bericht = convert.xml2js(xsdStr)
            try {
                importBericht(bericht)
            } catch (err) {
                console.error(err);
            }
        } catch (err) {
            console.error(err);
        }
    } catch (err) {
        console.error(err);
    }

}

exports.importBerichtXsdFile = importBerichtXsdFile