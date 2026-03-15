import { Award } from "lucide-react";

const Badge = ({ badge }) => {
    return (
        <div
            className="group relative flex flex-col items-center justify-center p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:border-purple-500/50 cursor-default"
            title={badge.description}
        >
            <div className="w-12 h-12 mb-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 text-white">
                <Award size={24} />
            </div>
            <h3 className="font-semibold text-gray-200 text-sm text-center">
                {badge.label}
            </h3>
            <p className="text-xs text-gray-400 mt-1 text-center max-w-[150px]">
                {badge.description}
            </p>

            {/* Tooltip-like date */}
            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900 border border-gray-700 text-xs py-1 px-2 rounded-md whitespace-nowrap z-10 pointer-events-none">
                Earned: {new Date(badge.earned_at).toLocaleDateString()}
            </div>
        </div>
    );
};

export default Badge;
