"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { UserRole } from "@/models/User";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";

const montserrat = Montserrat({ subsets: ["latin"] });

function RoleSelectionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Get the user data from the URL search parameters
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const image = searchParams.get("image") || "";

  async function handleRoleSelection(role: UserRole) {
    if (!email) {
      toast.error("Email is required to set up your account");
      return;
    }

    setIsLoading(true);

    try {
      // Call the API route to create the user with the selected role
      const response = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          image,
          role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }

      // User created successfully, redirect to the appropriate dashboard
      router.push(role === "teacher" ? "/teacher/dashboard" : "/dashboard");
      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create your account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-black flex items-center justify-center px-6">
      <div className="max-w-4xl w-full mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Link href="/" className="inline-block mb-8">
            <h1
              className={cn(
                "text-3xl font-bold tracking-tight",
                montserrat.className
              )}
            >
              <span className="text-[#5C5FFF] drop-shadow-[0_0_8px_rgba(92,95,255,0.2)]">AR</span>
              <span className="text-[#FF647C] drop-shadow-[0_0_8px_rgba(255,100,124,0.2)]">IS</span>
              <span className="text-[#00C2D1] drop-shadow-[0_0_8px_rgba(0,194,209,0.2)]">E</span>
            </h1>
          </Link>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold dark:text-white text-black mb-4"
          >
            Choose Your Educational Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted-foreground text-lg"
          >
            Select your role to unlock AI-powered tools designed specifically for your educational needs
          </motion.p>
        </motion.div>

        {/* User Profile */}
        {email && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-center gap-4 mb-12 p-4 rounded-xl bg-card border"
          >
            {image && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#5C5FFF]">
                <Image
                  src={image}
                  alt={name || "User"}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="text-left">
              <p className="font-medium dark:text-white text-black text-lg">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </motion.div>
        )}

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              role: "student" as UserRole,
              title: "Student",
              description: "Access AI-generated learning roadmaps, interactive quizzes, educational podcasts, and personalized study materials",
              icon: <GraduationCap className="w-8 h-8" />,
              color: "from-[#5C5FFF] to-[#00C2D1]",
              features: ["Learning Roadmaps", "AI Quizzes", "Educational Podcasts", "Progress Tracking"]
            },
            {
              role: "teacher" as UserRole,
              title: "Educator",
              description: "Create AI-powered presentations, generate question papers, manage courses, and track student progress with advanced analytics",
              icon: <BookOpen className="w-8 h-8" />,
              color: "from-[#FF647C] to-[#FF9F7C]",
              features: ["AI Presentations", "Question Papers", "Course Management", "Student Analytics"]
            }
          ].map((option) => (
            <motion.div
              key={option.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative group cursor-pointer ${selectedRole === option.role ? 'ring-2 ring-[#5C5FFF] bg-accent' : ''
                }`}
              onClick={() => setSelectedRole(option.role)}
            >
              <div className="relative bg-card border hover:border-[#5C5FFF]/50 p-8 rounded-xl transition-all duration-300">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${option.color} text-white`}>
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-semibold dark:text-white text-black">{option.title}</h3>
                  <p className="text-muted-foreground">{option.description}</p>
                  <div className="mt-4 space-y-2 w-full">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4 text-[#5C5FFF]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Button
            className={`w-full sm:w-auto bg-[#5C5FFF] hover:bg-[#4B4FFF] text-white px-8 py-6 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#5C5FFF]/20 ${!selectedRole ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            onClick={() => selectedRole && handleRoleSelection(selectedRole)}
            disabled={!selectedRole || isLoading}
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Setting up your ARISE account...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Start Your ARISE Journey</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
          <p className="text-muted-foreground text-sm mt-4">
            You'll be redirected to your personalized dashboard with AI-powered educational tools
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function RoleSelectionPage() {
  return (
    <Suspense fallback={null}>
      <RoleSelectionInner />
    </Suspense>
  );
}