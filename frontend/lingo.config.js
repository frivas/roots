module.exports = {
  // Source language
  sourceLocale: 'en-US',

  // Target languages for translation
  targetLocales: ['es-ES'],

  // Use directive to control what gets translated
  useDirective: true,

  // Caching configuration
  caching: {
    enabled: true,
    directory: '.lingo-cache',
  },

  // Development settings
  dev: {
    hotReload: true,
  },
}; 