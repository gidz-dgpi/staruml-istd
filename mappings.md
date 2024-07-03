# Relaties

## Relatie met tussen-klasse

```xml
    ...
	<xs:complexType name="Client">
    ...
        <xs:sequence>
            <xs:element name="Relaties" type="wmo301:Relaties" minOccurs="0"></xs:element>
        ...
        </xs:sequence>
	</xs:complexType>
	<xs:complexType name="Relaties">
		<xs:sequence>
			<xs:element name="Relatie" type="wmo301:Relatie"  maxOccurs="unbounded"></xs:element>
		</xs:sequence>
	</xs:complexType>
    ...
```