/* CampusFlow style reminder: Paper Trail, Electric Ink — editorial hierarchy, warm paper surfaces, mono margin labels, and cobalt reserved for the next move. Keep the interface kind but decisive. */
import { useEffect, useMemo, useState } from "react";
import type { ComponentType, FormEvent } from "react";
import { useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BookMarked,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleHelp,
  Clock3,
  Coffee,
  ExternalLink,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  createDashboardAssignment,
  createDashboardCourse,
  fetchDashboard,
  updateDashboardAssignment,
  updateDashboardCourse,
  type Assignment,
  type Course,
} from "@/lib/dashboardApi";

type View = "overview" | "assignments" | "schedule" | "courses" | "grades" | "planner";
type Status = Assignment["status"];

type IconType = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

const NAV_ITEMS: { id: View; label: string; icon: IconType; section?: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, section: "Workspace" },
  { id: "assignments", label: "Assignments", icon: ListTodo },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "courses", label: "Courses", icon: BookOpen, section: "Academic" },
  { id: "grades", label: "Grades", icon: GraduationCap },
  { id: "planner", label: "Study planner", icon: Sparkles, section: "Focus" },
];

function priorityScore(item: Assignment) {
  const due = new Date(item.due).getTime();
  const today = new Date().getTime();
  const daysAway = Math.max(0, Math.ceil((due - today) / 86400000));
  const urgency = Math.max(1, 8 - daysAway);
  return urgency * 8 + item.weight * 1.5 + item.effortHours * 3 + (item.status === "in progress" ? 30 : 0);
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dashboardDateLabel(signedUpAt?: string) {
  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(today);
  const signupDate = signedUpAt ? new Date(signedUpAt) : today;
  const start = Number.isNaN(signupDate.getTime()) ? today : signupDate;
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const week = Math.max(1, Math.floor((todayDay - startDay) / 604800000) + 1);

  return `${dateLabel} · Week ${String(week).padStart(2, "0")}`;
}

function currentWeekStart() {
  const today = new Date();
  const start = new Date(today);
  const day = today.getDay();
  start.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

  return start;
}

function shortMonthDay(date: Date) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

const classNames = cn;

function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={classNames("flex items-center justify-center rounded-[10px] bg-[#3157e8] font-display text-white", compact ? "h-8 w-8 text-[13px]" : "h-9 w-9 text-[15px]")}>cf</span>
      {!compact && <span className="font-display text-[22px] tracking-[-0.04em] text-white">campusflow</span>}
    </div>
  );
}

function Sidebar({ view, setView, collapsed, setCollapsed, onAdd, assignmentCount }: { view: View; setView: (view: View) => void; collapsed: boolean; setCollapsed: (value: boolean) => void; onAdd: () => void; assignmentCount: number }) {
  return (
    <aside className={classNames("sidebar-noise fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#374155] text-[#f4f3ed] transition-[width] duration-200 ease-out", collapsed ? "w-[76px]" : "w-[246px]")}>
      <div className={classNames("flex h-[76px] items-center border-b border-[#374155]", collapsed ? "justify-center" : "justify-between px-5")}>
        <AppLogo compact={collapsed} />
        {!collapsed && <button onClick={() => setCollapsed(true)} className="focus-ring rounded-md p-2 text-[#9aa4b6] transition hover:bg-[#2c3548] hover:text-white" aria-label="Collapse sidebar"><PanelLeftClose size={17} /></button>}
      </div>
      {collapsed && <button onClick={() => setCollapsed(false)} className="focus-ring mx-auto mt-4 rounded-md p-2 text-[#9aa4b6] transition hover:bg-[#2c3548] hover:text-white" aria-label="Expand sidebar"><PanelLeftOpen size={17} /></button>}
      <nav className={classNames("flex-1 space-y-1 py-6", collapsed ? "px-3" : "px-3.5")} aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <div key={item.id}>
            {item.section && !collapsed && <div className="mb-2 mt-4 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#758095]">{item.section}</div>}
            <button onClick={() => setView(item.id)} className={classNames("focus-ring group flex w-full items-center rounded-[9px] py-2.5 text-left text-[13px] font-medium transition duration-150", collapsed ? "justify-center px-0" : "gap-3 px-3", view === item.id ? "bg-[#f4f3ed] text-[#202838] shadow-[0_2px_10px_rgba(0,0,0,.12)]" : "text-[#9aa4b6] hover:bg-[#2c3548] hover:text-white")} aria-current={view === item.id ? "page" : undefined} title={collapsed ? item.label : undefined}>
              <item.icon size={17} strokeWidth={view === item.id ? 2.4 : 1.8} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.id === "assignments" && <span className={classNames("ml-auto rounded-full px-1.5 py-0.5 font-mono text-[10px]", view === item.id ? "bg-[#dfe6ff] text-[#3157e8]" : "bg-[#374155] text-[#9aa4b6]")}>{assignmentCount}</span>}
            </button>
          </div>
        ))}
      </nav>
      <div className={classNames("border-t border-[#374155] py-4", collapsed ? "px-3" : "px-3.5")}>
        {!collapsed && <div className="mb-3 rounded-[10px] bg-[#2c3548] p-3.5">
          <div className="mb-2 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#aab3c4]">Week at a glance</span><TrendingUp size={14} className="text-[#8fa7ff]" /></div>
          <div className="mb-2 flex items-end justify-between"><span className="font-display text-[24px] text-white">68%</span><span className="font-mono text-[10px] text-[#9aa4b6]">capacity used</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#1f2738]"><div className="h-full w-[68%] rounded-full bg-[#8fa7ff]" /></div>
        </div>}
        <button onClick={() => toast("Settings will be available in a future CampusFlow release.")} className={classNames("focus-ring flex w-full items-center rounded-[9px] py-2.5 text-[13px] text-[#9aa4b6] transition hover:bg-[#2c3548] hover:text-white", collapsed ? "justify-center" : "gap-3 px-3")} title={collapsed ? "Settings" : undefined}><Settings2 size={17} strokeWidth={1.8} />{!collapsed && "Settings"}</button>
        {!collapsed && <div className="mt-3 flex items-center gap-2 px-3 text-[10px] text-[#68758d]"><CircleHelp size={13} /> <span>Need a hand?</span><button onClick={() => toast("Tip: start with the cobalt recommendation at the top of Overview.")} className="ml-auto underline underline-offset-2 hover:text-[#d9deea]">Guide</button></div>}
      </div>
    </aside>
  );
}

