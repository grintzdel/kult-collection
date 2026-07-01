const { MetadataStorage } = require("@mikro-orm/core")

// Évite les erreurs de métadonnées dupliquées entre suites lorsque les modèles
// sont importés plusieurs fois (tests unitaires colocalisés).
MetadataStorage.clear()
