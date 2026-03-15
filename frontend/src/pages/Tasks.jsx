import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, Search, Calendar, Clock, Flag, BookOpen, User,
  CheckCircle, Trash2, AlertCircle, X, Sparkles, Target,
  LayoutGrid, LayoutList, ChevronRight, GraduationCap,
  ClipboardList, SlidersHorizontal, ChevronDown,
  AlertTriangle, Timer, CalendarDays, CheckCheck,
} from "lucide-react";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import AddTaskModal from "../components/dashboard/AddTaskModal";
import { getDaysUntil, isOverdue, resolveTaskPriority } from "../components/dashboard/dashboardUtils";
import axios from "../lib/axios";
import { useTheme } from "../contexts/ThemeContext";

/* ─── Color maps ─────────────────────────────────────────────── */
const SUBJECT_COLORS = {
  Science: { text: "#e74c3c", bg: "#ffeaea" },
  Math: { text: "#e74c3c", bg: "#ffeaea" },
  History: { text: "#e67e22", bg: "#fff3e0" },
  English: { text: "#2980b9", bg: "#e8f4fd" },
  Art: { text: "#8e44ad", bg: "#f5eef8" },
  Physics: { text: "#9b59b6", bg: "#f3e5f5" },
  Chemistry: { text: "#16a085", bg: "#e8f8f5" },
  Biology: { text: "#27ae60", bg: "#eafaf1" },
  Default: { text: "#7f8c8d", bg: "#f2f3f4" },
};

const PRIORITY_CONFIG = {
  high: {
    gradient: "linear-gradient(180deg,#e74c3c 0%,#c0392b 100%)",
    bg: "#e74c3c",
    pill: { color: "#c0392b", background: "#fde8e8" },
  },
  medium: {
    gradient: "linear-gradient(180deg,#f39c12 0%,#e67e22 100%)",
    bg: "#f39c12",
    pill: { color: "#9a6700", background: "#fff3cd" },
  },
  low: {
    gradient: "linear-gradient(180deg,#27ae60 0%,#229954 100%)",
    bg: "#27ae60",
    pill: { color: "#1a6b3c", background: "#d4edda" },
  },
};

