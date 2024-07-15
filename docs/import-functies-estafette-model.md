# Import functies Estafette Model

Onderstaande matrix bevat een functionele samenvatting van de geimplementeerd functionaliteit waarmee de Meta-data van een Estafette Model vanuit de *import-bestanden* wordt afgebeeld op een `UML Model`.

| Meta-data | Basisschema XSD-import | Bericht XSD-import | Regelrapport XSLX-import |
|:-|:-|:-|:-|
| Berichten | | `UML Package` voor alle ingelezen berichten |
| Bericht | | `UML Package` per ingelezen bericht | |
| Berichtklasse | | `UML Class` per *xs:complexType* | |
| Relatie | | `UML Association` met een `UML AssociationEnd` voor de *parent*- en *child-Berichtklasse* referentie |
| Gegevens | `UML Package` *Gegevens* voor elke binnen de Standaard gebruikte *Complex- en/of Simple DataType* |
| Codelijsten | `UML Package` *CodeLijsten* voor elke binnen de Standaard gebruikte *Codelijst* |
| Primitieve Types | `UML Package` *Primitive Types* voor binnen de scope van de iStandaarden geldende *Primitieve Types* |
| Complex DataType | `UML DataType` per *xs:ComplexType* met 1 (of meerdere) *xs:element(en)* binnen de *xs:sequence* |
| Element | `UML Attribute` per *xs:element*  binnen de *xs:sequence* van een *Complex DataType* met referentie naar een `UML DataType`[^1]  | `UML Attribute` per *xs:element* binnen de *xs:sequence* van een *Berichtklasse* met referentie naar een `UML DataType` [^1]  | Indien rij-waarde in kolom *sleutel = 'ja'*, dan `UML Property` **`isID`** van de corresponderende `UML Attribute` op **true** zetten |
| Simple DataType | `UML DataType` per *xs:simpleType* met een *xs:restriction*|
| Primitieve Type Restrictie| `UML Dependency` met de referentie naar het *PrimitieveType* van de *xs:restriction*|
| Primitieve Type | `UML PrimitiveType` definitie van het *Primitieve Type*[^2] |
| Codelijst Restrictie | `UML Depedency` met de refentie naar de *Codelijst* van de *xs:restriction* |
| Codelijst | `UML Enumeration` binnen Standaard gebruikte *Codelijst*[^3] |


> De verwijzing naar de relevante technische producten staan in onderstaande tabel

| Technisch product | Migratie Functionaliteit |
|:-|:-|
| [Menustructuur](../menus/istandaarden.json) | Configuratie menu-opties gebruikers |  
| [iStd Basisschema XSD import](../istd-basisschema-xsd-import.js) | Script met Basisschema XSD-import functionaliteit |
| [iStd Bericht XSD import](../istd-bericht-xsd-import.js) | Script met Bericht XSD-import functionaliteit |
| [iStd Regelrapport XLSX import](../istd-regelrapport-xlsx-import.js) | Script met Regelrapport XSLX-import functionaliteit |

---

[^1]: Doorgaans op basis van het *xs:element type-attribuut* met de uitzondering wanneer het *xs:element* een *xs:simpleType* bevat. In dat geval is het onderliggende *xs:restriction base-attribuut* de basis voor de referentie naar het *Primitieve Type*.

[^2]: Binnen het Estafette Model zijn de *Primitieve Type* momenteel beperkt tot *string*, *integer*, *date* en *time*.

[^3]: De *code-waarden* worden niet binnen de `UML Enumeration` opgenomen. Zie verder [Migratie Codelijsten Estafette Model](https://repository.istandaarden.nl/dgpi/migraties/estafette-model/migratie-estafette-model-codelijsten)