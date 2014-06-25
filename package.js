Package.describe({
  summary: 'Translation in the reactive way'
});


Package.on_use(function (api) {
  api.use('underscore', ['client', 'server']);
  api.use('ui', ['client']);


  api.add_files('intl.js', ['client', 'server']);
  api.add_files('client/intl.js', ['client']);
  api.add_files('server/intl.js', ['server']);

  api.export('Translation', ['client', 'server']);

});


Package.on_test(function (api) {
  api.use('translation', ['client', 'server']);
  api.use('tinytest', ['client', 'server']);
  api.use('test-helpers', ['client', 'server']);

  api.add_files('test/test.js', ['server']);
});
