"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  FileText, Calendar, Clock, ChevronRight, Video, Copy,
  Link as LinkIcon, Plus, X, User, CheckCircle,
  Target, ListChecks, ArrowRight, AlertCircle, CalendarCheck,
  Download, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

interface Transcript {
  filename: string;
  date: string;
  duration: string;
  path: string;
}

interface MeetLink {
  id: string;
  title: string;
  link: string;
  date: string;
  isActive: boolean;
}

interface GithubMeetLinks {
  meet_links: string[];
}

interface StructuredNotesHeader {
  title: string;
  points: string[];
}

interface StructuredNotes {
  title: string;
  date: string;
  duration: string;
  summary: string;
  headers: StructuredNotesHeader[];
  actionItems: string[];
  participants: string[];
  decisions: string[];
  nextSteps: string[];
}

const SmartMeetPage = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [structuredData, setStructuredData] = useState<StructuredNotes | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [meetLinks, setMeetLinks] = useState<MeetLink[]>([]);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExtensionDialogOpen, setIsExtensionDialogOpen] = useState(false);
  const [githubLinks, setGithubLinks] = useState<string[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const { toast } = useToast();

  // Fetch links from GitHub
  const fetchGithubLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const response = await fetch('https://raw.githubusercontent.com/kstubhieeee/Depression/main/hemant.json');
      if (!response.ok) {
        throw new Error('Failed to fetch meet links');
      }
      const data: GithubMeetLinks = await response.json();
      setGithubLinks(data.meet_links);
      setIsLoadingLinks(false);
    } catch (error) {
      console.error('Error fetching meet links:', error);
      toast({
        title: "Error",
        description: "Failed to fetch meet links from GitHub",
        variant: "destructive",
      });
      setIsLoadingLinks(false);
    }
  };

  // Load transcripts from the API
  const loadTranscripts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/transcripts');
      if (!response.ok) {
        throw new Error('Failed to fetch transcripts');
      }
      const data = await response.json();
      setTranscripts(data.transcripts);
    } catch (error) {
      console.error('Error loading transcripts:', error);
      toast({
        title: "Error",
        description: "Failed to load transcripts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch GitHub links when component mounts
    fetchGithubLinks();

    // Load transcripts
    loadTranscripts();
  }, []);

  const handleTranscriptClick = async (path: string) => {
    setSelectedTranscript(path);
    setIsLoadingContent(true);
    setOriginalContent('');
    setStructuredData(null);
    setShowOriginal(false);

    try {
      const encodedPath = encodeURIComponent(path);
      const response = await fetch(`/api/transcripts/${encodedPath}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transcript content');
      }
      const data = await response.json();

      if (data.isStructured) {
        setStructuredData(data.structuredData);
        setOriginalContent(data.originalContent);
      } else {
        setOriginalContent(data.content || data.originalContent);
        setShowOriginal(true);
      }
    } catch (error) {
      console.error('Error loading transcript content:', error);
      toast({
        title: "Error",
        description: "Failed to load transcript content",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Toggle between AI notes and original transcript
  const toggleContent = () => {
    setShowOriginal(!showOriginal);
  };

  // Function to get a random link from GitHub data
  const getRandomMeetLink = () => {
    if (githubLinks.length === 0) {
      toast({
        title: "Error",
        description: "No meet links available",
        variant: "destructive",
      });
      return null;
    }
    const randomIndex = Math.floor(Math.random() * githubLinks.length);
    return githubLinks[randomIndex];
  };

  const generateNewMeetLink = () => {
    if (!newMeetingTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meeting title",
        variant: "destructive",
      });
      return;
    }

    const randomLink = getRandomMeetLink();

    if (!randomLink) {
      return;
    }

    const newLink: MeetLink = {
      id: Date.now().toString(),
      title: newMeetingTitle,
      link: randomLink,
      date: new Date().toLocaleString(),
      isActive: true
    };

    setMeetLinks([...meetLinks, newLink]);
    setNewMeetingTitle('');
    setIsDialogOpen(false);

    toast({
      title: "Meet Link Generated",
      description: "New meeting link has been created successfully.",
      variant: "default",
    });
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Meeting link has been copied to clipboard.",
      variant: "default",
    });
  };

  const downloadExtension = () => {
    // Create a link to download the extension.zip file
    const link = document.createElement('a');
    link.href = '/extension.zip';
    link.download = 'ARISE-Extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show installation instructions
    setIsExtensionDialogOpen(true);

    toast({
      title: "Download Started",
      description: "ARISE extension is being downloaded.",
      variant: "default",
    });
  };

  const renderStructuredNotes = () => {
    if (!structuredData) return null;

    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-slate-800">{structuredData.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Badge variant="outline" className="flex items-center gap-1 text-slate-600">
              <Calendar className="w-3 h-3" />
              <span>{structuredData.date}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3 h-3" />
              <span>{structuredData.duration}</span>
            </Badge>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800">Summary</h2>
          </div>
          <p className="text-slate-700">{structuredData.summary}</p>
        </div>

        {structuredData.participants.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-800">Participants</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {structuredData.participants.map((participant, index) => (
                <Badge key={index} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                  {participant}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {structuredData.headers.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-slate-800">Discussion Topics</h2>
            </div>
            <div className="space-y-4">
              {structuredData.headers.map((header, index) => (
                <div key={index} className="pl-1">
                  <h3 className="font-medium text-slate-800 mb-2">{header.title}</h3>
                  <ul className="space-y-1 pl-6 list-disc">
                    {header.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="text-slate-700">{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {structuredData.decisions.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-slate-800">Decisions</h2>
            </div>
            <ul className="space-y-2">
              {structuredData.decisions.map((decision, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="inline-block w-5 h-5 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  </span>
                  <span className="text-slate-700">{decision}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {structuredData.actionItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-semibold text-slate-800">Action Items</h2>
            </div>
            <ul className="space-y-2">
              {structuredData.actionItems.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="inline-block w-5 h-5 bg-rose-100 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Target className="w-3 h-3 text-rose-500" />
                  </span>
                  <span className="text-slate-700">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {structuredData.nextSteps.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-800">Next Steps</h2>
            </div>
            <ul className="space-y-2">
              {structuredData.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="inline-block w-5 h-5 bg-amber-100 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5">
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                  </span>
                  <span className="text-slate-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Smart Meet</h1>
          <p className="text-slate-600 mt-2">View and manage your meeting transcripts</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isExtensionDialogOpen} onOpenChange={setIsExtensionDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 bg-gradient-to-b from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-300 text-blue-700 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset]"
              >
                <HelpCircle className="w-4 h-4" />
                <span>View Instructions</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ARISE Extension Installation</DialogTitle>
                <DialogDescription>
                  Follow these steps to install the ARISE Chrome extension
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
                <div className="rounded-lg border bg-gradient-to-b from-white to-gray-50/50 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] p-3">
                  <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs">1</span>
                    Download the extension
                  </h3>
                  <p className="text-xs text-slate-600 ml-6">
                    Click the ARISE Extension button to download the extension file.
                  </p>
                </div>
                <div className="rounded-lg border bg-gradient-to-b from-white to-gray-50/50 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] p-3">
                  <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs">2</span>
                    Extract it
                  </h3>
                  <p className="text-xs text-slate-600 ml-6">
                    Locate the downloaded ARISE-Extension.zip file and extract it to a folder on your computer.
                  </p>
                </div>
                <div className="rounded-lg border bg-gradient-to-b from-white to-gray-50/50 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] p-3">
                  <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs">3</span>
                    Go to Chrome extensions
                  </h3>
                  <p className="text-xs text-slate-600 ml-6">
                    In Chrome, navigate to <code className="bg-slate-100 px-1 py-0.5 rounded">chrome://extensions</code> in your address bar.
                  </p>
                </div>
                <div className="rounded-lg border bg-gradient-to-b from-white to-gray-50/50 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] p-3">
                  <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs">4</span>
                    Enable Developers mode if not enabled
                  </h3>
                  <p className="text-xs text-slate-600 ml-6">
                    Toggle the "Developer mode" switch in the top-right corner to ON.
                  </p>
                </div>
                <div className="rounded-lg border bg-gradient-to-b from-white to-gray-50/50 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] p-3">
                  <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs">5</span>
                    Load unpacked
                  </h3>
                  <p className="text-xs text-slate-600 ml-6">
                    Click the "Load unpacked" button and select the folder where you extracted the extension files.
                  </p>
                </div>
                <div className="rounded-lg border bg-gradient-to-b from-white to-gray-50/50 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] p-3">
                  <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-xs">6</span>
                    Select the folder of the extension
                  </h3>
                  <p className="text-xs text-slate-600 ml-6">
                    Choose the folder where you extracted the extension files to complete the installation.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]" onClick={() => setIsExtensionDialogOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            className="flex items-center gap-2 font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 bg-gradient-to-b from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-300 text-indigo-700 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset]"
            onClick={downloadExtension}
          >
            <Download className="w-4 h-4" />
            <span>ARISE Extension</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Meet Links Section */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Active Meet Links</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{meetLinks.filter(link => link.isActive).length} active sessions</span>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 bg-gradient-to-b from-[#5C5FFF] to-[#5C5FFF]/80 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]" disabled={isLoadingLinks}>
                      <Plus className="w-4 h-4 mr-2" />
                      {isLoadingLinks ? "Loading Links..." : "Generate Link"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Meeting</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Meeting Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter meeting title"
                          value={newMeetingTitle}
                          onChange={(e) => setNewMeetingTitle(e.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 bg-gradient-to-b from-[#5C5FFF] to-[#5C5FFF]/80 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]"
                        onClick={generateNewMeetLink}
                        disabled={isLoadingLinks || githubLinks.length === 0}
                      >
                        {isLoadingLinks ? "Loading Links..." : "Generate Link"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetLinks.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-slate-500">
                  No meeting links available. Generate a new link to get started.
                </div>
              ) : (
                meetLinks.map((meetLink) => (
                  <div key={meetLink.id} className={`rounded-lg p-4 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] ${meetLink.isActive ? 'border border-green-200 bg-gradient-to-b from-green-50 to-green-100/50' : 'border border-slate-200 bg-gradient-to-b from-white to-gray-50/50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-slate-600" />
                          <h3 className="font-medium text-slate-800">{meetLink.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{meetLink.date}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(meetLink.link)}
                        className="h-8 px-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <LinkIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 truncate">{meetLink.link}</span>
                    </div>
                    {meetLink.isActive && (
                      <div className="mt-3">
                        <Button
                          className="w-full font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 bg-gradient-to-b from-green-500 to-green-500/80 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]"
                          size="sm"
                          onClick={() => window.open(meetLink.link, '_blank')}
                        >
                          Join Session
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Transcripts List */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Transcripts</h2>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C5FFF]"></div>
                  </div>
                ) : transcripts.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-slate-500">No transcripts available</p>
                  </div>
                ) : (
                  transcripts.map((transcript, index) => (
                    <div
                      key={index}
                      onClick={() => handleTranscriptClick(transcript.path)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTranscript === transcript.path
                        ? 'border-[#5C5FFF] bg-[#5C5FFF]/5'
                        : 'border-slate-200 hover:border-[#5C5FFF] hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <FileText className={`w-5 h-5 mt-1 ${selectedTranscript === transcript.path
                            ? 'text-[#5C5FFF]'
                            : 'text-slate-400'
                            }`} />
                          <div>
                            <h3 className="font-medium text-slate-800">{transcript.filename}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">{transcript.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">{transcript.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 ${selectedTranscript === transcript.path
                          ? 'text-[#5C5FFF]'
                          : 'text-slate-300'
                          }`} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Transcript Content */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100 h-[600px]">
            {selectedTranscript ? (
              <div className="h-full flex flex-col">
                {isLoadingContent ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5C5FFF] mx-auto mb-4"></div>
                      <p className="text-slate-600">Generating AI notes...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {originalContent && (
                      <div className="flex justify-end mb-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleContent}
                        >
                          {showOriginal ? "View AI Notes" : "View Original Transcript"}
                        </Button>
                      </div>
                    )}
                    <ScrollArea className="flex-1 pr-4">
                      {showOriginal ? (
                        <div className="prose prose-slate max-w-none">
                          <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono">
                            {originalContent}
                          </pre>
                        </div>
                      ) : (
                        renderStructuredNotes()
                      )}
                    </ScrollArea>
                  </>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No Transcript Selected</h3>
                  <p className="text-sm text-slate-400">
                    Select a transcript from the list to view its contents
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartMeetPage;
