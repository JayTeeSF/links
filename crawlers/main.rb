#!/usr/bin/env ruby

require_relative './base_crawler'
require_relative './hulu_crawler'
require_relative './paramountplus_crawler'
require_relative './max_crawler'
require_relative './netflix_crawler'
require_relative './amazonprime_crawler'
require_relative './appletv_crawler'

crawlers = [
  HuluCrawler.new,
  ParamountPlusCrawler.new,
  MaxCrawler.new,
  NetflixCrawler.new,
  AmazonPrimeCrawler.new,
  AppleTVCrawler.new
]

crawlers.each do |crawler|
  begin
    puts "Running #{crawler.class.name}..."
    crawler.fetch_and_store_items
  rescue StandardError => e
    puts "Error running #{crawler.class.name}: #{e.message}"
    puts e.backtrace.first(5) # Print the first 5 lines of the backtrace for debugging
    puts "-" * 60
  end
end
