/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Bericht XSD Import
 */

const fs = require('fs')
const convert = require('xml-js');
const utils = require('./dgpi-utils')
const mapping = require('./xsd-mapping')

const BERICHTEN_PACKAGE = {
    name: 'Berichten'
}

/**
 * Add UMLAttribute for Berichtelement to BerichtClass
 * @param {UMLClass} berichtClass 
 * @param {String} elemName 
 * @param {String} elemType 
 * @returns {UMLAttribute}
 */
function addBerichtClassAttribute(berichtClass, elemName, elemType) {
    return app.factory.createModel({
        id: 'UMLAttribute',
        parent: berichtClass,
        field: 'attributes',
        modelInitializer: elem => {
            elem.name = elemName
            elem.type = elemType
        }
    })
}

/**
 * Get DataType from element type value
 * @param {String} typeValue 
 * @returns {String}
 */
function getDataType(typeValue) {
    return typeValue.split(':')[1]
}


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
 * Add UMLClass for BerichtClass to BerichtPackage
 * @param {UMLPackage} berichtPkg 
 * @param {String} berichtClassName
 * @returns {UMLClass}
 */
function addBerichtClass(berichtPkg, berichtClassName) {
    return app.factory.createModel({
        id: 'UMLClass',
        parent: berichtPkg,
        modelInitializer: elem => {
            elem.name = berichtClassName
        }
    })
}

/**
 * Add UMLAssociation to a BerichtClass
 * @param {UMLClass} parentClass 
 * @param {UMLClass} childClass 
 * @param {String} associationName 
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
 * 
 * @param {UMLPackage} berichtenPkg - StarUML UMLPackage Model Object
 * @param {Object} bericht - XSD-import Object
 */
function importBerichtKlassen(berichtenPkg, bericht) {
    // Get XSD Schema Data
    const xsSchema = bericht.elements.find((element) => element.name == 'xs:schema')
    const xsAnnotation = xsSchema.elements.find(element => element.name == 'xs:annotation')
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
                const berichtClass = addBerichtClass(berichtPkg, complexElemName)
                const xsSequence = complexElem.elements.find(element => element.name == 'xs:sequence')
                const xsElements = xsSequence.elements.filter(element => element.name == 'xs:element')

                for (let j = 0; j < xsElements.length; j++) {
                    const xsElement = xsElements[j]
                    const elemName = xsElement.attributes.name
                    var elemType = xsElement.attributes.type

                    if (elemType == undefined) {
                        // Restriction on a SimpleType Defined
                        const xsSimpleType = xsElement.elements.find(element => element.name == 'xs:simpleType')
                        const xsRestriction = xsSimpleType.elements.find(element => element.name == 'xs:restriction')
                        const elemType = getDataType(xsRestriction.attributes.base)
                        const berichtClassAttribute = addBerichtClassAttribute(berichtClass, elemName, elemType)
                    } else {

                        if (elemType.startsWith(relationPre)) {
                            relationElems.push({
                                parentClass: berichtClass,
                                element: xsElement
                            })

                        } else {
                            //console.log('Attribute')
                            const elemType = getDataType(xsElement.attributes.type)
                            const berichtClassAttribute = addBerichtClassAttribute(berichtClass, elemName, elemType)
                        }
                    }
                }

            }
        }

        for (let i = 0; i < relationElems.length; i++) {
            const relationElem = relationElems[i]
            const relationElemName = relationElem.element.attributes.name
            var associationName = relationElemName
            const parentClass = relationElem.parentClass
            console.log('relationElem')
            console.log(relationElem)
            // Lookup direct relation ChildClass reference
            var childClass = utils.getUMLClassElementByName(berichtPkg.ownedElements, relationElemName)
            var childMultiplicity = '1'
            const childMinOccurs = relationElem.element.attributes.minOccurs ? relationElem.element.attributes.minOccurs : '1'
            console.log('childMinOccurs')
            console.log(childMinOccurs)

            if (!childClass) {
                // Lookup for indirect relation using a Relation Class
                const relationClass = relationClasses.find(element => element.attributes.name == relationElemName)
                associationName = relationClass.attributes.name
                const childClassAttributes = relationClass.elements[0].elements[0].attributes
                const childClassName = childClassAttributes.name
                childClass = utils.getUMLClassElementByName(berichtPkg.ownedElements, childClassName)
                console.log('relationClass')
                console.log(relationClass)
                const childMaxOccurs = childClassAttributes.maxOccurs ? childClassAttributes.maxOccurs : '1'
                console.log('childMaxOccurs')
                console.log(childMaxOccurs)

                if (childMaxOccurs == 'unbounded') {
                    childMultiplicity = childMinOccurs + '..' + '*'
                } else {
                    childMultiplicity = childMinOccurs + '..' + childMaxOccurs
                }

            } else if (childMultiplicity == '0') {
                childMultiplicity = childMinOccurs + '..' + '*'
            }

            console.log('parentClass')
            console.log(parentClass)
            console.log('childClass')
            console.log(childClass)

            const associationMember = addBerichtClassAssociation(parentClass, childClass, associationName, childMultiplicity)
            console.log('associationMember')
            console.log(associationMember)

        }



    }
}


/**
 * Import iStandaard Bericht from bericht-Object
 * @param {Object} bericht 
 */
function importBericht(bericht) {
    try {
        const project = app.project.getProject()
        var berichtenPkg = utils.getUMLPackagElementByName(project.ownedElements, BERICHTEN_PACKAGE.name)

        if (berichtenPkg == undefined) {
            // Berichten Package doesn't exist
            // Create Berichten Package
            berichtenPkg = app.factory.createModel({
                id: 'UMLPackage',
                parent: project,
                modelInitializer: elem => {
                    elem.name = BERICHTEN_PACKAGE.name
                }
            })
        }

        importBerichtKlassen(berichtenPkg, bericht)
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