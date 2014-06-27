Translation = function(){
    var set_default = function(setting, default_value){
	return  (typeof Meteor.settings != 'undefined' && typeof Meteor.settings.public != 'undefined' && typeof Meteor.settings.public.translation != 'undefined' && Meteor.settings.public.translation[setting]) ? Meteor.settings.public.translation[setting] : default_value;
    };

    this.publish = set_default('publish','intl');
    this.uiHelper = set_default('uiHelper','_');
    this.session = set_default('session','lang');
    this.mongoCollection = set_default('mongoCollection','intl');
    this.debug = set_default('debug',true);

    this.collection = new Meteor.Collection(this.mongoCollection);

    this.lang_EN = ['en', 'en-US'];
    this.lang_FR = ['fr', 'fr-FR'];
    this.lang_DE = ['de', 'de-DE'];

    this.lang_fallback=this.lang_EN[0];


    this.collection.allow =
	_.wrap(this.collection.allow, 
	       function(allow, options){
		   var self = this;
		   if (_.has(options, "publish")){
		       self._validators.publish = {allow: [options.publish]};
		       delete options.publish;
		   }
		   return allow.call(self,options);
	       });


    this.collection.canPublish = function(userId, domains, lang, key){
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
	if (arguments.length == 1) {
	    Session.set(this.session, arguments[0]);
	}
	else 
	{
	    if (typeof Session != 'undefined') {
		var lang = Session.get(this.session);
		if (lang)
		    return lang;
	    }
	    return this.lang_fallback;
	}
    },

    addTranslation: function(domain, key, lang, value) {
	if (Meteor.isServer)
	    if (!Translation.collection.findOne({key:key, domain:domain, lang:lang}))
		Translation.collection.insert({key:key, domain:domain, lang:lang, value:value});
    },

    __: function(key, domain) {
	var lang = this.currentLang();
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

Translation = new Translation();