function Topbar({ view, onAdd, onMenu, sidebarCollapsed }: { view: View; onAdd: () => void; onMenu: () => void; sidebarCollapsed: boolean }) {
  const title = NAV_ITEMS.find((item) => item.id === view)?.label ?? "Overview";
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    toast("Logged out successfully");
    navigate("/");
  };

  return (
    <header className={classNames("sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e5e4de] bg-[#f6f5f0]/90 px-5 backdrop-blur-xl sm:px-8", sidebarCollapsed ? "lg:pl-[108px]" : "lg:pl-[278px]")}>
      <div className="flex items-center gap-3"><button className="focus-ring rounded-md p-2 text-[#596274] lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button><div className="flex items-center gap-2 sm:hidden"><span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#3157e8] font-display text-[12px] text-white">cf</span><span className="font-display text-[18px] tracking-[-.04em] text-[#1e2433]">campusflow</span></div><div className="hidden font-mono text-[10px] uppercase tracking-[.18em] text-[#8a909b] sm:block">Workspace <span className="px-1 text-[#b8bcc4]">/</span> <span className="text-[#313847]">{title}</span></div></div>
      <div className="flex items-center gap-2 sm:gap-4">
        <label className="group hidden items-center gap-2 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[#878d9a] transition focus-within:border-[#d8dce8] focus-within:bg-white sm:flex"><Search size={16} /><input className="w-28 bg-transparent text-[12px] text-[#313847] outline-none placeholder:text-[#a1a6b0] md:w-40" placeholder="Search your work" aria-label="Search your work" /></label>
        <button onClick={() => toast("You’re all caught up — no new alerts.")} className="focus-ring relative rounded-lg p-2 text-[#656d7c] transition hover:bg-white hover:text-[#3157e8]" aria-label="Notifications"><Bell size={18} strokeWidth={1.8} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#db8b62]" /></button>
        <button onClick={onAdd} className="focus-ring flex items-center gap-2 rounded-[8px] bg-[#3157e8] px-3 py-2 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(49,87,232,.18)] transition duration-150 hover:-translate-y-0.5 hover:bg-[#2549d5] active:translate-y-0 active:scale-[.98] sm:px-3.5"><Plus size={15} strokeWidth={2.5} /><span className="hidden sm:inline">Add new</span></button>
        <div className="hidden h-8 w-px bg-[#e1e0da] sm:block" />
        <button onClick={handleLogout} className="focus-ring flex items-center gap-2 rounded-lg py-1.5 text-left transition hover:bg-white sm:pr-1"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#db8b62] font-display text-sm text-[#fffefa]">{user?.name?.charAt(0).toUpperCase() || "U"}</span><span className="hidden text-left sm:block"><span className="block text-[12px] font-semibold text-[#313847]">{user?.name || "User"}</span><span className="block font-mono text-[9px] uppercase tracking-[.12em] text-[#9297a0]">Student</span></span><ChevronDown size={14} className="hidden text-[#9297a0] sm:block" /></button>
      </div>
    </header>
  );
}

