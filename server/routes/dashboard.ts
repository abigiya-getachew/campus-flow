import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { Dashboard } from "../models/Dashboard.js";

const router = Router();
router.use(requireAuth);

function userId(req: AuthRequest): string {
  if (!req.userId) throw new Error("Authentication required");
  return req.userId;
}

function serializeDashboard(dashboard: InstanceType<typeof Dashboard>) {
  return {
    assignments: dashboard.assignments.map((item) => ({ id: String(item._id), ...item.toObject() })),
    courses: dashboard.courses.map((item) => ({ id: String(item._id), ...item.toObject() })),
    schedule: dashboard.schedule.map((item) => ({ id: String(item._id), ...item.toObject() })),
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
      typeof weight !== "number" || typeof color !== "string"
    ) {
      res.status(400).json({ message: "Assignment details are incomplete." });
      return;
    }
    const dashboard = await getDashboard(req);
    dashboard.assignments.push({ title: title.trim(), course: course.trim(), courseCode: courseCode.trim(), due, dueLabel, effort, effortHours, weight, status, color, note });
    await dashboard.save();
    const assignment = dashboard.assignments[dashboard.assignments.length - 1];
    res.status(201).json({ assignment: { id: String(assignment._id), ...assignment.toObject() } });
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
    res.json({ assignment: { id: String(assignment._id), ...assignment.toObject() } });
  } catch (error) {
    console.error("Assignment update failed:", error);
    res.status(500).json({ message: "Could not update the assignment." });
  }
});

router.post("/courses", async (req: AuthRequest, res) => {
  try {
    const { name, code, instructor, grade, color, completed, total } = req.body ?? {};
    if (
      typeof name !== "string" || !name.trim() || typeof code !== "string" || !code.trim() ||
      typeof instructor !== "string" || !instructor.trim() || typeof grade !== "number" ||
      grade < 0 || grade > 100 || typeof color !== "string" || !color.trim() ||
      typeof completed !== "number" || completed < 0 || typeof total !== "number" || total < 0
    ) {
      res.status(400).json({ message: "Course details are incomplete." });
      return;
    }
    const dashboard = await getDashboard(req);
    const course = dashboard.courses.create({ name: name.trim(), code: code.trim(), instructor: instructor.trim(), grade, letter: letterForGrade(grade), color: color.trim(), completed, total });
    dashboard.courses.push(course);
    await dashboard.save();
    res.status(201).json({ course: { id: String(course._id), ...course.toObject() } });
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
    const updates = req.body ?? {};
    if (updates.grade !== undefined && (typeof updates.grade !== "number" || updates.grade < 0 || updates.grade > 100)) {
      res.status(400).json({ message: "Grade must be between 0 and 100." });
      return;
    }
    if (updates.grade !== undefined) {
      course.grade = updates.grade;
      course.letter = letterForGrade(updates.grade);
    }
    if (updates.name !== undefined) course.name = updates.name;
    if (updates.code !== undefined) course.code = updates.code;
    if (updates.instructor !== undefined) course.instructor = updates.instructor;
    if (updates.color !== undefined) course.color = updates.color;
    if (updates.completed !== undefined) course.completed = updates.completed;
    if (updates.total !== undefined) course.total = updates.total;
    dashboard.gpa = calculateGpa(dashboard.courses);
    await dashboard.save();
    res.json({ course: { id: String(course._id), ...course.toObject() }, gpa: dashboard.gpa });
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
