"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  FileText, Calendar, Clock, ChevronRight, Video, Copy, 
  Link as LinkIcon, Plus, X, Download, AlertCircle,
  ListChecks, CheckCircle, User, Target, CalendarCheck, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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
  const { toast } = useToast();

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
    // Load transcripts
    loadTranscripts();
    
    // Load mock meet links (could be replaced with an API call in the future)
    setMeetLinks([
      {
        id: '1',
        title: 'Data Structures Class',
        link: 'https://meet.google.com/abc-defg-hij',
        date: '2024-02-20 10:00 AM',
        isActive: true
      },
      {
        id: '2',
        title: 'Algorithm Design Session',
        link: 'https://meet.google.com/xyz-uvwx-yz',
        date: '2024-02-20 2:00 PM',
        isActive: false
      }
    ]);
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

  const generateNewMeetLink = () => {
    if (!newMeetingTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meeting title",
        variant: "destructive",
      });
      return;
    }

    const newLink: MeetLink = {
      id: Date.now().toString(),
      title: newMeetingTitle,
      link: `https://meet.google.com/${Math.random().toString(36).substring(7)}`,
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

  const renderStructuredNotes = () => {
    if (!structuredData) return null;

    return (
      <div className="space-y-8">
        {/* Title and Metadata */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{structuredData.title}</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">{structuredData.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">{structuredData.duration}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-800">Summary</h3>
          </div>
          <p className="text-slate-700 pl-7">{structuredData.summary}</p>
        </div>

        {/* Participants */}
        {structuredData.participants.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-slate-800">Participants</h3>
            </div>
            <div className="flex flex-wrap gap-2 pl-7">
              {structuredData.participants.map((participant, index) => (
                <Badge key={index} variant="outline" className="bg-indigo-50">
                  {participant}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Topic Headers */}
        {structuredData.headers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-slate-800">Discussion Topics</h3>
            </div>
            <div className="space-y-4 pl-7">
              {structuredData.headers.map((header, index) => (
                <div key={index} className="border-l-2 border-green-200 pl-4 py-1">
                  <h4 className="font-medium text-slate-800">{header.title}</h4>
                  <ul className="mt-2 space-y-1">
                    {header.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="text-slate-600 flex gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        {structuredData.actionItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-slate-800">Action Items</h3>
            </div>
            <ul className="space-y-2 pl-7">
              {structuredData.actionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Decisions */}
        {structuredData.decisions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-800">Decisions</h3>
            </div>
            <ul className="space-y-2 pl-7">
              {structuredData.decisions.map((decision, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-amber-500 mt-0.5" />
                  <span className="text-slate-700">{decision}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        {structuredData.nextSteps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-800">Next Steps</h3>
            </div>
            <ul className="space-y-2 pl-7">
              {structuredData.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-purple-500 mt-0.5" />
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Meet Links Section */}
        <div className="lg:col-span-3">
          <Card className="p-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Active Meet Links</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{meetLinks.filter(link => link.isActive).length} active sessions</span>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#5C5FFF] hover:bg-[#4B4ECC] text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Link
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
                        className="w-full bg-[#5C5FFF] hover:bg-[#4B4ECC] text-white"
                        onClick={generateNewMeetLink}
                      >
                        Generate Link
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetLinks.map((meetLink) => (
                <Card key={meetLink.id} className={`p-4 ${meetLink.isActive ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
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
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        size="sm"
                        onClick={() => window.open(meetLink.link, '_blank')}
                      >
                        Join Session
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Transcripts and Content */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Transcripts</h2>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C5FFF]"></div>
                  </div>
                ) : transcripts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No transcripts available</p>
                    <p className="text-sm mt-1">Transcripts will appear here once meetings are recorded</p>
                  </div>
                ) : (
                  transcripts.map((transcript, index) => (
                    <div
                      key={index}
                      onClick={() => handleTranscriptClick(transcript.path)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedTranscript === transcript.path
                          ? 'border-[#5C5FFF] bg-[#5C5FFF]/5'
                          : 'border-slate-200 hover:border-[#5C5FFF] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <FileText className={`w-5 h-5 mt-1 ${
                            selectedTranscript === transcript.path
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
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Transcript Content */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {!selectedTranscript ? (
              <div className="flex flex-col items-center justify-center h-[600px] text-center">
                <FileText className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-medium text-slate-700 mb-2">No Transcript Selected</h3>
                <p className="text-slate-500 max-w-md">
                  Select a transcript from the list on the left to view its content. AI-generated notes will be displayed when available.
                </p>
              </div>
            ) : isLoadingContent ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5C5FFF]"></div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-800">
                    {structuredData ? structuredData.title : 'Transcript Content'}
                  </h2>
                  {structuredData && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleContent}
                      className="text-slate-600"
                    >
                      {showOriginal ? 'View AI Notes' : 'View Original'}
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[550px] pr-4">
                  {showOriginal ? (
                    <div className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-slate-50 p-4 rounded-md">
                      {originalContent}
                    </div>
                  ) : structuredData ? (
                    renderStructuredNotes()
                  ) : (
                    <div className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-slate-50 p-4 rounded-md">
                      {originalContent}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartMeetPage;
