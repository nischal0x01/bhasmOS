import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Play, RotateCcw, Trash2, ArrowRight, ArrowLeft, Pause } from 'lucide-react';
import { DiskRequest, DiskAlgorithm } from '@/types/os-types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Disk Scheduling Simulator</h2>
        <p className="text-muted-foreground">
          Visualize disk head movement and seek time optimization
        </p>
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
    </div>
  );
}