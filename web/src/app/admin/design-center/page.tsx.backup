'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'logo';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  zIndex: number;
  isSelected: boolean;
}

interface DesignData {
  cardTitle: string;
  cardSubtitle: string;
  primaryColor: string;
  secondaryColor: string;
  primaryColorEnabled: boolean;
  secondaryColorEnabled: boolean;
  textColor: string;
  textColorEnabled: boolean;
  textStyle: string;
  textSize: string;
  shadow: boolean;
  glow: boolean;
  glowColor: string;
  glowIntensity: number;
  layout: string;
  layers: {
    logo: boolean;
    title: boolean;
    subtitle: boolean;
  };
  elements: DesignElement[];
  backgroundImage?: string;
}

interface CardDesign {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  designData: string;
  createdAt: string;
  updatedAt: string;
}

export default function DesignCenter() {
  const router = useRouter();
  const [designData, setDesignData] = useState<DesignData>({
    cardTitle: 'FITNESSSTUDIO',
    cardSubtitle: 'Premium Membership',
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    primaryColorEnabled: true,
    secondaryColorEnabled: true,
    textColor: '#ffffff',
    textColorEnabled: true,
    textStyle: 'modern',
    textSize: 'medium',
    shadow: true,
    glow: false,
    glowColor: '#ffffff',
    glowIntensity: 10,
    layout: 'standard',
    layers: {
      logo: true,
      title: true,
      subtitle: true
    },
    elements: [
      {
        id: '1',
        type: 'text',
        content: 'FITNESSSTUDIO',
        x: 160,
        y: 80,
        width: 200,
        height: 40,
        rotation: 0,
        fontSize: 24,
        fontFamily: 'Arial Black, sans-serif',
        color: '#ffffff',
        zIndex: 2,
        isSelected: false
      },
      {
        id: '2',
        type: 'text',
        content: 'Premium Membership',
        x: 160,
        y: 120,
        width: 200,
        height: 30,
        rotation: 0,
        fontSize: 16,
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: '#ffffff',
        zIndex: 2,
        isSelected: false
      },
      {
        id: '3',
        type: 'text',
        content: 'MAX MUSTERMANN',
        x: 40,
        y: 180,
        width: 150,
        height: 25,
        rotation: 0,
        fontSize: 14,
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: '#ffffff',
        zIndex: 2,
        isSelected: false
      }
    ]
  });

  const [designs, setDesigns] = useState<CardDesign[]>([]);
  const [activeDesign, setActiveDesign] = useState<CardDesign | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedElement, setSelectedElement] = useState<DesignElement | null>(null);
  const [showGuides, setShowGuides] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<DesignData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [draggingLayer, setDraggingLayer] = useState<string | null>(null);
  const [dragOverLayer, setDragOverLayer] = useState<string | null>(null);
  const [walletExportLoading, setWalletExportLoading] = useState<string | null>(null);

  // Card dimensions
  const CARD_WIDTH = 320;
  const CARD_HEIGHT = 192;

  // Font families - sorted by category
  const fontFamilies = [
    // Sans-Serif (Clean & Modern)
    'Arial, sans-serif',
    'Helvetica, Arial, sans-serif',
    'Verdana, sans-serif',
    'Tahoma, sans-serif',
    'Trebuchet MS, sans-serif',
    'Arial Black, sans-serif',
    'Impact, sans-serif',
    'Century Gothic, sans-serif',
    'Franklin Gothic, sans-serif',
    'Gill Sans, sans-serif',
    'Frutiger, sans-serif',
    'Univers, sans-serif',
    'Myriad, sans-serif',
    'Avant Garde, sans-serif',
    'Futura, sans-serif',
    'Optima, sans-serif',
    'Chalkboard, sans-serif',
    
    // Serif (Classic & Elegant)
    'Times New Roman, serif',
    'Georgia, serif',
    'Palatino, serif',
    'Garamond, serif',
    'Bookman, serif',
    'Bodoni, serif',
    'Didot, serif',
    'Baskerville, serif',
    'Minion, serif',
    'Trajan, serif',
    'Rockwell, serif',
    
    // Monospace (Technical)
    'Courier New, monospace',
    'Lucida Console, monospace',
    
    // Decorative & Fun
    'Comic Sans MS, cursive',
    'Brush Script, cursive',
    'Zapfino, cursive',
    'Bradley Hand, cursive',
    'Savoye LET, cursive',
    'Snell Roundhand, cursive',
    'Zapf Chancery, cursive',
    
    // Fantasy & Creative
    'Papyrus, fantasy',
    'Marker Felt, fantasy',
    'Party LET, fantasy',
    
    // Special
    'Copperplate, serif'
  ];

  useEffect(() => {
    fetchDesigns();
    fetchActiveDesign();
    // Initialize history with current design data
    setHistory([designData]);
    setHistoryIndex(0);
  }, []);

  const fetchDesigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/card-designs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDesigns(data.designs || []);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  const fetchActiveDesign = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/card-designs/active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setActiveDesign(data.design || null);
      }
    } catch (error) {
      console.error('Error fetching active design:', error);
    }
  };

  const saveToHistory = (newDesignData: DesignData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newDesignData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleDesignChange = (field: keyof DesignData, value: any) => {
    const newDesignData = { ...designData, [field]: value };
    setDesignData(newDesignData);
    saveToHistory(newDesignData);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDesignData(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDesignData(history[historyIndex + 1]);
    }
  };

  const handleLayerDragStart = (e: React.DragEvent, elementId: string) => {
    setDraggingLayer(elementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLayerDragOver = (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    if (draggingLayer && draggingLayer !== elementId) {
      setDragOverLayer(elementId);
    }
  };

  const handleLayerDragLeave = () => {
    setDragOverLayer(null);
  };

  const handleLayerDrop = (e: React.DragEvent, targetElementId: string) => {
    e.preventDefault();
    if (!draggingLayer || draggingLayer === targetElementId) {
      setDraggingLayer(null);
      setDragOverLayer(null);
      return;
    }

    const elements = [...designData.elements];
    const draggedElement = elements.find(el => el.id === draggingLayer);
    const targetElement = elements.find(el => el.id === targetElementId);
    
    if (!draggedElement || !targetElement) {
      setDraggingLayer(null);
      setDragOverLayer(null);
      return;
    }

    // Get current positions
    const draggedIndex = elements.findIndex(el => el.id === draggingLayer);
    const targetIndex = elements.findIndex(el => el.id === targetElementId);
    
    // Remove dragged element
    elements.splice(draggedIndex, 1);
    
    // Insert at target position
    elements.splice(targetIndex, 0, draggedElement);
    
    // Update z-index values based on new order (Layer position = Z-Index)
    elements.forEach((element, index) => {
      element.zIndex = index + 1; // First element (index 0) = Z-Index 1, second = Z-Index 2, etc.
    });

    const newDesignData = { ...designData, elements };
    setDesignData(newDesignData);
    saveToHistory(newDesignData);
    
    setDraggingLayer(null);
    setDragOverLayer(null);
  };

  const addTextElement = () => {
    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: 'text',
      content: 'Neuer Text',
      x: 50,
      y: 50,
      width: 100,
      height: 30,
      rotation: 0,
      fontSize: 16,
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: '#ffffff',
      zIndex: designData.elements.length + 1,
      isSelected: false
    };
    
    const newDesignData = {
      ...designData,
      elements: [...designData.elements, newElement]
    };
    setDesignData(newDesignData);
    saveToHistory(newDesignData);
  };

  const addImageElement = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newElement: DesignElement = {
            id: Date.now().toString(),
            type: 'image',
            content: e.target?.result as string,
            x: 50,
            y: 50,
            width: 80,
            height: 80,
            rotation: 0,
            fontSize: 16,
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: '#ffffff',
            zIndex: designData.elements.length + 1,
            isSelected: false
          };
          
          const newDesignData = {
            ...designData,
            elements: [...designData.elements, newElement]
          };
          setDesignData(newDesignData);
          saveToHistory(newDesignData);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const selectElement = (element: DesignElement) => {
    setDesignData(prev => ({
      ...prev,
      elements: prev.elements.map(el => ({
        ...el,
        isSelected: el.id === element.id
      }))
    }));
    setSelectedElement(element);
  };

  const applyTemplate = (template: string) => {
    setSelectedTemplate(template);
    
    let newDesignData = { ...designData };
    
    switch (template) {
      case 'sporty':
        newDesignData = {
          ...designData,
          primaryColor: '#dc2626',
          secondaryColor: '#f59e0b',
          textColor: '#ffffff',
          shadow: true,
          glow: true,
          glowColor: '#fbbf24',
          glowIntensity: 15
        };
        break;
      case 'elegant':
        newDesignData = {
          ...designData,
          primaryColor: '#1f2937',
          secondaryColor: '#6b7280',
          textColor: '#ffffff',
          shadow: true,
          glow: false
        };
        break;
      case 'modern':
        newDesignData = {
          ...designData,
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6',
          textColor: '#ffffff',
          shadow: true,
          glow: true,
          glowColor: '#8b5cf6',
          glowIntensity: 10
        };
        break;
      default:
        return;
    }
    
    setDesignData(newDesignData);
    saveToHistory(newDesignData);
  };

  const updateElement = (elementId: string, updates: Partial<DesignElement>) => {
    const newDesignData = {
      ...designData,
      elements: designData.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    };
    setDesignData(newDesignData);
    saveToHistory(newDesignData);
    
    if (selectedElement?.id === elementId) {
      setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteElement = (elementId: string) => {
    const newDesignData = {
      ...designData,
      elements: designData.elements.filter(el => el.id !== elementId)
    };
    setDesignData(newDesignData);
    saveToHistory(newDesignData);
    
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const moveElementToFront = (elementId: string) => {
    const elements = [...designData.elements];
    
    // Find the element to move
    const elementToMove = elements.find(el => el.id === elementId);
    if (!elementToMove) return;
    
    // Remove the element from its current position
    const filteredElements = elements.filter(el => el.id !== elementId);
    
    // Add it to the front (highest z-index)
    const maxZIndex = Math.max(...filteredElements.map(el => el.zIndex), 0);
    elementToMove.zIndex = maxZIndex + 1;
    
    // Combine and sort by z-index (Layer order: lowest first)
    const updatedElements = [...filteredElements, elementToMove].sort((a, b) => a.zIndex - b.zIndex);
    
    const newDesignData = { ...designData, elements: updatedElements };
    setDesignData(newDesignData);
    saveToHistory(newDesignData);
    
    if (selectedElement?.id === elementId) {
      setSelectedElement(prev => prev ? { ...prev, zIndex: elementToMove.zIndex } : null);
    }
  };

  const moveElementToBack = (elementId: string) => {
    const elements = [...designData.elements];
    
    // Find the element to move
    const elementToMove = elements.find(el => el.id === elementId);
    if (!elementToMove) return;
    
    // Remove the element from its current position
    const filteredElements = elements.filter(el => el.id !== elementId);
    
    // Add it to the back (lowest z-index)
    const minZIndex = Math.min(...filteredElements.map(el => el.zIndex), 1);
    elementToMove.zIndex = minZIndex - 1;
    
    // Combine and sort by z-index (Layer order: lowest first)
    const updatedElements = [...filteredElements, elementToMove].sort((a, b) => a.zIndex - b.zIndex);
    
    const newDesignData = { ...designData, elements: updatedElements };
    setDesignData(newDesignData);
    saveToHistory(newDesignData);
    
    if (selectedElement?.id === elementId) {
      setSelectedElement(prev => prev ? { ...prev, zIndex: elementToMove.zIndex } : null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, element: DesignElement) => {
    e.stopPropagation();
    selectElement(element);
    setDragging(true);
    setShowGuides(true);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && selectedElement) {
      const newX = Math.max(0, Math.min(CARD_WIDTH - selectedElement.width, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(CARD_HEIGHT - selectedElement.height, e.clientY - dragStart.y));
      
      updateElement(selectedElement.id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setShowGuides(false);
  };

  const saveDesign = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/card-designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Neues Design',
          description: 'Erstellt im Design Center',
          designData: JSON.stringify(designData)
        })
      });

      if (response.ok) {
        setMessage('✅ Design erfolgreich gespeichert!');
        fetchDesigns();
      } else {
        setError('❌ Fehler beim Speichern des Designs');
      }
    } catch (error) {
      setError('❌ Fehler beim Speichern des Designs');
    } finally {
      setLoading(false);
    }
  };

  const activateDesign = async (designId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/card-designs/${designId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('✅ Design erfolgreich aktiviert!');
        fetchDesigns();
        fetchActiveDesign();
      } else {
        setError('❌ Fehler beim Aktivieren des Designs');
      }
    } catch (error) {
      setError('❌ Fehler beim Aktivieren des Designs');
    }
  };

  const exportToWallet = async (walletType: 'apple' | 'google') => {
    setWalletExportLoading(walletType);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // First save the current design
      await saveDesign();
      
      // Get the latest design ID (we'll use a demo member for testing)
      const demoMemberId = 'demo_member_123';
      
      const response = await fetch('http://localhost:4000/api/wallet/generate-with-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          memberId: demoMemberId,
          walletType: walletType,
          designData: designData // Send current design data
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage(`✅ ${walletType === 'apple' ? 'Apple Wallet' : 'Google Wallet'} Pass erfolgreich generiert! Pass-URL: ${result.passUrl}`);
        
        // Open the wallet URL in a new tab for testing
        if (result.passUrl) {
          window.open(result.passUrl, '_blank');
        }
      } else {
        setError(`❌ Fehler bei der ${walletType === 'apple' ? 'Apple Wallet' : 'Google Wallet'} Generierung: ${result.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Wallet export error:', error);
      setError(`❌ Fehler beim Export zu ${walletType === 'apple' ? 'Apple Wallet' : 'Google Wallet'}`);
    } finally {
      setWalletExportLoading(null);
    }
  };

  const getCardStyle = () => {
    const style: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '16px',
      transition: 'all 0.3s ease',
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      background: designData.primaryColorEnabled && designData.secondaryColorEnabled
        ? `linear-gradient(135deg, ${designData.primaryColor}, ${designData.secondaryColor})`
        : designData.primaryColorEnabled
        ? designData.primaryColor
        : designData.secondaryColor || '#1f2937',
      backgroundImage: `
        linear-gradient(135deg, 
          rgba(255, 255, 255, 0.05) 0%, 
          rgba(255, 255, 255, 0.02) 30%, 
          rgba(255, 255, 255, 0.01) 60%, 
          rgba(255, 255, 255, 0.03) 100%
        )
      `,
      boxShadow: `
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 4px 16px rgba(0, 0, 0, 0.4),
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 16px 64px rgba(0, 0, 0, 0.2)
      `,
      border: 'none',
      transform: 'perspective(1000px) rotateX(5deg) rotateY(-2deg)',
      transformStyle: 'preserve-3d',
    };

    if (designData.glow) {
      style.boxShadow = `
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 0 ${designData.glowIntensity}px ${designData.glowColor},
        0 4px 16px rgba(0, 0, 0, 0.4),
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 16px 64px rgba(0, 0, 0, 0.2)
      `;
    }

    return style;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎨 Design Center</h1>
          <p className="text-slate-300">Professioneller Drag & Drop Karten-Designer</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Tools */}
          <div className="space-y-6">


            {/* Templates */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">📋 Vorlagen</h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => applyTemplate('sporty')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedTemplate === 'sporty' 
                      ? 'border-red-500 bg-red-500/20 shadow-lg' 
                      : 'border-slate-600 hover:border-slate-500 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg mx-auto mb-2 shadow-md"></div>
                    <span className="text-slate-300 text-sm font-medium">Sportlich</span>
                  </div>
                </button>
                <button
                  onClick={() => applyTemplate('elegant')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedTemplate === 'elegant' 
                      ? 'border-gray-500 bg-gray-500/20 shadow-lg' 
                      : 'border-slate-600 hover:border-slate-500 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-500 rounded-lg mx-auto mb-2 shadow-md"></div>
                    <span className="text-slate-300 text-sm font-medium">Elegant</span>
                  </div>
                </button>
                <button
                  onClick={() => applyTemplate('modern')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedTemplate === 'modern' 
                      ? 'border-blue-500 bg-blue-500/20 shadow-lg' 
                      : 'border-slate-600 hover:border-slate-500 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mx-auto mb-2 shadow-md"></div>
                    <span className="text-slate-300 text-sm font-medium">Modern</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tools */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">🛠️ Tools</h2>
              <div className="space-y-3">
                <button
                  onClick={addTextElement}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">➕</span>
                    <span className="font-medium">Text hinzufügen</span>
                  </div>
                </button>
                <button
                  onClick={addImageElement}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">📁</span>
                    <span className="font-medium">Datei hinzufügen</span>
                  </div>
                </button>
                
                {/* Undo/Redo Buttons */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm"
                    title="Rückgängig"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-sm">←</span>
                      <span className="font-medium">Rückgängig</span>
                    </div>
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm"
                    title="Wiederherstellen"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span className="font-medium">Wiederherstellen</span>
                      <span className="text-sm">→</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            
          </div>

                    {/* Center - Card Designer */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">🎨 Karten-Designer</h2>
              
              {/* Card Canvas */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Apple Wallet Card Container */}
                  <div 
                    className="relative"
                    style={getCardStyle()}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                  {/* Apple Wallet Background Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent opacity-60"></div>
                  
                  {/* Apple Wallet Card Shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30 opacity-40"></div>
                  

                  
                  {/* Fitness Studio Card Brand */}
                  <div className="absolute bottom-4 right-4">
                    <div className="text-white/40 text-xs font-medium">
                      FITNESSSTUDIO
                    </div>
                  </div>

                  {/* Design Elements */}
                  {designData.elements.map((element) => (
                    <div
                      key={element.id}
                      className={`absolute cursor-move ${
                        element.isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        transform: `rotate(${element.rotation}deg)`,
                        zIndex: element.zIndex
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element)}
                    >
                      {/* Delete Button */}
                      {element.isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-50"
                          title="Element löschen"
                        >
                          ×
                        </button>
                      )}
                      
                      {element.type === 'text' ? (
                        <div
                          style={{
                            fontSize: element.fontSize,
                            fontFamily: element.fontFamily,
                            color: element.color,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            userSelect: 'none'
                          }}
                        >
                          {element.content}
                        </div>
                      ) : (
                        <img
                          src={element.content}
                          alt="Design Element"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}

                  {/* Grid Guides */}
                  {showGuides && (
                    <>
                      {/* Vertical Guides */}
                      {[0, CARD_WIDTH / 4, CARD_WIDTH / 2, (CARD_WIDTH * 3) / 4, CARD_WIDTH].map((x) => (
                        <div
                          key={`v-${x}`}
                          className="absolute top-0 bottom-0 w-px bg-blue-500/30"
                          style={{ left: x }}
                        />
                      ))}
                      
                      {/* Horizontal Guides */}
                      {[0, CARD_HEIGHT / 4, CARD_HEIGHT / 2, (CARD_HEIGHT * 3) / 4, CARD_HEIGHT].map((y) => (
                        <div
                          key={`h-${y}`}
                          className="absolute left-0 right-0 h-px bg-blue-500/30"
                          style={{ top: y }}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Card Info */}
              <div className="text-center">
                <p className="text-slate-300 text-sm">
                  Kartenformat: {CARD_WIDTH} × {CARD_HEIGHT}px
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Drag & Drop Elemente • Klicken zum Auswählen • Scrollen zum Vergrößern
                </p>
              </div>
            </div>

            {/* Element Properties and Layer Overview - Horizontal Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Element Properties */}
              {selectedElement && (
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h2 className="text-xl font-semibold text-white mb-4">⚙️ Element-Eigenschaften</h2>
                  <div className="space-y-4">
                    {selectedElement.type === 'text' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Text
                          </label>
                          <input
                            type="text"
                            value={selectedElement.content}
                            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Schriftart
                          </label>
                          <select
                            value={selectedElement.fontFamily}
                            onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                          >
                            {fontFamilies.map((font) => (
                              <option key={font} value={font} style={{ fontFamily: font }}>
                                {font.split(',')[0]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Schriftgröße
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="72"
                        value={selectedElement.fontSize}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-sm text-slate-400">{selectedElement.fontSize}px</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Farbe
                      </label>
                      <input
                        type="color"
                        value={selectedElement.color}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        className="w-full h-10 rounded border border-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Rotation
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={selectedElement.rotation}
                        onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <span className="text-sm text-slate-400">{selectedElement.rotation}°</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => moveElementToFront(selectedElement.id)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        ↑ Vorne
                      </button>
                      <button
                        onClick={() => moveElementToBack(selectedElement.id)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        ↓ Hinten
                      </button>
                    </div>

                    <button
                      onClick={() => deleteElement(selectedElement.id)}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      🗑️ Löschen
                    </button>
                  </div>
                </div>
              )}

              {/* Layer Overview */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">📋 Layer-Übersicht</h2>
                <p className="text-slate-400 text-xs mb-3">Drag & Drop zum Ändern der Ebenen-Reihenfolge • Oben = Hintergrund, Unten = Vordergrund</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...designData.elements]
                    .sort((a, b) => a.zIndex - b.zIndex) // Layer order: lowest z-index first (top of list)
                    .map((element, index) => (
                      <div
                        key={element.id}
                        draggable
                        onDragStart={(e) => handleLayerDragStart(e, element.id)}
                        onDragOver={(e) => handleLayerDragOver(e, element.id)}
                        onDragLeave={handleLayerDragLeave}
                        onDrop={(e) => handleLayerDrop(e, element.id)}
                        className={`p-3 rounded cursor-move transition-all duration-200 ${
                          element.isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        } ${
                          draggingLayer === element.id 
                            ? 'opacity-50 scale-95' 
                            : ''
                        } ${
                          dragOverLayer === element.id 
                            ? 'border-2 border-blue-400 bg-blue-500/20' 
                            : ''
                        }`}
                        onClick={() => selectElement(element)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">⋮⋮</span>
                            <span className="text-sm">
                              {element.type === 'text' ? '📝' : '🖼️'} {element.content.substring(0, 15)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs opacity-70">Ebene {element.zIndex}</span>
                            <span className="text-xs opacity-50">↑↓</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {designData.elements.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-4">
                      Keine Elemente vorhanden
                    </div>
                  )}
                </div>
                  </div>
                </div>
            </div>

            {/* Save and Export Buttons */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={saveDesign}
                  disabled={loading}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 font-medium transition-all duration-200 shadow-lg"
                >
                  {loading ? 'Speichere...' : '💾 Design speichern'}
                </button>
                
                <button
                  onClick={() => exportToWallet('apple')}
                  disabled={loading || walletExportLoading === 'apple'}
                  className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black disabled:opacity-50 font-medium transition-all duration-200 shadow-lg border border-gray-600"
                >
                  {walletExportLoading === 'apple' ? '⏳ Generiere...' : '📱 Apple Wallet Test'}
                </button>
                
                <button
                  onClick={() => exportToWallet('google')}
                  disabled={loading || walletExportLoading === 'google'}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium transition-all duration-200 shadow-lg"
                >
                  {walletExportLoading === 'google' ? '⏳ Generiere...' : '🏪 Google Wallet Test'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Saved Designs */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">💾 Gespeicherte Designs</h2>
              
              <div className="space-y-3">
                {designs.map((design) => {
                  const designData = JSON.parse(design.designData);
                  return (
                    <div key={design.id} className="p-3 bg-slate-700 rounded border border-slate-600">
                      <h3 className="text-white font-medium text-sm">{design.name}</h3>
                      {design.isActive && (
                        <span className="text-green-400 text-xs">● Aktiv</span>
                      )}
                      <div className="flex space-x-2 mt-2">
                        {!design.isActive && (
                          <button
                            onClick={() => activateDesign(design.id)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Aktivieren
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setDesignData({ ...designData, ...JSON.parse(design.designData) });
                          }}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Laden
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {designs.length === 0 && (
                  <p className="text-slate-400 text-center text-sm">Keine Designs gespeichert</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">🚀 Aktionen</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/admin-dashboard')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  🔙 Zurück zum Admin-Dashboard
                </button>
              </div>

              {message && (
                <div className="mt-4 p-3 bg-green-900/50 border border-green-500 text-green-200 rounded text-sm">
                  {message}
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
