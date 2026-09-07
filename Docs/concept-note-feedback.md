# Concept Note Feedback — Alignment Check Against the Actual Build

Feedback on `Concept note for multi age paper.pdf`, checked against the current PCL-MAS
codebase (backend, frontend, mas-engine). Overall the agent architecture, tech stack, and
human-in-the-loop framing line up well with what's actually being built. The items below are
places where the note reads like it came from a generic research-methods template rather than
the real project, and should be edited before this goes anywhere formal.

## 1. "CRE 252: Robotics Programming II" (page 5, Phase 3)

The text says *"The presentation identifies CRE 252..."* — that phrasing means this came from
some other slide deck, not from us directly. Nothing in the codebase (topics/materials are
generic and class-agnostic) ties to robotics specifically.

**Action:** Confirm this is actually the course being piloted, or remove/replace it. Leaving it
in makes the note describe a pilot that may not exist.

## 2. Randomized controlled trial language (Phase 4)

> "Where random assignment is institutionally feasible, a randomized controlled design would
> provide stronger causal evidence."

Unless there's actual institutional clearance to randomly split one course's students into two
arms, this is aspirational filler that doesn't match a single-lecturer, single-class prototype.

**Action:** Confirm a real comparison cohort exists, or cut this down to just the
quasi-experimental design and drop the RCT aside.

## 3. The comparison/control group itself

The whole Phase 4 design assumes a second group of students getting "conventional instructional
or LMS-supported approaches" in parallel.

**Action:** If there's no access to a second class/section to serve as a control, this section
overstates what's actually plannable right now — trim to a single-group pre/post design (or
flag it explicitly as future work) rather than presenting it as the evaluation plan.

## 4. Unresolved citation placeholders

Molenaar (2022), Kasneci et al. (2023), and UNESCO (2023) all show `(DOI)` / `(UNESCO)` as
literal placeholder text instead of resolved links — never filled in. Zheng et al. (2026) is
also worth double-checking against a real DOI before it goes into anything formal; a
forward-dated citation nobody has verified is a red flag.

**Action:** Resolve every placeholder citation to a real, checked link before circulating this
further.

## 5. Full mixed-methods human-subjects apparatus (Strand 2)

Interviews, focus groups, a priori power analysis, ANCOVA across two cohorts, reflexive
thematic analysis — this is a legitimate *thesis/paper* evaluation plan, but it's a heavy layer
on top of the software itself. Given the build is scoped to a v1 with v2 deferred, this section
should be flagged as belonging to the research/evaluation phase, not the current build, so it
doesn't get read as a v1 deliverable.

## What's accurate and should stay

The description of the Lecturer Agent as the one who "retrieves and uses course-specific
materials" and "prepares student-question responses" is accurate — it's actually the target
we should be building toward (the current code has drifted from that, with the Instructor
agent doing that work instead). That's a code-fix on our end, not a PDF error, so no need to
touch it in the document.
