import React, { useState, useRef, useCallback } from 'react';
import { Settings, Download, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ToolBar } from './ToolBar';

export type Theme = 'white' | 'ecru' | 'dark';
export type FontFamily = 'serif' | 'sans' | 'mono';

interface WordProcessorProps {}

export const WordProcessor: React.FC<WordProcessorProps> = () => {
  const [content, setContent] = useState('');
  const [theme, setTheme] = useState<Theme>('white');
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [showToolBar, setShowToolBar] = useState(true);
  const [fileName, setFileName] = useState('Untitled');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  const handleSave = useCallback(() => {
    if (!content.trim()) {
      toast({
        title: "Nothing to save",
        description: "Your document is empty.",
        variant: "destructive",
      });
      return;
    }

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
      title: "File saved",
      description: `${fileName}.txt has been downloaded.`,
    });
  }, [content, fileName, toast]);

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