import React, { useState, useEffect, useRef } from 'react';
import './PromptPanel.css';
import { 
    Sofa, BedDouble, Box, Utensils, Monitor, 
    Zap, Wand2, Compass, X, ChevronDown, 
    Code, User, Check, ArrowLeft, Mic, MicOff, Layers, Sparkles
} from 'lucide-react';

/* ─── Fill-in-the-blanks templates per furniture type ─── */
const USER_TEMPLATES = {
    sofa: {
        label: 'Sofa',
        sentence: 'A {size}-seater {style} sofa in {color} {material}, with {legFinish} legs',
        fields: {
            color: { label: 'Color', placeholder: 'e.g. Royal Red', default: 'Navy' },
            material: { label: 'Material', placeholder: 'e.g. Velvet', default: 'Velvet' },
            size: { label: 'Size', placeholder: '3', default: '3' },
            style: { label: 'Style', placeholder: 'e.g. Modern', default: 'Modern' },
            legFinish: { label: 'Leg Finish', placeholder: 'e.g. Gold', default: 'Walnut wood' },
        }
    },
    bed: {
        label: 'Bed',
        sentence: 'A {size} {style} bed with {color} {material} headboard and {legFinish} frame',
        fields: {
            color: { label: 'Color', placeholder: 'e.g. Ivory White', default: 'Charcoal' },
            material: { label: 'Material', placeholder: 'e.g. Leather', default: 'Upholstered fabric' },
            size: { label: 'Size', placeholder: 'e.g. King', default: 'King-size' },
            style: { label: 'Style', placeholder: 'e.g. Minimalist', default: 'Modern' },
            legFinish: { label: 'Frame Finish', placeholder: 'e.g. Oak', default: 'Black metal' },
        }
    },
    wardrobe: {
        label: 'Wardrobe',
        sentence: 'A {size}-door {style} wardrobe in {color} {material} with {legFinish} handles',
        fields: {
            color: { label: 'Color', placeholder: 'e.g. Warm Walnut', default: 'Oak' },
            material: { label: 'Material', placeholder: 'e.g. Solid Wood', default: 'Laminate' },
            size: { label: 'Doors', placeholder: '3', default: '3' },
            style: { label: 'Style', placeholder: 'e.g. Classic', default: 'Modern' },
            legFinish: { label: 'Handle Style', placeholder: 'e.g. Brass', default: 'Matte black' },
        }
    },
    'dining-table': {
        label: 'Dining Table',
        sentence: 'A {size}-seater {style} dining table with {color} {material} top and {legFinish} legs',
        fields: {
            color: { label: 'Color', placeholder: 'e.g. White', default: 'Natural brown' },
            material: { label: 'Material', placeholder: 'e.g. Marble', default: 'Solid teak' },
            size: { label: 'Seats', placeholder: '6', default: '6' },
            style: { label: 'Style', placeholder: 'e.g. Farmhouse', default: 'Modern' },
            legFinish: { label: 'Leg Finish', placeholder: 'e.g. Steel', default: 'Tapered wood' },
        }
    },
    'tv-unit': {
        label: 'TV Unit',
        sentence: 'A {style} TV unit in {color} {material} with {legFinish} accents and {size} storage',
        fields: {
            color: { label: 'Color', placeholder: 'e.g. Matte Black', default: 'Dark walnut' },
            material: { label: 'Material', placeholder: 'e.g. Wood & Metal', default: 'Engineered wood' },
            size: { label: 'Storage', placeholder: 'e.g. Open shelf', default: 'Open shelf' },
            style: { label: 'Style', placeholder: 'e.g. Floating', default: 'Floating' },
            legFinish: { label: 'Accent', placeholder: 'e.g. LED strip', default: 'LED backlight' },
        }
    },
};

const SYSTEM_PROMPTS = {
    sofa: [
        "3-seater Chesterfield sofa with deep button tufting and rolled arms in rich chocolate leather, walnut wood legs, studio lighting",
        "L-shaped sectional in soft grey bouclé fabric, low-profile design, brushed steel legs, minimalist living room setting",
        "Luxurious velvet tufted sofa in emerald green with gold-finished tapered legs, art deco inspired",
        "Modular cloud sofa with oversized cushions in cream linen, Scandinavian style",
        "Royal blue velvet 3-seater with contrast white piping and matte black base",
    ],
    bed: [
        "King-size platform bed with tall channel-stitched headboard in charcoal velvet, floating base design",
        "Rustic solid oak bed frame with slatted headboard, Scandinavian minimalism",
        "Modern canopy bed with black iron frame and off-white linen panels",
        "Upholstered queen bed in blush pink with gold metal legs, art deco style",
    ],
    wardrobe: [
        "3-door sliding wardrobe with full-length central mirror, matte white finish, push-open system",
        "Walk-in wardrobe unit with open shelving, warm LED lighting, dark oak veneer",
        "Classic 2-door almirah in antique teak with carved brass handles",
    ],
    'dining-table': [
        "Extendable 6-seater dining table in natural teak with steel hairpin legs, industrial style",
        "Round marble-top dining table with gold tulip base, 4-seater",
        "Live-edge walnut slab dining table with black resin river and steel frame",
    ],
    'tv-unit': [
        "Floating wall-mounted TV console in matte black with warm LED backlight strip",
        "Mid-century TV stand with angled walnut legs, two-tone white and wood finish",
        "Industrial pipe-frame TV unit with reclaimed wood shelves",
    ],
};

