/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Modellen JSON Export
 * 
 * Based on: https://docs.staruml.io/developing-extensions/accessing-elements
 * 
 */

const utils = require('./dgpi-utils')

const LD_JSON_CONTEXT = {
    "schema": "https://schema.org",
    "uml": "https://www.omg.org/spec/UML/2.5.1#",
    "xmi": "https://www.omg.org/spec/UML/20161101/UML.xmi#",
    "istd": "https://www.istandaarden.nl/over-istandaarden/istandaarden/begrippenlijst#",
    "model": "https://www.istandaarden.nl/",
    "name": "schema:name",
    "version": "schema:version",
    "multiplicity": "uml:Multiplicity",
    "aggregation": "uml:Aggregation",
    "isID": "xmi:isID",
    "type": "uml:Type",
    "parent": {
        "@id": "uml:End1",
        "@type": "uml:AssociationEnd"
    },
    "child": {
        "@id": "uml:End2",
        "@type": "uml:AssociationEnd"
    },
    "berichten": {
        "@id": "istd:berichtspecificaties",
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
        "@type": "uml:Attribute",
        "@container": "@list"
    },
    "relaties": {
        "@id": "istd:relaties",
        "@type": "uml:Association",
        "@container": "@list"
    }
}

const LD_JSON_TYPE = {
    iStdInformatieModel: 'istd:informatiemodel',
    UMLPackage: 'uml:Package',
    UMLClass: 'uml:Class',
    UMLProperty: 'uml:Property',
    UMLAssociation: 'uml:Association'
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
 * Build a JSON-export elementen Object
 * @param {String} classId
 * @param {UMLClass} berichtKlasse 
 * @returns json
 */
function buildElementenJson(classId, berichtKlasse) {
    var json = []

    for (let i = 0; i < berichtKlasse.attributes.length; i++) {
        const attribute = berichtKlasse.attributes[i]
        var jsonAttribute = {
            "@id": classId + "/elementen/" + attribute.name,
            "@type": LD_JSON_TYPE.UMLProperty,
            name: attribute.name,
            type: {
                name: String(attribute.type.name)
            }
        }
        if (attribute.isID) {
            jsonAttribute['isID'] = attribute.isID
        }
        if (attribute.multiplicity) {
            jsonAttribute['multiplicity'] = attribute.multiplicity
        }
        json.push(jsonAttribute)
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
    const berichtKlassen = berichtPkg.ownedElements.filter(element => element instanceof type.UMLClass)

    for (let i = 0; i < berichtKlassen.length; i++) {
        const berichtKlasse = berichtKlassen[i]
        const classId = berichtId + "/klassen/" + berichtKlasse.name
        json.push({
            "@id": classId,
            "@type": LD_JSON_TYPE.UMLClass,
            name: berichtKlasse.name,
            elementen: buildElementenJson(classId, berichtKlasse),
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

    for (let i = 0; i < berichtPkgs.length; i++) {
        const berichtPkg = berichtPkgs[i]
        const berichtId = modelId + "/berichten/" + berichtPkg.name
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
 * Build a JSON-export Object from iStandaard UML Bericht Model MetaData
 * @param {Project} umlModel 
 * @returns json
 */
function buildBerichtModelJson(umlModel) {
    const modelId = "model:" + umlModel.name + "/" + umlModel.version
    const berichtenPkg = utils.getUMLPackagElementByName(umlModel.ownedElements, 'Berichten')
    const json = {
        "@context": LD_JSON_CONTEXT,
        "@id": modelId,
        "@type": LD_JSON_TYPE.iStdInformatieModel,
        name: umlModel.name,
        version: umlModel.version,
        berichten: buildBerichtenPkgJson(modelId, berichtenPkg)
    }

    return json
}

exports.buildBerichtModelJson = buildBerichtModelJson