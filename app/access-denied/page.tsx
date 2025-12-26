"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AccessDenied() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Determine where to redirect the user based on their role
  const redirectPath = session?.role === "teacher" 
    ? "/teacher/dashboard" 
    : "/dashboard";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
          {session?.role === "student" && (
            <span> This section is available only for teachers.</span>
          )}
        </p>

        <div className="flex flex-col space-y-3">
          <Link
            href={redirectPath}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
} 