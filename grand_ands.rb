#!/usr/bin/env ruby

require 'csv'

# Assuming the CSV file is named 'grand_ands.csv' and is in the same directory as this script.
csv_file_path = 'grand_ands.csv'

CSV.foreach(csv_file_path, headers: true) do |row|
  grand_and = row['Grand "And"']
  verse_snippet = row['Verse Snippet']
  scripture_reference = row['Scripture Reference'].gsub(/([A-Za-z]+) (\d+):(\d+)/, '\1/\2/\3')
  insight = row['Insight']

  # Create the URL format for the Scripture Reference
  # This example assumes a simplified conversion and may need to be adjusted based on actual URL structures.
  scripture_url = "/bible/#{scripture_reference}"

  # Print the HTML table row
  puts "<tr>"
  puts "  <td>#{grand_and}</td>"
  puts "  <td>#{verse_snippet}</td>"
  puts "  <td><a href=\"#{scripture_url}\">#{scripture_reference.gsub('/', ' ')}</a></td>"
  puts "  <td>#{insight}</td>"
  puts "</tr>"
end
