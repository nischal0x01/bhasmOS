import { useState } from 'react';
import { Header } from '@/components/Header';
import { CPUScheduler } from '@/components/simulators/CPUScheduler';
import { MemoryManager } from '@/components/simulators/MemoryManager';
import { FileManager } from '@/components/simulators/FileManager';
import { DiskScheduler } from '@/components/simulators/DiskScheduler';
import { SimulatorTab } from '@/types/os-types';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const [activeTab, setActiveTab] = useState<SimulatorTab>('cpu');

  const renderContent = () => {
    switch (activeTab) {
      case 'cpu':
        return <CPUScheduler />;
      case 'memory':
        return <MemoryManager />;
      case 'file':
        return <FileManager />;
      case 'disk':
        return <DiskScheduler />;
      default:
        return <CPUScheduler />;
    }
  };

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground font-mono">
            Mini<span className="text-primary">OS</span> Simulator • Interactive OS Concepts Learning Tool
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
