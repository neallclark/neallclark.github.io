require 'capybara/rspec'
require 'selenium/webdriver'

Capybara.run_server = false
Capybara.default_driver = :selenium
Capybara.app_host = "todo add my application url here"
