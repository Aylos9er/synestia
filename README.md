# synestia

# Synestia Simulation

A node-based proof of concept for a data flow visualization and simulation tool. This application uses `react-flow-renderer` to display a directed graph where different "tiles" or nodes process and pass data to a central synthesis hub.

## Features

- **Interactive Node Graph:** Visualize data flow with a draggable, zoomable, and interactive canvas powered by `react-flow-renderer`.
- **Game of Life Simulation:** A dynamic cellular automata tile where cell patterns are mapped to a changing color palette.
- **3D Visualization:** A central "Main Tile" featuring a rotating icosahedron rendered with `three.js`, serving as a visual metaphor for complex data synthesis.
- **Responsive Design:** The interface is built with Tailwind CSS for a clean and modern look that adapts to different screen sizes.

## Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v14 or higher is recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repository to your local machine.
    ```sh
    git clone [https://github.com/aylos9er/synestia-simulation.git](https://github.com/aylos9er/synestia-simulation.git)
    cd synestia-simulation
    ```
2.  Install the project dependencies.
    ```sh
    npm install
    # or
    yarn install
    ```
3.  Start the development server.
    ```sh
    npm start
    # or
    yarn start
    ```
4.  Open your web browser and navigate to `http://localhost:3000` to see the application.

## Technology Stack

- **React:** The core JavaScript library for building the UI.
- **`react-flow-renderer`:** For creating the interactive node-based graph.
- **`three.js`:** For 3D visualization within the Main Tile.
- **Tailwind CSS:** For all styling and responsive design.
