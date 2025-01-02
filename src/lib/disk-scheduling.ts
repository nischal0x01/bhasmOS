import { DiskRequest, DiskAlgorithm, DiskSchedulingResult } from '@/types/os-types';

export function fcfsDisk(requests: DiskRequest[], headPosition: number): DiskSchedulingResult {
  const sequence: number[] = [headPosition];
  const seekOperations: { from: number; to: number; seek: number }[] = [];
  let totalSeekTime = 0;
  let currentPosition = headPosition;
  
  requests.forEach(request => {
    const seek = Math.abs(request.cylinder - currentPosition);
    seekOperations.push({
      from: currentPosition,
      to: request.cylinder,
      seek,
    });
    totalSeekTime += seek;
    sequence.push(request.cylinder);
    currentPosition = request.cylinder;
  });
  
  return { sequence, totalSeekTime, seekOperations };
}

export function sstfDisk(requests: DiskRequest[], headPosition: number): DiskSchedulingResult {
  const remaining = [...requests];
  const sequence: number[] = [headPosition];
  const seekOperations: { from: number; to: number; seek: number }[] = [];
  let totalSeekTime = 0;
  let currentPosition = headPosition;
  
  while (remaining.length > 0) {
    // Find closest request
    let minSeek = Infinity;
    let closestIndex = 0;
    
    remaining.forEach((request, index) => {
      const seek = Math.abs(request.cylinder - currentPosition);
      if (seek < minSeek) {
        minSeek = seek;
        closestIndex = index;
      }
    });
    
    const nextRequest = remaining[closestIndex];
    const seek = Math.abs(nextRequest.cylinder - currentPosition);
    
    seekOperations.push({
      from: currentPosition,
      to: nextRequest.cylinder,
      seek,
    });
    
    totalSeekTime += seek;
    sequence.push(nextRequest.cylinder);
    currentPosition = nextRequest.cylinder;
    remaining.splice(closestIndex, 1);
  }
  
  return { sequence, totalSeekTime, seekOperations };
}

export function scanDisk(
  requests: DiskRequest[],
  headPosition: number,
  maxCylinder: number,
  direction: 'left' | 'right' = 'right'
): DiskSchedulingResult {
  const sequence: number[] = [headPosition];
  const seekOperations: { from: number; to: number; seek: number }[] = [];
  let totalSeekTime = 0;
  let currentPosition = headPosition;
  
  const cylinders = requests.map(r => r.cylinder);
  const left = cylinders.filter(c => c < headPosition).sort((a, b) => b - a);
  const right = cylinders.filter(c => c >= headPosition).sort((a, b) => a - b);
  
  const processDirection = (positions: number[]) => {
    positions.forEach(cylinder => {
      const seek = Math.abs(cylinder - currentPosition);
      seekOperations.push({
        from: currentPosition,
        to: cylinder,
        seek,
      });
      totalSeekTime += seek;
      sequence.push(cylinder);
      currentPosition = cylinder;
    });
  };
  
  if (direction === 'right') {
    // Go right first, then go to max, then left
    processDirection(right);
    
    if (left.length > 0) {
      // Go to end
      if (currentPosition !== maxCylinder) {
        const seek = Math.abs(maxCylinder - currentPosition);
        seekOperations.push({
          from: currentPosition,
          to: maxCylinder,
          seek,
        });
        totalSeekTime += seek;
        sequence.push(maxCylinder);
        currentPosition = maxCylinder;
      }
      processDirection(left);
    }
  } else {
    // Go left first, then go to 0, then right
    processDirection(left);
    
    if (right.length > 0) {
      // Go to start
      if (currentPosition !== 0) {
        const seek = Math.abs(0 - currentPosition);
        seekOperations.push({
          from: currentPosition,
          to: 0,
          seek,
        });
        totalSeekTime += seek;
        sequence.push(0);
        currentPosition = 0;
      }
      processDirection(right.sort((a, b) => a - b));
    }
  }
  
  return { sequence, totalSeekTime, seekOperations };
}

export function lookDisk(
  requests: DiskRequest[],
  headPosition: number,
  direction: 'left' | 'right' = 'right'
): DiskSchedulingResult {
  const sequence: number[] = [headPosition];
  const seekOperations: { from: number; to: number; seek: number }[] = [];
  let totalSeekTime = 0;
  let currentPosition = headPosition;
  
  const cylinders = requests.map(r => r.cylinder);
  const left = cylinders.filter(c => c < headPosition).sort((a, b) => b - a);
  const right = cylinders.filter(c => c >= headPosition).sort((a, b) => a - b);
  
  const processDirection = (positions: number[]) => {
    positions.forEach(cylinder => {
      const seek = Math.abs(cylinder - currentPosition);
      seekOperations.push({
        from: currentPosition,
        to: cylinder,
        seek,
      });
      totalSeekTime += seek;
      sequence.push(cylinder);
      currentPosition = cylinder;
    });
  };
  
  if (direction === 'right') {
    processDirection(right);
    processDirection(left);
  } else {
    processDirection(left);
    processDirection(right.sort((a, b) => a - b));
  }
  
  return { sequence, totalSeekTime, seekOperations };
}

export function runDiskScheduling(
  requests: DiskRequest[],
  headPosition: number,
  algorithm: DiskAlgorithm,
  maxCylinder: number = 199,
  direction: 'left' | 'right' = 'right'
): DiskSchedulingResult {
  switch (algorithm) {
    case 'fcfs':
      return fcfsDisk(requests, headPosition);
    case 'sstf':
      return sstfDisk(requests, headPosition);
    case 'scan':
      return scanDisk(requests, headPosition, maxCylinder, direction);
    case 'look':
      return lookDisk(requests, headPosition, direction);
    default:
      return fcfsDisk(requests, headPosition);
  }
}
