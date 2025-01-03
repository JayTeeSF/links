#!/usr/bin/env ruby

require 'erb'
require 'json'
require 'sqlite3'
require 'playwright'

class StaticPageGenerator
  def initialize
    @data = JSON.parse(File.read('links.json'))
    @db = SQLite3::Database.new('db/clicks.sqlite3')
    setup_database
  end

  def setup_database
    @db.execute <<-SQL
      CREATE TABLE IF NOT EXISTS clicks (
        id INTEGER PRIMARY KEY,
        url TEXT,
        clicks INTEGER DEFAULT 0,
        rating INTEGER DEFAULT 0,
        favorite BOOLEAN DEFAULT 0
      );
    SQL
  end

  def generate_thumbnails
    Playwright.create(playwright_cli_executable_path: 'npx playwright') do |playwright|
      browser = playwright.chromium.launch
      context = browser.new_context
      @data.each do |entry|
        filename = "./images/#{File.basename(entry['url'])}.png"
        page = context.new_page
        page.goto(entry['url'])
        page.screenshot(path: filename)
        entry['thumbnail'] = filename
      end
    end
  end

  def generate_html
    template = File.read('./view/layout.erb')
    content_template = File.read('./view/index.erb')
    erb = ERB.new(template)

    @data.sort_by! { |entry| Date.parse(entry['date_added']) }.reverse!

    File.write('./public/index.html', erb.result_with_hash(content: ERB.new(content_template).result(binding)))
  end

  def track_click(url)
    @db.execute("INSERT INTO clicks (url, clicks) VALUES (?, 1) ON CONFLICT(url) DO UPDATE SET clicks = clicks + 1", [url])
  end

  def toggle_favorite(url)
    @db.execute("UPDATE clicks SET favorite = NOT favorite WHERE url = ?", [url])
  end
end

if $PROGRAM_NAME == __FILE__
  generator = StaticPageGenerator.new
  generator.generate_thumbnails
  generator.generate_html
  puts "Static site generated successfully."
end
