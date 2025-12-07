import { useState, useEffect } from 'react';
import { CognitiveGraph } from './components/Graph/CognitiveGraph';
import { InfoPanel } from './components/InfoPanel/InfoPanel';
import { MobileView } from './components/MobileView/MobileView';
import { VapiOrb } from './components/VapiOrb/VapiOrb';
import { TesseractMesh } from './components/Background/TesseractMesh';
import { shahnamehData } from './data/shahnameh-graph';
import { CognitiveNode } from './types/graph.types';
import './App.css';

function App() {
  const [selectedNode, setSelectedNode] = useState<CognitiveNode | null>(null);
  const [isVapiActive, setIsVapiActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNodeClick = (node: CognitiveNode) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="app-container mobile">
        <TesseractMesh />
        
        <MobileView
          nodes={shahnamehData.nodes}
          onNodeSelect={handleNodeClick}
        />

        <InfoPanel 
          node={selectedNode} 
          connections={shahnamehData.connections}
          allNodes={shahnamehData.nodes}
          onClose={handleClosePanel}
          isMobile={true}
        />

        <VapiOrb 
          isActive={isVapiActive}
          onToggle={() => setIsVapiActive(!isVapiActive)}
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="app-container">
      <TesseractMesh />
      
      <header className="app-header">
        <h1 className="title-en">Shahnameh Cognitive OS</h1>
        <p className="title-fa">سیستم عامل شناختی شاهنامه</p>
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
        />
      </main>

      <InfoPanel 
        node={selectedNode} 
        connections={shahnamehData.connections}
        allNodes={shahnamehData.nodes}
        onClose={handleClosePanel}
        isMobile={false}
      />

      <VapiOrb 
        isActive={isVapiActive}
        onToggle={() => setIsVapiActive(!isVapiActive)}
      />
    </div>
  );
}

export default App;
