import type { CognitiveNode, Connection } from '../../types/graph.types';
import { ArchetypeIcon } from '../Icons/ArchetypeIcon';
import './InfoPanel.css';

interface Props {
  node: CognitiveNode | null;
  connections: Connection[];
  allNodes: CognitiveNode[];
  onClose: () => void;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  heals: '🟢 Heals',
  conflicts_with: '🔴 Conflicts with',
  corrupts: '🟣 Corrupts',
  serves: '🔵 Serves',
  integrates_with: '⚪ Integrates with',
};

export function InfoPanel({ node, connections, allNodes, onClose }: Props) {
  if (!node) return null;

  const nodeConnections = connections.filter(
    c => c.source === node.id || c.target === node.id
  );

  const getNodeName = (id: string) => {
    const n = allNodes.find(n => n.id === id);
    return n ? n.nameEN : id;
  };

  return (
    <>
      <div className="info-panel-overlay" onClick={onClose} />
      <div className="info-panel">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="panel-header">
          <div className="header-icon">
            <ArchetypeIcon 
              archetype={node.id} 
              color={node.color} 
              size={48} 
            />
          </div>
          <div className="names">
            <h2 className="name-en">{node.nameEN}</h2>
            <p className="name-fa">{node.nameFA}</p>
          </div>
        </div>

        <div className="panel-content">
          <div className="panel-section">
            <h3>Role</h3>
            <p>{node.role}</p>
          </div>

          <div className="panel-section">
            <h3>Strengths</h3>
            <div className="strength-bars">
              {node.strengths.map((strength, i) => (
                <div key={i} className="strength-item">
                  <span className="strength-text">{strength}</span>
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${Math.max(30, 90 - i * 12)}%`,
                        backgroundColor: node.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {node.shadowDistortion && (
            <div className="panel-section shadow-section">
              <h3>⚠️ Shadow Distortion</h3>
              <p className="shadow-text">{node.shadowDistortion}</p>
            </div>
          )}

          {nodeConnections.length > 0 && (
            <div className="panel-section">
              <h3>Relationships</h3>
              <ul className="connections-list">
                {nodeConnections.slice(0, 8).map((conn, i) => {
                  const isSource = conn.source === node.id;
                  const otherId = isSource ? conn.target : conn.source;
                  return (
                    <li key={i}>
                      {RELATIONSHIP_LABELS[conn.type]} {isSource ? '→' : '←'} {getNodeName(otherId)}
                    </li>
                  );
                })}
                {nodeConnections.length > 8 && (
                  <li className="more-connections">+{nodeConnections.length - 8} more...</li>
                )}
              </ul>
            </div>
          )}

          {node.dependencies && (
            <div className="panel-section">
              <h3>Dependencies</h3>
              <ul className="dependencies-list">
                {node.dependencies.map((dep, i) => (
                  <li key={i}>{dep}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
