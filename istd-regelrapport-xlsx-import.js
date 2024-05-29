const fs = require('fs')
const XLSX = require('./assets/xlsx.full.min.js')

const COLUMN = {
    bericht: 'A',
    klasse: 'B',
    elemDataType: 'C',
    sleutel: 'F'
}


function importRegelRapport(workbook) {
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
                                console.log(sleutelId)
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
                importRegelRapport(workbook)
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