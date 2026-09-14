import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { Dashboard } from "../models/Dashboard.js";

const router = Router();
router.use(requireAuth);

function userId(req: AuthRequest): string {
  if (!req.userId) throw new Error("Authentication required");
  return req.userId;
}

/**
 * Converts a Mongoose sub-document to a plain object with a string `id` field,
 * without leaking the internal `_id` or `__v` fields.
 */
function toPublic(doc: { _id: unknown; toObject: () => Record<string, unknown> }) {
  const { _id, __v, ...rest } = doc.toObject();
  void _id; // intentionally excluded
  void __v;
  return { id: String(doc._id), ...rest };
}

function serializeDashboard(dashboard: InstanceType<typeof Dashboard>) {
  return {
    assignments: dashboard.assignments.map(toPublic),
    courses: dashboard.courses.map(toPublic),
    schedule: dashboard.schedule.map(toPublic),
    gpa: dashboard.gpa,
    targetGpa: dashboard.targetGpa,
  };
}

function letterForGrade(grade: number): string {
  if (grade >= 93) return "A";
  if (grade >= 90) return "A-";
  if (grade >= 87) return "B+";
  if (grade >= 83) return "B";
  if (grade >= 80) return "B-";
  if (grade >= 77) return "C+";
  if (grade >= 73) return "C";
  if (grade >= 70) return "C-";
  if (grade >= 60) return "D";
  return "F";
}

function calculateGpa(courses: InstanceType<typeof Dashboard>["courses"]): number {
  if (!courses.length) return 0;
  const points: Record<string, number> = { A: 4, "A-": 3.7, "B+": 3.3, B: 3, "B-": 2.7, "C+": 2.3, C: 2, "C-": 1.7, D: 1, F: 0 };
  return Number((courses.reduce((sum, course) => sum + (points[course.letter] ?? 0), 0) / courses.length).toFixed(2));
}

