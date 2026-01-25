# BhasmOS - Operating System Simulator

An interactive web-based operating system simulator for learning and visualizing core OS concepts including CPU scheduling, memory management, file systems, and disk I/O scheduling.

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)

🚀 **[Live Demo](https://bhasmos.onrender.com/)**

## � Developers

Developed by fifth semester students of **Kathmandu University**:

- **Aayush Dahal** (16)
- **Parichit Giri** (23)
- **Aryan Koju** (31)
- **Nischal Subedi** (53)

## 🚀 Features

### 💻 CPU Scheduling Simulator
- **FCFS** (First Come First Serve)
- **SJF** (Shortest Job First - Preemptive & Non-Preemptive)
- **Priority Scheduling** (Preemptive & Non-Preemptive)
- **Round Robin** (with configurable time quantum)
- Real-time Gantt chart visualization
- Performance metrics (Average Waiting Time, Turnaround Time, Response Time, CPU Utilization)

### 🧠 Memory Management Simulator
- **First Fit**, **Best Fit**, **Worst Fit** allocation
- Visual memory block representation
- Fragmentation analysis (Internal & External)
- Dynamic memory allocation/deallocation

### 📁 File System Simulator
- File and folder creation/management
- Multiple file types support (text, binary, image, folder)
- Hierarchical directory structure

### 💾 Disk I/O Scheduling Simulator
- **FCFS**, **SSTF**, **SCAN**, **LOOK** algorithms
- Interactive disk track visualization
- Real-time head movement animation
- Seek time optimization metrics

## 🛠️ Tech Stack

- React 18.3 with TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Framer Motion
- Lucide React icons

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/nischal0x01/bhasmOS.git
cd bhasmOS

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Visit `http://localhost:5173` to use the simulator.

## 🎯 Quick Start

1. **CPU Scheduling**: Select algorithm → Add processes → Run simulation → View Gantt chart
2. **Memory Management**: Choose allocation strategy → Allocate/Deallocate memory → Monitor fragmentation
3. **File System**: Create files/folders → Navigate directories → Manage operations
4. **Disk Scheduling**: Select algorithm → Add cylinder requests → Run simulation → View seek sequence

## 🧪 Implemented Algorithms

### CPU Scheduling
- **FCFS**: Processes executed in order of arrival
- **SJF**: Shortest job first (minimizes average waiting time)
- **Priority**: Higher priority processes execute first
- **Round Robin**: Time-sharing with fixed quantum

### Memory Allocation
- **First Fit**: First available block
- **Best Fit**: Smallest sufficient block
- **Worst Fit**: Largest available block

### Disk Scheduling
- **FCFS**: Order of arrival
- **SSTF**: Nearest request first
- **SCAN**: Elevator algorithm
- **LOOK**: SCAN without going to end

---


