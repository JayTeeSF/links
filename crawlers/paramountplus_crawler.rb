require_relative './base_crawler'

class ParamountPlusCrawler < BaseCrawler
  def initialize
    super('https://www.paramountplus.com/movies/', '.title-container', 'ParamountPlus')
  end
end
