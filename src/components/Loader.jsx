import React from 'react';
import './Loader.css';

export default function Loader() {
    const word1 = "Choice".split("");
    const word2 = "Luxe".split("");

    return (
        <div className="premium-loader-overlay">
            <div className="loader-content">
                <div className="loader-logo-wrap">
                    <div className="loader-circle"></div>
                    <h1 className="loader-text">
                        <div className="word-wrap">
                            {word1.map((char, i) => (
                                <span key={i} className="char" style={{ animationDelay: `${i * 0.1}s` }}>{char}</span>
                            ))}
                        </div>
                        <div className="word-wrap gradient-text">
                            {word2.map((char, i) => (
                                <span key={i} className="char" style={{ animationDelay: `${(word1.length + i) * 0.1}s` }}>{char}</span>
                            ))}
                        </div>
                    </h1>
                </div>
                <p className="loader-tagline">Initializing Premium AI Engine...</p>
            </div>
        </div>
    );
}

