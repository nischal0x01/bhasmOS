import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, RotateCcw, Trash2, Info } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GanttChart } from '@/components/GanttChart';
import { StatCard } from '@/components/StatCard';
import { Process, SchedulingAlgorithm, SchedulingResult, getProcessColor } from '@/types/os-types';
import {
  fcfs,
  sjfNonPreemptive,
  sjfPreemptive,
  priorityNonPreemptive,
  priorityPreemptive,
  roundRobin,
} from '@/lib/cpu-scheduling';
import { toast } from 'sonner';

const algorithmOptions = [
  { value: 'fcfs', label: 'First Come First Serve (FCFS)' },
  { value: 'sjf-np', label: 'Shortest Job First (Non-Preemptive)' },
  { value: 'sjf-p', label: 'Shortest Job First (Preemptive)' },
  { value: 'priority-np', label: 'Priority (Non-Preemptive)' },
  { value: 'priority-p', label: 'Priority (Preemptive)' },
  { value: 'round-robin', label: 'Round Robin' },
];

export function CPUScheduler() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [algorithm, setAlgorithm] = useState<SchedulingAlgorithm>('fcfs');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [result, setResult] = useState<SchedulingResult | null>(null);

  // Form state
  const [processId, setProcessId] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [burstTime, setBurstTime] = useState('');
  const [priority, setPriority] = useState('');

  const showPriority = algorithm === 'priority-np' || algorithm === 'priority-p';
  const showTimeQuantum = algorithm === 'round-robin';

  const addProcess = () => {
    if (!processId.trim()) {
      toast.error('Process ID is required');
      return;
    }
    if (processes.some(p => p.id === processId.trim())) {
      toast.error('Process ID must be unique');
      return;
    }
    const at = parseInt(arrivalTime) || 0;
    const bt = parseInt(burstTime);
    const pr = parseInt(priority) || 1;

    if (isNaN(bt) || bt <= 0) {
      toast.error('Burst time must be a positive number');
      return;
    }

    const newProcess: Process = {
      id: processId.trim(),
      arrivalTime: at,
      burstTime: bt,
      priority: pr,
    };

    setProcesses([...processes, newProcess]);
    setProcessId('');
    setArrivalTime('');
    setBurstTime('');
    setPriority('');
    setResult(null);
    toast.success(`Process ${newProcess.id} added`);
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
    setResult(null);
  };

  const runSimulation = () => {
    if (processes.length === 0) {
      toast.error('Add at least one process');
      return;
    }

    let simulationResult: SchedulingResult;

    switch (algorithm) {
      case 'fcfs':
        simulationResult = fcfs(processes);
        break;
      case 'sjf-np':
        simulationResult = sjfNonPreemptive(processes);
        break;
      case 'sjf-p':
        simulationResult = sjfPreemptive(processes);
        break;
      case 'priority-np':
        simulationResult = priorityNonPreemptive(processes);
        break;
      case 'priority-p':
        simulationResult = priorityPreemptive(processes);
        break;
      case 'round-robin':
        simulationResult = roundRobin(processes, timeQuantum);
        break;
      default:
        simulationResult = fcfs(processes);
    }

    setResult(simulationResult);
    toast.success('Simulation completed!');
  };
