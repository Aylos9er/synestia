import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
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
import { useTheme } from './ThemeContext';
import ThemeToggle from './ThemeToggle';

// Helper component to create the visual style of a "tile" as a React Flow node.
const NodeCard = ({ title, description, children, handles = ['left', 'right'] }) => {
  const { theme, THEMES } = useTheme();
  
  const getNodeCardClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "bg-white p-4 rounded-2xl border-2 border-gray-300 shadow-lg min-w-[250px] text-gray-900";
      case THEMES.WIN95:
        return "win95-window p-2 min-w-[250px] bg-gray-300 text-black";
      default:
        return "bg-gray-800 p-4 rounded-2xl border-2 border-gray-700 shadow-lg min-w-[250px]";
    }
  };

  const getHandleClasses = (side) => {
    const baseClasses = "w-4 h-4 rounded-full border-2";
    switch (theme) {
      case THEMES.LIGHT:
        return side === 'left' 
          ? `${baseClasses} bg-green-500 border-green-300`
          : `${baseClasses} bg-blue-500 border-blue-300`;
      case THEMES.WIN95:
        return side === 'left'
          ? `${baseClasses} bg-red-500 border-red-700`
          : `${baseClasses} bg-blue-600 border-blue-800`;
      default:
        return side === 'left'
          ? `${baseClasses} bg-emerald-500 border-emerald-300`
          : `${baseClasses} bg-blue-500 border-blue-300`;
    }
  };

  const getTitleClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "text-xl font-semibold mb-1 text-gray-900";
      case THEMES.WIN95:
        return "text-sm font-bold mb-1 text-black bg-blue-600 text-white px-2 py-1 win95-title-bar";
      default:
        return "text-xl font-semibold mb-1 text-emerald-300";
    }
  };

  const getDescriptionClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "text-sm text-gray-600 mb-2";
      case THEMES.WIN95:
        return "text-xs text-black mb-1 px-2";
      default:
        return "text-sm text-gray-400 mb-2";
    }
  };

  const getContentClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "bg-gray-100 rounded-lg p-2 h-48 overflow-hidden";
      case THEMES.WIN95:
        return "win95-inset p-1 h-48 overflow-hidden bg-white";
      default:
        return "bg-gray-900 rounded-lg p-2 h-48 overflow-hidden";
    }
  };

  return (
    <div className={getNodeCardClasses()}>
      {handles.includes('left') && <Handle type="target" position={Position.Left} className={getHandleClasses('left')} />}
      {handles.includes('right') && <Handle type="source" position={Position.Right} className={getHandleClasses('right')} />}
      <h3 className={getTitleClasses()}>{title}</h3>
      <p className={getDescriptionClasses()}>{description}</p>
      <div className={getContentClasses()}>
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
const GraphTileNode = ({ data }) => {
  const { theme, THEMES } = useTheme();
  
  const getPlaceholderClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "flex items-center justify-center h-full text-gray-600";
      case THEMES.WIN95:
        return "flex items-center justify-center h-full text-black text-xs";
      default:
        return "flex items-center justify-center h-full text-gray-500";
    }
  };

  return (
    <NodeCard title="Graph Tile" description="Placeholder for a data visualization component.">
      <div className={getPlaceholderClasses()}>
        [Graph Visualization Placeholder]
      </div>
    </NodeCard>
  );
};

