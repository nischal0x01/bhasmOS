import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard } from '@/components/StatCard';
import { MemoryBlock, AllocationAlgorithm } from '@/types/os-types';
import {
  createMemoryBlocks,
  allocateMemory,
  deallocateMemory,
  calculateFragmentation,
} from '@/lib/memory-management';
import { toast } from 'sonner';

const DEFAULT_BLOCKS = [500, 300, 200, 400, 600, 250, 350];

export function MemoryManager() {
  const [blocks, setBlocks] = useState<MemoryBlock[]>(createMemoryBlocks(DEFAULT_BLOCKS));
  const [algorithm, setAlgorithm] = useState<AllocationAlgorithm>('first-fit');
  const [processName, setProcessName] = useState('');
  const [processSize, setProcessSize] = useState('');
  const [newBlockSize, setNewBlockSize] = useState('');
  const [deallocateName, setDeallocateName] = useState('');

  const fragmentation = calculateFragmentation(blocks);

  const handleAllocate = () => {
    if (!processName.trim()) {
      toast.error('Process name is required');
      return;
    }
    const size = parseInt(processSize);
    if (isNaN(size) || size <= 0) {
      toast.error('Valid process size is required');
      return;
    }

    const { blocks: newBlocks, result } = allocateMemory(
      blocks,
      processName.trim(),
      size,
      algorithm
    );

    setBlocks(newBlocks);
    if (result.success) {
      toast.success(result.message);
      setProcessName('');
      setProcessSize('');
    } else {
      toast.error(result.message);
    }
  };

  const handleDeallocate = () => {
    if (!deallocateName.trim()) {
      toast.error('Process name is required');
      return;
    }

    const { blocks: newBlocks, result } = deallocateMemory(blocks, deallocateName.trim());
    setBlocks(newBlocks);

    if (result.success) {
      toast.success(result.message);
      setDeallocateName('');
    } else {
      toast.error(result.message);
    }
  };

  const handleAddBlock = () => {
    const size = parseInt(newBlockSize);
    if (isNaN(size) || size <= 0) {
      toast.error('Valid block size is required');
      return;
    }

    const maxId = blocks.length > 0 ? Math.max(...blocks.map(b => b.id)) : -1;
    const newBlock: MemoryBlock = {
      id: maxId + 1,
      size,
      allocated: false,
    };
    setBlocks([...blocks, newBlock]);
    setNewBlockSize('');
    toast.success(`Block ${newBlock.id} (${size}KB) added`);
  };

  const resetAll = () => {
    setBlocks(createMemoryBlocks(DEFAULT_BLOCKS));
    setProcessName('');
    setProcessSize('');
    setDeallocateName('');
    toast.info('Memory reset to default');
  };

  const allocatedProcesses = blocks.filter(b => b.allocated);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Memory Management Simulator</h2>
          <p className="text-muted-foreground">
            Demonstrate memory allocation strategies and fragmentation
          </p>
        </div>
        <Button variant="outline" onClick={resetAll}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Algorithm Selection */}
          <Card variant="terminal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as AllocationAlgorithm)}>
                <SelectTrigger className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first-fit">First Fit</SelectItem>
                  <SelectItem value="best-fit">Best Fit</SelectItem>
                  <SelectItem value="worst-fit">Worst Fit</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Allocate */}
          <Card variant="terminal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Allocate Memory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Process Name</Label>
                <Input
                  value={processName}
                  onChange={(e) => setProcessName(e.target.value)}
                  placeholder="Process A"
                  variant="terminal"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Size (KB)</Label>
                <Input
                  type="number"
                  value={processSize}
                  onChange={(e) => setProcessSize(e.target.value)}
                  placeholder="256"
                  min={1}
                  variant="terminal"
                />
              </div>
              <Button onClick={handleAllocate} className="w-full">
                <Plus className="w-4 h-4" />
                Allocate
              </Button>
            </CardContent>
          </Card>

          {/* Deallocate */}
          <Card variant="terminal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Deallocate Memory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Process Name</Label>
                <Select value={deallocateName} onValueChange={setDeallocateName}>
                  <SelectTrigger className="font-mono">
                    <SelectValue placeholder="Select process" />
                  </SelectTrigger>
                  <SelectContent>
                    {allocatedProcesses.map(block => (
                      <SelectItem key={block.id} value={block.processName!}>
                        {block.processName} ({block.processSize}KB)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleDeallocate} variant="destructive" className="w-full" disabled={allocatedProcesses.length === 0}>
                <Minus className="w-4 h-4" />
                Deallocate
              </Button>
            </CardContent>
          </Card>

          {/* Add Block */}
          <Card variant="terminal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Add Memory Block</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Block Size (KB)</Label>
                <Input
                  type="number"
                  value={newBlockSize}
                  onChange={(e) => setNewBlockSize(e.target.value)}
                  placeholder="512"
                  min={1}
                  variant="terminal"
                />
              </div>
              <Button onClick={handleAddBlock} variant="outline" className="w-full">
                <Plus className="w-4 h-4" />
                Add Block
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Allocated"
              value={fragmentation.totalAllocatedMemory}
              unit="KB"
              variant="primary"
            />
            <StatCard
              label="Free Memory"
              value={fragmentation.totalFreeMemory}
              unit="KB"
              variant="success"
            />
            <StatCard
              label="Internal Frag."
              value={fragmentation.internalFragmentation}
              unit="KB"
              variant="warning"
            />
            <StatCard
              label="Utilization"
              value={fragmentation.utilizationPercentage}
              unit="%"
              variant="accent"
            />
          </div>

          {/* Memory Blocks Visualization */}
          <Card variant="terminal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Memory Blocks</CardTitle>
              <CardDescription>Visual representation of memory allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence>
                  {blocks.map((block, index) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-muted-foreground w-12">
                          Block {block.id}
                        </span>
                        <div className="flex-1 relative h-10 rounded-lg overflow-hidden bg-muted/30 border border-border">
                          {block.allocated ? (
                            <>
                              {/* Allocated portion */}
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(block.processSize! / block.size) * 100}%` }}
                                className="absolute inset-y-0 left-0 bg-primary/80 flex items-center justify-center"
                                transition={{ duration: 0.3 }}
                              >
                                <span className="text-xs font-mono text-primary-foreground truncate px-2">
                                  {block.processName} ({block.processSize}KB)
                                </span>
                              </motion.div>
                              {/* Internal fragmentation */}
                              {block.internalFragmentation! > 0 && (
                                <div
                                  className="absolute inset-y-0 right-0 bg-warning/30 flex items-center justify-center"
                                  style={{ width: `${(block.internalFragmentation! / block.size) * 100}%` }}
                                >
                                  <span className="text-xs font-mono text-warning truncate px-1">
                                    {block.internalFragmentation}KB
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-muted-foreground">
                              Free ({block.size}KB)
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-16 text-right">
                          {block.size}KB
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/80" />
                  <span className="text-xs text-muted-foreground">Allocated</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-warning/30" />
                  <span className="text-xs text-muted-foreground">Internal Fragmentation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted/30 border border-border" />
                  <span className="text-xs text-muted-foreground">Free</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allocations Table */}
          {allocatedProcesses.length > 0 && (
            <Card variant="terminal">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Active Allocations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {allocatedProcesses.map(block => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                        <span className="font-mono font-medium">{block.processName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                        <span>Block {block.id}</span>
                        <span>{block.processSize}KB / {block.size}KB</span>
                        {block.internalFragmentation! > 0 && (
                          <span className="text-warning">
                            +{block.internalFragmentation}KB frag
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
