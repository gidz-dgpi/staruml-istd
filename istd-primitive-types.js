const primitivePkgId = 'iStandaardPrimitiveTypes'
const primitiveTypeElements = [
    {
        _type: 'UMLPrimitiveType',
        _id: 'iStandaardIntegerType',
        _parent: {
            $ref: primitivePkgId
        },
        name: 'integer'
    },
    {
        _type: 'UMLPrimitiveType',
        _id: 'iStandaardStringType',
        _parent: {
            $ref: primitivePkgId
        },
        name: 'string'
    },
    {
        _type: 'UMLPrimitiveType',
        _id: 'iStandaardDateType',
        _parent: {
            $ref: primitivePkgId
        },
        name: 'date'
    },
    {
        _type: 'UMLPrimitiveType',
        _id: 'iStandaardTimeType',
        _parent: {
            $ref: primitivePkgId
        },
        name: 'time'
    }
]

/**
 * Initialize iStandaard Primitive Type Package
 * @param {Project | UMLPackage} root 
 * @returns {UMLPackage}
 */
function init(root) {
    const primitivePkg = {
        _type: 'UMLPackage',
        _id: primitivePkgId,
        _parent: {
            $ref: root._id
        },
        name: 'Primitive Types',
        ownedElements: primitiveTypeElements
    }
    return app.project.importFromJson(root, primitivePkg)
}

/**
 * Get the UML Primitive Type Id for the XS Base
 * @param {String} xsBase 
 * @returns {String | undefined}
 */
function getTypeId(xsBase) {
    var typeId = undefined
    const typeName = xsBase.split(':')[1]
    const typeElem = primitiveTypeElements.find(element => element.name == typeName)

    if (typeElem) {
        typeId = typeElem._id
    }

    return typeId
}

exports.init = init
exports.getTypeId = getTypeId