#!/usr/bin/env ruby

#==========================================================
# FILE: google_crawler.rb
#==========================================================
# A standalone crawler using playwright-ruby-client to
# grab data from Google. Using a multi-page approach
# and improved reliability.
#
# USAGE:
#   ruby google_crawler.rb
#   # or pass in custom queries by modifying QUERIES
#
# REQUIREMENTS:
#   gem 'playwright-ruby-client'
#   require_relative 'link' (for Link model / DB)
#
# This script attempts to handle:
# 1) google's cookie banner
# 2) multi-page fetching
# 3) debug steps if timeouts/failures occur
#==========================================================

require 'playwright'
require 'fileutils'
require_relative 'link'

class GoogleCrawler
  # You can replace these with arguments or dynamic usage
  QUERIES = [
    "best shows to stream",
    "best movies to stream"
  ].freeze

  # For multi-page approach
  MAX_PAGES       = 3
  RESULTS_PER_PAGE= 10

  def initialize
    Link.init_db
  end

  def crawl
    # playwright_cli_executable_path is set to 'npx playwright' to find the CLI
    Playwright.create(playwright_cli_executable_path: 'npx playwright') do |playwright|
      browser = playwright.chromium.launch(headless: true)
      context = browser.new_context

      # Use a slightly higher default timeout if needed
      context.set_default_timeout(30_000)

      page = context.new_page

      QUERIES.each do |query|
        fetch_search_results(page, query)
      end

      browser.close
    end
  end

  private

  #----------------------------------------------
  # Main logic to fetch multi-page results
  #----------------------------------------------
  def fetch_search_results(page, query)
    puts "=== Searching for: \"#{query}\" ==="

    # 1) Go to Google (with ncr to avoid region-based redirects)
    page.goto('https://www.google.com/ncr')
    page.wait_for_timeout(2000)
    puts "Navigated to: #{page.url}"

    # 2) Handle the cookie banner if present
    handle_cookie_banner(page)

    # 3) Wait for the search box
    #    If it times out, attempt debug steps
    begin
      page.wait_for_selector('input[name="q"]', state: :visible, timeout: 15_000)
    rescue Playwright::TimeoutError => e
      debug_failure(page, "Failed to find input[name='q']")
      raise e
    end

    # 4) Fill query, press Enter
    page.fill('input[name="q"]', query)
    page.press('input[name="q"]', 'Enter')

    # We'll store the results across multiple pages
    all_results = []

    (0...MAX_PAGES).each do |pagenum|
      start_value = pagenum * RESULTS_PER_PAGE
      if pagenum.positive?
        # Navigate to the next page of results
        next_url = "https://www.google.com/search?q=#{URI.encode_www_form_component(query)}&start=#{start_value}"
        puts "Navigating to page #{pagenum + 1} => #{next_url}"
        page.goto(next_url)
      end

      # 5) Wait for some result container
      begin
        page.wait_for_selector('div.g', state: :visible, timeout: 20_000)
      rescue Playwright::TimeoutError => e
        debug_failure(page, "No search results (div.g) on page #{pagenum + 1}.")
        raise e
      end

      # 6) Optionally scroll
      4.times do
        page.keyboard.press('PageDown')
        page.wait_for_timeout(500)
      end

      # 7) Evaluate and gather results
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

      # Insert into DB (the Link model, upsert)
      results.each do |r|
        Link.upsert(
          "link_text"   => r[:title],
          "url"         => r[:url],
          "rating"      => 3,
          "snippet"     => r[:snippet] || "",
          "category"    => "streaming",
          "tags"        => ["google", "crawler", query],
          "date_added"  => Time.now.strftime("%Y-%m-%d"),
          "favorite"    => false,
          "media_type"  => "",
          "platform"    => "",
          "notes"       => "Found via Google search: #{query}",
          "date_created"=> "",
          "thumbnail"   => nil,
          "full_image"  => nil
        )
      end

      all_results.concat(results)
      puts "Page #{pagenum + 1}: appended #{results.size} items"
    end

    # Summarize
    puts "Crawled '#{query}', total upserted so far: #{all_results.size} links."
  end

  #----------------------------------------------
  # Attempt to handle the Google cookie banner
  #----------------------------------------------
  def handle_cookie_banner(page)
    selectors = [
      'button:has-text("I agree")',
      'button:has-text("Accept all")',
      'text="I agree"',
      'text="Accept all"'
    ]
    selectors.each do |sel|
      if page.locator(sel).count > 0
        page.click(sel)
        page.wait_for_timeout(700)
        break
      end
    end
  end

  #----------------------------------------------
  # Debug method for failures/timeouts
  #----------------------------------------------
  def debug_failure(page, msg)
    puts "DEBUG: #{msg}"
    FileUtils.mkdir_p('debug')

    ts = Time.now.strftime("%Y%m%d_%H%M%S")
    screenshot_path = "debug/failure_#{ts}.png"
    page.screenshot(path: screenshot_path)
    puts "Saved screenshot => #{screenshot_path}"

    html_path = "debug/failure_#{ts}.html"
    File.write(html_path, page.content)
    puts "Saved HTML => #{html_path}"

    puts "Current URL => #{page.url}"
  end
end

#----------------------------------------------
# RUN if executed directly
#----------------------------------------------
if $PROGRAM_NAME == __FILE__
  crawler = GoogleCrawler.new
  crawler.crawl
  puts "Done crawling queries: #{GoogleCrawler::QUERIES.join(', ')}"
end
