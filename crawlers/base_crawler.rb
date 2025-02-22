require 'playwright'
require 'fileutils'
require_relative '../link'

class BaseCrawler
  DEBUG_DIR = File.expand_path('../debug', __dir__)

  def initialize(base_url, item_selector, platform)
    @base_url = base_url
    @item_selector = item_selector
    @platform = platform
    FileUtils.mkdir_p(DEBUG_DIR) # Ensure debug directory exists
  end

  def fetch_and_store_items
    Playwright.create(playwright_cli_executable_path: 'npx playwright') do |playwright|
      browser = playwright.chromium.launch(headless: true)
      page = browser.new_page

      begin
        puts "Navigating to #{@base_url} for #{@platform}..."
        page.goto(@base_url)
        page.wait_for_timeout(5000) # Allow time for content to load

        items = extract_items(page)

        if items.empty?
          puts "No items found for #{@platform}. Saving debug info..."
          save_debug_info(page)
        else
          puts "Found #{items.size} items for #{@platform}:"
          items.each { |item| puts " - #{item[:title]}" }
        end

        store_results(items)
      rescue StandardError => e
        puts "Error occurred: #{e.message}"
        save_debug_info(page)
      ensure
        browser.close
      end
    end
  end

  private

  def extract_items(page)
    elements = page.locator(@item_selector)
    count = elements.count
    puts "Found #{count} elements for selector '#{@item_selector}' on #{@platform}"

    elements.all_text_contents.map do |title|
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

    puts "Crawled #{@platform}, total upserted so far: #{results.size} links."
    puts "-" * 60
  end

  def save_debug_info(page)
    timestamp = Time.now.strftime('%Y%m%d_%H%M%S')
    screenshot_path = File.join(DEBUG_DIR, "#{@platform}_#{timestamp}.png")
    html_path = File.join(DEBUG_DIR, "#{@platform}_#{timestamp}.html")

    page.screenshot(path:  screenshot_path, fullPage: true)

    File.write(html_path, page.content)

    puts "Saved screenshot: #{screenshot_path}"
    puts "Saved HTML: #{html_path}"
  end
end
