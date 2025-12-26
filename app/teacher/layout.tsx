"use client";

import { useState } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle search logic here
    };

    return (
        <div className="min-h-screen bg-[#f8f9ff]">
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="hidden md:flex w-72">
                    <TeacherSidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top header bar */}
                    <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 relative bg-white">
                        <div className="absolute inset-0 z-0 opacity-20"
                            style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(92, 95, 255, 0.1) 1px, transparent 1px)`,
                                backgroundSize: '16px 16px'
                            }}
                        />

                        {/* Left - Empty space or logo */}
                        <div className="ml-8 md:ml-0 relative z-10 flex-shrink-0">
                            <h2 className="text-lg font-semibold text-slate-800">Teacher Dashboard</h2>
                        </div>

                        {/* Center - Search Bar */}
                        <div className="flex flex-grow justify-center mx-4 relative z-10">
                            <form onSubmit={handleSearch} className="w-full max-w-md relative">
                                <Input
                                    type="text"
                                    placeholder="Search students, assignments, resources..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#5C5FFF]/50 focus:border-[#5C5FFF] bg-white text-slate-800"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            </form>
                        </div>

                        {/* Right - Empty space for balance */}
                        <div className="w-16 relative z-10"></div>
                    </div>

                    {/* Content area */}
                    <main className="flex-1 overflow-y-auto p-8 bg-[#f8f9ff]">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
} 