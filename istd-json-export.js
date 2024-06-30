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

const LD_JSON_CONTEXT = {
    "schema": "https://schema.org",
    "uml": "https://www.omg.org/spec/UML/2.5.1#",
    "xmi": "https://www.omg.org/spec/UML/20161101/UML.xmi#",
    "istd": "https://www.istandaarden.nl/over-istandaarden/istandaarden/begrippenlijst#",
    "model": "https://www.istandaarden.nl/",
    "name": "schema:name",
    "version": "schema:version",
    "multiplicity": "xmi:multiplicity",
    "aggregation": "xmi:Aggregation",
    "isID": "xmi:isID",
    "dataType": "xmi:DataType",
    "parent": {
        "@id": "istd:BerichtKlasseRelatieParentEnd",
        "@type": "xmi:AssociationEnd"
    },
    "child": {
        "@id": "istd:BerichtKlasseRelatieChildEnd",
        "@type": "xmi:AssociationEnd"
    },
    "berichten": {
        "@id": "istd:berichten",
        "@type": "xmi:Package",
        "@container": "@list"
    },
    "klassen": {
        "@id": "istd:berichtklassen",
        "@type": "xmi:Class",
        "@container": "@list"
    },
    "elementen": {
        "@id": "istd:berichtelementen",
        "@type": "xmi:attribute",
        "@container": "@list"
    },
    "relaties": {
        "@id": "istd:relaties",
        "@type": "xmi:Association",
        "@container": "@list"
    },
    "gegevens": {
        "@id": "istd:gegevensmodel",
        "@type": "xmi:Package",
        "@container": "@list"
    }
}

const LD_JSON_TYPE = {
    iStdInformatieModel: 'istd:informatiemodel',
    UMLPackage: 'xmi:Package',
    UMLClass: 'xmi:Class',
    UMLProperty: 'xmi:Property',
    UMLAssociation: 'xmi:Association',
    UMLDataType: 'xmi:DataType'
}

/**
 * Build a JSON-export relaties Object
 * @param {String} berichtId 
 * @param {UMLClass} berichtKlasse 
 */
function buildRelatiesJson(berichtId, berichtKlasse) {
    var json = []
    const relaties = berichtKlasse.ownedElements.filter(element => element instanceof type.UMLAssociation)

    for (let i = 0; i < relaties.length; i++) {
        const relatie = relaties[i]
        const associationId = berichtId + "/relaties/" + relatie.name
        json.push({
            "@id": associationId,
            "@type": LD_JSON_TYPE.UMLAssociation,
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
        "@type": LD_JSON_TYPE.UMLProperty,
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
 * @param {UMLClass} berichtKlasse
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
 * @param {UMLPackage} berichtPkg 
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
            "@type": LD_JSON_TYPE.UMLClass,
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
 * @param {UMLPackage} berichtenPkg 
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
            "@type": LD_JSON_TYPE.UMLPackage,
            name: berichtPkg.name,
            klassen: buildBerichtKlassenJson(berichtId, berichtPkg)
        })
    }

    return json
}

/**
 * Build a JSON-export Gegevens Package Object
 * @param {String} modelId 
 * @param {UMLPackage} gegevensModelPkg 
 */
function buildGegegevensJson(modelId, primitiveTypes, gegevensModelPkg) {
    var json = []
    const dataTypen = gegevensModelPkg.ownedElements.filter(element => element instanceof type.UMLDataType)
    const gegevensModelId = modelId + "/gegevens"

    for (let i = 0; i < dataTypen.length; i++) {
        const dataType = dataTypen[i]
        const dataTypeId = gegevensModelId + "/" + dataType.name
        var dataTypeJsom = {
            "@id": dataTypeId,
            "@type": LD_JSON_TYPE.UMLDataType,
            name: dataType.name
        }



        json.push(dataTypeJsom)
    }

    return json
}

function buildPrimitiveTypesJson(modelId) {
    var json = []
    const primitiveTypesPkg = project.ownedElements.find(element => element._id == primitiveTypesPkgId && element instanceof type.UMLPackage)


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
    const primitiveTypes = buildPrimitiveTypesJson(modelId)
    const gegevens = buildGegegevensJson(modelId, primitiveTypes, gegevensPkg)
    const json = {
        "@context": LD_JSON_CONTEXT,
        "@id": modelId,
        "@type": LD_JSON_TYPE.iStdInformatieModel,
        name: project.name,
        version: project.version,
        berichten: buildBerichtenPkgJson(modelId, berichtenPkg),
        gegevens: gegevens,
        primitiveTypes: primitiveTypes
  }

    return json
}


exports.buildBerichtModelJson = buildBerichtModelJson