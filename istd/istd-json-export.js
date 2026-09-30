/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Modellen JSON Export
 * 
 * Based on: https://docs.staruml.io/developing-extensions/accessing-elements
 * 
 */

const utils = require('../dgpi/dgpi-utils')
const globals = require('./istd-globals')
const primitiveTypesPkgId = require('./istd-primitive-types').primitiveTypesPkgId
const codelijstenPkgId = require('./istd-codelijsten').codelijstenPkgId
const _jsonLdContext = {
    '@context': {
        schema: 'https://schema.org',
        xs: 'http://www.w3.org/2001/XMLSchema#',
        uml: 'https://www.omg.org/spec/UML/20161101/UML.xmi#',
        ns: 'https://www.w3.org/TR/xml-names/',
        istd: 'https://www.istandaarden.nl/over-istandaarden/istandaarden/begrippenlijst#',
        model: 'https://www.istandaarden.nl/',
        name: 'schema:name',
        documentation: 'schema:description',
        version: 'schema:version',
        multiplicity: 'uml:multiplicity',
        aggregation: 'uml:Aggregation',
        isID: 'uml:isID',
        dataType: {
            '@id': 'uml:DataType',
            '@type': '@id'
        },
        primitiveType: 'uml:PrimitiveType',
        target: {
            '@id': 'uml:target',
            '@type': '@id'
        },
        dependency: 'uml:Dependency',
        parent: {
            '@id': 'istd:BerichtKlasseRelatieParentEnd',
            '@type': 'uml:AssociationEnd'
        },
        child: {
            '@id': 'istd:BerichtKlasseRelatieChildEnd',
            '@type': 'uml:AssociationEnd'
        },
        berichten: {
            '@id': 'istd:berichten',
            '@type': 'uml:Package',
            '@container': '@list'
        },
        klassen: {
            '@id': 'istd:berichtklassen',
            '@type': 'uml:Package',
            '@container': '@list'
        },
        elementen: {
            '@id': 'istd:elementen',
            '@type': 'uml:Attributes',
            '@container': '@list'
        },
        relaties: {
            '@id': 'istd:relaties',
            '@type': 'uml:Association',
            '@container': '@list'
        },
        gegevens: {
            '@id': 'istd:gegevensmodel',
            '@type': 'uml:Package',
            '@container': '@list'
        },
        primitieveDataTypen: {
            '@id': 'istd:primitieveDataTypen',
            '@type': 'uml:Package',
            '@container': '@list'
        },
        codelijsten: {
            '@id': 'istd:codelijsten',
            '@type': 'uml:Enumeration',
            '@container': '@list'
        },
        dataWaarden: {
            '@id': 'istd:dataWaarden',
            '@type': 'uml:Dependency',
            '@container': '@list'
        }
    }
}

function jsonLdContext() {
    return _jsonLdContext
}

const _jsonLdType = {
    Model: 'istd:informatiemodel',
    Package: 'uml:Package',
    Class: 'uml:Class',
    Property: 'uml:Property',
    Association: 'uml:Association',
    AssociationEnd: 'uml:AssociationEnd',
    DataType: 'uml:DataType',
    SimpleType: 'xs:simpleType',
    Enumeration: 'uml:Enumeration',
    Dependency: 'uml:Dependency',
    boolean: 'xs:boolean',
    string: 'xs:string',
    date: 'xs:date',
    time: 'xs:time',
    integer: 'xs:integer'
}

function jsonLdType() {
    return _jsonLdType
}

/**
 * The name of the project
 */
var projectName
/**
 * The name of the project
 * @param {*} project 
 */
function setProjectName(project) {
    projectName = project.name
}
/**
 * The name of the project
 * @returns String
 */
function getProjectName() { return projectName }

/**
 * The version of the project
 */
var projectVersion
/**
 * The version of the project
 * @param {*} project 
 */
function setProjectVersion(project) {
    projectVersion = project.projectVersion
}
/**
 * The version of the project
 * @returns String
 */
function getProjectVersion() { return projectVersion }

var specificModelId
/**
 * Set Specific Model Identifier from project info
 * @param {Project} project 
 * @returns {String}
 */
function setSpecificModelId(project) {
    specificModelId = `model:${getProjectName}/${getProjectVersion}/specific`
}
/**
 * Get Specific Model Identifier
 * @returns {String}
 */
function getSpecificModelId() { return specificModelId }

