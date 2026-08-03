# =============================================================================
# Feature: Student Intake Profile Registration (RQ-790)
# Source: Spira RQ-790 (Project: Rex Jones II)
# Target: https://ui.rexjones2.com/automation-practice-form
#
# Priority key:
#   @P0 - Critical path, blocks release if broken
#   @P1 - Functional variations
#   @P2 - Edge cases / negative paths
#
# NOTE: Scenarios tagged @P2 with "gap" in the name document CURRENT
# (unvalidated) behavior discovered while crawling the live DOM. They are
# expected to change once Product/BA answers the open clarifying questions
# in RQ-790-testing-strategy.md.
# =============================================================================

Feature: Student Intake Profile Registration
  As a prospective student
  I want to enter my contact information and language preferences on the registration form
  So that I can successfully submit my intake profile to the platform

  Background:
    Given I am on the Practice Form page at "/automation-practice-form"

  # Scenario-001
  @P0
  Scenario: Successful submission with all required fields completed
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    When I click the Submit button
    Then the "Thanks for submitting the form" confirmation dialog is displayed

  # Scenario-002
  @P0
  Scenario: Submission is blocked when First name is missing
    Given I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    When I click the Submit button
    Then the confirmation dialog is not displayed
    And I see the error message "First Name is a required field"

  # Scenario-003
  @P0
  Scenario: Submission is blocked when Last name is missing
    Given I have entered "Jane" as the First name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    When I click the Submit button
    Then the confirmation dialog is not displayed
    And I see the error message "Last Name is a required field"

  # Scenario-004
  @P0
  Scenario: Submission is blocked when Gender is not selected
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have checked "Java" under Programming language
    When I click the Submit button
    Then the confirmation dialog is not displayed
    And I see the error message "Gender is a required field"

  # Scenario-005
  @P0
  Scenario: Submission is blocked when no Programming language is selected
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    When I click the Submit button
    Then the confirmation dialog is not displayed
    And I see the error message "Programming Language is a required field"

  # Scenario-006
  @P0
  Scenario: Confirmation dialog accurately reflects submitted required data
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    When I click the Submit button
    Then the confirmation table shows "Student Name" as "Jane Doe"
    And the confirmation table shows "Gender" as "Male"
    And the confirmation table shows "Programming Language" as "Java"

  # Scenario-007
  @P1
  Scenario: Multiple programming languages can be selected and submitted
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    And I have checked "Python" under Programming language
    And I have checked "TypeScript" under Programming language
    When I click the Submit button
    Then the confirmation table shows "Programming Language" as "Java Python TypeScript"

  # Scenario-008
  @P1
  Scenario Outline: Each gender option can be selected and is reflected on submission
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "<gender>" as the Gender
    And I have checked "Java" under Programming language
    When I click the Submit button
    Then the confirmation table shows "Gender" as "<gender>"

    Examples:
      | gender |
      | Male   |
      | Female |
      | Other  |

  # Scenario-009
  @P1
  Scenario: Selecting a Country populates the State / Province dropdown
    When I select "India" from the Country dropdown
    Then the State / Province dropdown contains "Maharashtra"

  # Scenario-010
  @P1
  Scenario: Selecting a State populates the City / County dropdown
    Given I have selected "India" from the Country dropdown
    When I select "Maharashtra" from the State / Province dropdown
    Then the City / County dropdown contains at least one city option

  # Scenario-011
  @P1
  Scenario: Date of birth can be selected via the date picker
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    When I open the Date of birth picker
    And I select the date "15 June 2000" from the date picker
    And I click the Submit button
    Then the confirmation table shows "Date of Birth" as "15 Jun 2000"

  # Scenario-012
  @P1
  Scenario: Optional fields left blank submit successfully with blank values shown
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    When I click the Submit button
    Then the confirmation table shows "Student Email" as blank
    And the confirmation table shows "Mobile" as blank
    And the confirmation table shows "Address" as blank

  # Scenario-013
  @P1
  Scenario: Confirmation dialog can be dismissed via the Close button
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    And I have submitted the form
    When I click the "Close" button on the confirmation dialog
    Then the confirmation dialog is no longer displayed

  # Scenario-014
  @P1
  Scenario: Form field values persist after the confirmation dialog is closed
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    And I have submitted the form
    When I close the confirmation dialog
    Then the First name field still shows "Jane"
    And the Last name field still shows "Doe"

  # Scenario-015
  @P2
  Scenario: [Validation gap] Email field accepts a syntactically invalid address
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    And I have entered "not-an-email" as the Email
    When I click the Submit button
    Then the confirmation dialog is displayed
    And the confirmation table shows "Student Email" as "not-an-email"

  # Scenario-016
  @P2
  Scenario: [Validation gap] Mobile field accepts non-numeric characters and truncates at 10 characters
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    And I have entered "abc12xyz9!!" as the Mobile number
    When I click the Submit button
    Then the confirmation table shows "Mobile" as "abc12xyz9!"

  # Scenario-017
  @P2
  Scenario: [Validation gap] Date of birth allows a future-dated year
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    When I open the Date of birth picker
    And I select the year "2050" from the date picker
    And I select a day from the date picker
    Then no validation error is shown for Date of birth

  # Scenario-018
  @P2
  Scenario: [Validation gap] Date of birth allows an implausible birth year
    When I open the Date of birth picker
    And I select the year "1900" from the date picker
    And I select a day from the date picker
    Then no validation error is shown for Date of birth

  # Scenario-019
  @P2
  Scenario Outline: First and Last name accept numeric and special-character input
    Given I have entered "<value>" as the First name
    And I have entered "<value>" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    When I click the Submit button
    Then the confirmation dialog is displayed

    Examples:
      | value          |
      | John123        |
      | O'Brien-$mith  |

  # Scenario-020
  @P2
  Scenario: Current Address accepts very long free-text input
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    And I have entered a 500-character string as the Current Address
    When I click the Submit button
    Then the confirmation dialog is displayed
    And the confirmation table shows the full Address value without truncation

  # Scenario-021
  @P2
  Scenario: Changing Country after State and City are selected
    Given I have selected "India" from the Country dropdown
    And I have selected "Maharashtra" from the State / Province dropdown
    When I select "Canada" from the Country dropdown
    Then the State / Province dropdown resets to "Select State / Province:"
    And the City / County dropdown resets to "Select City / County:"

  # Scenario-022
  @P2
  Scenario: Rapid double-click on Submit does not produce duplicate submissions
    Given I have entered "Jane" as the First name
    And I have entered "Doe" as the Last name
    And I have selected "Male" as the Gender
    And I have checked "Java" under Programming language
    When I double-click the Submit button rapidly
    Then only one confirmation dialog is displayed

  # Scenario-023
  @P2
  Scenario: Form is completable via keyboard-only navigation
    Given I am focused on the First name field
    When I complete all required fields using only Tab, Shift+Tab, Space, and Enter keys
    And I submit the form using the Enter key
    Then the confirmation dialog is displayed

  # Scenario-024
  @P2
  Scenario: Form renders correctly at mobile viewport width
    Given my browser viewport is set to a mobile width of 375 pixels
    When I view the Practice Form page
    Then all form fields are visible without horizontal overlap or clipped content
