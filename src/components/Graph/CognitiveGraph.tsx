import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GraphData, CognitiveNode, RelationshipType } from '../../types/graph.types';

interface Props {
  data: GraphData;
  onNodeClick: (node: CognitiveNode) => void;
  selectedNodeId?: string;
  highlightedNodeIds?: string[];
}

const CONNECTION_COLORS: Record<RelationshipType, string> = {
  heals: '#009E60',
  conflicts_with: '#E63946',
  corrupts: '#7F4FC9',
  serves: 'rgba(102, 211, 250, 0.5)',
  integrates_with: 'rgba(255, 255, 255, 0.4)',
};

export function CognitiveGraph({ data, onNodeClick, highlightedNodeIds = [] }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<d3.Selection<SVGGElement, any, SVGGElement, unknown> | null>(null);
  const linksRef = useRef<d3.Selection<SVGLineElement, any, SVGGElement, unknown> | null>(null);

  // Update highlighting when search changes
  useEffect(() => {
    if (!nodesRef.current || !linksRef.current) return;

    const hasHighlight = highlightedNodeIds.length > 0;

    nodesRef.current
      .attr('opacity', (d: any) => {
        if (!hasHighlight) return 1;
        return highlightedNodeIds.includes(d.id) ? 1 : 0.15;
      });

    linksRef.current
      .attr('opacity', (d: any) => {
        if (!hasHighlight) return 0.7;
        const sourceMatch = highlightedNodeIds.includes(d.source.id || d.source);
        const targetMatch = highlightedNodeIds.includes(d.target.id || d.target);
        return (sourceMatch || targetMatch) ? 0.7 : 0.05;
      });

  }, [highlightedNodeIds]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    if (width === 0 || height === 0) return;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    svg.selectAll('*').remove();

    // Add filters for glow effects
    const defs = svg.append('defs');
    
    // Standard glow filter
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-100%')
      .attr('y', '-100%')
      .attr('width', '300%')
      .attr('height', '300%');
    
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Strong awareness glow filter
    const awarenessGlow = defs.append('filter')
      .attr('id', 'awareness-glow')
      .attr('x', '-200%')
      .attr('y', '-200%')
      .attr('width', '500%')
      .attr('height', '500%');
    
    awarenessGlow.append('feGaussianBlur')
      .attr('stdDeviation', '15')
      .attr('result', 'blur1');
    
    awarenessGlow.append('feGaussianBlur')
      .attr('stdDeviation', '8')
      .attr('result', 'blur2');

    const awMerge = awarenessGlow.append('feMerge');
    awMerge.append('feMergeNode').attr('in', 'blur1');
    awMerge.append('feMergeNode').attr('in', 'blur2');
    awMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Radial gradient for awareness
    const awarenessGradient = defs.append('radialGradient')
      .attr('id', 'awareness-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    
    awarenessGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#FFFFFF')
      .attr('stop-opacity', '1');
    
    awarenessGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#66D3FA')
      .attr('stop-opacity', '0.8');
    
    awarenessGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#007ACC')
      .attr('stop-opacity', '0.3');

    // Create container group for zoom
    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Responsive initial zoom
    const isMobile = width < 768;
    const initialScale = isMobile ? 0.4 : 0.55;
    const initialX = isMobile ? width * 0.3 : width / 4;
    const initialY = isMobile ? height * 0.2 : height / 4;

    const initialTransform = d3.zoomIdentity
      .translate(initialX, initialY)
      .scale(initialScale);
    svg.call(zoom.transform, initialTransform);

    // Modify sizes for awareness node
    const getNodeSize = (d: any) => {
      if (d.id === 'awareness-os') return 140; // Much larger
      return d.size;
    };

    // Prepare data for simulation
    const nodes = data.nodes.map(d => ({ 
      ...d,
      x: width / 2 + (Math.random() - 0.5) * 400,
      y: height / 2 + (Math.random() - 0.5) * 400
    }));
    
    const links = data.connections.map(d => ({
      ...d,
      source: d.source,
      target: d.target,
    }));

    // Force simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(180)
        .strength(0.3)
      )
      .force('charge', d3.forceManyBody()
        .strength(-1200)
        .distanceMax(600)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius((d: any) => getNodeSize(d) * 0.6 + 30)
        .strength(0.7)
      )
      .force('x', d3.forceX(width / 2).strength(0.02))
      .force('y', d3.forceY(height / 2).strength(0.02))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    // Draw connections with glow
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => CONNECTION_COLORS[d.type])
      .attr('stroke-width', d => d.type === 'corrupts' ? 2.5 : 2)
      .attr('stroke-opacity', 0.7)
      .attr('stroke-dasharray', d => d.type === 'corrupts' ? '5,5' : 'none')
      .style('filter', 'url(#glow)');

    linksRef.current = link as any;

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    nodesRef.current = node as any;

    // Node shapes
    node.each(function(d: any) {
      const el = d3.select(this);
      const size = getNodeSize(d) * 0.5;
      const isAwareness = d.id === 'awareness-os';

      // Special treatment for Awareness OS
      if (isAwareness) {
        // Outer glow rings
        el.append('circle')
          .attr('r', size + 40)
          .attr('fill', 'none')
          .attr('stroke', '#66D3FA')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.15)
          .attr('class', 'awareness-ring-3');

        el.append('circle')
          .attr('r', size + 25)
          .attr('fill', 'none')
          .attr('stroke', '#66D3FA')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.25)
          .attr('class', 'awareness-ring-2');

        el.append('circle')
          .attr('r', size + 12)
          .attr('fill', 'none')
          .attr('stroke', '#66D3FA')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.4)
          .attr('class', 'awareness-ring-1');

        // Main glowing circle
        el.append('circle')
          .attr('r', size)
          .attr('fill', 'url(#awareness-gradient)')
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 3)
          .style('filter', 'url(#awareness-glow)');

        // Inner bright core
        el.append('circle')
          .attr('r', size * 0.4)
          .attr('fill', '#FFFFFF')
          .attr('opacity', 0.9);

      } else if (d.shape === 'hexagon') {
        const hexPoints = getHexagonPoints(size);
        el.append('polygon')
          .attr('points', hexPoints)
          .attr('fill', `${d.color}25`)
          .attr('stroke', d.color)
          .attr('stroke-width', 2)
          .style('filter', 'url(#glow)');
      } else if (d.shape === 'diamond') {
        el.append('polygon')
          .attr('points', `0,${-size} ${size},0 0,${size} ${-size},0`)
          .attr('fill', `${d.color}25`)
          .attr('stroke', d.color)
          .attr('stroke-width', 2)
          .style('filter', 'url(#glow)');
      } else {
        el.append('circle')
          .attr('r', size)
          .attr('fill', `${d.color}25`)
          .attr('stroke', d.color)
          .attr('stroke-width', 2)
          .style('filter', 'url(#glow)');
      }
    });

    // Add invisible larger hit area
    node.append('circle')
      .attr('r', (d: any) => getNodeSize(d) * 0.6 + 15)
      .attr('fill', 'transparent')
      .attr('stroke', 'none')
      .style('cursor', 'pointer');

    // Labels
    node.append('text')
      .attr('class', 'label-en')
      .attr('dy', (d: any) => getNodeSize(d) * 0.5 + 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#FFFFFF')
      .attr('font-size', (d: any) => d.id === 'awareness-os' ? '14px' : '12px')
      .attr('font-family', 'Poppins, sans-serif')
      .attr('font-weight', '600')
      .text((d: any) => d.nameEN);

    node.append('text')
      .attr('class', 'label-fa')
      .attr('dy', (d: any) => getNodeSize(d) * 0.5 + 42)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.6)')
      .attr('font-size', (d: any) => d.id === 'awareness-os' ? '13px' : '11px')
      .attr('font-family', 'Vazirmatn, sans-serif')
      .text((d: any) => d.nameFA);

    // Click handler
    node.on('click', (event, d) => {
      event.stopPropagation();
      onNodeClick(d as CognitiveNode);
    });

    // Drag handlers
    node.call(d3.drag<SVGGElement, any>()
      .on('start', function(event, d) {
        if (!event.active) simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      })
    );

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    simulation.alpha(1).restart();

    // Pulsing animation for awareness rings
    const pulseRings = () => {
      g.selectAll('.awareness-ring-1, .awareness-ring-2, .awareness-ring-3')
        .transition()
        .duration(2000)
        .attr('stroke-opacity', function() {
          const current = parseFloat(d3.select(this).attr('stroke-opacity'));
          return current * 1.5;
        })
        .transition()
        .duration(2000)
        .attr('stroke-opacity', function() {
          const el = d3.select(this);
          if (el.classed('awareness-ring-1')) return 0.4;
          if (el.classed('awareness-ring-2')) return 0.25;
          return 0.15;
        })
        .on('end', function() {
          if (d3.select(this).classed('awareness-ring-1')) {
            pulseRings();
          }
        });
    };
    pulseRings();

    setTimeout(() => {
      simulation.alphaTarget(0);
    }, 3000);

    return () => {
      simulation.stop();
    };
  }, [data, onNodeClick]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <svg 
        ref={svgRef} 
        className="cognitive-graph"
        style={{ display: 'block' }}
      />
    </div>
  );
}

function getHexagonPoints(size: number): string {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push([
      size * Math.cos(angle),
      size * Math.sin(angle)
    ]);
  }
  return points.map(p => p.join(',')).join(' ');
}