async function getDashboard(req: AuthRequest) {
  return Dashboard.findOneAndUpdate(
    { userId: userId(req) },
    { $setOnInsert: { userId: userId(req), assignments: [], courses: [], schedule: [], gpa: 0, targetGpa: 0 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

// ── Color validation helper ────────────────────────────────────────────────
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;
function isValidColor(v: unknown): v is string {
  return typeof v === "string" && HEX_COLOR.test(v);
}

// ── Routes ─────────────────────────────────────────────────────────────────

router.get("/", async (req: AuthRequest, res) => {
  try {
    const dashboard = await getDashboard(req);
    res.json(serializeDashboard(dashboard));
  } catch (error) {
    console.error("Dashboard fetch failed:", error);
    res.status(500).json({ message: "Could not load your dashboard." });
  }
});

router.post("/assignments", async (req: AuthRequest, res) => {
  try {
    const { title, course, courseCode, due, dueLabel, effort, effortHours, weight, status, color, note } = req.body ?? {};
    if (
      typeof title !== "string" || !title.trim() || typeof course !== "string" || !course.trim() ||
      typeof courseCode !== "string" || !courseCode.trim() || typeof due !== "string" ||
      typeof dueLabel !== "string" || typeof effort !== "string" || typeof effortHours !== "number" ||
      !Number.isFinite(effortHours) || effortHours < 0 ||
      typeof weight !== "number" || !Number.isFinite(weight) || weight < 0 || weight > 100 ||
      !isValidColor(color)
    ) {
      res.status(400).json({ message: "Assignment details are incomplete or invalid." });
      return;
    }
    const dashboard = await getDashboard(req);
    dashboard.assignments.push({ title: title.trim(), course: course.trim(), courseCode: courseCode.trim(), due, dueLabel, effort, effortHours, weight, status, color, note });
    await dashboard.save();
    const assignment = dashboard.assignments[dashboard.assignments.length - 1];
    res.status(201).json({ assignment: toPublic(assignment) });
  } catch (error) {
    console.error("Assignment creation failed:", error);
    res.status(500).json({ message: "Could not add the assignment." });
  }
});

router.patch("/assignments/:assignmentId", async (req: AuthRequest, res) => {
  try {
    const dashboard = await getDashboard(req);
    const assignment = dashboard.assignments.id(req.params.assignmentId);
    if (!assignment) {
      res.status(404).json({ message: "Assignment not found." });
      return;
    }
    if (req.body?.status !== "not started" && req.body?.status !== "in progress" && req.body?.status !== "complete") {
      res.status(400).json({ message: "Invalid assignment status." });
      return;
    }
    assignment.status = req.body.status;
    await dashboard.save();
    res.json({ assignment: toPublic(assignment) });
  } catch (error) {
    console.error("Assignment update failed:", error);
    res.status(500).json({ message: "Could not update the assignment." });
  }
});

router.post("/courses", async (req: AuthRequest, res) => {
  try {
    const { name, code, instructor, grade, color, completed, total } = req.body ?? {};
    if (
      typeof name !== "string" || !name.trim() || name.length > 120 ||
      typeof code !== "string" || !code.trim() || code.length > 30 ||
      typeof instructor !== "string" || !instructor.trim() || instructor.length > 120 ||
      typeof grade !== "number" || !Number.isFinite(grade) || grade < 0 || grade > 100 ||
      !isValidColor(color) ||
      typeof completed !== "number" || !Number.isFinite(completed) || completed < 0 ||
      typeof total !== "number" || !Number.isFinite(total) || total < 0
    ) {
      res.status(400).json({ message: "Course details are incomplete or invalid." });
      return;
    }
    const dashboard = await getDashboard(req);
    const course = dashboard.courses.create({ name: name.trim(), code: code.trim(), instructor: instructor.trim(), grade, letter: letterForGrade(grade), color: color.trim(), completed, total });
    dashboard.courses.push(course);
    await dashboard.save();
    res.status(201).json({ course: toPublic(course) });
  } catch (error) {
    console.error("Course creation failed:", error);
    res.status(500).json({ message: "Could not add the course." });
  }
});

router.patch("/courses/:courseId", async (req: AuthRequest, res) => {
  try {
    const dashboard = await getDashboard(req);
    const course = dashboard.courses.id(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found." });
      return;
    }

    const { name, code, instructor, color, completed, total, grade } = req.body ?? {};

    // ── Validate each accepted field before touching the document ────────────
    if (grade !== undefined) {
      if (typeof grade !== "number" || !Number.isFinite(grade) || grade < 0 || grade > 100) {
        res.status(400).json({ message: "Grade must be a finite number between 0 and 100." });
        return;
      }
    }
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim() || name.length > 120) {
        res.status(400).json({ message: "Course name must be a non-empty string (max 120 chars)." });
        return;
      }
    }
    if (code !== undefined) {
      if (typeof code !== "string" || !code.trim() || code.length > 30) {
        res.status(400).json({ message: "Course code must be a non-empty string (max 30 chars)." });
        return;
      }
    }
    if (instructor !== undefined) {
      if (typeof instructor !== "string" || !instructor.trim() || instructor.length > 120) {
        res.status(400).json({ message: "Instructor name must be a non-empty string (max 120 chars)." });
        return;
      }
    }
    if (color !== undefined && !isValidColor(color)) {
      res.status(400).json({ message: "Color must be a valid hex color (e.g. #ff0000)." });
      return;
    }
    if (completed !== undefined) {
      if (typeof completed !== "number" || !Number.isFinite(completed) || completed < 0) {
        res.status(400).json({ message: "Completed must be a non-negative finite number." });
        return;
      }
    }
    if (total !== undefined) {
      if (typeof total !== "number" || !Number.isFinite(total) || total < 0) {
        res.status(400).json({ message: "Total must be a non-negative finite number." });
        return;
      }
    }

    // Apply validated updates.
    if (grade !== undefined) { course.grade = grade; course.letter = letterForGrade(grade); }
    if (name !== undefined) course.name = name.trim();
    if (code !== undefined) course.code = code.trim();
    if (instructor !== undefined) course.instructor = instructor.trim();
    if (color !== undefined) course.color = color;
    if (completed !== undefined) course.completed = completed;
    if (total !== undefined) course.total = total;

    dashboard.gpa = calculateGpa(dashboard.courses);
    await dashboard.save();
    res.json({ course: toPublic(course), gpa: dashboard.gpa });
  } catch (error) {
    console.error("Course update failed:", error);
    res.status(500).json({ message: "Could not update the course." });
  }
});

router.patch("/metrics", async (req: AuthRequest, res) => {
  try {
    const dashboard = await getDashboard(req);
    if (req.body?.targetGpa !== undefined && (typeof req.body.targetGpa !== "number" || req.body.targetGpa < 0 || req.body.targetGpa > 4)) {
      res.status(400).json({ message: "Target GPA must be between 0 and 4." });
      return;
    }
    if (req.body?.targetGpa !== undefined) dashboard.targetGpa = req.body.targetGpa;
    await dashboard.save();
    res.json({ gpa: dashboard.gpa, targetGpa: dashboard.targetGpa });
  } catch (error) {
    console.error("Dashboard metrics update failed:", error);
    res.status(500).json({ message: "Could not update dashboard metrics." });
  }
});

export default router;
