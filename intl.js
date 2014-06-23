Translation = function(){
    var set_default = function(setting, default_value){
	return  (typeof Meteor.settings != 'undefined' && typeof Meteor.settings.public != 'undefined' && typeof Meteor.settings.public.translation != 'undefined' && Meteor.settings.public.translation[setting]) ? Meteor.settings.public.translation[setting] : default_value;
    };

    this.publish = set_default('publish','intl');
    this.uiHelper = set_default('uiHelper','_');
    this.session = set_default('session','lang');
    this.mongoCollection = set_default('mongoCollection','intl');

    Translations = new Meteor.Collection(this.mongoCollection);
    this.collection = Translations;

    this.lang_EN = ['en', 'en-US'];
    this.lang_FR = ['fr', 'fr-FR'];
    this.lang_DE = ['de', 'de-DE'];

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

    __: function(key, domain) {
	var lang = this.current_lang();
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

	console.warn("no translation for key [", key, "], domain [", _.isString(domain)?domain:'',"], lang [", lang, "].");
	return '__'+key+'__';
    },

    _: function(key, domain, variables) {
        var trans = Translation.__(key,domain);
        if (variables != undefined && !_.isEmpty(variables.hash)){
            _.each(_.pairs(variables.hash),
                   function(e){
                       var re = RegExp('{'+e[0]+'}');
                       trans = trans.replace(re,e[1]);
                   });
        }

        return trans;
    }
});

Translation = new Translation();
