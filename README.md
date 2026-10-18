# JayTeeSF Links

The live links page is built as a static GitHub Pages site. The source UI is Link Atlas, and `links.json` remains the published collection.

## Build the page

From this directory, run:

```sh
ruby app.rb
```

This reads `links.json` and the files in `src/`, then writes the complete, self-contained page to the root `index.html`. To choose another input or output file:

```sh
ruby app.rb links.json /tmp/links-preview.html
```

The builder uses only Ruby's standard library. It does not run Python, Playwright, or ImageMagick. Commit both the source files and the generated `index.html` when publishing changes to the `gh-pages` branch.

To verify the builder and its embedded link data, run:

```sh
ruby test/atlas_build_test.rb
```

## Link data and browser storage

The existing `links.json` fields are mapped into Link Atlas: `link_text`, `snippet`, `date_added`, `favorite`, `rating`, `category`, and `tags` all remain available. `media_type`, `platform`, `date_created`, and `notes` are retained in browser data and JSON backups.

On a browser's first visit, the published collection seeds its local Link Atlas library. The page opens to Favorites, as the old page did, and defaults to newest first. Search, category/topic filtering, favorites, and rating sorts are available. Later edits, visit history, and favorites are stored in that browser's local storage; they are not written back to `links.json` or shared between browsers. Import a backup or erase the local collection to start from the current published data again.

## Link model usage

1. Initialize the database and import from `links.json`:

```ruby
require_relative 'link'
Link.import_from_json('links.json')
```

2. Export all database rows to JSON:

```ruby
require_relative 'link'
Link.export_to_json('exported_links.json')
```

3. Export only the “game” category:

```ruby
require_relative 'link'
Link.export_to_json('just_games.json', where: "category='game'")
```
