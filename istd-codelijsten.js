const utils = require('./dgpi-utils')
const codelijstenPkgId = 'iStandaardCodelijsten'

/**
 * Initialize iStandaard Codelijsten Package
 * @param {Project | UMLPackage} root 
 */
function init(root) {
    const codelijstenPkg = {
        _type: 'UMLPackage',
        _id: codelijstenPkgId,
        _parent: {
            $ref: root._id
        },
        name: 'Codelijsten'
    }
    app.project.importFromJson(root, codelijstenPkg)
}

/**
 * Get the UML Codelijst Enumeration Id for the Standaard Simple type XS Restriction
 * @param {String} standaardId 
 * @param {String} xsRestriction 
 * @returns {String | undefined}
 */
function getCodelijstId(standaardId, xsRestriction) {
    var codellijstId = undefined
    const xsRestrictionAnnotation = utils.getXsAnnotation(xsRestriction.elements)

    if (xsRestrictionAnnotation) {
        const xsAppInfo = xsRestrictionAnnotation.elements.find(element => element.name == 'xs:appinfo')

        if (xsAppInfo) {
            const codelijstId = standaardId + ':codelijstNaam'
            const codeLijst = xsAppInfo.elements.find(element => element.name == codelijstId)
            const codeLijstTextObject = codeLijst.elements.find(element => element.type == 'text')

            if (codeLijstTextObject) {
                const codeLijstTextParts = codeLijstTextObject.text.split(':')
                const codeLijstId = codeLijstTextParts[0].trim()
                console.log(codeLijstId)
                const codeLijstDocumentation = codeLijstTextParts[1].trim()
                console.log(codeLijstDocumentation)
            }

        }

    }
    
    return codellijstId
}

exports.init = init
exports.getCodelijstId = getCodelijstId