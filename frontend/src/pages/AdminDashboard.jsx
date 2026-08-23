import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BookOpen, TrendingUp, AlertTriangle,
  Search, ChevronRight, Plus, X, Check,
  GraduationCap, Shield, UserCheck, BarChart3,
  ChevronLeft, Edit2, RefreshCw,
} from "lucide-react";
import { useTheme } from "../auth/ThemeContext";
import api from "../api/axios";
import toast from "react-hot-toast";

// ── Grade badge ───────────────────────────────────────────────────────────────
const GradeBadge = ({ grade }) => {
  if (!grade) return <span className="text-xs text-slate-500">—</span>;
  const colors = {
    A: "bg-emerald-500/20 text-emerald-400",
    B: "bg-blue-500/20 text-blue-400",
    C: "bg-yellow-500/20 text-yellow-400",
    D: "bg-orange-500/20 text-orange-400",
    F: "bg-red-500/20 text-red-400",
    W: "bg-slate-500/20 text-slate-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors[grade] || "bg-slate-500/20 text-slate-400"}`}>
      {grade}
    </span>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, isDark }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl p-5 flex items-center gap-4 ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value ?? "—"}</p>
      <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{label}</p>
    </div>
  </motion.div>
);

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, isDark }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 ${isDark ? "bg-[#0f1117] border border-white/10" : "bg-white border border-gray-200 shadow-2xl"}`}
      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X size={18} className={isDark ? "text-slate-400" : "text-gray-500"} />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

// ── Input helper ──────────────────────────────────────────────────────────────
const Field = ({ label, isDark, ...props }) => (
  <div>
    <label className={`block text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{label}</label>
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${isDark
        ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500"
        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500"}`}
    />
  </div>
);

