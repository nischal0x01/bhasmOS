import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, FileText, FileCode, FileImage, FolderOpen, Eye, Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatCard } from '@/components/StatCard';
import { FileItem } from '@/types/os-types';
import { toast } from 'sonner';

const fileTypeIcons = {
  text: FileText,
  binary: FileCode,
  image: FileImage,
  folder: FolderOpen,
};

const fileTypeColors = {
  text: 'text-terminal-cyan',
  binary: 'text-terminal-purple',
  image: 'text-terminal-amber',
  folder: 'text-terminal-green',
};

export function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'readme.txt',
      type: 'text',
      size: 1024,
      content: 'Welcome to Mini OS Simulator!\n\nThis is a sample text file.',
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
    {
      id: '2',
      name: 'config.bin',
      type: 'binary',
      size: 2048,
      content: '0101010101010101...',
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  ]);

  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'text' | 'binary' | 'image'>('text');
  const [fileContent, setFileContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingFile, setViewingFile] = useState<FileItem | null>(null);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const fileCount = files.length;

  const createFile = () => {
    if (!fileName.trim()) {
      toast.error('File name is required');
      return;
    }

    if (files.some(f => f.name.toLowerCase() === fileName.trim().toLowerCase())) {
      toast.error('A file with this name already exists');
      return;
    }

    const extension = fileType === 'text' ? '.txt' : fileType === 'binary' ? '.bin' : '.img';
    const name = fileName.includes('.') ? fileName.trim() : `${fileName.trim()}${extension}`;

    const newFile: FileItem = {
      id: Date.now().toString(),
      name,
      type: fileType,
      size: new Blob([fileContent]).size || 256,
      content: fileContent || `[Empty ${fileType} file]`,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    setFiles([...files, newFile]);
    setFileName('');
    setFileContent('');
    toast.success(`File "${name}" created`);
  };

  const deleteFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      setFiles(files.filter(f => f.id !== id));
      toast.success(`File "${file.name}" deleted`);
    }
  };

  const readFile = (file: FileItem) => {
    setViewingFile(file);
  };

  const resetFiles = () => {
    setFiles([]);
    setSearchQuery('');
    toast.info('File system cleared');
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">File Management Simulator</h2>
          <p className="text-muted-foreground">
            Create, read, and manage files in a simulated file system
          </p>
        </div>
        <Button variant="outline" onClick={resetFiles}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create File */}
        <div className="space-y-6">
          <Card variant="terminal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Create New File</CardTitle>
              <CardDescription>Add a file to the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">File Name</Label>
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="document.txt"
                  variant="terminal"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">File Type</Label>
                <Select value={fileType} onValueChange={(v) => setFileType(v as typeof fileType)}>
                  <SelectTrigger className="font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text File (.txt)</SelectItem>
                    <SelectItem value="binary">Binary File (.bin)</SelectItem>
                    <SelectItem value="image">Image File (.img)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Content</Label>
                <Textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  placeholder="Enter file content..."
                  className="min-h-[100px] font-mono text-sm bg-muted border-primary/30 focus-visible:border-primary/50"
                />
              </div>

              <Button onClick={createFile} className="w-full">
                <Plus className="w-4 h-4" />
                Create File
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Total Files"
              value={fileCount}
              variant="primary"
            />
            <StatCard
              label="Total Size"
              value={formatSize(totalSize)}
              variant="accent"
            />
          </div>
        </div>

        {/* File List */}
        <div className="lg:col-span-2">
          <Card variant="terminal">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">File Directory</CardTitle>
                  <CardDescription>{files.length} file(s)</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files..."
                    className="pl-9 w-full sm:w-[200px]"
                    variant="terminal"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No files in the system</p>
                  <p className="text-sm">Create a file to get started</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No files match "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredFiles.map((file, index) => {
                      const Icon = fileTypeIcons[file.type];
                      const colorClass = fileTypeColors[file.type];
                      
                      return (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className={`w-5 h-5 ${colorClass} shrink-0`} />
                            <div className="min-w-0">
                              <p className="font-mono font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatSize(file.size)} • {formatDate(file.modifiedAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => readFile(file)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteFile(file.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* File Viewer Dialog */}
      <Dialog open={!!viewingFile} onOpenChange={() => setViewingFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono">
              {viewingFile && (
                <>
                  {(() => {
                    const Icon = fileTypeIcons[viewingFile.type];
                    return <Icon className={`w-5 h-5 ${fileTypeColors[viewingFile.type]}`} />;
                  })()}
                  {viewingFile.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {viewingFile && (
                <span className="font-mono">
                  {formatSize(viewingFile.size)} • Created {formatDate(viewingFile.createdAt)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border max-h-[400px] overflow-auto">
            <pre className="font-mono text-sm whitespace-pre-wrap text-foreground">
              {viewingFile?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
