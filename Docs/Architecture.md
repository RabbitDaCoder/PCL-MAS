# Architecture

## Multi-Agent System (MAS) Design

**Philosophy**

- Administrative AI → manages the learning environment.
- Instructor AI → teaches and personalizes learning.
- Lecturer AI → protects academic quality and keeps the human lecturer involved.

### Agents

| Agent                | Responsibility                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin Agent**      | Learning administration: onboarding, student profiles, enrollment, class membership, attendance, notifications/reminders, participation monitoring, inactivity/collaboration-issue detection, learner records. Never judges academic quality or triggers human escalation.                                                                                                         |
| **Instructor Agent** | Teaching: reads lecturer-uploaded materials, builds course knowledge, generates pre-/post-tests, analyzes results, builds personalized learning plans, teaches concepts, recommends readings, generates assignments/collaborative activities, grades work, gives formative feedback, tracks progress, produces analytics.                                                          |
| **Lecturer Agent**   | Academic supervision: reviews Instructor outputs, checks consistency with course materials, detects hallucinations, validates assessment quality, reviews learning plans/feedback, summarizes and groups student questions, drafts responses, forwards unresolved items to the human lecturer, delivers approved responses, generates dashboards/reports. Does not teach directly. |

### Orchestration

Single Crew, hierarchical orchestration. Every request from the backend goes through one
Crew Orchestrator, which decides which agent(s) are needed and in what order.

```
Student Request
        │
        ▼
 Crew Orchestrator
        │
 ┌──────┼────────┐
 │      │        │
Admin Instructor Lecturer
```

Examples:

- Student logs in → Admin only.
- "Explain recursion." → Instructor only.
- "I think question 5 is incorrect." → Instructor evaluates → Lecturer reviews → human lecturer if necessary.
- Lecturer uploads a PDF → Instructor processes → Lecturer validates → Admin publishes.

### Human-in-the-Loop: Approval Gateway

Human-in-the-loop is a separate workflow layer, not logic embedded in any agent.

```
                 Human Lecturer
                       ▲
                       │
             Approval Gateway
                       ▲
                       │
              Lecturer Agent
                       ▲
                       │
             Instructor Agent
                       ▲
                       │
               Admin Agent
```

Every AI response is assigned a risk level:

- **Low risk** (welcome messages, notifications, reading reminders) → sent automatically.
- **Medium risk** (concept explanations, practice questions, homework) → reviewed by
  Instructor + Lecturer, sent automatically once validated.
- **High risk** (grades, personalized learning plans, final feedback, assessment
  corrections, academic disputes) → must be approved by the human lecturer.

### Status

- Agent role definitions: done (`mas-engine/agents/{Admin,Instructor,Lecturer}/agent.yaml`).
- Orchestrator Flow and Approval Gateway: not yet implemented.
