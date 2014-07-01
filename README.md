Translations in the reactive way for Meteor.

This package stores translations in a standard Meteor collection. So translations can be reactively binded in your templates.

Translation entries are indentified by _domains_, _keys_ and _languages_

- _domain_ represents a group of translation. Domain can be, for example, _main_, _navbar_, _pageIds_, ... An entry can have many domains (same entry in the topbar and the sidebar).
- _key_ the id the entry in the domain.
- _languages_ is an array of languages the entry should match. An entry could match many languages (an entry can match _en-US_ and _en-GB_)


# Instalation

```
$ mrt add translation
```

Then subscribe to the translation collection
```JavaScript
Meteor.subscribe(Translation.publish, domains, Translation.currentLang());
```
where `domains` is an array of domains.


# Usage

## Basic usage

In your templates, just use `{{_ "key" "domain"}}` where domain is the group of translation where to search the key.

In your code, use `Translation._(key, domain)`.
You may prefer to use it in a reactive environment:
```JavaScript
Deps.autorun(function(){
	myVar = Translation._('siteName', 'main');
});
```

## Parametrized translations

In your template, add parameter to your translation like this
`{{_ "key" "domain" arg1="Arg 1" }}`.
You can add more parameters `{{_ "key" "domain" arg1="Arg 1" arg2="..." }}`
Parameter values can be strings or template variables `{{_ "key" "domain" arg1=reactiveVar }}`.
Then the variable binds like regular one:
```JavaScript
Template.myTemplate.reactiveVar = function () {
    return "Value" ;
};
```


In the translation entry, the arguments are surounded by braces: `{arg}`.
Then the translation should look like: _My translation {arg1}_


In your code, you have to pass the parameter as an object to the function `Translation._`:
```JavaScript
Translation._(key, domain, {arg1: ..., arg2:...});
```


# Translation language

By defaut, the current language is set to the navigator language.

Reading the current language:
```JavaScript
Translation.currentLang()
```

Changing the current language:
```JavaScript
Translation.currentLang(lang);
```


# Initial Translations

You can initialize entries in your Collection
```JavaScript
Translation.addTranslation(domains, key, lang, translation)
```
The function `addTranslation` ensures that the entry is inserted only once.


Example:
```JavaScript
Meteor.isServer && Meteor.startup(function () {
	Translation.addTranslation(['main', 'navigation'], 'siteName', ['en', 'en-US'], 'My awesome site');
});
```

You can inject initial translation from a JSON file:
```JavaScript
	Translation.addTranslationFromJSON(Assets.getText('translations.json'));
```

The JSON file have the following structure:
```JSON
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

```

# Modify the translation

Translation doesn't offer API to modify your translation entries. But you have a direct acces to the collection with the variable `Translation.collection`.

You can modify your entries with the pattern
```JavaScript
Translation.collection.update({domain: domain, key: key, lang:lang}, {$set: {value: value}});
```

The package _translation-admin_ is an out of the box UI to manage your translations.

## Translation Security

Translation doesn't provide any insertion, update, remove control on the translation collection. Understand that everybody can inject translation data in your collection and you have to protect it.

For example, to allow only logged user to modify transaltion entries, simply add in your server code:
```JavaScript
Translation.collection.allow({
    insert: function(userId, doc) {
        return userId!=null;
    },
    update: function(userId, doc, fieldNames, modifier) {
        return userId!=null;
    },
    remove: function(userId, doc) {
        return userId!=null;
    },
    publish: function(userId, domains, lang, key) {
	    return userId!=null;
    }
});
```
If you define your own publish methods, you can use the following function to check if the publication is allowed:
`Translation.collection.canPublish(this.userId, domains, lang, key)`

Then in your publish method, apply this pattern:
```JavaScript
	return Translation.collection.canPublish(this.userId, domains, lang, key) && 
		Translation.collection.find({ ... }) || [];
```


# Configuration

You can configure Translation on startup using `Meteor.settings`.

The available configuration are:

- `Meteor.settings.public.translation.publish`: the name of the translation record set.
- `Meteor.settings.public.translation.uiHelper`: the name of the helper used in template. If you prefer `{{i18n ...}}`, set the configuration to _i18n_.
- `Meteor.settings.public.translation.session`: the name of the session that keep track of the current language.
- `Meteor.settings.public.translation.mongoCollection`: the name of the colletion used by translation.
- `Meteor.settings.public.translation.debug`: if true, displays a warning when translation entries aren't found and displays the key.
- `Meteor.settings.public.translation.keyFallBack`: if true, displays the key when an entry is not found.


The default configuration is:
```JSON
{
    "public": {
        "translation" : {
            "publish" : "intl",
            "uiHelper": "_",
            "session": "lang",
            "mongoCollection": "intl",
            "debug": true
        }
    }
}
```
