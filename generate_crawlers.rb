#!/usr/bin/env ruby

require 'fileutils'

# Base directory for the crawlers
BASE_DIR = './crawlers'

# Platforms and their respective URLs and selectors
PLATFORMS = {
  'Hulu' => { url: 'https://www.hulu.com/movies', selector: '.Tile__title' },
  'ParamountPlus' => { url: 'https://www.paramountplus.com/movies/', selector: '.title-container' },
  'Max' => { url: 'https://www.hbomax.com/movies', selector: '.browse-tile__title' },
  'Netflix' => { url: 'https://www.netflix.com/browse/genre/34399', selector: '.slider-item span' },
  'AmazonPrime' => { url: 'https://www.amazon.com/Prime-Video/b?node=2858778011', selector: '.a-size-medium' },
  'AppleTV' => { url: 'https://tv.apple.com/', selector: '.we-lockup__title' }
}.freeze

# Generate base crawler
def generate_base_crawler
  base_crawler_content = <<~RUBY
    require 'playwright'
    require_relative './link'

    class BaseCrawler
      def initialize(base_url, item_selector, platform)
        @base_url = base_url
        @item_selector = item_selector
        @platform = platform
      end

      def fetch_and_store_items
        Playwright.create(playwright_cli_executable_path: 'npx playwright') do |playwright|
          browser = playwright.chromium.launch(headless: true)
          page = browser.new_page

          begin
            page.goto(@base_url)
            sleep 5 # Wait for the page to load
            items = extract_items(page)
            store_results(items)
          ensure
            browser.close
          end
        end
      end

      private

      def extract_items(page)
        titles = page.locator(@item_selector).all_text_contents
        titles.map do |title|
          {
            title: title.strip,
            url: @base_url, # Adjust if URLs are specific to items
            snippet: nil # Adjust if snippets can be extracted
          }
        end
      end

      def store_results(results)
        results.each do |result|
          Link.upsert(
            {
              "link_text"   => result[:title],
              "url"         => result[:url],
              "rating"      => 3,
              "snippet"     => result[:snippet] || "",
              "category"    => "streaming",
              "tags"        => ["crawler", @platform],
              "date_added"  => Time.now.strftime("%Y-%m-%d"),
              "favorite"    => false,
              "media_type"  => "",
              "platform"    => @platform,
              "notes"       => "Crawled from #{@platform}",
              "date_created"=> "",
              "thumbnail"   => nil,
              "full_image"  => nil
            }
          )
        end

        puts "Crawled #{@platform}, total upserted so far: \#{results.size} links."
        puts "-" * 60
      end
    end
  RUBY

  File.write("#{BASE_DIR}/base_crawler.rb", base_crawler_content)
end

# Generate platform-specific crawlers
def generate_platform_crawlers
  PLATFORMS.each do |platform, config|
    crawler_content = <<~RUBY
      require_relative './base_crawler'

      class #{platform}Crawler < BaseCrawler
        def initialize
          super('#{config[:url]}', '#{config[:selector]}', '#{platform}')
        end
      end
    RUBY

    File.write("#{BASE_DIR}/#{platform.downcase}_crawler.rb", crawler_content)
  end
end

# Generate main script
def generate_main_script
  main_script_content = <<~RUBY
    require_relative './base_crawler'
    #{PLATFORMS.keys.map { |platform| "require_relative './#{platform.downcase}_crawler'" }.join("\n")}

    crawlers = [
      #{PLATFORMS.keys.map { |platform| "#{platform}Crawler.new" }.join(",\n  ")}
    ]

    crawlers.each(&:fetch_and_store_items)
  RUBY

  File.write("#{BASE_DIR}/main.rb", main_script_content)
end

# Generate all files
def generate_all_files
  FileUtils.mkdir_p(BASE_DIR)
  generate_base_crawler
  generate_platform_crawlers
  generate_main_script
  puts "All crawler files have been generated in the '#{BASE_DIR}' directory."
end

generate_all_files
