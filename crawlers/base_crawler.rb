require 'playwright'
require_relative '../link'

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
          "notes"       => "Crawled from ",
          "date_created"=> "",
          "thumbnail"   => nil,
          "full_image"  => nil
        }
      )
    end

    puts "Crawled , total upserted so far: #{results.size} links."
    puts "-" * 60
  end
end
