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
 * @param {String} multiplicity 
 * @returns {UMLAssociation}
 */
function addBerichtClassAssociation(parentClass, childClass, associationName, multiplicity) {
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
            multiplicity: multiplicity
        }
    }
    return app.project.importFromJson(parentClass, associationElem)
}

/**
 * Get Bericht XSD AppInfo MetaData
 * @param {XSDAppInfo} xsAppinfo 
 * @returns 
 */
function getXsdBerichtMetaData(xsAppinfo) {
    const xsdMetaData = utils.getXsdMetaData(xsAppinfo)

    return {
        standaard: xsdMetaData.standaard,
        bericht: xsdMetaData.bericht,
        release: xsdMetaData.release,
        berichtXsdVersie: utils.getAppInfoElementText(xsAppinfo.elements.find(element => element.name == xsdMetaData.standaard + ':BerichtXsdVersie')),
        berichtXsdMinVersie: utils.getAppInfoElementText(xsAppinfo.elements.find(element => element.name == xsdMetaData.standaard + ':BerichtXsdMinVersie')),
        berichtXsdMaxVersie: utils.getAppInfoElementText(xsAppinfo.elements.find(element => element.name == xsdMetaData.standaard + ':BerichtXsdMaxVersie')),
        basisschemaXsdVersie: utils.getAppInfoElementText(xsAppinfo.elements.find(element => element.name == xsdMetaData.standaard + ':BasisschemaXsdVersie')),
        basisschemaXsdMinVersie: utils.getAppInfoElementText(xsAppinfo.elements.find(element => element.name == xsdMetaData.standaard + ':BasisschemaXsdMinVersie')),
        basisschemaXsdMaxVersie: utils.getAppInfoElementText(xsAppinfo.elements.find(element => element.name == xsdMetaData.standaard + ':BasisschemaXsdMaxVersie')),
    }
}

/**
 * 
 * Import Bericht Klassen from bericht
 * @param {UMLPackage | undefined} gegevensModelPkg - StarUML UMLPackage Gegevensmodel Object (if available)
 * @param {UMLPackage} berichtenPkg - StarUML UMLPackage Berichtmodel Object
 * @param {Object} bericht - XSD-import Object
 */
function importBerichtKlassen(gegevensModelPkg, berichtenPkg, bericht) {
    const xsSchema = bericht.elements.find((element) => element.name == 'xs:schema')
    const xsAnnotation = utils.getXsAnnotation(xsSchema)
    const xsAppinfo = xsAnnotation.elements.find(element => element.name == 'xs:appinfo')
    const xsdMetaData = getXsdBerichtMetaData(xsAppinfo)
    console.log(xsdMetaData)

    // Get Name from XSD Bericht Info Data and lookup any existing Bericht Package
    const berichtName = xsdMetaData.bericht.toUpperCase()
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
        utils.addStringTag(berichtPkg, 'standaard', xsdMetaData.standaard)
        utils.addStringTag(berichtPkg, 'releaseNummer', xsdMetaData.release)
        utils.addStringTag(berichtPkg, 'versieBerichtXsd', xsdMetaData.berichtXsdVersie)
        utils.addStringTag(berichtPkg, 'minVersieBerichtXsd', xsdMetaData.berichtXsdMinVersie)
        utils.addStringTag(berichtPkg, 'maxVersieBerichtXsd', xsdMetaData.berichtXsdMaxVersie)
        utils.addStringTag(berichtPkg, 'versieBasisschema', xsdMetaData.basisschemaXsdVersie)
        utils.addStringTag(berichtPkg, 'minVersieBasisschema', xsdMetaData.basisschemaXsdMinVersie)
        utils.addStringTag(berichtPkg, 'maxVersieBasisschema', xsdMetaData.basisschemaXsdMaxVersie)    
        const complexElems = xsSchema.elements.filter(element => element.name == 'xs:complexType')
        const relationElems = []

        // Add a UMLClass for each Berichtklasse
        for (let i = 0; i < complexElems.length; i++) {
            const complexElem = complexElems[i]
            const complexElemName = complexElem.attributes.name
            const complexElemDocumentation = utils.getXsAnnotationDocumentationText(complexElem)
            const berichtClass = addBerichtClass(berichtPkg, complexElemName, complexElemDocumentation)
            const xsSequence = complexElem.elements.find(element => element.name == 'xs:sequence')
            const xsElements = xsSequence.elements.filter(element => element.name == 'xs:element')

            // Add a UMLAttribute(s) for Bericht Element
            // And prepare Association-processing
            for (let j = 0; j < xsElements.length; j++) {
                const xsElement = xsElements[j]
                const attrName = xsElement.attributes.name
                var xsAttrType = xsElement.attributes.type

                if (xsAttrType == undefined) {
                    // Add Bericht Element with Restriction as UMLAttribute
                    const xsSimpleType = xsElement.elements.find(element => element.name == 'xs:simpleType')
                    const xsRestriction = xsSimpleType.elements.find(element => element.name == 'xs:restriction')
                    const attrTypeName = utils.getDataTypeName(xsRestriction.attributes.base)
                    const attrType = getBerichtClassAttrType(gegevensModelPkg, attrTypeName)
                    const attrDocumentation = utils.getXsAnnotationDocumentationText(xsElement)
                    const attrMultiplicity = utils.getUMLAttributeMultiplicity(xsElement.attributes)
                    const berichtClassAttribute = utils.addUMLAttribute(berichtClass, attrName, attrType, attrMultiplicity, attrDocumentation)
                } else {

                    if (xsAttrType.startsWith(relationPre)) {
                        // Keep Relation Element for Association-processing
                        relationElems.push({
                            parentClass: berichtClass,
                            element: xsElement
                        })

                    } else {
                        // Add Bericht Element without Restriction as UMLAttribute
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

        // Association-processing from Relation Elements
        for (let i = 0; i < relationElems.length; i++) {
            const relationElem = relationElems[i]
            const relationElemName = String(relationElem.element.attributes.name)
            const parentClass = relationElem.parentClass
            const childClass = utils.getUMLClassElementByName(berichtPkg.ownedElements, relationElemName)
            const minRelationSet = relationElem.element.attributes.minOccurs ? String(relationElem.element.attributes.minOccurs) : '1'
            const maxRelationSet = relationElem.element.attributes.maxOccurs ? String(relationElem.element.attributes.maxOccurs).replace('unbounded', '*') : '1'
            const multiplicity = (minRelationSet != '1' || maxRelationSet != '1') ? `${minRelationSet}..${maxRelationSet}` : '1'
            const associationMember = addBerichtClassAssociation(parentClass, childClass, relationElemName, multiplicity)
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