/* ─── Stat cards (top row) ───────────────────────────────────── */
const STAT_GRADIENTS = [
  "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
  "linear-gradient(135deg,#11998e 0%,#38ef7d 100%)",
  "linear-gradient(135deg,#f7971e 0%,#ffd200 100%)",
  "linear-gradient(135deg,#f7971e 0%,#ff4e50 100%)",
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function StudyFlowTasks() {
  /* ─── state ─────────────────────────────────── */
  const { isDark, setIsDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [tasks, setTasks] = useState({ teacher: [], personal: [] });
  const [filterType, setFilterType] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("teacher");
  const [showFilters, setShowFilters] = useState(false);

  /* ─── load tasks from API ────────────────────── */
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const persisted =
        localStorage.getItem("student_user") ||
        sessionStorage.getItem("student_user");
      if (!persisted) { setLoading(false); return; }

      const parsed = JSON.parse(persisted);
      const userId = parsed?._id || parsed?.id || "";
      setStudentId(userId);

      const res = await axios.get(`/api/students/${userId}/tasks`);
      const all = Array.isArray(res.data?.data) ? res.data.data : [];

      const mapTask = (task) => ({
        id: task._id,
        title: task.title,
        subject: task.subject,
        deadline: new Date(task.dueDate),
        priority: resolveTaskPriority(task.priority, new Date(task.dueDate)),
        completed: task.status === "Completed",
        description: task.description,
        createdBy: task.createdBy?.name || "Teacher",
        classSection: task.classSection || "General",
      });

      setTasks({
        teacher: all.filter((t) => t.createdBy?._id !== userId).map(mapTask),
        personal: all.filter((t) => t.createdBy?._id === userId).map(mapTask),
      });
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    const handleRefresh = () => loadTasks();
    window.addEventListener("tasks:refresh", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      window.removeEventListener("tasks:refresh", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, [loadTasks]);

  /* ─── derived data ───────────────────────────── */
  const filteredTasks = useMemo(() => {
    const keep = (task) => {
      const q = searchQuery.toLowerCase();
      if (
        !task.title.toLowerCase().includes(q) &&
        !task.subject.toLowerCase().includes(q)
      )
        return false;
      switch (filterType) {
        case "overdue": return isOverdue(task.deadline, task.completed);
        case "today": return getDaysUntil(task.deadline) === 0 && !task.completed;
        case "upcoming":
          return (
            getDaysUntil(task.deadline) > 0 &&
            getDaysUntil(task.deadline) <= 7 &&
            !task.completed
          );
        case "completed": return task.completed;
        default: return true;
      }
    };
    return {
      teacher: tasks.teacher.filter(keep),
      personal: tasks.personal.filter(keep),
    };
  }, [tasks, searchQuery, filterType]);

  const stats = useMemo(() => {
    const calc = (list) => ({
      total: list.length,
      completed: list.filter((t) => t.completed).length,
      overdue: list.filter((t) => isOverdue(t.deadline, t.completed)).length,
      pending: list.filter((t) => !t.completed).length,
    });
    return {
      teacher: calc(tasks.teacher),
      personal: calc(tasks.personal),
    };
  }, [tasks]);

  const currentStats = activeTab === "teacher" ? stats.teacher : stats.personal;
  const currentTasks =
    activeTab === "teacher" ? filteredTasks.teacher : filteredTasks.personal;

  /* ─── handlers ───────────────────────────────── */
  const handleToggleTask = async (taskId, type) => {
    const list = type === "teacher" ? tasks.teacher : tasks.personal;
    const task = list.find((t) => t.id === taskId);
    if (!task) return;
    const next = !task.completed;
    setTasks((prev) => ({
      ...prev,
      [type]: prev[type].map((t) =>
        t.id === taskId ? { ...t, completed: next } : t
      ),
    }));
    try {
      await axios.put(`/api/tasks/${taskId}`, {
        status: next ? "Completed" : "Pending",
        ...(next && studentId ? { completedBy: studentId } : {}),
      });
    } catch {
      setTasks((prev) => ({
        ...prev,
        [type]: prev[type].map((t) =>
          t.id === taskId ? { ...t, completed: !next } : t
        ),
      }));
    }
  };

  const handleDeleteTask = (taskId, type) => {
    if (!window.confirm("Delete this task?")) return;
    setTasks((prev) => ({
      ...prev,
      [type]: prev[type].filter((t) => t.id !== taskId),
    }));
  };

  const handleAddTask = async (newTask) => {
    if (!studentId) {
      alert("Unable to identify current student. Please log in again.");
      return false;
    }
    try {
      const res = await axios.post(`/api/students/${studentId}/tasks`, {
        title: newTask.title,
        description: newTask.description || "Self assigned task",
        subject: newTask.subject,
        dueDate: newTask.deadline,
        priority:
          (newTask.priority || "medium").charAt(0).toUpperCase() +
          (newTask.priority || "medium").slice(1),
      });
      if (res.data?.data) loadTasks();
      setShowAddModal(false);
      return true;
    } catch {
      alert("Unable to save task. Please try again.");
      return false;
    }
  };

  /* ─── filter options ─────────────────────────── */
  const filterOptions = [
    { id: "all", label: "All", icon: LayoutGrid },
    { id: "today", label: "Today", icon: CalendarDays },
    { id: "upcoming", label: "Upcoming", icon: Timer },
    { id: "overdue", label: "Overdue", icon: AlertTriangle },
    { id: "completed", label: "Done", icon: CheckCheck },
  ];

  /* ─── dark mode helpers ──────────────────────── */
  const bg = isDark ? "#0a0f1e" : "#f5f6fa";
  const cardBg = isDark ? "#111827" : "#fff";
  const border = isDark ? "#1e293b" : "#ececec";
  const textPrimary = isDark ? "#f1f5f9" : "#1a1a2e";
  const textMuted = isDark ? "#64748b" : "#888";

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div
      style={{
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        minHeight: "100vh",
        background: bg,
        color: textPrimary,
        transition: "background 0.3s,color 0.3s",
      }}
    >
      {/* ── DASHBOARD NAVBAR ── */}
      <DashboardNavbar
        isDark={isDark}
        setIsDark={setIsDark}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />

      {/* ── TAB BAR ── */}
      <div
        style={{
          background: isDark ? "rgba(13,20,38,0.97)" : "rgba(255,255,255,0.97)",
          borderBottom: `1px solid ${border}`,
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 90,
        }}
      >
        <div
          className="tasks-tabbar-inner"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Tabs */}
          <div className="tasks-tab-list" style={{ display: "flex" }}>
            {[
              {
                key: "teacher",
                label: "Teacher Assigned",
                accent: "#e74c3c",
                Icon: GraduationCap,
                count: stats.teacher.total,
              },
              {
                key: "personal",
                label: "My Tasks",
                accent: "#3498db",
                Icon: ClipboardList,
                count: stats.personal.total,
              },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  className="tasks-tab-button"
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "16px 24px",
                    background: "none",
                    border: "none",
                    borderBottom: active
                      ? `3px solid ${tab.accent}`
                      : "3px solid transparent",
                    color: active ? tab.accent : textMuted,
                    fontWeight: active ? 700 : 500,
                    fontSize: 15,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  <tab.Icon size={16} />
                  <span className="tab-label">{tab.label}</span>
                  <span
                    style={{
                      background: active ? tab.accent + "20" : isDark ? "#1e293b" : "#f1f5f9",
                      color: active ? tab.accent : textMuted,
                      borderRadius: 20,
                      padding: "1px 8px",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* New Task – desktop */}
          <button
            className="desktop-new-task"
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#1a1a2e",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "9px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Plus size={14} />
            New Task
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main
        className="tasks-main"
        style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}
      >
        {/* STAT CARDS */}
        <div
          className="stat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Total Tasks:", value: currentStats.total, gradient: STAT_GRADIENTS[0] },
            { label: "Completed:", value: currentStats.completed, gradient: STAT_GRADIENTS[1] },
            { label: "Pending:", value: currentStats.pending, gradient: STAT_GRADIENTS[2] },
            { label: "Overdue:", value: currentStats.overdue, gradient: STAT_GRADIENTS[3] },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: s.gradient,
                borderRadius: 16,
                padding: "20px 24px",
                color: "#fff",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.9, marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* TOOLBAR */}
        <div
          style={{
            background: cardBg,
            borderRadius: 16,
            padding: "12px 16px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,.06)",
            border: `1px solid ${border}`,
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: isDark ? "#1e293b" : "#f5f6fa",
              borderRadius: 10,
              padding: "8px 14px",
              flex: 1,
              maxWidth: 280,
              minWidth: 160,
            }}
          >
            <Search size={16} color={textMuted} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              style={{
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 14,
                color: textPrimary,
                fontFamily: "inherit",
                flex: 1,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <X size={14} color={textMuted} />
              </button>
            )}
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            style={{
              display: "none",
              alignItems: "center",
              gap: 6,
              background: isDark ? "#1e293b" : "#f5f6fa",
              border: `1px solid ${border}`,
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: textPrimary,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            className="mobile-filter-btn"
          >
            <SlidersHorizontal size={14} />
            Filter
            <ChevronDown
              size={13}
              style={{ transform: showFilters ? "rotate(180deg)" : "none", transition: "0.2s" }}
            />
          </button>

          {/* Filter chips */}
          <div
            className={`filter-chips-row ${showFilters ? "open" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
          >
            {filterOptions.map((opt) => {
              const Icon = opt.icon;
              const active = filterType === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFilterType(opt.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: active ? "#1a1a2e" : "none",
                    color: active ? "#fff" : isDark ? "#94a3b8" : "#555",
                    border: `1.5px solid ${active ? "#1a1a2e" : border}`,
                    borderRadius: 20,
                    padding: "6px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon size={12} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* View toggle */}
          <div
            style={{
              display: "flex",
              background: isDark ? "#1e293b" : "#f5f6fa",
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            {[
              { mode: "grid", Icon: LayoutGrid },
              { mode: "list", Icon: LayoutList },
            ].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  background: viewMode === mode
                    ? isDark ? "#334155" : "#1a1a2e"
                    : "none",
                  color: viewMode === mode ? "#fff" : textMuted,
                  border: "none",
                  borderRadius: 7,
                  padding: "6px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Section header */}
        {!loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background:
                  activeTab === "teacher"
                    ? "linear-gradient(135deg,#e74c3c,#f39c12)"
                    : "linear-gradient(135deg,#3498db,#2ecc71)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {activeTab === "teacher"
                ? <GraduationCap size={16} color="#fff" />
                : <ClipboardList size={16} color="#fff" />
              }
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                {activeTab === "teacher" ? "Teacher Assigned Tasks" : "My Personal Tasks"}
              </p>
              <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
                {currentTasks.length} task{currentTasks.length !== 1 ? "s" : ""}
                {filterType !== "all" ? ` · ${filterType}` : ""}
              </p>
            </div>
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <LoadingSkeleton isDark={isDark} cardBg={cardBg} />
        ) : currentTasks.length === 0 ? (
          <EmptyState isDark={isDark} tab={activeTab} filter={filterType} cardBg={cardBg} textPrimary={textPrimary} textMuted={textMuted} />
        ) : (
          <div
            className={viewMode === "grid" ? "task-grid" : "task-list"}
            style={
              viewMode === "grid"
                ? {
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 16,
                }
                : { display: "flex", flexDirection: "column", gap: 10 }
            }
          >
            {currentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isDark={isDark}
                viewMode={viewMode}
                type={activeTab}
                onToggle={() => handleToggleTask(task.id, activeTab)}
                onDelete={
                  activeTab === "personal"
                    ? () => handleDeleteTask(task.id, "personal")
                    : null
                }
                onClick={() => setSelectedTask(task)}
                textPrimary={textPrimary}
                textMuted={textMuted}
                cardBg={cardBg}
                border={border}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isDark={isDark}
          onClose={() => setSelectedTask(null)}
          textPrimary={textPrimary}
          textMuted={textMuted}
          cardBg={cardBg}
          border={border}
        />
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
        isDark={isDark}
      />

      {/* FAB – mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          color: "#fff",
          border: "none",
          boxShadow: "0 8px 24px rgba(102,126,234,.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 40,
        }}
        className="mobile-fab"
      >
        <Plus size={24} />
      </button>

      {/* Responsive overrides */}
      <style>{`
        .mobile-fab { display: none !important; }
        @media (max-width: 900px) {
          .tasks-main,
          .tasks-tabbar-inner {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          .tasks-tab-button { padding: 14px 16px !important; }
          .stat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .task-grid  { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 600px) {
          .tasks-tabbar-inner {
            flex-wrap: wrap;
            gap: 10px;
            padding-top: 8px;
            padding-bottom: 6px;
          }
          .tasks-tab-list {
            width: 100%;
            justify-content: space-between;
          }
          .tasks-tab-button {
            flex: 1;
            justify-content: center;
            padding: 12px 10px !important;
          }
          .tasks-main {
            padding-top: 16px !important;
            padding-bottom: 90px !important;
          }
          .stat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .stat-grid > div { padding: 16px !important; }
          .stat-grid > div > div:last-child { font-size: 30px !important; }
          .task-grid  { grid-template-columns: 1fr !important; }
          .mobile-filter-btn { display: flex !important; }
          .filter-chips-row  { display: none !important; width: 100%; }
          .filter-chips-row.open  { display: flex !important; }
          .filter-chips-row button { flex: 1; justify-content: center; }
          .tab-label { display: none !important; }
          .mobile-fab { display: flex !important; }
          .desktop-new-task { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TASK CARD
══════════════════════════════════════════════════════════════ */
function TaskCard({ task, isDark, viewMode, type, onToggle, onDelete, onClick, textPrimary, textMuted, cardBg, border }) {
  const priority = resolveTaskPriority(task.priority, task.deadline);
  const pc = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const sc = SUBJECT_COLORS[task.subject] || SUBJECT_COLORS.Default;
  const daysUntil = getDaysUntil(task.deadline);
  const overdue = isOverdue(task.deadline, task.completed);

  const Checkbox = () => (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      style={{
        width: 22,
        height: 22,
        borderRadius: 6,
        border: task.completed ? "none" : `2px solid ${isDark ? "#475569" : "#ccc"}`,
        background: task.completed ? "#27ae60" : cardBg,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.15s",
      }}
    >
      {task.completed && <CheckCircle size={13} color="#fff" />}
    </button>
  );

  const DeadlineBadge = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        fontWeight: 500,
        color: overdue ? "#e74c3c" : textMuted,
      }}
    >
      {overdue ? <AlertCircle size={13} /> : <Clock size={13} />}
      {overdue
        ? "Overdue"
        : daysUntil === 0
          ? "Due today"
          : `${task.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${daysUntil}d`}
    </div>
  );

  /* LIST ROW */
  if (viewMode === "list") {
    return (
      <div
        onClick={onClick}
        style={{
          background: cardBg,
          borderRadius: 14,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,.06)",
          borderLeft: `4px solid ${pc.bg}`,
          border: `1px solid ${border}`,
          borderLeftWidth: 4,
          opacity: task.completed ? 0.65 : 1,
          cursor: "pointer",
          transition: "box-shadow 0.2s",
        }}
      >
        <div
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            fontSize: 10,
            fontWeight: 700,
            color: pc.bg,
            letterSpacing: 1,
            textTransform: "uppercase",
            minWidth: 16,
          }}
        >
          {priority} Priority
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 4,
              textDecoration: task.completed ? "line-through" : "none",
              color: textPrimary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {task.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                background: sc.bg,
                color: sc.text,
                borderRadius: 20,
                padding: "2px 10px",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {task.subject}
            </span>
            <DeadlineBadge />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#e74c3c",
                display: "flex",
                alignItems: "center",
                opacity: 0.6,
                padding: 4,
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
          <Checkbox />
        </div>
      </div>
    );
  }

  /* GRID CARD */
  return (
    <div
      onClick={onClick}
      style={{
        background: cardBg,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: isDark ? "none" : "0 1px 6px rgba(0,0,0,.07)",
        display: "flex",
        opacity: task.completed ? 0.7 : 1,
        border: `1px solid ${border}`,
        transition: "box-shadow 0.2s, transform 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isDark ? "none" : "0 1px 6px rgba(0,0,0,.07)";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Priority sidebar */}
      <div
        style={{
          width: 42,
          background: pc.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          {priority} Priority
        </span>
      </div>

      {/* Card body */}
      <div style={{ flex: 1, padding: "18px 18px 16px", display: "flex", flexDirection: "column" }}>
        {/* Priority pill + checkbox */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span
            style={{
              ...pc.pill,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              borderRadius: 8,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            <Flag size={10} />
            {priority}
          </span>
          <Checkbox />
        </div>

        {/* Title */}
        <h3
          style={{
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 10,
            lineHeight: 1.35,
            flex: 1,
            textDecoration: task.completed ? "line-through" : "none",
            color: textPrimary,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {task.title}
        </h3>

        {/* Subject */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: sc.bg,
            borderRadius: 20,
            padding: "3px 12px",
            marginBottom: 8,
            width: "fit-content",
          }}
        >
          <BookOpen size={11} color={sc.text} />
          <span style={{ fontSize: 12, fontWeight: 600, color: sc.text }}>{task.subject}</span>
          {task.classSection && task.classSection !== "General" && (
            <span style={{ fontSize: 11, color: sc.text, opacity: 0.7 }}>· {task.classSection}</span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p
            style={{
              fontSize: 12,
              color: textMuted,
              marginBottom: 8,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${border}`,
            paddingTop: 12,
            marginTop: "auto",
          }}
        >
          <DeadlineBadge />
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#e74c3c",
                opacity: 0.6,
                display: "flex",
                alignItems: "center",
                padding: 4,
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TASK DETAIL MODAL
══════════════════════════════════════════════════════════════ */
function TaskDetailModal({ task, isDark, onClose, textPrimary, textMuted, cardBg, border }) {
  const daysUntil = getDaysUntil(task.deadline);
  const overdue = isOverdue(task.deadline, task.completed);
  const priority = resolveTaskPriority(task.priority, task.deadline);
  const pc = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,.6)",
        backdropFilter: "blur(4px)",
        padding: "0 0 0 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: cardBg,
          borderRadius: "24px 24px 0 0",
          overflow: "hidden",
          boxShadow: "0 -8px 40px rgba(0,0,0,.25)",
        }}
      >
        {/* drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: isDark ? "#334155" : "#e2e8f0",
            }}
          />
        </div>

        {/* Header */}
        <div style={{ padding: "12px 24px 20px", borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <span
                  style={{
                    ...pc.pill,
                    borderRadius: 8,
                    padding: "3px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {priority} priority
                </span>
                {task.completed && (
                  <span
                    style={{
                      background: "#d4edda",
                      color: "#155724",
                      borderRadius: 8,
                      padding: "3px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Completed
                  </span>
                )}
              </div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  lineHeight: 1.3,
                  color: textPrimary,
                  margin: 0,
                }}
              >
                {task.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: isDark ? "#1e293b" : "#f1f5f9",
                border: "none",
                borderRadius: 10,
                padding: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <X size={18} color={textMuted} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InfoBlock label="Subject" value={task.subject} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} />
            <InfoBlock
              label="Status"
              value={overdue ? "Overdue" : `${daysUntil}d left`}
              isDark={isDark}
              textPrimary={textPrimary}
              textMuted={textMuted}
              valueColor={overdue ? "#e74c3c" : undefined}
            />
          </div>
          <InfoBlock
            label="Due Date"
            value={`${task.deadline.toLocaleDateString("en-US", {
              weekday: "short",
              month: "long",
              day: "numeric",
              year: "numeric",
            })} at ${task.deadline.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
            isDark={isDark}
            textPrimary={textPrimary}
            textMuted={textMuted}
          />
          {task.description && (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: textMuted,
                  marginBottom: 6,
                }}
              >
                Description
              </p>
              <p style={{ fontSize: 14, color: textPrimary, lineHeight: 1.6, margin: 0 }}>
                {task.description}
              </p>
            </div>
          )}
          {task.createdBy && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                background: isDark ? "#1e293b" : "#f8fafc",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#3498db,#2ecc71)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User size={16} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: textMuted, margin: 0 }}>
                  Assigned By
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: textPrimary, margin: 0 }}>
                  {task.createdBy}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "0 24px 28px" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              color: "#fff",
              border: "none",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(102,126,234,.35)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function InfoBlock({ label, value, isDark, textPrimary, textMuted, valueColor }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: isDark ? "#1e293b" : "#f8fafc",
        borderRadius: 12,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: textMuted,
          margin: "0 0 4px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: valueColor || textPrimary,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ isDark, tab, filter, cardBg, textPrimary, textMuted }) {
  const filtered = filter !== "all";
  return (
    <div
      style={{
        background: cardBg,
        borderRadius: 20,
        padding: "64px 32px",
        textAlign: "center",
        border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          padding: 20,
          background: isDark ? "#1e293b" : "#f1f5f9",
          borderRadius: 20,
          marginBottom: 16,
        }}
      >
        <Sparkles size={32} color={isDark ? "#475569" : "#94a3b8"} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: "0 0 6px" }}>
        {filtered
          ? `No ${filter} tasks`
          : tab === "teacher"
            ? "No teacher tasks yet"
            : "No personal tasks yet"}
      </p>
      <p style={{ fontSize: 14, color: textMuted, margin: 0 }}>
        {filtered
          ? "Try changing the filter to see more tasks."
          : tab === "personal"
            ? "Create a personal task using the + button."
            : "Tasks assigned by your teachers will appear here."}
      </p>
    </div>
  );
}

function LoadingSkeleton({ isDark, cardBg }) {
  const pulse = isDark ? "#1e293b" : "#e2e8f0";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: 80, background: pulse, borderRadius: 16, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
      <div style={{ height: 56, background: pulse, borderRadius: 16, animation: "pulse 1.5s infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ height: 180, background: pulse, borderRadius: 16, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}
