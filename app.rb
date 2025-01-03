#!/usr/bin/env ruby

require 'erb'
require 'json'
require 'playwright'
require 'mini_magick'

class StaticPageGenerator
  def initialize
    @data = JSON.parse(File.read('links.json'))
  end

  def generate_thumbnails
    Playwright.create(playwright_cli_executable_path: 'npx playwright') do |playwright|
      browser = playwright.chromium.launch
      context = browser.new_context
      @data.each do |entry|
        full_path = "./images/#{File.basename(entry['url'])}.png"
        thumb_path = "./images/#{File.basename(entry['url'])}_thumb.png"

        page = context.new_page
        page.goto(entry['url'])
        page.screenshot(path: full_path)

        # Create thumbnail using ImageMagick
        MiniMagick::Image.open(full_path).resize("300x300").write(thumb_path)

        entry['thumbnail'] = thumb_path
        entry['full_image'] = full_path
      end
    end
  end

  def generate_html
    layout = File.read('./view/layout.erb')
    index = File.read('./view/index.erb')
    erb = ERB.new(layout)

    @data.sort_by! { |entry| Date.parse(entry['date_added']) }.reverse!

    File.write('./index.html', erb.result_with_hash(content: ERB.new(index).result(binding)))
  end
end

if $PROGRAM_NAME == __FILE__
  generator = StaticPageGenerator.new
  generator.generate_thumbnails
  generator.generate_html
  puts "Static site generated successfully."
end
