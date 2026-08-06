import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  Copy,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Building2,
  DoorOpen,
  BookOpen,
  Users,
  Grid,
  CheckCircle2,
  Move,
  Maximize2,
  Minimize2,
  MapPin,
  Footprints,
  Info,
  Shield,
  HelpCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  Undo2,
  Redo2,
  Type,
  Square,
  Circle as CircleIcon,
  Flame,
  Camera,
  Cross,
  Bell,
  Monitor,
  Printer,
  Armchair,
  Search,
  Check,
  FolderOpen,
  Sparkle,
  Sliders,
  Palette
} from 'lucide-react';
import { MapElement } from '../types';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

// Sample Preset Layout available on-demand if librarian wants a starting point
export const DEMO_PRESET_MAP: MapElement[] = [
  {
    id: 'demo-room-main',
    type: 'room',
    label: 'Main Library Stack Hall',
    code: 'STACK-HALL',
    x: 100,
    y: 80,
    width: 800,
    height: 520,
    fillColor: '#0f172a',
    borderColor: '#334155',
    borderWidth: 2,
    cornerRadius: 16,
    zIndex: 1,
    isLocked: true
  },
  {
    id: 'demo-entrance',
    type: 'entrance',
    label: 'Main Gate & QR Scanner',
    code: 'ENTRANCE',
    shelfId: 'ENTRANCE',
    x: 420,
    y: 530,
    width: 160,
    height: 60,
    fillColor: '#059669',
    borderColor: '#34d399',
    borderWidth: 2,
    cornerRadius: 12,
    textColor: '#ffffff',
    zIndex: 10,
    icon: 'door'
  },
  {
    id: 'demo-shelf-1',
    type: 'almari',
    label: 'Almari #1 - CS & IT',
    code: 'A1',
    shelfId: 'SHELF-001',
    shelfNumber: '1',
    rackNumber: 'A',
    floor: 'Ground',
    section: 'Computer Science & Software',
    category: 'Computer Science',
    capacity: 450,
    x: 160,
    y: 140,
    width: 140,
    height: 80,
    fillColor: '#78350f',
    borderColor: '#f59e0b',
    borderWidth: 2,
    cornerRadius: 8,
    textColor: '#fef3c7',
    zIndex: 5
  },
  {
    id: 'demo-shelf-2',
    type: 'almari',
    label: 'Almari #2 - AI & Data',
    code: 'A2',
    shelfId: 'SHELF-002',
    shelfNumber: '2',
    rackNumber: 'A',
    floor: 'Ground',
    section: 'AI, ML & Data Science',
    category: 'Artificial Intelligence',
    capacity: 400,
    x: 160,
    y: 250,
    width: 140,
    height: 80,
    fillColor: '#78350f',
    borderColor: '#f59e0b',
    borderWidth: 2,
    cornerRadius: 8,
    textColor: '#fef3c7',
    zIndex: 5
  },
  {
    id: 'demo-shelf-14',
    type: 'almari',
    label: 'Almari #14 - Database & Systems',
    code: 'A14',
    shelfId: 'SHELF-014',
    shelfNumber: '14',
    rackNumber: 'B',
    floor: 'Ground',
    section: 'Database Systems & Networks',
    category: 'Computer Science',
    capacity: 500,
    x: 340,
    y: 140,
    width: 140,
    height: 80,
    fillColor: '#1e3a8a',
    borderColor: '#60a5fa',
    borderWidth: 2,
    cornerRadius: 8,
    textColor: '#dbeafe',
    zIndex: 5
  },
  {
    id: 'demo-desk',
    type: 'reception',
    label: 'Librarian Circulation Desk',
    code: 'COUNTER-1',
    shelfId: 'DESK-CIRCULATION',
    x: 380,
    y: 440,
    width: 240,
    height: 60,
    fillColor: '#581c87',
    borderColor: '#c084fc',
    borderWidth: 2,
    cornerRadius: 12,
    textColor: '#f3e8ff',
    zIndex: 6
  }
];

