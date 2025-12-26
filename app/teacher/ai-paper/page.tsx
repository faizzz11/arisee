'use client';

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, RefreshCw, FileQuestion, Clock, BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Question, QuestionPaper } from "@/app/types";
import PDFUpload from "@/components/PDFUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from 'next/dynamic';

export default function AIQuestionPaperPage() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [pdfText, setPDFText] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [duration, setDuration] = useState(180); // 3 hours in minutes
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [marksDistribution, setMarksDistribution] = useState({
    mcq: 20,
    short: 30,
    long: 50
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [questionPaper, setQuestionPaper] = useState<QuestionPaper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [inputMethod, setInputMethod] = useState<'content' | 'pdf'>('content');

  // Handle PDF text extraction completion
  const handlePDFTextExtracted = (text: string) => {
    setPDFText(text);
    setInputMethod('pdf');
    toast({
      title: "PDF Extracted",
      description: `Extracted ${text.length} characters of text. Ready to generate question paper.`,
    });
  };

  // Handle PDF extraction errors
  const handlePDFError = (errorMessage: string) => {
    setError(errorMessage);
    toast({
      title: "PDF Extraction Failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleClear = () => {
    setTitle('');
    setSubject('');
    setContent('');
    setPDFText('');
    setError(null);
    setQuestionPaper(null);
  };

  const handleGenerate = async () => {
    // Validate input
    if (inputMethod === 'content' && !content) {
      setError("Please enter content for your question paper.");
      return;
    }

    if (inputMethod === 'pdf' && !pdfText) {
      setError("Please upload a PDF file.");
      return;
    }

    if (!title) {
      setError("Please enter a title for your question paper.");
      return;
    }

    if (!subject) {
      setError("Please enter a subject for your question paper.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Call the API endpoint
      const response = await fetch('/api/generate-question-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          subject,
          content,
          pdfText,
          totalMarks,
          duration,
          difficulty,
          marksDistribution,
          inputMethod
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate question paper');
      }

      const data = await response.json();
      
      if (!data.questionPaper) {
        throw new Error('Invalid response from server');
      }

      setQuestionPaper(data.questionPaper);

      toast({
        title: "Question Paper Generated",
        description: "Your question paper has been successfully generated.",
      });
    } catch (err) {
      console.error('Error generating question paper:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!questionPaper) {
      toast({
        title: "No Question Paper",
        description: "Please generate a question paper first before downloading.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      if (format === 'pdf') {
        toast({
          title: "Generating PDF",
          description: "Preparing your question paper for download...",
        });

        try {
          // Import jspdf
          const jspdfModule = await import('jspdf');
          // Use type assertion to handle the constructor properly
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const JsPDF = jspdfModule.default as any;
          
          // Create a new document (A4 format by default)
          const doc = new JsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          // Set document properties
          doc.setProperties({
            title: questionPaper.title,
            subject: questionPaper.subject,
            creator: 'AI Question Paper Generator',
            author: 'AI System'
          });

          // Define page margins and content width
          const margin = 20;
          const pageWidth = 210; // A4 width in mm
          const contentWidth = pageWidth - (margin * 2);
          
          // Add page header with border
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(margin, 35, pageWidth - margin, 35); // Top header border

          // Add title and header
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(questionPaper.title, 105, 25, { align: 'center' });
          
          doc.setFontSize(12);
          doc.text(questionPaper.subject, 105, 32, { align: 'center' });
          
          // Add metadata
          let yPosition = 40;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Total Marks: ${questionPaper.totalMarks}`, margin, yPosition);
          doc.text(`Duration: ${Math.floor(questionPaper.duration / 60)}h ${questionPaper.duration % 60}m`, pageWidth - margin, yPosition, { align: 'right' });
          
          yPosition += 10;
          
          // Add instructions box
          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(245, 245, 245);
          doc.roundedRect(margin, yPosition, contentWidth, 25, 1, 1, 'F');
          doc.setLineWidth(0.3);
          doc.line(margin, yPosition, margin + 3, yPosition); // Left border accent
          
          yPosition += 5;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('INSTRUCTIONS:', margin + 5, yPosition);
          
          // Add instructions
          yPosition += 5;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          questionPaper.instructions.forEach((instruction, idx) => {
            doc.text(`${idx + 1}. ${instruction}`, margin + 8, yPosition);
            yPosition += 4;
          });
          
          yPosition += 8;
          
          // Add sections and questions
          questionPaper.sections.forEach((section, sectionIndex) => {
            // Add a new page if we're close to the bottom
            if (yPosition > 270) {
              doc.addPage();
              yPosition = margin;
            }
            
            // Add section header with background
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPosition - 5, contentWidth, 10, 'F');
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(section.title, margin + 3, yPosition);
            yPosition += 8;
            
            if (section.description) {
              doc.setFontSize(9);
              doc.setFont('helvetica', 'italic');
              doc.text(section.description, margin + 5, yPosition);
              yPosition += 8;
            } else {
              yPosition += 3;
            }
            
            section.questions.forEach((question, questionIndex) => {
              // Add a new page if we're close to the bottom
              if (yPosition > 270) {
                doc.addPage();
                yPosition = margin;
              }
              
              // Create a question header row
              const questionHeaderY = yPosition;
              
              // Reserve space for question number
              const questionNumWidth = 10; // Width reserved for question number
              
              // Question number on the left
              doc.setFontSize(11);
              doc.setFont('helvetica', 'bold');
              doc.text(`Q${sectionIndex + 1}.${questionIndex + 1}`, margin, questionHeaderY);
              
              // Question marks on the right
              doc.setFontSize(9);
              doc.setFont('helvetica', 'normal');
              const marksText = `[${question.marks} ${question.marks === 1 ? 'mark' : 'marks'}]`;
              doc.text(marksText, pageWidth - margin, questionHeaderY, { align: 'right' });
              
              // Question text with proper wrapping - placed UNDER the question number and marks
              // to completely avoid any overlap possibility
              doc.setFontSize(10);
              doc.setFont('helvetica', 'normal');
              
              // Calculate available width for question text (full content width)
              const availableTextWidth = contentWidth - 10;
              
              // Split text into lines that fit within available width
              const textLines = doc.splitTextToSize(question.text, availableTextWidth);
              
              // Position text below the question number/marks row to avoid overlap
              const textY = questionHeaderY + 5;
              doc.text(textLines, margin + 10, textY);
              
              // Move position down based on number of lines (with minimum spacing)
              const lineHeight = 5; // mm per line
              yPosition = textY + Math.max(textLines.length * lineHeight, 8);
              
              // For MCQ, add options
              if (question.type === 'mcq' && question.options) {
                question.options.forEach((option, optionIndex) => {
                  // Add a new page if we're close to the bottom
                  if (yPosition > 270) {
                    doc.addPage();
                    yPosition = margin;
                  }
                  
                  const letter = String.fromCharCode(65 + optionIndex);
                  
                  // Draw option letter in circle
                  doc.setDrawColor(200, 200, 200);
                  doc.setFillColor(245, 245, 245);
                  doc.circle(margin + 15, yPosition - 1.5, 3, 'F');
                  
                  doc.setFontSize(9);
                  doc.setFont('helvetica', 'bold');
                  doc.text(letter, margin + 15, yPosition, { align: 'center' });
                  
                  // Option text
                  doc.setFont('helvetica', 'normal');
                  const optionLines = doc.splitTextToSize(option, contentWidth - 40);
                  doc.text(optionLines, margin + 20, yPosition);
                  
                  yPosition += Math.max(optionLines.length * lineHeight, 7);
                });
              } else {
                // Add answer space for short and long questions
                // Draw a light dotted box to indicate answer area
                const answerBoxHeight = question.type === 'short' ? 25 : 50;
                
                // Use basic rectangle with gray color instead of dashed lines
                // (setDashPattern is not supported in all jsPDF versions)
                doc.setDrawColor(180, 180, 180);
                doc.setLineWidth(0.2);
                doc.rect(margin + 5, yPosition, contentWidth - 10, answerBoxHeight);
                
                // Add "Answer Space" text
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(150, 150, 150);
                doc.text(`Answer space (${question.type === 'short' ? 'Short Answer' : 'Long Answer'})`, 
                  margin + 8, yPosition + 4);
                doc.setTextColor(0, 0, 0);
                
                // Draw horizontal dotted lines manually for answer area
                const lineSpacing = 5; // mm between lines
                doc.setDrawColor(210, 210, 210);
                doc.setLineWidth(0.1);
                
                // Draw multiple thin horizontal lines to simulate lined paper
                for (let i = 1; i < answerBoxHeight / lineSpacing; i++) {
                  const lineY = yPosition + (i * lineSpacing);
                  doc.line(margin + 5, lineY, margin + contentWidth - 5, lineY);
                }
                
                yPosition += answerBoxHeight + 5;
              }
              
              // Add spacing between questions
              yPosition += 5;
            });
            
            yPosition += 5;
          });
          
          // Add footer
          const lastPage = doc.getNumberOfPages();
          doc.setPage(lastPage);
          
          const finalYPosition = Math.min(yPosition + 10, 275);
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(margin, finalYPosition, pageWidth - margin, finalYPosition);
          
          // Add a centered footer text
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text('--- End of Question Paper ---', 105, finalYPosition + 5, { align: 'center' });
          
          // Save the PDF
          doc.save(`${questionPaper.title.replace(/\s+/g, '_')}.pdf`);
          
          toast({
            title: "PDF Downloaded",
            description: "Your question paper has been successfully downloaded.",
          });
        } catch (pdfError) {
          console.error('Error generating PDF:', pdfError);
          toast({
            title: "PDF Generation Failed",
            description: pdfError instanceof Error ? pdfError.message : "Failed to generate PDF",
            variant: "destructive",
          });
        }
      } else if (format === 'docx') {
        // In a real implementation, this would call an API to generate a DOCX file
        // For this demo, we'll show a message that DOCX is not implemented
        toast({
          title: "DOCX Download",
          description: "DOCX download is not implemented in this demo version.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      toast({
        title: `${format.toUpperCase()} Download Failed`,
        description: error instanceof Error ? error.message : `Failed to download question paper as ${format}`,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Render input section based on selected input method
  const renderInputSection = () => {
    switch (inputMethod) {
      case 'content':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-slate-800">Paper Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your question paper"
                  className="border-slate-200 focus:border-[#5C5FFF] focus:ring-[#5C5FFF]/50"
                />
              </div>
              <div>
                <Label htmlFor="subject" className="text-slate-800">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter the subject"
                  className="border-slate-200 focus:border-[#5C5FFF] focus:ring-[#5C5FFF]/50"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="content" className="text-slate-800">Content/Syllabus</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the content or syllabus to generate questions from"
                className="h-40 border-slate-200 focus:border-[#5C5FFF] focus:ring-[#5C5FFF]/50"
              />
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-slate-800">Paper Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your question paper"
                  className="border-slate-200 focus:border-[#5C5FFF] focus:ring-[#5C5FFF]/50"
                />
              </div>
              <div>
                <Label htmlFor="subject" className="text-slate-800">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter the subject"
                  className="border-slate-200 focus:border-[#5C5FFF] focus:ring-[#5C5FFF]/50"
                />
              </div>
            </div>
            <PDFUpload
              onTextExtracted={handlePDFTextExtracted}
              onError={handlePDFError}
            />
            {pdfText && (
              <div className="text-sm text-slate-500">
                <p>PDF text extracted: {pdfText.slice(0, 100)}...</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Function to render the question paper preview
  const renderQuestionPaper = () => {
    if (!questionPaper) return null;

    return (
      <Card className="bg-white border-slate-200 shadow-sm h-full overflow-auto">
        <CardContent className="p-8 print:p-0">
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{questionPaper.title}</h1>
            <h2 className="text-xl font-medium text-slate-700 mb-4">{questionPaper.subject}</h2>
            
            <div className="flex justify-center items-center gap-8 mt-2">
              <div className="px-4 py-1 border border-slate-300 rounded-md">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Duration: {Math.floor(questionPaper.duration / 60)}h {questionPaper.duration % 60}m
                  </span>
                </div>
              </div>
              <div className="px-4 py-1 border border-slate-300 rounded-md">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Total Marks: {questionPaper.totalMarks}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 bg-slate-50 p-4 border-l-4 border-slate-300 rounded-r-md">
            <h3 className="text-lg font-medium mb-2 text-slate-800">Instructions:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              {questionPaper.instructions.map((instruction, idx) => (
                <li key={idx} className="text-sm text-slate-700">{instruction}</li>
              ))}
            </ol>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {questionPaper.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border-t-2 border-slate-200 pt-4">
                <h3 className="text-lg font-semibold mb-2 text-slate-800 bg-slate-100 px-3 py-1 rounded">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-sm text-slate-600 italic mb-4 ml-2">{section.description}</p>
                )}
                
                <div className="space-y-6">
                  {section.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="pb-4 border-b border-slate-100">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-slate-800">
                          Q{sectionIndex + 1}.{questionIndex + 1}
                        </span>
                        <span className="text-sm bg-slate-200 px-2 py-0.5 rounded-full font-medium">
                          {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                        </span>
                      </div>
                      <div className="ml-6">
                        <p className="text-slate-800 mb-3">{question.text}</p>
                        
                        {question.type === 'mcq' && question.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-start gap-2 text-slate-700">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-medium">
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                                <span className="pt-1">{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Add answer space for short and long questions */}
                        {(question.type === 'short' || question.type === 'long') && (
                          <div className={`mt-2 border-t border-dashed border-slate-200 pt-2 
                            ${question.type === 'short' ? 'h-20' : 'h-32'}`}>
                            <div className="text-xs text-slate-400 italic">
                              Answer space ({question.type === 'short' ? 'Short Answer' : 'Long Answer'})
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-4 border-t-2 border-slate-800 text-center">
            <p className="text-slate-500 text-sm">--- End of Question Paper ---</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">AI Question Paper Generator</h1>
          <p className="text-slate-600 mt-1">
            Create professional question papers from text content or PDF with AI assistance
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Input Section */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-800">Input Options</CardTitle>
              <CardDescription className="text-slate-600">Choose how to create your question paper</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex border-b border-slate-200">
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${inputMethod === 'content' ? 'border-b-2 border-[#5C5FFF] text-[#5C5FFF]' : 'text-slate-600 hover:text-slate-900'}`}
                  onClick={() => setInputMethod('content')}
                >
                  From Text
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium transition-colors ${inputMethod === 'pdf' ? 'border-b-2 border-[#5C5FFF] text-[#5C5FFF]' : 'text-slate-600 hover:text-slate-900'}`}
                  onClick={() => setInputMethod('pdf')}
                >
                  From PDF
                </button>
              </div>

              {renderInputSection()}

              {/* Question Paper Settings */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="font-medium text-slate-800 mb-3">Question Paper Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="difficulty" className="text-slate-700">Difficulty Level</Label>
                    <Select 
                      value={difficulty} 
                      onValueChange={(value) => setDifficulty(value as 'easy' | 'medium' | 'hard')}
                    >
                      <SelectTrigger id="difficulty" className="w-full border-slate-200">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="totalMarks" className="text-slate-700">Total Marks</Label>
                    <Select 
                      value={totalMarks.toString()} 
                      onValueChange={(value) => setTotalMarks(parseInt(value))}
                    >
                      <SelectTrigger id="totalMarks" className="w-full border-slate-200">
                        <SelectValue placeholder="Select total marks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20 Marks</SelectItem>
                        <SelectItem value="40">40 Marks</SelectItem>
                        <SelectItem value="60">60 Marks</SelectItem>
                        <SelectItem value="80">80 Marks</SelectItem>
                        <SelectItem value="100">100 Marks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration" className="text-slate-700">Duration (minutes)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="duration"
                        type="number"
                        min={30}
                        max={240}
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="border-slate-200"
                      />
                      <span className="text-sm text-slate-500">
                        {Math.floor(duration / 60)}h {duration % 60}m
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Label className="text-slate-700 mb-3 block">Marks Distribution</Label>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Multiple Choice (MCQ)</span>
                          <span>{marksDistribution.mcq} marks</span>
                        </div>
                        <Slider
                          value={[marksDistribution.mcq]}
                          min={0}
                          max={totalMarks}
                          step={5}
                          onValueChange={(value) => {
                            const mcq = value[0];
                            // Ensure total doesn't exceed totalMarks
                            const remaining = totalMarks - mcq;
                            const short = Math.min(marksDistribution.short, Math.floor(remaining * 0.6));
                            const long = remaining - short;
                            setMarksDistribution({ mcq, short, long });
                          }}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Short Answer</span>
                          <span>{marksDistribution.short} marks</span>
                        </div>
                        <Slider
                          value={[marksDistribution.short]}
                          min={0}
                          max={totalMarks - marksDistribution.mcq}
                          step={5}
                          onValueChange={(value) => {
                            const short = value[0];
                            setMarksDistribution({
                              ...marksDistribution,
                              short,
                              long: totalMarks - marksDistribution.mcq - short
                            });
                          }}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Long Answer</span>
                          <span>{marksDistribution.long} marks</span>
                        </div>
                        <Slider
                          value={[marksDistribution.long]}
                          min={0}
                          max={totalMarks}
                          step={5}
                          disabled
                        />
                      </div>
                    </div>
                    
                    <div className="mt-1 text-sm text-slate-500">
                      Total: {marksDistribution.mcq + marksDistribution.short + marksDistribution.long} / {totalMarks} marks
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (inputMethod === 'content' ? !content : !pdfText) || !title || !subject}
                  className="flex-1 bg-[#5C5FFF] hover:bg-[#4548FF] text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileQuestion className="mr-2 h-4 w-4" />
                      Generate Paper
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {questionPaper && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-800">Export Options</CardTitle>
                <CardDescription className="text-slate-600">Save your question paper</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-100"
                  onClick={() => handleDownload('docx')}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download as Word
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-100"
                  onClick={() => handleDownload('pdf')}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Download as PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-100"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Paper
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Question Paper Preview */}
        <div className="md:col-span-7 lg:col-span-8">
          {questionPaper ? (
            renderQuestionPaper()
          ) : (
            <Card className="bg-white border-slate-200 shadow-sm h-full flex items-center justify-center p-6">
              <div className="text-center p-8">
                <FileQuestion className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">No Question Paper Yet</h3>
                <p className="text-slate-600 max-w-sm mx-auto">
                  Enter your content or upload a PDF, then click "Generate Paper" to create your question paper.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}