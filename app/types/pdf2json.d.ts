declare module 'pdf2json' {
  interface PDFParser {
    on(event: string, callback: (data: any) => void): void;
    parseBuffer(buffer: Buffer): void;
  }

  class PDFParser {
    constructor();
  }

  export = PDFParser;
} 