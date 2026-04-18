import React, { useState, useRef, useEffect } from 'react';
import './Dashboard.css';
import PromptPanel from './PromptPanel';
import { ArrowLeft, Download, Paintbrush, Sparkles, Palette, ImagePlus, Zap, Copy, Check } from 'lucide-react';

// 🛡️ Strict System Prompt to enforce full-size images
const SYSTEM_PROMPT = "SYSTEM INSTRUCTION: ALWAYS generate a FULL VIEW image of the entire furniture piece. Wide cinematic angle, centered composition, full silhouette visible, NO CROPPING, uncropped viewpoint, entire object visible from head to toe. ";

// ✨ Premium Gallery Data (Public Assets for Static Serving)
const CATALOG_GALLERY = {
    sofa: [
        '/assets/sofa/da3b4378d2370b8cc73697d9ffbe5723.jpg',
        '/assets/sofa/469c45b14d3b75d049c8b48bfd84b91f.jpg',
        '/assets/sofa/9ccf68eba9e9607229345dca074cb27d.jpg',
        '/assets/sofa/c88573e7eb59995d18ffc65e9250b58c.jpg',
        '/assets/sofa/f0c472b0eda61e0c16af52402cfbc566.jpg'
    ],
    bed: [
        '/assets/bed/3c6d61992ddfca3b5eb5787f0e31877d.jpg',
        '/assets/bed/ae1fde61f2c28d79cf13f711e7f3b776.jpg',
        '/assets/bed/f7d45badd0aec95e747ea3646fccaefd.jpg'
    ],
    wardrobe: [
        '/assets/waredrobe/22fa5727c9aab8161714cd38a4016309.jpg',
        '/assets/waredrobe/3dd325a91b50e23a8d2320d6f6f24b76.jpg',
        '/assets/waredrobe/4711a6ad83ab3c6a3ef59dcd8628612a.jpg',
        '/assets/waredrobe/cd5c4777107ea1d0e3801625f6ac8433.jpg'
    ]
};