export const MapDesigner: React.FC = () => {
  const { currentPreset } = useTheme();

  // Canvas State: Default starts completely EMPTY per user instructions
  const [elements, setElements] = useState<MapElement[]>(() => {
    const saved = localStorage.getItem('gec_library_map_elements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved library floor plan:', e);
      }
    }
    return []; // Blank initial canvas!
  });

  // History Stacks for Undo / Redo
  const [history, setHistory] = useState<MapElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Selection state (supports single & multi select)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Canvas Navigation: Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(20);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState<MapElement[]>([]);

  // Dragging / Resizing elements on canvas
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizingState, setResizingState] = useState<{
    id: string;
    handle: 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w';
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startElemX: number;
    startElemY: number;
  } | null>(null);

  // UI Tabs & Feedback
  const [activeToolCategory, setActiveToolCategory] = useState<'building' | 'library' | 'safety' | 'navigation' | 'shapes'>('library');
  const [activeInspectorTab, setActiveInspectorTab] = useState<'properties' | 'shelf' | 'style' | 'layers'>('shelf');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [toolSearchQuery, setToolSearchQuery] = useState<string>('');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Save current elements state to History
  const pushHistory = useCallback((newElements: MapElement[]) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, newElements];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Update Elements with history state tracking
  const updateElementsState = useCallback((newElements: MapElement[], recordHistory = true) => {
    setElements(newElements);
    if (recordHistory) {
      pushHistory(newElements);
    }
  }, [pushHistory]);

  // Undo Action
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setElements(history[prevIndex]);
    }
  };

  // Redo Action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
    }
  };

  // Auto-save & manual save to localStorage
  const handleSaveMap = () => {
    localStorage.setItem('gec_library_map_elements', JSON.stringify(elements));
    window.dispatchEvent(new Event('gec_map_elements_updated'));
    setSaveStatus('Floor plan saved successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleClearCanvas = () => {
    if (window.confirm('Clear all elements and start with a completely empty floor plan canvas?')) {
      updateElementsState([]);
      setSelectedIds([]);
      localStorage.setItem('gec_library_map_elements', JSON.stringify([]));
      window.dispatchEvent(new Event('gec_map_elements_updated'));
    }
  };

  const handleLoadSamplePreset = () => {
    if (window.confirm('Load demo floor plan layout? This will give you a sample layout that you can customize.')) {
      updateElementsState(DEMO_PRESET_MAP);
      setSelectedIds(['demo-shelf-14']);
      localStorage.setItem('gec_library_map_elements', JSON.stringify(DEMO_PRESET_MAP));
      window.dispatchEvent(new Event('gec_map_elements_updated'));
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(elements, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `library_floor_plan_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            updateElementsState(parsed);
            setSaveStatus('Imported floor plan successfully!');
            setTimeout(() => setSaveStatus(null), 3000);
          }
        } catch (err) {
          alert('Invalid floor plan JSON file format');
        }
      };
    }
  };

  // Add Element to Canvas
  const handleAddElement = (type: MapElement['type'], customProps?: Partial<MapElement>) => {
    const nextShelfNum = elements.filter(e => e.type === 'almari' || e.type === 'rack').length + 1;
    const uniqueId = `elem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Default dimensions and styling based on element category
    let defaultWidth = 140;
    let defaultHeight = 80;
    let defaultFill = '#1e293b';
    let defaultBorder = '#64748b';
    let defaultLabel = `${type.toUpperCase()} #${elements.length + 1}`;
    let defaultCode = `${type.substring(0, 3).toUpperCase()}-${elements.length + 1}`;
    let defaultShelfId = type === 'almari' || type === 'rack' ? `SHELF-${String(nextShelfNum).padStart(3, '0')}` : undefined;

    if (type === 'almari' || type === 'rack') {
      defaultLabel = `Bookshelf / Almari #${nextShelfNum}`;
      defaultCode = `A${nextShelfNum}`;
      defaultFill = '#78350f';
      defaultBorder = '#f59e0b';
      defaultWidth = 140;
      defaultHeight = 80;
    } else if (type === 'room' || type === 'hall' || type === 'discussion_room') {
      defaultLabel = `Study Room / Hall ${elements.filter(e => e.type === 'room').length + 1}`;
      defaultCode = `ROOM-${elements.filter(e => e.type === 'room').length + 1}`;
      defaultFill = '#0f172a';
      defaultBorder = '#3b82f6';
      defaultWidth = 360;
      defaultHeight = 240;
    } else if (type === 'entrance' || type === 'door' || type === 'exit') {
      defaultLabel = type === 'entrance' ? 'Main Entrance Gate' : 'Door Passage';
      defaultCode = type === 'entrance' ? 'ENTRANCE' : 'DOOR';
      defaultFill = '#059669';
      defaultBorder = '#34d399';
      defaultWidth = 120;
      defaultHeight = 60;
    } else if (type === 'desk' || type === 'table' || type === 'reception') {
      defaultLabel = type === 'reception' ? 'Reception Desk' : 'Reading Table';
      defaultCode = 'DESK';
      defaultFill = '#4c1d95';
      defaultBorder = '#a855f7';
      defaultWidth = 180;
      defaultHeight = 80;
    } else if (type === 'wall') {
      defaultLabel = 'Boundary Wall';
      defaultCode = 'WALL';
      defaultFill = '#334155';
      defaultBorder = '#94a3b8';
      defaultWidth = 240;
      defaultHeight = 20;
    } else if (type === 'path' || type === 'direction_marker') {
      defaultLabel = 'Walking Aisle Path';
      defaultCode = 'PATH';
      defaultFill = '#0891b2';
      defaultBorder = '#22d3ee';
      defaultWidth = 200;
      defaultHeight = 40;
    } else if (type === 'emergency_exit' || type === 'fire_extinguisher' || type === 'cctv') {
      defaultLabel = type === 'fire_extinguisher' ? 'Fire Extinguisher' : type === 'cctv' ? 'CCTV Camera' : 'Emergency Exit';
      defaultCode = 'SAFETY';
      defaultFill = '#991b1b';
      defaultBorder = '#f87171';
      defaultWidth = 60;
      defaultHeight = 60;
    } else if (type === 'text' || type === 'label') {
      defaultLabel = 'Text Label';
      defaultCode = 'TEXT';
      defaultFill = 'transparent';
      defaultBorder = 'transparent';
      defaultWidth = 160;
      defaultHeight = 40;
    }

    // Position center relative to pan and canvas viewport
    const newX = snapToGrid ? Math.round((200 - pan.x) / gridSize) * gridSize : 200 - pan.x;
    const newY = snapToGrid ? Math.round((200 - pan.y) / gridSize) * gridSize : 200 - pan.y;

    const newElem: MapElement = {
      id: uniqueId,
      type,
      label: defaultLabel,
      code: defaultCode,
      shelfId: defaultShelfId,
      shelfNumber: type === 'almari' || type === 'rack' ? nextShelfNum : undefined,
      rackNumber: 'A',
      floor: 'Ground',
      section: 'General Section',
      capacity: 300,
      x: newX,
      y: newY,
      width: defaultWidth,
      height: defaultHeight,
      rotation: 0,
      zIndex: elements.length + 1,
      fillColor: defaultFill,
      borderColor: defaultBorder,
      borderWidth: 2,
      textColor: '#ffffff',
      fontSize: 12,
      opacity: 1,
      cornerRadius: 8,
      hasShadow: true,
      ...customProps
    };

    const updated = [...elements, newElem];
    updateElementsState(updated);
    setSelectedIds([uniqueId]);
  };

  // Selection handlers
  const handleSelectElement = (id: string, isMulti: boolean) => {
    if (isMulti) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    } else {
      setSelectedIds([id]);
    }
  };

  const primarySelected = elements.find(e => selectedIds.includes(e.id)) || null;

  // Single or Batch Update selected properties
  const handleUpdateSelected = (field: keyof MapElement, value: any) => {
    if (selectedIds.length === 0) return;
    const updated = elements.map(item => {
      if (selectedIds.includes(item.id)) {
        return { ...item, [field]: value };
      }
      return item;
    });
    updateElementsState(updated);
  };

  // Delete Selected
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const updated = elements.filter(e => !selectedIds.includes(e.id));
    updateElementsState(updated);
    setSelectedIds([]);
  };

  // Duplicate Selected
  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const newElems: MapElement[] = [];
    const newIds: string[] = [];

    selectedIds.forEach(id => {
      const orig = elements.find(e => e.id === id);
      if (orig) {
        const newId = `elem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        newIds.push(newId);
        const dup: MapElement = {
          ...orig,
          id: newId,
          x: orig.x + 20,
          y: orig.y + 20,
          label: orig.label + ' (Copy)',
          code: orig.code ? `${orig.code}-COPY` : undefined,
          shelfId: orig.shelfId ? `${orig.shelfId}-COPY` : undefined
        };
        newElems.push(dup);
      }
    });

    if (newElems.length > 0) {
      updateElementsState([...elements, ...newElems]);
      setSelectedIds(newIds);
    }
  };

  // Lock / Unlock Selected
  const handleToggleLock = () => {
    if (selectedIds.length === 0) return;
    const isAnyUnlocked = elements.some(e => selectedIds.includes(e.id) && !e.isLocked);
    const updated = elements.map(e => {
      if (selectedIds.includes(e.id)) {
        return { ...e, isLocked: isAnyUnlocked };
      }
      return e;
    });
    updateElementsState(updated);
  };

  // Z-Index Movement
  const handleBringForward = () => {
    if (selectedIds.length === 0) return;
    const updated = elements.map(e => {
      if (selectedIds.includes(e.id)) {
        return { ...e, zIndex: (e.zIndex || 1) + 1 };
      }
      return e;
    });
    updateElementsState(updated);
  };

  const handleSendBackward = () => {
    if (selectedIds.length === 0) return;
    const updated = elements.map(e => {
      if (selectedIds.includes(e.id)) {
        return { ...e, zIndex: Math.max(1, (e.zIndex || 1) - 1) };
      }
      return e;
    });
    updateElementsState(updated);
  };

  // Mouse / Touch Dragging on Canvas
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvasBg) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedIds([]);
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
      return;
    }

    // Element Dragging
    if (draggingId && primarySelected && !primarySelected.isLocked) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      let rawX = (e.clientX - canvasRect.left - pan.x) / zoom - dragOffset.x;
      let rawY = (e.clientY - canvasRect.top - pan.y) / zoom - dragOffset.y;

      if (snapToGrid) {
        rawX = Math.round(rawX / gridSize) * gridSize;
        rawY = Math.round(rawY / gridSize) * gridSize;
      }

      setElements(prev => prev.map(item => item.id === draggingId ? { ...item, x: rawX, y: rawY } : item));
      return;
    }

    // Handle Resizing
    if (resizingState) {
      const { id, handle, startX, startY, startW, startH, startElemX, startElemY } = resizingState;
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;

      setElements(prev => prev.map(item => {
        if (item.id !== id) return item;

        let newW = startW;
        let newH = startH;
        let newX = startElemX;
        let newY = startElemY;

        if (handle.includes('e')) newW = Math.max(20, startW + dx);
        if (handle.includes('s')) newH = Math.max(20, startH + dy);
        if (handle.includes('w')) {
          const possibleW = startW - dx;
          if (possibleW >= 20) {
            newW = possibleW;
            newX = startElemX + dx;
          }
        }
        if (handle.includes('n')) {
          const possibleH = startH - dy;
          if (possibleH >= 20) {
            newH = possibleH;
            newY = startElemY + dy;
          }
        }

        if (snapToGrid) {
          newW = Math.round(newW / gridSize) * gridSize;
          newH = Math.round(newH / gridSize) * gridSize;
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }

        return { ...item, x: newX, y: newY, width: newW, height: newH };
      }));
    }
  };

  const handleMouseUpCanvas = () => {
    setIsPanning(false);
    if (draggingId || resizingState) {
      pushHistory(elements);
    }
    setDraggingId(null);
    setResizingState(null);
  };

  // Wheel Zoom
  const handleWheelCanvas = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom(prev => Math.min(3, Math.max(0.3, prev * zoomFactor)));
    } else {
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  // Drag start for single element
  const handleMouseDownElement = (e: React.MouseEvent, elem: MapElement) => {
    e.stopPropagation();
    if (elem.isLocked) {
      setSelectedIds([elem.id]);
      return;
    }

    const isShift = e.shiftKey;
    handleSelectElement(elem.id, isShift);

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const mouseCanvasX = (e.clientX - canvasRect.left - pan.x) / zoom;
      const mouseCanvasY = (e.clientY - canvasRect.top - pan.y) / zoom;
      setDragOffset({
        x: mouseCanvasX - elem.x,
        y: mouseCanvasY - elem.y
      });
      setDraggingId(elem.id);
    }
  };

  // Resize Handle Press
  const handleMouseDownResize = (e: React.MouseEvent, elem: MapElement, handle: 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w') => {
    e.stopPropagation();
    if (elem.isLocked) return;

    setResizingState({
      id: elem.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startW: elem.width,
      startH: elem.height,
      startElemX: elem.x,
      startElemY: elem.y
    });
  };

  // Filtering Toolbox
  const filterElements = (categoryItems: { type: MapElement['type']; title: string; desc: string; icon: any }[]) => {
    if (!toolSearchQuery) return categoryItems;
    return categoryItems.filter(item =>
      item.title.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(toolSearchQuery.toLowerCase())
    );
  };

  const buildingTools = [
    { type: 'room' as const, title: 'Room / Hall', desc: 'Enclosed study section or research hall', icon: Building2 },
    { type: 'wall' as const, title: 'Partition Wall', desc: 'Solid divider or outer boundary wall', icon: Square },
    { type: 'door' as const, title: 'Door Passage', desc: 'Entry point or interior door', icon: DoorOpen },
    { type: 'entrance' as const, title: 'Entrance Gate', desc: 'Main gate & digital QR scanner desk', icon: DoorOpen },
    { type: 'exit' as const, title: 'Exit Gate', desc: 'Marked exit passage', icon: DoorOpen },
    { type: 'corridor' as const, title: 'Corridor Aisle', desc: 'Walking hall passage between rooms', icon: Footprints },
  ];

  const libraryTools = [
    { type: 'almari' as const, title: 'Bookshelf / Almari', desc: 'Numbered book storage rack linked to DB', icon: BookOpen },
    { type: 'rack' as const, title: 'Magazine Rack', desc: 'Periodicals, news & journal display rack', icon: BookOpen },
    { type: 'table' as const, title: 'Reading Table', desc: 'Student group study desk with power sockets', icon: Users },
    { type: 'chair' as const, title: 'Individual Seat', desc: 'Single study chair or cubicle', icon: Armchair },
    { type: 'reception' as const, title: 'Circulation Counter', desc: 'Issue & return librarian desk', icon: Monitor },
    { type: 'computer' as const, title: 'OPAC Terminal', desc: 'Digital search kiosk terminal for students', icon: Monitor },
    { type: 'printer' as const, title: 'Printer / Copier', desc: 'Document scanning & printing workstation', icon: Printer },
  ];

  const safetyTools = [
    { type: 'emergency_exit' as const, title: 'Emergency Exit', desc: 'Safety escape doorway marker', icon: Shield },
    { type: 'fire_extinguisher' as const, title: 'Fire Extinguisher', desc: 'Fire safety equipment point', icon: Flame },
    { type: 'cctv' as const, title: 'CCTV Camera', desc: 'Security surveillance camera node', icon: Camera },
    { type: 'first_aid' as const, title: 'First Aid Kiosk', desc: 'Medical emergency kit station', icon: Cross },
    { type: 'alarm' as const, title: 'Fire Alarm Button', desc: 'Emergency push button', icon: Bell },
  ];

  const navTools = [
    { type: 'path' as const, title: 'Walking Path Segment', desc: 'Connects entrance to shelf destination', icon: Footprints },
    { type: 'direction_marker' as const, title: 'Direction Arrow', desc: 'Visual direction pointer for route', icon: MapPin },
  ];

  const shapeTools = [
    { type: 'rectangle' as const, title: 'Rectangle Shape', desc: 'Custom fill box or area highlight', icon: Square },
    { type: 'circle' as const, title: 'Circle / Pillar', desc: 'Circular pillar or round desk', icon: CircleIcon },
    { type: 'text' as const, title: 'Text Label', desc: 'Custom header or department title text', icon: Type },
  ];

  return (
    <div className="space-y-4">

      {/* Top Professional Toolbar */}
      <div className={`${currentPreset.cardBg} ${currentPreset.cardRadius} p-3.5 border ${currentPreset.cardBorder} shadow-lg flex flex-wrap items-center justify-between gap-3`}>
        
        {/* Title & Canvas Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Floor Plan Designer</h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-[10px] font-black border border-cyan-500/20">
                CANVAS EDITOR v3.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {elements.length === 0 ? 'Empty Canvas • Add rooms, shelves & doors from toolbox' : `${elements.length} elements • ${elements.filter(e => e.type === 'almari' || e.type === 'rack').length} Linked Shelves`}
            </p>
          </div>
        </div>

        {/* History & Zoom & Grid Controls */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-1" />

          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => setZoom(prev => Math.max(0.3, prev - 0.1))}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 px-1 min-w-[45px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-all"
          >
            Reset
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-1" />

          {/* Grid & Snap Toggles */}
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              showGrid ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              snapToGrid ? 'bg-cyan-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Snap</span>
          </button>
        </div>

        {/* Global Save, Preset & File Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          <button
            type="button"
            onClick={handleSaveMap}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Save Floor Plan</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSamplePreset}
            className={`px-3 py-2 ${currentPreset.secondaryButtonBg} font-bold text-xs rounded-xl text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all`}
            title="Load sample floor plan layout"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Demo Preset</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className={`px-3 py-2 ${currentPreset.secondaryButtonBg} font-bold text-xs rounded-xl text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all`}
            title="Export JSON floor plan file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <label className={`px-3 py-2 ${currentPreset.secondaryButtonBg} font-bold text-xs rounded-xl text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer`}>
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleClearCanvas}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-rose-500/20 transition-all"
            title="Clear all canvas elements"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveStatus}</span>
            </div>
            <span className="text-[10px] opacity-80">Synced live to student view</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN DESIGNER INTERFACE: Toolbox + Interactive Canvas + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* 1. LEFT TOOLBOX: Building, Library, Safety, Navigation Elements */}
        <div className={`lg:col-span-3 ${currentPreset.cardBg} ${currentPreset.cardRadius} p-3.5 border ${currentPreset.cardBorder} shadow-md space-y-3.5 max-h-[720px] overflow-y-auto`}>
          
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Element Toolbox
            </h3>
            
            {/* Search Elements */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search element..."
                value={toolSearchQuery}
                onChange={(e) => setToolSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 text-xs ${currentPreset.inputBg} ${currentPreset.inputRadius} focus:outline-none`}
              />
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              {[
                { id: 'library', label: 'Shelves', icon: BookOpen },
                { id: 'building', label: 'Build', icon: Building2 },
                { id: 'safety', label: 'Safety', icon: Shield },
                { id: 'navigation', label: 'Route', icon: Footprints },
                { id: 'shapes', label: 'Shapes', icon: Square }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveToolCategory(cat.id as any)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-black flex flex-col items-center gap-0.5 transition-all ${
                    activeToolCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Items List based on Active Category */}
          <div className="space-y-1.5">
            
            {activeToolCategory === 'library' && (
              filterElements(libraryTools).map(tool => (
                <button
                  key={tool.type}
                  type="button"
                  onClick={() => handleAddElement(tool.type)}
                  className="w-full p-2.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/20 text-slate-800 dark:text-amber-200 font-extrabold text-xs flex items-center gap-2.5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-bold truncate text-slate-900 dark:text-white">{tool.title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate">{tool.desc}</span>
                  </div>
                </button>
              ))
            )}

            {activeToolCategory === 'building' && (
              filterElements(buildingTools).map(tool => (
                <button
                  key={tool.type}
                  type="button"
                  onClick={() => handleAddElement(tool.type)}
                  className="w-full p-2.5 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/20 text-slate-800 dark:text-indigo-200 font-extrabold text-xs flex items-center gap-2.5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-bold truncate text-slate-900 dark:text-white">{tool.title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate">{tool.desc}</span>
                  </div>
                </button>
              ))
            )}

            {activeToolCategory === 'safety' && (
              filterElements(safetyTools).map(tool => (
                <button
                  key={tool.type}
                  type="button"
                  onClick={() => handleAddElement(tool.type)}
                  className="w-full p-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 text-slate-800 dark:text-rose-200 font-extrabold text-xs flex items-center gap-2.5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-rose-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-bold truncate text-slate-900 dark:text-white">{tool.title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate">{tool.desc}</span>
                  </div>
                </button>
              ))
            )}

            {activeToolCategory === 'navigation' && (
              filterElements(navTools).map(tool => (
                <button
                  key={tool.type}
                  type="button"
                  onClick={() => handleAddElement(tool.type)}
                  className="w-full p-2.5 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/15 border border-cyan-500/20 text-slate-800 dark:text-cyan-200 font-extrabold text-xs flex items-center gap-2.5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-bold truncate text-slate-900 dark:text-white">{tool.title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate">{tool.desc}</span>
                  </div>
                </button>
              ))
            )}

            {activeToolCategory === 'shapes' && (
              filterElements(shapeTools).map(tool => (
                <button
                  key={tool.type}
                  type="button"
                  onClick={() => handleAddElement(tool.type)}
                  className="w-full p-2.5 rounded-xl bg-slate-500/5 hover:bg-slate-500/15 border border-slate-500/20 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center gap-2.5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-bold truncate text-slate-900 dark:text-white">{tool.title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal block truncate">{tool.desc}</span>
                  </div>
                </button>
              ))
            )}

          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="p-2.5 bg-slate-500/5 rounded-xl border border-slate-500/10 space-y-1 text-[11px]">
              <span className="font-bold text-slate-500 block">Pro Tip:</span>
              <p className="text-slate-400">Click any element to drag, resize, rotate, or link to unique <strong>Shelf IDs</strong> for book navigation.</p>
            </div>
          </div>
        </div>

        {/* 2. CENTER CANVAS: Infinite Pannable / Zoomable Interactive Canvas */}
        <div className="lg:col-span-6 space-y-2">
          <div
            ref={canvasRef}
            data-canvas-bg="true"
            onMouseDown={handleMouseDownCanvas}
            onMouseMove={handleMouseMoveCanvas}
            onMouseUp={handleMouseUpCanvas}
            onWheel={handleWheelCanvas}
            className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden h-[620px] select-none cursor-grab active:cursor-grabbing"
          >
            {/* Canvas Header Overlay */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between text-xs text-slate-400 pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 text-[11px] font-mono text-cyan-400 font-bold pointer-events-auto">
                <Grid className="w-3.5 h-3.5" />
                <span>CANVAS WORLD • Pan: ({Math.round(pan.x)}, {Math.round(pan.y)})</span>
              </div>

              {primarySelected && (
                <div className="bg-indigo-900/90 text-indigo-100 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-700/50 text-[11px] font-bold flex items-center gap-2 pointer-events-auto">
                  <span>Selected: {primarySelected.label}</span>
                  {primarySelected.shelfId && (
                    <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
                      {primarySelected.shelfId}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Transform Container with Pan and Zoom */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                width: '2000px',
                height: '2000px',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              className="relative"
            >
              {/* Optional Grid Pattern Background */}
              {showGrid && (
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="designerGridPattern" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                      <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#designerGridPattern)" />
                </svg>
              )}

              {/* RENDER ALL CANVAS ELEMENTS */}
              {elements.slice().sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1)).map(elem => {
                const isSelected = selectedIds.includes(elem.id);
                const isPrimary = primarySelected?.id === elem.id;

                return (
                  <div
                    key={elem.id}
                    onMouseDown={(e) => handleMouseDownElement(e, elem)}
                    style={{
                      position: 'absolute',
                      left: `${elem.x}px`,
                      top: `${elem.y}px`,
                      width: `${elem.width}px`,
                      height: `${elem.height}px`,
                      transform: `rotate(${elem.rotation || 0}deg)`,
                      backgroundColor: elem.fillColor || '#1e293b',
                      borderColor: isSelected ? '#38bdf8' : elem.borderColor || '#475569',
                      borderWidth: `${elem.borderWidth || 2}px`,
                      borderStyle: 'solid',
                      borderRadius: `${elem.cornerRadius || 8}px`,
                      opacity: elem.opacity ?? 1,
                      boxShadow: elem.hasShadow ? '0 10px 25px -5px rgba(0,0,0,0.5)' : 'none',
                      zIndex: elem.zIndex || 1
                    }}
                    className={`p-2 flex flex-col justify-between transition-shadow cursor-pointer relative group ${
                      isSelected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950' : ''
                    } ${elem.isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                  >
                    {/* Element Label & Header */}
                    <div className="flex items-center justify-between gap-1 overflow-hidden pointer-events-none">
                      <span
                        style={{ color: elem.textColor || '#ffffff', fontSize: `${elem.fontSize || 12}px` }}
                        className="font-bold truncate"
                      >
                        {elem.label}
                      </span>

                      {elem.isLocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                    </div>

                    {/* Shelf Metadata Badge if Bookshelf */}
                    {(elem.type === 'almari' || elem.type === 'rack' || elem.shelfId) && (
                      <div className="flex items-center justify-between text-[10px] font-mono text-amber-200 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 pointer-events-none">
                        <span className="font-extrabold">{elem.shelfId || elem.code}</span>
                        {elem.shelfNumber && <span>#{elem.shelfNumber}</span>}
                      </div>
                    )}

                    {/* Resize Handles (Rendered only on Primary Selected item) */}
                    {isPrimary && !elem.isLocked && (
                      <>
                        <div
                          onMouseDown={(e) => handleMouseDownResize(e, elem, 'nw')}
                          className="w-3 h-3 bg-sky-400 border-2 border-slate-950 rounded-full absolute -top-1.5 -left-1.5 cursor-nwse-resize z-30"
                        />
                        <div
                          onMouseDown={(e) => handleMouseDownResize(e, elem, 'ne')}
                          className="w-3 h-3 bg-sky-400 border-2 border-slate-950 rounded-full absolute -top-1.5 -right-1.5 cursor-nesw-resize z-30"
                        />
                        <div
                          onMouseDown={(e) => handleMouseDownResize(e, elem, 'se')}
                          className="w-3 h-3 bg-sky-400 border-2 border-slate-950 rounded-full absolute -bottom-1.5 -right-1.5 cursor-nwse-resize z-30"
                        />
                        <div
                          onMouseDown={(e) => handleMouseDownResize(e, elem, 'sw')}
                          className="w-3 h-3 bg-sky-400 border-2 border-slate-950 rounded-full absolute -bottom-1.5 -left-1.5 cursor-nesw-resize z-30"
                        />
                        <div
                          onMouseDown={(e) => handleMouseDownResize(e, elem, 'n')}
                          className="w-2.5 h-2.5 bg-sky-400 border border-slate-950 absolute -top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize z-30"
                        />
                        <div
                          onMouseDown={(e) => handleMouseDownResize(e, elem, 's')}
                          className="w-2.5 h-2.5 bg-sky-400 border border-slate-950 absolute -bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize z-30"
                        />
                        <div
                          onMouseDown={(e) => handleMouseDownResize(e, elem, 'e')}
                          className="w-2.5 h-2.5 bg-sky-400 border border-slate-950 absolute top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize z-30"
                        />
                        <div
                          onMouseDown={(e) => handleMouseDownResize(e, elem, 'w')}
                          className="w-2.5 h-2.5 bg-sky-400 border border-slate-950 absolute top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize z-30"
                        />
                      </>
                    )}
                  </div>
                );
              })}

            </div>

            {/* Bottom Canvas Instructions */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
              <span className="bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 text-slate-400 pointer-events-auto">
                Drag background to Pan • Ctrl + Wheel to Zoom
              </span>
            </div>
          </div>
        </div>

        {/* 3. RIGHT INSPECTOR: Full Object Inspector & Shelf Linking */}
        <div className={`lg:col-span-3 ${currentPreset.cardBg} ${currentPreset.cardRadius} p-3.5 border ${currentPreset.cardBorder} shadow-md space-y-3 max-h-[720px] overflow-y-auto`}>
          
          {/* Inspector Tab Switcher */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveInspectorTab('shelf')}
              className={`py-1.5 text-[10px] font-black rounded-lg transition-all ${
                activeInspectorTab === 'shelf' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Shelf ID
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab('properties')}
              className={`py-1.5 text-[10px] font-black rounded-lg transition-all ${
                activeInspectorTab === 'properties' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Transform
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab('style')}
              className={`py-1.5 text-[10px] font-black rounded-lg transition-all ${
                activeInspectorTab === 'style' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Style
            </button>
            <button
              type="button"
              onClick={() => setActiveInspectorTab('layers')}
              className={`py-1.5 text-[10px] font-black rounded-lg transition-all ${
                activeInspectorTab === 'layers' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Layers
            </button>
          </div>

          {primarySelected ? (
            <div className="space-y-3">

              {/* Action Toolbar for Selected Element */}
              <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleToggleLock}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      primarySelected.isLocked ? 'bg-amber-500/20 text-amber-500' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                    title={primarySelected.isLocked ? 'Unlock Element' : 'Lock Element'}
                  >
                    {primarySelected.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleBringForward}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                    title="Bring Forward"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSendBackward}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                    title="Send Backward"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDuplicateSelected}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all"
                  title="Delete Element"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* TAB 1: SHELF DATABASE LINKING SYSTEM */}
              {activeInspectorTab === 'shelf' && (
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block">
                      Database Shelf Connection
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      Match this Shelf ID with the book database. When students click <strong>Locate</strong>, it finds this exact Shelf ID.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Unique Shelf ID (e.g. SHELF-014 or A3) *
                    </label>
                    <input
                      type="text"
                      value={primarySelected.shelfId || ''}
                      onChange={(e) => handleUpdateSelected('shelfId', e.target.value.toUpperCase())}
                      placeholder="e.g. SHELF-014 or A3"
                      className={`w-full px-3 py-1.5 text-xs font-mono font-bold ${currentPreset.inputBg} ${currentPreset.inputRadius} focus:outline-none`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Shelf Number
                      </label>
                      <input
                        type="text"
                        value={primarySelected.shelfNumber || ''}
                        onChange={(e) => handleUpdateSelected('shelfNumber', e.target.value)}
                        placeholder="e.g. 14"
                        className={`w-full px-2.5 py-1.5 text-xs font-mono ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Rack Number
                      </label>
                      <input
                        type="text"
                        value={primarySelected.rackNumber || ''}
                        onChange={(e) => handleUpdateSelected('rackNumber', e.target.value)}
                        placeholder="e.g. A or B"
                        className={`w-full px-2.5 py-1.5 text-xs font-mono ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Floor
                      </label>
                      <select
                        value={primarySelected.floor || 'Ground'}
                        onChange={(e) => handleUpdateSelected('floor', e.target.value)}
                        className={`w-full px-2 py-1.5 text-xs ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                      >
                        <option value="Ground">Ground Floor</option>
                        <option value="1st Floor">1st Floor</option>
                        <option value="2nd Floor">2nd Floor</option>
                        <option value="Mezzanine">Mezzanine</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Capacity (Books)
                      </label>
                      <input
                        type="number"
                        value={primarySelected.capacity || 300}
                        onChange={(e) => handleUpdateSelected('capacity', Number(e.target.value))}
                        className={`w-full px-2.5 py-1.5 text-xs ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department / Category Section
                    </label>
                    <input
                      type="text"
                      value={primarySelected.section || ''}
                      onChange={(e) => handleUpdateSelected('section', e.target.value)}
                      placeholder="e.g. Computer Science & IT"
                      className={`w-full px-2.5 py-1.5 text-xs ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Short Display Label
                    </label>
                    <input
                      type="text"
                      value={primarySelected.label}
                      onChange={(e) => handleUpdateSelected('label', e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: GEOMETRY & TRANSFORM */}
              {activeInspectorTab === 'properties' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">X Position (px)</label>
                      <input
                        type="number"
                        value={Math.round(primarySelected.x)}
                        onChange={(e) => handleUpdateSelected('x', Number(e.target.value))}
                        className={`w-full px-2 py-1 text-xs font-mono ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Y Position (px)</label>
                      <input
                        type="number"
                        value={Math.round(primarySelected.y)}
                        onChange={(e) => handleUpdateSelected('y', Number(e.target.value))}
                        className={`w-full px-2 py-1 text-xs font-mono ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Width (px)</label>
                      <input
                        type="number"
                        value={Math.round(primarySelected.width)}
                        onChange={(e) => handleUpdateSelected('width', Math.max(20, Number(e.target.value)))}
                        className={`w-full px-2 py-1 text-xs font-mono ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Height (px)</label>
                      <input
                        type="number"
                        value={Math.round(primarySelected.height)}
                        onChange={(e) => handleUpdateSelected('height', Math.max(20, Number(e.target.value)))}
                        className={`w-full px-2 py-1 text-xs font-mono ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Rotation Angle:</span>
                      <span className="font-mono">{primarySelected.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={primarySelected.rotation || 0}
                      onChange={(e) => handleUpdateSelected('rotation', Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: STYLING & COLORS */}
              {activeInspectorTab === 'style' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Background Fill Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primarySelected.fillColor || '#1e293b'}
                        onChange={(e) => handleUpdateSelected('fillColor', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={primarySelected.fillColor || '#1e293b'}
                        onChange={(e) => handleUpdateSelected('fillColor', e.target.value)}
                        className={`w-full px-2.5 py-1 text-xs font-mono ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Border Color & Thickness
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primarySelected.borderColor || '#334155'}
                        onChange={(e) => handleUpdateSelected('borderColor', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer shrink-0"
                      />
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={primarySelected.borderWidth || 2}
                        onChange={(e) => handleUpdateSelected('borderWidth', Number(e.target.value))}
                        className={`w-20 px-2 py-1 text-xs font-mono ${currentPreset.inputBg} ${currentPreset.inputRadius}`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Corner Radius:</span>
                      <span className="font-mono">{primarySelected.cornerRadius || 8}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={primarySelected.cornerRadius || 8}
                      onChange={(e) => handleUpdateSelected('cornerRadius', Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Opacity:</span>
                      <span className="font-mono">{Math.round((primarySelected.opacity ?? 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={primarySelected.opacity ?? 1}
                      onChange={(e) => handleUpdateSelected('opacity', Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: LAYERS TREE */}
              {activeInspectorTab === 'layers' && (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {elements.slice().reverse().map(elem => {
                    const isSel = selectedIds.includes(elem.id);
                    return (
                      <div
                        key={elem.id}
                        onClick={() => setSelectedIds([elem.id])}
                        className={`p-2 rounded-lg text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                          isSel ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Layers className="w-3.5 h-3.5 shrink-0 opacity-75" />
                          <span className="truncate">{elem.label}</span>
                        </div>
                        {elem.shelfId && (
                          <span className="text-[9px] font-mono bg-slate-800 text-amber-300 px-1 rounded">
                            {elem.shelfId}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
              <Compass className="w-8 h-8 mx-auto text-slate-500 animate-spin-slow" />
              <p className="text-xs font-bold">No Element Selected</p>
              <p className="text-[10px] text-slate-500">
                Click any room, bookshelf, or entrance on the canvas to inspect and link its Shelf ID or edit properties.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
