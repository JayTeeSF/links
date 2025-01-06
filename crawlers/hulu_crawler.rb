require_relative './base_crawler'

class HuluCrawler < BaseCrawler
  def initialize
    super('https://www.hulu.com/movies', '.Tile__title', 'Hulu')
  end
end
