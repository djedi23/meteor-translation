

Meteor.startup(function () {
    Meteor.publish(Translation.publish,
		   function (domains, lang) {
		       var self = this;
		       if (domains == undefined || lang == undefined)
			   return [];

		       return Translation.collection.canPublish(self.userId, domains, lang) && 
			   Translation.collection.find({domain: {$in: domains},
							lang: {$in: [lang]}}) || [];
		   });
});