const SelectField = ({ label, isDark, children, ...props }) => (
  <div>
    <label className={`block text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{label}</label>
    <select
      {...props}
      className={`w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${isDark
        ? "bg-white/5 border-white/10 text-white focus:border-indigo-500"
        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500"}`}
    >
      {children}
    </select>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────

// ── Overview tab ──────────────────────────────────────────────────────────────
const OverviewTab = ({ isDark }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => toast.error("Failed to load stats"));
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard icon={Users}         label="Total Students"      value={stats?.total_students}     color="bg-indigo-500" isDark={isDark} />
      <StatCard icon={BookOpen}      label="Courses in Library"  value={stats?.total_courses}      color="bg-blue-500"   isDark={isDark} />
      <StatCard icon={TrendingUp}    label="Active Enrollments"  value={stats?.active_enrollments} color="bg-emerald-500" isDark={isDark} />
      <StatCard icon={AlertTriangle} label="Failing / Failed"    value={stats?.failed_enrollments} color="bg-red-500"    isDark={isDark} />
    </div>
  );
};

// ── Students tab ──────────────────────────────────────────────────────────────
const StudentsTab = ({ isDark }) => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null); // student detail
  const [enrollModal, setEnrollModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [enrollForm, setEnrollForm] = useState({ course_id: "", academic_year: "", semester: "" });
  const LIMIT = 15;

  const fetchStudents = useCallback(async () => {
    try {
      const r = await api.get("/admin/students", { params: { search, page, limit: LIMIT } });
      setStudents(r.data.students);
      setTotal(r.data.total);
    } catch { toast.error("Failed to load students"); }
  }, [search, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openDetail = async (student) => {
    try {
      const r = await api.get(`/admin/students/${student.id}`);
      setSelected(r.data);
    } catch { toast.error("Failed to load student detail"); }
  };

  const openEnroll = async () => {
    if (!courses.length) {
      const r = await api.get("/admin/courses");
      setCourses(r.data);
    }
    setEnrollModal(true);
  };

  const submitEnroll = async () => {
    if (!enrollForm.course_id) return toast.error("Select a course");
    try {
      await api.post("/admin/enrollments", {
        student_id: selected.student.id,
        course_id: parseInt(enrollForm.course_id),
        academic_year: enrollForm.academic_year ? parseInt(enrollForm.academic_year) : null,
        semester: enrollForm.semester ? parseInt(enrollForm.semester) : null,
      });
      toast.success("Student enrolled");
      setEnrollModal(false);
      openDetail(selected.student);
    } catch { toast.error("Failed to enroll student"); }
  };

  const updateGrade = async (enrollmentId, grade) => {
    try {
      await api.put(`/admin/enrollments/${enrollmentId}`, { grade });
      toast.success("Grade updated");
      openDetail(selected.student);
    } catch { toast.error("Failed to update grade"); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Search */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email…"
          className={`flex-1 bg-transparent text-sm outline-none ${isDark ? "text-white placeholder-slate-500" : "text-gray-900 placeholder-gray-400"}`}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={isDark ? "text-slate-400 border-b border-white/10" : "text-gray-500 border-b border-gray-100"}>
              <th className="text-left py-2 pr-4 font-medium">Student</th>
              <th className="text-left py-2 pr-4 font-medium">Year</th>
              <th className="text-left py-2 pr-4 font-medium">Active</th>
              <th className="text-left py-2 pr-4 font-medium">Completed</th>
              <th className="text-left py-2 font-medium">Failed</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.id}
                onClick={() => openDetail(s)}
                className={`cursor-pointer transition-colors ${isDark ? "hover:bg-white/5 border-b border-white/5" : "hover:bg-gray-50 border-b border-gray-100"}`}
              >
                <td className="py-3 pr-4">
                  <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{s.name}</p>
                  <p className="text-xs text-slate-400">{s.email}</p>
                </td>
                <td className={`py-3 pr-4 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                  {s.year ? `Year ${s.year}` : "—"}
                </td>
                <td className={`py-3 pr-4 ${isDark ? "text-slate-300" : "text-gray-700"}`}>{s.active_courses}</td>
                <td className={`py-3 pr-4 ${isDark ? "text-slate-300" : "text-gray-700"}`}>{s.completed_courses}</td>
                <td className="py-3">
                  {parseInt(s.failed_courses) > 0
                    ? <span className="text-red-400 font-semibold">{s.failed_courses}</span>
                    : <span className={isDark ? "text-slate-500" : "text-gray-400"}>0</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4 justify-end">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors">
            <ChevronLeft size={16} className={isDark ? "text-slate-300" : "text-gray-600"} />
          </button>
          <span className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors">
            <ChevronRight size={16} className={isDark ? "text-slate-300" : "text-gray-600"} />
          </button>
        </div>
      )}

      {/* Student detail modal */}
      <AnimatePresence>
        {selected && (
          <Modal title={selected.student.name} onClose={() => setSelected(null)} isDark={isDark}>
            <div className="space-y-4">
              {/* Info row */}
              <div className="flex flex-wrap gap-3 text-xs">
                {[
                  ["Email", selected.student.email],
                  ["Year", selected.student.year ? `Year ${selected.student.year}` : "—"],
                  ["Semester", selected.student.semester ?? "—"],
                  ["Plan", selected.student.plan || "free"],
                  ["Streak", `${selected.student.streak_current ?? 0} days`],
                ].map(([k, v]) => (
                  <div key={k} className={`px-3 py-1.5 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                    <span className="text-slate-400">{k}: </span>
                    <span className={isDark ? "text-white" : "text-gray-900"}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Enrollment history */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Enrollment History</h3>
                  <button
                    onClick={openEnroll}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                  >
                    <Plus size={12} /> Enroll
                  </button>
                </div>

                {selected.enrollments.length === 0
                  ? <p className="text-sm text-slate-500">No enrollments yet.</p>
                  : (
                    <div className="space-y-2">
                      {selected.enrollments.map((e) => (
                        <div key={e.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{e.course_name}</p>
                            <p className="text-xs text-slate-400">
                              {e.academic_year ? `${e.academic_year}` : ""}
                              {e.semester ? ` · Sem ${e.semester}` : ""}
                              {e.attempt > 1 ? ` · Attempt ${e.attempt}` : ""}
                            </p>
                          </div>
                          <GradeBadge grade={e.grade} />
                          {/* Quick grade selector */}
                          <select
                            defaultValue=""
                            onChange={(ev) => { if (ev.target.value) updateGrade(e.id, ev.target.value); }}
                            className={`text-xs rounded-lg px-2 py-1 border outline-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                          >
                            <option value="">Set grade</option>
                            {["A", "B", "C", "D", "F", "W"].map((g) => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Enroll modal */}
      <AnimatePresence>
        {enrollModal && selected && (
          <Modal title={`Enroll ${selected.student.name}`} onClose={() => setEnrollModal(false)} isDark={isDark}>
            <div className="space-y-4">
              <SelectField label="Course" isDark={isDark} value={enrollForm.course_id}
                onChange={(e) => setEnrollForm((f) => ({ ...f, course_id: e.target.value }))}>
                <option value="">Select a course…</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.year_id ? ` (Year ${c.year_id}` : ""}{c.semester_id ? `, Sem ${c.semester_id})` : c.year_id ? ")" : ""}
                  </option>
                ))}
              </SelectField>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Academic Year" isDark={isDark} type="number" placeholder="e.g. 2025"
                  value={enrollForm.academic_year}
                  onChange={(e) => setEnrollForm((f) => ({ ...f, academic_year: e.target.value }))} />
                <Field label="Semester (1 or 2)" isDark={isDark} type="number" placeholder="1"
                  value={enrollForm.semester}
                  onChange={(e) => setEnrollForm((f) => ({ ...f, semester: e.target.value }))} />
              </div>
              <p className="text-xs text-slate-400">
                If the student already took this course, a new attempt will be created automatically.
              </p>
              <button
                onClick={submitEnroll}
                className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
              >
                Confirm Enrollment
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Courses tab ───────────────────────────────────────────────────────────────
const CoursesTab = ({ isDark }) => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", year_id: "", semester_id: "" });

  const fetchCourses = async () => {
    try {
      const r = await api.get("/admin/courses");
      setCourses(r.data);
    } catch { toast.error("Failed to load courses"); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", description: "", year_id: "", semester_id: "" }); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || "", year_id: c.year_id || "", semester_id: c.semester_id || "" }); setShowForm(true); };

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Course name is required");
    try {
      if (editing) {
        await api.put(`/admin/courses/${editing.id}`, form);
        toast.success("Course updated");
      } else {
        await api.post("/admin/courses", form);
        toast.success("Course created");
      }
      setShowForm(false);
      fetchCourses();
    } catch { toast.error("Failed to save course"); }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} /> Add Course
        </button>
      </div>

      <div className="space-y-2">
        {courses.map((c) => (
          <div key={c.id} className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{c.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {c.year_id ? `Year ${c.year_id}` : "All years"}
                {c.semester_id ? ` · Semester ${c.semester_id}` : ""}
                {" · "}{c.topic_count} topics · {c.enrolled_students} students enrolled
              </p>
            </div>
            <button
              onClick={() => openEdit(c)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Edit2 size={14} className={isDark ? "text-slate-400" : "text-gray-400"} />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <Modal title={editing ? "Edit Course" : "New Course"} onClose={() => setShowForm(false)} isDark={isDark}>
            <div className="space-y-4">
              <Field label="Course Name *" isDark={isDark} value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Data Structures" />
              <Field label="Description" isDark={isDark} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Year (1–4)" isDark={isDark} type="number" value={form.year_id}
                  onChange={(e) => setForm((f) => ({ ...f, year_id: e.target.value }))} placeholder="e.g. 2" />
                <Field label="Semester (1 or 2)" isDark={isDark} type="number" value={form.semester_id}
                  onChange={(e) => setForm((f) => ({ ...f, semester_id: e.target.value }))} placeholder="1" />
              </div>
              <button
                onClick={submit}
                className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
              >
                {editing ? "Save Changes" : "Create Course"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Professors / Users tab ─────────────────────────────────────────────────────
const UsersTab = ({ isDark }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleModal, setRoleModal] = useState(null);
  const [newRole, setNewRole] = useState("");

  const fetchUsers = async () => {
    try {
      const r = await api.get("/admin/users");
      setUsers(r.data);
    } catch { toast.error("Failed to load users"); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async () => {
    if (!newRole) return;
    try {
      await api.put(`/admin/users/${roleModal.id}/role`, { role: newRole });
      toast.success("Role updated");
      setRoleModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update role");
    }
  };

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = {
    admin: "bg-red-500/20 text-red-400",
    professor: "bg-purple-500/20 text-purple-400",
    student: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl flex-1 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff…"
            className={`flex-1 bg-transparent text-sm outline-none ${isDark ? "text-white placeholder-slate-500" : "text-gray-900 placeholder-gray-400"}`}
          />
        </div>
        <button
          onClick={() => { setRoleModal({ id: null, name: "Promote a student" }); setNewRole("professor"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-sm font-medium transition-colors whitespace-nowrap"
        >
          <UserCheck size={15} /> Assign Professor
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map((u) => (
          <div key={u.id} className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{u.name}</p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColor[u.role] || "bg-slate-500/20 text-slate-400"}`}>
              {u.role}
            </span>
            <button
              onClick={() => { setRoleModal(u); setNewRole(u.role); }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Edit2 size={14} className={isDark ? "text-slate-400" : "text-gray-400"} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className={`text-sm text-center py-8 ${isDark ? "text-slate-500" : "text-gray-400"}`}>No staff members yet.</p>
        )}
      </div>

      <AnimatePresence>
        {roleModal && (
          <Modal
            title={roleModal.id ? `Change Role — ${roleModal.name}` : "Assign Role by User ID"}
            onClose={() => setRoleModal(null)}
            isDark={isDark}
          >
            <div className="space-y-4">
              {!roleModal.id && (
                <Field label="User ID" isDark={isDark} type="number"
                  onChange={(e) => setRoleModal((r) => ({ ...r, id: e.target.value }))}
                  placeholder="Paste the student's user ID" />
              )}
              <SelectField label="New Role" isDark={isDark} value={newRole}
                onChange={(e) => setNewRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="admin">Admin</option>
              </SelectField>
              <button
                onClick={updateRole}
                className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",   label: "Overview",   icon: BarChart3 },
  { id: "students",   label: "Students",   icon: GraduationCap },
  { id: "courses",    label: "Courses",    icon: BookOpen },
  { id: "professors", label: "Staff",      icon: Shield },
];

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!["admin", "professor"].includes(role)) {
      navigate("/dashboard");
    }
  }, [role, navigate]);

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#080b11] text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Admin Dashboard</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            Manage students, courses, and staff.
          </p>
        </div>

        {/* Tab bar */}
        <div className={`flex gap-1 p-1 rounded-xl mb-6 w-fit ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
          {TABS.filter((t) => t.id !== "professors" || role === "admin").map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? isDark ? "bg-white/10 text-white" : "bg-white text-gray-900 shadow-sm"
                    : isDark ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "overview"   && <OverviewTab isDark={isDark} />}
            {activeTab === "students"   && <StudentsTab isDark={isDark} />}
            {activeTab === "courses"    && <CoursesTab  isDark={isDark} />}
            {activeTab === "professors" && <UsersTab    isDark={isDark} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
