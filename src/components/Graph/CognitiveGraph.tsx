import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GraphData, CognitiveNode, RelationshipType } from '../../types/graph.types';

interface Props {
  data: GraphData;
  onNodeClick: (node: CognitiveNode) => void;
  selectedNodeId?: string;
}

const CONNECTION_COLORS: Record<RelationshipType, string> = {
  heals: '#009E60',
  conflicts_with: '#E63946',
  corrupts: '#7F4FC9',
  serves: 'rgba(102, 211, 250, 0.4)',
  integrates_with: 'rgba(255, 255, 255, 0.3)',
};

export function CognitiveGraph({ data, onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

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

    // Create container group for zoom
    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Center the view initially
    const initialTransform = d3.zoomIdentity
      .translate(width / 4, height / 4)
      .scale(0.6);
    svg.call(zoom.transform, initialTransform);

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
        .radius((d: any) => d.size * 0.6 + 30)
        .strength(0.7)
      )
      .force('x', d3.forceX(width / 2).strength(0.02))
      .force('y', d3.forceY(height / 2).strength(0.02))
      .alphaDecay(0.02)  // Slower decay = smoother settling
      .velocityDecay(0.4);  // Higher = more damping = less jitter

    simulationRef.current = simulation;

    // Draw connections
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => CONNECTION_COLORS[d.type])
      .attr('stroke-width', d => d.type === 'corrupts' ? 2.5 : 1.5)
      .attr('stroke-opacity', 0.7)
      .attr('stroke-dasharray', d => d.type === 'corrupts' ? '5,5' : 'none');

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // Node shapes
    node.each(function(d: any) {
      const el = d3.select(this);
      const size = d.size * 0.5;

      if (d.shape === 'hexagon') {
        const hexPoints = getHexagonPoints(size);
        el.append('polygon')
          .attr('points', hexPoints)
          .attr('fill', d.level === 'awareness' ? '#0D1326' : `${d.color}20`)
          .attr('stroke', d.color)
          .attr('stroke-width', 2);
      } else if (d.shape === 'diamond') {
        el.append('polygon')
          .attr('points', `0,${-size} ${size},0 0,${size} ${-size},0`)
          .attr('fill', `${d.color}20`)
          .attr('stroke', d.color)
          .attr('stroke-width', 2);
      } else {
        el.append('circle')
          .attr('r', size)
          .attr('fill', `${d.color}20`)
          .attr('stroke', d.color)
          .attr('stroke-width', 2);
      }

      // Glow effect for awareness node
      if (d.level === 'awareness') {
        el.append('circle')
          .attr('r', size + 15)
          .attr('fill', 'none')
          .attr('stroke', '#66D3FA')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.5)
          .attr('class', 'glow-ring');
      }
    });

    // Add invisible larger hit area for easier clicking
    node.append('circle')
      .attr('r', (d: any) => d.size * 0.6 + 10)
      .attr('fill', 'transparent')
      .attr('stroke', 'none')
      .style('cursor', 'pointer');

    // Labels
    node.append('text')
      .attr('class', 'label-en')
      .attr('dy', (d: any) => d.size * 0.5 + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#FFFFFF')
      .attr('font-size', '12px')
      .attr('font-family', 'Poppins, sans-serif')
      .attr('font-weight', '600')
      .text((d: any) => d.nameEN);

    node.append('text')
      .attr('class', 'label-fa')
      .attr('dy', (d: any) => d.size * 0.5 + 36)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.6)')
      .attr('font-size', '11px')
      .attr('font-family', 'Vazirmatn, sans-serif')
      .text((d: any) => d.nameFA);

    // Click handler
    node.on('click', (event, d) => {
      event.stopPropagation();
      onNodeClick(d as CognitiveNode);
    });

    // Drag handlers - fixed position during drag
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

    // Let simulation run and settle
    simulation.alpha(1).restart();

    // Stop simulation after settling to prevent ongoing jitter
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
