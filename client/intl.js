Meteor.startup(function() {
    // Just set the current language.
    Session.set(Translation.session, navigator.language || navigator.userLanguage);
});


// Register the UI helper to _.
UI.registerHelper(Translation.uiHelper, Translation._);
