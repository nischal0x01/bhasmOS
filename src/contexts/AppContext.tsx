import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SimulatorTab } from '@/types/os-types';

interface AppContextType {
  activeTab: SimulatorTab;
  setActiveTab: (tab: SimulatorTab) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<SimulatorTab>('cpu');

  return (
    <AppContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
