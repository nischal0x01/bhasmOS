import { Process, GanttBlock, SchedulingResult, getProcessColor } from '@/types/os-types';

// First Come First Serve
export function fcfs(processes: Process[]): SchedulingResult {
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const ganttChart: GanttBlock[] = [];
  let currentTime = 0;

  const results: Process[] = sortedProcesses.map((process, index) => {
    const startTime = Math.max(currentTime, process.arrivalTime);

    // Handle idle time
    if (startTime > currentTime) {
      ganttChart.push({
        processId: 'IDLE',
        startTime: currentTime,
        endTime: startTime,
        color: 'hsl(222, 30%, 25%)',
      });
    }

    const completionTime = startTime + process.burstTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = startTime - process.arrivalTime;

    ganttChart.push({
      processId: process.id,
      startTime,
      endTime: completionTime,
      color: getProcessColor(index),
    });

    currentTime = completionTime;

    return {
      ...process,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    };
  });

  return calculateAverages(results, ganttChart);
}

// Shortest Job First - Non-Preemptive
export function sjfNonPreemptive(processes: Process[]): SchedulingResult {
  const remaining = processes.map((p, i) => ({ ...p, originalIndex: i }));
  const ganttChart: GanttBlock[] = [];
  const results: Process[] = [];
  let currentTime = 0;

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      const nextArrival = Math.min(...remaining.map(p => p.arrivalTime));
      ganttChart.push({
        processId: 'IDLE',
        startTime: currentTime,
        endTime: nextArrival,
        color: 'hsl(222, 30%, 25%)',
      });
      currentTime = nextArrival;
      continue;
    }

    // Sort by burst time, then by arrival time
    available.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
    const process = available[0];

    const startTime = currentTime;
    const completionTime = startTime + process.burstTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = startTime - process.arrivalTime;

    ganttChart.push({
      processId: process.id,
      startTime,
      endTime: completionTime,
      color: getProcessColor(process.originalIndex),
    });

    results.push({
      ...process,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });

    currentTime = completionTime;
    const idx = remaining.findIndex(p => p.id === process.id);
    remaining.splice(idx, 1);
  }

  return calculateAverages(results, ganttChart);
}

// Shortest Job First - Preemptive (SRTF)
export function sjfPreemptive(processes: Process[]): SchedulingResult {
  const remaining = processes.map((p, i) => ({
    ...p,
    remainingTime: p.burstTime,
    originalIndex: i,
    started: false,
    firstStartTime: -1,
  }));

  const ganttChart: GanttBlock[] = [];
  let currentTime = 0;
  const maxTime = Math.max(...processes.map(p => p.arrivalTime)) + processes.reduce((sum, p) => sum + p.burstTime, 0);
  let lastProcessId = '';
  let blockStart = 0;

  while (remaining.some(p => p.remainingTime > 0) && currentTime < maxTime) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

    if (available.length === 0) {
      if (lastProcessId !== 'IDLE') {
        if (lastProcessId !== '') {
          ganttChart.push({
            processId: lastProcessId,
            startTime: blockStart,
            endTime: currentTime,
            color: lastProcessId === 'IDLE' ? 'hsl(222, 30%, 25%)' : getProcessColor(remaining.find(p => p.id === lastProcessId)?.originalIndex || 0),
          });
        }
        lastProcessId = 'IDLE';
        blockStart = currentTime;
      }
      currentTime++;
      continue;
    }

    // Select process with shortest remaining time
    available.sort((a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime);
    const process = available[0];

    if (lastProcessId !== process.id) {
      if (lastProcessId !== '') {
        ganttChart.push({
          processId: lastProcessId,
          startTime: blockStart,
          endTime: currentTime,
          color: lastProcessId === 'IDLE' ? 'hsl(222, 30%, 25%)' : getProcessColor(remaining.find(p => p.id === lastProcessId)?.originalIndex || 0),
        });
      }
      blockStart = currentTime;
      lastProcessId = process.id;
    }

    if (!process.started) {
      process.started = true;
      process.firstStartTime = currentTime;
    }

    process.remainingTime--;
    currentTime++;
  }

  // Add final block
  if (lastProcessId !== '') {
    ganttChart.push({
      processId: lastProcessId,
      startTime: blockStart,
      endTime: currentTime,
      color: lastProcessId === 'IDLE' ? 'hsl(222, 30%, 25%)' : getProcessColor(remaining.find(p => p.id === lastProcessId)?.originalIndex || 0),
    });
  }

  const results: Process[] = remaining.map(p => ({
    ...p,
    startTime: p.firstStartTime,
    completionTime: findCompletionTime(ganttChart, p.id),
    turnaroundTime: findCompletionTime(ganttChart, p.id) - p.arrivalTime,
    waitingTime: findCompletionTime(ganttChart, p.id) - p.arrivalTime - p.burstTime,
    responseTime: p.firstStartTime - p.arrivalTime,
  }));

  return calculateAverages(results, ganttChart);
}

