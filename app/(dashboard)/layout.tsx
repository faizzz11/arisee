/**
 * Client-side Dashboard Layout
 * IMPORTANT: This is a client component ("use client"). 
 * Do not import any server-only modules or MongoDB utilities here.
 * Only use context providers and client-safe utilities.
 */
"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Menu, X, Search, Coins, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CoinDashboard from "@/components/CoinDashboard";
import { CoinsProvider, useCoins } from "@/contexts/CoinsContext";
import { ActivityProvider } from "@/contexts/ActivityContext";

function DashboardContent({
  children
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCoinsModalOpen, setIsCoinsModalOpen] = useState(false);
  const { coins, isLoading, refreshCoins, connectionError } = useCoins();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
  };

  // Directly fetch the latest coins from MongoDB
  const fetchLatestCoins = async () => {
    try {
      const response = await fetch('/api/user/coins?t=' + Date.now()); // Add cache buster
      if (response.ok) {
        const data = await response.json();
        if (data.success && typeof data.coins === 'number') {
          refreshCoins();
        }
      }
    } catch (error) {
      console.error('Error fetching latest coins:', error);
    }
  };

  const handleRedeemCoins = async (coinsAmount: number) => {
    try {
      // Update coins in the database using the improved API
      const response = await fetch('/api/user/coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coins: coinsAmount,
          action: 'add'
        }),
      });

      if (response.ok) {
        // If database update was successful, fetch the latest coins directly
        fetchLatestCoins();
      } else {
        // If there was an error, try to extract the error message
        const errorData = await response.json();
        console.error('Error updating coins:', errorData.error || 'Unknown error');

        // On error, refresh the coins value from the server
        fetchLatestCoins();
      }
    } catch (error) {
      console.error('Error updating coins:', error);
      // On error, refresh the coins value from the server
      fetchLatestCoins();
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-b from-[#f8f9ff] to-[#f1f5ff] text-slate-800 overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          className="bg-white p-2 rounded-lg shadow-md border border-slate-200"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 h-full w-72 transition-transform duration-300 border-r border-slate-200 overflow-y-auto transform md:block`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full md:w-[calc(100%-18rem)]">
        {/* Top header bar with grid pattern */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 relative bg-gradient-to-b from-[#f8f9ff] to-[#f1f5ff]">
          <div className="absolute inset-0 z-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(92, 95, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '16px 16px'
            }}
          />

          {/* Left - Empty space or logo can go here */}
          <div className="ml-8 md:ml-0 relative z-10 flex-shrink-0">
            {/* ARISE Dashboard text removed */}
          </div>

          {/* Center - Search Bar */}
          <div className="flex flex-grow justify-center mx-4 relative z-10">
            <form onSubmit={handleSearch} className="w-full max-w-md relative">
              <Input
                type="text"
                placeholder="Search courses, assignments, resources..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#5C5FFF]/50 focus:border-[#5C5FFF] bg-white/80 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            </form>
          </div>

          {/* Right - Coin Balance */}
          <div className="relative z-10">
            <button
              onClick={() => setIsCoinsModalOpen(true)}
              className={`flex flex-row items-center gap-2 px-4 py-2 rounded-md font-bold cursor-pointer hover:-translate-y-0.5 transition duration-200 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] ${connectionError ? 'bg-gradient-to-b from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200' : 'bg-gradient-to-b from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200'}`}
            >
              {connectionError ? (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              ) : (
                <Coins className="w-5 h-5 text-yellow-500" />
              )}
              <span className={`font-medium ${connectionError ? 'text-amber-700' : 'text-yellow-700'}`}>
                {isLoading ? '...' : coins}
              </span>
            </button>
          </div>
        </div>

        {/* Connection error banner */}
        {connectionError && (
          <div className="p-2 bg-amber-50 border-b border-amber-200 text-center">
            <span className="text-amber-800 text-sm flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Database connection issues detected
            </span>
          </div>
        )}

        {/* Content area with grid background */}
        <div className="flex-1 overflow-y-auto p-6 relative bg-[#f8f9ff]">
          <div className="absolute inset-0 z-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(92, 95, 255, 0.1) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(92, 95, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>

      <CoinDashboard
        isOpen={isCoinsModalOpen}
        onClose={() => setIsCoinsModalOpen(false)}
        onRedeem={handleRedeemCoins}
      />
    </div>
  );
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <CoinsProvider>
      <ActivityProvider>
        <DashboardContent>
          {children}
        </DashboardContent>
      </ActivityProvider>
    </CoinsProvider>
  );
}
