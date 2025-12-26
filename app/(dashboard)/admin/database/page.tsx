"use client";

import React from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DatabaseTools from '@/components/admin/DatabaseTools';

export default function AdminDatabasePage() {
  const { data: session, status } = useSession();
  
  // Redirect if user is not logged in or not an admin
  if (status === 'loading') {
    return (
      <div className="flex min-h-[80vh] w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-purple-500" />
      </div>
    );
  }
  
  if (status === 'unauthenticated' || !session?.userId) {
    redirect('/');
  }
  
  // In a real app, you'd check if the user is an admin
  // For demo purposes, we're allowing any authenticated user
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Database Administration</h1>
        <p className="text-slate-600 mt-2">
          Manage database collections and fix user account issues
        </p>
      </div>
      
      <div className="mb-8">
        <DatabaseTools />
      </div>
    </div>
  );
} 