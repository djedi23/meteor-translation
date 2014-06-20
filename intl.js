Translation = function(){
    var set_default = function(setting, default_value){
	return  (Meteor.settings.public && Meteor.settings.public.translation && setting) ? setting : default_value;
    }

    this.publish = set_default(Meteor.settings.public.translation.publish,'intl');
    this.uiHelper = set_default(Meteor.settings.public.translation.uiHelper,'_');
    this.session = set_default(Meteor.settings.public.translation.session,'lang');
    this.mongoCollection = set_default(Meteor.settings.public.translation.mongoCollection,'intl');

    Translations = new Meteor.Collection(this.mongoCollection);

    this.lang_EN = ['en', 'en_EN'];
    this.lang_FR = ['fr', 'fr_FR'];
    this.lang_DE = ['de', 'de_DE'];

    this.lang_fallback=this.lang_EN;

    this.current_lang = function() {
	if (typeof Session != 'undefined') {
	    var lang = Session.get(this.session);
	    if (lang)
		return lang;
	}
	return this.lang_fallback;
    };

    this.add_translation = function(domain, key, lang, value) {
	if (Meteor.isServer)
	    if (!Translations.findOne({key:key, domain:domain, lang:lang}))
		Translations.insert({key:key, domain:domain, lang:lang, value:value});    
    };
};

Translation = new Translation();
