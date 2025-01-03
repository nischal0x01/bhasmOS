// CPU Scheduling Types
export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime?: number;
  startTime?: number;
  completionTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  responseTime?: number;
}

export interface GanttBlock {
  processId: string;
  startTime: number;
  endTime: number;
  color: string;
}

export type SchedulingAlgorithm = 'fcfs' | 'sjf-np' | 'sjf-p' | 'priority-np' | 'priority-p' | 'round-robin';

export interface SchedulingResult {
  ganttChart: GanttBlock[];
  processes: Process[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
  cpuUtilization: number;
}

// Memory Management Types
export interface MemoryBlock {
  id: number;
  size: number;
  allocated: boolean;
  processName?: string;
  processSize?: number;
  internalFragmentation?: number;
}

export type AllocationAlgorithm = 'first-fit' | 'best-fit' | 'worst-fit';

export interface AllocationResult {
  success: boolean;
  blockId?: number;
  message: string;
}

// File Management Types
export interface FileItem {
  id: string;
  name: string;
  type: 'text' | 'binary' | 'image' | 'folder';
  size: number;
  content?: string;
  createdAt: Date;
  modifiedAt: Date;
  parentId?: string;
}

// Disk Scheduling Types
export interface DiskRequest {
  id: number;
  cylinder: number;
  processed?: boolean;
}

export type DiskAlgorithm = 'fcfs' | 'sstf' | 'scan' | 'look';

export interface DiskSchedulingResult {
  sequence: number[];
  totalSeekTime: number;
  seekOperations: { from: number; to: number; seek: number }[];
}

// Tab Types
export type SimulatorTab = 'cpu' | 'memory' | 'file' | 'disk';

// Process colors for visualization
export const PROCESS_COLORS = [
  'hsl(174, 72%, 56%)',   // Cyan
  'hsl(35, 100%, 55%)',   // Amber
  'hsl(270, 70%, 60%)',   // Purple
  'hsl(142, 72%, 55%)',   // Green
  'hsl(210, 100%, 60%)',  // Blue
  'hsl(0, 72%, 55%)',     // Red
  'hsl(320, 70%, 60%)',   // Pink
  'hsl(60, 80%, 50%)',    // Yellow
];

export const getProcessColor = (index: number): string => {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
};
