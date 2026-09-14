import { apiRequest } from "@/lib/api";

export type Assignment = {
  id: number | string;
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
};

export type DashboardAssignment = Assignment;

export type Course = {
  id: number | string;
  name: string;
  code: string;
  instructor: string;
  grade: number;
  letter: string;
  color: string;
  completed: number;
  total: number;
};

export type DashboardCourse = Course;

export type DashboardScheduleItem = {
  id: number | string;
  time: string;
  day: string;
  title: string;
  type: "class" | "study";
  room: string;
  color: string;
  height: string;
};

export type DashboardData = {
  assignments: Assignment[];
  courses: Course[];
  schedule: DashboardScheduleItem[];
  gpa: number;
  targetGpa: number;
};

export type DashboardCourseInput = Omit<Course, "id" | "letter">;

function dashboardRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(`/api/dashboard${path}`, {
    ...options,
    defaultErrorMessage: "Could not update your dashboard.",
  });
}

export function fetchDashboard() {
  return dashboardRequest<DashboardData>("");
}

export function createDashboardAssignment(assignment: Omit<Assignment, "id">) {
  return dashboardRequest<{ assignment: Assignment }>("/assignments", {
    method: "POST",
    body: JSON.stringify(assignment),
  });
}

export function updateDashboardAssignment(id: number | string, status: Assignment["status"]) {
  return dashboardRequest<{ assignment: Assignment }>(`/assignments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function createDashboardCourse(course: DashboardCourseInput) {
  return dashboardRequest<{ course: Course }>("/courses", {
    method: "POST",
    body: JSON.stringify(course),
  });
}

export function updateDashboardCourse(id: number | string, updates: Partial<DashboardCourseInput>) {
  return dashboardRequest<{ course: Course; gpa: number }>(`/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}
