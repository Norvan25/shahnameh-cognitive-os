import { useState, useCallback } from 'react';
import { CognitiveGraph } from './components/Graph/CognitiveGraph';
import { InfoPanel } from './components/InfoPanel/InfoPanel';
import { VapiOrb } from './components/VapiOrb/VapiOrb';
import { shahnamehData } from './data/shahnameh-graph';
import type { CognitiveNode } from './types/graph.types';
import './App.css';

// Character name mappings for voice recognition
const CHARACTER_KEYWORDS: Record<string, string[]> = {
  'awareness': ['awareness', 'observer', 'witness', 'consciousness'],
  'simorgh': ['simorgh', 'simurgh', 'phoenix', 'bird'],
  'rostam': ['rostam', 'rustam', 'hero', 'survival'],
  'sohrab': ['sohrab', 'potential', 'son of rostam'],
  'zahhak': ['zahhak', 'zahak', 'snake', 'serpent', 'shame'],
  'siyavash': ['siyavash', 'siavash', 'guilt', 'innocent'],
  'kay-khosrow': ['kay khosrow', 'khosrow', 'wisdom', 'wise king'],
  'kay-kavous': ['kay kavous', 'kavous', 'kavus', 'impulse', 'ego'],
  'zal': ['zal', 'intuition', 'white hair'],
  'kaveh': ['kaveh', 'blacksmith', 'rebellion', 'rebel'],
  'fereydun': ['fereydun', 'feridun', 'justice'],
  'jamshid': ['jamshid', 'creativity', 'imagination'],
  'esfandiyar': ['esfandiyar', 'isfandiyar', 'duty', 'invulnerable'],
  'afrasiab': ['afrasiab', 'turan', 'enemy', 'threat'],
  'sudabeh': ['sudabeh', 'manipulation', 'desire'],
  'tahmineh': ['tahmineh', 'mother', 'container'],
  'rakhsh': ['rakhsh', 'horse', 'body'],
  'div-sepid': ['div sepid', 'white demon', 'fear', 'demon'],
  'piran': ['piran', 'loyalty', 'conflicted'],
  'garsivaz': ['garsivaz', 'betrayer', 'sabotage'],
  'goshtasp': ['goshtasp', 'gushtasp', 'insecurity'],
  'manuchehr': ['manuchehr', 'order', 'restoration'],
  'khvarenah': ['khvarenah', 'farr', 'glory', 'divine'],
};

function App() {
  const [selectedNode, setSelectedNode] = useState<CognitiveNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceHighlightIds, setVoiceHighlightIds] = useState<string[]>([]);

  const handleNodeClick = (node: CognitiveNode) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  // Handle transcript from VAPI - detect character names
  const handleTranscript = useCallback((text: string, role: 'user' | 'assistant') => {
    if (role !== 'assistant') return; // Only highlight when AI speaks
    
    const lowerText = text.toLowerCase();
    const matchedIds: string[] = [];

    // Check each character's keywords
    Object.entries(CHARACTER_KEYWORDS).forEach(([nodeId, keywords]) => {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          matchedIds.push(nodeId);
          break;
        }
      }
    });

    if (matchedIds.length > 0) {
      setVoiceHighlightIds(matchedIds);
      
      // Clear highlight after 5 seconds
      setTimeout(() => {
        setVoiceHighlightIds([]);
      }, 5000);
    }
  }, []);

  // Combine search and voice highlights
  const getHighlightedNodeIds = (): string[] => {
    const searchHighlights: string[] = [];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      shahnamehData.nodes.forEach(node => {
        if (
          node.nameEN.toLowerCase().includes(query) ||
          node.nameFA.includes(searchQuery) ||
          node.role.toLowerCase().includes(query)
        ) {
          searchHighlights.push(node.id);
        }
      });
    }

    // Combine both, prioritizing voice highlights
    const combined = [...new Set([...voiceHighlightIds, ...searchHighlights])];
    return combined;
  };

  const highlightedNodes = getHighlightedNodeIds();

  return (
    <div className="app-container">
      {/* Background handled by CSS */}
      
      <header className="app-header">
        <div className="header-brand">
          <img src="/norvan-logo.png" alt="Norvan" className="norvan-logo" />
          <div className="header-titles">
            <h1 className="title-en">Shahnameh Cognitive OS</h1>
            <p className="title-fa">سیستم عامل شناختی شاهنامه</p>
          </div>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="search-clear"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
          {searchQuery && highlightedNodes.length > 0 && (
            <span className="search-count">
              {highlightedNodes.length} found
            </span>
          )}
        </div>
      </header>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-line heals"></span>
          <span>Heals</span>
        </div>
        <div className="legend-item">
          <span className="legend-line conflicts"></span>
          <span>Conflicts</span>
        </div>
        <div className="legend-item">
          <span className="legend-line corrupts"></span>
          <span>Corrupts</span>
        </div>
        <div className="legend-item">
          <span className="legend-line serves"></span>
          <span>Serves</span>
        </div>
      </div>

      <main className="graph-container">
        <CognitiveGraph 
          data={shahnamehData} 
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNode?.id}
          highlightedNodeIds={highlightedNodes}
        />
      </main>

      <InfoPanel 
        node={selectedNode} 
        connections={shahnamehData.connections}
        allNodes={shahnamehData.nodes}
        onClose={handleClosePanel}
      />

      {/* VAPI with transcript callback for graph highlighting */}
      <VapiOrb onTranscript={handleTranscript} />
    </div>
  );
}

export default App;
