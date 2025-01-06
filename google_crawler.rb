#==========
# FILE: google_crawler.rb
#==========
# A standalone crawler using playwright-ruby-client to fetch data from Google
#==========

require 'playwright'
require_relative 'link'

class GoogleCrawler
  QUERIES = [
    "best shows to stream",
    "best movies to stream"
  ]

  def initialize
    Link.init_db
  end

  def crawl
    Playwright.create(playwright_cli_executable_path: 'npx playwright') do |playwright|
      browser = playwright.chromium.launch(headless: true)
      page = browser.new_page

      QUERIES.each do |query|
        fetch_search_results(page, query)
      end

      browser.close
    end
  end

  private

  def fetch_search_results(page, query)
    page.goto('https://www.google.com/')
    page.wait_for_load_state('domcontentloaded')

    # Accept cookies if present (region-specific)
    if page.locator('button:has-text("I agree")').count > 0
      page.click('button:has-text("I agree")')
      page.wait_for_timeout(700)
    end

    # Fill search box and submit
    page.fill('input[name="q"]', query)
    page.press('input[name="q"]', 'Enter')
    page.wait_for_load_state('domcontentloaded')

    # Scroll to load more results
    4.times do
      page.keyboard.press('PageDown')
      page.wait_for_timeout(800)
    end

    # Grab results
    results = page.locator('div.g').evaluate_all do |nodes|
      nodes.map do |node|
        title_el   = node.querySelector('h3')
        link_el    = node.querySelector('a')
        snippet_el = node.querySelector('.VwiC3b') # typical snippet class

        {
          title:   title_el&.textContent,
          url:     link_el&.getAttribute('href'),
          snippet: snippet_el&.textContent
        }
      end
    end

    # Filter out invalid items
    results.compact!
    results.reject! { |r| r[:title].nil? || r[:title].strip.empty? || r[:url].nil? }

    results.each do |r|
      new_link = {
        "link_text"   => r[:title],
        "url"         => r[:url],
        "rating"      => 3,
        "snippet"     => r[:snippet] || "",
        "category"    => "streaming",
        "tags"        => ["google", "crawler", query],
        "date_added"  => Time.now.strftime("%Y-%m-%d"),
        "favorite"    => false,
        "media_type"  => "",  # unknown yet
        "platform"    => "",
        "notes"       => "Found via Google search: #{query}",
        "date_created"=> "",
        "thumbnail"   => nil,
        "full_image"  => nil
      }
      Link.upsert(new_link)
    end

    puts "Crawled '#{query}', upserted #{results.size} links."
  end
end

# Run if executed directly
if $PROGRAM_NAME == __FILE__
  crawler = GoogleCrawler.new
  crawler.crawl
  puts "Done crawling queries: #{GoogleCrawler::QUERIES.join(', ')}"
end
