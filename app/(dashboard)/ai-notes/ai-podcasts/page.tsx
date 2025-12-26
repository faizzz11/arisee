"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useActivity } from "@/contexts/ActivityContext"
import {
  ArrowLeft,
  FileText,
  Headphones,
  Pause,
  Play,
  Plus,
  SkipBack,
  SkipForward,
  Upload,
  Volume2,
  Loader2,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { kidsModePodcasts, adultModePodcasts } from "./data"
import { motion } from "framer-motion"

interface Podcast {
  id: string;
  title: string;
  fileName: string;
  url: string;
  date: string;
  size: number;
  createdAt: string;
  description?: string;
  duration?: string;
  thumbnail?: string;
  script?: string;
}

function PodcastsInner() {
  const searchParams = useSearchParams()
  const userMode = searchParams.get("mode") || "adult"
  const isKidsMode = userMode === "kids"
  const { trackActivity } = useActivity()

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [activeTab, setActiveTab] = useState("library")
  const [notesText, setNotesText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPodcast, setCurrentPodcast] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);

  const titleRef = useRef<HTMLInputElement>(null)
  const voiceStyleRef = useRef<HTMLSelectElement>(null)
  const backgroundMusicRef = useRef<HTMLSelectElement>(null)
  const podcastLengthRef = useRef<HTMLSelectElement>(null)
  const formatRef = useRef<HTMLSelectElement>(null)
  const includeCitationsRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [includeCitations, setIncludeCitations] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setIsLoading(true);

      // Try to fetch from Cloudinary first
      let response = await fetch('/api/list-podcasts-cloudinary');

      if (!response.ok) {
        console.log('Cloudinary not available, falling back to local files');
        // Fall back to local files
        response = await fetch('/api/list-podcasts');

        if (!response.ok) {
          throw new Error('Failed to fetch podcasts');
        }
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        // If not JSON, try to get text to see what we got
        const text = await response.text();
        console.error('Response text:', text.substring(0, 200));
        throw new Error('Invalid response format');
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse response as JSON');
      }

      setPodcasts(data.podcasts.map((podcast: Podcast) => ({
        ...podcast,
        description: `${podcast.size}MB • Generated podcast`,
        duration: "Generated",
      })));
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      toast.error('Failed to load podcasts');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPodcast = (podcast: any) => {
    setCurrentPodcast(podcast);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = podcast.url;
      audioRef.current.play();

      // Track podcast play activity
      trackActivity('podcast', {
        action: 'play',
        podcastId: podcast.id,
        podcastTitle: podcast.title
      });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentProgress(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  const handleSliderChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentProgress(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleDeletePodcast = async (podcastId: string, cloudinaryPublicId?: string) => {
    try {
      if (cloudinaryPublicId) {
        // Delete from Cloudinary cloud storage
        const response = await fetch(`/api/podcast-cloudinary?publicId=${cloudinaryPublicId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          console.error('Failed to delete from Cloudinary');
        }
      }

      // Remove from local state
      setPodcasts(prev => prev.filter(p => p.id !== podcastId));
      toast.success("Podcast deleted successfully!");
    } catch (error) {
      console.error('Error deleting podcast:', error);
      toast.error("Failed to delete podcast");
    }
  };

  const handleCreatePodcast = async () => {
    // Validate required fields
    if (!titleRef.current?.value?.trim()) {
      toast.error("Please enter a podcast title");
      return;
    }

    if (!selectedFile && !notesText.trim()) {
      toast.error("Please either upload a PDF or enter notes");
      return;
    }

    if (!voiceStyleRef.current?.value) {
      toast.error("Please select a voice style");
      return;
    }

    if (!backgroundMusicRef.current?.value) {
      toast.error("Please select background music");
      return;
    }

    if (!podcastLengthRef.current?.value) {
      toast.error("Please select podcast length");
      return;
    }

    if (!formatRef.current?.value) {
      toast.error("Please select a format");
      return;
    }

    // Track podcast creation activity
    await trackActivity('podcast', {
      action: 'create',
      title: titleRef.current.value,
      voiceStyle: voiceStyleRef.current.value,
      format: formatRef.current.value,
      podcastLength: podcastLengthRef.current.value
    });

    setIsGenerating(true);

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (notesText.trim()) {
        formData.append('notesText', notesText);
      }

      formData.append('title', titleRef.current.value);
      formData.append('voiceStyle', voiceStyleRef.current.value);
      formData.append('backgroundMusic', backgroundMusicRef.current.value);
      formData.append('podcastLength', podcastLengthRef.current.value);
      formData.append('format', formatRef.current.value);
      formData.append('includeCitations', includeCitations ? 'true' : 'false');

      const response = await fetch('/api/generate-podcast', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate podcast');
      }

      // Add the new podcast to the list
      const newPodcast: Podcast = {
        id: Date.now().toString(),
        title: titleRef.current.value,
        fileName: `${titleRef.current.value}.mp3`,
        url: data.url,
        date: "Just now",
        size: 0, // This will be updated when fetching podcasts
        createdAt: new Date().toISOString(),
        description: "AI-generated podcast from your notes",
        duration: "Generated",
        thumbnail: `https://picsum.photos/seed/${Date.now()}/160/160`,
        script: data.script
      };

      setPodcasts(prev => [newPodcast, ...prev]);
      await fetchPodcasts();
      setActiveTab("library");

      // Show success message with Cloudinary status
      if (data.cloudinary?.uploaded) {
        toast.success("Podcast generated and uploaded to cloud storage successfully!");
      } else {
        toast.success("Podcast generated successfully! (Cloud upload failed, saved locally)");
      }

      // Reset form
      titleRef.current.value = '';
      setNotesText('');
      setSelectedFile(null);
      if (voiceStyleRef.current) voiceStyleRef.current.value = isKidsMode ? 'friendly' : 'professional';
      if (backgroundMusicRef.current) backgroundMusicRef.current.value = 'none';
      if (podcastLengthRef.current) podcastLengthRef.current.value = 'medium';
      if (formatRef.current) formatRef.current.value = isKidsMode ? 'story' : 'discussion';
      if (includeCitationsRef.current) includeCitationsRef.current.checked = false;
      setIncludeCitations(false);

    } catch (error) {
      console.error('Error generating podcast:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate podcast. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      toast.error("Please select a PDF file")
    }
  }

  const handleDownload = async (podcast: any) => {
    try {
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = podcast.url;
      link.download = podcast.fileName || `${podcast.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download podcast');
    }
  };

  return (
    <div className="min-h-screen">

      <Link
        href="/ai-notes"
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold cursor-pointer hover:-translate-y-0.5 transition duration-200 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-300 text-gray-700 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Link>
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-[#6C5CE7]/5 p-1 text-[#6C5CE7]">
              <TabsTrigger
                value="library"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-[#6C5CE7]/10 data-[state=active]:hover:bg-[#6C5CE7]"
              >
                <Headphones className="mr-2 h-4 w-4" />
                My Podcasts
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-[#6C5CE7]/10 data-[state=active]:hover:bg-[#6C5CE7]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </TabsTrigger>
            </TabsList>

            {activeTab === "library" && (
              <Button
                onClick={() => setActiveTab("create")}
                className="mt-4 md:mt-0 bg-[#6C5CE7] hover:bg-[#6C5CE7]/90 text-white relative overflow-hidden group transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#6C5CE7] to-[#8E5CE7] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>New Podcast</span>
                </div>
              </Button>
            )}
          </div>

          <TabsContent value="library" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                  <CardHeader>
                    <CardTitle>My Podcast Library</CardTitle>
                    <CardDescription>
                      {isKidsMode ? "Listen to your fun audio stories!" : "Your AI-generated podcasts from study notes"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-[#5C5FFF]" />
                        </div>
                      ) : podcasts.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="relative mx-auto w-16 h-16 mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#5C5FFF] to-[#FF647C] opacity-20 rounded-full blur-xl animate-pulse" />
                            <Headphones className="relative w-16 h-16 text-[#5C5FFF]" />
                          </div>
                          <p className="text-gray-500">No podcasts found. Create your first one!</p>
                        </div>
                      ) : (
                        podcasts.map((podcast) => (
                          <motion.div
                            key={podcast.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative overflow-hidden rounded-[28px] border bg-white shadow-sm transition-all hover:shadow-lg"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#6C5CE7]/5 via-[#8E5CE7]/5 to-[#a78bfa]/5 opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="relative flex items-center p-6">
                              <div className="relative flex-shrink-0  bg-purple-400">
                                <div className="relative h-24 w-24 overflow-hidden radius shadow-lg transform transition-transform group-hover:scale-105">
                                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-white/90 filter drop-shadow-lg transform transition-transform group-hover:scale-110">
                                      {podcast.title.charAt(0)}
                                    </span>
                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/70 bg-black/20 px-2 py-0.5 rounded-full">
                                        {podcast.size}MB
                                      </span>
                                    </div>
                                  </div>
                                  <div className="absolute inset-0 ring-1 ring-inset ring-white/20" />
                                </div>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="absolute -bottom-3 -right-3 h-10 w-10 rounded-[16px] bg-white hover:bg-[#6C5CE7] text-[#6C5CE7] hover:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:shadow-xl border border-[#6C5CE7]/20 backdrop-blur-sm"
                                  onClick={() => currentPodcast?.id === podcast.id ? togglePlayPause() : handlePlayPodcast(podcast)}
                                >
                                  {isPlaying && currentPodcast?.id === podcast.id ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>

                              <div className="ml-6 flex-grow min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-[#1E1E2E] leading-none tracking-tight truncate text-lg">
                                    {podcast.title}
                                  </h3>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="flex-shrink-0 text-[#6C5CE7] hover:text-white hover:bg-[#6C5CE7] rounded-[14px] transition-all duration-300"
                                    onClick={() => handleDownload(podcast)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="mt-2 text-sm text-gray-500 line-clamp-1">
                                  {podcast.description}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-[#6C5CE7]/5 text-[#6C5CE7] rounded-full px-4 py-1 font-medium border-0 hover:bg-[#6C5CE7]/10 transition-colors">
                                    {podcast.date}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100 sticky top-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm" />
                  <CardHeader className="relative pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Now Playing</CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    {currentPodcast ? (
                      <div className="space-y-6">
                        <div className="relative aspect-square overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-50 to-pink-50 p-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-pink-100/20" />
                          <div className="relative h-full w-full rounded-[16px] bg-white/80 backdrop-blur-sm flex items-center justify-center border border-gray-100 shadow-sm">
                            <div className="flex flex-col items-center">
                              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-pink-100 flex items-center justify-center">
                                <span className="text-5xl font-bold text-gray-800/90">
                                  {currentPodcast.title.charAt(0)}
                                </span>
                              </div>
                              <div className="mt-4 px-4 py-1.5 rounded-full bg-gray-100/80 backdrop-blur-sm">
                                <span className="text-xs font-medium text-gray-600">
                                  Now Playing
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900 truncate text-base">
                            {currentPodcast.title}
                          </h3>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium text-gray-500">
                              <span>{formatTime(currentProgress)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-0 h-1 bg-gray-100 rounded-full" />
                              <Slider
                                value={[currentProgress]}
                                max={duration}
                                step={1}
                                className="relative [&_[role=slider]]:bg-gray-900 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:shadow-sm [&_[role=slider]]:rounded-full"
                                onValueChange={handleSliderChange}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                              onClick={() => {
                                if (audioRef.current) audioRef.current.currentTime -= 10;
                              }}
                            >
                              <SkipBack className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="default"
                              size="icon"
                              className="h-12 w-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-sm transition-all duration-200 hover:scale-105"
                              onClick={togglePlayPause}
                            >
                              {isPlaying ? (
                                <Pause className="h-5 w-5" />
                              ) : (
                                <Play className="h-5 w-5" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                              onClick={() => {
                                if (audioRef.current) audioRef.current.currentTime += 10;
                              }}
                            >
                              <SkipForward className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-3 px-1">
                            <Volume2 className="h-4 w-4 text-gray-400" />
                            <div className="relative flex-1">
                              <div className="absolute inset-0 h-1 bg-gray-100 rounded-full" />
                              <Slider
                                value={[volume]}
                                max={100}
                                step={1}
                                className="relative [&_[role=slider]]:bg-gray-900 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5 [&_[role=slider]]:shadow-sm [&_[role=slider]]:rounded-full"
                                onValueChange={handleVolumeChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                          <div className="absolute inset-0 bg-gray-50 rounded-[16px] animate-pulse" />
                          <div className="relative h-full w-full rounded-[16px] bg-white flex items-center justify-center border border-gray-100">
                            <Headphones className="h-8 w-8 text-gray-300" />
                          </div>
                        </div>
                        <p className="text-gray-500 font-medium text-sm">
                          {isKidsMode ? "Select a fun story to listen to!" : "Select a podcast to start playing"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                  <CardHeader>
                    <CardTitle>Create New Podcast</CardTitle>
                    <CardDescription>
                      {isKidsMode
                        ? "Turn your notes into a fun audio story!"
                        : "Convert your study notes into an engaging podcast"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Podcast Title</label>
                        <Input
                          ref={titleRef}
                          placeholder={isKidsMode ? "My Amazing Space Adventure" : "Advanced Machine Learning Concepts"}
                          className="border-gray-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Notes</label>
                        <Textarea
                          placeholder={
                            isKidsMode
                              ? "Write or paste your notes about planets, animals, or any topic you're learning about..."
                              : "Paste your study notes, research, or any content you want to convert to audio..."
                          }
                          className="min-h-[200px] border-gray-200"
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          id="pdf-upload"
                          onChange={handleFileSelect}
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('pdf-upload')?.click()}
                          className="relative overflow-hidden group border-[#6C5CE7]/20 hover:border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/5 transition-all duration-300"
                        >
                          <Upload className="h-4 w-4 mr-2 text-[#6C5CE7]" />
                          <span className="text-[#6C5CE7]">{selectedFile ? selectedFile.name : "Upload PDF"}</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="relative overflow-hidden group border-[#6C5CE7]/20 hover:border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/5 transition-all duration-300"
                        >
                          <FileText className="h-4 w-4 mr-2 text-[#6C5CE7]" />
                          <span className="text-[#6C5CE7]">Import Document</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("library")}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePodcast}
                      disabled={isGenerating || (!selectedFile && notesText.trim() === "")}
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
                          <span>Create Podcast</span>
                        )}
                      </div>
                    </Button>
                  </CardFooter>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                  <CardHeader>
                    <CardTitle>Podcast Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Voice Style</label>
                        <select
                          ref={voiceStyleRef}
                          className="w-full rounded-md border-gray-200 p-2 text-sm"
                        >
                          {isKidsMode ? (
                            <>
                              <option value="friendly">Friendly & Fun</option>
                              <option value="storyteller">Storyteller</option>
                              <option value="cartoon">Cartoon Character</option>
                              <option value="robot">Robot Voice</option>
                            </>
                          ) : (
                            <>
                              <option value="professional">Professional</option>
                              <option value="conversational">Conversational</option>
                              <option value="academic">Academic</option>
                              <option value="technical">Technical</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Background Music</label>
                        <select
                          ref={backgroundMusicRef}
                          className="w-full rounded-md border-gray-200 p-2 text-sm"
                        >
                          {isKidsMode ? (
                            <>
                              <option value="adventure">Adventure</option>
                              <option value="space">Space Exploration</option>
                              <option value="nature">Nature Sounds</option>
                              <option value="none">No Music</option>
                            </>
                          ) : (
                            <>
                              <option value="ambient">Ambient</option>
                              <option value="focus">Focus</option>
                              <option value="minimal">Minimal</option>
                              <option value="none">No Music</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Podcast Length</label>
                        <select
                          ref={podcastLengthRef}
                          className="w-full rounded-md border-gray-200 p-2 text-sm"
                        >
                          <option value="short">Short (3-5 minutes)</option>
                          <option value="medium">Medium (5-10 minutes)</option>
                          <option value="long">Long (10-15 minutes)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                        <select
                          ref={formatRef}
                          className="w-full rounded-md border-gray-200 p-2 text-sm"
                        >
                          {isKidsMode ? (
                            <>
                              <option value="story">Story</option>
                              <option value="adventure">Adventure</option>
                              <option value="quiz">Quiz Show</option>
                            </>
                          ) : (
                            <>
                              <option value="lecture">Lecture</option>
                              <option value="interview">Interview</option>
                              <option value="discussion">Discussion</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Include Citations</label>
                        <div className="flex items-center space-x-2">
                          <input
                            ref={includeCitationsRef}
                            type="checkbox"
                            id="citations"
                            className="rounded border-gray-200 text-[#5C5FFF]"
                            checked={includeCitations}
                            onChange={(e) => setIncludeCitations(e.target.checked)}
                          />
                          <label htmlFor="citations" className="text-sm text-gray-600">
                            Add source references
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  )
}

export default function PodcastsPage() {
  return (
    <Suspense fallback={null}>
      <PodcastsInner />
    </Suspense>
  )
}