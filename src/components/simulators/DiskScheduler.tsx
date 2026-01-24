import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Play, RotateCcw, Trash2, ArrowRight, ArrowLeft, Pause } from 'lucide-react';
import { DiskRequest, DiskAlgorithm } from '@/types/os-types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DiskSchedulingResult } from '@/types/os-types';
import { runDiskScheduling } from '@/lib/disk-scheduling';
import { Play, RotateCcw } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Pause, ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DiskScheduler() {
  const [requests, setRequests] = useState<DiskRequest[]>([
    { id: 1, cylinder: 98 },
    { id: 2, cylinder: 183 },
    { id: 3, cylinder: 37 },
    { id: 4, cylinder: 122 },
    { id: 5, cylinder: 14 },
    { id: 6, cylinder: 124 },
    { id: 7, cylinder: 65 },
    { id: 8, cylinder: 67 },
  ]);
  const [headPosition, setHeadPosition] = useState(53);
  const [maxCylinder, setMaxCylinder] = useState(199);
  const [algorithm, setAlgorithm] = useState<DiskAlgorithm>('fcfs');
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [newCylinder, setNewCylinder] = useState('');
  const [result, setResult] = useState<DiskSchedulingResult | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const showDirection = algorithm === 'scan' || algorithm === 'look';

  const addRequest = () => {
    const cylinder = parseInt(newCylinder);
    if (isNaN(cylinder) || cylinder < 0 || cylinder > maxCylinder) {
      toast.error(`Cylinder must be between 0 and ${maxCylinder}`);
      return;
    }

    const newRequest: DiskRequest = {
      id: requests.length + 1,
      cylinder,
    };
    setRequests([...requests, newRequest]);
    setNewCylinder('');
    setResult(null);
    toast.success(`Request for cylinder ${cylinder} added`);
  };

  const removeRequest = (id: number) => {
    setRequests(requests.filter(r => r.id !== id));
    setResult(null);
  };
  const runSimulation = () => {
    if (requests.length === 0) {
      toast.error('Add at least one request');
      return;
    }

    const simulationResult = runDiskScheduling(
      requests,
      headPosition,
      algorithm,
      maxCylinder,
      direction
    );
    setResult(simulationResult);
    toast.success('Simulation completed!');
  };

  const startAnimation = () => {
    if (!result) {
      runSimulation();
      return;
    }
    setIsAnimating(true);
    setCurrentStep(0);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  // Add animation effect
  useEffect(() => {
    if (isAnimating && result && currentStep < result.seekOperations.length) {
      animationRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
    } else if (currentStep >= (result?.seekOperations.length || 0)) {
      setIsAnimating(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isAnimating, currentStep, result]);
  const resetAll = () => {
    setRequests([]);
    setResult(null);
    setNewCylinder('');
    toast.info('Simulation reset');
  };

  const currentHeadPosition = result && currentStep >= 0 && currentStep < result.seekOperations.length
    ? result.seekOperations[currentStep].to
    : result && currentStep >= result.seekOperations.length
      ? result.sequence[result.sequence.length - 1]
      : headPosition;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Disk Scheduling Simulator</h2>
          <p className="text-muted-foreground">
            Visualize disk head movement and seek time optimization
          </p>
        </div>
        <Button variant="outline" onClick={resetAll}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
      <Card variant="terminal">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Algorithm</Label>
            <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as DiskAlgorithm)}>
              <SelectTrigger className="font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fcfs">FCFS (First Come First Serve)</SelectItem>
                <SelectItem value="sstf">SSTF (Shortest Seek Time First)</SelectItem>
                <SelectItem value="scan">SCAN (Elevator)</SelectItem>
                <SelectItem value="look">LOOK</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Head Position</Label>
              <Input
                type="number"
                value={headPosition}
                onChange={(e) => setHeadPosition(parseInt(e.target.value) || 0)}
                min={0}
                max={maxCylinder}
                variant="terminal"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Max Cylinder</Label>
              <Input
                type="number"
                value={maxCylinder}
                onChange={(e) => setMaxCylinder(parseInt(e.target.value) || 199)}
                min={100}
                variant="terminal"
              />
            </div>
          </div>
          // Add animation button and update seek sequence/operations highlighting
          {result && (
            <Button
              onClick={isAnimating ? stopAnimation : startAnimation}
              variant={isAnimating ? 'destructive' : 'accent'}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          )}

// Update direction conditional rendering
          <AnimatePresence>
            {showDirection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label className="text-xs text-muted-foreground">Initial Direction</Label>
                <div className="flex gap-2">
                  <Button
                    variant={direction === 'left' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setDirection('left'); setResult(null); }}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Left
                  </Button>
                  <Button
                    variant={direction === 'right' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setDirection('right'); setResult(null); }}
                    className="flex-1"
                  >
                    Right
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      <Card variant="terminal">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Add Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              value={newCylinder}
              onChange={(e) => setNewCylinder(e.target.value)}
              placeholder="Cylinder #"
              min={0}
              max={maxCylinder}
              variant="terminal"
            />
            <Button onClick={addRequest}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Request Queue ({requests.length})</Label>
            <div className="flex flex-wrap gap-2">
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-muted border border-border"
                >
                  <span className="font-mono text-sm">{request.cylinder}</span>
                  <button
                    onClick={() => removeRequest(request.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Button onClick={runSimulation} className="flex-1" disabled={requests.length === 0}>
        <Play className="w-4 h-4" />
        Run
      </Button>
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Seek Time"
            value={result.totalSeekTime}
            unit="cylinders"
            variant="primary"
          />
          <StatCard
            label="Avg Seek Time"
            value={(result.totalSeekTime / result.seekOperations.length).toFixed(2)}
            unit="cylinders"
            variant="accent"
          />
          <StatCard
            label="Requests Served"
            value={result.seekOperations.length}
            variant="success"
          />
        </div>
      )}
      <Card variant="terminal">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Disk Track</CardTitle>
          <CardDescription>Visual representation of head movement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-20 bg-muted/30 rounded-lg border border-border overflow-hidden">
            {/* Track markers */}
            <div className="absolute inset-0 flex justify-between px-2">
              {[0, 0.25, 0.5, 0.75, 1].map((pos, i) => (
                <div key={i} className="flex flex-col items-center justify-end pb-1">
                  <div className="w-px h-3 bg-border" />
                  <span className="text-xs font-mono text-muted-foreground">
                    {Math.round(pos * maxCylinder)}
                  </span>
                </div>
              ))}
            </div>
            {/* Request positions */}
            {requests.map((request) => (
              <div
                key={request.id}
                className="absolute top-4 w-2 h-2 rounded-full bg-terminal-purple transform -translate-x-1/2"
                style={{ left: `${(request.cylinder / maxCylinder) * 100}%` }}
              />
            ))}
            <motion.div
              className="absolute top-2 w-4 h-8 rounded bg-primary shadow-glow transform -translate-x-1/2"
              animate={{ left: `${(currentHeadPosition / maxCylinder) * 100}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
            {/* Head position */}
            <div
              className="absolute top-2 w-4 h-8 rounded bg-primary shadow-glow transform -translate-x-1/2"
              style={{ left: `${(headPosition / maxCylinder) * 100}%` }}
            />
          </div>
          {/* Legend */}
          <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Head Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-terminal-purple" />
              <span>Pending Request</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {result && (
        <Card variant="terminal">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Seek Sequence</CardTitle>
            <CardDescription>Order of cylinder access with seek times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              {result.sequence.map((cylinder, index) => (
                const isActive = index <= currentStep + 1;
              const isCurrent = index === currentStep + 1;
              <div key={index} className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-2 rounded-lg font-mono font-medium border bg-primary/20 text-primary border-primary/30"
                >
                  {cylinder}
                </motion.div>
                {index < result.sequence.length - 1 && (
                  <div className="flex items-center text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    {result.seekOperations[index] && (
                      <span className="text-xs font-mono ml-1">
                        +{result.seekOperations[index].seek}
                      </span>
                    )}
                  </div>
                )}
              </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card variant="terminal">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Seek Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {result.seekOperations.map((op, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-8">#{index + 1}</span>
                    <span className="font-mono">{op.from}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono font-medium text-primary">{op.to}</span>
                  </div>
                  <span className="font-mono text-accent">+{op.seek} cylinders</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}