var genericModelId
/**
 * Set Generic Model Identifier from project info
 * @param {Project} project 
 * @returns {String}
 */
function setGenericModelId(project) {
    genericModelId = `model:${getProjectName}/${getProjectVersion}/generic` 
}
/**
 * Get Generic Model Identifier
 * @returns {String}
 */
function getGenericModelId() { return genericModelId }

/**
 * Generate the base namespace value for this project
 * @returns String
 */
function getBaseNamespace() {
    return `http://www.istandaarden.nl/${getProjectName().toLowerCase()}/${getProjectVersion().replace(/[.]/g, "_")}/`
}

/**
 * Generate the generic namespace for this project
 * @returns String
 */
function getGenericNamespace() {
    return {
        prefix: `${getProjectName}`,
        namespace: `${getBaseNamespace()}/basisschema/schema`
    }
}

function getSpecificNamespace(bericht) {
    return {
        prefix: `${getProjectName}`,
        namespace: `${getBaseNamespace()}/${bericht}/schema`
    }
}

/**
 * Get UML Element Documentation (when available)
 * @param {UMLElement} element 
 */
function buildDocumentation(element) {
    return element.documentation ? String(element.documentation): undefined
}

/**
 * Build a JSON-export relaties Meta Data
 * @param {String} berichtId 
 * @param {Class} berichtKlasse 
 * @returns {MetaData}
 */
function buildRelatiesJson(berichtId, berichtKlasse) {
    var json = []
    const relaties = berichtKlasse.ownedElements.filter(element => element instanceof type.UMLAssociation)

    relaties.forEach(relatie => {
        json.push({
            "@type": jsonLdType.Association,
            name: relatie.name,
            documentation: buildDocumentation(relatie),
            parent: {
                target: berichtId + "/klassen/" + relatie.end1.reference.name,
                "@type": jsonLdType.AssociationEnd,
                aggregation: relatie.end1.aggregation,
                multiplicity: relatie.end1.multiplicity
            },
            child: {
                target: berichtId + "/klassen/" + relatie.end2.reference.name,
                "@type": jsonLdType.AssociationEnd,
                aggregation: relatie.end2.aggregation,
                multiplicity: relatie.end2.multiplicity
            }
        })
    })

    return (json.length > 0) ? json : undefined
}


/**
 * Build Element Meta Data from UML Attribute
 * @param {String} elementenId 
 * @param {UMLAttribute} attribute 
 * @returns {MetaData}
 */
function buildElementJson(elementenId, attribute) {
    const name = String(attribute.name)
    const json = {
        "@id": elementenId + "/" + name,
        "@type": jsonLdType.Property,
        name: name,
        documentation: buildDocumentation(attribute),
        dataType: getGenericModelId() + "/gegevens/" + attribute.type.name,
        isID: attribute.isID ? Boolean(attribute.isID) : undefined,
        multiplicity: attribute.multiplicity ? String(attribute.multiplicity) : undefined
    }

    return json
}


/**
 * Build a JSON-export elementen Meta Data
 * @param {String} elementId
 * @param {UMLClass|UMLDataType} elementOwner
 * @returns {MetaData}
 */
function buildElementenJson(elementId, elementOwner) {
    var json = []
    const elementenId = elementId + "/elementen"

    elementOwner.attributes.forEach(attribute => {
        var elementJson = buildElementJson(elementenId, attribute)
        json.push(elementJson)
    })

    return (json.length > 0) ? json : undefined 
}


/**
 * Build a JSON-export klassen Meta Data
 * @param {String} berichtId
 * @param {UMLPackage} berichtPkg 
 * @returns {MetaData}
 */
function buildBerichtKlassenJson(berichtId, berichtPkg) {
    var json = []
    const berichtKlassen = berichtPkg.ownedElements.filter(element => element instanceof type.UMLClass)
    const berichtKlassenId = berichtId + "/klassen"

    berichtKlasse.forEach(berichtKlasse => {
        const elementId = berichtKlassenId + "/" + berichtKlasse.name
        json.push({
            "@id": elementId,
            "@type": jsonLdType.Class,
            name: String(berichtKlasse.name), 
            documentation: buildDocumentation(berichtKlasse),
            elementen: buildElementenJson(elementId, berichtKlasse),
            relaties: buildRelatiesJson(berichtId, berichtKlasse),
        })
    })

    return json
}


