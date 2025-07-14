import React from 'react';
import { Settings, Download, Palette, Type, FileText, Printer, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import type { Theme, FontFamily } from './WordProcessor';

interface ToolBarProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
  fileName: string;
  setFileName: (name: string) => void;
  onSave: () => void;
  onOpen: () => void;
  onPrint: () => void;
  wordCount: number;
  charCount: number;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  theme,
  setTheme,
  fontFamily,
  setFontFamily,
  fileName,
  setFileName,
  onSave,
  onOpen,
  onPrint,
  wordCount,
  charCount,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50">
      {/* Left side - File name */}
      <div className="flex items-center gap-3">
        <FileText size={18} className="text-muted-foreground" />
        <Input
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="text-sm font-medium border-none bg-transparent focus:bg-muted/50 w-40"
          placeholder="Document name"
        />
      </div>

      {/* Center - Stats */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* Theme selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Palette size={16} className="mr-1" />
              Theme
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Background</h4>
              <div className="grid gap-1">
                <Button
                  variant={theme === 'white' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('white')}
                  className="justify-start"
                >
                  <div className="w-4 h-4 rounded-full bg-white border mr-2" />
                  White
                </Button>
                <Button
                  variant={theme === 'ecru' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('ecru')}
                  className="justify-start"
                >
                  <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: '#f5f1e8' }} />
                  Ecru
                </Button>
                <Button
                  variant={theme === 'dark' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="justify-start"
                >
                  <div className="w-4 h-4 rounded-full bg-gray-900 mr-2" />
                  Dark
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Font selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Type size={16} className="mr-1" />
              Font
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Typeface</h4>
              <div className="grid gap-1">
                <Button
                  variant={fontFamily === 'serif' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFontFamily('serif')}
                  className="justify-start font-serif"
                >
                  Serif
                </Button>
                <Button
                  variant={fontFamily === 'sans' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFontFamily('sans')}
                  className="justify-start font-sans"
                >
                  Sans Serif
                </Button>
                <Button
                  variant={fontFamily === 'mono' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFontFamily('mono')}
                  className="justify-start font-mono"
                >
                  Courier
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        {/* Open button */}
        <Button onClick={onOpen} variant="ghost" size="sm">
          <FolderOpen size={16} className="mr-1" />
          Open
        </Button>

        {/* Print button */}
        <Button onClick={onPrint} variant="ghost" size="sm">
          <Printer size={16} className="mr-1" />
          Print
        </Button>

        {/* Save button */}
        <Button onClick={onSave} size="sm">
          <Download size={16} className="mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
};