Translation = function(){
    var self = this;
    var set_default = function(setting, default_value){
	return  (typeof Meteor.settings != 'undefined' && typeof Meteor.settings.public != 'undefined' && typeof Meteor.settings.public.translation != 'undefined' && Meteor.settings.public.translation[setting]) ? Meteor.settings.public.translation[setting] : default_value;
    };

    self.publish = set_default('publish','intl');
    self.uiHelper = set_default('uiHelper','_');
    self.session = set_default('session','lang');
    self.mongoCollection = set_default('mongoCollection','intl');
    self.debug = set_default('debug',true);

    self.collection = new Meteor.Collection(self.mongoCollection);

    self.lang_EN = ['en', 'en-US'];
    self.lang_FR = ['fr', 'fr-FR'];
    self.lang_DE = ['de', 'de-DE'];

    self.lang_fallback=self.lang_EN[0];


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
    currentLang: function(/* arguments */) {
	var self = this;
	if (arguments.length == 1) {
	    Session.set(self.session, arguments[0]);
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

	Translation.debug && console.warn("no translation for key [", key, "], domain [", _.isString(domain)?domain:'',"], lang [", lang, "].");
	return '__'+key+'__';
    },

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
	addTranslation: function(domain, key, lang, value) {
	    if (!Translation.collection.findOne({key:key, domain:domain, lang:lang}))
		Translation.collection.insert({key:key, domain:domain, lang:lang, value:value});
	},
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


