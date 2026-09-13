## Problem Statement
University students often miss deadlines, struggle to prioritize tasks across multiple courses, and waste time switching between fragmented tools. Current solutions focus on listing tasks but fail to guide students on what to do next. CampusFlow addresses this gap by providing a clear, prioritized view of upcoming academic responsibilities.

## Target Users
Primary: Undergraduate university students managing multiple courses and assignments simultaneously.

Secondary: Graduate students or learners in structured programs (future expansion).

## User Stories
As a student, I want to see all my assignments and exams in one place so I don’t miss deadlines.

As a student, I want tasks prioritized by urgency and importance so I know what to work on next.

As a student, I want a simple interface to add/edit tasks manually without needing integrations.

As a student, I want to filter tasks by course so I can focus on one subject at a time.

As a student, I want a weekly view of upcoming deadlines so I can plan my study schedule.

## Core Features
MVP (Portfolio Build)
Task dashboard with priority sorting (e.g., “Next Up” section).

Manual task creation (title, course, due date, priority).

Course-based categorization.

Weekly calendar view of deadlines.

Local/mock data storage (no backend).

Clean, responsive UI (Next.js, React, Tailwind CSS).

Later Phases (Future Enhancements)
University system integrations (auto-import assignments).

Real-time sync across devices.

Notifications & reminders.

AI-powered study recommendations (“best next task”).

Collaborative features (study groups, shared task lists).

## Success Metrics
MVP Validation Metrics (Portfolio Testing):

≥80% task completion success in usability testing.

Reduced time to find upcoming deadlines (measured in task navigation tests).

Positive qualitative feedback from 10–20 student testers.

Longer-Term Metrics:

Weekly active users (WAU).

Assignment completion rate.

Retention (students returning weekly).

## Edge Cases
Students entering tasks without due dates → system should still display them but deprioritize.

Overlapping deadlines across courses → ensure clear conflict visibility.

Large number of tasks (e.g., 50+) → UI should remain performant and scannable.

Students deleting tasks accidentally → consider undo option in later versions.

## Out-of-Scope (for MVP)
University integrations (LMS, portals).

Notifications (push/email).

AI-driven recommendations.

Multi-device sync.

Advanced analytics dashboards.