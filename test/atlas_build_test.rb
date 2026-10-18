require 'json'
require 'minitest/autorun'
require 'open3'
require 'rbconfig'
require 'tmpdir'

class AtlasBuildTest < Minitest::Test
  ROOT = File.expand_path('..', __dir__)
  APP = File.join(ROOT, 'app.rb')

  def test_ruby_build_embeds_the_links_and_inlines_the_atlas
    Dir.mktmpdir do |dir|
      input = File.join(dir, 'links.json')
      output = File.join(dir, 'index.html')
      source = [{
        'link_text' => 'Safe </script><script>title',
        'url' => 'https://example.com/story',
        'snippet' => 'Existing page description',
        'category' => 'Reading',
        'tags' => ['favorite topic'],
        'date_added' => '2025-01-02',
        'favorite' => true,
        'rating' => 4,
        'thumbnail' => 'already-present.png',
        'full_image' => 'already-present.png',
        'media_type' => 'article',
        'platform' => 'Example',
        'notes' => 'Keep this context'
      }]
      File.write(input, JSON.generate(source))

      stdout, stderr, status = build(input, output)
      assert status.success?, "Ruby build failed.\nstdout: #{stdout}\nstderr: #{stderr}"

      html = File.read(output)
      refute_includes html, '/*__CSS__*/'
      refute_includes html, '/*__JS__*/'
      assert html.include?('Link Atlas — JayTeeSF'), 'compiled page should use the Link Atlas shell'
      assert html.include?('const PAGE_SIZE = 24'), 'compiled page should inline the Atlas JavaScript'
      assert html.include?('.featured'), 'compiled page should inline the Atlas stylesheet'
      assert html.include?("shelf:PUBLISHED_ITEMS.length?'favorites':'all'"), 'published links should open to Favorites'
      assert html.include?("value=\"rating-high\""), 'the existing rating sort should remain available'

      embedded = html.match(%r{<script id="atlasSeedData" type="application/json">(.*?)</script>}m)
      refute_nil embedded, 'compiled page should contain its initial links'
      refute_includes embedded[1], '</script>', 'link text must not terminate the JSON script element'
      rows = JSON.parse(embedded[1])
      assert_equal 1, rows.length
      assert_equal 'Safe </script><script>title', rows.first['link_text']
      assert_equal 'https://example.com/story', rows.first['url']
      assert_equal true, rows.first['favorite']
      assert_equal 'article', rows.first['media_type']
      assert_equal 'Example', rows.first['platform']
      assert_equal 'Keep this context', rows.first['notes']
    end
  end

  def test_existing_links_json_is_valid_and_becomes_the_production_seed
    Dir.mktmpdir do |dir|
      output = File.join(dir, 'index.html')
      stdout, stderr, status = build(File.join(ROOT, 'links.json'), output)
      assert status.success?, "Ruby build failed.\nstdout: #{stdout}\nstderr: #{stderr}"

      html = File.read(output)
      embedded = html.match(%r{<script id="atlasSeedData" type="application/json">(.*?)</script>}m)
      refute_nil embedded
      rows = JSON.parse(embedded[1])
      assert_equal 41, rows.length
      assert_equal 20, rows.count { |row| row['favorite'] }
      assert rows.any? { |row| row['link_text'] == 'Temperature Alerter Project' }
      refute rows.any? { |row| row['url'].include?('publicdomainreview.org') }, 'the live page should not show Atlas demo links'
    end
  end

  private

  def build(input, output)
    script = <<~RUBY
      require #{APP.inspect}
      StaticPageGenerator.new(#{input.inspect}).generate_html(#{output.inspect})
    RUBY
    Open3.capture3(RbConfig.ruby, '-e', script, chdir: ROOT)
  end
end
