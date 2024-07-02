/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Modellen JSON Export
 * 
 * Based on: https://docs.staruml.io/developing-extensions/accessing-elements
 * 
 */

const primitiveTypesPkgId = require('./istd-primitive-types').primitiveTypesPkgId
const codelijstenPkgId = require('./istd-codelijsten').codelijstenPkgId

const LD_JSON_CONTEXT = {
    "schema": "https://schema.org",
    "xs": "http://www.w3.org/2001/XMLSchema#",
    "uml": "https://www.omg.org/spec/UML/20161101/UML.xmi#",
    "istd": "https://www.istandaarden.nl/over-istandaarden/istandaarden/begrippenlijst#",
    "model": "https://www.istandaarden.nl/",
    "name": "schema:name",
    "version": "schema:version",
    "multiplicity": "uml:multiplicity",
    "aggregation": "uml:Aggregation",
    "isID": "uml:isID",
    "dataType": "uml:DataType",
    "primitiveType": "uml:PrimitiveType",
    "target": "uml:target",
    "dependency": "uml:Dependency",
    "parent": {
        "@id": "istd:BerichtKlasseRelatieParentEnd",
        "@type": "uml:AssociationEnd"
    },
    "child": {
        "@id": "istd:BerichtKlasseRelatieChildEnd",
        "@type": "uml:AssociationEnd"
    },
    "berichten": {
        "@id": "istd:berichten",
        "@type": "uml:Package",
        "@container": "@list"
    },
    "klassen": {
        "@id": "istd:berichtklassen",
        "@type": "uml:Package",
        "@container": "@list"
    },
    "elementen": {
        "@id": "istd:elementen",
        "@type": "uml:Attributes",
        "@container": "@list"
    },
    "relaties": {
        "@id": "istd:relaties",
        "@type": "uml:Associations",
        "@container": "@list"
    },
    "gegevens": {
        "@id": "istd:gegevensmodel",
        "@type": "uml:Package",
        "@container": "@list"
    },
    "primitieveDataTypen": {
        "@id": "istd:primitieveDataTypen",
        "@type": "uml:Package",
        "@container": "@list"
    },
    "codelijsten": {
        "@id": "istd:codelijsten",
        "@type": "uml:Package",
        "@container": "@list"
    },
    "dataWaarden": {
        "@id": "istd:dataWaarden",
        "@type": "uml:Dependencies",
        "@container": "@list"
    }
}

const LD_JSON_TYPE = {
    Model: 'istd:informatiemodel',
    Package: 'uml:Package',
    Class: 'uml:Class',
    Property: 'uml:Property',
    Association: 'uml:Association',
    DataType: 'uml:DataType',
    SimpleType: 'xs:simpleType',
    Enumeration: 'uml:Enumeration',
    Dependency: 'uml:Dependency',
    boolean: 'xs:boolean',
    string: 'xs:boolean',
    date: 'xs:date',
    time: 'xs:time',
    integer: 'xs:integer'
}


/**
 * Build a JSON-export relaties Object
 * @param {String} berichtId 
 * @param {Class} berichtKlasse 
 */
function buildRelatiesJson(berichtId, berichtKlasse) {
    var json = []
    const relaties = berichtKlasse.ownedElements.filter(element => element instanceof type.UMLAssociation)

    for (let i = 0; i < relaties.length; i++) {
        const relatie = relaties[i]
        const associationId = berichtId + "/relaties/" + relatie.name
        json.push({
            "@id": associationId,
            "@type": LD_JSON_TYPE.Association,
            name: relatie.name,
            parent: {
                "@id": berichtId + "/klassen/" + relatie.end1.reference.name,
                aggregation: relatie.end1.aggregation,
                multiplicity: relatie.end1.multiplicity
            },
            child: {
                "@id": berichtId + "/klassen/" + relatie.end2.reference.name,
                aggregation: relatie.end2.aggregation,
                multiplicity: relatie.end2.multiplicity
            }
        })
    }

    return (json.length > 0) ? json : undefined
}


