import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphData, CognitiveNode, RelationshipType } from '../../types/graph.types';

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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        setDimensions({
          width: svgRef.current.parentElement.clientWidth,
          height: svgRef.current.parentElement.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Create container group for zoom
    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Prepare data for simulation
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.connections.map(d => ({
      ...d,
      source: d.source,
      target: d.target,
    }));

    // Force simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.size * 0.6 + 20));

    // Draw connections
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => CONNECTION_COLORS[d.type])
      .attr('stroke-width', d => d.type === 'corrupts' ? 2 : 1.5)
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', d => d.type === 'corrupts' ? '5,5' : 'none');

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d as CognitiveNode);
      });

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
          .attr('r', size + 10)
          .attr('fill', 'none')
          .attr('stroke', '#66D3FA')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.5)
          .attr('class', 'glow-ring');
      }
    });

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

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, any, any>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, any, any>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, any, any>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Breathing animation
    const breathe = () => {
      node.selectAll('circle, polygon')
        .transition()
        .duration(2000)
        .attr('transform', 'scale(1.05)')
        .transition()
        .duration(2000)
        .attr('transform', 'scale(1)')
        .on('end', breathe);
    };
    breathe();

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, onNodeClick]);

  return (
    <svg 
      ref={svgRef} 
      width="100%" 
      height="100%"
      className="cognitive-graph"
    />
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
