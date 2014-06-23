
var domain = "_tinytest";

var setup = function(){
    Translation.add_translation([domain], "key1", Translation.lang_EN, "key 1 en");
    Translation.add_translation([domain], "key1", Translation.lang_FR, "key 1 en");
};

var tearDown = function(){
    Translation.collection.find({domain: domain}).forEach(function(e){
	Translation.collection.remove(e._id);
    });
};


Tinytest.add('Translation - current lang', function (test) {
    if (typeof Session != 'undefined') Session.set(Translation.session, Translation.lang_fallback);
    var lang = Translation.current_lang();
    test.equal(lang,Translation.lang_fallback,'current lang: fallback');


    if (typeof Session != 'undefined'){
	Session.set(Translation.session, 'fr');
	lang = Translation.current_lang();
	test.equal(lang,'fr','current lang: change to fr');
    }
});


Tinytest.add('Translation - lookup simple', function (test) {
    setup();

    if (typeof Session != 'undefined') Session.set(Translation.session, Translation.lang_fallback);
    var translation = Translation.__('key1', domain);
    test.equal(translation, 'key 1 en', "basic lookup");

    tearDown();
});
