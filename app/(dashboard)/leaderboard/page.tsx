"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Trophy, Medal, Loader2, User, 
  ArrowUp, ArrowDown, Minus, 
  Star, Award, Users, RefreshCw 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCoins } from "@/contexts/CoinsContext";

interface LeaderboardUser {
  id: string;
  name: string;
  coins: number;
  rank: number;
  image?: string;
  email: string;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<string>("20");
  const { refreshCoins } = useCoins();

  // Function to fetch leaderboard data
  const fetchLeaderboard = async (userLimit: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Refresh the user's coins first to ensure we have the latest
      await refreshCoins();
      
      const response = await fetch(`/api/leaderboard?limit=${userLimit}&t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data = await response.json();
      console.log('Leaderboard data:', data);
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(limit);
  }, [limit]);

  // Find the current user's position
  const currentUserRank = users.find(user => 
    session?.user?.email && (
      user.email === session.user.email || 
      (session.user.name && user.name === session.user.name)
    )
  )?.rank || 'Not ranked';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-slate-600 mt-2">
            See the top learners ranked by coins earned
          </p>
        </div>
        
        {session?.userId && (
          <Card className="p-4 bg-blue-50 border-blue-200 mt-4 md:mt-0">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-blue-600">Your Rank</span>
                <span className="text-2xl font-bold text-blue-800">{currentUserRank}</span>
              </div>
              <div className="h-10 w-px bg-blue-200"></div>
              <div className="flex flex-col">
                <span className="text-sm text-blue-600">Your Coins</span>
                <span className="text-2xl font-bold text-blue-800">
                  {users.find(user => 
                    session?.user?.email && (
                      user.email === session.user.email || 
                      (session.user.name && user.name === session.user.name)
                    )
                  )?.coins || 0}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="all" className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="top10">Top 10</TabsTrigger>
          </TabsList>
          <TabsContent value="all"></TabsContent>
          <TabsContent value="top10"></TabsContent>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchLeaderboard(limit)} 
            className="flex items-center gap-1 mr-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          
          <span className="text-sm text-slate-600">Show:</span>
          <Select
            value={limit}
            onValueChange={(value) => setLimit(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="20 users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 users</SelectItem>
              <SelectItem value="20">20 users</SelectItem>
              <SelectItem value="50">50 users</SelectItem>
              <SelectItem value="100">100 users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-slate-500">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 px-4">
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-700 mb-2">No Leaderboard Data Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              The leaderboard is empty! Start earning coins by completing quizzes, maintaining your streak, and unlocking achievements.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">User</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">Coins</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  // Check if this user is the current logged-in user
                  const isCurrentUser = session?.user?.email && (
                    user.email === session.user.email || 
                    (session.user.name && user.name === session.user.name)
                  );
                  
                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-100 ${
                        isCurrentUser ? 'bg-blue-50' : 
                        user.rank === 1 ? 'bg-yellow-50' :
                        user.rank === 2 ? 'bg-slate-50' :
                        user.rank === 3 ? 'bg-[#CD7F32]/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {user.rank <= 3 ? (
                            <div className="relative w-8 h-8 flex items-center justify-center">
                              <Medal
                                className={`w-7 h-7 ${
                                  user.rank === 1
                                    ? 'text-yellow-500'
                                    : user.rank === 2
                                    ? 'text-slate-400'
                                    : 'text-[#CD7F32]'
                                }`}
                              />
                              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
                                {user.rank}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-slate-500 w-8 text-center">
                              {user.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200">
                            {user.image ? (
                              <AvatarImage src={user.image} alt={user.name} />
                            ) : (
                              <AvatarFallback className="bg-slate-100 text-slate-400">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className={`font-medium ${
                            isCurrentUser
                              ? 'text-blue-700'
                              : user.rank === 1
                              ? 'text-yellow-800'
                              : user.rank === 2
                              ? 'text-slate-800'
                              : user.rank === 3
                              ? 'text-[#CD7F32]'
                              : 'text-slate-800'
                          }`}>
                            {user.name}
                            {isCurrentUser && ' (You)'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-medium ${
                            isCurrentUser
                              ? 'text-blue-600'
                              : user.rank === 1
                              ? 'text-yellow-700'
                              : user.rank === 2
                              ? 'text-slate-600'
                              : user.rank === 3
                              ? 'text-[#CD7F32]'
                              : 'text-slate-600'
                          }`}>
                            {user.coins.toLocaleString()}
                          </span>
                          <Star className="w-4 h-4 text-yellow-500" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-500" />
          How to Earn Coins
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-medium text-purple-800">Daily Activity</h3>
            </div>
            <p className="text-sm text-slate-600">Log in daily and maintain your streak to earn bonus coins.</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-medium text-purple-800">Complete Quizzes</h3>
            </div>
            <p className="text-sm text-slate-600">Earn coins for each quiz you complete with good scores.</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-medium text-purple-800">Special Achievements</h3>
            </div>
            <p className="text-sm text-slate-600">Unlock special achievements to earn bonus coins and rewards.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 