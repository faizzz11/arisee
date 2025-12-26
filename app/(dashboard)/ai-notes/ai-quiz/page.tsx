"use client"

import type React from "react"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Check, FileText, HelpCircle, Loader2, Plus, X, FileUp, BrainCircuit, Play, Target, Sparkles, Brain, ArrowRight, GraduationCap, Clock, Award, BookOpenCheck, Lightbulb, Target as TargetIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"
import type { QuizQuestion, UserAnswer, QuizScore } from "@/app/types/quiz"
import { motion } from "framer-motion"
import { RoughNotation, RoughNotationGroup } from "react-rough-notation"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { useCoins } from "@/contexts/CoinsContext";
import { useActivity } from "@/contexts/ActivityContext";
import { useSession } from "next-auth/react";
import PDFUpload from "@/components/PDFUpload";

interface SuggestedTopic {
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  duration: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  progress: {
    [userId: string]: {
      score: number;
      date: string;
      answers: {
        questionId: number;
        selectedAnswer: number;
        isCorrect: boolean;
      }[];
    }[];
  };
}

// User ID is now handled by NextAuth session

function QuizInner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams()
  const userMode = searchParams.get("mode") || "adult"
  const isKidsMode = userMode === "kids"

  const [activeTab, setActiveTab] = useState("library")
  const [title, setTitle] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDifficulty, setSelectedDifficulty] = useState(isKidsMode ? 'easy' : 'beginner')
  const [numQuestions, setNumQuestions] = useState('5')
  const [content, setContent] = useState("")
  const [pdfText, setPdfText] = useState("")
  const [contentSource, setContentSource] = useState<"pdf" | "text">("pdf")
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false)
  const [roadmapData, setRoadmapData] = useState<any>(null)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [suggestedTopics, setSuggestedTopics] = useState<SuggestedTopic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>("")
  const [showProgress, setShowProgress] = useState(false)
  const [questionTypes, setQuestionTypes] = useState({
    multipleChoice: true,
    trueFalse: false,
    shortAnswer: false
  })
  const [isGeneratingExplanations, setIsGeneratingExplanations] = useState(false)

  const COLORS = ['#6C5CE7', '#A8A4E6', '#C4C1E6', '#E0DEE6'] as const

  // Handle PDF text extraction completion
  const handlePDFTextExtracted = (text: string) => {
    setPdfText(text);
    setContentSource('pdf');
    toast.success(`Extracted ${text.length} characters of text. Ready to generate quiz.`);
  };

  // Handle PDF extraction errors
  const handlePDFError = (errorMessage: string) => {
    toast.error(errorMessage);
  };

  // Add useEffect to load quizzes when component mounts
  useEffect(() => {
    fetchQuizzes()
  }, [])

  const handleGenerateQuiz = async () => {
    if (!title || (contentSource === "pdf" ? !pdfText : !content)) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('contentSource', contentSource)

      if (contentSource === "pdf") {
        formData.append('content', pdfText)
      } else {
        formData.append('content', content)
      }

      formData.append('isKidsMode', isKidsMode.toString())
      formData.append('numQuestions', numQuestions)

      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz')
      }

      const quiz: Quiz = {
        id: data.quiz.id,
        title: data.quiz.title,
        description: data.quiz.description,
        questions: data.quiz.questions,
        createdAt: new Date().toISOString(),
        progress: {}
      }

      setCurrentQuiz(quiz)
      await fetchQuizzes()
      setActiveTab("take-quiz")
      setUserAnswers({})
      setQuizSubmitted(false)
      setScore(null)
      toast.success('Quiz generated successfully!')

      // Reset form
      setTitle('')
      setPdfText('')
      setContent('')
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate quiz')
    } finally {
      setIsGenerating(false)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/list-quizzes')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quizzes')
      }

      setQuizzes(data.quizzes)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast.error('Failed to load quizzes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: optionIndex,
    })
  }

  const handleQuizSubmit = async () => {
    if (!currentQuiz) return

    let correctCount = 0
    const answers: {
      questionId: number;
      selectedAnswer: number;
      isCorrect: boolean;
    }[] = []

    currentQuiz.questions.forEach((question) => {
      const userAnswer = userAnswers[question.id] !== undefined ? userAnswers[question.id] : -1
      const isCorrect = userAnswer === question.correctAnswer

      if (isCorrect) {
        correctCount++
      }

      answers.push({
        questionId: question.id,
        selectedAnswer: userAnswer,
        isCorrect
      })
    })

    const score = {
      correct: correctCount,
      total: currentQuiz.questions.length,
    }

    const scorePercentage = (correctCount / currentQuiz.questions.length) * 100

    const newProgress = {
      score: scorePercentage,
      date: new Date().toISOString(),
      answers
    }

    // Only proceed if user is authenticated
    if (!session?.userId) {
      toast.error('Please sign in to save your quiz results');
      return;
    }

    // Create a new quiz object with updated progress
    const updatedQuiz = {
      ...currentQuiz,
      progress: {
        ...currentQuiz.progress,
        [session.userId]: [...(currentQuiz.progress && currentQuiz.progress[session.userId] ? currentQuiz.progress[session.userId] : []), newProgress]
      }
    }

    // Update the quiz in state
    setCurrentQuiz(updatedQuiz)

    // Save progress to database via API
    saveQuizProgress(updatedQuiz);

    // Update local state
    setQuizzes(prevQuizzes =>
      prevQuizzes.map(q => q.id === currentQuiz.id ? updatedQuiz : q)
    )

    // Set score and quiz submitted state
    setScore(score)
    setQuizSubmitted(true)

    // Track the quiz completion through our activity system
    await trackActivity('quiz', {
      quizId: currentQuiz.id,
      quizTitle: currentQuiz.title,
      score: score
    });

    // Trigger quiz refresh using the QuizComplete component's event
    const event = new CustomEvent('quizSubmitted');
    window.dispatchEvent(event);

    // Set a localStorage flag for cross-component communication
    localStorage.setItem('quizSubmitted', Date.now().toString());

    // Automatically generate roadmap after quiz submission
    handleGenerateRoadmap()
  }

  // Add function to save quiz progress to file
  const saveQuizProgress = async (quiz: Quiz) => {
    try {
      const response = await fetch("/api/save-quiz-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quiz }),
      });

      if (!response.ok) {
        throw new Error("Failed to save quiz progress");
      }

      // Success toast
      toast.success("Progress saved successfully!");
    } catch (error) {
      console.error("Error saving quiz progress:", error);
      toast.error("Failed to save quiz progress");
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz)
    setUserAnswers({})
    setQuizSubmitted(false)
    setScore(null)
    setActiveTab("take-quiz")
  }

  const resetQuiz = () => {
    setCurrentQuiz(null)
    setUserAnswers({})
    setQuizSubmitted(false)
    setScore(null)
    setActiveTab("library")
  }

  const handleGenerateRoadmap = async () => {
    if (!currentQuiz) return
    setIsLoadingRoadmap(true)
    try {
      // Get the quiz topic and performance
      const quizTopic = currentQuiz.title
      const performance = score ? (score.correct / score.total) : 0.5
      const experience = performance >= 0.7 ? "intermediate" : "beginner"

      // Generate suggested topics based on quiz content
      const suggestedTopics = [
        {
          title: "Fundamentals",
          description: "Master the basics of " + quizTopic,
          icon: "🎯",
          difficulty: "Beginner",
          duration: "2-3 weeks"
        },
        {
          title: "Core Concepts",
          description: "Understand core principles of " + quizTopic,
          icon: "📚",
          difficulty: "Beginner",
          duration: "2-3 weeks"
        },
        {
          title: "Advanced Concepts",
          description: "Deep dive into advanced " + quizTopic + " concepts",
          icon: "🚀",
          difficulty: "Intermediate",
          duration: "3-4 weeks"
        },
        {
          title: "Practical Applications",
          description: "Real-world applications of " + quizTopic,
          icon: "💡",
          difficulty: "Intermediate",
          duration: "3-4 weeks"
        },
        {
          title: "Advanced Applications",
          description: "Complex applications and use cases",
          icon: "⚡",
          difficulty: "Advanced",
          duration: "4-5 weeks"
        },
        {
          title: "Specialization",
          description: "Focus on specific areas of " + quizTopic,
          icon: "🎓",
          difficulty: "Advanced",
          duration: "4-5 weeks"
        },
        {
          title: "Expert Level",
          description: "Master advanced techniques and methodologies",
          icon: "🌟",
          difficulty: "Expert",
          duration: "5-6 weeks"
        },
        {
          title: "Research & Innovation",
          description: "Explore cutting-edge developments",
          icon: "🔬",
          difficulty: "Expert",
          duration: "5-6 weeks"
        }
      ]

      // Generate roadmap data with more focused stages
      const roadmapData = {
        title: `${quizTopic} Learning Path`,
        experience,
        timeEstimate: performance >= 0.7 ? "4-6 months" : "6-8 months",
        overview: `A practical ${experience} roadmap to learn ${quizTopic}, focusing on essential concepts and resources.`,
        stages: [
          {
            name: "Fundamentals",
            description: "Understanding basic concepts and principles",
            skills: ["Basic Concepts", "Key Principles", "Terminology", "Core Theories", "Basic Tools", "Setup & Installation"],
            duration: "2-3 weeks",
            resources: [
              { name: `${quizTopic} Basics Tutorial`, type: "video" },
              { name: `${quizTopic} Fundamentals Guide`, type: "article" },
              { name: `${quizTopic} Practice Exercises`, type: "exercise" },
              { name: `${quizTopic} Getting Started Guide`, type: "book" }
            ]
          },
          {
            name: "Core Concepts",
            description: "Mastering essential principles and theories",
            skills: ["Core Theories", "Basic Applications", "Problem Solving", "Analysis", "Data Structures", "Basic Algorithms"],
            duration: "2-3 weeks",
            resources: [
              { name: `${quizTopic} Core Course`, type: "course" },
              { name: `${quizTopic} Theory Guide`, type: "article" },
              { name: `${quizTopic} Core Exercises`, type: "exercise" },
              { name: `${quizTopic} Practice Problems`, type: "exercise" }
            ]
          },
          {
            name: "Advanced Concepts",
            description: "Exploring complex topics and advanced theories",
            skills: ["Advanced Topics", "Complex Applications", "Best Practices", "Problem Solving", "Algorithms", "Design Patterns"],
            duration: "3-4 weeks",
            resources: [
              { name: `${quizTopic} Advanced Course`, type: "course" },
              { name: `${quizTopic} Case Studies`, type: "article" },
              { name: `${quizTopic} Advanced Exercises`, type: "exercise" },
              { name: `${quizTopic} Advanced Tutorials`, type: "video" }
            ]
          },
          {
            name: "Practical Application",
            description: "Applying knowledge in real-world scenarios",
            skills: ["Project Work", "Case Studies", "Hands-on Practice", "Industry Best Practices", "Debugging", "Testing"],
            duration: "3-4 weeks",
            resources: [
              { name: `${quizTopic} Project Guide`, type: "book" },
              { name: `${quizTopic} Industry Examples`, type: "article" },
              { name: `${quizTopic} Final Project`, type: "course" },
              { name: `${quizTopic} Practice Projects`, type: "course" }
            ]
          },
          {
            name: "Advanced Applications",
            description: "Working on complex real-world applications",
            skills: ["Complex Projects", "System Design", "Architecture", "Integration", "Performance Optimization", "Security"],
            duration: "4-5 weeks",
            resources: [
              { name: `${quizTopic} Advanced Projects`, type: "course" },
              { name: `${quizTopic} System Design Guide`, type: "book" },
              { name: `${quizTopic} Advanced Case Studies`, type: "article" },
              { name: `${quizTopic} Enterprise Applications`, type: "course" }
            ]
          },
          {
            name: "Specialization",
            description: "Focusing on specific areas of expertise",
            skills: ["Specialized Knowledge", "Niche Applications", "Industry Focus", "Advanced Techniques", "Domain Expertise", "Custom Solutions"],
            duration: "4-5 weeks",
            resources: [
              { name: `${quizTopic} Specialization Course`, type: "course" },
              { name: `${quizTopic} Industry Guide`, type: "book" },
              { name: `${quizTopic} Specialized Projects`, type: "course" },
              { name: `${quizTopic} Domain-Specific Training`, type: "course" }
            ]
          },
          {
            name: "Expert Level",
            description: "Achieving mastery in advanced techniques",
            skills: ["Expert Knowledge", "Advanced Methodologies", "Innovation", "Leadership", "Mentoring", "Architecture Design"],
            duration: "5-6 weeks",
            resources: [
              { name: `${quizTopic} Expert Course`, type: "course" },
              { name: `${quizTopic} Advanced Research`, type: "article" },
              { name: `${quizTopic} Expert Workshops`, type: "course" },
              { name: `${quizTopic} Master Class`, type: "course" }
            ]
          },
          {
            name: "Research & Innovation",
            description: "Exploring cutting-edge developments and research",
            skills: ["Research Methods", "Innovation", "Future Trends", "Emerging Technologies", "Publication", "Patent Development"],
            duration: "5-6 weeks",
            resources: [
              { name: `${quizTopic} Research Methods`, type: "course" },
              { name: `${quizTopic} Innovation Guide`, type: "book" },
              { name: `${quizTopic} Research Projects`, type: "course" },
              { name: `${quizTopic} Future Trends`, type: "course" }
            ]
          }
        ],
        resources: [
          { name: `${quizTopic} Fundamentals Course`, type: "course" },
          { name: `${quizTopic} Practice Exercises`, type: "exercise" },
          { name: `${quizTopic} Study Guide`, type: "book" },
          { name: `${quizTopic} Video Tutorials`, type: "video" },
          { name: `${quizTopic} Community Forum`, type: "community" },
          { name: `${quizTopic} Research Papers`, type: "article" },
          { name: `${quizTopic} Expert Interviews`, type: "video" },
          { name: `${quizTopic} Industry Reports`, type: "article" },
          { name: `${quizTopic} Code Examples`, type: "exercise" },
          { name: `${quizTopic} Best Practices Guide`, type: "book" }
        ],
        proTips: [
          "Practice regularly by building small projects",
          "Join communities for help and support",
          "Experiment with different resources and find what works best for you",
          "Track your progress and celebrate milestones",
          "Share your learning journey with others",
          "Review and revise concepts regularly",
          "Build a portfolio of projects",
          "Network with other learners and experts"
        ]
      }

      // Save the roadmap data to our API
      try {
        const saveResponse = await fetch('/api/save-roadmap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roadmap: roadmapData,
            userId: session?.userId
          }),
        });

        if (!saveResponse.ok) {
          console.error('Failed to save roadmap');
        } else {
          const saveData = await saveResponse.json();
          console.log('Roadmap saved successfully:', saveData);
          toast.success('Roadmap saved successfully!');
        }
      } catch (saveError) {
        console.error('Error saving roadmap:', saveError);
      }

      setRoadmapData(roadmapData)
      setShowRoadmap(true)
      setSuggestedTopics(suggestedTopics)
    } catch (error) {
      console.error('Error generating roadmap:', error)
      toast.error('Failed to generate roadmap')
    } finally {
      setIsLoadingRoadmap(false)
    }
  }

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic)

    // Save the selected roadmap before navigating
    if (roadmapData) {
      fetch('/api/save-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roadmap: {
            ...roadmapData,
            title: `${topic} Learning Path` // Ensure the title matches the selected topic
          },
          userId: session?.userId
        }),
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Failed to save roadmap');
        })
        .then(data => {
          console.log('Roadmap saved:', data);
          // Navigate to roadmap page with the ID
          window.location.href = `/roadmap?topic=${encodeURIComponent(topic)}&experience=${score && score.correct >= score.total / 2 ? "intermediate" : "beginner"}&roadmapId=${data.roadmapId}`;
        })
        .catch(error => {
          console.error('Error saving roadmap:', error);
          // Navigate anyway even if save fails
          window.location.href = `/roadmap?topic=${encodeURIComponent(topic)}&experience=${score && score.correct >= score.total / 2 ? "intermediate" : "beginner"}`;
        });
    } else {
      // If no roadmap data, just navigate
      window.location.href = `/roadmap?topic=${encodeURIComponent(topic)}&experience=${score && score.correct >= score.total / 2 ? "intermediate" : "beginner"}`;
    }
  }

  // Add function to generate explanations for the current quiz
  const generateExplanations = async () => {
    if (!currentQuiz) return;

    setIsGeneratingExplanations(true);
    try {
      const response = await fetch(`/api/update-quiz-explanation?id=${currentQuiz.id}`);

      if (!response.ok) {
        throw new Error('Failed to generate explanations');
      }

      const data = await response.json();

      // If successful, update the current quiz and show a success message
      if (data.success) {
        setCurrentQuiz(data.quiz);
        toast.success('Explanations generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate explanations');
      }
    } catch (error) {
      console.error('Error generating explanations:', error);
      toast.error('Failed to generate explanations. Please try again.');
    } finally {
      setIsGeneratingExplanations(false);
    }
  };

  const { coins, refreshCoins } = useCoins();
  const { trackActivity } = useActivity();

  // Show loading state while session is loading
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">Sign In Required</h1>
          <p className="text-gray-600">Please sign in to access the AI Quiz Generator.</p>
          <Button onClick={() => window.location.href = '/auth/signin'} className="bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/ai-notes"
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold cursor-pointer hover:-translate-y-0.5 transition duration-200 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300 text-gray-700 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset] mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">AI Quiz Generator</h1>
          <Link href="/my-roadmap">
            <Button className="bg-[#5C5FFF] hover:bg-[#5C5FFF]/90 text-white">
              <TargetIcon className="mr-2 h-4 w-4" />
              View Generated Roadmaps
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-[#6C5CE7]/5 p-1 text-[#6C5CE7]">
              <TabsTrigger
                value="library"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-[#6C5CE7]/10 data-[state=active]:hover:bg-[#6C5CE7]"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                My Quizzes
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-[#6C5CE7]/10 data-[state=active]:hover:bg-[#6C5CE7]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </TabsTrigger>
              {currentQuiz && (
                <TabsTrigger
                  value="take-quiz"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-[#6C5CE7]/10 data-[state=active]:hover:bg-[#6C5CE7]"
                >
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  {currentQuiz.title.split(' ')[0]}
                </TabsTrigger>
              )}
            </TabsList>

            {activeTab === "library" && (
              <Button
                onClick={() => setActiveTab("create")}
                className="mt-4 md:mt-0 bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white relative overflow-hidden group transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#6C5CE7] to-[#8E5CE7] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>New Quiz</span>
                </div>
              </Button>
            )}
          </div>

          <TabsContent value="library" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">My Quiz Library</h2>
                    <p className="text-slate-600">
                      {isKidsMode ? "Test your knowledge with fun quizzes!" : "Your AI-generated quizzes from study notes"}
                    </p>
                  </div>
                  <div>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-[#5C5FFF]" />
                        </div>
                      ) : quizzes.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="relative mx-auto w-16 h-16 mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#5C5FFF] to-[#FF647C] opacity-20 rounded-full blur-xl animate-pulse" />
                            <BookOpen className="relative w-16 h-16 text-[#5C5FFF]" />
                          </div>
                          <p className="text-gray-500">No quizzes found. Create your first one!</p>
                        </div>
                      ) : (
                        quizzes.map((quiz) => (
                          <motion.div
                            key={quiz.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative overflow-hidden rounded-[28px] border bg-white shadow-sm transition-all hover:shadow-lg"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#6C5CE7]/5 via-[#8E5CE7]/5 to-[#a78bfa]/5 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="relative flex items-center p-6">
                              <div className="relative flex-shrink-0 bg-purple-400">
                                <div className="relative h-24 w-24 overflow-hidden radius shadow-lg transform transition-transform group-hover:scale-105">
                                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-white/90 filter drop-shadow-lg transform transition-transform group-hover:scale-110">
                                      {quiz.title.charAt(0)}
                                    </span>
                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/70 bg-black/20 px-2 py-0.5 rounded-full">
                                        {quiz.questions.length} Questions
                                      </span>
                                    </div>
                                  </div>
                                  <div className="absolute inset-0 ring-1 ring-inset ring-white/20" />
                                </div>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="absolute -bottom-3 -right-3 h-10 w-10 rounded-[16px] bg-white hover:bg-[#6C5CE7] text-[#6C5CE7] hover:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:shadow-xl border border-[#6C5CE7]/20 backdrop-blur-sm"
                                  onClick={() => startQuiz(quiz)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="ml-6 flex-grow min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-[#1E1E2E] leading-none tracking-tight truncate text-lg">
                                    {quiz.title}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="flex-shrink-0 text-[#6C5CE7] hover:text-white hover:bg-[#6C5CE7] rounded-[14px] transition-all duration-300"
                                      onClick={() => {
                                        setCurrentQuiz(quiz);
                                        setShowProgress(true);
                                      }}
                                    >
                                      <Target className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="flex-shrink-0 text-[#6C5CE7] hover:text-white hover:bg-[#6C5CE7] rounded-[14px] transition-all duration-300"
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 line-clamp-1">
                                  {quiz.description}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-[#6C5CE7]/5 text-[#6C5CE7] rounded-full px-4 py-1 font-medium border-0 hover:bg-[#6C5CE7]/10 transition-colors">
                                    {new Date(quiz.createdAt).toLocaleDateString()}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[#6C5CE7] border-[#6C5CE7]/20 hover:bg-[#6C5CE7]/5 hover:border-[#6C5CE7]/30 transition-all duration-300"
                                    onClick={() => {
                                      setCurrentQuiz(quiz);
                                      setShowProgress(true);
                                    }}
                                  >
                                    <Target className="h-3 w-3 mr-1" />
                                    View History
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Quiz Settings                    </h3>
                  </div>
                  <div>
                    <div className="space-y-4">
                      <div>
                        <Label>Difficulty Level</Label>
                        <select
                          className="w-full rounded-md border border-gray-300 p-2 text-sm mt-1"
                          value={selectedDifficulty}
                          onChange={(e) => setSelectedDifficulty(e.target.value)}
                        >
                          {isKidsMode ? (
                            <>
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </>
                          ) : (
                            <>
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <Label>Number of Questions</Label>
                        <select
                          className="w-full rounded-md border border-gray-300 p-2 text-sm mt-1"
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(e.target.value)}
                        >
                          <option value="5">5 questions</option>
                          <option value="10">10 questions</option>
                          <option value="15">15 questions</option>
                          <option value="20">20 questions</option>
                        </select>
                      </div>

                      <div>
                        <Label>Question Types</Label>
                        <div className="space-y-2 mt-1">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="multiple-choice"
                              className="rounded border-gray-300 mr-2"
                              checked={questionTypes.multipleChoice}
                              onChange={(e) => setQuestionTypes(prev => ({ ...prev, multipleChoice: e.target.checked }))}
                            />
                            <Label htmlFor="multiple-choice" className="text-sm">
                              Multiple Choice
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="true-false"
                              className="rounded border-gray-300 mr-2"
                              checked={questionTypes.trueFalse}
                              onChange={(e) => setQuestionTypes(prev => ({ ...prev, trueFalse: e.target.checked }))}
                            />
                            <Label htmlFor="true-false" className="text-sm">
                              True/False
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="short-answer"
                              className="rounded border-gray-300 mr-2"
                              checked={questionTypes.shortAnswer}
                              onChange={(e) => setQuestionTypes(prev => ({ ...prev, shortAnswer: e.target.checked }))}
                            />
                            <Label htmlFor="short-answer" className="text-sm">
                              Short Answer
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Time Limit</Label>
                        <select className="w-full rounded-md border border-gray-300 p-2 text-sm mt-1">
                          <option value="none">No time limit</option>
                          <option value="5">5 minutes</option>
                          <option value="10">10 minutes</option>
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100 mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">AI Settings</h3>
                  </div>
                  <div>
                    <div className="space-y-4">
                      <div>
                        <Label>Question Style</Label>
                        <select className="w-full rounded-md border border-gray-300 p-2 text-sm mt-1">
                          {isKidsMode ? (
                            <>
                              <option value="fun">Fun & Engaging</option>
                              <option value="simple">Simple & Clear</option>
                              <option value="story">Story-based</option>
                            </>
                          ) : (
                            <>
                              <option value="academic">Academic</option>
                              <option value="practical">Practical Application</option>
                              <option value="analytical">Analytical Thinking</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <Label>Focus Areas</Label>
                        <Textarea
                          placeholder={
                            isKidsMode
                              ? "E.g., focus on fun facts about planets"
                              : "E.g., focus on neural network architectures"
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Create New Quiz</h2>
                    <p className="text-slate-600">
                      {isKidsMode
                        ? "Turn your notes into a fun quiz!"
                        : "Convert your study notes into an engaging quiz"}
                    </p>
                  </div>
                  <div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Quiz Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter quiz title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Content Source</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${contentSource === "pdf"
                              ? "border-[#6C5CE7] bg-[#6C5CE7]/5"
                              : "border-gray-200 hover:border-[#6C5CE7]/50"
                              }`}
                            onClick={() => setContentSource("pdf")}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${contentSource === "pdf"
                                ? "bg-[#6C5CE7] text-white"
                                : "bg-gray-100"
                                }`}>
                                <FileUp className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">Upload PDF</h3>
                                <p className="text-sm text-gray-500">Upload and extract text from PDF</p>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${contentSource === "text"
                              ? "border-[#6C5CE7] bg-[#6C5CE7]/5"
                              : "border-gray-200 hover:border-[#6C5CE7]/50"
                              }`}
                            onClick={() => setContentSource("text")}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${contentSource === "text"
                                ? "bg-[#6C5CE7] text-white"
                                : "bg-gray-100"
                                }`}>
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">Enter Text</h3>
                                <p className="text-sm text-gray-500">Paste your own content</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {contentSource === "pdf" ? (
                        <div className="space-y-2">
                          <Label>Upload PDF Document</Label>
                          <PDFUpload
                            onTextExtracted={handlePDFTextExtracted}
                            onError={handlePDFError}
                          />
                          {pdfText && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-700">
                                ✅ PDF text extracted successfully! ({pdfText.length} characters)
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Content</Label>
                          <Textarea
                            placeholder="Enter or paste your content here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[200px] bg-white focus:ring-2 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] transition-all"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Number of Questions</Label>
                        <select
                          className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#6C5CE7] focus:border-[#6C5CE7] transition-all"
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(e.target.value)}
                        >
                          <option value="5">5 questions</option>
                          <option value="10">10 questions</option>
                          <option value="15">15 questions</option>
                          <option value="20">20 questions</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-6 border-t border-slate-200">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("library")}
                      className="bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGenerateQuiz}
                      disabled={isGenerating || !title || (contentSource === "pdf" ? !pdfText : !content)}
                      className="relative overflow-hidden group bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6C5CE7] to-[#8E5CE7] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center">
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <BrainCircuit className="h-4 w-4 mr-2" />
                            <span>Generate Quiz</span>
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Quiz Settings</h3>
                  </div>
                  <div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                        <select
                          className="w-full rounded-md border-gray-200 p-2 text-sm"
                          value={selectedDifficulty}
                          onChange={(e) => setSelectedDifficulty(e.target.value)}
                        >
                          {isKidsMode ? (
                            <>
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </>
                          ) : (
                            <>
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                        <select
                          className="w-full rounded-md border-gray-200 p-2 text-sm"
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(e.target.value)}
                        >
                          <option value="5">5 questions</option>
                          <option value="10">10 questions</option>
                          <option value="15">15 questions</option>
                          <option value="20">20 questions</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question Types</label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="multiple-choice"
                              className="rounded border-gray-200 text-[#5C5FFF]"
                              checked={questionTypes.multipleChoice}
                              onChange={(e) => setQuestionTypes(prev => ({ ...prev, multipleChoice: e.target.checked }))}
                            />
                            <label htmlFor="multiple-choice" className="ml-2 text-sm text-gray-600">
                              Multiple Choice
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="true-false"
                              className="rounded border-gray-200 text-[#5C5FFF]"
                              checked={questionTypes.trueFalse}
                              onChange={(e) => setQuestionTypes(prev => ({ ...prev, trueFalse: e.target.checked }))}
                            />
                            <label htmlFor="true-false" className="ml-2 text-sm text-gray-600">
                              True/False
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="short-answer"
                              className="rounded border-gray-200 text-[#5C5FFF]"
                              checked={questionTypes.shortAnswer}
                              onChange={(e) => setQuestionTypes(prev => ({ ...prev, shortAnswer: e.target.checked }))}
                            />
                            <label htmlFor="short-answer" className="ml-2 text-sm text-gray-600">
                              Short Answer
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent >

          <TabsContent value="take-quiz" className="mt-0">
            {currentQuiz && (
              <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800 mb-2">{currentQuiz.title}</h2>
                      <p className="text-slate-600">{currentQuiz.description}</p>
                    </div>
                    {!quizSubmitted && (
                      <Badge variant="secondary" className="bg-[#6C5CE7]/5 text-[#6C5CE7] rounded-full px-4 py-1 font-medium border-0">
                        {currentQuiz.questions.length} Questions
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  {quizSubmitted && score ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Performance Summary */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <div className="text-center mb-6">
                            <div className="relative mx-auto w-32 h-32 mb-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={[
                                      { name: 'Correct', value: score.correct },
                                      { name: 'Incorrect', value: score.total - score.correct }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    {COLORS.map((color: string, index: number) => (
                                      <Cell key={`cell-${index}`} fill={color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-[#6C5CE7]">
                                  {Math.round((score.correct / score.total) * 100)}%
                                </span>
                              </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                              {score.correct === score.total
                                ? "Perfect Score!"
                                : score.correct >= score.total / 2
                                  ? "Good Job!"
                                  : "Keep Practicing!"}
                            </h3>
                            <p className="text-gray-500">
                              You got {score.correct} out of {score.total} questions correct.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-[#6C5CE7]/5 rounded-lg p-4">
                              <h4 className="font-semibold text-[#6C5CE7] mb-2">Performance Insights</h4>
                              <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-[#6C5CE7]" />
                                  <span>Accuracy: {Math.round((score.correct / score.total) * 100)}%</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <Brain className="h-4 w-4 text-[#6C5CE7]" />
                                  <span>Questions Completed: {score.total}</span>
                                </li>
                              </ul>
                            </div>

                            <div className="bg-[#6C5CE7]/5 rounded-lg p-4">
                              <h4 className="font-semibold text-[#6C5CE7] mb-2">Suggestions</h4>
                              <ul className="space-y-2 text-sm text-gray-600">
                                {score.correct === score.total ? (
                                  <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-[#6C5CE7]" />
                                    <span>Excellent performance! Try more challenging quizzes.</span>
                                  </li>
                                ) : score.correct >= score.total / 2 ? (
                                  <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-[#6C5CE7]" />
                                    <span>Good understanding! Focus on areas where you made mistakes.</span>
                                  </li>
                                ) : (
                                  <li className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-[#6C5CE7]" />
                                    <span>Review the concepts and try the quiz again.</span>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Learning Path */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                          <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold mb-3">Your Learning Path</h3>
                            <p className="text-gray-500 text-lg">
                              A personalized roadmap to master {currentQuiz.title}
                            </p>
                          </div>

                          {isLoadingRoadmap ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-[#6C5CE7]" />
                            </div>
                          ) : roadmapData && (
                            <div className="space-y-8">
                              {/* Display all 8 stages */}
                              {roadmapData.stages.map((stage: any, index: number) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6C5CE7]/10 flex items-center justify-center">
                                      <span className="text-xl font-bold text-[#6C5CE7]">{index + 1}</span>
                                    </div>
                                    <div className="flex-grow">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-lg font-semibold text-[#1E1E2E]">{stage.name}</h4>
                                        <Badge variant="secondary" className="bg-[#6C5CE7]/5 text-[#6C5CE7] rounded-full px-3 py-1">
                                          {stage.duration}
                                        </Badge>
                                      </div>
                                      <p className="text-gray-600 mb-4">{stage.description}</p>

                                      <div className="space-y-4">
                                        <div>
                                          <h5 className="font-medium text-[#6C5CE7] mb-2">Skills to Learn:</h5>
                                          <div className="flex flex-wrap gap-2">
                                            {stage.skills.map((skill: string, skillIndex: number) => (
                                              <Badge
                                                key={skillIndex}
                                                variant="outline"
                                                className="bg-white border-[#6C5CE7]/20 text-[#6C5CE7] hover:bg-[#6C5CE7]/5"
                                              >
                                                {skill}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <h5 className="font-medium text-[#6C5CE7] mb-2">Resources:</h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {stage.resources.map((resource: any, resourceIndex: number) => (
                                              <div
                                                key={resourceIndex}
                                                className="flex items-center gap-2 text-sm text-gray-600"
                                              >
                                                <div className="w-6 h-6 rounded-full bg-[#6C5CE7]/10 flex items-center justify-center">
                                                  {resource.type === "video" && <Play className="h-3 w-3 text-[#6C5CE7]" />}
                                                  {resource.type === "article" && <FileText className="h-3 w-3 text-[#6C5CE7]" />}
                                                  {resource.type === "course" && <GraduationCap className="h-3 w-3 text-[#6C5CE7]" />}
                                                  {resource.type === "exercise" && <Target className="h-3 w-3 text-[#6C5CE7]" />}
                                                </div>
                                                <span>{resource.name}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}

                              {/* Pro Tips Section */}
                              <div className="bg-[#6C5CE7]/5 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                  <Lightbulb className="h-6 w-6 text-[#6C5CE7]" />
                                  <h4 className="font-semibold text-[#6C5CE7] text-lg">Pro Tips</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {roadmapData.proTips.map((tip: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3">
                                      <Sparkles className="h-5 w-5 text-[#6C5CE7] mt-0.5" />
                                      <span className="text-gray-600">{tip}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Additional Resources */}
                              <div className="bg-[#6C5CE7]/5 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                  <BookOpenCheck className="h-6 w-6 text-[#6C5CE7]" />
                                  <h4 className="font-semibold text-[#6C5CE7] text-lg">Additional Resources</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {roadmapData.resources.map((resource: any, index: number) => (
                                    <div key={index} className="flex items-center gap-3 text-base text-gray-600">
                                      <GraduationCap className="h-5 w-5 text-[#6C5CE7]" />
                                      <span>{resource.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Button
                                onClick={() => handleTopicSelect(currentQuiz.title)}
                                className="w-full bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white relative overflow-hidden group transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl py-6 text-lg"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#6C5CE7] to-[#8E5CE7] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex items-center justify-center">
                                  <Target className="h-5 w-5 mr-2" />
                                  <span>View Full Roadmap</span>
                                </div>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Question Review */}
                      <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">Question Review</h3>
                          {currentQuiz.questions.some(q => !q.explanation || q.explanation === "" || q.explanation.includes("The correct answer is option")) && (
                            <Button
                              onClick={generateExplanations}
                              disabled={isGeneratingExplanations}
                              className="bg-purple-500 hover:bg-purple-600 text-white flex items-center"
                              size="sm"
                            >
                              {isGeneratingExplanations ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  <span>Generating Explanations...</span>
                                </>
                              ) : (
                                <>
                                  <Lightbulb className="h-4 w-4 mr-2" />
                                  <span>Add Detailed Explanations</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        <div className="space-y-6">
                          {currentQuiz.questions.map((question, index) => {
                            const userAnswer = userAnswers[question.id] !== undefined ? userAnswers[question.id] : -1
                            const isCorrect = userAnswer === question.correctAnswer

                            return (
                              <motion.div
                                key={question.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-lg border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                                  }`}
                              >
                                <div className="flex items-start">
                                  <div
                                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${isCorrect ? "bg-green-500" : "bg-red-500"
                                      } text-white`}
                                  >
                                    {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium mb-2">
                                      {index + 1}. {question.question}
                                    </h4>
                                    <div className="space-y-2">
                                      {question.options.map((option: string, optionIndex: number) => (
                                        <div
                                          key={optionIndex}
                                          className={`p-2 rounded ${optionIndex === question.correctAnswer
                                            ? "bg-green-100 border border-green-200"
                                            : optionIndex === userAnswer
                                              ? "bg-red-100 border border-red-200"
                                              : "bg-gray-50 border border-gray-200"
                                            }`}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center mr-2 text-xs">
                                              {String.fromCharCode(65 + optionIndex)}
                                            </div>
                                            <span>{option}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Answer Explanation */}
                                    <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                                      <div className="flex items-start">
                                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                                          <Lightbulb className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-purple-700 mb-1">Explanation</h5>
                                          <p className="text-gray-700 text-sm">{question.explanation || "The correct answer is option " + String.fromCharCode(65 + question.correctAnswer) + "."}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {currentQuiz.questions.map((question, index) => (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-all"
                        >
                          <h3 className="text-lg font-medium mb-4">
                            {index + 1}. {question.question}
                          </h3>
                          <RadioGroup
                            onValueChange={(value) => handleAnswerSelect(question.id, Number.parseInt(value))}
                            value={userAnswers[question.id]?.toString() || ""}
                          >
                            <div className="space-y-3">
                              {question.options.map((option: string, optionIndex: number) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 transition-colors"
                                >
                                  <RadioGroupItem
                                    value={optionIndex.toString()}
                                    id={`q${question.id}-o${optionIndex}`}
                                  />
                                  <Label
                                    htmlFor={`q${question.id}-o${optionIndex}`}
                                    className="flex items-center cursor-pointer"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2 text-xs">
                                      {String.fromCharCode(65 + optionIndex)}
                                    </div>
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-between pt-6 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={resetQuiz}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    {quizSubmitted ? "Back to Quizzes" : "Cancel"}
                  </Button>
                  {!quizSubmitted && (
                    <Button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(userAnswers).length < currentQuiz.questions.length}
                      className="relative overflow-hidden group bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6C5CE7] to-[#8E5CE7] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        <span>Submit Quiz</span>
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {showProgress && currentQuiz && session?.userId && (
          <QuizProgress
            quiz={currentQuiz}
            onClose={() => setShowProgress(false)}
            userId={session.userId}
            startQuiz={startQuiz}
          />
        )}
      </div>
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={null}>
      <QuizInner />
    </Suspense>
  )
}

function QuizProgress({
  quiz,
  onClose,
  userId,
  startQuiz
}: {
  quiz: Quiz;
  onClose: () => void;
  userId: string;
  startQuiz: (quiz: Quiz) => void;
}) {
  const userProgress = quiz.progress && quiz.progress[userId] ? quiz.progress[userId] : [];
  const [isGeneratingExplanations, setIsGeneratingExplanations] = useState(false);

  // Check if the quiz has explanations
  const needsExplanations = quiz.questions.some(q =>
    !q.explanation ||
    q.explanation === "" ||
    q.explanation.includes("The correct answer is option"));

  // Function to generate explanations
  const generateExplanations = async () => {
    setIsGeneratingExplanations(true);
    try {
      const response = await fetch(`/api/update-quiz-explanation?id=${quiz.id}`);

      if (!response.ok) {
        throw new Error('Failed to generate explanations');
      }

      const data = await response.json();

      // If successful, show a success message
      if (data.success) {
        toast.success('Explanations generated successfully!');
        // Refresh the page to show the explanations
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to generate explanations');
      }
    } catch (error) {
      console.error('Error generating explanations:', error);
      toast.error('Failed to generate explanations. Please try again.');
    } finally {
      setIsGeneratingExplanations(false);
    }
  };

  // Format data for the line chart
  const chartData = userProgress.map((attempt, index) => ({
    name: `Attempt ${index + 1}`,
    score: attempt.score,
    timestamp: new Date(attempt.date).getTime(),
    date: new Date(attempt.date).toLocaleDateString(),
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto ml-64">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Quiz Progress History</h2>
          <div className="flex items-center gap-2">
            {needsExplanations && (
              <Button
                onClick={generateExplanations}
                disabled={isGeneratingExplanations}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                {isGeneratingExplanations ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Add Explanations
                  </>
                )}
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {userProgress.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 mb-4 text-gray-300">
              <Target className="w-16 h-16" />
            </div>
            <p className="text-gray-500 mb-2">No attempts recorded yet.</p>
            <p className="text-sm text-gray-400">Take this quiz to start building your progress history!</p>
            <Button
              onClick={() => {
                onClose();
                startQuiz(quiz);
              }}
              className="mt-4 bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white"
            >
              Start Quiz
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Performance</h3>
              <Badge variant="outline" className="px-3 py-1">
                {userProgress.length} {userProgress.length === 1 ? 'Attempt' : 'Attempts'}
              </Badge>
            </div>

            {/* Progress visualization with recharts */}
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h4 className="text-md font-semibold mb-4">Score Progression</h4>
              <div className="h-64 w-full">
                {chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border rounded shadow-sm">
                              <p className="font-medium">{payload[0].payload.date}</p>
                              <p className="text-[#6C5CE7]">{`Score: ${payload[0].value}%`}</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#6C5CE7"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        dot={{
                          stroke: '#6C5CE7',
                          strokeWidth: 2,
                          r: 4,
                          fill: 'white'
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="flex items-center justify-center mt-8 text-sm text-gray-500">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span>Good (≥70%)</span>
                </div>
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                  <span>Average (40-69%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span>Needs Improvement (&lt;40%)</span>
                </div>
              </div>
            </div>

            <h4 className="text-md font-semibold">Detailed History</h4>
            <div className="space-y-4">
              {userProgress.map((attempt, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Attempt {index + 1}</span>
                    <span className={`px-2 py-1 rounded ${attempt.score >= 70 ? 'bg-green-100 text-green-800' :
                      attempt.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {attempt.score.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(attempt.date).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Answers:</p>
                    <ul className="mt-1 space-y-1">
                      {attempt.answers.map((answer, qIndex) => (
                        <li key={qIndex} className="text-sm flex items-center">
                          <span className={`w-5 h-5 mr-2 rounded-full flex items-center justify-center text-xs ${answer.isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {answer.isCorrect ? '✓' : '✗'}
                          </span>
                          Question {qIndex + 1}: {answer.isCorrect ? 'Correct' : 'Incorrect'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