/**
 * Build Element JSON Object from UML Attribute
 * @param {String} modelId 
 * @param {String} elementenId 
 * @param {UMLAttribute} attribute 
 * @returns json
 */
function buildElementJson(modelId, elementenId, attribute) {
    const name = String(attribute.name)
    var json = {
        "@id": elementenId + "/" + name,
        "@type": LD_JSON_TYPE.Property,
        name: name,
        dataType: modelId + "/gegevens/" + attribute.type.name
    }

    if (attribute.isID) {
        json['isID'] = attribute.isID
    }

    if (attribute.multiplicity) {
        json['multiplicity'] = attribute.multiplicity
    }

    return json
}


/**
 * Build a JSON-export elementen Object
 * @param {String} modelId
 * @param {String} elementId
 * @param {UMLClass|UMLDataType} elementOwner
 * @returns json
 */
function buildElementenJson(modelId, elementId, elementOwner) {
    var json = []
    const elementenId = elementId + "/elementen"

    for (let i = 0; i < elementOwner.attributes.length; i++) {
        const attribute = elementOwner.attributes[i]
        var elementJson = buildElementJson(modelId, elementenId, attribute)
        json.push(elementJson)
    }

    return (json.length > 0) ? json : undefined 
}


/**
 * Build a JSON-export klassen Object
 * @param {String} modelId
 * @param {String} berichtId
 * @param {Package} berichtPkg 
 * @returns json
 */
function buildBerichtKlassenJson(modelId, berichtId, berichtPkg) {
    var json = []
    const berichtKlassen = berichtPkg.ownedElements.filter(element => element instanceof type.UMLClass)
    const berichtKlassenId = berichtId + "/klassen"

    for (let i = 0; i < berichtKlassen.length; i++) { 
        const berichtKlasse = berichtKlassen[i]
        const classId = berichtKlassenId + "/" + berichtKlasse.name
        json.push({
            "@id": classId,
            "@type": LD_JSON_TYPE.Class,
            name: String(berichtKlasse.name), 
            elementen: buildElementenJson(modelId, classId, berichtKlasse),
            relaties: buildRelatiesJson(berichtId, berichtKlasse),
        })
    }

    return json
}


/**
 * Build a JSON-export Berichten Package Object
 * @param {String} modelId
 * @param {Package} berichtenPkg 
 * @returns json
 */
function buildBerichtenPkgJson(modelId, berichtenPkg) {
    var json = []
    const berichtPkgs = berichtenPkg.ownedElements.filter(element => element instanceof type.UMLPackage)
    const berichtPkgsId = modelId + "/berichten"

    for (let i = 0; i < berichtPkgs.length; i++) {
        const berichtPkg = berichtPkgs[i]
        const berichtId =berichtPkgsId + "/" + berichtPkg.name
        json.push({
            "@id": berichtId,
            "@type": LD_JSON_TYPE.Package,
            name: berichtPkg.name,
            klassen: buildBerichtKlassenJson(modelId, berichtId, berichtPkg)
        })
    }

    return json
}

function buildDataWaardenJson(dataTypeId, primitieveDataTypen, codelijsten, dataType) {
    var json = []
    const dependencies = dataType.ownedElements.filter(element => element instanceof type.UMLDependency)
    const dataWaardebId = dataTypeId + "/dataWaarden"

    for (let i = 0; i < dependencies.length; i++) {
        const dependencyTarget = dependencies[i].target
        
        if (dependencyTarget instanceof type.UMLPrimitiveType) {
            const primitieveDataType = primitieveDataTypen.find(element => element.name == dependencyTarget.name)
            json.push({
                "@id": dataWaardebId + "/primitieveDataType",
                "@type": LD_JSON_TYPE.Dependency,
                parent: primitieveDataType['@id']
            })
        } else if (dependencyTarget instanceof type.UMLEnumeration) {
            const codelijst = codelijsten.find(element => element.name == dependencyTarget.name)
            json.push({
                "@id": dataWaardebId + "/codelijst",
                "@type": LD_JSON_TYPE.Dependency,
                parent: codelijst['@id']
            })

        }

    }

    return (json.length > 0) ? json : undefined
}

