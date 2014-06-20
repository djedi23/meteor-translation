

Meteor.startup(function () {
    Meteor.publish(Translation.publish,
		   function (domains, lang) {
		       if (domains == undefined || lang == undefined)
			   return [];
		       return Translations.find({domain: {$in: domains},
						 lang: {$in: [lang]}});
		   });
});
