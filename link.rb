#==========
# FILE: link.rb
#==========
# Our plain Ruby Link class, backed by a SQLite3 table
# With new methods to import/export JSON,
# plus a revised upsert that avoids "Unmatched ["
#==========

require 'sqlite3'
require 'json'

class Link
  DB_FILE = 'db/links.sqlite3'

  def self.init_db
    db = SQLite3::Database.new(DB_FILE)
    db.execute <<-SQL
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link_text   TEXT,
        url         TEXT UNIQUE,
        rating      INTEGER,
        snippet     TEXT,
        category    TEXT,
        tags        TEXT,
        date_added  TEXT,
        favorite    INTEGER,
        media_type  TEXT,
        platform    TEXT,
        notes       TEXT,
        date_created TEXT,
        thumbnail   TEXT,
        full_image  TEXT
      );
    SQL
    db.close
  end

  #-------------------------------
  # IMPORT: from links.json -> DB
  #-------------------------------
  def self.import_from_json(json_file)
    init_db

    file_contents = File.read(json_file)
    data = JSON.parse(file_contents)

    data.each do |attributes|
      # Ensure boolean
      attributes["favorite"] = !!attributes["favorite"]

      # Ensure tags is an array
      unless attributes["tags"].is_a?(Array)
        attributes["tags"] = attributes["tags"].to_s.split(',').map(&:strip)
      end

      upsert(attributes)
    end
  end

  #-------------------------------
  # EXPORT: from DB -> links.json
  #-------------------------------
  def self.export_to_json(json_file, where: '1=1')
    init_db
    db = SQLite3::Database.new(DB_FILE)

    # Normal multi-line string for SELECT
    select_sql = <<~SQL
      SELECT
        id, link_text, url, rating, snippet, category, tags, date_added, favorite,
        media_type, platform, notes, date_created, thumbnail, full_image
      FROM links
      WHERE #{where}
    SQL

    rows = db.execute(select_sql)
    db.close

    links_array = rows.map do |r|
      {
        "link_text"   => r[1],
        "url"         => r[2],
        "rating"      => r[3],
        "snippet"     => r[4],
        "category"    => r[5],
        # Convert comma-separated to array
        "tags"        => r[6].to_s.split(',').map(&:strip),
        "date_added"  => r[7],
        "favorite"    => (r[8] == 1),
        "media_type"  => r[9],
        "platform"    => r[10],
        "notes"       => r[11],
        "date_created"=> r[12],
        "thumbnail"   => r[13],
        "full_image"  => r[14]
      }
    end

    File.open(json_file, 'w') do |f|
      f.write(JSON.pretty_generate(links_array))
    end

    puts "Exported #{links_array.size} links to #{json_file}."
  end

  #-------------------------------
  # UPSERT
  #-------------------------------
  def self.upsert(attributes)
    db = SQLite3::Database.new(DB_FILE)

    # 1) Check if there's an existing record with the same URL
    existing = db.execute("SELECT * FROM links WHERE url = ?", [attributes["url"]]).first

    if existing
      # Prepare updated_attrs from old + new
      existing_id = existing[0]
      existing_attrs = db_row_to_hash(existing)
      updated_attrs = merge_attributes(existing_attrs, attributes)

      # Make sure 'tags' is an array
      updated_attrs["tags"] = ensure_array(updated_attrs["tags"])
      tags_joined           = updated_attrs["tags"].join(', ')

      fav = updated_attrs["favorite"] ? 1 : 0

      sql_update = build_update_sql
      db.execute(
        sql_update,
        [
          updated_attrs["link_text"],
          updated_attrs["url"],
          updated_attrs["rating"],
          updated_attrs["snippet"],
          updated_attrs["category"],
          tags_joined,
          updated_attrs["date_added"],
          fav,
          updated_attrs["media_type"],
          updated_attrs["platform"],
          updated_attrs["notes"],
          updated_attrs["date_created"],
          updated_attrs["thumbnail"],
          updated_attrs["full_image"],
          existing_id
        ]
      )
    else
      # brand-new
      fav = attributes["favorite"] ? 1 : 0
      # Make sure 'tags' is an array
      tags_array = ensure_array(attributes["tags"])
      tags_joined = tags_array.join(', ')

      sql_insert = build_insert_sql
      db.execute(
        sql_insert,
        [
          attributes["link_text"],
          attributes["url"],
          attributes["rating"],
          attributes["snippet"],
          attributes["category"],
          tags_joined,
          attributes["date_added"],
          fav,
          attributes["media_type"],
          attributes["platform"],
          attributes["notes"],
          attributes["date_created"],
          attributes["thumbnail"],
          attributes["full_image"]
        ]
      )
    end

    db.close
  end

  #-------------------------------
  # HELPER: Convert DB row array -> hash
  #-------------------------------
  def self.db_row_to_hash(row)
    # row is an array in the order: [id, link_text, url, rating, snippet, category, ...]
    {
      "id"           => row[0],
      "link_text"    => row[1],
      "url"          => row[2],
      "rating"       => row[3],
      "snippet"      => row[4],
      "category"     => row[5],
      "tags"         => row[6],
      "date_added"   => row[7],
      "favorite"     => row[8],
      "media_type"   => row[9],
      "platform"     => row[10],
      "notes"        => row[11],
      "date_created" => row[12],
      "thumbnail"    => row[13],
      "full_image"   => row[14]
    }
  end

  #-------------------------------
  # HELPER: Merge old/new fields
  # Overwrite fields only if old is nil/blank
  #-------------------------------
  def self.merge_attributes(old_attrs, new_attrs)
    merged = old_attrs.dup
    new_attrs.each do |k,v|
      if (old_attrs[k].nil? || old_attrs[k].to_s.strip.empty?) && !v.to_s.strip.empty?
        merged[k] = v
      end
    end
    merged
  end

  #-------------------------------
  # HELPER: ensure tags is an array
  #-------------------------------
  def self.ensure_array(val)
    return [] if val.nil?
    return val if val.is_a?(Array)
    # else split string by comma
    val.to_s.split(',').map(&:strip)
  end

  private

  #-------------------------------
  # PRIVATE: Build the UPDATE SQL
  #-------------------------------
  def self.build_update_sql
    <<~SQL
      UPDATE links
         SET link_text   = ?,
             url         = ?,
             rating      = ?,
             snippet     = ?,
             category    = ?,
             tags        = ?,
             date_added  = ?,
             favorite    = ?,
             media_type  = ?,
             platform    = ?,
             notes       = ?,
             date_created= ?,
             thumbnail   = ?,
             full_image  = ?
       WHERE id = ?
    SQL
  end

  #-------------------------------
  # PRIVATE: Build the INSERT SQL
  #-------------------------------
  def self.build_insert_sql
    <<~SQL
      INSERT INTO links (
        link_text, url, rating, snippet, category, tags,
        date_added, favorite, media_type, platform,
        notes, date_created, thumbnail, full_image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    SQL
  end
end
