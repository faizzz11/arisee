"use client";

import React, { useState } from "react";
import AiMentorUI from "@/components/ai-mentor/AiMentorUI";
import { Button } from "@/components/ui/button";
import { Briefcase, Bot, MessageSquare, Phone, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AiMentor = () => {
  const [isMockInterview, setIsMockInterview] = useState(false);
  const mockInterviewAssistantId = "8714485c-f553-4a8d-849f-239426e328b0";

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hero Section */}


      {/* Features Grid */}


      {/* Main Content Card */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <AiMentorUI assistantId={isMockInterview ? mockInterviewAssistantId : undefined} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AiMentor;