// Priority Scheduling - Non-Preemptive
export function priorityNonPreemptive(processes: Process[]): SchedulingResult {
  const remaining = processes.map((p, i) => ({ ...p, originalIndex: i }));
  const ganttChart: GanttBlock[] = [];
  const results: Process[] = [];
  let currentTime = 0;

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      const nextArrival = Math.min(...remaining.map(p => p.arrivalTime));
      ganttChart.push({
        processId: 'IDLE',
        startTime: currentTime,
        endTime: nextArrival,
        color: 'hsl(222, 30%, 25%)',
      });
      currentTime = nextArrival;
      continue;
    }

    // Sort by priority (lower number = higher priority), then by arrival time
    available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const process = available[0];

    const startTime = currentTime;
    const completionTime = startTime + process.burstTime;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = turnaroundTime - process.burstTime;
    const responseTime = startTime - process.arrivalTime;

    ganttChart.push({
      processId: process.id,
      startTime,
      endTime: completionTime,
      color: getProcessColor(process.originalIndex),
    });

    results.push({
      ...process,
      startTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });

    currentTime = completionTime;
    const idx = remaining.findIndex(p => p.id === process.id);
    remaining.splice(idx, 1);
  }

  return calculateAverages(results, ganttChart);
}

// Priority Scheduling - Preemptive
export function priorityPreemptive(processes: Process[]): SchedulingResult {
  const remaining = processes.map((p, i) => ({
    ...p,
    remainingTime: p.burstTime,
    originalIndex: i,
    started: false,
    firstStartTime: -1,
  }));

  const ganttChart: GanttBlock[] = [];
  let currentTime = 0;
  const maxTime = Math.max(...processes.map(p => p.arrivalTime)) + processes.reduce((sum, p) => sum + p.burstTime, 0);
  let lastProcessId = '';
  let blockStart = 0;

  while (remaining.some(p => p.remainingTime > 0) && currentTime < maxTime) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

    if (available.length === 0) {
      if (lastProcessId !== 'IDLE') {
        if (lastProcessId !== '') {
          ganttChart.push({
            processId: lastProcessId,
            startTime: blockStart,
            endTime: currentTime,
            color: lastProcessId === 'IDLE' ? 'hsl(222, 30%, 25%)' : getProcessColor(remaining.find(p => p.id === lastProcessId)?.originalIndex || 0),
          });
        }
        lastProcessId = 'IDLE';
        blockStart = currentTime;
      }
      currentTime++;
      continue;
    }

    // Select process with highest priority (lowest number)
    available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const process = available[0];

    if (lastProcessId !== process.id) {
      if (lastProcessId !== '') {
        ganttChart.push({
          processId: lastProcessId,
          startTime: blockStart,
          endTime: currentTime,
          color: lastProcessId === 'IDLE' ? 'hsl(222, 30%, 25%)' : getProcessColor(remaining.find(p => p.id === lastProcessId)?.originalIndex || 0),
        });
      }
      blockStart = currentTime;
      lastProcessId = process.id;
    }

    if (!process.started) {
      process.started = true;
      process.firstStartTime = currentTime;
    }

    process.remainingTime--;
    currentTime++;
  }

  if (lastProcessId !== '') {
    ganttChart.push({
      processId: lastProcessId,
      startTime: blockStart,
      endTime: currentTime,
      color: lastProcessId === 'IDLE' ? 'hsl(222, 30%, 25%)' : getProcessColor(remaining.find(p => p.id === lastProcessId)?.originalIndex || 0),
    });
  }

  const results: Process[] = remaining.map(p => ({
    ...p,
    startTime: p.firstStartTime,
    completionTime: findCompletionTime(ganttChart, p.id),
    turnaroundTime: findCompletionTime(ganttChart, p.id) - p.arrivalTime,
    waitingTime: findCompletionTime(ganttChart, p.id) - p.arrivalTime - p.burstTime,
    responseTime: p.firstStartTime - p.arrivalTime,
  }));

  return calculateAverages(results, ganttChart);
}

