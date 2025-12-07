import { useState } from 'react';
import { CognitiveNode } from '../../types/graph.types';
import { NodeIcon } from '../Icons/NodeIcon';
import './MobileView.css';

interface Props {
  nodes: CognitiveNode[];
  onNodeSelect: (node: CognitiveNode) => void;
}

type FilterLevel = 'all' | 'awareness' | 'server' | 'king' | 'hero' | 'shadow' | 'saboteur';

const LEVEL_LABELS: Record<FilterLevel, string> = {
  all: 'All',
  awareness: 'Awareness',
  server: 'Server Layer',
  king: 'Kings',
  hero: 'Heroes',
  shadow: 'Shadows',
  saboteur: 'Saboteurs',
};

export function MobileView({ nodes, onNodeSelect }: Props) {
  const [filter, setFilter] = useState<FilterLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = nodes.filter(node => {
    const matchesFilter = filter === 'all' || node.level === filter;
    const matchesSearch = 
      node.nameEN.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.nameFA.includes(searchQuery) ||
      node.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    const level = node.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(node);
    return acc;
  }, {} as Record<string, CognitiveNode[]>);

  const levelOrder = ['awareness', 'server', 'king', 'hero', 'shadow', 'saboteur'];

  return (
    <div className="mobile-view">
      <div className="mobile-header">
        <h1 className="mobile-title">Shahnameh OS</h1>
        <p className="mobile-subtitle">سیستم عامل شناختی</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search characters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-tabs">
        {(Object.keys(LEVEL_LABELS) as FilterLevel[]).map(level => (
          <button
            key={level}
            className={`filter-tab ${filter === level ? 'active' : ''}`}
            onClick={() => setFilter(level)}
          >
            {LEVEL_LABELS[level]}
          </button>
        ))}
      </div>

      <div className="nodes-list">
        {levelOrder.map(level => {
          const levelNodes = groupedNodes[level];
          if (!levelNodes || levelNodes.length === 0) return null;

          return (
            <div key={level} className="level-group">
              <h2 className="level-title">{LEVEL_LABELS[level as FilterLevel] || level}</h2>
              
              {levelNodes.map(node => (
                <button
                  key={node.id}
                  className="node-card"
                  onClick={() => onNodeSelect(node)}
                >
                  <div className="card-icon" style={{ backgroundColor: `${node.color}20` }}>
                    <NodeIcon shape={node.shape} color={node.color} size={32} />
                  </div>
                  
                  <div className="card-content">
                    <div className="card-names">
                      <span className="card-name-en">{node.nameEN}</span>
                      <span className="card-name-fa">{node.nameFA}</span>
                    </div>
                    <p className="card-role">{node.role.split('—')[0]}</p>
                  </div>
                  
                  <div className="card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
