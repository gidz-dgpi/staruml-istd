const fs = require('fs')
const XLSX = require('./assets/xlsx.full.min.js')

const regelSheetFile = 'testset/regelrapport-iwmo-3.2.0.xlsx'
const regelSheet = fs.readFileSync(regelSheetFile);

const workbook = XLSX.read(regelSheet);

console.log(workbook.SheetNames[0])