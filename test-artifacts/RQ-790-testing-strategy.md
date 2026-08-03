# Testing Strategy — RQ-790: Student Intake Profile Registration

**Source requirement:** Spira RQ-790, Project "Rex Jones II" (ProjectId 24)
**Status:** In Progress | **Importance:** 2 - High | **Type:** User Story
**Target under test:** https://ui.rexjones2.com/automation-practice-form (resolves to `/practice-form`)

## Requirement as written

> The system must allow prospective students to fill out the registration form to submit their intake profile.
>
> **User Story:** As a prospective student, I want to enter my contact information and language preferences on the registration form, so that I can successfully submit my intake profile to the platform.
>
> **Acceptance Criteria:**
> 1. **Core Data Capture:** The system must capture First name, Last name, and Email.
> 2. **Skill Preference Selection:** The user must be able to select their preferred programming language (e.g., 'Java').
> 3. **Form Submission Execution:** A submit button must execute the operation.

## What the live DOM actually contains

Crawled and interacted with the live form directly (not just read statically). The rendered form has **10 data fields**, not 3:

| Field | HTML control | Marked required (`*`) | Enforced at submit (JS validation) |
|---|---|---|---|
| First name | `input#first_name` | Yes | Yes — "First Name is a required field" |
| Last name | `input#last_name` | Yes | Yes — "Last Name is a required field" |
| Gender | `input[name=gender]` (radio: Male/Female/Other) | Yes | Yes — "Gender is a required field" |
| Programming language | checkboxes: Java, Python, JavaScript, TypeScript, C# | Yes | Yes — "Programming Language is a required field" |
| Mobile (10 Digits) | `input#mobile` | No | No validation of any kind |
| Email | `input#email` | No | No validation of any kind |
| Date of birth | `input` + React `DatePicker` popup | No | No validation of any kind |
| Current Address | `textarea#current_address` | No | No validation of any kind |
| Country | `select.country` (India / Canada / USA) | No | No validation; drives State list |
| State / Province | `select.state` (populated from Country) | No | No validation; drives City list |
| City / County | `select.city` (populated from State) | No | No validation |

On submit with all four required fields valid, the app opens a modal dialog ("Thanks for submitting the form") containing a summary table of **all 10 fields**, not just the 3 named in the requirement. The form does **not** clear/reset after the modal is closed.

---

## 1. Requirement Gaps & Missing Business Logic (for Product Owner / BA)

1. **Requirement covers 3 of 10 fields.** AC1 only names First name, Last name, and Email as "core data," but the implemented form has 7 additional fields (Gender, Mobile, Date of Birth, Current Address, Country, State/Province, City/County), all of which are captured and surfaced on the confirmation modal. The requirement does not acknowledge these fields exist, so there is no documented intent for any of them.
2. **Email contradicts its own acceptance criterion.** AC1 states the system "must capture" Email as core data, implying importance/required status, but the live form has no `required` marking and no format validation — a value like `not-an-email` is silently accepted and submitted. Either the requirement is wrong about Email's importance, or the implementation is missing validation that the requirement implies but never states explicitly.
3. **Gender and Programming Language are enforced as required in the app but are absent from the requirement entirely.** Gender isn't mentioned anywhere in RQ-790. Programming language is covered by AC2 but the requirement never states it's mandatory — yet the app blocks submission without it. This is undocumented business logic that a BA never signed off on in writing.
4. **"Mobile(10 Digits)" label is not backed by any digit or length-format validation.** Verified live: typing `abc12xyz9!!` is accepted, silently truncated to 10 characters by a max-length constraint, and submitted as-is. The label promises numeric-only, 10-digit input; the implementation enforces neither the numeric constraint nor a true 10-digit rule (it just caps character count).
5. **Date of Birth has no bounds.** The date picker allows any year from 1900 through 2100 — including birthdates in the future — with no age-eligibility rule (e.g., minimum age to register) defined anywhere in the requirement.
6. **AC3 ("A submit button must execute the operation") does not define what "the operation" produces.** In practice this is a client-side confirmation modal listing submitted values — there's no indication in the requirement of whether this is the full intended behavior, or whether the real intake pipeline should persist data to a backend, trigger an email confirmation, or something else the practice-form stub doesn't demonstrate.
7. **No reset/clear behavior is specified.** After closing the confirmation modal, all entered values (including the invalid ones used in testing) remain in the form. Whether this is intended (e.g., to allow edits/resubmission) or a defect is undefined.
8. **Country list is limited to India, Canada, USA only**, with no stated business reason for excluding other countries — unclear if this is a deliberate MVP scope limit or an oversight.
9. **No duplicate-submission or idempotency rule.** Nothing in the requirement addresses whether the same student can submit the intake form multiple times, or whether Email should be treated as a unique identifier.
10. **No character-set or length constraints defined for free-text fields** (First name, Last name, Current Address) — the requirement gives no guidance on rejecting numerals, special characters, or excessively long input.

