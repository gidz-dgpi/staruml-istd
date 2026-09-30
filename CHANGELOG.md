# Changelog

Alle noemenswaardige wijzigingen aan dit project zullen worden gedocumenteerd in dit bestand.

Het format is gebaseerd op [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
en dit project conformeert aan [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Fixed

### Changed

### Deprecated

### Removed

## [0.15.0] - 2025-10-31

### Fixed

- Linked data context:
  - Het string basetype is van type `xs:boolean`.
  - Het gegenereerde linked data context object is niet herkenbaar als context.
  - `relaties` heeft ongeldig UML type
  - `dataType` is niet correct gespecificeerd om een referentie te zijn
  - `target` is niet correct gespecificeerd om een referentie te zijn
- Specific metadata file:
  - Relaties:
    - Relaties hebben geen unieke `@id`
    - Relatie einden hebben geen unieke `@id`
    - Relatie einden hebben geen `@type`
    - Verwijzing naar object opnemen in `target` attribute van `parent` en `child` attributten van een `relatie`
- Optimalisatie: gebruik `forEach` methode van array in plaats van loop.

### Added

### Changed

### Deprecated

### Removed

## [0.14.6] - 2026-03-20

### Fixed

- Fetch more than 20 branches. Now 100 branches are fetched.

### Added

### Changed

### Deprecated

### Removed

- utils.encodeBase64JsonStrToObj  
  Base64 decoding using only atob, which cannot handle multi-byte characters leading to garbled diacritic marks.

## [0.14.5] - 2026-01-21

### Fixed

- Diacritic marks are garbled when loaded from the git repository

### Added

### Changed

### Deprecated

- utils.encodeBase64JsonStrToObj  
  Base64 decoding using only atob, which cannot handle multi-byte characters leading to garbled diacritic marks.

### Removed

## [0.14.4] - 2025-06-25

### Added

### Fixed

- Association changes are only saved for the "second" end. Now they are saved for both ends.

### Changed

### Deprecated

### Removed

## [0.14.3] - 2025-03-28

### Added

### Fixed

### Changed

### Deprecated

### Removed

- `release-info.json` will be managed through the GitLab UI

## [0.14.2] - 2025-03-28

### Added

### Fixed

- `releaseInfo.standaard` and `releaseInfo.releaseNaam` are missing from published `release-info.json`

### Changed

### Deprecated

### Removed

## [0.14.1] - 2025-03-26

### Added

### Fixed

- Packages below "Release info" package aren't persisted to GitLab

### Changed

### Deprecated

### Removed

## [0.14.0] - 2025-03-26

### Added

- Release info package en tags laden en opslaan.

### Fixed

### Changed

### Deprecated

### Removed

## [0.13.3] - 2025-03-25

### Added

### Fixed

- Bericht titel en bijbehorend retourbericht worden niet gepersisteerd in GitLab

### Changed

- Pretty print .json files zodat ze te vergelijken zijn in GitLab UI

### Deprecated

### Removed

- Diverse debug logging naar console.

## [0.13.2] - 2025-03-21

### Added

- Deze [Changelog](./CHANGELOG.md) 

### Fixed

### Changed

### Deprecated

### Removed

