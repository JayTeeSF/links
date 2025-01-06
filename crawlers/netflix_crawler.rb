require_relative './base_crawler'

class NetflixCrawler < BaseCrawler
  def initialize
    super('https://www.netflix.com/browse/genre/34399', '.slider-item span', 'Netflix')
  end
end
