#!/usr/bin/env ruby

require 'json'

class StaticPageGenerator
  ROOT = File.expand_path(__dir__)
  CSS_MARKER = '/*__CSS__*/'
  JS_MARKER = '/*__JS__*/'
  SEED_MARKER = '/*__SEED__*/'

  def initialize(input_file = File.join(ROOT, 'links.json'))
    @input_file = File.expand_path(input_file)
    @data = JSON.parse(File.read(@input_file))
    raise ArgumentError, 'links.json must contain an array of links' unless @data.is_a?(Array)
  end

  def generate_html(output_file = File.join(ROOT, 'index.html'))
    html = File.read(File.join(ROOT, 'src', 'shell.html'))
    replacements = {
      CSS_MARKER => File.read(File.join(ROOT, 'src', 'styles.css')),
      JS_MARKER => File.read(File.join(ROOT, 'src', 'app.js')),
      SEED_MARKER => safe_json(@data)
    }

    replacements.each { |marker, content| replace_once!(html, marker, content) }

    output_path = File.expand_path(output_file)
    File.write(output_path, html)
    output_path
  end

  private

  def replace_once!(html, marker, content)
    occurrences = html.scan(marker).length
    raise "Expected one #{marker} marker in src/shell.html; found #{occurrences}" unless occurrences == 1

    html.sub!(marker) { content }
  end

  def safe_json(data)
    JSON.generate(data).gsub(/[&<>\u2028\u2029]/) do |character|
      format('\\u%04x', character.ord)
    end
  end
end

if $PROGRAM_NAME == __FILE__
  input_file = ARGV[0] || File.join(StaticPageGenerator::ROOT, 'links.json')
  output_file = ARGV[1] || File.join(StaticPageGenerator::ROOT, 'index.html')
  output_path = StaticPageGenerator.new(input_file).generate_html(output_file)
  puts "Wrote #{output_path} (#{File.size(output_path)} bytes)"
end
