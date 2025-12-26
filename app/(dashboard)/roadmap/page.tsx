"use client";

import { Suspense, useState, useEffect } from "react";
import {
  FiBook,
  FiVideo,
  FiFileText,
  FiMonitor,
  FiClock,
  FiAward,
  FiArrowRight,
  FiCheck,
  FiTarget,
  FiStar,
} from "react-icons/fi";
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

interface Resource {
  name: string;
  type: "video" | "article" | "course" | "book";
  url: string;
}

interface Stage {
  name: string;
  description: string;
  timeEstimate: string;
  skills: string[];
  resources: Resource[];
}

interface RoadmapData {
  roadmap: {
    title: string;
    overview: string;
    stages: Stage[];
    additionalTips: string[];
  };
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case "video":
      return <FiVideo className='w-6 h-6' />;
    case "article":
      return <FiFileText className='w-6 h-6' />;
    case "course":
      return <FiMonitor className='w-6 h-6' />;
    case "book":
      return <FiBook className='w-6 h-6' />;
    default:
      return <FiFileText className='w-6 h-6' />;
  }
};

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
    } else if (simpleResource.includes('article')) {
      return {
        title: "JavaScript: Understanding the Weird Parts",
        url: "https://medium.com/javascript-scene/javascript-understanding-the-weird-parts-d4e0f583646d",
        source: "Medium - Eric Elliott"
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
    } else if (simpleResource.includes('article')) {
      return {
        title: "The Ultimate Guide to Python: How to Go From Beginner to Pro",
        url: "https://realpython.com/learning-paths/python-programming-language/",
        source: "Real Python"
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
    } else if (simpleResource.includes('book')) {
      return {
        title: "Java: A Beginner's Guide",
        url: "https://www.amazon.com/Java-Beginners-Eighth-Herbert-Schildt/dp/1260440214/",
        source: "Amazon - Herbert Schildt"
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
    } else if (simpleResource.includes('book')) {
      return {
        title: "C++ Primer",
        url: "https://www.amazon.com/Primer-5th-Stanley-B-Lippman/dp/0321714113/",
        source: "Amazon - Stanley B. Lippman"
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
    } else if (simpleResource.includes('book')) {
      return {
        title: "C# 9.0 in a Nutshell",
        url: "https://www.amazon.com/C-9-0-Nutshell-Definitive-Reference/dp/1098100964/",
        source: "Amazon - Joseph Albahari"
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
    } else if (simpleResource.includes('book')) {
      return {
        title: "React Quickly: Painless web apps with React, JSX, Redux, and GraphQL",
        url: "https://www.amazon.com/React-Quickly-Painless-Redux-GraphQL/dp/1617293342/",
        source: "Amazon - Azat Mardan"
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
    } else if (simpleResource.includes('book')) {
      return {
        title: "SQL: The Ultimate Beginner's Guide to Learn SQL Programming Step by Step",
        url: "https://www.amazon.com/SQL-Ultimate-Beginners-Programming-Step/dp/1721175814/",
        source: "Amazon - Ryan Turner"
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
    } else if (simpleResource.includes('book')) {
      return {
        title: "The Go Programming Language",
        url: "https://www.amazon.com/Programming-Language-Addison-Wesley-Professional-Computing/dp/0134190440/",
        source: "Amazon - Alan A. A. Donovan & Brian W. Kernighan"
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
    } else if (simpleResource.includes('book')) {
      return {
        title: "The Rust Programming Language",
        url: "https://www.amazon.com/Rust-Programming-Language-2nd/dp/1718503105/",
        source: "Amazon - Steve Klabnik & Carol Nichols"
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
    } else if (simpleResource.includes('book')) {
      return {
        title: "Programming TypeScript",
        url: "https://www.amazon.com/Programming-TypeScript-Making-JavaScript-Applications/dp/1492037656/",
        source: "Amazon - Boris Cherny"
      };
    }
  }

  // Default to search link if no specific resource found
  return null;
};

const NapkinStage = ({
  stage,
  index,
  isLast,
  topic,
}: {
  stage: Stage;
  index: number;
  isLast: boolean;
  topic: string;
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), index * 400);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <motion.div
      className='relative mb-12'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
    >
      <div className='flex items-start gap-8'>
        {/* Stage number and connector */}
        <div className='flex flex-col items-center'>
          <RoughNotation
            type='circle'
            show={show}
            strokeWidth={3}
            padding={12}
            iterations={2}
            animationDuration={800}
            color="#6C5CE7"
          >
            <div className='w-16 h-16 flex items-center justify-center font-display text-2xl bg-[#6C5CE7] text-white rounded-full'>
              {index + 1}
            </div>
          </RoughNotation>
          {!isLast && (
            <div className='h-32 w-px bg-[#6C5CE7]/20 my-4 rough-line'></div>
          )}
        </div>

        {/* Content */}
        <div className='flex-1'>
          <RoughNotationGroup show={show}>
            <div className='bg-white rounded-2xl p-8 napkin-card shadow-xl hover:shadow-2xl transition-all duration-300'>
              <div className='flex items-center gap-3 mb-6'>
                <RoughNotation type='underline' color='#6C5CE7' padding={4}>
                  <h3 className='text-3xl font-display font-bold'>{stage.name}</h3>
                </RoughNotation>
              </div>

              <p className='text-gray-600 mb-6 text-lg font-body'>
                {stage.description}
              </p>

              <div className='flex items-center gap-3 text-lg text-[#6C5CE7] mb-8 font-body'>
                <FiClock className="w-6 h-6" />
                <span>{stage.timeEstimate}</span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div>
                  <RoughNotation
                    type='bracket'
                    brackets={["left", "right"]}
                    padding={12}
                    color="#6C5CE7"
                  >
                    <div className='p-4'>
                      <h4 className='font-display text-2xl mb-4 text-[#6C5CE7]'>
                        Skills to Learn:
                      </h4>
                      <div className='flex flex-wrap gap-3'>
                        {stage.skills.map((skill, i) => (
                          <RoughNotation
                            key={i}
                            type='highlight'
                            color='#E0DEE6'
                            show={show}
                          >
                            <span className='px-4 py-2 text-lg font-body bg-white rounded-full'>
                              {skill}
                            </span>
                          </RoughNotation>
                        ))}
                      </div>
                    </div>
                  </RoughNotation>
                </div>

                <div>
                  <h4 className='font-display text-2xl mb-4 text-[#6C5CE7]'>Resources:</h4>
                  <div className='space-y-4'>
                    {stage.resources.map((resource, i) => {
                      const specificResource = getSpecificResource(resource.name, topic);
                      const resourceLink = specificResource ? specificResource.url : resource.url;

                      return (
                        <RoughNotation key={i} type='box' padding={12} show={show} color="#6C5CE7">
                          <div className='p-4 hover:bg-[#6C5CE7]/5 transition-colors rounded-xl'>
                            <a
                              href={resourceLink}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='flex items-center gap-4 group'
                              onClick={() => toast.success(`Opening ${resource.name}`)}
                            >
                              {getResourceIcon(resource.type)}
                              <span className='flex-1 font-body text-lg group-hover:text-[#6C5CE7] transition-colors'>
                                {resource.name}
                              </span>
                              <span className='text-sm text-gray-500 font-body'>
                                {resource.type}
                              </span>
                              <FiArrowRight className="w-5 h-5 text-[#6C5CE7] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>

                            {specificResource && (
                              <div className='mt-3 pt-3 border-t border-gray-100'>
                                <a
                                  href={specificResource.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='flex items-start gap-3 text-xs hover:text-[#6C5CE7] transition-colors'
                                >
                                  <div className='flex-shrink-0 rounded overflow-hidden bg-gray-100 p-2'>
                                    {getResourceIcon(resource.type)}
                                  </div>
                                  <div className='flex-1'>
                                    <p className='font-medium text-[#6C5CE7]'>{specificResource.title}</p>
                                    <p className='text-gray-500 mt-1'>{specificResource.source}</p>
                                  </div>
                                </a>
                              </div>
                            )}
                          </div>
                        </RoughNotation>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </RoughNotationGroup>
        </div>
      </div>
    </motion.div>
  );
};

// Replace the template literal styles with a JavaScript style object
const roadmapStyles = {
  fontStyles: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');

    .font-display {
      font-family: 'Playfair Display', serif;
    }

    .font-body {
      font-family: 'Inter', sans-serif;
    }

    .napkin-card {
      background-color: #ffffff;
      box-shadow: 0 4px 20px rgba(108, 92, 231, 0.1);
      position: relative;
      border: 1px solid rgba(108, 92, 231, 0.1);
    }

    .napkin-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 98%, #6C5CE7 98%);
      pointer-events: none;
      opacity: 0.1;
    }

    .rough-line {
      position: relative;
    }

    .rough-line::before {
      content: '';
      position: absolute;
      left: -1px;
      right: -1px;
      height: 100%;
      background-image: repeating-linear-gradient(
        0deg,
        #6C5CE7,
        #6C5CE7 4px,
        transparent 4px,
        transparent 8px
      );
      opacity: 0.2;
    }
  `
};

function RoadmapInner() {
  // Update style application in useEffect
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = roadmapStyles.fontStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "";
  const experience = searchParams.get("experience") || "beginner";
  const [isLoading, setIsLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const generateRoadmap = async () => {
      if (!topic) {
        setError("No topic provided");
        setIsLoading(false);
        return;
      }

      try {
        toast.loading("Generating your personalized roadmap...", { id: "roadmap" });
        const response = await fetch("/api/generate-roadmap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            experience,
            focus: "",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate roadmap");
        }

        const data = await response.json();
        setRoadmap(data);
        toast.success("Roadmap generated successfully!", { id: "roadmap" });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong", { id: "roadmap" });
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    generateRoadmap();
  }, [topic, experience]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br '>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-6'></div>
          <p className='text-gray-600 font-body text-xl'>Generating your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6C5CE7]/5 to-[#A8A4E6]/5'>
        <div className='text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl'>
          <div className='bg-red-50 text-red-500 p-6 rounded-xl mb-6'>
            <p className='font-body text-lg'>{error}</p>
          </div>
          <p className='text-gray-600 font-body text-lg'>Please try again later</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6C5CE7]/5 to-[#A8A4E6]/5'>
        <div className='text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl'>
          <p className='text-gray-600 font-body text-lg'>No roadmap data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto p-8 bg-gradient-to-br  min-h-screen'>
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
      <div className='text-center mb-16'>
        <RoughNotationGroup show>
          <RoughNotation type='underline' color='#6C5CE7' strokeWidth={3}>
            <h1 className='text-5xl font-display font-bold mb-6 text-[#1E1E2E]'>
              Your Learning Path
            </h1>
          </RoughNotation>
          <p className='text-gray-600 font-body text-xl'>
            Master {topic} with this personalized roadmap
          </p>
        </RoughNotationGroup>
      </div>

      <div className='space-y-16'>
        <div className='text-center max-w-3xl mx-auto'>
          <RoughNotationGroup show>
            <RoughNotation type='underline' color='#6C5CE7'>
              <h2 className='text-4xl font-display font-bold mb-6 text-[#1E1E2E]'>
                {roadmap.roadmap.title}
              </h2>
            </RoughNotation>
            <p className='text-gray-600 font-body text-xl'>
              {roadmap.roadmap.overview}
            </p>
          </RoughNotationGroup>
        </div>

        <div className='relative px-4'>
          {roadmap.roadmap.stages.map((stage, index) => (
            <NapkinStage
              key={index}
              stage={stage}
              index={index}
              isLast={index === roadmap.roadmap.stages.length - 1}
              topic={topic}
            />
          ))}
        </div>

        {roadmap.roadmap.additionalTips.length > 0 && (
          <RoughNotationGroup show>
            <div className='p-10 napkin-card'>
              <RoughNotation type='underline' color='#6C5CE7'>
                <h3 className='text-3xl font-display font-bold mb-6 text-[#1E1E2E]'>Pro Tips</h3>
              </RoughNotation>
              <ul className='space-y-4'>
                {roadmap.roadmap.additionalTips.map((tip, index) => (
                  <motion.li
                    key={index}
                    className='flex items-start gap-4 p-4 bg-[#6C5CE7]/5 rounded-xl'
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FiAward className='w-6 h-6 text-[#6C5CE7] mt-1' />
                    <span className='text-gray-700 font-body text-lg'>
                      {tip}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </RoughNotationGroup>
        )}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={null}>
      <RoadmapInner />
    </Suspense>
  );
}
