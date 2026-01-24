import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function DiskScheduler() {
  const [requests, setRequests] = useState<DiskRequest[]>([]);
  const [headPosition, setHeadPosition] = useState(53);
  const [maxCylinder, setMaxCylinder] = useState(199);
  const [algorithm, setAlgorithm] = useState<DiskAlgorithm>('fcfs');
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  
  const showDirection = algorithm === 'scan' || algorithm === 'look';

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
    </div>
  );
}