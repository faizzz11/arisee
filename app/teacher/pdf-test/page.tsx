'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PDFTestPage() {
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Import jspdf
      const jspdfModule = await import('jspdf');
      // Use type assertion to handle the constructor properly
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const JsPDF = jspdfModule.default as any;
      
      // Create a new document
      const doc = new JsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add some text
      doc.setFontSize(18);
      doc.text('PDF Generation Test', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text('This is a test PDF generated with jsPDF.', 20, 40);
      doc.text('If you can see this PDF, the library is working correctly.', 20, 50);
      
      // Save the PDF
      doc.save('test-pdf.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">jsPDF Test Page</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>PDF Generation Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Click the button below to test PDF generation using jsPDF.
          </p>
          <Button 
            onClick={handleGeneratePDF} 
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Test PDF'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 