// Custom node component for a Data Source.
const DataSourceNode = ({ data }) => {
  const { theme, THEMES } = useTheme();
  
  const getIconClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "w-10 h-10 text-blue-600";
      case THEMES.WIN95:
        return "w-8 h-8 text-blue-800";
      default:
        return "w-10 h-10 text-emerald-500";
    }
  };

  const getContainerClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "flex items-center justify-center h-full text-gray-700 font-bold";
      case THEMES.WIN95:
        return "flex items-center justify-center h-full text-black font-bold text-xs";
      default:
        return "flex items-center justify-center h-full text-gray-400 font-bold";
    }
  };

  return (
    <NodeCard title="Data Source" description="A simple data source node to demonstrate data flow." handles={['right']}>
      <div className={getContainerClasses()}>
        <svg className={getIconClasses()} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197 3.197m0 0l-3.197-3.197m3.197 3.197v4.125m-9.72-5.474A7.5 7.5 0 0113 7.037m-2.927 0A7.5 7.5 0 0116.5 7.037m-2.927 0h-3.146m3.146 0a7.5 7.5 0 01-5.72 1.488m-5.72-1.488a7.5 7.5 0 01-5.72-1.488M12 18.25V19m0-4.75a7.5 7.5 0 01-5.72-1.488"></path></svg>
      </div>
    </NodeCard>
  );
};

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
  const { theme, THEMES } = useTheme();

  const getColor = (isAlive, age) => {
    if (!isAlive) {
      switch (theme) {
        case THEMES.LIGHT:
          return '#f3f4f6';
        case THEMES.WIN95:
          return '#c0c0c0';
        default:
          return '#1f2937';
      }
    }
    
    switch (theme) {
      case THEMES.LIGHT:
        const lightColors = ['#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed'];
        const lightColorIndex = Math.min(Math.floor(age / 5), lightColors.length - 1);
        return lightColors[lightColorIndex];
      case THEMES.WIN95:
        const win95Colors = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff'];
        const win95ColorIndex = Math.min(Math.floor(age / 5), win95Colors.length - 1);
        return win95Colors[win95ColorIndex];
      default:
        const colors = ['#a7f3d0', '#6ee7b7', '#10b981', '#059669', '#047857'];
        const colorIndex = Math.min(Math.floor(age / 5), colors.length - 1);
        return colors[colorIndex];
    }
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
  }, [grid, size, theme]);

  const getCanvasClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "rounded-lg shadow-inner bg-gray-100";
      case THEMES.WIN95:
        return "border-2 border-inset bg-white";
      default:
        return "rounded-lg shadow-inner bg-gray-800";
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={250}
        height={250}
        className={getCanvasClasses()}
      />
    </div>
  );
};


// Main React component for the entire Synestia application.
const App = () => {
  const { theme, THEMES } = useTheme();
  
  const getEdgeColor = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return '#3b82f6';
      case THEMES.WIN95:
        return '#000080';
      default:
        return '#10b981';
    }
  };

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

  // Create edges with dynamic color based on current theme
  const createEdges = () => {
    const edgeColor = getEdgeColor();
    return [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: edgeColor } },
      { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: edgeColor } },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: edgeColor } },
      { id: 'e4-3', source: '4', target: '3', animated: true, style: { stroke: edgeColor } },
    ];
  };

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(createEdges());

  // Update edge colors when theme changes
  useEffect(() => {
    setEdges(createEdges());
  }, [theme]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // Define custom node types - memoize to prevent recreation
  const nodeTypes = useMemo(() => ({
    dataSource: DataSourceNode,
    gameOfLife: GameOfLifeNode,
    mainTile: MainTileNode,
    graphTile: GraphTileNode,
  }), []);

  const getBackgroundColor = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return '#f8fafc';
      case THEMES.WIN95:
        return '#008080';
      default:
        return '#1f2937';
    }
  };

  const getMainClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "w-screen h-screen bg-gray-50";
      case THEMES.WIN95:
        return "w-screen h-screen";
      default:
        return "w-screen h-screen bg-gray-900";
    }
  };

  const getReactFlowClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "bg-gray-50";
      case THEMES.WIN95:
        return "";
      default:
        return "bg-gray-900";
    }
  };

  const getControlsClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "bg-white border-gray-300";
      case THEMES.WIN95:
        return "win95-outset bg-gray-300";
      default:
        return "bg-gray-800 border-gray-700";
    }
  };

  const getMiniMapClasses = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "bg-white border border-gray-300";
      case THEMES.WIN95:
        return "win95-outset bg-gray-300 border border-gray-500";
      default:
        return "bg-gray-800 border border-gray-700";
    }
  };

  const getMiniMapNodeColor = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "#e5e7eb";
      case THEMES.WIN95:
        return "#c0c0c0";
      default:
        return "#374151";
    }
  };

  const getMiniMapNodeStrokeColor = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return "#9ca3af";
      case THEMES.WIN95:
        return "#808080";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className={getMainClasses()}>
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className={getReactFlowClasses()}
      >
        <Background color={getBackgroundColor()} />
        <Controls className={getControlsClasses()} />
        <MiniMap
          nodeColor={getMiniMapNodeColor()}
          nodeStrokeColor={getMiniMapNodeStrokeColor()}
          nodeBorderRadius={8}
          maskColor="rgba(0, 0, 0, 0.2)"
          className={getMiniMapClasses()}
        />
      </ReactFlow>
    </div>
  );
};

export default App;