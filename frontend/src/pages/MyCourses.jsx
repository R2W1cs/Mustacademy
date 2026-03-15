import { useEffect, useState } from "react";
import api from "../api/axios";
import MyCourseCard from "../components/MyCourseCard";
import { useTheme } from "../auth/ThemeContext";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const load = async () => {
    const res = await api.get("/enroll/me");
    setCourses(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-700 px-8 py-12 ${isDark ? 'bg-gray-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-[1800px] mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>My Courses</h1>

        {courses.length === 0 ? (
          <p className={isDark ? "text-gray-500" : "text-slate-400"}>No enrolled courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <MyCourseCard
                key={course.id}
                course={course}
                onUpdate={load}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
