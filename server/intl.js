

Meteor.startup(function () {
    Meteor.publish(Translation.publish,
		   function (domains, lang) {
		       if (domains == undefined || lang == undefined)
			   return [];

		       return Translation.collection.canPublish(this.userId, domains, lang) && 
			   Translation.collection.find({domain: {$in: domains},
							lang: {$in: [lang]}}) || [];
		   });
});
