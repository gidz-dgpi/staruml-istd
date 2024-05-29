const fs = require('fs')
const XLSX = require('./assets/xlsx.full.min.js')
const globals = require('./istd-globals')
const utils = require('./dgpi-utils')

const COLUMN = {
    bericht: 'A',
    klasse: 'B',
    elemDataType: 'C',
    sleutel: 'F'
}

/**
 * Importeer Regelrapport workbook into project
 * @param {UMLPackage} berichtenPkg 
 * @param {XLSXWorkbook} workbook 
 */
function importRegelRapport(berichtenPkg, workbook) {
    const regelsBerichtElems = workbook.Sheets[workbook.SheetNames[1]];
    var row = 1
    BerichtHeader = regelsBerichtElems[COLUMN.bericht + row].v

    if (BerichtHeader == 'Bericht') {
        row ++
        var berichtNameCell = regelsBerichtElems[COLUMN.bericht + row]

        while (berichtNameCell) {
            const bericht = berichtNameCell.v
            var nextBericht = bericht
            var lastSleutelId = undefined
            
            while (nextBericht == bericht) {
                row ++
                berichtNameCell = regelsBerichtElems[COLUMN.bericht + row]
                nextBericht = berichtNameCell ? berichtNameCell.v : undefined

                if (nextBericht) {
                    const sleutel = regelsBerichtElems[COLUMN.sleutel + row]
                    
                    if (sleutel) {
                        
                        if (sleutel.v == 'ja') {
                            const berichtKlasse = regelsBerichtElems[COLUMN.klasse + row].v
                            const berichtKlasseElementDataType = regelsBerichtElems[COLUMN.elemDataType + row].v
                            const berichtKlasseElement = berichtKlasseElementDataType.split('\\')[0]
                            const sleutelId = `${bericht} / ${berichtKlasse} / ${berichtKlasseElement}`

                            if (sleutelId != lastSleutelId) {
                                console.log(`${sleutelId} = isID`)
                                const umlClass = utils.getUMLClassElementByName(berichtenPkg.ownedElements, berichtKlasse)
                                console.log(umlClass)

                                lastSleutelId = sleutelId
                            }
                        }

                    }

                }



            }

            
        }

    } else {
        console.error('Bericht-header NOT found!')
    }
}


/**
 * Import XSD File of a iStandaard Bericht
 * @param {String} xsdFile 
 */
function importRegelRapportXlsxFile(regelRapportFile) {

    try {
        const regelSheet = fs.readFileSync(regelRapportFile)
        try {
            const workbook = XLSX.read(regelSheet)
            try {
                const project = app.project.getProject()
                const berichtenPkg = utils.getUMLPackagElementByName(project.ownedElements, globals.BERICHTEN_PACKAGE.name)

                if (berichtenPkg) {
                    importRegelRapport(berichtenPkg, workbook)
                } else {
                    console.warn('Geen UMLPackage met de Naam Berichten gevonden!')
                }

            } catch (err) {
                console.error(err)
            }
        } catch (err) {
            console.error(err)
        }
    } catch (err) {
        console.error(err)
    }

}

exports.importRegelRapportXlsxFile = importRegelRapportXlsxFile