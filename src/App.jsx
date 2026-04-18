import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { Menu, X } from 'lucide-react';

function App() {
  const [designs, setDesigns] = useState([]);
  const [activeDesignId, setActiveDesignId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleAddDesign = (newDesign) => {
    if (!newDesign) { setActiveDesignId(null); return; }
    setDesigns([newDesign, ...designs]);
    setActiveDesignId(newDesign.id);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleUpdateDesign = (updatedDesign) => {
    setDesigns(prev => prev.map(d => d.id === updatedDesign.id ? updatedDesign : d));
    setActiveDesignId(updatedDesign.id);
  };

  return (
    <div className={`app-container page-loaded ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* ── Mobile Header ── */}
      <div className="mobile-header">
        <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <div className="mobile-brand-logo">
          <h2>Choice <span>Luxe</span></h2>
        </div>
        <div className="mobile-header-spacer" />
      </div>

      <Sidebar 
        designs={designs} 
        activeDesignId={activeDesignId} 
        setActiveDesignId={setActiveDesignId} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="main-content" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        <Dashboard 
          onAddDesign={handleAddDesign} 
          onUpdateDesign={handleUpdateDesign} 
          activeDesign={designs.find(d => d.id === activeDesignId)} 
        />
      </div>
    </div>
  );
}

export default App;
