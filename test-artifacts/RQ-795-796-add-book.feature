# =============================================================================
# Feature: Add Book Form Validation & Successful Catalog Entry (RQ-795, RQ-796)
# Source: Spira RQ-795 & RQ-796 (Project: Rex Jones II)
# Target: https://ui.rexjones2.com/add-book
#
# Priority key:
#   @P0 - Critical path, blocks release if broken
#   @P1 - Functional variations
#   @P2 - Edge cases / negative paths
#
# NOTE: Scenario-005 is tagged @P2 with "gap" in the name to document CURRENT
# (unvalidated) behavior discovered while crawling the live DOM. See the open
# clarifying questions in RQ-795-796-testing-strategy.md.
#
# NOTE: Scenario-006 (RQ-796) mocks the POST /api/books response. Direct calls
# to api.rexjones2.com fail in this environment with net::ERR_FAILED due to a
# local HTTPS-inspecting security proxy (see "Environment Note" in the
# strategy doc) — the mock lets us verify the client's success-handling
# contract independent of that interference.
# =============================================================================

Feature: Add Book Form Validation & Successful Catalog Entry
  As a Book Store Administrator
  I want the Add Book form to enforce required fields and correctly persist valid entries
  So that incomplete records are rejected and complete records reach the catalog

  Background:
    Given I am logged into the Book Store Application
    And I am on the Add Book page at "/add-book"

  # Scenario-001
  # File: tests/add_book/RQ-795_validate-required-book-fields.test.ts
  @P0
  Scenario: Submitting the Add Book form with all fields empty shows required-field validation
    When I click the Submit button
    Then I see the error message "ISBN is a required field"
    And I see the error message "Title is a required field"
    And I see the error message "Sub Title is a required field"
    And I see the error message "Author is a required field"
    And I see the error message "Publisher is a required field"
    And I see the error message "Description is a required field"
    And I see the error message "Website is a required field"

  # Scenario-002
  # File: tests/add_book/RQ-795_verify-empty-submission-blocks-api-request.test.ts
  @P0
  Scenario: Submitting the Add Book form with required fields empty does not call the Book Store API
    When I click the Submit button
    Then no request is sent to the Book Store API "books" endpoint

  # Scenario-003
  # File: tests/add_book/RQ-795_verify-partial-field-validation.test.ts
  @P1
  Scenario: Leaving only some required fields empty shows validation for those fields only
    Given I have entered "9781234567897" as the ISBN
    And I have entered "Automation Fundamentals" as the Title
    And I have entered "Jane Doe" as the Author
    And I have entered "OReilly Media" as the Publisher
    When I click the Submit button
    Then I see the error message "Sub Title is a required field"
    And I see the error message "Description is a required field"
    And I see the error message "Website is a required field"
    And I do not see the error message "ISBN is a required field"
    And I do not see the error message "Title is a required field"
    And I do not see the error message "Author is a required field"
    And I do not see the error message "Publisher is a required field"

  # Scenario-004
  # File: tests/add_book/RQ-795_verify-numeric-and-date-field-validation.test.ts
  @P1
  Scenario: Pages and Publish Date left blank show their own distinct validation messages
    When I click the Submit button
    Then I see the error message "Pages must be a number"
    And I see the error message "Publish Date must be a date"

  # Scenario-005
  # File: tests/add_book/RQ-795_validate-whitespace-only-required-fields.test.ts
  @P2
  Scenario: [Validation gap] Whitespace-only values in required fields bypass required-field validation
    Given I have entered "   " as the ISBN
    And I have entered "   " as the Title
    And I have entered "   " as the Sub Title
    And I have entered "   " as the Author
    And I have entered "   " as the Publisher
    And I have entered "   " as the Description
    And I have entered "   " as the Website
    And I have entered "100" as the Pages
    And I have entered "06/15/2020" as the Publish Date
    When I click the Submit button
    Then no "is a required field" validation message is displayed
    And a request is sent to the Book Store API "books" endpoint

  # Scenario-006
  # File: tests/add_book/RQ-796_verify-successful-book-submission.test.ts
  @P0
  Scenario: Successful submission with all nine fields completed shows confirmation and resets the form
    Given the Book Store API "books" endpoint is mocked to return a successful response
    And I have entered "9781234567897" as the ISBN
    And I have entered "Automation Fundamentals" as the Title
    And I have entered "A Practical Guide" as the Sub Title
    And I have entered "Jane Doe" as the Author
    And I have entered "OReilly Media" as the Publisher
    And I have entered "320" as the Pages
    And I have entered "06/15/2020" as the Publish Date
    And I have entered "A comprehensive guide to test automation." as the Description
    And I have entered "https://example.com/automation-fundamentals" as the Website
    When I click the Submit button
    Then the "Success" confirmation alert is displayed
    And after dismissing the alert, the ISBN field is cleared
