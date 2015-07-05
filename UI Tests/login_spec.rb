require './spec_helper'

#see #http://www.codeproject.com/Articles/588773/Testing-an-ASP-NET-MVC-app-with-Ruby
#for how to get started


#describe 'log in', :type => :feature do
#  it 'should be able to login' do
#    login

#    page.should have_text 'Logged in as'
#  end
#end

describe 'navigate to development business unit', :type => :feature do
  it 'should naviage to development business unit' do

    login 'todo add a test account', 'todo add a test password'

    visit 'admin'

    click_node_with_id '1982045' #Business Units
    click_node_with_id '1982054' #T
    click_node_with_id '2022139' #Tmac technologies ltd

    expect(page).to have_xpath "//li[@id='448']"
  end
end

def click_node_with_id(id)
  within(:xpath, "//li[@id='#{id}']") do
    find('.button').click
  end
end


def login(email, password)
  visit 'Account/LogOn?ReturnUrl=%2f'

  fill_in('UserName', :with => email)
  fill_in('Password', :with => password)

  click_link 'Log In'
end
