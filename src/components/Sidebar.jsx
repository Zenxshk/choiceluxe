import React from 'react';
import './Sidebar.css';
import { History, LayoutGrid, Award, Compass, Layers, X } from 'lucide-react';

export default function Sidebar({ designs, activeDesignId, setActiveDesignId, isOpen, onClose }) {
    return (
        <div className={`sidebar glass-panel gold-shadow-side ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-premium">
                    <img src="/logo.png" alt="Choice Luxe Logo" className="logo-img-gold" />
                    <h2>Choice <span>Luxe</span></h2>
                </div>
                <button className="sidebar-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
                <div className="sidebar-divider"></div>
            </div>

            <div className="saved-designs-list">
                <div className="section-header">
                    <History size={16} />
                    <h3>Design History</h3>
                </div>
                
                {designs.length === 0 ? (
                    <div className="empty-state">
                        <p>No designs yet.</p>
                        <small>Generated items will appear here.</small>
                    </div>
                ) : (
                    <div className="designs-scroll-area">
                        {designs.map(design => (
                            <div
                                key={design.id}
                                className={`design-item-premium ${activeDesignId === design.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveDesignId(design.id);
                                    onClose(); // Auto-close on selection
                                }}
                            >
                                <div className="design-thumb-premium" style={{ backgroundImage: `url(${design.images[0]})` }}>
                                    {activeDesignId === design.id && <div className="active-indicator"></div>}
                                </div>
                                <div className="design-info-premium">
                                    <h4>{design.prompt?.substring(0, 30) || 'Custom Design'}...</h4>
                                    <span>{design.type} • Studio Piece</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="sidebar-footer premium-footer">
                <Layers size={14} className="gold-icon" />
                <span>Premium AI Architecture 1.0</span>
            </div>
        </div>
    );
}