/**
 * Build a JSON-export Berichten Package Meta Data
 * @param {UMLPackage} berichtenPkg 
 * @returns {MetaData}
 */
function buildBerichtenPkgJson(berichtenPkg) {
    var json = []
    const berichtPkgs = berichtenPkg.ownedElements.filter(element => element instanceof type.UMLPackage)
    const berichtPkgsId = getSpecificModelId() + "/berichten"

    berichtPkgs.forEach(berichtPkg => {
        const berichtId = berichtPkgsId + "/" + berichtPkg.name
        json.push({
            "@id": berichtId,
            "@type": jsonLdType.Package,
            name: berichtPkg.name,
            documentation: buildDocumentation(berichtPkg),
            klassen: buildBerichtKlassenJson(berichtId, berichtPkg),
        })
    })

    return json
}

/**
 * Build a JSON-export DataWaarden Package Meta Data
 * @param {String} dataTypeId 
 * @param {String} primitieveDataTypen 
 * @param {String} codelijsten 
 * @param {String} dataType 
 * @returns {MetaData}
 */
function buildDataWaardenJson(dataTypeId, primitieveDataTypen, codelijsten, dataType) {
    var json = []
    const dependencies = dataType.ownedElements.filter(element => element instanceof type.UMLDependency)
    const dataWaardenId = dataTypeId + "/dataWaarden"

    dependencies.forEach(dependency => {
        const dependencyTarget = dependency.target
        
        if (dependencyTarget instanceof type.UMLPrimitiveType) {
            const primitieveDataType = primitieveDataTypen.find(element => element.name == dependencyTarget.name)
            json.push({
                "@id": dataWaardenId + "/primitieveDataType",
                "@type": jsonLdType.Dependency,
                target: primitieveDataType['@id']
            })
        } else if (dependencyTarget instanceof type.UMLEnumeration) {
            const codelijst = codelijsten.find(element => element.name == dependencyTarget.name)
            json.push({
                "@id": dataWaardenId + "/codelijst",
                "@type": jsonLdType.Dependency,
                target: codelijst['@id']
            })

        }
    })

    return (json.length > 0) ? json : undefined
}

/**
 * Build a JSON-export Gegevens Package Meta Data
 * @param {UMLPackage} primitieveDataTypenPkg 
 * @param {UMLPackage} codelijstenPkg 
 * @param {UMLPackage} gegevensPkg 
 * @returns {MetaData}
 */
function buildGegegevensJson(primitieveDataTypenPkg, codelijstenPkg, gegevensPkg) {
    var json = []
    const dataTypen = gegevensPkg.ownedElements.filter(element => element instanceof type.UMLDataType)
    const gegevensId = getGenericModelId() + "/gegevens"

    dataTypen.forEach(dataType => {
        const name = String(dataType.name)
        const dataTypeId = gegevensId + "/" + name
        json.push({
            "@id": dataTypeId,
            "@type": jsonLdType.DataType,
            name: name,
            documentation: buildDocumentation(dataType),
            dataWaarden: buildDataWaardenJson(dataTypeId, primitieveDataTypenPkg, codelijstenPkg, dataType),
            elementen: buildElementenJson(gegevensId, dataType),
        })
    })

    return json
}

/**
 * Build a JSON-export Object for UML Primitive Types
 * @param {UMLPackage} genericPkg 
 * @returns {MetaData}
 */
function buildPrimitieveDataTypenJson(genericPkg) {
    var json = []
    const primitieveTypenPkg = genericPkg.ownedElements.find(element => element._id == primitiveTypesPkgId && element instanceof type.UMLPackage)
    const primitieveTypen = primitieveTypenPkg.ownedElements.filter(element => element instanceof type.UMLPrimitiveType)
    const primitieveTypenId = getGenericModelId() + "/primitieveTypen"
    
    primitieveTypen.forEach(primitieveType => {
        const name = String(primitieveType.name)
        json.push({
            "@id": primitieveTypenId + "/" + name,
            "@type": jsonLdType[name],
            name: name,
            documentation: buildDocumentation(primitieveType)
        })
    })

    return json
}

/**
 * Build a JSON-export Object for UML Enumerations
 * @param {UMLPackage} genericPkg 
 * @returns {MetaData}
 */
