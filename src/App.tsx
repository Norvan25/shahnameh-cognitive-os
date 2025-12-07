import { useState } from 'react';
import { CognitiveGraph } from './components/Graph/CognitiveGraph';
import { InfoPanel } from './components/InfoPanel/InfoPanel';
import { VapiOrb } from './components/VapiOrb/VapiOrb';
import { shahnamehData } from './data/shahnameh-graph';
import type { CognitiveNode } from './types/graph.types';
import './App.css';

function App() {
  const [selectedNode, setSelectedNode] = useState<CognitiveNode | null>(null);
  const [isVapiActive, setIsVapiActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNodeClick = (node: CognitiveNode) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  // Filter nodes based on search
  const getHighlightedNodeIds = (): string[] => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return shahnamehData.nodes
      .filter(node => 
        node.nameEN.toLowerCase().includes(query) ||
        node.nameFA.includes(searchQuery) ||
        node.role.toLowerCase().includes(query)
      )
      .map(node => node.id);
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

      <VapiOrb 
        isActive={isVapiActive}
        onToggle={() => setIsVapiActive(!isVapiActive)}
      />
    </div>
  );
}

export default App;
