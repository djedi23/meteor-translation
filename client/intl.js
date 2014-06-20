Meteor.startup(function() {
    Session.set(Translation.session, navigator.language || navigator.userLanguage);
});


UI.registerHelper(Translation.uiHelper, Translation._);
