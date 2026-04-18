import React, { useState, useRef } from 'react';
import './Viewer360.css';

export default function Viewer360({ images = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadingImages, setLoadingImages] = useState([]);
    const containerRef = useRef(null);

    React.useEffect(() => {
        if (!images || images.length === 0) return;
        setLoadingImages(images.map(() => true));

        images.forEach((src, idx) => {
            const img = new window.Image();
            img.onload = () => {
                setLoadingImages(prev => {
                    const next = [...prev];
                    next[idx] = false;
                    return next;
                });
            };
            img.onerror = () => {
                setLoadingImages(prev => {
                    const next = [...prev];
                    next[idx] = false;
                    return next;
                });
            };
            img.src = src;
        });
    }, [images]);

    if (!images || images.length === 0) return null;

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const { left, width } = containerRef.current.getBoundingClientRect();
        const x = e.clientX - left; // x position within the element.
        const segmentWidth = width / images.length;
        let index = Math.floor(x / segmentWidth);
        if (index >= images.length) index = images.length - 1;
        if (index < 0) index = 0;
        setCurrentIndex(index);
    };

    const handleTouchMove = (e) => {
        if (!containerRef.current) return;
        const { left, width } = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - left;
        const segmentWidth = width / images.length;
        let index = Math.floor(x / segmentWidth);
        if (index >= images.length) index = images.length - 1;
        if (index < 0) index = 0;
        setCurrentIndex(index);
    };

    const viewLabels = ['Front', 'Side', 'Perspective'];

    return (
        <div className="viewer-360-container glass-panel">
            <div
                className="viewer-360-interactive"
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
            >
                <div className="viewer-hint">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /></svg>
                    Hover/Slide to rotate 360°
                </div>

                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className={`viewer-image ${idx === currentIndex ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}

                {loadingImages[currentIndex] && (
                    <div className="viewer-loading-overlay">
                        <div className="large-loader"></div>
                        <p>Waiting for Model rendering engine...</p>
                    </div>
                )}
            </div>

            <div className="viewer-controls">
                <div className="view-label">{viewLabels[currentIndex] || `Angle ${currentIndex + 1}`}</div>
                <div className="dots-indicator">
                    {images.map((_, idx) => (
                        <span
                            key={idx}
                            className={`dot ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
