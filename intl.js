/*
* Translation is the main object used to interact with this package.
*/
Translation = function(){
    var self = this;

    /*
     * set the default value of a setting only if the setting isn't set.
     */
    var set_default = function(setting, default_value){
	return  (typeof Meteor.settings != 'undefined' && typeof Meteor.settings.public != 'undefined' && typeof Meteor.settings.public.translation != 'undefined' && Meteor.settings.public.translation[setting] != undefined) ? Meteor.settings.public.translation[setting] : default_value;
    };

    /*
     * Settings:
     */
    
    // Name of the publish
    self.publish = set_default('publish','intl');
    // Name of the UI Helper
    self.uiHelper = set_default('uiHelper','_');
    // Name of the session holding the current language
    self.session = set_default('session','lang');
    // Name of the mongo Collection
    self.mongoCollection = set_default('mongoCollection','intl');
    // If true, raise a warning in the console if a translation is not found.
    self.debug = set_default('debug',true);
    // Display the translation key as a fallback
    self.keyFallBack = set_default('keyFallBack',false);

    self.collection = new Meteor.Collection(self.mongoCollection);

    // Some predefinied languages
    self.lang_EN = ['en', 'en-US'];
    self.lang_FR = ['fr', 'fr-FR'];
    self.lang_DE = ['de', 'de-DE'];

    // The fallback language. Feel free to set it to your fallback language.
    self.lang_fallback=self.lang_EN[0];

    /*
     * Add the publish to the allow rule in the collection
     * See canPublish
     */
    self.collection.allow =
	_.wrap(self.collection.allow, 
	       function(allow, options){
		   var self = this;
		   if (_.has(options, "publish")){
		       self._validators.publish = {allow: [options.publish]};
		       delete options.publish;
		   }
		   return allow.call(self,options);
	       });


    /*
     * Try the publish rule in the allow.
     */
    self.collection.canPublish = function(userId, domains, lang, key){
    	if (Translation.collection._validators.publish)
	    return ! (_.all(Translation.collection._validators.publish.allow, function(validator) {
		return ! validator(userId, domains, lang, key);
	    }));
	else
	    return true;
    };
};

_.extend(Translation.prototype, {
    /*
     * accessor to the current language
     */
    currentLang: function(/* arguments */) {
	var self = this;
	if (arguments.length == 1) {
	    Session.set(self.session, arguments[0]);
	    return arguments[0];
	}
	else 
	{
	    if (typeof Session != 'undefined') {
		var lang = Session.get(self.session);
		if (lang)
		    return lang;
	    }
	    return self.lang_fallback;
	}
    },
    /*
     * Translate the key/domain according to the current language.
     * This function don't parse the parameters.
     */
    __: function(key, domain) {
	var self = this;
	var lang = self.currentLang();
	var query = {key:key, lang: lang};
	if (_.isString(domain))
	    query.domain = domain;

	var message = Translation.collection.findOne(query);
	if (message)
            return message.value;

	query = {key:key, lang: Translation.lang_fallback};
	if (_.isString(domain))
	    query.domain = domain;
	message = Translation.collection.findOne(query);
	if (message)
            return message.value;

	if (Translation.keyFallBack)
	    return key;
	else if (Translation.debug){
	    console.warn("no translation for key [", key, "], domain [", _.isString(domain)?domain:'',"], lang [", lang, "].");
	    return '__'+key+'__';
	}
	else
	    return '';
    },
    /*
     * Translate the key/domain according to the current language.
     * This function parse and apply the parameters.
     */
    _: function(key, domain, variables) {
        var trans = Translation.__(key,domain);
	var params=[];
        if (variables != undefined)
	    if (!_.isEmpty(variables.hash)){
		params = variables.hash;
	    } else if (_.isObject(variables)){
		params = variables;
	    }

        _.each(_.pairs(params),
               function(e){
                   var re = RegExp('{'+e[0]+'}');
                   trans = trans.replace(re,e[1]);
               });

        return trans;
    }
});

if (Meteor.isServer){
    _.extend(Translation.prototype, {
	/*
	 * Set an initial translation
	 */
	addTranslation: function(domain, key, lang, value) {
	    if (!Translation.collection.findOne({key:key, domain:domain, lang:lang}))
		Translation.collection.insert({key:key, domain:domain, lang:lang, value:value});
	},
	/*
	 * Set initial translations from an json string.
	 * The format is
	 [
	    {
		"domains": ["domain1", "domain2"],
		"entries": [
		    { "langs" : ["en", "en_US"],
		      "translations": [
			  {"key": "key1",
			   "translation": "translation 1"},
			  {"key": "key2",
			   "translation": "translation 2"}
		      ]
		    }
		]
	    }
	 ]
	 */
	addTranslationFromJSON: function(str) {
	    var obj = JSON.parse(str);
	    _.each(obj,function(domain){
		var domains = domain.domains;
		_.each(domain.entries, function(entry){
		    var langs = entry.langs;
		    _.each(entry.translations, function(t){
			Translation.addTranslation(domains, t.key, langs, t.translation);
		    });
		});
	    });
	}
    });
}

Translation = new Translation();
