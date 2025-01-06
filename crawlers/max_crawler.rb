require_relative './base_crawler'

class MaxCrawler < BaseCrawler
  def initialize
    super('https://www.hbomax.com/movies', '.browse-tile__title', 'Max')
  end
end
