"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    PresentationIcon,
    FileText,
    ClipboardList,
    BookOpen,
    Users,
    MessageSquare,
    Brain,
    FileCheck,
    BarChart2,
} from "lucide-react";
import Link from "next/link";

const TeacherDashboard = () => {
    const { data: session } = useSession();
    const [firstName, setFirstName] = useState("Teacher");

    useEffect(() => {
        if (session?.user?.name) {
            setFirstName(session.user.name.split(" ")[0]);
        }
    }, [session]);

    const quickActions = [
        {
            title: "Create Presentation",
            icon: PresentationIcon,
            href: "/teacher/ai-ppt",
            description: "Generate AI-powered presentations",
            color: "#5C5FFF"
        },
        {
            title: "Smart Meet",
            icon: PresentationIcon,
            href: "/teacher/smartmeet",
            description: "AI powered smart meet Summary",
            color: "#5C5FFF"
        },
        // {
        //     title: "Generate Quiz",
        //     icon: ClipboardList,
        //     href: "/teacher/ai-quiz",
        //     description: "Create automated quizzes",
        //     color: "#5C5FFF"
        // },
        // {
        //     title: "Plan Lesson",
        //     icon: BookOpen,
        //     href: "/teacher/ai-lesson",
        //     description: "Get AI lesson planning assistance",
        //     color: "#5C5FFF"
        // },
        // {
        //     title: "Create Assignment",
        //     icon: FileText,
        //     href: "/teacher/ai-paper",
        //     description: "Generate assignments and papers",
        //     color: "#5C5FFF"
        // },
        {
            title: "AI Teaching Assistant",
            icon: Brain,
            href: "/teacher/ai-assistant",
            description: "Get AI-powered teaching support",
            color: "#5C5FFF"
        },
        // {
        //     title: "Assignment Checker",
        //     icon: FileCheck,
        //     href: "/teacher/ai-checker",
        //     description: "Automated assignment checking",
        //     color: "#5C5FFF"
        // },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Welcome back, {firstName}!
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Here's what's happening in your classroom today
                        </p>
                    </div>
                    {/* <div className="flex space-x-4">
                        <Button variant="outline" className="bg-white text-slate-800 border-slate-200 hover:bg-slate-100">
                            <Users className="w-4 h-4 mr-2" />
                            View Students
                        </Button>
                        <Button variant="outline" className="bg-white text-slate-800 border-slate-200 hover:bg-slate-100">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Messages
                        </Button>
                    </div> */}
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {quickActions.map((action, index) => (
                        <Link key={index} href={action.href}>
                            <Card className="group hover:shadow-lg transition-all p-6 cursor-pointer bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                                <div className="relative">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-[#f0f1ff] group-hover:bg-[#e8e9ff] transition-colors">
                                            <action.icon className="w-6 h-6 text-[#5C5FFF]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{action.title}</h3>
                                            <p className="text-sm text-slate-600">{action.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Analytics Section */}
                <Card className="p-6 bg-white border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">Class Analytics</h3>
                        <Button variant="outline" className="text-slate-600 border-slate-200 hover:bg-slate-100">
                            <BarChart2 className="w-4 h-4 mr-2 text-[#5C5FFF]" />
                            View Details
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-slate-800 font-medium">Class 10A</p>
                                <p className="text-sm text-slate-600">30 students</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#5C5FFF] font-medium">85%</p>
                                <p className="text-sm text-slate-600">Average Score</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                                <p className="text-slate-800 font-medium">Class 10B</p>
                                <p className="text-sm text-slate-600">28 students</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#5C5FFF] font-medium">78%</p>
                                <p className="text-sm text-slate-600">Average Score</p>
                            </div>
                        </div>
                    </div>
                </Card>
                
                {/* Recent Activities Card */}
                <Card className="mt-8 p-6 bg-white border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">Recent Activities</h3>
                        <Button variant="link" className="text-[#5C5FFF] p-0 h-auto">
                            View All
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="p-2 rounded-full bg-[#f0f1ff]">
                                <FileText className="w-5 h-5 text-[#5C5FFF]" />
                            </div>
                            <div>
                                <p className="text-slate-800 font-medium">Chemistry Assignment</p>
                                <p className="text-sm text-slate-600">You created a new assignment</p>
                                <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <div className="p-2 rounded-full bg-[#f0f1ff]">
                                <PresentationIcon className="w-5 h-5 text-[#5C5FFF]" />
                            </div>
                            <div>
                                <p className="text-slate-800 font-medium">Physics Presentation</p>
                                <p className="text-sm text-slate-600">You generated a new presentation</p>
                                <p className="text-xs text-slate-500 mt-1">Yesterday</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Copyright Notice */}
            <div className="mt-8 py-4 border-t border-slate-200">
                <p className="text-center text-slate-500 text-sm">
                    © 2025 ARISE. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default TeacherDashboard;