// Round Robin
export function roundRobin(processes: Process[], timeQuantum: number): SchedulingResult {
  const remaining = processes.map((p, i) => ({
    ...p,
    remainingTime: p.burstTime,
    originalIndex: i,
    started: false,
    firstStartTime: -1,
  }));

  const ganttChart: GanttBlock[] = [];
  const queue: typeof remaining = [];
  let currentTime = 0;

  // Sort by arrival time initially
  remaining.sort((a, b) => a.arrivalTime - b.arrivalTime);

  const maxTime = Math.max(...processes.map(p => p.arrivalTime)) + processes.reduce((sum, p) => sum + p.burstTime, 0);

  while (remaining.some(p => p.remainingTime > 0) && currentTime < maxTime) {
    // Add newly arrived processes to queue
    const newArrivals = remaining.filter(
      p => p.arrivalTime <= currentTime && p.remainingTime > 0 && !queue.includes(p)
    );
    queue.push(...newArrivals);

    if (queue.length === 0) {
      const nextArrival = remaining.filter(p => p.remainingTime > 0).sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      if (nextArrival) {
        ganttChart.push({
          processId: 'IDLE',
          startTime: currentTime,
          endTime: nextArrival.arrivalTime,
          color: 'hsl(222, 30%, 25%)',
        });
        currentTime = nextArrival.arrivalTime;
      } else {
        break;
      }
      continue;
    }

    const process = queue.shift()!;

    if (!process.started) {
      process.started = true;
      process.firstStartTime = currentTime;
    }

    const executeTime = Math.min(timeQuantum, process.remainingTime);

    ganttChart.push({
      processId: process.id,
      startTime: currentTime,
      endTime: currentTime + executeTime,
      color: getProcessColor(process.originalIndex),
    });

    currentTime += executeTime;
    process.remainingTime -= executeTime;

    // Add newly arrived processes before re-adding current process
    const arrivedDuringExecution = remaining.filter(
      p => p.arrivalTime > currentTime - executeTime && p.arrivalTime <= currentTime && p.remainingTime > 0 && !queue.includes(p) && p.id !== process.id
    );
    arrivedDuringExecution.sort((a, b) => a.arrivalTime - b.arrivalTime);
    queue.push(...arrivedDuringExecution);

    if (process.remainingTime > 0) {
      queue.push(process);
    }
  }

  const results: Process[] = remaining.map(p => ({
    ...p,
    startTime: p.firstStartTime,
    completionTime: findCompletionTime(ganttChart, p.id),
    turnaroundTime: findCompletionTime(ganttChart, p.id) - p.arrivalTime,
    waitingTime: findCompletionTime(ganttChart, p.id) - p.arrivalTime - p.burstTime,
    responseTime: p.firstStartTime - p.arrivalTime,
  }));

  return calculateAverages(results, ganttChart);
}

// Helper functions
function findCompletionTime(ganttChart: GanttBlock[], processId: string): number {
  const blocks = ganttChart.filter(b => b.processId === processId);
  if (blocks.length === 0) return 0;
  return Math.max(...blocks.map(b => b.endTime));
}

function calculateAverages(results: Process[], ganttChart: GanttBlock[]): SchedulingResult {
  const n = results.length;
  const totalTime = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1].endTime : 0;
  const idleTime = ganttChart.filter(b => b.processId === 'IDLE').reduce((sum, b) => sum + (b.endTime - b.startTime), 0);

  return {
    ganttChart,
    processes: results,
    averageWaitingTime: n > 0 ? results.reduce((sum, p) => sum + (p.waitingTime || 0), 0) / n : 0,
    averageTurnaroundTime: n > 0 ? results.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0) / n : 0,
    averageResponseTime: n > 0 ? results.reduce((sum, p) => sum + (p.responseTime || 0), 0) / n : 0,
    cpuUtilization: totalTime > 0 ? ((totalTime - idleTime) / totalTime) * 100 : 0,
  };
}
