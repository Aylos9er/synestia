import React, { useCallback, useRef, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  Handle,
  Position,
} from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css'; // Default React Flow styles
import 'react-flow-renderer/dist/theme-default.css'; // Default theme styles
import * as THREE from 'three';
import { useSpring, animated } from 'react-spring';

// Helper component to create the visual style of a "tile" as a React Flow node.
const NodeCard = ({ title, description, children, handles = ['left', 'right'] }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-2xl border-2 border-gray-700 shadow-lg min-w-[250px]">
      {handles.includes('left') && <Handle type="target" position={Position.Left} className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-300" />}
      {handles.includes('right') && <Handle type="source" position={Position.Right} className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-300" />}
      <h3 className="text-xl font-semibold mb-1 text-emerald-300">{title}</h3>
      <p className="text-sm text-gray-400 mb-2">{description}</p>
      <div className="bg-gray-900 rounded-lg p-2 h-48 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// Custom node component for the Main Tile.
const MainTileNode = ({ data }) => (
  <NodeCard title="Main Tile (LLM Placeholder)" description="A central hub for complex data synthesis and output.">
    <MainTile />
  </NodeCard>
);

// Custom node component for the Game of Life tile.
const GameOfLifeNode = ({ data }) => (
  <NodeCard title="Game of Life" description="Cellular automata where patterns are mapped to a 'synesthesia' color scale.">
    <GameOfLifeTile />
  </NodeCard>
);

// Custom node component for the Graph Tile.
const GraphTileNode = ({ data }) => (
  <NodeCard title="Graph Tile" description="Placeholder for a data visualization component.">
    <div className="flex items-center justify-center h-full text-gray-500">
      [Graph Visualization Placeholder]
    </div>
  </NodeCard>
);

// Custom node component for a Data Source.
const DataSourceNode = ({ data }) => (
  <NodeCard title="Data Source" description="A simple data source node to demonstrate data flow." handles={['right']}>
    <div className="flex items-center justify-center h-full text-gray-400 font-bold">
      <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197 3.197m0 0l-3.197-3.197m3.197 3.197v4.125m-9.72-5.474A7.5 7.5 0 0113 7.037m-2.927 0A7.5 7.5 0 0116.5 7.037m-2.927 0h-3.146m3.146 0a7.5 7.5 0 01-5.72 1.488m-5.72-1.488a7.5 7.5 0 01-5.72-1.488M12 18.25V19m0-4.75a7.5 7.5 0 01-5.72-1.488"></path></svg>
    </div>
  </NodeCard>
);

// Main Tile with a simple three.js visualization.
const MainTile = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Setup for three.js
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00FF00,
      flatShading: true,
      shininess: 30
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const light = new THREE.AmbientLight(0x404040, 5);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    camera.position.z = 3;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

// The Game of Life cellular automata tile.
const GameOfLifeTile = () => {
  const canvasRef = useRef(null);
  const [size, setSize] = useState(25);
  const [grid, setGrid] = useState([]);
  const [intervalId, setIntervalId] = useState(null);

  const getColor = (isAlive, age) => {
    if (!isAlive) return '#1f2937';
    const colors = ['#a7f3d0', '#6ee7b7', '#10b981', '#059669', '#047857'];
    const colorIndex = Math.min(Math.floor(age / 5), colors.length - 1);
    return colors[colorIndex];
  };

  const createInitialGrid = () => {
    const newGrid = [];
    for (let i = 0; i < size; i++) {
      newGrid[i] = [];
      for (let j = 0; j < size; j++) {
        newGrid[i][j] = { alive: Math.random() > 0.7, age: 0 };
      }
    }
    return newGrid;
  };

  const getNeighbors = (g, x, y) => {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if (i === 0 && j === 0) continue;
        const col = (x + i + size) % size;
        const row = (y + j + size) % size;
        sum += g[col][row].alive ? 1 : 0;
      }
    }
    return sum;
  };

  const runSimulation = () => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(arr => [...arr]);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const neighbors = getNeighbors(prevGrid, i, j);
          const cell = prevGrid[i][j];
          if (cell.alive && (neighbors < 2 || neighbors > 3)) {
            newGrid[i][j] = { alive: false, age: 0 };
          } else if (!cell.alive && neighbors === 3) {
            newGrid[i][j] = { alive: true, age: 1 };
          } else if (cell.alive) {
            newGrid[i][j] = { ...cell, age: cell.age + 1 };
          }
        }
      }
      return newGrid;
    });
  };

  useEffect(() => {
    setGrid(createInitialGrid());
    const id = setInterval(runSimulation, 200);
    setIntervalId(id);

    return () => {
      clearInterval(id);
    };
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / size;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const cell = grid[i][j];
          ctx.fillStyle = getColor(cell.alive, cell.age);
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    };

    if (grid.length) {
      drawGrid();
    }
  }, [grid, size]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={250}
        height={250}
        className="rounded-lg shadow-inner bg-gray-800"
      />
    </div>
  );
};


// Main React component for the entire Synestia application.
const App = () => {
  // Initial set of nodes and edges to demonstrate the concept.
  const initialNodes = [
    {
      id: '1',
      type: 'dataSource',
      position: { x: 50, y: 150 },
      data: { label: 'Data Source' },
    },
    {
      id: '2',
      type: 'gameOfLife',
      position: { x: 400, y: 50 },
      data: { label: 'Game of Life' },
    },
    {
      id: '3',
      type: 'mainTile',
      position: { x: 800, y: 150 },
      data: { label: 'Main Tile' },
    },
    {
      id: '4',
      type: 'graphTile',
      position: { x: 400, y: 400 },
      data: { label: 'Graph Tile' },
    },
  ];

  const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#10b981' } },
    { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: '#10b981' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#10b981' } },
    { id: 'e4-3', source: '4', target: '3', animated: true, style: { stroke: '#10b981' } },
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => apply
