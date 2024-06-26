/**
 * 
 * StarUML Istd Extension
 * 
 * Module: iStandaarden Modellen JSON Export
 * 
 * Based on: https://docs.staruml.io/developing-extensions/accessing-elements
 * 
 */


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
 * @param {*} classId 
 * @param {*} umlClass 
 */
function buildRelatiesJson(berichtId, umlClass) {
    var json = []
    umlClass.ownedElements.forEach(element => {
        if (element instanceof type.UMLAssociation) {
            const associationId = berichtId + "/relaties/" + element.name
            json.push({
                "@id": associationId,
                "@type": LD_JSON_TYPE.UMLAssociation,
                name: element.name,
                parent: {
                    "@id": berichtId + "/klassen/" + element.end1.reference.name,
                    aggregation: element.end1.aggregation,
                    multiplicity: element.end1.multiplicity
                },
                child: {
                    "@id": berichtId + "/klassen/" + element.end2.reference.name,
                    aggregation: element.end2.aggregation,
                    multiplicity: element.end2.multiplicity
                }
            })
            
        }
    })
    return json
}


/**
 * Build a JSON-export elementen Object
 * @param {*} umlClass 
 * @returns 
 */
function buildElementenJson(classId, umlClass) {
    var json = []
    umlClass.attributes.forEach(attribute => {
        var jsonAttribute = {
            "@id": classId + "/elementen/" + attribute.name,
            "@type": LD_JSON_TYPE.UMLProperty,
            name: attribute.name,
            type: {
                name: attribute.type.name
            }
        }
        if (attribute.isID) {
            jsonAttribute['isID'] = attribute.isID
        }
        if (attribute.multiplicity) {
            jsonAttribute['multiplicity'] = attribute.multiplicity
        }
        json.push(jsonAttribute)
    })
    return json
}


/**
 * Build a JSON-export klassen Object
 * @param {UMLPackage} umlPackage 
 * @returns json
 */
function buildKlassenJson(berichtId, umlPackage) {
    var json = []
    umlPackage.ownedElements.forEach(element => {
        if (element instanceof type.UMLClass) {
            const classId = berichtId + "/klassen/" + element.name
            json.push({
                "@id": classId,
                "@type": LD_JSON_TYPE.UMLClass,
                name: element.name,
                elementen: buildElementenJson(classId, element),
                relaties: buildRelatiesJson(berichtId, element)
            })
            
        }
    })
    return json
}


/**
 * Build a JSON-export berichten Object
 * @param {UMLPackage} berichtenPackage 
 * @returns berichten
 */
function buildBerichtenJson(modelId, berichtenPackage) {
    var json = []
    berichtenPackage.ownedElements.forEach(element => {
        if (element instanceof type.UMLPackage) {
            const berichtId = modelId + "/berichten/" + element.name
            json.push({
                "@id": berichtId,
                "@type": LD_JSON_TYPE.UMLPackage,
                name: element.name,
                klassen: buildKlassenJson(berichtId, element)
            })
            
        }
    })
    return json
}


/**
 * Build a JSON-export Object from iStandaard UML Bericht Model MetaData
 * @param {Object} root 
 * @returns json
 */
function buildBerichtModelJson(umlModel) {
    const modelId = "model:" + umlModel.name + "/" + umlModel.version
    var json = {
        "@context": LD_JSON_CONTEXT,
        "@id": modelId,
        "@type": LD_JSON_TYPE.iStdInformatieModel,
        name: umlModel.name,
        version: umlModel.version,
        berichten: []
    }
    umlModel.ownedElements.forEach(element => {
        if (element instanceof type.UMLPackage) {
            if (element.name == 'Berichten') {
                json.berichten = buildBerichtenJson(modelId, element);
            }
        }
    });
    return json
}

exports.buildBerichtModelJson = buildBerichtModelJson