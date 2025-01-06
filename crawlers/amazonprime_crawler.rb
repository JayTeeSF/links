require_relative './base_crawler'

class AmazonPrimeCrawler < BaseCrawler
  def initialize
    super('https://www.amazon.com/Prime-Video/b?node=2858778011', '.a-size-medium', 'AmazonPrime')
  end
end
