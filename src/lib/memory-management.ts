import { MemoryBlock, AllocationAlgorithm, AllocationResult } from '@/types/os-types';

export function createMemoryBlocks(sizes: number[]): MemoryBlock[] {
  return sizes.map((size, index) => ({
    id: index,
    size,
    allocated: false,
  }));
}

export function allocateMemory(
  blocks: MemoryBlock[],
  processName: string,
  processSize: number,
  algorithm: AllocationAlgorithm
): { blocks: MemoryBlock[]; result: AllocationResult } {
  const newBlocks = [...blocks];
  let selectedBlockIndex = -1;
  
  switch (algorithm) {
    case 'first-fit':
      selectedBlockIndex = newBlocks.findIndex(
        block => !block.allocated && block.size >= processSize
      );
      break;
      
    case 'best-fit': {
      let minWaste = Infinity;
      newBlocks.forEach((block, index) => {
        if (!block.allocated && block.size >= processSize) {
          const waste = block.size - processSize;
          if (waste < minWaste) {
            minWaste = waste;
            selectedBlockIndex = index;
          }
        }
      });
      break;
    }
      
    case 'worst-fit': {
      let maxWaste = -1;
      newBlocks.forEach((block, index) => {
        if (!block.allocated && block.size >= processSize) {
          const waste = block.size - processSize;
          if (waste > maxWaste) {
            maxWaste = waste;
            selectedBlockIndex = index;
          }
        }
      });
      break;
    }
  }
  
  if (selectedBlockIndex === -1) {
    return {
      blocks: newBlocks,
      result: {
        success: false,
        message: `No suitable block found for ${processName} (${processSize}KB) using ${algorithm}`,
      },
    };
  }
  
  const block = newBlocks[selectedBlockIndex];
  newBlocks[selectedBlockIndex] = {
    ...block,
    allocated: true,
    processName,
    processSize,
    internalFragmentation: block.size - processSize,
  };
  
  return {
    blocks: newBlocks,
    result: {
      success: true,
      blockId: selectedBlockIndex,
      message: `${processName} (${processSize}KB) allocated to Block ${selectedBlockIndex} (${block.size}KB)`,
    },
  };
}

export function deallocateMemory(
  blocks: MemoryBlock[],
  processName: string
): { blocks: MemoryBlock[]; result: AllocationResult } {
  const newBlocks = [...blocks];
  const blockIndex = newBlocks.findIndex(
    block => block.allocated && block.processName === processName
  );
  
  if (blockIndex === -1) {
    return {
      blocks: newBlocks,
      result: {
        success: false,
        message: `Process "${processName}" not found in memory`,
      },
    };
  }
  
  const block = newBlocks[blockIndex];
  newBlocks[blockIndex] = {
    ...block,
    allocated: false,
    processName: undefined,
    processSize: undefined,
    internalFragmentation: undefined,
  };
  
  return {
    blocks: newBlocks,
    result: {
      success: true,
      blockId: blockIndex,
      message: `${processName} deallocated from Block ${blockIndex}`,
    },
  };
}

export function calculateFragmentation(blocks: MemoryBlock[]): {
  internalFragmentation: number;
  externalFragmentation: number;
  totalFreeMemory: number;
  totalAllocatedMemory: number;
  utilizationPercentage: number;
} {
  const internalFragmentation = blocks.reduce(
    (sum, block) => sum + (block.internalFragmentation || 0),
    0
  );
  
  const freeBlocks = blocks.filter(block => !block.allocated);
  const externalFragmentation = freeBlocks.reduce((sum, block) => sum + block.size, 0);
  
  const totalMemory = blocks.reduce((sum, block) => sum + block.size, 0);
  const allocatedMemory = blocks
    .filter(block => block.allocated)
    .reduce((sum, block) => sum + (block.processSize || 0), 0);
  
  return {
    internalFragmentation,
    externalFragmentation,
    totalFreeMemory: externalFragmentation,
    totalAllocatedMemory: allocatedMemory,
    utilizationPercentage: totalMemory > 0 ? (allocatedMemory / totalMemory) * 100 : 0,
  };
}
