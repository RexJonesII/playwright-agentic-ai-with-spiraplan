# Test Plan — TC-290: Verify Registration Field Format Guardrails and Negative Validations

**Source:** Spira TC-290, Project "Rex Jones II" (ProjectId 24)
**Status:** Ready for Test | **Type:** Functional
**Target under test:** `https://ui.rexjones2.com/login` → `https://ui.rexjones2.com/automation-practice-form` (resolves to `/practice-form`)

## Live DOM verification

Explored the live application with `playwright-cli` (not read statically) and reproduced every step of TC-290 end-to-end:

1. Logged in at `/login` with `Username: Success` / `Password: Success3400` → redirected to `/homepage`, which lists the same set of test-page links named in TC-290's Step 1 expected result (Practice Form, Practice AUT, HTML Elements, Date Picker / Select, Dynamic Waits, Dialogs/Alerts/Windows/Frames, Actions, Shadow DOM, Upload & Download, Book Store Application).
2. Navigated to `https://ui.rexjones2.com/automation-practice-form` → resolved to `/practice-form` and rendered the "Practice Form" / "Student Registration Form" heading, confirming Step 2.
3. Left First name and Last name empty, filled Email with `RexAllenJones@GMail.com`, clicked Submit.
4. Observed exactly the two errors TC-290's Step 5 specifies — `First Name is a required field` and `Last Name is a required field` — rendered directly beneath their respective input containers.

`page_objects/RegistrationPage.ts` already exposes matching methods/locators for every element this core workflow touches (`clickPracticeForm`, `setEmail`, `clickSubmitButton`, `firstNameError`, `lastNameError`, `pageHeading`, `pageSubheading`), so no new page object methods are required for Phase 2.

---

## Primary Core Workflow

**Seed:** login via `page_objects/LoginPage.ts`, then navigate to the registration form.

### 1.1 verify-required-field-validation-on-empty-name-fields

**File:** `tests/TC-290.test.ts` (must live under the configured `testDir` for `npx playwright test TC-290.test.ts` to discover it)

**Steps:**
1. Log into the test application at `https://ui.rexjones2.com/login` with Username `Success` / Password `Success3400`.
   - expect: the Home Page is displayed (URL leaves `/login`).
2. Navigate to the Student Registration Form via the "Practice Form" link.
   - expect: the Practice Form / Student Registration Form is displayed (`pageHeading` "Practice Form" and `pageSubheading` "Student Registration Form" visible).
3. Leave the First Name and Last Name fields empty.
   - expect: no validation errors are shown yet.
4. Enter a valid email address (`RexAllenJones@GMail.com`) into the Email field.
5. Click the Submit button.
   - expect: `First Name is a required field` message is visible beneath the First Name field.
   - expect: `Last Name is a required field` message is visible beneath the Last Name field.

---

## Identified Gap Analysis & Negative Scenarios

Discovered during DOM exploration; **not** covered by TC-290's documented steps and **not** included in `TC-290.test.ts` per the single-scenario constraint. Candidates for future test cases:

- [ ] **Gender required-field validation not exercised.** Submitting with Gender unselected also renders `Gender is a required field`, but TC-290 never sets or asserts on Gender — this validation path is currently untested by any TC-290-linked automation.
- [ ] **Programming Language required-field validation not exercised.** Same gap as Gender: submitting with no language checkbox selected renders `Programming Language is a required field`, outside TC-290's scope.
- [ ] **Email field has no format validation to contradict.** The live `input[type=text]` for Email has `required=false` and no pattern/maxLength constraint — a syntactically invalid value (e.g. `not-an-email`) is silently accepted. TC-290 only exercises the *valid* email path; a negative counterpart (invalid email format) is not covered anywhere.
- [ ] **Mobile field accepts non-numeric input up to a 10-character cap.** `input#mobile` (`Mobile(10 Digits)`) is `type=text`, not required, `maxLength=10` — it truncates by character count only, with no digit-only enforcement. No test documents this validation gap.
- [ ] **First/Last Name accept unrestricted characters.** No test currently verifies whether numerals or special characters (`John123`, `O'Brien-$mith`) are rejected or silently accepted in the two required name fields.
- [ ] **Partial-fill negative path.** TC-290 only tests both name fields empty simultaneously; filling exactly one of First/Last Name and leaving the other blank (to confirm each error is independently triggered/cleared) is untested.
- [ ] **Whitespace-only input.** Entering only spaces into First Name / Last Name is untested — unclear whether the required-field check treats whitespace as "filled."
- [ ] **Re-submission after correcting one field.** After the two errors appear, filling in First Name only and re-submitting — does the First Name error clear while Last Name error persists? Untested.
