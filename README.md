## New Links Page Generation

```
./enhanced_links.sh # <-- if you update the data-structure with more links

./app.rb <input_file> <output_file>
```
e.g.
```
  ./app.rb links.json index.html
```

## Link Model Usage examples:
1.	Initialize the DB and import from your existing links.json:

```
irb
require_relative 'link'
Link.import_from_json('links.json')
```


2.	Export all DB rows back to a new JSON file:

```
irb
require_relative 'link'
Link.export_to_json('exported_links.json')
# => "Exported X links to exported_links.json."
```


3.	Export only “game” category rows:

```
irb
require_relative 'link'
Link.export_to_json('just_games.json', where: "category='game'")
```