## 2. Clarifying Questions for the Product Team

1. Should **Email** be a hard-required field with format validation (e.g., RFC 5322-style regex), given AC1 lists it as core data but the UI does not enforce it today?
2. Should **Mobile Number** be restricted to exactly 10 numeric digits, and should non-numeric input be rejected outright rather than silently truncated?
3. Is **Gender** genuinely in scope for this requirement? If yes, it needs to be added to the acceptance criteria explicitly since it's already enforced as mandatory in the app.
4. Can a prospective student select **more than one programming language**, or should this be single-select? The UI uses checkboxes (implying multi-select) but the requirement's example ("e.g., 'Java'") reads as if only one matters.
5. What should happen after a **successful submission** — is the confirmation modal the final intended UX, or does the real intake flow need server-side persistence, a confirmation email, or a redirect that this practice environment doesn't reflect?
6. Should the form **reset/clear** after a successful submission, or is retaining values intentional (e.g., to support quick correction and resubmission)?
7. Is there a **minimum/maximum age** requirement for Date of Birth (e.g., students must be 16+), and should future dates be blocked?
8. Are **Current Address**, **Country**, **State/Province**, and **City/County** in scope for this requirement at all, or do they belong to a separate/future requirement (e.g., a "Location Details" story)?
9. Should the **Country** list support more than India/Canada/USA, or is that the full intended scope for this release?
10. Is there a need to prevent **duplicate intake submissions** for the same student/email?

## 3. Additional Test Coverage — Prioritized Regression Structure

### P0 — Critical Path (blocks release if broken)
| ID | Coverage |
|---|---|
| P0-01 | Submitting with all required fields (First name, Last name, Gender, Programming language) valid succeeds and shows the confirmation modal |
| P0-02 | Submitting with First name empty is blocked with visible "First Name is a required field" error |
| P0-03 | Submitting with Last name empty is blocked with visible "Last Name is a required field" error |
| P0-04 | Submitting with no Gender selected is blocked with visible "Gender is a required field" error |
| P0-05 | Submitting with no Programming language checked is blocked with visible "Programming Language is a required field" error |
| P0-06 | Confirmation modal accurately reflects submitted First/Last name, Gender, and selected Programming language |

### P1 — Functional Variations
| ID | Coverage |
|---|---|
| P1-01 | Multiple Programming Language checkboxes can be selected simultaneously and all appear in the confirmation table |
| P1-02 | Each Gender radio option (Male/Female/Other) can be individually selected and is reflected correctly on submission |
| P1-03 | Country → State/Province → City/County cascading dropdowns populate correctly for each supported country (India, Canada, USA) |
| P1-04 | Date of Birth date picker allows month/year navigation and correct date selection, and the selected date appears correctly in the confirmation table |
| P1-05 | Optional fields (Mobile, Email, Current Address) that are left blank submit successfully and appear blank in the confirmation table |
| P1-06 | Closing the confirmation modal via the "Close" button (both header and footer instances) dismisses the dialog |
| P1-07 | Form field values persist after the confirmation modal is dismissed (documents current behavior; revisit if PO defines reset requirement) |
| P1-08 | Changing Gender selection before submit correctly overrides the prior selection (radio group exclusivity) |

### P2 — Edge Cases / Negative Paths
| ID | Coverage |
|---|---|
| P2-01 | Email field accepts and submits a syntactically invalid address (e.g., `not-an-email`) with no client-side error — documents the current validation gap |
| P2-02 | Mobile field accepts non-numeric characters and silently truncates input beyond 10 characters (e.g., `abc12xyz9!!` → `abc12xyz9!`) — documents the current validation gap |
| P2-03 | Date of Birth allows selecting a future-dated year (e.g., 2050) with no rejection |
| P2-04 | Date of Birth allows selecting an implausible birth year (e.g., 1900) with no minimum-age rejection |
| P2-05 | First name / Last name accept numeric and special-character input (e.g., `John123`, `O'Brien-$mith`) with no rejection |
| P2-06 | Current Address accepts very long input (500+ characters) without truncation or error |
| P2-07 | Changing Country after State/Province and City/County are already selected — verify whether dependent dropdowns reset or retain stale values |
| P2-08 | Rapid double-click on Submit does not produce duplicate confirmation modals or duplicate submissions |
| P2-09 | Keyboard-only navigation (Tab/Shift+Tab/Space/Enter) can complete and submit the form without a mouse |
| P2-10 | Browser viewport resized to mobile width renders all fields without overlap or clipped content |
