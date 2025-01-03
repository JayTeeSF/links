#!/usr/bin/env ruby

require 'google/apis/sheets_v4'
require 'googleauth'
require 'erb'

class ReportGenerator
  def initialize(spreadsheet_id, credentials_path)
    @service = Google::Apis::SheetsV4::SheetsService.new
    @service.client_options.application_name = 'Static Site Tracker'
    @service.authorization = Google::Auth::ServiceAccountCredentials.make_creds(
      json_key_io: File.open(credentials_path),
      scope: Google::Apis::SheetsV4::AUTH_SPREADSHEETS_READONLY
    )
    @spreadsheet_id = spreadsheet_id
  end

  def fetch_data
    range = 'Sheet1!A:C' # Adjust range to match your data columns
    response = @service.get_spreadsheet_values(@spreadsheet_id, range)
    response.values || []
  end

  def generate_report(data)
    template = File.read('./view/layout.erb')
    report = File.read('./view/report.erb')
    erb = ERB.new(template)
    File.write('./report.html', erb.result_with_hash(content: ERB.new(report).result(binding), data: data))
  end
end

if $PROGRAM_NAME == __FILE__
  # Replace with your Google Sheets ID and credentials file path
  spreadsheet_id = "1wlAQiLDH5bO6aPeKHIp0sm9Q528Vs-jeJEullBf4ENU"
  credentials_path = "./path/to/credentials.json" # Replace with actual credentials path

  generator = ReportGenerator.new(spreadsheet_id, credentials_path)
  data = generator.fetch_data
  generator.generate_report(data)
  puts "Report generated successfully."
end
