import React, { useState, useRef, useCallback } from 'react';
import { Settings, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ToolBar } from './ToolBar';
import { escapeHtml } from '@/lib/utils';

export type Theme = 'white' | 'ecru' | 'dark';
export type FontFamily = 'serif' | 'sans' | 'mono';

interface WordProcessorProps {}

export const WordProcessor: React.FC<WordProcessorProps> = () => {
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<Theme>('white');
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [showToolBar, setShowToolBar] = useState(true);
  const [fileName, setFileName] = useState('Untitled');
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      toast({
        title: "Nothing to save",
        description: "Your document is empty.",
        variant: "destructive",
      });
      return;
    }

    // Check if File System Access API is supported
    if ('showSaveFilePicker' in window) {
      try {
        let currentFileHandle = fileHandle;
        
        // If no file handle exists, show save picker
        if (!currentFileHandle) {
          currentFileHandle = await (window as any).showSaveFilePicker({
            suggestedName: `${fileName}.txt`,
            types: [{
              description: 'Text files',
              accept: { 'text/plain': ['.txt'] },
            }],
          });
          setFileHandle(currentFileHandle);
          
          // Update filename from the selected file
          const newFileName = currentFileHandle.name.replace(/\.txt$/, '');
          setFileName(newFileName);
        }

        // Write to the file
        const writable = await currentFileHandle.createWritable();
        await writable.write(content);
        await writable.close();

        toast({
          title: "File saved",
          description: `${currentFileHandle.name} has been saved.`,
        });
        return;
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error saving file:', error);
        }
        // Fall through to legacy download method
      }
    }

    // Fallback for browsers without File System Access API
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "File downloaded",
      description: `${fileName}.txt has been downloaded to your Downloads folder.`,
    });
  }, [content, fileName, fileHandle, toast]);

  const handleOpen = useCallback(async () => {
    // Check if File System Access API is supported
    if ('showOpenFilePicker' in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'Text files',
            accept: { 'text/plain': ['.txt'] },
          }],
        });

        const file = await fileHandle.getFile();
        const text = await file.text();
        
        setContent(text);
        setFileHandle(fileHandle);
        
        // Update filename from the selected file
        const newFileName = fileHandle.name.replace(/\.txt$/, '');
        setFileName(newFileName);

        toast({
          title: "File opened",
          description: `${fileHandle.name} has been loaded.`,
        });
        return;
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error opening file:', error);
        }
        return;
      }
    }

    // Fallback for browsers without File System Access API
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContent(text);
          setFileHandle(null); // Can't save back to original file in fallback mode
          
          // Update filename from the selected file
          const newFileName = file.name.replace(/\.txt$/, '');
          setFileName(newFileName);

          toast({
            title: "File opened",
            description: `${file.name} has been loaded.`,
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setContent, setFileName, setFileHandle, toast]);

  const handlePrint = useCallback(() => {
    if (!content.trim()) {
      toast({
        title: "Nothing to print",
        description: "Your document is empty.",
        variant: "destructive",
      });
      return;
    }

    // Create a print-friendly version with HTML escaping for security
    const escapedFileName = escapeHtml(fileName);
    const escapedContent = escapeHtml(content);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'unsafe-inline'; script-src 'none';">
            <title>${escapedFileName}</title>
            <style>
              body {
                font-family: ${fontFamily === 'serif' ? '"Times New Roman", Georgia, serif' : 
                             fontFamily === 'sans' ? '"Helvetica Neue", Arial, sans-serif' : 
                             '"Courier New", Courier, monospace'};
                font-size: 12pt;
                line-height: 1.6;
                margin: 1in;
                color: black;
                background: white;
              }
              @media print {
                body { margin: 0.5in; }
              }
            </style>
          </head>
          <body>
            <pre style="white-space: pre-wrap; font-family: inherit;">${escapedContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }

    toast({
      title: "Print dialog opened",
      description: "Your document is ready to print.",
    });
  }, [content, fileName, fontFamily, toast]);

  const toggleToolBar = useCallback(() => {
    setShowToolBar(prev => !prev);
  }, []);

  const focusEditor = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  // Apply theme to body element
  React.useEffect(() => {
    document.body.className = `${theme === 'white' ? 'theme-white' : theme === 'ecru' ? 'theme-ecru' : 'theme-dark'}`;
  }, [theme]);

  return (
    <div className="min-h-screen transition-theme bg-background text-foreground">
      <div className="relative w-full h-screen flex flex-col">
        {/* Toolbar */}
        {showToolBar && (
          <ToolBar
            theme={theme}
            setTheme={setTheme}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fileName={fileName}
            setFileName={setFileName}
            onSave={handleSave}
            onOpen={handleOpen}
            onPrint={handlePrint}
            wordCount={wordCount}
            charCount={charCount}
          />
        )}

        {/* Toolbar toggle button - always visible */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleToolBar}
          className="absolute top-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity"
        >
          {showToolBar ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>

        {/* Main editor area */}
        <div 
          className="flex-1 flex items-center justify-center p-8 cursor-text"
          onClick={focusEditor}
        >
          <div className="w-full max-w-4xl">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing..."
              className={`
                w-full h-[70vh] 
                editor-textarea 
                text-lg 
                leading-relaxed
                transition-theme
                pr-8
                ${fontFamily === 'serif' ? 'font-serif' : fontFamily === 'sans' ? 'font-sans' : 'font-mono'}
              `}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>

        {/* Quick save shortcut hint */}
        {!showToolBar && content && (
          <div className="absolute bottom-4 left-4 opacity-20 hover:opacity-60 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="text-xs"
            >
              <Download size={14} className="mr-1" />
              Save (⌘S)
            </Button>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts */}
      <div 
        className="hidden"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
          }
          if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
            e.preventDefault();
            toggleToolBar();
          }
        }}
      />
    </div>
  );
};