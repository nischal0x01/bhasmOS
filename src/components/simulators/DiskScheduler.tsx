import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DiskRequest, DiskAlgorithm } from '@/types/os-types';

export function DiskScheduler() {
  const [requests, setRequests] = useState<DiskRequest[]>([]);
  const [headPosition, setHeadPosition] = useState(53);
  const [maxCylinder, setMaxCylinder] = useState(199);
  const [algorithm, setAlgorithm] = useState<DiskAlgorithm>('fcfs');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Disk Scheduling Simulator</h2>
        <p className="text-muted-foreground">
          Visualize disk head movement and seek time optimization
        </p>
      </div>
    </div>
  );
}