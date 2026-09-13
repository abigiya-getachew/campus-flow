export type DashboardAssignment = {
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

export type DashboardCourse = {
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
  assignments: DashboardAssignment[];
  courses: DashboardCourse[];
  schedule: DashboardScheduleItem[];
  gpa: number;
  targetGpa: number;
};

export type DashboardCourseInput = Omit<DashboardCourse, "id" | "letter">;

const TOKEN_KEY = "campusflow-token";

async function dashboardRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`/api/dashboard${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = (await response.json().catch(() => null)) as (T & { message?: string }) | null;
  if (!response.ok) throw new Error(data?.message ?? "Could not update your dashboard.");
  return data as T;
}

export function fetchDashboard() {
  return dashboardRequest<DashboardData>("");
}

export function createDashboardAssignment(assignment: Omit<DashboardAssignment, "id">) {
  return dashboardRequest<{ assignment: DashboardAssignment }>("/assignments", {
    method: "POST",
    body: JSON.stringify(assignment),
  });
}

export function updateDashboardAssignment(id: number | string, status: DashboardAssignment["status"]) {
  return dashboardRequest<{ assignment: DashboardAssignment }>(`/assignments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function createDashboardCourse(course: DashboardCourseInput) {
  return dashboardRequest<{ course: DashboardCourse }>("/courses", {
    method: "POST",
    body: JSON.stringify(course),
  });
}

export function updateDashboardCourse(id: number | string, updates: Partial<DashboardCourseInput>) {
  return dashboardRequest<{ course: DashboardCourse; gpa: number }>(`/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function updateDashboardMetrics(metrics: { targetGpa?: number }) {
  return dashboardRequest<Pick<DashboardData, "gpa" | "targetGpa">>("/metrics", {
    method: "PATCH",
    body: JSON.stringify(metrics),
  });
}
