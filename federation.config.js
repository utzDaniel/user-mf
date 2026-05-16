const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'user-mf',

  exposes: {
    './Component': './src/app/entry.component.ts',
    './Routes': './src/app/app.routes.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    '@oxc-parser/binding-win32-x64-msvc',
    'chart.js',
    'chart.js/auto',
    '@primeng/themes',
    '@primeng/themes/aura',
    '@primeng/themes/types',
    'primeicons',
  ],

  features: {
    ignoreUnusedDeps: true,
  },
});