/**
 * Build a JSON-export Gegevens Package Object
 * @param {String} modelId 
 * @param {Package} gegevensModelPkg 
 */
function buildGegegevensJson(modelId, primitieveDataTypen, codelijsten, gegevensPkg) {
    var json = []
    const dataTypen = gegevensPkg.ownedElements.filter(element => element instanceof type.UMLDataType)
    const gegevensId = modelId + "/gegevens"

    for (let i = 0; i < dataTypen.length; i++) {
        const dataType = dataTypen[i]
        const name = String(dataType.name)
        const dataTypeId = gegevensId + "/" + name
        json.push({
            "@id": dataTypeId,
            "@type": LD_JSON_TYPE.DataType,
            name: name,
            dataWaarden: buildDataWaardenJson(dataTypeId, primitieveDataTypen, codelijsten, dataType),
            elementen: buildElementenJson(modelId, gegevensId, dataType),
        })
    }

    return json
}

/**
 * Build a JSON-export Object for UML Primitive Types
 * @param {*} modelId 
 * @param {*} project 
 * @returns 
 */
function buildPrimitieveDataTypenJson(modelId, project) {
    var json = []
    const primitieveTypenPkg = project.ownedElements.find(element => element._id == primitiveTypesPkgId && element instanceof type.UMLPackage)
    const primitieveTypen = primitieveTypenPkg.ownedElements.filter(element => element instanceof type.UMLPrimitiveType)
    const primitieveTypenId = modelId + "/primitieveTypen"
    
    for (let i = 0; i < primitieveTypen.length; i++) {
        const primitieveType = primitieveTypen[i]
        const name = String(primitieveType.name)
        json.push({
            "@id": primitieveTypenId + "/" + name,
            "@type": LD_JSON_TYPE[name],
            name: name
        })
    }

    return json
}

/**
 * Build a JSON-export Object for UML Enumerations
 * @param {*} modelId 
 * @param {*} project 
 * @returns 
 */
function buildCodelijstenJson(modelId, project) {
    var json = []
    const codelijstenPkg = project.ownedElements.find(element => element._id == codelijstenPkgId && element instanceof type.UMLPackage)
    const codelijsten = codelijstenPkg.ownedElements.filter(element => element instanceof type.UMLEnumeration)
    const codelijstenId = modelId + "/codelijsten" 
    
    for (let i = 0; i < codelijsten.length; i++) {
        const codelijst = codelijsten[i]
        const name = String(codelijst.name)
        json.push({
            "@id": codelijstenId + "/" + name,
            "@type": LD_JSON_TYPE.Enumeration,
            name: name
        })
    }

    return json
}


/**
 * Build a JSON-export Object from iStandaard UML Bericht Model MetaData
 * @param {Project} project 
 * @returns json
 */
function buildBerichtModelJson(project) {
    const modelId = "model:" + project.name + "/" + project.version
    const berichtenPkg = project.ownedElements.find(element => element.name == 'Berichten' && element instanceof type.UMLPackage)
    const gegevensPkg = project.ownedElements.find(element => element.name == 'Gegevens' && element instanceof type.UMLPackage)
    const primitieveDataTypen = buildPrimitieveDataTypenJson(modelId, project)
    const codelijsten = buildCodelijstenJson(modelId, project)
    const gegevens = buildGegegevensJson(modelId, primitieveDataTypen, codelijsten, gegevensPkg)
    const json = {
        "@context": LD_JSON_CONTEXT,
        "@id": modelId,
        "@type": LD_JSON_TYPE.Model,
        name: project.name,
        version: project.version,
        berichten: buildBerichtenPkgJson(modelId, berichtenPkg),
        gegevens: gegevens,
        primitieveDataTypen: primitieveDataTypen,
        codelijsten: codelijsten
  }

    return json
}


exports.buildBerichtModelJson = buildBerichtModelJson