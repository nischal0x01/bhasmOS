import { Cpu, HardDrive, FileText, Disc } from 'lucide-react';
import { motion } from 'framer-motion';
import { SimulatorTab } from '@/types/os-types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  activeTab: SimulatorTab;
  onTabChange: (tab: SimulatorTab) => void;
}

const tabs = [
  { id: 'cpu' as SimulatorTab, label: 'CPU Scheduler', icon: Cpu },
  { id: 'memory' as SimulatorTab, label: 'Memory', icon: HardDrive },
  { id: 'file' as SimulatorTab, label: 'File System', icon: FileText },
  { id: 'disk' as SimulatorTab, label: 'Disk I/O', icon: Disc },
];

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Mini<span className="text-primary text-glow">OS</span> Simulator
              </h1>
              <p className="text-xs text-muted-foreground font-mono">v1.0.0</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap gap-1 bg-muted/50 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-glow")} />
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
