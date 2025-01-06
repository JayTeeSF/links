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

crawlers.each(&:fetch_and_store_items)
