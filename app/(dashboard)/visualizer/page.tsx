"use client";

import { ArrowRight, Play, Sparkles, Video, Lightbulb, History, Bookmark, Info, Clock, Tag, ChevronDown, FileText, AlertCircle, Coins as CoinsIcon } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useActivity } from "@/contexts/ActivityContext";
import { useCoins } from "@/contexts/CoinsContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Cost in coins to use the visualizer
const VISUALIZER_COST = 50;

interface VideoInfo {
    duration: string;
    mainTopic: {
        title: string;
        description: string;
        prerequisites: string[];
    };
    concepts: {
        name: string;
        keyPoints: string[];
        importance: string;
    }[];
    segments: {
        title: string;
        timestamp: string;
        learningPoints: string[];
        equations?: string[];
        studyTips: string;
    }[];
    practicalApplications: {
        field: string;
        examples: string[];
    }[];
    commonMisconceptions: {
        concept: string;
        misconception: string;
        correction: string;
    }[];
    furtherResources: {
        type: string;
        links: string[];
    }[];
}

export default function Visualizer() {
    const [prompt, setPrompt] = useState<string>("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [videoLoading, setVideoLoading] = useState<boolean>(true);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [videoProgress, setVideoProgress] = useState<number>(0);
    const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
    const [topicInfo, setTopicInfo] = useState<VideoInfo | null>(null);
    const [showInsufficientCoinsDialog, setShowInsufficientCoinsDialog] = useState(false);
    const { trackActivity } = useActivity();
    const { coins, refreshCoins } = useCoins();
    const { toast } = useToast();

    // Update suggestions with multi-concept examples
    const getSuggestions = (input: string) => {
        const allSuggestions = [
            "Explain quantum mechanics: from wave-particle duality to quantum entanglement, showing electron behavior, probability waves, and measurement effects",
            "Demonstrate the complete electromagnetic spectrum: from radio waves to gamma rays, showing wavelength relationships, energy levels, and real-world applications",
            "Visualize calculus fundamentals: start with limits, continue through derivatives, integrals, and end with fundamental theorem connecting them all",
            "Show the evolution of our solar system: from formation to planetary motions, including Kepler's laws, gravitational effects, and orbital mechanics",
            "Explain thermodynamics cycle completely: from heat engines to entropy, showing PV diagrams, heat flow, and efficiency calculations with real examples",
            "Demonstrate fluid dynamics: from laminar flow to turbulence, showing pressure changes, Bernoulli's principle, and vortex formation in detail"
        ];
        return input.length > 0
            ? allSuggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()))
            : allSuggestions.slice(0, 3);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setPrompt(suggestion);
        setSelectedSuggestion(suggestion);
        setShowSuggestions(false);
    };

    const checkAndDeductCoins = async (): Promise<boolean> => {
        try {
            // Call the API to check and deduct coins
            const response = await fetch('/api/user/deduct-visualizer-coins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 402 || data.error === 'Insufficient coins') {
                    setShowInsufficientCoinsDialog(true);
                    return false;
                } else {
                    toast({
                        title: "Error",
                        description: data.error || "Failed to process coin deduction",
                        variant: "destructive",
                    });
                    return false;
                }
            }
            
            // Update local coin count
            refreshCoins();
            
            // Show a confirmation toast
            toast({
                title: "Coins Deducted",
                description: `${VISUALIZER_COST} coins have been deducted from your account.`,
            });
            
            return true;
            
        } catch (error) {
            console.error('Error checking coins:', error);
            toast({
                title: "Error",
                description: "Failed to verify coin balance",
                variant: "destructive",
            });
            return false;
        }
    };

    const handleVisualize = async () => {
        if (!prompt.trim()) {
            setError("Please enter a topic");
            return;
        }

        const hasEnoughCoins = await checkAndDeductCoins();
        if (!hasEnoughCoins) {
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");
        setVideoUrl("");

        try {
            await trackActivity('visualization', {
                prompt: prompt.trim(),
                timestamp: new Date().toISOString()
            });
            
            const response = await fetch('/api/generate-animation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt.trim()
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error (${response.status})`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.videoUrl) {
                throw new Error("Video URL not found in response");
            }

            setVideoUrl(data.videoUrl);
            setMessage(data.message || "Video generated successfully!");

            const topicResponse = await fetch('/api/generate-topic-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt.trim()
                })
            });

            if (topicResponse.ok) {
                const topicData = await topicResponse.json();
                setTopicInfo(topicData);
            }
        } catch (error) {
            console.error('Visualization Error:', error);
            setError(error instanceof Error
                ? error.message
                : 'Failed to generate video. Please try again later.');
            setLoading(false);
        }
    };

    // Add video event handlers
    const handleVideoLoad = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        setVideoLoading(false);
        setVideoError(null);
    };

    const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        setVideoLoading(false);
        setVideoError("Error loading video. Please try refreshing.");
        console.error("Video Error:", event);
    };

    const handleVideoProgress = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = event.currentTarget;
        setVideoProgress((video.currentTime / video.duration) * 100);
    };

    const handleDownload = async () => {
        if (!videoUrl) return;

        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `animation-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            setError('Failed to download video');
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Subtle grid background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px)
                        `,
                        backgroundSize: '64px 64px'
                    }}
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold text-gray-900 tracking-tight mb-4">
                        AI <span className="text-indigo-600">Visualizer</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
                        Transform complex concepts into intuitive visual experiences
                    </p>
                    <div className="flex items-center justify-center text-amber-600 font-medium">
                        <CoinsIcon className="h-5 w-5 mr-2" />
                        <span>Cost: {VISUALIZER_COST} coins per visualization</span>
                        <span className="ml-4">Your balance: {coins} coins</span>
                    </div>
                </div>

                {/* Main input area */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Describe the mathematical concept you want to visualize..."
                            className="w-full px-8 py-6 bg-white text-lg text-gray-900 rounded-2xl 
                                     border border-gray-200 shadow-sm focus:border-indigo-500 
                                     focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                setSuggestions(getSuggestions(e.target.value));
                            }}
                        />
                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 
                                     bg-indigo-600 text-white rounded-xl font-medium 
                                     hover:bg-indigo-700 shadow-lg hover:shadow-xl
                                     transition-all duration-300 flex items-center gap-2"
                            onClick={handleVisualize}
                            disabled={loading || !prompt.trim()}
                        >
                            <Sparkles className="h-5 w-5" />
                            {loading ? 'Generating...' : 'Visualize'}
                        </button>
                    </div>

                    {/* Suggestions */}
                    {showSuggestions && (
                        <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="w-full text-left px-6 py-4 text-gray-700 hover:bg-indigo-50 
                                             transition-colors flex items-center gap-3 first:rounded-t-xl last:rounded-b-xl"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <Lightbulb className="h-5 w-5 text-indigo-500" />
                                    <span>{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Results Area */}
                {videoUrl && !loading && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Video Player */}
                            <div className="relative aspect-video">
                                <video
                                    controls
                                    className="w-full h-full object-contain"
                                    src={videoUrl}
                                    autoPlay
                                    preload="auto"
                                    playsInline
                                    onLoadedData={handleVideoLoad}
                                    onError={handleVideoError}
                                    onTimeUpdate={handleVideoProgress}
                                    onWaiting={() => setVideoLoading(true)}
                                    onPlaying={() => setVideoLoading(false)}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            {/* Download Button */}
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                                <button
                                    onClick={handleDownload}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Download Video
                                </button>
                            </div>
                        </div>

                        {/* Topic Information Section */}
                        {topicInfo && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Info className="h-6 w-6 text-indigo-600" />
                                    <h2 className="text-2xl font-bold text-gray-900">Topic Information</h2>
                                </div>

                                {/* Main Topic */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Main Topic</h3>
                                    <div className="bg-indigo-50 rounded-lg p-4">
                                        <h4 className="font-medium text-indigo-900 mb-2">{topicInfo.mainTopic.title}</h4>
                                        <p className="text-gray-700 mb-4">{topicInfo.mainTopic.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {topicInfo.mainTopic.prerequisites.map((prereq, index) => (
                                                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                                                    {prereq}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Key Concepts */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Concepts</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {topicInfo.concepts.map((concept, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-2">{concept.name}</h4>
                                                <ul className="space-y-2 text-gray-600">
                                                    {concept.keyPoints.map((point, pointIndex) => (
                                                        <li key={pointIndex} className="flex items-start gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                                                            <span>{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="mt-3 text-sm text-indigo-600">
                                                    <span className="font-medium">Importance:</span> {concept.importance}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Video Segments */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Video Segments</h3>
                                    <div className="space-y-4">
                                        {topicInfo.segments.map((segment, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-900">{segment.title}</h4>
                                                    <span className="text-sm text-indigo-600">{segment.timestamp}</span>
                                                </div>
                                                <ul className="space-y-2 text-gray-600 mb-3">
                                                    {segment.learningPoints.map((point, pointIndex) => (
                                                        <li key={pointIndex} className="flex items-start gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                                                            <span>{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {segment.equations && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <h5 className="font-medium text-gray-900 mb-2">Key Equations:</h5>
                                                        <ul className="space-y-2">
                                                            {segment.equations.map((equation, eqIndex) => (
                                                                <li key={eqIndex} className="text-gray-700">{equation}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                <div className="mt-3 text-sm text-indigo-600">
                                                    <span className="font-medium">Study Tip:</span> {segment.studyTips}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Practical Applications */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Practical Applications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {topicInfo.practicalApplications.map((app, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-2">{app.field}</h4>
                                                <ul className="space-y-2 text-gray-600">
                                                    {app.examples.map((example, exIndex) => (
                                                        <li key={exIndex} className="flex items-start gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                                                            <span>{example}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Common Misconceptions */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Common Misconceptions</h3>
                                    <div className="space-y-4">
                                        {topicInfo.commonMisconceptions.map((misconception, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-2">{misconception.concept}</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                                                        <span className="text-gray-600">{misconception.misconception}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                                                        <span className="text-gray-600">{misconception.correction}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Further Resources */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Further Resources</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {topicInfo.furtherResources.map((resource, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {resource.type === 'book' && <Bookmark className="h-5 w-5 text-indigo-600" />}
                                                    {resource.type === 'video' && <Video className="h-5 w-5 text-indigo-600" />}
                                                    {resource.type === 'article' && <FileText className="h-5 w-5 text-indigo-600" />}
                                                    <h4 className="font-medium text-gray-900 capitalize">{resource.type}s</h4>
                                                </div>
                                                <ul className="space-y-2 text-gray-600">
                                                    {resource.links.map((link, linkIndex) => (
                                                        <li key={linkIndex} className="flex items-start gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2" />
                                                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                                {link}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-xl text-gray-700 mb-2">Generating your video...</p>
                        <p className="text-gray-500 mb-4">{message || "This may take 1-6 minutes"}</p>
                        <div className="mt-6 space-y-2">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                            <p className="text-sm text-gray-400">Using Google Veo 3 to create your educational video</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 3D Surface Plot */}
                    <Card className="bg-white border hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle>3D Surface Plot</CardTitle>
                            <CardDescription>3D visualization of the surface area of a cube with animations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                <Image
                                    src="/visualizer/3d_calculus (1).gif"
                                    alt="3D Surface Plot"
                                    width={500}
                                    height={300}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Complex Numbers */}
                    <Card className="bg-white border hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle>Complex Numbers</CardTitle>
                            <CardDescription>Geometric interpretation of complex number operations with rotation and scaling.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                <Image
                                    src="/visualizer/ComplexNumbersAnimation_ManimCE_v0.17.3 (1).gif"
                                    alt="Complex Numbers"
                                    width={500}
                                    height={300}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Linear Algebra */}
                    <Card className="bg-white border hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle>Linear Algebra</CardTitle>
                            <CardDescription>Visualization of linear transformations and vector operations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                <Image
                                    src="/visualizer/TrigonometryAnimation_ManimCE_v0.17.3 (1).gif"
                                    alt="Linear Algebra"
                                    width={500}
                                    height={300}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Differential Equations */}
                    <Card className="bg-white border hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <CardTitle>Differential Equations</CardTitle>
                            <CardDescription>Differential equations to life by visualizing solution curves and phase spaces.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                <Image
                                    src="/visualizer/differential_equations (1).gif"
                                    alt="Differential Equations"
                                    width={500}
                                    height={300}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Insufficient Coins Dialog */}
            <Dialog open={showInsufficientCoinsDialog} onOpenChange={setShowInsufficientCoinsDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-amber-600">
                            <CoinsIcon className="h-5 w-5 mr-2" />
                            Insufficient Coins
                        </DialogTitle>
                        <DialogDescription>
                            You need at least {VISUALIZER_COST} coins to use the AI Visualizer.
                            Your current balance: {coins} coins.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-sm text-amber-800">
                                Complete quizzes, participate in daily activities, or maintain 
                                your learning streak to earn more coins!
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowInsufficientCoinsDialog(false)}
                        >
                            Close
                        </Button>
                        <Button 
                            onClick={() => {
                                setShowInsufficientCoinsDialog(false);
                                // Navigate to dashboard or quiz page
                                window.location.href = '/dashboard';
                            }}
                        >
                            Go to Dashboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 