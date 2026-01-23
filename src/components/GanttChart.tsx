import { motion } from 'framer-motion';
import { GanttBlock } from '@/types/os-types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GanttChartProps {
  blocks: GanttBlock[];
  className?: string;
}

export function GanttChart({ blocks, className }: GanttChartProps) {
  if (blocks.length === 0) {
    return (
      <div className={cn("bg-muted/50 rounded-lg p-8 text-center", className)}>
        <p className="text-muted-foreground">Run simulation to see Gantt chart</p>
      </div>
    );
  }

  const totalTime = blocks[blocks.length - 1]?.endTime || 0;
  const timeMarkers = Array.from({ length: Math.min(totalTime + 1, 21) }, (_, i) => 
    Math.round((i / 20) * totalTime)
  ).filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {/* Chart */}
        <div className="relative bg-muted/30 rounded-lg p-4 overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Gantt Bars */}
            <div className="flex h-12 gap-0.5 mb-2">
              {blocks.map((block, index) => {
                const width = ((block.endTime - block.startTime) / totalTime) * 100;
                const isIdle = block.processId === 'IDLE';
                
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className={cn(
                          "h-full rounded flex items-center justify-center text-xs font-mono font-medium origin-left cursor-pointer transition-transform hover:scale-105",
                          isIdle ? "opacity-50" : "shadow-md"
                        )}
                        style={{
                          width: `${width}%`,
                          backgroundColor: block.color,
                          color: isIdle ? 'hsl(var(--muted-foreground))' : 'hsl(var(--background))',
                          minWidth: '30px',
                        }}
                      >
                        {block.processId}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="font-mono">
                      <p>{block.processId}</p>
                      <p className="text-xs text-muted-foreground">
                        {block.startTime} → {block.endTime} (Duration: {block.endTime - block.startTime})
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            
            {/* Time Axis */}
            <div className="relative h-6 border-t border-border">
              {timeMarkers.map((time, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${(time / totalTime) * 100}%` }}
                >
                  <div className="w-px h-2 bg-border" />
                  <span className="text-xs text-muted-foreground font-mono">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {blocks
            .filter((block, index, arr) => 
              arr.findIndex(b => b.processId === block.processId) === index
            )
            .map((block) => (
              <div key={block.processId} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: block.color }}
                />
                <span className="text-sm font-mono text-muted-foreground">
                  {block.processId}
                </span>
              </div>
            ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
// --- IGNORE ---