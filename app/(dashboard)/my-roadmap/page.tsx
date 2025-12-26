"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  ChevronRight, 
  Clock, 
  FileText, 
  GraduationCap, 
  Loader2, 
  Play, 
  Target, 
  BookOpen, 
  ArrowUpRight 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Add a custom hook for user ID management (same as in the quiz page)
function useUserId() {
  const [userId, setUserId] = useState<string>('guest');

  useEffect(() => {
    // This runs only on the client-side
    if (typeof window !== 'undefined') {
      // Get existing userId or create a new one
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        // Generate a unique ID
        const newUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('userId', newUserId);
        setUserId(newUserId);
      }
    }
  }, []);

  return userId;
}

export default function MyRoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const userId = useUserId();

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const response = await fetch(`/api/get-roadmaps?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch roadmaps');
        }
        const data = await response.json();
        setRoadmaps(data.roadmaps || []);
      } catch (error) {
        console.error('Error fetching roadmaps:', error);
        toast.error('Failed to load roadmaps');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRoadmaps();
    }
  }, [userId]);

  const handleToggleStageCompletion = async (roadmapId: string, stageId: string, completed: boolean) => {
    try {
      const response = await fetch('/api/update-roadmap-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roadmapId,
          stageId,
          completed: !completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      // Update the local state to reflect the change
      setRoadmaps(prevRoadmaps => 
        prevRoadmaps.map(roadmap => {
          if (roadmap.id === roadmapId) {
            const updatedProgress = roadmap.progress.map((stage: any) => {
              if (stage.stageId === stageId) {
                return {
                  ...stage,
                  completed: !completed,
                  resources: stage.resources.map((resource: any) => ({
                    ...resource,
                    completed: !completed // Update all resources to match stage completion
                  }))
                };
              }
              return stage;
            });
            
            return { ...roadmap, progress: updatedProgress };
          }
          return roadmap;
        })
      );

      if (selectedRoadmap && selectedRoadmap.id === roadmapId) {
        setSelectedRoadmap((prevSelected: any) => {
          const updatedProgress = prevSelected.progress.map((stage: any) => {
            if (stage.stageId === stageId) {
              return {
                ...stage,
                completed: !completed,
                resources: stage.resources.map((resource: any) => ({
                  ...resource,
                  completed: !completed
                }))
              };
            }
            return stage;
          });
          
          return { ...prevSelected, progress: updatedProgress };
        });
      }

      toast.success('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleToggleResourceCompletion = async (roadmapId: string, stageId: string, resourceId: string, completed: boolean) => {
    try {
      const response = await fetch('/api/update-roadmap-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roadmapId,
          stageId,
          resourceId,
          completed: !completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      // Update the local state
      const updateRoadmap = (roadmap: any) => {
        if (roadmap.id === roadmapId) {
          const updatedProgress = roadmap.progress.map((stage: any) => {
            if (stage.stageId === stageId) {
              const updatedResources = stage.resources.map((resource: any) => {
                if (resource.resourceId === resourceId) {
                  return { ...resource, completed: !completed };
                }
                return resource;
              });
              
              // Check if all resources are completed to update stage status
              const allResourcesCompleted = updatedResources.every((resource: any) => resource.completed);
              
              return {
                ...stage,
                resources: updatedResources,
                completed: allResourcesCompleted
              };
            }
            return stage;
          });
          
          return { ...roadmap, progress: updatedProgress };
        }
        return roadmap;
      };

      setRoadmaps(prevRoadmaps => prevRoadmaps.map(updateRoadmap));

      if (selectedRoadmap && selectedRoadmap.id === roadmapId) {
        setSelectedRoadmap((prevSelected: any) => updateRoadmap(prevSelected));
      }

      toast.success('Resource progress updated');
    } catch (error) {
      console.error('Error updating resource progress:', error);
      toast.error('Failed to update resource progress');
    }
  };

  const calculateProgress = (roadmap: any) => {
    if (!roadmap || !roadmap.progress || roadmap.progress.length === 0) {
      return 0;
    }
    
    const completedStages = roadmap.progress.filter((stage: any) => stage.completed).length;
    return Math.round((completedStages / roadmap.progress.length) * 100);
  };

  const getResourceLink = (resourceName: string, topic: string) => {
    const encodedTopic = encodeURIComponent(topic);
    const encodedResource = encodeURIComponent(resourceName);
    
    if (resourceName.includes('Video') || resourceName.includes('Tutorial')) {
      return `https://www.youtube.com/results?search_query=${encodedTopic}+${encodedResource.replace(/video|tutorial/i, '')}`;
    } else if (resourceName.includes('Course')) {
      return `https://www.udemy.com/courses/search/?q=${encodedTopic}+${encodedResource.replace(/course/i, '')}`;
    } else if (resourceName.includes('Book') || resourceName.includes('Guide')) {
      return `https://www.amazon.com/s?k=${encodedTopic}+${encodedResource.replace(/book|guide/i, '')}`;
    } else if (resourceName.includes('Exercise') || resourceName.includes('Project')) {
      return `https://github.com/search?q=${encodedTopic}+${encodedResource.replace(/exercise|project/i, '')}`;
    } else if (resourceName.includes('Article')) {
      return `https://medium.com/search?q=${encodedTopic}+${encodedResource.replace(/article/i, '')}`;
    } else if (resourceName.includes('Documentation')) {
      return `https://developer.mozilla.org/en-US/search?q=${encodedTopic}+${encodedResource.replace(/documentation/i, '')}`;
    } else if (resourceName.includes('Community') || resourceName.includes('Forum')) {
      return `https://stackoverflow.com/search?q=${encodedTopic}+${encodedResource.replace(/community|forum/i, '')}`;
    } else {
      return `https://www.google.com/search?q=${encodedTopic}+${encodedResource}`;
    }
  };

  // New function to get specific resource recommendations
  const getSpecificResource = (resourceName: string, topic: string) => {
    // Simplify topic and resource for matching
    const simpleTopic = topic.toLowerCase();
    const simpleResource = resourceName.toLowerCase();
    
    // Common programming languages and technologies
    if (simpleTopic.includes('javascript') || simpleTopic.includes('js')) {
      if (simpleResource.includes('video') || simpleResource.includes('tutorial')) {
        return {
          title: "JavaScript Crash Course For Beginners",
          url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
          source: "YouTube - Traversy Media"
        };
      } else if (simpleResource.includes('course')) {
        return {
          title: "The Complete JavaScript Course 2023",
          url: "https://www.udemy.com/course/the-complete-javascript-course/",
          source: "Udemy - Jonas Schmedtmann"
        };
      } else if (simpleResource.includes('book')) {
        return {
          title: "Eloquent JavaScript: A Modern Introduction to Programming",
          url: "https://www.amazon.com/Eloquent-JavaScript-3rd-Introduction-Programming/dp/1593279507/",
          source: "Amazon - Marijn Haverbeke"
        };
      }
    } else if (simpleTopic.includes('python')) {
      if (simpleResource.includes('video') || simpleResource.includes('tutorial')) {
        return {
          title: "Python Tutorial for Beginners",
          url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
          source: "YouTube - Programming with Mosh"
        };
      } else if (simpleResource.includes('course')) {
        return {
          title: "Python for Data Science and Machine Learning Bootcamp",
          url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
          source: "Udemy - Jose Portilla"
        };
      } else if (simpleResource.includes('book')) {
        return {
          title: "Python Crash Course: A Hands-On, Project-Based Introduction",
          url: "https://www.amazon.com/Python-Crash-Course-2nd-Edition/dp/1593279280/",
          source: "Amazon - Eric Matthes"
        };
      }
    } else if (simpleTopic.includes('java')) {
      if (simpleResource.includes('video') || simpleResource.includes('tutorial')) {
        return {
          title: "Java Tutorial for Beginners",
          url: "https://www.youtube.com/watch?v=eIrMbAQSU34",
          source: "YouTube - Programming with Mosh"
        };
      } else if (simpleResource.includes('course')) {
        return {
          title: "Java Programming Masterclass",
          url: "https://www.udemy.com/course/java-the-complete-java-developer-course/",
          source: "Udemy - Tim Buchalka"
        };
      }
    } else if (simpleTopic.includes('c++')) {
      if (simpleResource.includes('video') || simpleResource.includes('tutorial')) {
        return {
          title: "C++ Tutorial for Beginners - Full Course",
          url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
          source: "YouTube - freeCodeCamp"
        };
      } else if (simpleResource.includes('course')) {
        return {
          title: "Beginning C++ Programming - From Beginner to Beyond",
          url: "https://www.udemy.com/course/beginning-c-plus-plus-programming/",
          source: "Udemy - Tim Buchalka & Dr. Frank Mitropoulos"
        };
      }
    } else if (simpleTopic.includes('c#')) {
      if (simpleResource.includes('video') || simpleResource.includes('tutorial')) {
        return {
          title: "C# Tutorial - Full Course for Beginners",
          url: "https://www.youtube.com/watch?v=GhQdlIFylQ8",
          source: "YouTube - freeCodeCamp"
        };
      } else if (simpleResource.includes('course')) {
        return {
          title: "C# Basics for Beginners: Learn C# Fundamentals",
          url: "https://www.udemy.com/course/csharp-tutorial-for-beginners/",
          source: "Udemy - Mosh Hamedani"
        };
      }
    } else if (simpleTopic.includes('react')) {
      if (simpleResource.includes('video') || simpleResource.includes('tutorial')) {
        return {
          title: "React JS Crash Course",
          url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
          source: "YouTube - Traversy Media"
        };
      } else if (simpleResource.includes('course')) {
        return {
          title: "React - The Complete Guide 2023",
          url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
          source: "Udemy - Maximilian Schwarzmüller"
        };
      }
    } else if (simpleTopic.includes('sql')) {
      if (simpleResource.includes('video') || simpleResource.includes('tutorial')) {
        return {
          title: "SQL Tutorial - Full Database Course for Beginners",
          url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
          source: "YouTube - freeCodeCamp"
        };
      } else if (simpleResource.includes('course')) {
        return {
          title: "The Complete SQL Bootcamp",
          url: "https://www.udemy.com/course/the-complete-sql-bootcamp/",
          source: "Udemy - Jose Portilla"
        };
      }
    } else if (simpleTopic.includes('go') || simpleTopic.includes('golang')) {
      if (simpleResource.includes('video') || simpleResource.includes('tutorial')) {
        return {
          title: "Go / Golang Crash Course",
          url: "https://www.youtube.com/watch?v=SqrbIlUwR0U",
          source: "YouTube - Traversy Media"
        };
      } else if (simpleResource.includes('course')) {
        return {
          title: "Go: The Complete Developer's Guide",
          url: "https://www.udemy.com/course/go-the-complete-developers-guide/",
          source: "Udemy - Stephen Grider"
        };
      }
    } else if (simpleTopic.includes('rust')) {
      if (simpleResource.includes('video') || simpleResource.includes('tutorial')) {
        return {
          title: "Rust Programming Course for Beginners",
          url: "https://www.youtube.com/watch?v=MsocPEZBd-M",
          source: "YouTube - freeCodeCamp"
        };
      } else if (simpleResource.includes('course')) {
        return {
          title: "Ultimate Rust Crash Course",
          url: "https://www.udemy.com/course/ultimate-rust-crash-course/",
          source: "Udemy - Nathan Stocks"
        };
      }
    } else if (simpleTopic.includes('typescript')) {
      if (simpleResource.includes('video') || simpleResource.includes('tutorial')) {
        return {
          title: "TypeScript Crash Course",
          url: "https://www.youtube.com/watch?v=BCg4U1FzODs",
          source: "YouTube - Traversy Media"
        };
      } else if (simpleResource.includes('course')) {
        return {
          title: "Understanding TypeScript",
          url: "https://www.udemy.com/course/understanding-typescript/",
          source: "Udemy - Maximilian Schwarzmüller"
        };
      }
    }
    
    // Default to search link if no specific resource found
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Learning Roadmaps</h1>
          <p className="text-muted-foreground mt-2">
            Track your learning progress and complete your personalized roadmaps
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#5C5FFF]" />
          </div>
        ) : roadmaps.length === 0 ? (
          <Card className="bg-white border">
            <CardHeader>
              <CardTitle>No Roadmaps Found</CardTitle>
              <CardDescription>
                You haven't created any learning roadmaps yet. Take a quiz to generate a personalized learning path.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/ai-notes/ai-quiz">
                <Button className="bg-[#5C5FFF] hover:bg-[#5C5FFF]/90 text-white">
                  Take a Quiz
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`md:col-span-${selectedRoadmap ? '1' : '3'}`}>
              <Card className="bg-white border">
                <CardHeader>
                  <CardTitle>Your Roadmaps</CardTitle>
                  <CardDescription>
                    Select a roadmap to view and track your progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roadmaps.map((roadmap, index) => {
                      const progress = calculateProgress(roadmap);
                      
                      return (
                        <motion.div
                          key={roadmap.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`group cursor-pointer rounded-lg border p-4 hover:shadow-md transition-all ${
                            selectedRoadmap && selectedRoadmap.id === roadmap.id
                              ? 'border-[#5C5FFF] bg-[#5C5FFF]/5'
                              : ''
                          }`}
                          onClick={() => setSelectedRoadmap(roadmap)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg truncate">
                                {roadmap.title}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {roadmap.overview.slice(0, 80)}...
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={progress >= 70 ? 'secondary' : progress >= 30 ? 'outline' : 'default'}>
                                  {progress}% Complete
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(roadmap.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#5C5FFF] transition-colors" />
                          </div>

                          <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                            <div
                              className={`h-2 rounded-full ${
                                progress >= 70
                                  ? 'bg-green-500'
                                  : progress >= 30
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {selectedRoadmap && (
              <div className="md:col-span-2">
                <Card className="bg-white border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedRoadmap.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {selectedRoadmap.overview}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[#5C5FFF] border-[#5C5FFF]/20">
                        {selectedRoadmap.experience} Level
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="outline" className="bg-[#5C5FFF]/5 border-0">
                        <Clock className="h-3 w-3 mr-1" />
                        {selectedRoadmap.timeEstimate}
                      </Badge>
                      <Badge variant="outline" className="bg-[#5C5FFF]/5 border-0">
                        {calculateProgress(selectedRoadmap)}% Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Learning Path</h3>
                      <div className="space-y-6">
                        {selectedRoadmap.progress.map((stage: any, index: number) => (
                          <div key={stage.stageId} className="border rounded-lg p-4 hover:shadow-sm transition-all">
                            <div className="flex items-start gap-4">
                              <div 
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${
                                  stage.completed ? 'bg-green-500' : 'bg-[#5C5FFF]'
                                }`}
                              >
                                {stage.completed ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <span>{index + 1}</span>
                                )}
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-lg">{stage.stageName}</h4>
                                  <button
                                    onClick={() => handleToggleStageCompletion(
                                      selectedRoadmap.id,
                                      stage.stageId,
                                      stage.completed
                                    )}
                                    className={`px-3 py-1 rounded-full text-sm ${
                                      stage.completed
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    } transition-colors`}
                                  >
                                    {stage.completed ? 'Completed' : 'Mark Complete'}
                                  </button>
                                </div>
                                
                                <div className="mt-4 space-y-2">
                                  <h5 className="text-sm font-medium mb-2">Resources:</h5>
                                  {stage.resources.map((resource: any) => {
                                    const specificResource = getSpecificResource(resource.resourceName, selectedRoadmap.title.replace(' Learning Path', ''));
                                    
                                    return (
                                      <div
                                        key={resource.resourceId}
                                        className="flex flex-col gap-2 p-3 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#5C5FFF]/10 flex items-center justify-center">
                                              {resource.resourceName.includes('Tutorial') || resource.resourceName.includes('Video') ? (
                                                <Play className="h-3 w-3 text-[#5C5FFF]" />
                                              ) : resource.resourceName.includes('Course') ? (
                                                <GraduationCap className="h-3 w-3 text-[#5C5FFF]" />
                                              ) : resource.resourceName.includes('Exercise') || resource.resourceName.includes('Project') ? (
                                                <Target className="h-3 w-3 text-[#5C5FFF]" />
                                              ) : (
                                                <FileText className="h-3 w-3 text-[#5C5FFF]" />
                                              )}
                                            </div>
                                            <span className={`text-sm font-medium ${resource.completed ? 'line-through text-gray-500' : ''}`}>
                                              {resource.resourceName}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleResourceCompletion(
                                                  selectedRoadmap.id,
                                                  stage.stageId,
                                                  resource.resourceId,
                                                  resource.completed
                                                );
                                              }}
                                              className={`p-1 rounded ${
                                                resource.completed
                                                  ? 'text-green-600 hover:text-green-800'
                                                  : 'text-gray-600 hover:text-gray-800'
                                              }`}
                                            >
                                              {resource.completed ? (
                                                <Check className="h-4 w-4" />
                                              ) : (
                                                <div className="w-4 h-4 border rounded-sm hover:bg-gray-200"></div>
                                              )}
                                            </button>
                                            <a
                                              href={specificResource ? specificResource.url : getResourceLink(resource.resourceName, selectedRoadmap.title.replace(' Learning Path', ''))}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={(e) => e.stopPropagation()}
                                              className="p-1 rounded text-gray-600 hover:text-[#5C5FFF]"
                                            >
                                              <ArrowUpRight className="h-4 w-4" />
                                            </a>
                                          </div>
                                        </div>
                                        
                                        {specificResource && (
                                          <div className="mt-1 border-t pt-2">
                                            <a
                                              href={specificResource.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-start gap-2 text-xs hover:text-[#5C5FFF] transition-colors"
                                            >
                                              <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                                                {resource.resourceName.includes('Video') || resource.resourceName.includes('Tutorial') ? (
                                                  <Play className="h-5 w-5 text-gray-500" />
                                                ) : resource.resourceName.includes('Course') ? (
                                                  <GraduationCap className="h-5 w-5 text-gray-500" />
                                                ) : resource.resourceName.includes('Book') ? (
                                                  <BookOpen className="h-5 w-5 text-gray-500" />
                                                ) : (
                                                  <FileText className="h-5 w-5 text-gray-500" />
                                                )}
                                              </div>
                                              <div className="flex-1">
                                                <p className="font-medium text-[#5C5FFF]">{specificResource.title}</p>
                                                <p className="text-gray-500 mt-1">{specificResource.source}</p>
                                              </div>
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedRoadmap.proTips && selectedRoadmap.proTips.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold mb-4">Pro Tips</h3>
                          <div className="bg-[#5C5FFF]/5 rounded-lg p-4">
                            <ul className="space-y-2">
                              {selectedRoadmap.proTips.map((tip: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5C5FFF]/20 flex items-center justify-center mt-0.5">
                                    <span className="text-xs text-[#5C5FFF]">{index + 1}</span>
                                  </div>
                                  <span className="text-sm">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRoadmap(null)}
                      className="border-gray-200"
                    >
                      Back to List
                    </Button>
                    <Link 
                      href={`/roadmap?topic=${encodeURIComponent(selectedRoadmap.title.replace(' Learning Path', ''))}&experience=${selectedRoadmap.experience || 'beginner'}&roadmapId=${selectedRoadmap.id}`}
                      passHref
                    >
                      <Button className="bg-[#5C5FFF] hover:bg-[#5C5FFF]/90 text-white">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Full Roadmap
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
