Link Model Usage examples:
1.	Initialize the DB and import from your existing links.json:

```
require_relative 'link'
Link.import_from_json('links.json')
```


2.	Export all DB rows back to a new JSON file:

```
Link.export_to_json('exported_links.json')
# => "Exported X links to exported_links.json."
```


3.	Export only “game” category rows:

```
Link.export_to_json('just_games.json', where: "category='game'")
```