// ── Image Loader Component ──
const ImageLoader = ({ src, alt }) => {
    const [loaded, setLoaded] = React.useState(false);
    const [error, setError] = React.useState(false);

    useEffect(() => {
        setLoaded(false);
        setError(false);
    }, [src]);

    return (
        <div className="image-loader-wrap">
            {!loaded && !error && (
                <div className="image-loader-placeholder gold-glow-pulse">
                    <div className="premium-spinner" />
                    <p>Architect Rendering...</p>
                </div>
            )}
            {error && (
                <div className="image-loader-placeholder luxe-error">
                    <Paintbrush size={32} className="gold-icon" />
                    <p>Connection Lost... Falling back.</p>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                onError={() => {
                    setError(true);
                    setLoaded(false);
                }}
                className="img-standardized"
                style={{
                    display: loaded ? 'block' : 'none',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
            />
        </div>
    );
};

// 🎨 Helper to name hex colors for AI
const getColorDescription = (hex, name) => {
    if (name && name.length > 2) return `${name} (Hex: ${hex})`;
    const map = { '#000000': 'Infinite Black', '#FFFFFF': 'Pure White', '#FF0000': 'Ferrari Red', '#00FF00': 'Emerald Green', '#0000FF': 'Royal Blue', '#FFD700': 'Imperial Gold', '#D4AF37': 'Premium Gold' };
    return map[hex.toUpperCase()] || `Custom Color ${hex}`;
};

export default function Dashboard({ onAddDesign, onUpdateDesign, activeDesign }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('create'); 
    const [copied, setCopied] = useState(false);

    const [recolorImage, setRecolorImage] = useState(null);
    const [recolorPreview, setRecolorPreview] = useState(null);
    const [recolorTarget, setRecolorTarget] = useState('');
    const [recolorHex, setRecolorHex] = useState('#D4AF37');
    const [recolorObject, setRecolorObject] = useState('sofa');
    const [isRecoloring, setIsRecoloring] = useState(false);
    const recolorFileRef = useRef(null);

    const handleCopyPrompt = () => {
        if (!activeDesign?.prompt) return;
        navigator.clipboard.writeText(activeDesign.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!activeDesign?.images[0]) return;
        const link = document.createElement('a');
        link.href = activeDesign.images[0];
        link.download = `ChoiceLuxe-${activeDesign.type}-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const runGeneration = async (formData, isEdit = false) => {
        setIsGenerating(true);
        const userPrompt = formData.textPrompt || `${formData.type} in Modern style`;
        const compositionConstraint = "Wider angle cinematic shot, full silhouette visible, centered furniture piece, no cropping, studio background.";
        
        const finalPrompt = isEdit
            ? `${SYSTEM_PROMPT} VARIATION: ${userPrompt}. Preserve identical silhouette. ${compositionConstraint}`
            : `${SYSTEM_PROMPT} NEW DESIGN: Premium ${formData.type}, ${userPrompt}, high-end materials, 8k resolution, professional lighting.`;

        try {
            const STABILITY_KEY = "sk-HBBqFiK8YbHDB91o9g7xluSLiaUaK5Z1XWZW7d3VyNgGy9Pf";
            let imageUrl = '';

            if (formData.model === 'model1' || formData.model === 'model2') {
                const endpoint = formData.model === 'model1' 
                    ? "https://api.stability.ai/v2beta/stable-image/generate/ultra"
                    : "https://api.stability.ai/v2beta/stable-image/generate/core";
                
                const fd = new FormData();
                fd.append('prompt', finalPrompt);
                fd.append('output_format', 'jpeg');
                
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${STABILITY_KEY}`, "Accept": "image/*" },
                    body: fd
                });

                if (response.status === 200) {
                    const blob = await response.blob();
                    imageUrl = URL.createObjectURL(blob);
                } else {
                    const safePrompt = encodeURIComponent(finalPrompt.substring(0, 800));
                    imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;
                }
            } else {
                const safePrompt = encodeURIComponent(finalPrompt.substring(0, 800));
                imageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;
            }

            onAddDesign({ id: Date.now(), ...formData, prompt: formData.textPrompt || "Production Render", images: [imageUrl] });
            setTimeout(() => setIsGenerating(false), 300);
        } catch (err) {
            setIsGenerating(false);
        }
    };

    const handleRecolorUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setRecolorImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => setRecolorPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleRecolor = async () => {
        if (!recolorPreview) return;
        setIsRecoloring(true);

        try {
            const colorDesc = getColorDescription(recolorHex, recolorTarget);
            const imgResponse = await fetch(recolorPreview);
            const imgBlob = await imgResponse.blob();

            const fd = new FormData();
            fd.append('image', imgBlob);
            fd.append('prompt', `${SYSTEM_PROMPT} RECOLORING TASK: Change the color of the ${recolorObject} into EXACTLY ${colorDesc}. Absolute textures and lighting identical.`);
            fd.append('select_prompt', recolorObject);
            fd.append('output_format', 'jpeg');

            const STABILITY_KEY = "sk-HBBqFiK8YbHDB91o9g7xluSLiaUaK5Z1XWZW7d3VyNgGy9Pf";
            const response = await fetch("https://api.stability.ai/v2beta/stable-image/edit/search-and-recolor", {
                method: "POST",
                headers: { "Authorization": `Bearer ${STABILITY_KEY}`, "Accept": "image/*" },
                body: fd
            });

            if (response.status !== 200) throw new Error("Recolor failed");
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            onAddDesign({ id: Date.now(), type: recolorObject, style: 'Recolor Studio', prompt: `Recolored to ${colorDesc}`, images: [imageUrl] });
            setIsRecoloring(false);
        } catch (err) {
            setIsRecoloring(false);
        }
    };

    const selectFromCatalog = (url) => {
        setRecolorPreview(url);
        setRecolorImage(null);
    };

    const handleGenerate = (formData) => runGeneration(formData, false);
    const handleEdit = (formData) => runGeneration(formData, true);

    return (
        <div className="dashboard">
            {!activeDesign ? (
                <>
                    {/* ── Mode Tabs ── */}
                    <div className="dash-mode-tabs">
                        <button className={`dash-tab ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
                            <Sparkles size={16} /> <span>Create New</span>
                        </button>
                        <button className={`dash-tab ${activeTab === 'recolor' ? 'active' : ''}`} onClick={() => setActiveTab('recolor')}>
                            <Palette size={16} /> <span>Recolor Masterpiece</span>
                        </button>
                    </div>

                    {activeTab === 'create' && <PromptPanel onGenerate={handleGenerate} isGenerating={isGenerating} />}

                    {activeTab === 'recolor' && (
                        <div className="recolor-panel glass-panel">
                            {/* 📱 Unified Layout for consistency across grids */}
                            <div className="recolor-layout-unified">
                                <div className="recolor-upload-area" onClick={() => recolorFileRef.current?.click()}>
                                    <input type="file" accept="image/*" ref={recolorFileRef} style={{ display: 'none' }} onChange={handleRecolorUpload} />
                                    {recolorPreview ? <img src={recolorPreview} className="img-standardized" /> : <div className="upl-pl"><ImagePlus size={32} /><p>Upload masterpiece</p></div>}
                                </div>
                                
                                <div className="masterpiece-gallery-wrap">
                                    <div className="gallery-header">
                                        <p>OR Select From Catalog</p>
                                        <div className="mini-cat-tabs">
                                            {['sofa', 'bed', 'wardrobe'].map(cat => (
                                                <button key={cat} className={recolorObject === cat ? 'active' : ''} onClick={() => setRecolorObject(cat)}>{cat}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="gallery-scroll">
                                        {CATALOG_GALLERY[recolorObject === 'wardrobe' ? 'wardrobe' : recolorObject]?.map((url, i) => (
                                            <div key={i} className="gallery-item-luxury" onClick={() => selectFromCatalog(url)}>
                                                <img src={url} alt="catalog" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="recolor-controls-unified">
                                    <div className="controls-header">
                                        <h3>🎯 Target finish</h3>
                                        <p>Specify exact colors and materials.</p>
                                    </div>
                                    
                                    <div className="controls-grid">
                                        <div className="field-group">
                                            <label>Exact Color Hex</label>
                                            <div className="hex-row">
                                                <input type="text" value={recolorHex} onChange={e => setRecolorHex(e.target.value)} />
                                                <input type="color" value={recolorHex} onChange={e => setRecolorHex(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label>Material / Finish Name</label>
                                            <input type="text" placeholder="e.g. Royal Red Velvet" value={recolorTarget} onChange={e => setRecolorTarget(e.target.value)} />
                                        </div>
                                    </div>

                                    <button className="gold-btn big-btn" onClick={handleRecolor} disabled={isRecoloring || !recolorPreview}>
                                        {isRecoloring ? 'Processing...' : 'Transform now'} 🎨
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="results-view">
                    <div className="results-header glass-panel gold-shadow">
                        <div className="results-header-top">
                            <div className="design-tags">
                                <span className="tag gold-tag">{activeDesign.type}</span>
                                {activeDesign.style && <span className="tag gold-tag">{activeDesign.style}</span>}
                            </div>
                            <button className="back-nav-btn result-back" onClick={() => onAddDesign(null)}>
                                <ArrowLeft size={16} /> <span>Back to Canvas</span>
                            </button>
                        </div>
                        <p className="design-prompt-preview">{activeDesign.prompt}</p>
                        
                        <div className="viewer-actions-top">
                            <button onClick={handleDownload} className="action-btn download-btn">
                                <Download size={14} /> <span>Save masterpiece</span>
                            </button>
                            <button onClick={handleCopyPrompt} className={`action-btn copy-btn ${copied ? 'copied' : ''}`}>
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? 'Copied!' : 'Copy prompt'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="single-image-viewer glass-panel luxury-shadow">
                        <ImageLoader src={activeDesign.images[0]} alt={`${activeDesign.type} render`} />
                    </div>

                    <div className="edit-panel glass-panel">
                        <p className="edit-panel-label">✏️ Refine composition</p>
                        <PromptPanel
                            onGenerate={handleGenerate}
                            onEdit={handleEdit}
                            isGenerating={isGenerating}
                            compact={true}
                            editMode={true}
                            activeDesign={activeDesign}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
