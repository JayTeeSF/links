require_relative './base_crawler'

class AppleTVCrawler < BaseCrawler
  def initialize
    super('https://tv.apple.com/', '.we-lockup__title', 'AppleTV')
  end
end
