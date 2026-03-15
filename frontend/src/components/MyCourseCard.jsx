import api from "../api/axios";
import { useTheme } from "../auth/ThemeContext";

const statusColors = {
  planned: "bg-gray-200 text-gray-700",
  in_progress: "bg-yellow-200 text-yellow-800",
  completed: "bg-green-200 text-green-800",
};

const MyCourseCard = ({ course, onUpdate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const changeStatus = async (status) => {
    await api.patch("/enroll/status", {
      courseId: course.id,
      status,
    });
    onUpdate();
  };

  return (
    <div className={`p-6 rounded-xl border transition-all duration-700 ${isDark ? 'bg-[#0f1729]/60 border-white/10 shadow-xl' : 'bg-white border-slate-200 shadow-lg'}`}>
      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{course.name}</h3>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{course.description}</p>

      <span
        className={`inline-block mt-3 px-3 py-1 rounded-full text-sm ${statusColors[course.status]}`}
      >
        {course.status.replace("_", " ")}
      </span>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => changeStatus("planned")}
          className={`text-sm px-3 py-1 border rounded transition-colors ${isDark ? 'border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          Planned
        </button>
        <button
          onClick={() => changeStatus("in_progress")}
          className={`text-sm px-3 py-1 border rounded transition-colors ${isDark ? 'border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          In Progress
        </button>
        <button
          onClick={() => changeStatus("completed")}
          className={`text-sm px-3 py-1 border rounded transition-colors ${isDark ? 'border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          Completed
        </button>
      </div>
    </div>
  );
};

export default MyCourseCard;
