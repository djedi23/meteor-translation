Meteor.startup(function() {
    Session.set(Translation.session, navigator.language || navigator.userLanguage);
});


UI.registerHelper(Translation.uiHelper, function(key, domain) {
    var lang = Session.get(Translation.session);
    var query = {key:key, lang: {$all: [lang]}};
    if (_.isString(domain))
	query.domain = domain;

    var message = Translations.findOne(query);
    if (message)
        return message.value;

    query = {key:key, lang: {$all: [Translation.lang_fallback]}};
    if (_.isString(domain))
	query.domain = domain;
    message = Translations.findOne(query);
    if (message)
        return message.value;

    warn("no translation", key,domain, lang);
    return '__'+key+'__';
});