//reset function
  const resetAll = () => {
    setProcesses([]);
    setResult(null);
    setProcessId('');
    setArrivalTime('');
    setBurstTime('');
    setPriority('');
    toast.info('Simulation reset');
  };

  const loadSampleData = () => {
    const sampleProcesses: Process[] = [
      { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
      { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
      { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 4 },
      { id: 'P4', arrivalTime: 3, burstTime: 6, priority: 3 },
    ];
    setProcesses(sampleProcesses);
    setResult(null);
    toast.success('Sample data loaded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">CPU Scheduling Simulator</h2>
          <p className="text-muted-foreground">
            Simulate and visualize different CPU scheduling algorithms
          </p>
        </div>
        <Button variant="terminal" onClick={loadSampleData}>
          Load Sample Data
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Algorithm Selection */}
          <Card variant="terminal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                Algorithm Selection
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Choose a scheduling algorithm to simulate how the CPU manages process execution.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={algorithm} onValueChange={(v) => { setAlgorithm(v as SchedulingAlgorithm); setResult(null); }}>
                <SelectTrigger className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {algorithmOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <AnimatePresence>
                {showTimeQuantum && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm text-muted-foreground">Time Quantum</Label>
                    <Input
                      type="number"
                      value={timeQuantum}
                      onChange={(e) => setTimeQuantum(parseInt(e.target.value) || 1)}
                      min={1}
                      variant="terminal"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Add Process Form */}
          <Card variant="terminal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Add Process</CardTitle>
              <CardDescription>Define process parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Process ID</Label>
                  <Input
                    value={processId}
                    onChange={(e) => setProcessId(e.target.value)}
                    placeholder="P1"
                    variant="terminal"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Arrival Time</Label>
                  <Input
                    type="number"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    placeholder="0"
                    min={0}
                    variant="terminal"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Burst Time</Label>
                  <Input
                    type="number"
                    value={burstTime}
                    onChange={(e) => setBurstTime(e.target.value)}
                    placeholder="5"
                    min={1}
                    variant="terminal"
                  />
                </div>
                {showPriority && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Priority</Label>
                    <Input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      placeholder="1"
                      min={1}
                      variant="terminal"
                    />
                  </div>
                )}
              </div>

              <Button onClick={addProcess} className="w-full" variant="terminal">
                <Plus className="w-4 h-4" />
                Add Process
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={runSimulation} className="flex-1" disabled={processes.length === 0}>
              <Play className="w-4 h-4" />
              Run Simulation
            </Button>
            <Button onClick={resetAll} variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Process Table & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Process Table */}
          <Card variant="terminal">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Process Queue</CardTitle>
              <CardDescription>{processes.length} process(es) in queue</CardDescription>
            </CardHeader>
            <CardContent>
              {processes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No processes added yet</p>
                  <p className="text-sm">Add processes or load sample data to begin</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Process ID</TableHead>
                        <TableHead>Arrival</TableHead>
                        <TableHead>Burst</TableHead>
                        {showPriority && <TableHead>Priority</TableHead>}
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {processes.map((process, index) => (
                          <motion.tr
                            key={process.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="border-b border-border"
                          >
                            <TableCell>
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: getProcessColor(index) }}
                              />
                            </TableCell>
                            <TableCell className="font-mono font-medium">{process.id}</TableCell>
                            <TableCell className="font-mono">{process.arrivalTime}</TableCell>
                            <TableCell className="font-mono">{process.burstTime}</TableCell>
                            {showPriority && <TableCell className="font-mono">{process.priority}</TableCell>}
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeProcess(process.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Avg. Waiting Time"
                    value={result.averageWaitingTime}
                    unit="units"
                    variant="primary"
                  />
                  <StatCard
                    label="Avg. Turnaround Time"
                    value={result.averageTurnaroundTime}
                    unit="units"
                    variant="accent"
                  />
                  <StatCard
                    label="Avg. Response Time"
                    value={result.averageResponseTime}
                    unit="units"
                    variant="success"
                  />
                  <StatCard
                    label="CPU Utilization"
                    value={result.cpuUtilization}
                    unit="%"
                    variant="warning"
                  />
                </div>

                {/* Gantt Chart */}
                <Card variant="terminal">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Gantt Chart</CardTitle>
                    <CardDescription>Visual timeline of process execution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GanttChart blocks={result.ganttChart} />
                  </CardContent>
                </Card>

                {/* Results Table */}
                <Card variant="terminal">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Detailed Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Process</TableHead>
                            <TableHead>Arrival</TableHead>
                            <TableHead>Burst</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>Completion</TableHead>
                            <TableHead>Waiting</TableHead>
                            <TableHead>Turnaround</TableHead>
                            <TableHead>Response</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.processes.map((process) => (
                            <TableRow key={process.id}>
                              <TableCell className="font-mono font-medium">{process.id}</TableCell>
                              <TableCell className="font-mono">{process.arrivalTime}</TableCell>
                              <TableCell className="font-mono">{process.burstTime}</TableCell>
                              <TableCell className="font-mono">{process.startTime}</TableCell>
                              <TableCell className="font-mono">{process.completionTime}</TableCell>
                              <TableCell className="font-mono text-primary">{process.waitingTime}</TableCell>
                              <TableCell className="font-mono text-accent">{process.turnaroundTime}</TableCell>
                              <TableCell className="font-mono text-success">{process.responseTime}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- IGNORE ---