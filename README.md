# StarUML iStandaard Extensie

Deze StarUML-extensie bevat momenteel functionaliteit voor:

- de Migratie van huidige BizzDesign-outputs naar een StarUML-project met UML-modellen
  - [Import Functies Estafette Model](./docs/import-functies-estafette-model.md)
- de Publicatie van de UML-modellen in een bewaar-formaat dat kan worden hergebruikt in de Leverstraat (en toekomstig te gebruiken modelleertooling)
  - [JSON Export Functies](./docs/json-export-functies.md)




# Technische referenties

StarUML:

- [Developing StarUML Extensiions](https://docs.staruml.io/developing-extensions)
  - Locatie Extensie ZIN-laptop `C:\Users\<ZIN-user>\AppData\Roaming\StarUML\extensions\user`
- [StarUML Open API Reference](https://files.staruml.io/api-docs/6.0.0/api/index.html)

Gebruikte Open Source componenten:

- Inlezen XSD-specificaties: [xml-js](https://github.com/nashwaan/xml-js)
- Inlezen Excel-sheets [sheetjs](https://docs.sheetjs.com/docs)
