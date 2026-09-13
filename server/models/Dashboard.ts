import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    course: { type: String, required: true, trim: true, maxlength: 120 },
    courseCode: { type: String, required: true, trim: true, maxlength: 30 },
    due: { type: String, required: true },
    dueLabel: { type: String, required: true },
    effort: { type: String, required: true },
    effortHours: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0, max: 100 },
    status: { type: String, enum: ["not started", "in progress", "complete"], default: "not started" },
    color: { type: String, required: true },
    note: { type: String },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    code: { type: String, required: true, trim: true, maxlength: 30 },
    instructor: { type: String, required: true, trim: true, maxlength: 120 },
    grade: { type: Number, required: true, min: 0, max: 100 },
    letter: { type: String, required: true, maxlength: 3 },
    color: { type: String, required: true },
    completed: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const scheduleItemSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    day: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    type: { type: String, enum: ["class", "study"], required: true },
    room: { type: String, required: true, trim: true, maxlength: 120 },
    color: { type: String, required: true },
    height: { type: String, required: true },
  },
  { _id: true }
);

export interface IDashboard extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  assignments: mongoose.Types.DocumentArray<{
    title: string;
    course: string;
    courseCode: string;
    due: string;
    dueLabel: string;
    effort: string;
    effortHours: number;
    weight: number;
    status: "not started" | "in progress" | "complete";
    color: string;
    note?: string;
  }>;
  courses: mongoose.Types.DocumentArray<{
    name: string;
    code: string;
    instructor: string;
    grade: number;
    letter: string;
    color: string;
    completed: number;
    total: number;
  }>;
  schedule: mongoose.Types.DocumentArray<{
    time: string;
    day: string;
    title: string;
    type: "class" | "study";
    room: string;
    color: string;
    height: string;
  }>;
  gpa: number;
  targetGpa: number;
}

const dashboardSchema = new mongoose.Schema<IDashboard>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    assignments: { type: [assignmentSchema], default: [] },
    courses: { type: [courseSchema], default: [] },
    schedule: { type: [scheduleItemSchema], default: [] },
    gpa: { type: Number, default: 0, min: 0, max: 4 },
    targetGpa: { type: Number, default: 0, min: 0, max: 4 },
  },
  { timestamps: true }
);

export const Dashboard = mongoose.model<IDashboard>("Dashboard", dashboardSchema);