function buildCodelijstenJson(genericPkg) {
    var json = []
    const codelijstenPkg = genericPkg.ownedElements.find(element => element._id == codelijstenPkgId && element instanceof type.UMLPackage)
    const codelijsten = codelijstenPkg.ownedElements.filter(element => element instanceof type.UMLEnumeration)
    const codelijstenId = getGenericModelId() + "/codelijsten" 
    
    codelijsten.forEach(codelijst => {
        const name = String(codelijst.name)
        json.push({
            "@id": codelijstenId + "/" + name,
            "@type": jsonLdType.Enumeration,
            name: name,
            documentation: buildDocumentation(codelijst)
        })
    })

    return json
}


/**
 * Build a JSON-export Object from iStandaard UML Bericht Model MetaData
 * @param {Project} project 
 * @returns json
 */
function buildSpecificMetaDataJson(project) {
    setGenericModelId(project)
    setSpecificModelId(project) 
    setProjectName(project)
    setProjectVersion(project)
    const berichtenPkg = getSpecificBerichtenPackage(project)
    const json = {
        "@context": globals.jsonLdContextFileName,
        "@id": getSpecificModelId(),
        "@type": jsonLdType.Model,
        name: String(getProjectName()),
        version: String(getProjectVersion()),
        berichten: buildBerichtenPkgJson(berichtenPkg)
    }

    return json
}

/**
 * Get the package containing all defined Berichten
 * @param {Project} project 
 */
function getSpecificBerichtenPackage(project) {
    return utils.getUMLPackageElementByName(
        utils.getUMLPackageElementByname(
            project.ownedElements, globals.SPECIFIC_MODEL_PACKAGE.name
        ).ownedElements, globals.BERICHTEN_PACKAGE.name
    )
}

/**
 * Build a JSON object from the tags contained in the packages below the 'Berichten' package.
 * If `berichtenPackage` is not named 'Berichten', then do nothing as we don't need this for registers.
 * @param {Project} root 
 */
function buildBerichtenTitleAndReply(root) {
    const berichtenPackage = getSpecificBerichtenPackage(root)
    
    if (berichtenPackage.name != 'Berichten') {
        return null
    }

    const json = []
    berichtenPackage.ownedElements.filter(ownedElement =>
        ownedElement.constructor.name == 'UMLPackage' && Object.hasOwn(ownedElement, "tags")
    ).forEach(taggedPackage => {
        const tags = taggedPackage.tags
        let titleTag = tags.find(tag => tag.name == 'titel')
        let replyTag = tags.find(tag => tag.name == 'retourbericht')
        if (titleTag != undefined && replyTag != undefined)
        {
            // Add the bericht defined in UML
            json.push({
                name: taggedPackage.name,
                title: titleTag.value,
                reply: replyTag.value,
                isOutgoing: true
            })
            // If defined, add return bericht
            if (replyTag != undefined) {
                json.push({
                    name: replyTag.value,
                    title: titleTag.value + ' Retour',
                    isOutgoing: false
                })
            }
        }
    })

    return json
}


/**
 * Build a JSON-export Object from iStandaard UML Generic Model MetaData (DataTypen, Codelijsten, ...)
 * @param {Project} project 
 * @returns json
 */
function buildGenericMetaDataJson(project) {
    setGenericModelId(project)
    const genericPkg = utils.getUMLPackageElementByname(project.ownedElements, globals.GENERIC_MODEL_PACKAGE.name)
    const gegevensPkg = utils.getUMLPackageElementByname(genericPkg.ownedElements, globals.GEGEVENS_MODEL_PACKAGE.name)
    const primitieveDataTypen = buildPrimitieveDataTypenJson(genericPkg)
    const codelijsten = buildCodelijstenJson(genericPkg)
    const gegevens = buildGegegevensJson(primitieveDataTypen, codelijsten, gegevensPkg)
    const json = {
        "@context": globals.jsonLdContextFileName,
        "@id": getGenericModelId(),
        "@type": jsonLdType.Model,
        name: String(getProjectName()),
        version: String(getProjectVersion()),
        gegevens: gegevens,
        primitieveDataTypen: primitieveDataTypen,
        codelijsten: codelijsten
  }

    return json
}

exports.buildSpecificMetaDataJson = buildSpecificMetaDataJson
exports.buildGenericMetaDataJson = buildGenericMetaDataJson
exports.buildBerichtenTitleAndReply = buildBerichtenTitleAndReply
exports.jsonLdContext = jsonLdContext
exports.jsonLdType = jsonLdType
