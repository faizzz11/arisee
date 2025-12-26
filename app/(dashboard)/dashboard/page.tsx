"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Coins, Flame, BookOpen, TrendingUp, Zap, GraduationCap, Map } from 'lucide-react';
import GoogleClassroomCard from '@/components/GoogleClassroomCard';
import Leaderboard from '@/components/Leaderboard';
import CoinsModal from '@/components/CoinsModal';
import QuickActionsGrid from '@/components/QuickActionsGrid';
import StreakGraph from '@/components/StreakGraph';
import { Button } from '@/components/ui/button';
import { useActivity } from '@/contexts/ActivityContext';
import { useCoins } from '@/contexts/CoinsContext';

interface CourseWork {
  id: string;
  title: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
}

interface Announcement {
  id: string;
  text: string;
  creationTime: string;
  updateTime: string;
  creatorUserId: string;
}

interface Course {
  id: string;
  name: string;
  section?: string;
  courseState: string;
  courseWork?: CourseWork[];
  announcements?: Announcement[];
}

interface ActivityData {
  date: Date;
  count: number;
}

const Dashboard = () => {
  const { data: session } = useSession();
  const { refreshActivityGraph } = useActivity();
  const { coins, refreshCoins } = useCoins();
  const [firstName, setFirstName] = useState("Student");
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCoinsModalOpen, setIsCoinsModalOpen] = useState(false);
  const [currentUserCoins, setCurrentUserCoins] = useState(0);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [lastStatseFetch, setLastStatsFetch] = useState(0);

  useEffect(() => {
    if (session?.user?.name) {
      setFirstName(session.user.name.split(" ")[0]);
    }
  }, [session]);

  // Update local coins state when global state changes
  useEffect(() => {
    setCurrentUserCoins(coins);
  }, [coins]);

  const fetchUserStats = useCallback(async (force = false) => {
    if (!session?.userId) return;

    const now = Date.now();
    const cacheTime = 60000; // 1 minute cache

    // Skip if we've fetched recently and not forcing
    if (!force && now - lastStatseFetch < cacheTime && activityData.length > 0) {
      return;
    }

    try {
      setIsActivityLoading(true);
      const response = await fetch('/api/user/activity?t=' + now, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user activity');
      }
      const data = await response.json();

      setCurrentUserCoins(data.stats.totalCoins);
      setActivityData(data.yearlyActivity.map((item: { date: string; count: number }) => ({
        date: new Date(item.date),
        count: item.count
      })));
      setLastStatsFetch(now);
      setIsActivityLoading(false);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      setIsActivityLoading(false);
      setActivityData([]);
    }
  }, [session, lastStatseFetch, activityData.length]);

  // Initial data load
  useEffect(() => {
    if (session?.userId) {
      fetchUserStats();
      if (coins === 0) {
        refreshCoins();
      }
    }
  }, [session?.userId]);

  // Separate effect for when coins change from context
  useEffect(() => {
    if (coins > 0) {
      setCurrentUserCoins(coins);
    }
  }, [coins]);

  // Listen for specific activity updates only
  useEffect(() => {
    const handleActivityUpdate = () => {
      fetchUserStats(true); // Force refresh on activity updates
      refreshCoins();
    };

    window.addEventListener('user-activity-update', handleActivityUpdate);

    return () => {
      window.removeEventListener('user-activity-update', handleActivityUpdate);
    };
  }, [fetchUserStats, refreshCoins]);

  const syncGoogleClassroom = async () => {
    if (!session) {
      setError('You need to be signed in to sync classroom data');
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/google-classroom/sync');

      if (!response.ok) {
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync classroom data');
      }

      const data = await response.json();
      setCourses(data.data.courses);
    } catch (err: unknown) {
      console.error('Error syncing classroom data:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync classroom data');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRedeemCoins = (coins: number) => {
    setCurrentUserCoins(prevCoins => prevCoins + coins);

    // Trigger a refresh of the coins context to ensure consistency
    setTimeout(() => refreshCoins(), 500);

    // Also trigger activity update to refresh stats
    window.dispatchEvent(new CustomEvent('user-activity-update'));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <div className="flex-1 p-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-8 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent font-libre-baskerville">
                  Welcome back, {firstName}!
                </h1>
                <p className="text-slate-500 mt-2">
                  Here&apos;s what&apos;s happening in your learning journey
                </p>
              </div>
              <div className="flex items-center gap-3">

              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-sm flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" />Streak</span>
                  <span className="text-3xl font-bold text-slate-800 mt-2">
                    {activityData.length > 0 ? activityData[activityData.length - 1].count : 0} days
                  </span>
                  <span className="text-emerald-500 text-sm mt-2">↑ 8% from last week</span>
                </div>
              </div>
              <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-sm flex items-center gap-1"><BookOpen className="w-4 h-4 text-blue-500" />Lessons</span>
                  <span className="text-3xl font-bold text-slate-800 mt-2">
                    {activityData.reduce((sum, day) => sum + day.count, 0)}
                  </span>
                  <span className="text-emerald-500 text-sm mt-2">↑ 12% increase</span>
                </div>
              </div>
              <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-sm flex items-center gap-1"><Map className="w-4 h-4 text-indigo-500" />Learning Paths</span>
                  <span className="text-3xl font-bold text-slate-800 mt-2">
                    {courses.length}
                  </span>
                  <span className="text-emerald-500 text-sm mt-2">In Progress</span>
                </div>
              </div>
            </div>

            {/* Activity Graph */}
            <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" />Learning Journey</h3>
              <StreakGraph data={activityData} isLoading={isActivityLoading} />
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" />Quick Start</h3>
              <QuickActionsGrid onRedeemCoins={handleRedeemCoins} />
            </div>

            {/* Google Classroom */}
            <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-purple-500" />My Classes</h3>
              <GoogleClassroomCard
                courses={courses}
                isLoading={false}
                error={error}
                onSync={syncGoogleClassroom}
                isSyncing={isSyncing}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard Card */}
            <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Performers</h3>
              <Leaderboard />
            </div>

          </div>
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="py-6 border-t border-slate-200/50">
        <p className="text-center text-slate-400 text-sm">
          © 2025 ARISE. All rights reserved.
        </p>
      </div>

      <CoinsModal
        isOpen={isCoinsModalOpen}
        onClose={() => setIsCoinsModalOpen(false)}
        totalCoins={currentUserCoins}
        onRedeem={handleRedeemCoins}
      />
    </div>
  );
};

export default Dashboard;
