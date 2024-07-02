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
        "@type": "uml:Class",
        "@container": "@list"
    },
    "elementen": {
        "@id": "istd:berichtelementen",
        "@type": "uml:attribute",
        "@container": "@list"
    },
    "relaties": {
        "@id": "istd:relaties",
        "@type": "uml:Association",
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
        "@type": "uml:Package",
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
    Dependency: 'uml:Dependency'
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

    return json
}


/**
 * 
 * @param {String} elementenId 
 * @param {UMLAttribute} attribute 
 * @returns json
 */
function buildElementJson(elementenId, attribute) {
    const name = String(attribute.name)
    var json = {
        "@id": elementenId + "/" + name,
        "@type": LD_JSON_TYPE.Property,
        name: name,
        dataType: {
            name: String(attribute.type.name)
        }
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
 * @param {String} klasseId
 * @param {Class} berichtKlasse
 * @returns json
 */
function buildBerichtKlasseElementenJson(klasseId, berichtKlasse) {
    var json = []
    const elementenId = klasseId + "/elementen"

    for (let i = 0; i < berichtKlasse.attributes.length; i++) {
        const attribute = berichtKlasse.attributes[i]
        var elementJson = buildElementJson(elementenId, attribute)
        json.push(elementJson)
    }

    return json
}


/**
 * Build a JSON-export klassen Object
 * @param {String} berichtId
 * @param {Package} berichtPkg 
 * @returns json
 */
function buildBerichtKlassenJson(berichtId, berichtPkg) {
    var json = []
    //const berichtKlassen = berichtPkg.ownedElements.filter(element => element instanceof type.UMLClass)
    const berichtKlassen = berichtPkg.ownedElements.filter(element => element instanceof type.UMLClass)
    const berichtKlassenId = berichtId + "/klassen"

    for (let i = 0; i < berichtKlassen.length; i++) {
        const berichtKlasse = berichtKlassen[i]
        const classId = berichtKlassenId + "/" + berichtKlasse.name
        json.push({
            "@id": classId,
            "@type": LD_JSON_TYPE.Class,
            name: berichtKlasse.name,
            elementen: buildBerichtKlasseElementenJson(classId, berichtKlasse),
            relaties: buildRelatiesJson(berichtId, berichtKlasse)
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
            klassen: buildBerichtKlassenJson(berichtId, berichtPkg)
        })
    }

    return json
}

function buildDataWaardenJson(dataTypeId, primitieveDataTypen, codelijsten, dataType) {
    var json = {}
    const dependencies = dataType.ownedElements.filter(element => element instanceof type.UMLDependency)
    const dataWaardebId = dataTypeId + "/dataWaarden"

    for (let i = 0; i < dependencies.length; i++) {
        const dependencyTarget = dependencies[i].target
        
        if (dependencyTarget instanceof type.UMLPrimitiveType) {
            const name = String(dependencyTarget.name)
            const primitieveDataType = primitieveDataTypen.find(element => element.name == name)
            json['primitiveType'] = primitieveDataType['@type']
        } else if (dependencyTarget instanceof type.UMLEnumeration) {

        }

    }

    console.log(json)
    return json
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
        var dataTypeJson = {
            "@id": dataTypeId,
            "@type": LD_JSON_TYPE.DataType,
            name: name
        }
        const dataWaardenJson = buildDataWaardenJson(dataTypeId, primitieveDataTypen, codelijsten, dataType)

        if (dataWaardenJson != {}) {
            dataTypeJson['dataWaarden'] = dataWaardenJson
        }
        
        json.push(dataTypeJson)
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
            "@type": LD_JSON_TYPE.SimpleType,
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