const DEFAULT_FORM = {
    textPrompt: '',
    type: 'sofa',
    model: 'model1',
};

export default function PromptPanel({ onGenerate, onEdit, isGenerating, compact = false, editMode = false, activeDesign = null }) {
    const [formData, setFormData] = useState(
        editMode && activeDesign ? { ...DEFAULT_FORM, ...activeDesign, textPrompt: '' } : DEFAULT_FORM
    );
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [promptMode, setPromptMode] = useState(null); // null | 'system' | 'user'
    const [templateFields, setTemplateFields] = useState({});
    const [isListening, setIsListening] = useState(false);
    const dropdownRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setFormData(prev => ({ ...prev, textPrompt: prev.textPrompt + ' ' + transcript }));
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    useEffect(() => {
        if (editMode && activeDesign) {
            setFormData({ ...DEFAULT_FORM, ...activeDesign, textPrompt: '' });
        }
    }, [editMode, activeDesign?.id]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ── System Prompt: pick random pre-built prompt ──
    const handleSystemPrompt = () => {
        const list = SYSTEM_PROMPTS[formData.type] || SYSTEM_PROMPTS.sofa;
        const randomIdx = Math.floor(Math.random() * list.length);
        const prompt = list[randomIdx] + ', photorealistic 8K product photography, clean white background.';
        setFormData(prev => ({ ...prev, textPrompt: prompt }));
        setPromptMode('system');
        setDropdownOpen(false);
    };

    // ── User Prompt: show fill-in-blanks ──
    const handleUserPrompt = () => {
        const tmpl = USER_TEMPLATES[formData.type] || USER_TEMPLATES.sofa;
        // Pre-populate template fields with defaults
        const defaults = {};
        Object.entries(tmpl.fields).forEach(([key, val]) => { defaults[key] = val.default; });
        setTemplateFields(defaults);
        setPromptMode('user');
        setDropdownOpen(false);
        // Build the prompt immediately from defaults
        buildPromptFromTemplate(defaults, formData.type);
    };

    const buildPromptFromTemplate = (fields, type) => {
        const tmpl = USER_TEMPLATES[type || formData.type] || USER_TEMPLATES.sofa;
        let prompt = tmpl.sentence;
        Object.entries(fields).forEach(([key, value]) => {
            prompt = prompt.replace(`{${key}}`, value || tmpl.fields[key]?.default || '');
        });
        prompt += ', photorealistic 8K product photography, clean white studio background.';
        setFormData(prev => ({ ...prev, textPrompt: prompt }));
    };

    const handleTemplateFieldChange = (key, value) => {
        const updated = { ...templateFields, [key]: value };
        setTemplateFields(updated);
        buildPromptFromTemplate(updated, formData.type);
    };

    const handleTypeChange = (val) => {
        handleChange('type', val);
        // If user prompt is active, switch template
        if (promptMode === 'user') {
            const tmpl = USER_TEMPLATES[val] || USER_TEMPLATES.sofa;
            const defaults = {};
            Object.entries(tmpl.fields).forEach(([key, v]) => { defaults[key] = v.default; });
            setTemplateFields(defaults);
            setTimeout(() => buildPromptFromTemplate(defaults, val), 0);
        }
    };

    const handleSubmit = (isEdit) => {
        if (isGenerating) return;
        if (isEdit && onEdit) {
            onEdit(formData);
        } else if (onGenerate) {
            onGenerate(formData);
        }
    };

    const currentTemplate = USER_TEMPLATES[formData.type] || USER_TEMPLATES.sofa;

    return (
        <div className={`prompt-panel ${compact ? 'compact' : 'glass-panel'}`}>
            {/* ── Top Control Bar ────────────────────────── */}
            <div className="pp-top-bar">
                {/* ── Suggestion Dropdown ─── */}
                {!editMode && (
                    <div className="pp-suggest-wrap" ref={dropdownRef}>
                        <button
                            type="button"
                            className="pp-btn pp-suggest-btn gold-glow-btn"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            disabled={isGenerating}
                        >
                            <Compass size={16} />
                            <span>Get Suggestions</span>
                            <ChevronDown size={14} />
                        </button>
                        {dropdownOpen && (
                            <div className="pp-dropdown glass-panel">
                                <button className="pp-dropdown-item" onClick={handleSystemPrompt}>
                                    <div className="dd-icon-wrap gold-icon"><Wand2 size={18} /></div>
                                    <div>
                                        <strong>Auto-Design</strong>
                                        <small>Complete studio prompt</small>
                                    </div>
                                </button>
                                <button className="pp-dropdown-item" onClick={handleUserPrompt}>
                                    <div className="dd-icon-wrap gold-icon"><Code size={18} /></div>
                                    <div>
                                        <strong>Custom Builder</strong>
                                        <small>Step-by-step template</small>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!editMode && (
                    <div className="pp-type-select">
                        <label>Furniture</label>
                        <select value={formData.type} onChange={(e) => handleTypeChange(e.target.value)} disabled={isGenerating}>
                            <option value="sofa">🛋️ Sofa Luxe</option>
                            <option value="bed">🛏️ Master Bed</option>
                            <option value="wardrobe">📦 Wardrobe</option>
                            <option value="dining-table">🍽️ Dining Set</option>
                            <option value="tv-unit">🖥️ Media Unit</option>
                        </select>
                    </div>
                )}

                {!editMode && (
                    <div className="pp-type-select premium-select">
                        <label>AI Engine</label>
                        <select value={formData.model} onChange={(e) => handleChange('model', e.target.value)} disabled={isGenerating}>
                            <option value="model1">🚀 FAST 1.0 (Luxury)</option>
                            <option value="model2">⚡ FAST 2.0 (Turbo)</option>
                            <option value="model3">🏛️ HEAVEN 3.0 (XL)</option>
                        </select>
                    </div>
                )}
            </div>

            {/* ── User Template Fill-in-Blanks ───────────── */}
            {promptMode === 'user' && !editMode && (
                <div className="pp-template-section">
                    <div className="pp-template-header">
                        <button className="pp-back-inline" onClick={() => setPromptMode(null)}>
                            <ArrowLeft size={16} />
                        </button>
                        <span className="template-badge gold-tag">
                            <User size={12} /> Custom Builder: {currentTemplate.label}
                        </span>
                    </div>
                    <p className="pp-template-hint">Fill the fields below. Your prompt builds automatically:</p>
                    <div className="pp-template-fields">
                        {Object.entries(currentTemplate.fields).map(([key, field]) => (
                            <div className="pp-tfield" key={key}>
                                <label>{field.label}</label>
                                <input
                                    type="text"
                                    placeholder={field.placeholder}
                                    value={templateFields[key] || ''}
                                    onChange={(e) => handleTemplateFieldChange(key, e.target.value)}
                                    disabled={isGenerating}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Prompt Textarea ────────────────────────── */}
            <div className="pp-prompt-area">
                {promptMode === 'system' && !editMode && (
                    <div className="pp-mode-label gold-tag">
                        <span><Wand2 size={12} /> Pro-Generated Concept</span>
                        <button onClick={() => { setPromptMode(null); setFormData(p => ({...p, textPrompt: ''})); }}><X size={12} /></button>
                    </div>
                )}
                <div className="pp-textarea-wrap">
                    <textarea
                        className="pp-textarea"
                        placeholder={editMode
                            ? "Describe the change… e.g. change color to blue, add gold legs…"
                            : "Click 🧭 Suggestion to get started, or type your own prompt…"}
                        value={formData.textPrompt}
                        onChange={(e) => handleChange('textPrompt', e.target.value)}
                        disabled={isGenerating}
                        rows={editMode ? 2 : 4}
                    />
                    {!editMode && recognitionRef.current && (
                        <button 
                            type="button" 
                            className={`pp-stt-btn ${isListening ? 'active' : ''}`}
                            onClick={toggleListening}
                            title="Speak your prompt"
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Generate / Edit Button ─────────────────── */}
            <div className="pp-bottom-bar">
                {editMode ? (
                    <button type="button" onClick={() => handleSubmit(true)} disabled={isGenerating || !formData.textPrompt} className="pp-btn pp-edit-btn gold-btn">
                        {isGenerating ? <><span className="loader" /> Studio Applying...</> : <><Sparkles size={16} /> Refine Design</>}
                    </button>
                ) : (
                    <button type="button" onClick={() => handleSubmit(false)} disabled={isGenerating || !formData.textPrompt} className="pp-btn generate-btn gold-btn">
                        {isGenerating ? <><span className="loader" /> Architect Rendering...</> : <><Zap size={16} /> Render Design</>}
                    </button>
                )}
            </div>
        </div>
    );
}
