import React from "react";

export default function DashboardSkeleton({ isDark }) {
    const shimmerClass = isDark
        ? "animate-pulse bg-gray-800"
        : "animate-pulse bg-gray-200";

    const cardClass = isDark
        ? "bg-gray-900 border-gray-800"
        : "bg-white border-gray-100";

    return (
        <div className={`flex min-h-screen font-sans ${isDark ? "bg-gray-950" : "bg-white"}`}>
            {/* Sidebar Skeleton */}
            <aside className={`w-64 min-h-screen fixed left-0 top-0 z-50 p-6 border-r ${isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
                {/* Logo */}
                <div className="flex items-center space-x-3 mb-10">
                    <div className={`w-10 h-10 rounded-lg ${shimmerClass}`}></div>
                    <div className="space-y-2">
                        <div className={`h-4 w-20 rounded ${shimmerClass}`}></div>
                        <div className={`h-3 w-12 rounded ${shimmerClass}`}></div>
                    </div>
                </div>

                {/* User Profile Mini */}
                <div className="flex items-center space-x-3 mb-8 p-2">
                    <div className={`w-10 h-10 rounded-full ${shimmerClass}`}></div>
                    <div className="space-y-2">
                        <div className={`h-3 w-24 rounded ${shimmerClass}`}></div>
                        <div className={`h-2 w-16 rounded ${shimmerClass}`}></div>
                    </div>
                </div>

                {/* Nav Items */}
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-10 w-full rounded-lg ${shimmerClass} opacity-50`}></div>
                    ))}
                </div>

                {/* Loading Indicator */}
                <div className="absolute bottom-10 left-6 flex items-center space-x-2 opacity-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading Dashboard...</span>
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="ml-64 flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="space-y-3">
                        <div className={`h-8 w-64 rounded-lg ${shimmerClass}`}></div>
                        <div className={`h-4 w-48 rounded ${shimmerClass}`}></div>
                    </div>
                    <div className="flex space-x-4">
                        <div className={`w-10 h-10 rounded-lg ${shimmerClass}`}></div>
                        <div className={`w-10 h-10 rounded-lg ${shimmerClass}`}></div>
                    </div>
                </div>

                {/* Banner */}
                <div className={`w-full h-48 rounded-2xl mb-8 ${shimmerClass}`}></div>

                {/* Progress Tracker */}
                <div className={`w-full h-32 rounded-xl mb-8 border ${cardClass} p-6`}>
                    <div className={`h-6 w-40 rounded mb-4 ${shimmerClass}`}></div>
                    <div className="flex space-x-4">
                        <div className={`h-16 w-16 rounded-xl ${shimmerClass}`}></div>
                        <div className={`h-16 w-16 rounded-xl ${shimmerClass}`}></div>
                        <div className={`h-16 w-16 rounded-xl ${shimmerClass}`}></div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`h-64 rounded-xl border ${cardClass} p-6`}>
                        <div className={`h-6 w-32 rounded mb-6 ${shimmerClass}`}></div>
                        <div className={`h-16 w-full rounded-lg mb-4 ${shimmerClass}`}></div>
                        <div className={`h-16 w-full rounded-lg ${shimmerClass}`}></div>
                    </div>
                    <div className={`h-64 rounded-xl border ${cardClass} p-6`}>
                        <div className={`h-6 w-32 rounded mb-6 ${shimmerClass}`}></div>
                        <div className={`h-24 w-full rounded-lg mb-4 ${shimmerClass}`}></div>
                        <div className={`h-12 w-full rounded-lg ${shimmerClass}`}></div>
                    </div>
                </div>
            </main>
        </div>
    );
}
