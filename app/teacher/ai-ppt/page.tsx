'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, RefreshCw, PresentationIcon, Maximize2, Minimize2, Play, Pause, X, FileUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Slide } from "@/app/types";
import Presentation from "@/components/Presentation";
import PDFUpload from "@/components/PDFUpload";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// DO NOT use Next.js dynamic import for jsPDF and html2canvas
// These libraries will be loaded dynamically at runtime

// Simple toast notification function
const showToast = (message: string, isError = false) => {
  // Only run on client
  if (typeof window === 'undefined') return;

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-md text-sm max-w-md transition-all ${isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;
  toast.style.opacity = '1';
  toast.style.transition = 'opacity 0.3s ease-in-out';
  toast.textContent = message;

  // Add to body
  document.body.appendChild(toast);

  // Remove after timeout
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Function to search for images based on a keyword
const searchImageForKeyword = async (keyword: string): Promise<string | null> => {
  try {
    if (!keyword) {
      console.error('Empty keyword provided for image search');
      return null;
    }

    // Format the keyword for the URL
    const formattedKeyword = keyword.trim().replace(/\s+/g, '-');
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(formattedKeyword)}`;

    // Log the search URL
    console.log(`Searching for images with URL: ${searchUrl}`);

    // Make request to the API route that will handle the image search
    const response = await fetch('/api/search-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const data = await response.json();
    console.log(`Image search result for "${keyword}":`, data);

    if (!data.imageUrl) {
      console.warn('No image URL returned from search API');
      return null;
    }

    // Validate the URL is accessible with a HEAD request
    try {
      const urlObj = new URL(data.imageUrl);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        console.warn('Invalid image URL protocol:', urlObj.protocol);
        return null;
      }
      return data.imageUrl;
    } catch (urlError) {
      console.error('Invalid image URL format:', data.imageUrl);
      return null;
    }
  } catch (error) {
    console.error('Error searching for image:', error);
    return null;
  }
};

interface AudioState {
  isPlaying: boolean;
  currentSlide: number | null;
  audioUrl: string | null;
}

export default function AIPPTPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pdfText, setPDFText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPPT, setIsDownloadingPPT] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [includeImages, setIncludeImages] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("corporate");
  const { toast } = useToast();

  const [inputMethod, setInputMethod] = useState<'content' | 'pdf'>('content');
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentSlide: null,
    audioUrl: null
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add new state for preloading audio
  const [preloadedAudio, setPreloadedAudio] = useState<Record<number, string>>({});

  // Add new state for fullscreen container
  const [fullscreenContainer, setFullscreenContainer] = useState<HTMLDivElement | null>(null);

  // Add currentSlideIndex state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Add new state for voice language
  const [voiceLanguage, setVoiceLanguage] = useState<'en' | 'hi'>('en');

  // Handle PDF text extraction completion
  const handlePDFTextExtracted = (text: string) => {
    setPDFText(text);
    setInputMethod('pdf');
    // Show a success message
    showToast(`Extracted ${text.length} characters of text. Ready to generate presentation.`);
  };

  // Handle PDF extraction errors
  const handlePDFError = (errorMessage: string) => {
    setError(errorMessage);
    showToast(errorMessage, true);
  };

  const handleClear = () => {
    setTitle('');
    setContent('');
    setPDFText('');
    setError(null);
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    // Validate input
    if (inputMethod === 'content' && !content) {
      setError("Please enter content for your presentation.");
      return;
    }

    if (inputMethod === 'pdf' && !pdfText) {
      setError("Please upload a PDF file.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Determine which content to use based on input method
      const inputContent = inputMethod === 'content' ? content : pdfText;

      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inputContent,
          title,
          inputMethod,
          includeImages: true, // Flag to indicate we want images
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate slides');
      }

      // Generated slides from the API
      const generatedSlides = data.slides;

      // For each slide, try to find a relevant image
      if (includeImages) {
        try {
          const slidesWithImages = await Promise.all(generatedSlides.map(async (slide: Slide, index: number) => {
            console.log(`Processing slide ${index + 1} with image prompt: "${slide.image}"`);

            if (!slide.image) {
              console.warn(`Slide ${index + 1} has no image description`);
              return { ...slide, imageUrl: '' };
            }

            // Search for an image based on the slide image description
            const imageUrl = await searchImageForKeyword(slide.image);

            console.log(`Final image URL for slide ${index + 1}: ${imageUrl || 'None found'}`);

            // Add the image URL to the slide if found
            return {
              ...slide,
              imageUrl: imageUrl || '',
            };
          }));

          console.log('All slides processed with images:', slidesWithImages);
          setSlides(slidesWithImages);
        } catch (imageError) {
          console.error('Error processing images:', imageError);
          setSlides(generatedSlides);
        }
      } else {
        setSlides(generatedSlides);
      }

    } catch (err) {
      console.error('Error generating slides:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to handle downloads
  const handleDownload = async (format: 'pdf' | 'pptx') => {
    if (!slides || slides.length === 0) {
      toast({
        title: "No slides to download",
        description: "Please generate slides first before downloading.",
        variant: "destructive",
      });
      return;
    }

    // Set the appropriate loading state
    if (format === 'pptx') {
      setIsDownloadingPPT(true);
    } else {
      setIsDownloadingPDF(true);
    }

    console.log(`Attempting to download ${slides.length} slides as ${format} with theme ${selectedTheme}`);

    try {
      if (format === 'pdf') {
        // Client-side PDF generation
        await generatePdfClientSide(selectedTheme);
        return;
      }

      // Server-side generation for PPTX
      const response = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides: slides.map(slide => ({
            ...slide,
            imageUrl: slide.imageUrl || '', // Ensure imageUrl is always a string
          })),
          format: 'pptx',
          theme: selectedTheme,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Download failed: ${error}`);
      }

      // Get the response as an array buffer
      const data = await response.arrayBuffer();

      // Create a blob with the correct content type
      const blob = new Blob(
        [data],
        { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }
      );

      // Create and trigger download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'presentation.pptx';
      document.body.appendChild(a);
      a.click();

      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PPTX Downloaded",
        description: "Your presentation has been successfully downloaded as PPTX format.",
        variant: "default",
      });
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      toast({
        title: `${format.toUpperCase()} Download Failed`,
        description: error instanceof Error ? error.message : `Failed to download presentation as ${format}`,
        variant: "destructive",
      });
    } finally {
      // Reset the appropriate loading state
      if (format === 'pptx') {
        setIsDownloadingPPT(false);
      } else {
        setIsDownloadingPDF(false);
      }
    }
  };

  // Client-side PDF generation using html2canvas and jsPDF
  const generatePdfClientSide = async (theme: string) => {
    try {
      // Dynamically import jsPDF
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      // Get the theme configuration
      const presentationThemes = {
        corporate: {
          bgColor: '#ffffff',
          textColor: '#333333',
          accentColor: '#0078d4',
          headerBg: '#f3f3f3',
          fontFamily: "'Segoe UI', sans-serif",
        },
        modern: {
          bgColor: '#f5f5f7',
          textColor: '#1d1d1f',
          accentColor: '#0071e3',
          headerBg: '#ffffff',
          fontFamily: "'SF Pro Display', 'Helvetica Neue', sans-serif",
        },
        dark: {
          bgColor: '#1e1e1e',
          textColor: '#e0e0e0',
          accentColor: '#75ddff',
          headerBg: '#252525',
          fontFamily: "'Roboto', sans-serif",
        },
        colorful: {
          bgColor: '#ffffff',
          textColor: '#333333',
          accentColor: '#ff5722',
          headerBg: '#ffebee',
          fontFamily: "'Poppins', sans-serif",
        }
      };

      const currentTheme = presentationThemes[theme as keyof typeof presentationThemes];

      // Create PDF document (landscape, A4)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Generate each slide with the selected theme
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        if (i > 0) {
          pdf.addPage();
        }

        // Add heading section with themed background
        pdf.setFillColor(hexToRgb(currentTheme.headerBg).r, hexToRgb(currentTheme.headerBg).g, hexToRgb(currentTheme.headerBg).b);
        pdf.rect(0, 0, 297, 30, 'F');
        pdf.setFontSize(36);
        pdf.setTextColor(hexToRgb(currentTheme.accentColor).r, hexToRgb(currentTheme.accentColor).g, hexToRgb(currentTheme.accentColor).b);
        pdf.text(slide.heading, 20, 20);

        // Add points section
        pdf.setFontSize(24);
        pdf.setTextColor(hexToRgb(currentTheme.textColor).r, hexToRgb(currentTheme.textColor).g, hexToRgb(currentTheme.textColor).b);
        pdf.text('Key Points', 20, 50);

        // Define the text area boundaries
        const textAreaWidth = 120; // mm
        const textAreaX = 20; // mm from left
        const textAreaY = 70; // mm from top
        const maxTextHeight = 120; // mm

        pdf.setFontSize(18);
        let yPos = textAreaY;
        slide.points.forEach((point, index) => {
          if (yPos > textAreaY + maxTextHeight) { // If we're running out of space
            pdf.addPage();
            yPos = textAreaY;
          }

          // Add bullet point
          pdf.setFillColor(0, 120, 212); // Blue color
          pdf.circle(textAreaX, yPos - 2, 2, 'F');

          // Add point text
          pdf.setTextColor(0, 0, 0); // Black color
          // Split text if it's too long
          const lines = pdf.splitTextToSize(point, textAreaWidth - 15); // 15mm for bullet and spacing
          lines.forEach((line: string, lineIndex: number) => {
            pdf.text(line, textAreaX + 10, yPos + (lineIndex * 7));
          });
          yPos += (lines.length * 7) + 5; // Adjust spacing based on number of lines
        });

        // Add image section
        if (slide.imageUrl) {
          try {
            // Load the image with retry mechanism
            const loadImage = async (url: string, retries = 3): Promise<HTMLImageElement> => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                  // Verify the image actually loaded
                  if (img.width > 0 && img.height > 0) {
                    resolve(img);
                  } else {
                    reject(new Error('Image loaded but has zero dimensions'));
                  }
                };

                img.onerror = async () => {
                  if (retries > 0) {
                    // Add a timestamp to bust cache and try different image formats
                    const formats = ['', '.jpg', '.png', '.webp'];
                    for (const format of formats) {
                      try {
                        const newUrl = url.replace(/\.[^/.]+$/, '') + format + (url.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
                        const retryImg = await loadImage(newUrl, retries - 1);
                        return resolve(retryImg);
                      } catch (e) {
                        console.log(`Failed to load image with format ${format}, trying next...`);
                      }
                    }
                    reject(new Error('Failed to load image after trying different formats'));
                  } else {
                    reject(new Error('Failed to load image after retries'));
                  }
                };

                // Set a timeout for the image load
                const timeout = setTimeout(() => {
                  img.src = ''; // Cancel the load
                  reject(new Error('Image load timeout'));
                }, 10000); // 10 second timeout

                img.src = url;

                // Clear timeout if image loads successfully
                img.onload = () => {
                  clearTimeout(timeout);
                  if (img.width > 0 && img.height > 0) {
                    resolve(img);
                  } else {
                    reject(new Error('Image loaded but has zero dimensions'));
                  }
                };
              });
            };

            // Try to load the image
            const img = await loadImage(slide.imageUrl);

            // Calculate dimensions to fit the right side of the slide
            const imageAreaWidth = 120; // mm
            const imageAreaHeight = 120; // mm
            const imageX = 150; // mm from left
            const imageY = 50; // mm from top

            const ratio = Math.min(imageAreaWidth / img.width, imageAreaHeight / img.height);
            const width = img.width * ratio;
            const height = img.height * ratio;

            // Add image to PDF with error handling
            try {
              // Add image container with shadow
              pdf.setDrawColor(0, 0, 0, 0.1);
              pdf.setFillColor(255, 255, 255);
              pdf.roundedRect(imageX, imageY, width + 10, height + 10, 3, 3, 'FD');

              // Add the image
              pdf.addImage(
                img,
                'JPEG',
                imageX + 5, // x position (centered in container)
                imageY + 5, // y position (centered in container)
                width,
                height,
                undefined,
                'FAST'
              );
            } catch (addImageError) {
              console.error(`Error adding image to PDF for slide ${i + 1}:`, addImageError);
              // Add a placeholder if image fails to add
              pdf.setFontSize(12);
              pdf.setTextColor(128, 128, 128); // Gray color
              pdf.text('Image not available', imageX + 10, imageY + 20);
            }
          } catch (imgError) {
            console.error(`Error loading image for slide ${i + 1}:`, imgError);
            // Add a placeholder if image fails to load
            pdf.setFontSize(12);
            pdf.setTextColor(128, 128, 128); // Gray color
            pdf.text('Image not available', 150, 80);
          }
        }

        // Add footer line
        pdf.setDrawColor(0, 120, 212); // Blue color
        pdf.setLineWidth(0.5);
        pdf.line(0, 200, 297, 200); // Full width footer line
      }

      // Save the PDF
      pdf.save('presentation.pdf');

      toast({
        title: "PDF Generated",
        description: "Your PDF has been successfully generated and downloaded with the selected theme.",
        variant: "default"
      });

    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF Generation Failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or use PPTX format.`,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Modify the handlePlaySlide function to support Hindi translation and voice
  const handlePlaySlide = async (slide: Slide, slideNumber: number) => {
    try {
      // Stop any currently playing audio
      handleStopAudio();

      // Prepare the text to be read
      const textToRead = `${slide.heading}. ${slide.points.join('. ')}`;

      // Show translation loading toast if Hindi is selected
      if (voiceLanguage === 'hi') {
        toast({
          title: "Translating content...",
          description: "Please wait while we translate the content to Hindi.",
        });

        // Translate the text to Hindi
        const translateResponse = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: textToRead,
            targetLanguage: 'hi'
          }),
        });

        if (!translateResponse.ok) {
          throw new Error('Failed to translate text');
        }

        const { translatedText } = await translateResponse.json();

        // Show audio generation toast
        toast({
          title: "Generating audio...",
          description: voiceLanguage === 'hi'
            ? "कृपया प्रतीक्षा करें जब तक हम हिंदी ऑडियो तैयार करते हैं।"
            : "Please wait while we prepare the audio with Ananya's voice.",
        });

        // Use Hindi voice settings
        const response = await fetch('/api/elevenlabs/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: translatedText,
            language: 'hi',
            voiceId: '21m00Tcm4TlvDq8ikWAM', // Hindi female voice ID
            stability: 0.71,
            similarityBoost: 0.85,
            style: 0.65,
            speakerBoost: true,
            modelId: "eleven_multilingual_v2"
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate audio');
        }

        // Create blob URL from the audio data
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Store the preloaded audio URL
        setPreloadedAudio(prev => ({
          ...prev,
          [slideNumber]: audioUrl
        }));

        // Create and configure audio element
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setAudioState({
            isPlaying: false,
            currentSlide: null,
            audioUrl: null
          });
        };

        audioRef.current = audio;
        audio.play();

        setAudioState({
          isPlaying: true,
          currentSlide: slideNumber,
          audioUrl
        });

        toast({
          title: "Playing audio",
          description: voiceLanguage === 'hi'
            ? "स्लाइड की सामग्री हिंदी में पढ़ी जा रही है।"
            : "Ananya is now reading the slide content.",
        });
      } else {
        // Original English voice logic
        toast({
          title: "Generating audio...",
          description: "Please wait while we prepare the audio with Ananya's voice.",
        });

        const response = await fetch('/api/elevenlabs/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: textToRead,
            language: 'en',
            voiceId: 'XB0fDUnXU5powFXDhCwa', // Ananya voice ID for English
            stability: 0.71,
            similarityBoost: 0.85,
            style: 0.65,
            speakerBoost: true,
            modelId: "eleven_multilingual_v2"
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate audio');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        setPreloadedAudio(prev => ({
          ...prev,
          [slideNumber]: audioUrl
        }));

        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setAudioState({
            isPlaying: false,
            currentSlide: null,
            audioUrl: null
          });
        };

        audioRef.current = audio;
        audio.play();

        setAudioState({
          isPlaying: true,
          currentSlide: slideNumber,
          audioUrl
        });

        toast({
          title: "Playing audio",
          description: "Ananya is now reading the slide content.",
        });
      }
    } catch (error) {
      console.error('Error playing slide audio:', error);
      toast({
        title: "Error",
        description: voiceLanguage === 'hi'
          ? "ऑडियो जनरेट करने में त्रुटि। कृपया पुनः प्रयास करें।"
          : "Failed to generate audio for this slide. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioState({
        isPlaying: false,
        currentSlide: null,
        audioUrl: null
      });
    }
  };

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (audioState.audioUrl) {
        URL.revokeObjectURL(audioState.audioUrl);
      }
    };
  }, []);

  // Modify the toggleFullScreen function for better fullscreen handling
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      const presentationContainer = document.getElementById('presentation-container');
      if (presentationContainer) {
        if (presentationContainer.requestFullscreen) {
          presentationContainer.requestFullscreen();
        } else if ((presentationContainer as any).webkitRequestFullscreen) {
          (presentationContainer as any).webkitRequestFullscreen();
        } else if ((presentationContainer as any).msRequestFullscreen) {
          (presentationContainer as any).msRequestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  // Add event listener for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Function to exit full-screen mode
  const exitFullScreen = () => {
    setIsFullScreen(false);
  };

  // Render input section based on selected input method
  const renderInputSection = () => {
    switch (inputMethod) {
      case 'content':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-800">Presentation Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your presentation"
                className="border-slate-200 focus:border-[#5C5FFF] focus:ring-[#5C5FFF]/50"
              />
            </div>
            <div>
              <Label htmlFor="content" className="text-slate-800">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the content for your presentation"
                className="h-40 border-slate-200 focus:border-[#5C5FFF] focus:ring-[#5C5FFF]/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeImages"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="h-4 w-4 text-[#5C5FFF] rounded border-gray-300 focus:ring-[#5C5FFF]/50"
              />
              <Label htmlFor="includeImages" className="text-sm text-slate-700">
                Include images from web search
              </Label>
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-800">Presentation Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your presentation"
                className="border-slate-200 focus:border-[#5C5FFF] focus:ring-[#5C5FFF]/50"
              />
            </div>
            <PDFUpload
              onTextExtracted={setPDFText}
              onError={(errorMsg) => {
                setError(errorMsg);
                showToast(errorMsg, true);
              }}
            />
            {pdfText && (
              <div className="text-sm text-slate-500">
                <p>PDF text extracted: {pdfText.slice(0, 100)}...</p>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeImages"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="h-4 w-4 text-[#5C5FFF] rounded border-gray-300 focus:ring-[#5C5FFF]/50"
              />
              <Label htmlFor="includeImages" className="text-sm text-slate-700">
                Include images from web search
              </Label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">AI Presentation Generator</h1>
          <p className="text-slate-600 mt-1">
            Create professional presentations from text content or PDF with AI assistance
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
              <CardDescription className="text-slate-600">Choose how to create your presentation</CardDescription>
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

              <div className="flex space-x-3 pt-3">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (inputMethod === 'content' ? !content : !pdfText)}
                  className="flex-1 bg-[#5C5FFF] hover:bg-[#4548FF] text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <PresentationIcon className="mr-2 h-4 w-4" />
                      Generate Slides
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

          {slides && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-800">Export Options</CardTitle>
                <CardDescription className="text-slate-600">Save your presentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-100"
                  onClick={() => handleDownload('pptx')}
                  disabled={isDownloadingPPT}
                >
                  {isDownloadingPPT ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download as PowerPoint
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-100"
                  onClick={() => handleDownload('pdf')}
                  disabled={isDownloadingPDF}
                >
                  {isDownloadingPDF ? (
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
                  Regenerate Slides
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Presentation Preview */}
        <div className="md:col-span-7 lg:col-span-8">
          {slides.length > 0 ? (
            <Card className="bg-white border-slate-200 shadow-sm h-full rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Generated Presentation</CardTitle>
                  <CardDescription>
                    Review and navigate through your slides
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFullScreen}
                    className="ml-2"
                  >
                    {isFullScreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-6rem)]">
                <div
                  id="presentation-container"
                  className={`relative h-full rounded-lg ${isFullScreen
                    ? 'fixed inset-0 z-[9999] bg-black flex items-center justify-center'
                    : ''
                    }`}
                >
                  {isFullScreen ? (
                    <div className="w-full h-full relative flex flex-col">
                      <div className="absolute top-4 right-4 z-[10000] flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleFullScreen}
                          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-[10000]">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const prevIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : slides.length - 1;
                            setCurrentSlideIndex(prevIndex);
                          }}
                          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-[10000]">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const nextIndex = currentSlideIndex < slides.length - 1 ? currentSlideIndex + 1 : 0;
                            setCurrentSlideIndex(nextIndex);
                          }}
                          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center gap-4">
                        <div className="flex items-center gap-4 bg-black/50 px-6 py-3 rounded-full">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setVoiceLanguage('en')}
                              className={`text-white hover:bg-black/70 px-3 py-1 text-sm ${voiceLanguage === 'en' ? 'bg-white/20' : ''}`}
                            >
                              ENG
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setVoiceLanguage('hi')}
                              className={`text-white hover:bg-black/70 px-3 py-1 text-sm ${voiceLanguage === 'hi' ? 'bg-white/20' : ''}`}
                            >
                              हिंदी
                            </Button>
                          </div>
                          <div className="h-4 w-px bg-white/20" />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (audioState.isPlaying) {
                                handleStopAudio();
                              } else {
                                handlePlaySlide(slides[currentSlideIndex], currentSlideIndex);
                              }
                            }}
                            className="text-white hover:bg-black/70"
                          >
                            {audioState.isPlaying ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5" />
                            )}
                          </Button>
                          <div className="h-4 w-px bg-white/20" />
                          <span className="text-white/90 text-sm">
                            Slide {currentSlideIndex + 1} of {slides.length}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-full flex items-center justify-center">
                        <Presentation
                          slides={slides}
                          onSlideChange={(index) => setCurrentSlideIndex(index)}
                          isFullScreen={isFullScreen}
                          currentIndex={currentSlideIndex}
                          onThemeChange={(theme) => setSelectedTheme(theme)}
                          selectedTheme={selectedTheme}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={`relative ${isFullScreen ? 'w-full h-full' : 'h-full'}`}>
                      <Presentation
                        slides={slides}
                        onSlideChange={(index) => setCurrentSlideIndex(index)}
                        isFullScreen={isFullScreen}
                        currentIndex={currentSlideIndex}
                        onThemeChange={(theme) => setSelectedTheme(theme)}
                      />
                      {!isFullScreen && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
                          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVoiceLanguage('en')}
                                className={`px-3 py-1 text-sm ${voiceLanguage === 'en' ? 'bg-gray-100' : ''}`}
                              >
                                ENG
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVoiceLanguage('hi')}
                                className={`px-3 py-1 text-sm ${voiceLanguage === 'hi' ? 'bg-gray-100' : ''}`}
                              >
                                हिंदी
                              </Button>
                            </div>
                            <div className="h-4 w-px bg-gray-200" />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (audioState.isPlaying) {
                                  handleStopAudio();
                                } else {
                                  handlePlaySlide(slides[currentSlideIndex], currentSlideIndex);
                                }
                              }}
                              className="hover:bg-gray-100"
                            >
                              {audioState.isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-slate-200 shadow-sm h-full rounded-xl">
              <CardHeader>
                <CardTitle>Presentation Preview</CardTitle>
                <CardDescription>
                  Your generated presentation will appear here
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[calc(100%-6rem)]">
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl w-full max-w-2xl">
                  <PresentationIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No Presentation Generated Yet</h3>
                  <p className="text-slate-500 mb-4">
                    Enter your content or upload a PDF file to generate a presentation.
                    The generated slides will appear here with images and text-to-speech capabilities.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setInputMethod('content')}
                      className="border-slate-200"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Enter Content
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setInputMethod('pdf')}
                      className="border-slate-200"
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Upload PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