function PageIntro({ kicker, title, subtitle, action }: { kicker: string; title: React.ReactNode; subtitle: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="section-kicker mb-3">{kicker}</div><h1 className="font-display text-[30px] leading-[1.1] tracking-[-.04em] text-[#1e2433] sm:text-[36px]">{title}</h1><p className="mt-3 max-w-xl text-[14px] leading-6 text-[#747b88]">{subtitle}</p></div>{action}</div>;
}

function WhyChip({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "terracotta" | "sage" | "amber" }) {
  const tones = { blue: "bg-[#e7edff] text-[#3157e8]", terracotta: "bg-[#f8e7de] text-[#a45d3d]", sage: "bg-[#e4efe7] text-[#4e7a5f]", amber: "bg-[#fff2d4] text-[#856a20]" };
  return <span className={classNames("inline-flex items-center rounded-full px-2 py-1 font-mono text-[10px] font-medium", tones[tone])}>{children}</span>;
}

function StatusMark({ status, onClick }: { status: Status; onClick?: () => void }) {
  const complete = status === "complete";
  return <button onClick={onClick} className={classNames("focus-ring flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition duration-150", complete ? "border-[#81a993] bg-[#81a993] text-white" : status === "in progress" ? "border-[#3157e8] bg-[#e7edff] text-[#3157e8]" : "border-[#c8cbd0] bg-transparent text-transparent hover:border-[#3157e8] hover:bg-[#e7edff]")} aria-label={complete ? "Mark as not started" : "Mark assignment complete"}>{complete ? <Check size={13} strokeWidth={3} /> : status === "in progress" ? <span className="h-1.5 w-1.5 rounded-full bg-[#3157e8]" /> : <Circle size={12} strokeWidth={1.5} />}</button>;
}

function Overview({ assignments, courses, gpa, targetGpa, onToggle, setView, onAdd }: { assignments: Assignment[]; courses: Course[]; gpa: number; targetGpa: number; onToggle: (id: number | string) => void; setView: (view: View) => void; onAdd: () => void }) {
  const openAssignments = assignments.filter((item) => item.status !== "complete");
  const gpaProgress = targetGpa > 0 ? Math.min(100, (gpa / targetGpa) * 100) : 0;
  const next = [...openAssignments].sort((a, b) => priorityScore(b) - priorityScore(a))[0];
  const done = assignments.filter((item) => item.status === "complete").length;
  const weekHours = openAssignments.reduce((sum, item) => sum + item.effortHours, 0);
  const dayLabel = next?.due === dateKey(new Date()) ? "today" : next?.due === dateKey(new Date(Date.now() + 86400000)) ? "tomorrow" : `due ${next?.dueLabel}`;
  const { user } = useAuth();
  const firstName = user?.name.trim().split(/\s+/)[0] || "User";
  const dateLabel = dashboardDateLabel(user?.createdAt);
  if (!next) return <>
    <PageIntro kicker={dateLabel} title={<>Good morning, {firstName}<span className="text-[#3157e8]">.</span></>} subtitle="Your workspace is ready. Add your first piece of academic data and CampusFlow will turn it into a useful weekly view." action={<button onClick={onAdd} className="focus-ring flex items-center gap-2 self-start rounded-lg bg-[#3157e8] px-3.5 py-2.5 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(49,87,232,.16)]"><Plus size={15} /> Add assignment</button>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
      <section className="paper-card rounded-[14px] border border-[#e5e4de] p-6 sm:p-7">
        <div className="flex items-start gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e7edff] text-[#3157e8]"><ListTodo size={19} /></span><div><div className="section-kicker mb-2">First step</div><h2 className="font-display text-[27px] tracking-[-.04em] text-[#1e2433]">Build your work ledger</h2><p className="mt-2 max-w-lg text-[13px] leading-6 text-[#747b88]">Add an assignment with its course, due date, effort, and weight. Your priorities and study plan will appear here automatically.</p></div></div>
        <div className="mt-7 flex flex-wrap gap-3"><button onClick={onAdd} className="focus-ring flex items-center gap-2 rounded-[8px] bg-[#3157e8] px-4 py-2.5 text-[12px] font-semibold text-white"><Plus size={15} /> Add your first assignment</button><button onClick={() => setView("courses")} className="focus-ring flex items-center gap-2 rounded-[8px] border border-[#dfe1dc] bg-[#fffefa] px-4 py-2.5 text-[12px] font-semibold text-[#3157e8]"><BookOpen size={15} /> Set up courses</button></div>
      </section>
      <section className="paper-card rounded-[14px] border border-[#e5e4de] p-6"><div className="section-kicker mb-2">Academic snapshot</div><h2 className="font-display text-[24px] tracking-[-.04em] text-[#1e2433]">Nothing logged yet</h2><div className="mt-6 space-y-4 border-t border-[#ecebe5] pt-5"><div className="flex items-center justify-between text-[12px]"><span className="text-[#747b88]">Assignments</span><span className="font-mono text-[#313847]">0</span></div><div className="flex items-center justify-between text-[12px]"><span className="text-[#747b88]">Courses</span><span className="font-mono text-[#313847]">{courses.length}</span></div><div className="flex items-center justify-between text-[12px]"><span className="text-[#747b88]">Current GPA</span><span className="font-mono text-[#313847]">{gpa ? gpa.toFixed(2) : "—"}</span></div></div></section>
    </div>
    <section className="mt-5 grid gap-5 sm:grid-cols-3"><button onClick={onAdd} className="paper-card rounded-[14px] border border-dashed border-[#cfd5e5] p-5 text-left transition hover:border-[#3157e8]"><div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#e7edff] text-[#3157e8]"><Plus size={16} /></div><div className="text-[13px] font-semibold text-[#313847]">Add an assignment</div><p className="mt-1 text-[11px] leading-5 text-[#878d9a]">Start tracking your next deadline.</p></button><button onClick={() => setView("courses")} className="paper-card rounded-[14px] border border-dashed border-[#cfd5e5] p-5 text-left transition hover:border-[#3157e8]"><div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#e4efe7] text-[#4e7a5f]"><BookOpen size={16} /></div><div className="text-[13px] font-semibold text-[#313847]">Add your courses</div><p className="mt-1 text-[11px] leading-5 text-[#878d9a]">Keep grades and assignments connected.</p></button><button onClick={() => setView("schedule")} className="paper-card rounded-[14px] border border-dashed border-[#cfd5e5] p-5 text-left transition hover:border-[#3157e8]"><div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#fff2d4] text-[#856a20]"><CalendarDays size={16} /></div><div className="text-[13px] font-semibold text-[#313847]">Plan your week</div><p className="mt-1 text-[11px] leading-5 text-[#878d9a]">Your schedule will live here once connected.</p></button></section>
  </>;
  return <>
    <PageIntro kicker={dateLabel} title={<>Good morning, {firstName}<span className="text-[#3157e8]">.</span></>} subtitle="Your week is full, but it is still workable. Here’s the move that protects your grades and keeps Friday lighter." action={<button onClick={() => setView("planner")} className="focus-ring group flex items-center gap-2 self-start rounded-lg border border-[#dfe1dc] bg-[#fffefa] px-3.5 py-2.5 text-[12px] font-semibold text-[#3157e8] shadow-[0_2px_8px_rgba(43,48,63,.03)] transition hover:-translate-y-0.5 hover:border-[#c6d0f5] md:self-auto">Open study planner <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></button>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,.82fr)]">
      <section className="paper-card relative overflow-hidden rounded-[14px] border border-[#e5e4de] p-6 sm:p-7">
        <div className="relative z-10 max-w-[510px]"><div className="mb-5 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3157e8] text-white"><Target size={14} /></span><span className="section-kicker text-[#3157e8]">Next move</span><span className="ml-1 rounded-full bg-[#fff2d4] px-2 py-1 font-mono text-[10px] font-medium text-[#856a20]">{dayLabel}</span></div><h2 className="font-display text-[27px] leading-[1.12] tracking-[-.035em] text-[#1e2433] sm:text-[32px]">Finish your <span className="relative whitespace-nowrap after:absolute after:bottom-[-4px] after:left-0 after:h-[5px] after:w-full after:rounded-full after:bg-[#8fa7ff]/50">critique brief</span></h2><p className="mt-3 max-w-md text-[14px] leading-6 text-[#646c7b]">You’re already in progress. A focused 90-minute pass gets the highest-weight item moving before Thursday’s problem set.</p><div className="mt-3 flex items-center gap-2 text-[11px] text-[#596274]"><span className="font-mono text-[9px] uppercase tracking-[.14em] text-[#3157e8]">Why this one</span><span className="h-px w-8 bg-[#9eb0f7]" /><span>due soon + 25% weight + momentum</span></div><div className="mt-5 flex flex-wrap gap-2"><WhyChip>due Friday</WhyChip><WhyChip>25% of grade</WhyChip><WhyChip tone="terracotta">90 min effort</WhyChip></div><div className="mt-7 flex flex-wrap items-center gap-4"><button onClick={() => onToggle(next.id)} className="focus-ring rounded-[8px] bg-[#3157e8] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_4px_10px_rgba(49,87,232,.16)] transition hover:-translate-y-0.5 hover:bg-[#2549d5] active:scale-[.98]">{next.status === "in progress" ? "Mark complete" : "Start assignment"}</button><button onClick={() => setView("assignments")} className="focus-ring text-[12px] font-semibold text-[#596274] underline decoration-[#c8cbd0] underline-offset-4 transition hover:text-[#3157e8]">View details</button></div></div><div className="absolute bottom-5 right-6 hidden rotate-[-5deg] font-mono text-[10px] uppercase tracking-[.15em] text-[#88909d] xl:block">why this one?</div>
      </section>
      <section className="paper-card rounded-[14px] border border-[#e5e4de] p-6"><div className="mb-5 flex items-start justify-between"><div><div className="section-kicker mb-2">Grade signal</div><h2 className="font-display text-[25px] tracking-[-.04em] text-[#1e2433]">{gpa > 0 ? "You’re on track" : "No grades yet"}</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4efe7] text-[#4e7a5f]"><TrendingUp size={18} /></div></div><div className="mb-4 flex items-end gap-2"><span className="font-mono text-[38px] font-medium leading-none text-[#1e2433]">{gpa.toFixed(2)}</span><span className="mb-1 text-[12px] text-[#747b88]">GPA</span></div><div className="mb-4 h-2 overflow-hidden rounded-full bg-[#ecece7]"><div className="h-full rounded-full bg-[#81a993]" style={{ width: `${gpaProgress}%` }} /></div><div className="flex items-center justify-between border-t border-[#ece4d8] pt-4 text-[12px]"><span className="text-[#747b88]">Target: {targetGpa.toFixed(2)}</span><span className="font-semibold text-[#4e7a5f]">{Math.max(0, targetGpa - gpa).toFixed(2)} to go</span></div><button onClick={() => setView("grades")} className="focus-ring mt-5 flex items-center gap-1 text-[12px] font-semibold text-[#3157e8]">See grade breakdown <ChevronRight size={14} /></button></section>
    </div>
    <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,.82fr)]">
      <section className="paper-card rounded-[14px] border border-[#e5e4de] p-6 sm:p-7"><div className="mb-5 flex items-end justify-between"><div><div className="section-kicker mb-2">Priority ledger</div><h2 className="font-display text-[25px] tracking-[-.04em] text-[#1e2433]">What needs your attention</h2></div><button onClick={() => setView("assignments")} className="focus-ring flex items-center gap-1 text-[12px] font-semibold text-[#3157e8]">All assignments <ChevronRight size={14} /></button></div><div className="divide-y divide-[#ecebe5]">{[...openAssignments].sort((a,b) => priorityScore(b)-priorityScore(a)).slice(0,4).map((item, index) => <div key={item.id} className="group flex items-center gap-3 py-3.5 first:pt-1 last:pb-1"><StatusMark status={item.status} onClick={() => onToggle(item.id)} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="truncate text-[13px] font-semibold text-[#303747]">{item.title}</span>{index === 0 && <span className="font-mono text-[9px] uppercase tracking-[.13em] text-[#3157e8]">recommended</span>}</div><div className="mt-1 flex items-center gap-2 text-[11px] text-[#878d9a]"><span style={{ color: item.color }} className="font-mono font-semibold">{item.courseCode}</span><span>·</span><span>{item.dueLabel}</span></div></div><div className="hidden items-center gap-2 sm:flex"><WhyChip tone={index === 0 ? "blue" : index === 1 ? "terracotta" : "sage"}>{item.weight}% weight</WhyChip><span className="w-[54px] text-right font-mono text-[10px] text-[#9298a3]">{item.effort}</span></div><button onClick={() => toast(`${item.title} is ${item.status}.`)} className="focus-ring rounded-md p-1.5 text-[#b0b4bc] opacity-0 transition group-hover:opacity-100 hover:bg-[#f0f1f4] hover:text-[#3157e8]" aria-label={`More details for ${item.title}`}><MoreHorizontal size={16} /></button></div>)}</div><div className="mt-5 flex items-center justify-between border-t border-[#ecebe5] pt-4"><span className="font-mono text-[10px] uppercase tracking-[.13em] text-[#9298a3]">{done} of {assignments.length} complete</span><div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#ecece7]"><div className="h-full rounded-full bg-[#3157e8]" style={{ width: `${(done / assignments.length) * 100}%` }} /></div></div></section>
      <section className="paper-card rounded-[14px] border border-[#e5e4de] p-6"><div className="section-kicker mb-2">This week</div><div className="flex items-end justify-between"><h2 className="font-display text-[25px] tracking-[-.04em] text-[#1e2433]">A workable load</h2><span className="font-mono text-[11px] text-[#747b88]">{weekHours.toFixed(1)}h open</span></div><div className="mt-6"><div className="mb-2 flex justify-between text-[12px]"><span className="text-[#747b88]">Planned capacity</span><span className="font-semibold text-[#313847]">17 / 25 hrs</span></div><div className="h-3 overflow-hidden rounded-full bg-[#ecece7]"><div className="relative h-full w-[68%] rounded-full bg-[#3157e8] after:absolute after:right-0 after:top-0 after:h-full after:w-1 after:bg-[#fffefa]/60" /></div><div className="mt-2 flex justify-between font-mono text-[10px] text-[#9298a3]"><span>0h</span><span>8h free</span></div></div><div className="mt-7 space-y-3 border-t border-[#ecebe5] pt-5"><div className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-[#f8e7de] text-[#a45d3d]"><Clock3 size={13} /></span><div><div className="text-[12px] font-semibold text-[#313847]">One squeeze point</div><p className="mt-0.5 text-[11px] leading-5 text-[#858c98]">Tuesday is full. The planner moved your problem set to Wednesday.</p></div></div><div className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-[#e4efe7] text-[#4e7a5f]"><Coffee size={13} /></span><div><div className="text-[12px] font-semibold text-[#313847]">2 open focus blocks</div><p className="mt-0.5 text-[11px] leading-5 text-[#858c98]">Monday 11:00 and Friday 14:00 are still available.</p></div></div></div><button onClick={() => setView("schedule")} className="focus-ring mt-6 flex items-center gap-1 text-[12px] font-semibold text-[#3157e8]">View week <ChevronRight size={14} /></button></section>
    </div>
    <section className="mt-7 paper-card overflow-hidden rounded-[14px] border border-[#e5e4de]"><div className="flex items-center justify-between border-b border-[#ecebe5] px-6 py-5 sm:px-7"><div><div className="section-kicker mb-2">Course pulse</div><h2 className="font-display text-[25px] tracking-[-.04em] text-[#1e2433]">Your semester at a glance</h2></div><button onClick={() => setView("courses")} className="focus-ring flex items-center gap-1 text-[12px] font-semibold text-[#3157e8]">Manage courses <ChevronRight size={14} /></button></div><div className="grid divide-y divide-[#ecebe5] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">{courses.map(course => <div className="p-5 sm:p-6" key={course.id}><div className="mb-4 flex items-center justify-between"><span className="h-2.5 w-2.5 rounded-full" style={{ background: course.color }} /><span className="font-mono text-[11px] text-[#9298a3]">{course.code}</span></div><div className="text-[13px] font-semibold text-[#313847]">{course.name}</div><div className="mt-3 flex items-end justify-between"><span className="font-mono text-[26px] leading-none text-[#1e2433]">{course.grade}%</span><span className="font-mono text-[12px] font-semibold text-[#747b88]">{course.letter}</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#ecece7]"><div className="h-full rounded-full" style={{ width: `${course.grade}%`, background: course.color }} /></div></div>)}</div></section>
  </>;
}

function AssignmentsPage({ assignments, onToggle, onAdd }: { assignments: Assignment[]; onToggle: (id: number | string) => void; onAdd: () => void }) {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const list = useMemo(() => [...assignments].filter(item => filter === "all" || item.status === filter).sort((a,b) => priorityScore(b)-priorityScore(a)), [assignments, filter]);
  return <><PageIntro kicker="Work ledger" title="Assignments" subtitle="Everything due, ranked by the context that matters: time, effort, and grade weight." action={<button onClick={onAdd} className="focus-ring flex items-center gap-2 self-start rounded-[8px] bg-[#3157e8] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#2549d5] md:self-auto"><Plus size={15} /> Add assignment</button>} /><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-1 rounded-lg bg-[#ebece8] p-1">{(["all", "not started", "in progress", "complete"] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={classNames("focus-ring rounded-md px-3 py-1.5 text-[11px] font-semibold capitalize transition", filter === value ? "bg-[#fffefa] text-[#3157e8] shadow-sm" : "text-[#747b88] hover:text-[#313847]")}>{value}</button>)}</div><div className="font-mono text-[10px] uppercase tracking-[.12em] text-[#9298a3]">{list.length} items · ranked by priority</div></div><section className="paper-card overflow-hidden rounded-[14px] border border-[#e5e4de]"><div className="grid grid-cols-[minmax(0,1fr)_110px_92px_96px] gap-4 border-b border-[#ecebe5] px-5 py-3.5 font-mono text-[10px] uppercase tracking-[.14em] text-[#9298a3] sm:px-7"><span>Assignment</span><span>Due</span><span>Weight</span><span>Status</span></div><div className="divide-y divide-[#ecebe5]">{list.map((item, index) => <div key={item.id} className={classNames("grid grid-cols-[minmax(0,1fr)_110px_92px_96px] items-center gap-4 px-5 py-5 transition hover:bg-[#fbfaf6] sm:px-7", item.due < dateKey(new Date()) && item.status !== "complete" && "bg-[#fffaf7]")}><div className="flex min-w-0 items-center gap-3"><StatusMark status={item.status} onClick={() => onToggle(item.id)} /><div className="min-w-0"><div className="flex items-center gap-2"><span className={classNames("truncate text-[13px] font-semibold", item.status === "complete" ? "text-[#949aa5] line-through" : "text-[#313847]")}>{item.title}</span>{index === 0 && item.status !== "complete" && <span className="hidden rounded bg-[#e7edff] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[.12em] text-[#3157e8] sm:inline">next</span>}</div><div className="mt-1 flex items-center gap-2 text-[11px] text-[#8b919c]"><span className="font-mono font-medium" style={{ color: item.color }}>{item.courseCode}</span><span>·</span><span>{item.effort}</span></div></div></div><div className={classNames("text-[12px]", item.due < dateKey(new Date()) && item.status !== "complete" ? "font-semibold text-[#bb4c42]" : "text-[#5f6776]")}>{item.due < dateKey(new Date()) && item.status !== "complete" ? "Overdue" : item.dueLabel}</div><div><WhyChip tone={item.weight >= 20 ? "blue" : item.weight >= 15 ? "terracotta" : "sage"}>{item.weight}%</WhyChip></div><div className="flex items-center gap-1.5 text-[11px] text-[#747b88]"><span className={classNames("h-1.5 w-1.5 rounded-full", item.status === "complete" ? "bg-[#81a993]" : item.status === "in progress" ? "bg-[#3157e8]" : "bg-[#c8cbd0]")} /> <span className="hidden capitalize sm:inline">{item.status}</span></div></div>)}{list.length === 0 && <div className="px-7 py-16 text-center"><FileText className="mx-auto mb-3 text-[#c2c5ca]" size={26} /><p className="text-[13px] font-semibold text-[#596274]">No assignments in this view.</p><p className="mt-1 text-[12px] text-[#9298a3]">Try another filter or add something new.</p></div>}</div></section><div className="mt-5 flex items-start gap-3 rounded-[10px] border border-[#f0dbcd] bg-[#fffaf7] p-4 text-[12px] text-[#76594d]"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#db8b62]" /><p><strong className="font-semibold text-[#5f463b]">How ranking works.</strong> CampusFlow combines how soon an item is due, how much it affects your grade, and how long it will take. In-progress work gets a small boost so momentum is not lost.</p></div></>;
}

function SchedulePage({ schedule, setView }: { schedule: Array<{ time: string; day: string; title: string; type: "class" | "study"; room: string; color: string; height: string }>; setView: (view: View) => void }) {
  const SCHEDULE = schedule;
  const weekStart = currentWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const days = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return `${new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date).toUpperCase()} ${String(date.getDate()).padStart(2, "0")}`;
  });
  const weekRange = `${shortMonthDay(weekStart)} - ${shortMonthDay(weekEnd)}`;
  const todayDay = new Date().getDay();
  const currentDayIndex = todayDay >= 1 && todayDay <= 5 ? todayDay - 1 : -1;
  return <><PageIntro kicker="Weekly rhythm" title="Schedule" subtitle="A clear view of your fixed commitments and the study blocks CampusFlow found around them." action={<div className="flex items-center gap-2 self-start rounded-lg border border-[#dfe1dc] bg-[#fffefa] px-3 py-2 font-mono text-[11px] text-[#596274] md:self-auto"><ChevronRight size={14} className="rotate-180" /> {weekRange} <ChevronRight size={14} /></div>} /><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]"><section className="paper-card overflow-hidden rounded-[14px] border border-[#e5e4de]"><div className="grid grid-cols-[62px_repeat(5,minmax(100px,1fr))] border-b border-[#ecebe5]"><div className="border-r border-[#ecebe5] p-4" />{days.map((day, i) => <div key={day} className={classNames("border-r border-[#ecebe5] p-4 last:border-0", i === currentDayIndex && "bg-[#f8faff]")}><div className="font-mono text-[10px] tracking-[.12em] text-[#9298a3]">{day.split(" ")[0]}</div><div className={classNames("mt-1 font-display text-[22px] tracking-[-.04em]", i === currentDayIndex ? "text-[#3157e8]" : "text-[#313847]")}>{day.split(" ")[1]}</div></div>)}</div><div className="relative grid grid-cols-[62px_repeat(5,minmax(100px,1fr))] overflow-x-auto"><div className="min-h-[470px] border-r border-[#ecebe5]">{["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map(time => <div className="h-[78px] border-b border-dashed border-[#eeeee9] px-3 pt-2 font-mono text-[9px] text-[#a1a6ae]" key={time}>{time}</div>)}</div>{[0,1,2,3,4].map(dayIndex => <div className={classNames("relative min-h-[470px] border-r border-[#ecebe5] last:border-0", dayIndex === currentDayIndex && "bg-[#f8faff]/70")} key={dayIndex}>{[0,1,2,3,4,5].map(row => <div className="h-[78px] border-b border-dashed border-[#eeeee9]" key={row} />)}{SCHEDULE.filter(item => ["MON","TUE","WED","THU","FRI"][dayIndex] === item.day).map(item => <div key={item.title} className={classNames("absolute left-2 right-2 overflow-hidden rounded-[7px] border-l-[3px] p-2 shadow-[0_2px_6px_rgba(43,48,63,.06)]", item.height, item.type === "study" ? "bg-[#e7edff]" : "bg-[#fffefa]")} style={{ top: `${(Number(item.time.split(":")[0]) - 8) * 39 + (Number(item.time.split(":")[1]) / 60) * 39}px`, borderLeftColor: item.color }}><div className="truncate text-[10px] font-semibold text-[#313847]">{item.title}</div><div className="mt-1 truncate font-mono text-[9px] text-[#7d8593]">{item.room}</div></div>)}</div>)}</div></section><aside className="space-y-5"><section className="paper-card rounded-[14px] border border-[#e5e4de] p-6"><div className="section-kicker mb-2">Schedule signal</div><h2 className="font-display text-[24px] tracking-[-.04em] text-[#1e2433]">You have room.</h2><p className="mt-3 text-[13px] leading-5 text-[#747b88]">Two open blocks are enough to cover your highest-priority work without cramming.</p><div className="mt-5 space-y-3 border-t border-[#ecebe5] pt-5"><div className="flex items-center justify-between"><span className="text-[12px] text-[#747b88]">Fixed commitments</span><span className="font-mono text-[12px] font-medium text-[#313847]">11h</span></div><div className="flex items-center justify-between"><span className="text-[12px] text-[#747b88]">Available focus time</span><span className="font-mono text-[12px] font-medium text-[#3157e8]">8h</span></div><div className="flex items-center justify-between"><span className="text-[12px] text-[#747b88]">Open tasks</span><span className="font-mono text-[12px] font-medium text-[#a45d3d]">7.8h</span></div></div></section><section className="rounded-[14px] border border-[#d8e1ff] bg-[#eef2ff] p-6"><div className="flex items-start gap-3"><Sparkles size={17} className="mt-0.5 text-[#3157e8]" /><div><div className="section-kicker text-[#3157e8]">Planner note</div><p className="mt-2 text-[13px] leading-5 text-[#3c4a78]">Wednesday at 15:00 is the best fit for Problem set 04: protected 2-hour block, no class conflict.</p><button onClick={() => setView("planner")} className="focus-ring mt-4 flex items-center gap-1 text-[12px] font-semibold text-[#3157e8]">Review plan <ChevronRight size={14} /></button></div></div></section></aside></div></>;
}

function CoursesPage({ courses, onAdd }: { courses: Course[]; setView: (view: View) => void; onAdd: () => void }) {
  return <><PageIntro kicker="Academic context" title="Courses" subtitle="These courses and grades come from your dashboard data." action={<button onClick={onAdd} className="focus-ring flex items-center gap-2 self-start rounded-[8px] bg-[#3157e8] px-4 py-2.5 text-[12px] font-semibold text-white"><Plus size={15} /> Add course</button>} /><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{courses.length ? courses.map(course => <section key={course.id} className="paper-card rounded-[14px] border border-[#e5e4de] p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(43,48,63,.08)]"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-[10px] text-white" style={{ background: course.color }}><BookMarked size={18} /></span><button onClick={() => toast(`${course.name} options`)} className="focus-ring rounded-md p-1.5 text-[#a4a9b2] hover:bg-[#f0f1f4] hover:text-[#3157e8]" aria-label={`More options for ${course.name}`}><MoreHorizontal size={17} /></button></div><div className="mt-6 font-mono text-[10px] uppercase tracking-[.13em] text-[#9298a3]">{course.code}</div><h2 className="mt-2 font-display text-[24px] leading-tight tracking-[-.04em] text-[#1e2433]">{course.name}</h2><p className="mt-2 text-[12px] text-[#747b88]">{course.instructor}</p><div className="mt-6 flex items-end justify-between border-t border-[#ecebe5] pt-4"><div><div className="font-mono text-[28px] leading-none text-[#1e2433]">{course.grade}%</div><div className="mt-1 text-[11px] text-[#9298a3]">current grade</div></div><span className="font-mono text-[14px] font-semibold" style={{ color: course.color }}>{course.letter}</span></div><div className="mt-5"><div className="mb-2 flex justify-between font-mono text-[9px] uppercase tracking-[.1em] text-[#9298a3]"><span>Progress</span><span>{course.completed}/{course.total}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#ecece7]"><div className="h-full rounded-full" style={{ width: `${course.total ? (course.completed / course.total) * 100 : 0}%`, background: course.color }} /></div></div></section>) : <section className="paper-card rounded-[14px] border border-[#e5e4de] p-6"><p className="text-[13px] text-[#747b88]">No courses have been added yet.</p></section>}</div></>;
}

function GradesPage({ courses, gpa, targetGpa, onUpdateGrade }: { courses: Course[]; gpa: number; targetGpa: number; onUpdateGrade: (course: Course) => void }) {
  const averageGrade = courses.length ? courses.reduce((sum, course) => sum + course.grade, 0) / courses.length : 0;
  const gpaProgress = Math.min(100, (gpa / 4) * 100);
  const targetLabel = targetGpa > 0 ? targetGpa.toFixed(2) : "not set";
  const loggedGrades = courses.filter((course) => course.grade > 0).length;
  return <><PageIntro kicker="Grade tracking" title="Grades" subtitle="See the current signal, the weight behind it, and where one focused session could make the biggest difference." action={<button onClick={() => courses[0] ? onUpdateGrade(courses[0]) : toast("Add a course before logging grades.")} className="focus-ring flex items-center gap-2 self-start rounded-[8px] border border-[#dfe1dc] bg-[#fffefa] px-4 py-2.5 text-[12px] font-semibold text-[#3157e8] md:self-auto"><PenLine size={15} /> Log a grade</button>} /><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="paper-card rounded-[14px] border border-[#e5e4de] p-6 sm:p-7"><div className="flex items-start justify-between"><div><div className="section-kicker mb-2">Current standing</div><h2 className="font-display text-[26px] tracking-[-.04em] text-[#1e2433]">Estimated GPA</h2></div><div className="rounded-full bg-[#e4efe7] px-2.5 py-1 font-mono text-[10px] font-medium text-[#4e7a5f]">{courses.length} courses</div></div><div className="mt-8 flex items-end gap-4"><span className="font-mono text-[64px] leading-none tracking-[-.08em] text-[#1e2433]">{gpa.toFixed(2)}</span><span className="mb-2 text-[13px] text-[#747b88]">/ 4.00</span></div><div className="mt-7 h-3 overflow-hidden rounded-full bg-[#ecece7]"><div className="h-full rounded-full bg-[#3157e8]" style={{ width: `${gpaProgress}%` }} /></div><div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[.12em] text-[#9298a3]"><span>Current</span><span>Target {targetLabel}</span></div><div className="mt-8 grid gap-3 border-t border-[#ecebe5] pt-5 sm:grid-cols-3"><div><div className="font-mono text-[20px] text-[#1e2433]">{Math.round(averageGrade)}%</div><div className="mt-1 text-[11px] text-[#9298a3]">average grade</div></div><div><div className="font-mono text-[20px] text-[#1e2433]">{courses.length}</div><div className="mt-1 text-[11px] text-[#9298a3]">courses tracked</div></div><div><div className="font-mono text-[20px] text-[#1e2433]">{loggedGrades}</div><div className="mt-1 text-[11px] text-[#9298a3]">grades logged</div></div></div></section><section className="rounded-[14px] border border-[#d8e1ff] bg-[#eef2ff] p-6 sm:p-7"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3157e8] text-white"><Sparkles size={14} /></span><span className="section-kicker text-[#3157e8]">Grade optimizer</span></div><h2 className="mt-5 max-w-sm font-display text-[29px] leading-[1.1] tracking-[-.04em] text-[#23325f]">{courses.length ? "Smallest gap, biggest leverage." : ""}</h2><p className="mt-3 max-w-sm text-[13px] leading-6 text-[#52618f]">{courses.length ? `Update a course grade to recalculate your GPA from backend dashboard data.` : ""}</p><div className="mt-7 rounded-[10px] border border-[#d5defe] bg-[#f7f8ff] p-4"><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.12em] text-[#6675a7]">Target gap</span><ArrowUpRight size={15} className="text-[#3157e8]" /></div><div className="mt-2 flex items-end gap-2"><span className="font-mono text-[25px] text-[#23325f]">{targetGpa > 0 ? Math.max(0, targetGpa - gpa).toFixed(2) : "0.00"}</span><span className="mb-1 text-[11px] text-[#6675a7]">GPA points</span></div></div></section></div><section className="paper-card mt-7 overflow-hidden rounded-[14px] border border-[#e5e4de]"><div className="border-b border-[#ecebe5] px-6 py-5 sm:px-7"><div className="section-kicker mb-2">Course estimates</div><h2 className="font-display text-[25px] tracking-[-.04em] text-[#1e2433]">Where you stand</h2></div><div className="divide-y divide-[#ecebe5]">{courses.map(course => <div className="grid items-center gap-4 px-6 py-5 sm:grid-cols-[minmax(0,1.4fr)_120px_minmax(140px,1fr)_90px] sm:px-7" key={course.id}><div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full" style={{ background: course.color }} /><div><div className="text-[13px] font-semibold text-[#313847]">{course.name}</div><div className="mt-1 font-mono text-[10px] uppercase tracking-[.12em] text-[#9298a3]">{course.code}</div></div></div><div className="font-mono text-[22px] text-[#1e2433]">{course.grade}% <span className="ml-1 text-[11px] text-[#9298a3]">{course.letter}</span></div><div><div className="mb-1 flex justify-between font-mono text-[9px] text-[#9298a3]"><span>completed weight</span><span>{Math.round(course.total ? (course.completed/course.total)*100 : 0)}%</span></div><div className="h-1.5 rounded-full bg-[#ecece7]"><div className="h-full rounded-full" style={{ width: `${course.total ? (course.completed/course.total)*100 : 0}%`, background: course.color }} /></div></div><button onClick={() => onUpdateGrade(course)} className="focus-ring flex items-center gap-1 text-[11px] font-semibold text-[#3157e8]">Update <ChevronRight size={13} /></button></div>)}</div></section></>;
}

function PlannerPage({ assignments, onToggle, setView }: { assignments: Assignment[]; onToggle: (id: number | string) => void; setView: (view: View) => void }) {
  const planItems = [...assignments].filter(item => item.status !== "complete").sort((a,b) => priorityScore(b)-priorityScore(a)).slice(0, 4);
  return <><PageIntro kicker="Rule-based planning" title="Study planner" subtitle="A transparent weekly plan built from due date, grade weight, estimated effort, and the time you actually have." action={<button onClick={() => toast("Plan refreshed using your latest assignment statuses.")} className="focus-ring flex items-center gap-2 self-start rounded-[8px] border border-[#dfe1dc] bg-[#fffefa] px-4 py-2.5 text-[12px] font-semibold text-[#3157e8] md:self-auto"><RotateCcw size={14} /> Refresh plan</button>} /><div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]"><section className="paper-card rounded-[14px] border border-[#e5e4de] p-6 sm:p-7"><div className="flex items-start justify-between"><div><div className="section-kicker mb-2">Suggested sequence</div><h2 className="font-display text-[27px] tracking-[-.04em] text-[#1e2433]">Your next four moves</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7edff] text-[#3157e8]"><Sparkles size={18} /></div></div><div className="mt-7 space-y-3">{planItems.map((item, index) => <div key={item.id} className="relative flex gap-4 rounded-[10px] border border-[#ecebe5] bg-[#fffefa] p-4 transition hover:border-[#d5dcf8]">{index < planItems.length - 1 && <div className="absolute bottom-[-14px] left-[27px] top-[53px] w-px bg-[#dfe2eb]" />}<div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3157e8] font-mono text-[11px] font-semibold text-white">0{index + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[13px] font-semibold text-[#313847]">{item.title}</span>{index === 0 && <span className="font-mono text-[9px] uppercase tracking-[.12em] text-[#3157e8]">start here</span>}</div><div className="mt-1 flex flex-wrap gap-2"><WhyChip>{item.dueLabel}</WhyChip><WhyChip tone="terracotta">{item.weight}% weight</WhyChip><WhyChip tone="sage">{item.effort}</WhyChip></div><p className="mt-3 text-[11px] leading-5 text-[#7b8290]"><strong className="font-semibold text-[#596274]">Why now:</strong> {item.status === "in progress" ? "you already have momentum" : "it balances urgency with the effort needed"}.</p></div><StatusMark status={item.status} onClick={() => onToggle(item.id)} /></div>)}</div></section><aside className="space-y-5"><section className="rounded-[14px] border border-[#f0dbcd] bg-[#fffaf7] p-6"><div className="flex items-center gap-2"><AlertTriangle size={16} className="text-[#db8b62]" /><div className="section-kicker text-[#a45d3d]">Capacity check</div></div><h2 className="mt-4 font-display text-[25px] tracking-[-.04em] text-[#5f463b]">One squeeze point</h2><p className="mt-3 text-[13px] leading-5 text-[#76594d]">You have 7.8 hours of open work and 8 hours of focus time. That leaves almost no buffer, so keep Wednesday’s block protected.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f2dfd4]"><div className="h-full w-[97%] rounded-full bg-[#db8b62]" /></div><div className="mt-2 flex justify-between font-mono text-[10px] text-[#a9806f]"><span>7.8h work</span><span>8h available</span></div></section><section className="paper-card rounded-[14px] border border-[#e5e4de] p-6"><div className="section-kicker mb-2">Planner logic</div><h2 className="font-display text-[24px] tracking-[-.04em] text-[#1e2433]">No mystery math.</h2><p className="mt-3 text-[12px] leading-5 text-[#747b88]">Every suggestion shows its reason. The MVP planner uses four visible signals:</p><ul className="mt-4 space-y-3 text-[12px] text-[#596274]"><li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3157e8]" />Due date proximity</li><li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#db8b62]" />Grade weight</li><li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#81a993]" />Estimated effort</li><li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#b68cdb]" />Current momentum</li></ul></section></aside></div><button onClick={() => setView("schedule")} className="focus-ring mt-6 flex items-center gap-2 text-[12px] font-semibold text-[#3157e8]">Place these blocks on your schedule <ExternalLink size={14} /></button></>;
}

function AddModal({ courses, onClose, onAddAssignment }: { courses: Course[]; onClose: () => void; onAddAssignment: (assignment: Omit<Assignment, "id">) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState(courses[0]?.code ?? "");
  const [dueLabel, setDueLabel] = useState("Mon, Sep 14");
  const [effort, setEffort] = useState("60 min");
  const [weight, setWeight] = useState("10");
  useEffect(() => { if (!courses.some((course) => course.code === courseCode)) setCourseCode(courses[0]?.code ?? ""); }, [courseCode, courses]);
  useEffect(() => { const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose(); window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!title.trim()) { toast("Add a title so CampusFlow can rank this work."); return; } const course = courses.find(item => item.code === courseCode); if (!course) { toast("Add a course before creating an assignment."); return; } const hours = effort.includes("hr") ? Number.parseFloat(effort) || 1 : (Number.parseInt(effort) || 60) / 60; void onAddAssignment({ title: title.trim(), course: course.name, courseCode: course.code, due: "2026-09-14", dueLabel, effort, effortHours: hours, weight: Number.parseInt(weight) || 10, status: "not started", color: course.color }); onClose(); };
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#182032]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="animate-rise w-full max-w-[520px] rounded-t-[18px] border border-[#e5e4de] bg-[#fffefa] p-6 shadow-[0_24px_80px_rgba(24,32,50,.22)] sm:rounded-[16px] sm:p-7" role="dialog" aria-modal="true" aria-labelledby="add-work-title"><div className="mb-6 flex items-start justify-between"><div><div className="section-kicker mb-2">Quick capture</div><h2 id="add-work-title" className="font-display text-[28px] tracking-[-.04em] text-[#1e2433]">Add an assignment</h2><p className="mt-2 text-[12px] text-[#747b88]">Give CampusFlow enough context to make a useful suggestion.</p></div><button onClick={onClose} className="focus-ring rounded-md p-2 text-[#8c929d] hover:bg-[#f0f1f4] hover:text-[#313847]" aria-label="Close dialog"><X size={18} /></button></div><form onSubmit={submit} className="space-y-4"><label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#596274]">Assignment title</span><input autoFocus value={title} onChange={e => setTitle(e.target.value)} className="focus-ring w-full rounded-[8px] border border-[#dfe1dc] bg-[#fbfaf6] px-3 py-2.5 text-[13px] text-[#313847] outline-none transition focus:border-[#9eaff4]" placeholder="e.g. Research outline" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#596274]">Course</span><select value={courseCode} onChange={e => setCourseCode(e.target.value)} className="focus-ring w-full rounded-[8px] border border-[#dfe1dc] bg-[#fbfaf6] px-3 py-2.5 text-[13px] text-[#313847] outline-none">{courses.length ? courses.map(course => <option key={course.id} value={course.code}>{course.code} - {course.name}</option>) : <option value="">Add a course first</option>}</select></label><label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#596274]">Due date</span><input value={dueLabel} onChange={e => setDueLabel(e.target.value)} className="focus-ring w-full rounded-[8px] border border-[#dfe1dc] bg-[#fbfaf6] px-3 py-2.5 text-[13px] text-[#313847] outline-none" /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#596274]">Estimated effort</span><input value={effort} onChange={e => setEffort(e.target.value)} className="focus-ring w-full rounded-[8px] border border-[#dfe1dc] bg-[#fbfaf6] px-3 py-2.5 text-[13px] text-[#313847] outline-none" /></label><label className="block"><span className="mb-2 block text-[11px] font-semibold text-[#596274]">Grade weight (%)</span><input value={weight} onChange={e => setWeight(e.target.value)} type="number" min="0" max="100" className="focus-ring w-full rounded-[8px] border border-[#dfe1dc] bg-[#fbfaf6] px-3 py-2.5 text-[13px] text-[#313847] outline-none" /></label></div><div className="flex items-center justify-end gap-3 border-t border-[#ecebe5] pt-5"><button type="button" onClick={onClose} className="focus-ring rounded-[8px] px-3.5 py-2.5 text-[12px] font-semibold text-[#747b88] hover:bg-[#f0f1f4]">Cancel</button><button type="submit" className="focus-ring rounded-[8px] bg-[#3157e8] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#2549d5]">Save assignment</button></div></form></div></div>;
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedule, setSchedule] = useState<Array<{ time: string; day: string; title: string; type: "class" | "study"; room: string; color: string; height: string }>>([]);
  const [gpa, setGpa] = useState(0);
  const [targetGpa, setTargetGpa] = useState(0);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  useEffect(() => {
    fetchDashboard()
      .then((data) => { setAssignments(data.assignments); setCourses(data.courses); setSchedule(data.schedule); setGpa(data.gpa); setTargetGpa(data.targetGpa); })
      .catch((error: Error) => toast(error.message))
      .finally(() => setIsDashboardLoading(false));
  }, []);
  const toggleAssignment = async (id: number | string) => {
    const current = assignments.find((item) => item.id === id);
    if (!current) return;
    const status = current.status === "complete" ? "not started" : "complete";
    try {
      const data = await updateDashboardAssignment(id, status);
      setAssignments((items) => items.map((item) => item.id === id ? data.assignment : item));
    } catch (error) { toast(error instanceof Error ? error.message : "Could not update the assignment."); }
  };
  const addAssignment = async (assignment: Omit<Assignment, "id">) => {
    try {
      const data = await createDashboardAssignment(assignment);
      setAssignments((items) => [data.assignment, ...items]);
      toast("Assignment added — CampusFlow will include it in your next plan.");
    } catch (error) { toast(error instanceof Error ? error.message : "Could not add the assignment."); }
  };
  const addCourse = async () => {
    const name = window.prompt("Course name");
    const code = window.prompt("Course code");
    const instructor = window.prompt("Instructor");
    if (!name?.trim() || !code?.trim() || !instructor?.trim()) return;
    try {
      const data = await createDashboardCourse({ name: name.trim(), code: code.trim(), instructor: instructor.trim(), grade: 0, color: "#3157e8", completed: 0, total: 0 });
      setCourses((items) => [...items, data.course]);
    } catch (error) { toast(error instanceof Error ? error.message : "Could not add the course."); }
  };
  const updateCourseGrade = async (course: Course) => {
    const value = window.prompt(`Current grade for ${course.code}`, String(course.grade));
    const grade = value === null ? NaN : Number(value);
    if (!Number.isFinite(grade) || grade < 0 || grade > 100) return;
    try {
      const data = await updateDashboardCourse(course.id, { grade });
      setCourses((items) => items.map((item) => item.id === course.id ? data.course : item));
      setGpa(data.gpa);
      toast("Grade updated.");
    } catch (error) { toast(error instanceof Error ? error.message : "Could not update the grade."); }
  };
  const navigate = (next: View) => { setView(next); setMobileNavOpen(false); window.scrollTo({ top: 0, behavior: "auto" }); };
  if (isDashboardLoading) return <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa]"><p className="text-sm text-[#747b88]">Loading your dashboard...</p></div>;
  return <div className="app-texture min-h-screen text-[#1e2433]"><div className="hidden lg:block"><Sidebar view={view} setView={navigate} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} onAdd={() => setShowAdd(true)} assignmentCount={assignments.filter((item) => item.status !== "complete").length} /></div>{mobileNavOpen && <div className="fixed inset-0 z-50 bg-[#182032]/35 lg:hidden" onClick={() => setMobileNavOpen(false)}><div className="h-full w-[246px]" onClick={event => event.stopPropagation()}><Sidebar view={view} setView={navigate} collapsed={false} setCollapsed={() => setMobileNavOpen(false)} onAdd={() => { setShowAdd(true); setMobileNavOpen(false); }} assignmentCount={assignments.filter((item) => item.status !== "complete").length} /></div></div>}<Topbar view={view} onAdd={() => setShowAdd(true)} onMenu={() => setMobileNavOpen(true)} sidebarCollapsed={sidebarCollapsed} /><main className={classNames("px-5 pb-12 pt-8 transition-[padding] duration-200 sm:px-8 lg:pt-10", sidebarCollapsed ? "lg:pl-[108px]" : "lg:pl-[278px]")}><div className="mx-auto max-w-[1240px]">{view === "overview" && <Overview assignments={assignments} courses={courses} gpa={gpa} targetGpa={targetGpa} onToggle={toggleAssignment} setView={navigate} onAdd={() => setShowAdd(true)} />}{view === "assignments" && <AssignmentsPage assignments={assignments} onToggle={toggleAssignment} onAdd={() => setShowAdd(true)} />}{view === "schedule" && <SchedulePage schedule={schedule} setView={navigate} />}{view === "courses" && <CoursesPage courses={courses} setView={navigate} onAdd={addCourse} />}{view === "grades" && <GradesPage courses={courses} gpa={gpa} targetGpa={targetGpa} onUpdateGrade={updateCourseGrade} />}{view === "planner" && <PlannerPage assignments={assignments} onToggle={toggleAssignment} setView={navigate} />}</div></main>{showAdd && <AddModal courses={courses} onClose={() => setShowAdd(false)} onAddAssignment={addAssignment} />}</div>;
}

