const utils = require('./dgpi-utils')
const codelijstenPkgId = 'iStandaardCodelijsten'
const codelijstenPkgName = 'Codelijsten'

/**
 * Initialize iStandaard Codelijsten Package
 * @param {Project | UMLPackage} root 
 * @returns {UMLPackage}
 */
function init(root) {
    const codelijstenPkg = {
        _type: 'UMLPackage',
        _id: codelijstenPkgId,
        _parent: {
            $ref: root._id
        },
        name: codelijstenPkgName
    }
    return app.project.importFromJson(root, codelijstenPkg)
}

/**
 * Get the UML Codelijst Enumeration Id for the Standaard Simple type XS Restriction
 * @param {UMLPackage} codelijstenPkg 
 * @param {String} standaardId 
 * @param {String} xsRestriction 
 * @returns {String | undefined}
 */
function getCodelijstId(codelijstenPkg, standaardId, xsRestriction) {
    var codellijstId = undefined
    const xsRestrictionAnnotation = utils.getXsAnnotation(xsRestriction.elements)

    if (xsRestrictionAnnotation) {
        const xsAppInfo = xsRestrictionAnnotation.elements.find(element => element.name == 'xs:appinfo')

        if (xsAppInfo) {
            const codelijstElemName = standaardId + ':codelijstNaam'
            const codeLijstElem = xsAppInfo.elements.find(element => element.name == codelijstElemName)
            const codeLijstTextObject = codeLijstElem.elements.find(element => element.type == 'text')

            if (codeLijstTextObject) {
                const codeLijstTextParts = codeLijstTextObject.text.split(':')
                const codeLijstName = codeLijstTextParts[0].trim()
                const codeLijstDocumentation = codeLijstTextParts[1].trim()
                var codelijst = codelijstenPkg.ownedElements.find(element => element.name == codeLijstName)

                if (codelijst) {
                    codellijstId = codelijst._id
                } else {
                    codellijstId = 'iStandaardCodelijst_' + standaardId + '_' + codeLijstName
                    const codelijstEnum = {
                        _type: 'UMLEnumeration',
                        _id: codellijstId,
                        _parent: {
                            $ref: codelijstenPkg._id
                        },
                        name: codeLijstName,
                        documentation: codeLijstDocumentation
                    }
                    app.project.importFromJson(codelijstenPkg, codelijstEnum)
                }

            }

        }

    }

    
    
    return codellijstId
}

exports.init = init
exports.getCodelijstId = getCodelijstId