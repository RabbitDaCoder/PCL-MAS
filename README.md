# PCL-MAS

**Personalized Collaborative Learning Using Multi-Agent Systems**

A research prototype exploring how a coordinated team of specialized AI agents — supervised by a human lecturer at every consequential step — can deliver personalized, evidence-based learning support at a scale no single instructor could manage alone, without ever taking academic judgment out of human hands.

---

## The problem

University students arrive in the same class with wildly different starting points: different prior knowledge, different gaps, different paces. A lecturer with one class and thirty, sixty, or two hundred students cannot realistically diagnose each learner's difficulties continuously and intervene individually — not because they don't care, but because there aren't enough hours in the week.

Generic AI chatbots don't solve this well either. A single general-purpose assistant has no memory of what a specific student struggles with, no grounding in what the lecturer actually taught, and no mechanism for a human to catch it when it's confidently wrong. Handing personalization to an unsupervised AI trades one problem (an overloaded lecturer) for another (unaccountable automation).

## What PCL-MAS does instead

PCL-MAS coordinates three specialized AI agents, each with a distinct, bounded job, working together inside a single course:

- **Administrative AI** — onboards students, tracks participation, and keeps the class running smoothly. It never makes academic judgments.
- **Instructor AI** — analyzes each student's diagnostic results, identifies their specific knowledge gaps and strengths, and builds a personalized learning path tailored to what *that student* actually needs to work on.
- **Lecturer AI** — grounds its answers in the course material the human lecturer actually uploaded, drafts assessments from that material, and answers student questions consistently with how the lecturer wants their class run.

Every academically consequential output — a diagnostic test before it reaches students, a personalized learning plan, a proposed change to how the AI agents behave — is routed to the human lecturer for approval, edit, or rejection before it takes effect. The system augments the lecturer's capacity; it never bypasses their authority.

## How it works, end to end

1. **Onboarding.** A student joins a class and is greeted automatically, with a nudge to complete their diagnostic pre-test.
2. **Diagnosis.** The pre-test is drafted from the lecturer's own course materials, reviewed and approved by the lecturer, then released to the class.
3. **Personalization.** Each student's results are analyzed individually — not as a class average — to identify their specific strengths, weaknesses, and knowledge gaps, producing a learning path unique to them. The lecturer reviews it before the student ever sees it.
4. **Live support.** Students can ask questions in a class-wide chat or a private channel at any time. They can address the whole team or call a specific agent by name when they know exactly who they need. Every reply is grounded in the actual course material and the lecturer's own stated preferences for how their class should be handled — never generic filler.
5. **Feedback, everywhere.** Students can rate any AI response. Lecturers can leave a reason whenever they approve, edit, or reject something an agent produced. None of this feedback disappears — it accumulates.
6. **Continuous improvement, human-gated.** Periodically, an independent analysis process reviews everything that feedback has revealed — where agents are being corrected often, where students are unhappy with an answer — and turns it into a small number of specific, evidence-backed suggestions. A lecturer can preview exactly how an agent would respond differently before deciding whether to adopt a suggestion. Nothing is ever applied automatically. The AI can only ever recommend; a human always decides.
7. **Full visibility, per student.** A lecturer isn't limited to class-wide averages. For any individual student, they can see how that student has been engaging with the system, what gaps were diagnosed, what was recommended and why, how the recommendation has changed over time, and whether the student actually improved afterward.

## Why this matters

- **Personalization that's actually personal.** Recommendations are built from an individual student's diagnosed gaps, not a one-size-fits-all curriculum.
- **Human authority stays human.** Nothing academically consequential — a test, a learning plan, a change in how an agent behaves — reaches a student without a lecturer's sign-off. The system is built so this can't quietly be bypassed, not just discouraged in principle.
- **Grounded, not generic.** Agents answer from the material a lecturer actually taught, not from whatever a general-purpose model happens to guess.
- **It gets better without getting riskier.** The system learns from real feedback and turns it into evidence-backed, human-reviewed suggestions — improvement without ceding control.
- **Built for evaluation, not just demonstration.** Every interaction, diagnostic result, personalization decision, and lecturer judgment call is recorded, making it possible to ask — and answer — whether this approach genuinely improves learning outcomes and where human oversight actually earns its keep.

## Technology

- **Frontend:** React with Tailwind CSS
- **Backend:** Node.js with Express, MongoDB
- **AI orchestration:** Python with CrewAI, coordinating the three specialized agents

## Status

This is an active research prototype, developed as part of a study into human-supervised multi-agent AI for personalized learning in higher education. It is not a finished commercial product.
