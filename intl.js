Translation = function(){
    var set_default = function(setting, default_value){
	return  (typeof Meteor.settings != 'undefined' && typeof Meteor.settings.public != 'undefined' && typeof Meteor.settings.public.translation != 'undefined' && Meteor.settings.public.translation[setting]) ? Meteor.settings.public.translation[setting] : default_value;
    }

    this.publish = set_default('publish','intl');
    this.uiHelper = set_default('uiHelper','_');
    this.session = set_default('session','lang');
    this.mongoCollection = set_default('mongoCollection','intl');

    Translations = new Meteor.Collection(this.mongoCollection);
    this.collection = Translations;

    this.lang_EN = ['en', 'en_US'];
    this.lang_FR = ['fr', 'fr_FR'];
    this.lang_DE = ['de', 'de_DE'];

    this.lang_fallback=this.lang_EN;
};

_.extend(Translation.prototype, {
    current_lang: function() {
	if (typeof Session != 'undefined') {
	    var lang = Session.get(this.session);
	    if (lang)
		return lang;
	}
	return this.lang_fallback;
    },

    add_translation: function(domain, key, lang, value) {
	if (Meteor.isServer)
	    if (!Translations.findOne({key:key, domain:domain, lang:lang}))
		Translations.insert({key:key, domain:domain, lang:lang, value:value});
    },

    _: function(key, domain) {
	var lang = Session.get(Translation.session);
	var query = {key:key, lang: {$all: [lang]}};
	if (_.isString(domain))
	    query.domain = domain;

	var message = Translations.findOne(query);
	if (message)
            return message.value;

	query = {key:key, lang: {$all: Translation.lang_fallback}};
	if (_.isString(domain))
	    query.domain = domain;
	message = Translations.findOne(query);
	if (message)
            return message.value;

	warn("no translation", key, _.isString(domain)?domain:'', lang);
	return '__'+key+'__';
    }

});

Translation = new Translation();
