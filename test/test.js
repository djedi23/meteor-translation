
var domain = "_tinytest";

var setup = function(){
    Translation.addTranslation([domain], "key1", Translation.lang_EN, "key 1 en");
    Translation.addTranslation([domain], "key1", Translation.lang_FR, "key 1 fr");
    Translation.addTranslation([domain], "key2", Translation.lang_EN, "key {a} en");
};

var tearDown = function(){
    Translation.collection.find({domain: domain}).forEach(function(e){
	Translation.collection.remove(e._id);
    });
};


Tinytest.add('Translation - current lang', function (test) {
    if (typeof Session != 'undefined') Session.set(Translation.session, Translation.lang_fallback);
    var lang = Translation.currentLang();
    test.equal(lang,Translation.lang_fallback,'current lang: fallback');


    if (typeof Session != 'undefined'){
	Translation.currentLang('fr');
	lang = Translation.currentLang();
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


Tinytest.add('Translation - lookup parameters', function (test) {
    setup();

    if (typeof Session != 'undefined') Session.set(Translation.session, Translation.lang_fallback);

    var translation = Translation._('key2', domain);
    test.equal(translation, 'key {a} en', "no param");


    translation = Translation._('key2', domain, {a:"have param"});
    test.equal(translation, 'key have param en', "param");

    tearDown();
});
