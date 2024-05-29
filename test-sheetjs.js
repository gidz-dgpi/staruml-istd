const fs = require('fs')
const XLSX = require('./assets/xlsx.full.min.js')

const regelSheetFile = 'testset/regelrapport-iwmo-3.2.0.xlsx'
const regelSheet = fs.readFileSync(regelSheetFile);

const workbook = XLSX.read(regelSheet);

const regelsBerichtElems = workbook.Sheets[workbook.SheetNames[1]];

BerichtHeader = regelsBerichtElems['A1'].v

if (BerichtHeader == 'Bericht') {
    var row = 2
    var berichtNameCell = regelsBerichtElems['A' + row]
    while (berichtNameCell) {
        const bericht = berichtNameCell.v
        var nextBericht = bericht
        console.log(bericht)
        
        while (nextBericht == bericht) {
            row ++
            berichtNameCell = regelsBerichtElems['A' + row]
            nextBericht = berichtNameCell ? berichtNameCell.v : undefined

            if (nextBericht) {
                const sleutel = regelsBerichtElems['F' + row]
                
                if (sleutel) {
                    
                    if (sleutel.v == 'ja') {
                        const berichtKlasse = regelsBerichtElems['B' + row].v
                        const berichtKlasseElementDataType = regelsBerichtElems['C' + row].v
                        const berichtKlasseElement = berichtKlasseElementDataType.split('\\')[0]
                        console.log(`${bericht} / ${berichtKlasse} / ${berichtKlasseElement} = Sleutel`)
                    }

                }

            }



        }

        
    }

} else {
    console.error('Bericht-header NOT found!')
}