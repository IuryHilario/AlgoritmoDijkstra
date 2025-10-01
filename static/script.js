// ===== CONFIGURAÇÕES E CONSTANTES =====
const CONFIG = {
    CANVAS: {
        MARGIN: 60,
        VERTEX_RADIUS: {
            MOBILE: 18,
            DESKTOP: 20
        },
        HOVER_EXTRA_RADIUS: 8,
        EDGE_WIDTH: {
            NORMAL: 2,
            HIGHLIGHTED: 4
        },
        ARROW_SIZE: {
            NORMAL: 10,
            HIGHLIGHTED: 14,
            BIDIRECTIONAL: 8
        },
        FONT_SIZE: {
            VERTEX_MOBILE: 12,
            VERTEX_DESKTOP: 14,
            WEIGHT_MOBILE: 11,
            WEIGHT_DESKTOP: 13
        }
    },
    GRAPH: {
        MIN_VERTICES: 2,
        MAX_VERTICES: 20,
        MIN_WEIGHT: 1,
        MAX_WEIGHT: 9,
        DENSITY: {
            MIN_EXTRA_EDGES: 0.1,
            MAX_EXTRA_EDGES: 0.4
        }
    },
    COLORS: {
        VERTEX: {
            NORMAL: "#3b82f6",
            ORIGIN: "#10b981",
            DESTINATION: "#ef4444",
            PATH: "#fbbf24",
            SELECTED: "#f59e0b",
            HOVERED: "#60a5fa"
        },
        EDGE: {
            NORMAL: "#64748b",
            PATH: "#fbbf24"
        },
        HOVER_AURA: "rgba(251, 191, 36, 0.3)",
        SELECTED_AURA: "rgba(251, 191, 36, 0.5)"
    },
    MODES: {
        ADD_EDGE: 'addEdge',
        FIND_PATH: 'findPath'
    },
    BREAKPOINT: 768
};

// ===== ESTADO GLOBAL =====
const state = {
    graph: [],
    numVertices: 0,
    vertexLabels: [],
    positions: [],
    lastPath: [],
    currentMode: null,
    selectedVertices: [],
    hoveredVertex: -1
};

// ===== ELEMENTOS DOM =====
const elements = {
    canvas: document.getElementById("graphCanvas"),
    ctx: null,
    modeStatus: document.getElementById("modeStatus"),
    addEdgeModeBtn: document.getElementById("addEdgeMode"),
    findPathModeBtn: document.getElementById("findPathMode")
};

// Inicializar contexto do canvas
elements.ctx = elements.canvas.getContext("2d");

// ===== FUNÇÕES UTILITÁRIAS =====
const utils = {
    // Gera labels numéricos para vértices
    generateVertexLabels: (count) =>
        Array.from({ length: count }, (_, i) => (i + 1).toString()),

    // Verifica se é dispositivo móvel
    isMobile: () => window.innerWidth < CONFIG.BREAKPOINT,

    // Obtém raio do vértice baseado no dispositivo
    getVertexRadius: () =>
        utils.isMobile() ? CONFIG.CANVAS.VERTEX_RADIUS.MOBILE : CONFIG.CANVAS.VERTEX_RADIUS.DESKTOP,

    // Obtém tamanho da fonte baseado no tipo e dispositivo
    getFontSize: (type) => {
        const sizes = CONFIG.CANVAS.FONT_SIZE;
        return utils.isMobile() ? sizes[`${type}_MOBILE`] : sizes[`${type}_DESKTOP`];
    },

    // Valida número de vértices
    isValidVertexCount: (count) =>
        !isNaN(count) && count >= CONFIG.GRAPH.MIN_VERTICES && count <= CONFIG.GRAPH.MAX_VERTICES,

    // Valida peso da aresta
    isValidWeight: (weight) =>
        !isNaN(weight) && weight > 0,

    // Gera peso aleatório
    getRandomWeight: () =>
        Math.floor(Math.random() * CONFIG.GRAPH.MAX_WEIGHT) + CONFIG.GRAPH.MIN_WEIGHT,

    // Embaralha array (Fisher-Yates)
    shuffleArray: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Verifica se o grafo foi criado
    isGraphCreated: () => state.numVertices > 0,

    // Calcula distância entre dois pontos
    calculateDistance: (x1, y1, x2, y2) =>
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),

    // Converte coordenadas do mouse para canvas
    getCanvasCoordinates: (e) => {
        const rect = elements.canvas.getBoundingClientRect();
        const scaleX = elements.canvas.width / rect.width;
        const scaleY = elements.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
};

// ===== GERENCIAMENTO DE ESTADO =====
const stateManager = {
    // Reseta o modo atual
    resetMode: () => {
        state.currentMode = null;
        state.selectedVertices = [];
        state.hoveredVertex = -1;
        ui.updateModeStatus();
        ui.updateButtonStates();
        renderer.drawGraph();
    },

    // Limpa o grafo atual
    clearGraph: () => {
        if (utils.isGraphCreated()) {
            state.graph = Array.from({ length: state.numVertices }, () =>
                Array(state.numVertices).fill(0));
            state.lastPath = [];
            stateManager.resetMode();
            ui.renderMatrix();
            renderer.drawGraph();
            ui.clearResults();
        }
    },

    // Inicializa novo grafo
    initializeGraph: (vertices) => {
        state.numVertices = vertices;
        state.vertexLabels = utils.generateVertexLabels(vertices);
        state.graph = Array.from({ length: vertices }, () => Array(vertices).fill(0));
        state.lastPath = [];
        geometry.calculateVertexPositions();
        stateManager.resetMode();
        ui.renderMatrix();
        renderer.drawGraph();
        ui.clearResults();
    }
};

// ===== INTERFACE E UI =====
const ui = {
    // Atualiza o status do modo atual
    updateModeStatus: () => {
        if (!elements.modeStatus) return;

        const messages = {
            noGraph: 'Crie um grafo para começar',
            noMode: 'Clique em "Adicionar Arestas" ou "Encontrar Caminho"',
            addEdge: {
                origin: '🎯 Clique no vértice de ORIGEM da aresta',
                destination: (vertex) => `✅ Origem: ${state.vertexLabels[vertex]} | 🎯 Clique no vértice de DESTINO`
            },
            findPath: {
                start: '🎯 Clique no vértice de INÍCIO do caminho',
                end: (vertex) => `✅ Início: ${state.vertexLabels[vertex]} | 🎯 Clique no vértice de DESTINO`
            }
        };

        let text = '';
        let className = 'mode-status';

        if (!utils.isGraphCreated()) {
            text = messages.noGraph;
        } else if (!state.currentMode) {
            text = messages.noMode;
        } else {
            className += ' active';
            const selectedCount = state.selectedVertices.length;

            if (state.currentMode === CONFIG.MODES.ADD_EDGE) {
                text = selectedCount === 0 ?
                    messages.addEdge.origin :
                    messages.addEdge.destination(state.selectedVertices[0]);
            } else if (state.currentMode === CONFIG.MODES.FIND_PATH) {
                text = selectedCount === 0 ?
                    messages.findPath.start :
                    messages.findPath.end(state.selectedVertices[0]);
            }
        }

        elements.modeStatus.textContent = text;
        elements.modeStatus.className = className;
    },

    // Atualiza estado visual dos botões
    updateButtonStates: () => {
        const updateButton = (button, mode, baseClass) => {
            if (button) {
                const isActive = state.currentMode === mode;
                button.className = `${baseClass}${isActive ? ' active' : ''}`;
            }
        };

        updateButton(elements.addEdgeModeBtn, CONFIG.MODES.ADD_EDGE, 'btn btn-success btn-large');
        updateButton(elements.findPathModeBtn, CONFIG.MODES.FIND_PATH, 'btn btn-primary btn-large');
    },

    // Renderiza matriz de adjacência
    renderMatrix: () => {
        const matrixDiv = document.getElementById("adjacencyMatrix");
        matrixDiv.innerHTML = "";

        if (!utils.isGraphCreated()) {
            matrixDiv.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Crie um grafo para ver a matriz</p>';
            return;
        }

        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'matrix-scroll-container';

        let table = '<table class="matrix-table"><thead><tr><th></th>';

        // Cabeçalho
        for (let i = 0; i < state.numVertices; i++) {
            table += `<th>${state.vertexLabels[i]}</th>`;
        }
        table += '</tr></thead><tbody>';

        // Corpo da tabela
        for (let i = 0; i < state.numVertices; i++) {
            table += `<tr><th>${state.vertexLabels[i]}</th>`;
            for (let j = 0; j < state.numVertices; j++) {
                const value = state.graph[i][j];
                const cellClass = value > 0 ? 'cell-edge' : 'cell-empty';
                table += `<td class="${cellClass}">${value || '-'}</td>`;
            }
            table += "</tr>";
        }

        table += '</tbody></table>';
        scrollContainer.innerHTML = table;
        matrixDiv.appendChild(scrollContainer);
    },

    // Exibe resultado do Dijkstra
    showResult: (origem, destino, distancia, caminho) => {
        const resultsDiv = document.getElementById("results");

        if (distancia === null || caminho.length === 0) {
            resultsDiv.innerHTML = `
                <div class="result-item">
                    <p><strong>❌ Caminho não encontrado</strong></p>
                    <p>Não existe caminho de <span class="vertex-label">${state.vertexLabels[origem]}</span>
                    até <span class="vertex-label">${state.vertexLabels[destino]}</span></p>
                    <p><em>Verifique se os vértices estão conectados.</em></p>
                </div>`;
        } else {
            resultsDiv.innerHTML = `
                <div class="result-item">
                    <p><strong>🎉 Caminho Encontrado!</strong></p>
                    <p><strong>📏 Distância mínima:</strong> <span class="distance-value">${distancia}</span></p>
                    <p><strong>🛤️ Caminho:</strong></p>
                    <div class="path-display">${caminho.join(" → ")}</div>
                    <p><strong>📊 Estatísticas:</strong></p>
                    <p>• Número de saltos: ${caminho.length - 1}</p>
                    <p>• Vértices visitados: ${caminho.length}</p>
                </div>`;
        }
    },

    // Exibe mensagem de sucesso
    showSuccessMessage: (message) => {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `
            <div class="result-item">
                <p>${message}</p>
                <p><em>Continue adicionando arestas ou busque um caminho.</em></p>
            </div>`;
    },

    // Limpa área de resultados
    clearResults: () => {
        document.getElementById("results").innerHTML = "";
    }
};

// ===== GEOMETRIA E POSICIONAMENTO =====
const geometry = {
    // Calcula posições dos vértices em círculo
    calculateVertexPositions: () => {
        state.positions = [];
        if (!utils.isGraphCreated()) return;

        const centerX = elements.canvas.width / 2;
        const centerY = elements.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - CONFIG.CANVAS.MARGIN;

        for (let i = 0; i < state.numVertices; i++) {
            const angle = (2 * Math.PI * i) / state.numVertices - Math.PI / 2;
            state.positions.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        }
    },

    // Encontra vértice nas coordenadas especificadas
    getVertexAt: (x, y) => {
        const baseRadius = utils.getVertexRadius();
        const hitRadius = baseRadius + 5;

        for (let i = 0; i < state.numVertices; i++) {
            const pos = state.positions[i];
            const distance = utils.calculateDistance(x, y, pos.x, pos.y);
            if (distance <= hitRadius) return i;
        }
        return -1;
    }
};

// ===== SISTEMA DE EVENTOS =====
const eventHandlers = {
    // Cria novo grafo
    createGraph: () => {
        const vertices = parseInt(document.getElementById("vertices").value);
        if (!utils.isValidVertexCount(vertices)) {
            alert(`Digite um número válido de vértices (${CONFIG.GRAPH.MIN_VERTICES} a ${CONFIG.GRAPH.MAX_VERTICES}).`);
            return;
        }
        stateManager.initializeGraph(vertices);
    },

    // Gera grafo aleatório
    generateRandomGraph: () => {
        if (!utils.isGraphCreated()) {
            alert("Crie um grafo primeiro!");
            return;
        }

        graphGenerator.createRandomGraph();
        stateManager.resetMode();
        ui.renderMatrix();
        renderer.drawGraph();
        ui.clearResults();
    },

    // Alterna modo de adicionar arestas
    toggleAddEdgeMode: () => {
        if (!utils.isGraphCreated()) {
            alert("Crie um grafo primeiro!");
            return;
        }

        if (state.currentMode === CONFIG.MODES.ADD_EDGE) {
            stateManager.resetMode();
        } else {
            interactions.setMode(CONFIG.MODES.ADD_EDGE);
        }
    },

    // Alterna modo de encontrar caminho
    toggleFindPathMode: () => {
        if (!utils.isGraphCreated()) {
            alert("Crie um grafo primeiro!");
            return;
        }

        if (state.currentMode === CONFIG.MODES.FIND_PATH) {
            stateManager.resetMode();
        } else {
            interactions.setMode(CONFIG.MODES.FIND_PATH);
        }
    },

    // Limpa o grafo
    resetGraph: () => stateManager.clearGraph(),

    // Eventos do canvas
    canvasMouseMove: (e) => {
        if (!state.currentMode || !utils.isGraphCreated()) return;

        const coords = utils.getCanvasCoordinates(e);
        const vertex = geometry.getVertexAt(coords.x, coords.y);

        if (vertex !== state.hoveredVertex) {
            state.hoveredVertex = vertex;
            elements.canvas.style.cursor = vertex !== -1 ? 'pointer' : 'default';
            renderer.drawGraph();
        }
    },

    canvasMouseLeave: () => {
        if (state.hoveredVertex !== -1) {
            state.hoveredVertex = -1;
            elements.canvas.style.cursor = 'default';
            renderer.drawGraph();
        }
    },

    canvasClick: (e) => {
        if (!state.currentMode || !utils.isGraphCreated()) return;

        const coords = utils.getCanvasCoordinates(e);
        const clickedVertex = geometry.getVertexAt(coords.x, coords.y);

        if (clickedVertex === -1) return;

        if (state.currentMode === CONFIG.MODES.ADD_EDGE) {
            interactions.handleAddEdgeClick(clickedVertex);
        } else if (state.currentMode === CONFIG.MODES.FIND_PATH) {
            interactions.handleFindPathClick(clickedVertex);
        }
    },

    // Download do grafo como imagem
    downloadGraph: () => {
        if (!utils.isGraphCreated()) {
            alert("Crie um grafo primeiro!");
            return;
        }

        const link = document.createElement('a');
        link.download = 'grafo_dijkstra.png';
        link.href = elements.canvas.toDataURL();
        link.click();
    },

    // Download da matriz como CSV
    downloadMatrix: () => {
        if (!utils.isGraphCreated()) {
            alert("Crie um grafo primeiro!");
            return;
        }

        let csvContent = ",";
        for (let i = 0; i < state.numVertices; i++) {
            csvContent += state.vertexLabels[i] + (i < state.numVertices - 1 ? "," : "\n");
        }

        for (let i = 0; i < state.numVertices; i++) {
            csvContent += state.vertexLabels[i] + ",";
            for (let j = 0; j < state.numVertices; j++) {
                csvContent += state.graph[i][j] + (j < state.numVertices - 1 ? "," : "\n");
            }
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'matriz_adjacencia.csv';
        link.click();
        window.URL.revokeObjectURL(url);
    }
};

// ===== GERADOR DE GRAFOS =====
const graphGenerator = {
    // Cria grafo aleatório conectado
    createRandomGraph: () => {
        state.vertexLabels = utils.generateVertexLabels(state.numVertices);
        state.graph = Array.from({ length: state.numVertices }, () =>
            Array(state.numVertices).fill(0));

        // Criar caminho conectivo para garantir conectividade
        const vertices = Array.from({ length: state.numVertices }, (_, i) => i);
        const shuffledVertices = utils.shuffleArray(vertices);

        for (let i = 0; i < shuffledVertices.length; i++) {
            const origem = shuffledVertices[i];
            const destino = shuffledVertices[(i + 1) % shuffledVertices.length];
            const peso = utils.getRandomWeight();
            state.graph[origem][destino] = peso;
        }

        // Adicionar arestas extras para densidade
        const maxEdges = state.numVertices * (state.numVertices - 1);
        const currentEdges = state.numVertices;
        const availableSlots = maxEdges - currentEdges;

        const minExtra = Math.floor(availableSlots * CONFIG.GRAPH.DENSITY.MIN_EXTRA_EDGES);
        const maxExtra = Math.floor(availableSlots * CONFIG.GRAPH.DENSITY.MAX_EXTRA_EDGES);
        const numExtra = Math.floor(Math.random() * (maxExtra - minExtra + 1)) + minExtra;

        const possibleConnections = [];
        for (let i = 0; i < state.numVertices; i++) {
            for (let j = 0; j < state.numVertices; j++) {
                if (i !== j && state.graph[i][j] === 0) {
                    possibleConnections.push([i, j]);
                }
            }
        }

        const selectedConnections = utils.shuffleArray(possibleConnections)
            .slice(0, Math.min(numExtra, possibleConnections.length));

        selectedConnections.forEach(([origem, destino]) => {
            state.graph[origem][destino] = utils.getRandomWeight();
        });

        state.lastPath = [];
    }
};

// ===== SISTEMA DE INTERAÇÕES =====
const interactions = {
    // Define modo de interação
    setMode: (mode) => {
        state.currentMode = mode;
        state.selectedVertices = [];
        state.lastPath = [];
        ui.updateModeStatus();
        ui.updateButtonStates();
        ui.clearResults();
        renderer.drawGraph();
    },

    // Manipula clique para adicionar aresta
    handleAddEdgeClick: (vertex) => {
        if (state.selectedVertices.length === 0) {
            state.selectedVertices.push(vertex);
            ui.updateModeStatus();
            renderer.drawGraph();
        } else {
            const origem = state.selectedVertices[0];
            const destino = vertex;

            if (origem === destino) {
                alert("❌ Não é possível criar uma aresta para o próprio vértice!");
                return;
            }

            const peso = prompt(
                `Digite o peso da aresta ${state.vertexLabels[origem]} → ${state.vertexLabels[destino]}:`,
                "1"
            );

            if (peso === null) {
                state.selectedVertices = [];
                ui.updateModeStatus();
                renderer.drawGraph();
                return;
            }

            const pesoNum = parseInt(peso);
            if (!utils.isValidWeight(pesoNum)) {
                alert("❌ Digite um peso válido (número positivo)!");
                return;
            }

            // Verificar aresta oposta
            if (state.graph[destino][origem] !== 0) {
                const confirmar = confirm(
                    `Já existe uma aresta ${state.vertexLabels[destino]} → ${state.vertexLabels[origem]} com peso ${state.graph[destino][origem]}.\n\n` +
                    `Deseja criar a aresta ${state.vertexLabels[origem]} → ${state.vertexLabels[destino]} com peso ${pesoNum}?\n\n` +
                    `As duas arestas terão pesos independentes.`
                );

                if (!confirmar) {
                    state.selectedVertices = [];
                    ui.updateModeStatus();
                    renderer.drawGraph();
                    return;
                }
            }

            state.graph[origem][destino] = pesoNum;
            ui.showSuccessMessage(
                `✅ Aresta ${state.vertexLabels[origem]} → ${state.vertexLabels[destino]} (peso: ${pesoNum}) adicionada!`
            );

            state.selectedVertices = [];
            ui.updateModeStatus();
            ui.renderMatrix();
            renderer.drawGraph();
        }
    },

    // Manipula clique para encontrar caminho
    handleFindPathClick: (vertex) => {
        if (state.selectedVertices.length === 0) {
            state.selectedVertices.push(vertex);
            ui.updateModeStatus();
            renderer.drawGraph();
        } else {
            const origem = state.selectedVertices[0];
            const destino = vertex;

            if (origem === destino) {
                alert("❌ Origem e destino devem ser diferentes!");
                return;
            }

            algorithms.executeDijkstra(origem, destino);
            stateManager.resetMode();
        }
    }
};

// ===== ALGORITMOS =====
const algorithms = {
    // Executa algoritmo de Dijkstra
    executeDijkstra: async (origem, destino) => {
        const graphDict = {};

        // Converter matriz para formato dictionary
        for (let i = 0; i < state.numVertices; i++) {
            graphDict[state.vertexLabels[i]] = {};
            for (let j = 0; j < state.numVertices; j++) {
                if (state.graph[i][j] > 0) {
                    graphDict[state.vertexLabels[i]][state.vertexLabels[j]] = state.graph[i][j];
                }
            }
        }

        try {
            const response = await fetch('/dijkstra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    graph: graphDict,
                    start: state.vertexLabels[origem],
                    end: state.vertexLabels[destino]
                })
            });

            const result = await response.json();

            if (result.distancia !== null) {
                state.lastPath = result.caminho.map(v => state.vertexLabels.indexOf(v));
                ui.showResult(origem, destino, result.distancia, result.caminho);
            } else {
                state.lastPath = [];
                ui.showResult(origem, destino, null, []);
            }

            renderer.drawGraph(origem, destino, state.lastPath);

        } catch (error) {
            console.error('Erro ao executar Dijkstra:', error);
            alert(`❌ Erro ao calcular o caminho: ${error.message || 'Erro desconhecido'}\n\nVerifique se o servidor está rodando e tente novamente.`);
            state.lastPath = [];
            renderer.drawGraph();
        }
    }
};

// ===== SISTEMA DE RENDERIZAÇÃO =====
const renderer = {
    // Desenha o grafo completo
    drawGraph: (origem = null, destino = null, caminho = []) => {
        elements.ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

        if (!utils.isGraphCreated()) {
            renderer.drawEmptyMessage();
            return;
        }

        // Desenhar arestas primeiro
        renderer.drawAllEdges(caminho);
        // Desenhar vértices por último
        renderer.drawAllVertices(origem, destino);
    },

    // Desenha mensagem quando não há grafo
    drawEmptyMessage: () => {
        elements.ctx.fillStyle = "#6b7280";
        elements.ctx.font = "18px Arial";
        elements.ctx.textAlign = "center";
        elements.ctx.textBaseline = "middle";
        elements.ctx.fillText(
            "Crie um grafo para começar a visualização",
            elements.canvas.width / 2,
            elements.canvas.height / 2
        );
    },

    // Desenha todas as arestas
    drawAllEdges: (caminho) => {
        for (let u = 0; u < state.numVertices; u++) {
            for (let v = 0; v < state.numVertices; v++) {
                if (state.graph[u][v] !== 0) {
                    const isBidirectionalSameWeight = state.graph[v][u] !== 0 &&
                        state.graph[u][v] === state.graph[v][u];

                    // Para arestas bidirecionais com mesmo peso, desenhar apenas uma vez
                    if (isBidirectionalSameWeight && u > v) continue;

                    const oppositeWeight = state.graph[v] && state.graph[v][u] ? state.graph[v][u] : null;
                    renderer.drawEdge(u, v, state.graph[u][v], caminho, isBidirectionalSameWeight, oppositeWeight);
                }
            }
        }
    },

    // Desenha todos os vértices
    drawAllVertices: (origem, destino) => {
        for (let i = 0; i < state.numVertices; i++) {
            renderer.drawVertex(i, origem, destino);
        }
    },

    // Desenha uma aresta
    drawEdge: (from, to, weight, caminho, isBidirectional = false, oppositeWeight = null) => {
        const fromPos = state.positions[from];
        const toPos = state.positions[to];

        // Verificar se é aresta do caminho
        const isPathEdge = caminho.some((_, i) =>
            i < caminho.length - 1 && caminho[i] === from && caminho[i + 1] === to
        );

        const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
        const radius = utils.getVertexRadius() + 2;

        const startX = fromPos.x + radius * Math.cos(angle);
        const startY = fromPos.y + radius * Math.sin(angle);
        const endX = toPos.x - radius * Math.cos(angle);
        const endY = toPos.y - radius * Math.sin(angle);

        // Linha da aresta
        elements.ctx.strokeStyle = isPathEdge ? CONFIG.COLORS.EDGE.PATH : CONFIG.COLORS.EDGE.NORMAL;
        elements.ctx.lineWidth = isPathEdge ? CONFIG.CANVAS.EDGE_WIDTH.HIGHLIGHTED : CONFIG.CANVAS.EDGE_WIDTH.NORMAL;

        elements.ctx.beginPath();
        elements.ctx.moveTo(startX, startY);
        elements.ctx.lineTo(endX, endY);
        elements.ctx.stroke();

        // Desenhar setas
        renderer.drawArrows(startX, startY, endX, endY, angle, isBidirectional, isPathEdge);

        // Desenhar peso
        renderer.drawWeight(fromPos, toPos, weight, isBidirectional, oppositeWeight, isPathEdge);
    },

    // Desenha setas da aresta
    drawArrows: (startX, startY, endX, endY, angle, isBidirectional, isPathEdge) => {
        const arrowSize = isPathEdge ?
            CONFIG.CANVAS.ARROW_SIZE.HIGHLIGHTED :
            (isBidirectional ? CONFIG.CANVAS.ARROW_SIZE.BIDIRECTIONAL : CONFIG.CANVAS.ARROW_SIZE.NORMAL);

        elements.ctx.fillStyle = elements.ctx.strokeStyle;

        if (!isBidirectional || isPathEdge) {
            // Seta única
            elements.ctx.beginPath();
            elements.ctx.moveTo(endX, endY);
            elements.ctx.lineTo(
                endX - arrowSize * Math.cos(angle - Math.PI / 6),
                endY - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            elements.ctx.lineTo(
                endX - arrowSize * Math.cos(angle + Math.PI / 6),
                endY - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            elements.ctx.closePath();
            elements.ctx.fill();
        } else {
            // Setas duplas para bidirecionais
            [endX, startX].forEach((x, i) => {
                const y = i === 0 ? endY : startY;
                const direction = i === 0 ? 1 : -1;

                elements.ctx.beginPath();
                elements.ctx.moveTo(x, y);
                elements.ctx.lineTo(
                    x - direction * arrowSize * Math.cos(angle - Math.PI / 6),
                    y - direction * arrowSize * Math.sin(angle - Math.PI / 6)
                );
                elements.ctx.lineTo(
                    x - direction * arrowSize * Math.cos(angle + Math.PI / 6),
                    y - direction * arrowSize * Math.sin(angle + Math.PI / 6)
                );
                elements.ctx.closePath();
                elements.ctx.fill();
            });
        }
    },

    // Desenha peso da aresta
    drawWeight: (fromPos, toPos, weight, isBidirectional, oppositeWeight, isPathEdge) => {
        let midX = (fromPos.x + toPos.x) / 2;
        let midY = (fromPos.y + toPos.y) / 2;

        // Ajustar posição para arestas com pesos diferentes
        if (!isBidirectional && oppositeWeight !== null && oppositeWeight !== weight) {
            const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
            const perpAngle = angle + Math.PI / 2;
            const offset = 12;
            midX += offset * Math.cos(perpAngle);
            midY += offset * Math.sin(perpAngle);
        }

        // Fundo do peso
        elements.ctx.fillStyle = "white";
        elements.ctx.strokeStyle = "#333";
        elements.ctx.lineWidth = 1;

        const fontSize = utils.getFontSize('WEIGHT');
        elements.ctx.font = `bold ${fontSize}px Arial`;
        const textMetrics = elements.ctx.measureText(weight);
        const padding = 4;
        const boxWidth = textMetrics.width + 2 * padding;
        const boxHeight = 18;

        elements.ctx.fillRect(midX - boxWidth / 2, midY - 9, boxWidth, boxHeight);
        elements.ctx.strokeRect(midX - boxWidth / 2, midY - 9, boxWidth, boxHeight);

        // Texto do peso
        elements.ctx.fillStyle = isPathEdge ? "#92400e" : "#374151";
        elements.ctx.textAlign = "center";
        elements.ctx.textBaseline = "middle";
        elements.ctx.fillText(weight, midX, midY);
    },

    // Desenha um vértice
    drawVertex: (index, origem, destino) => {
        const pos = state.positions[index];
        const isSelected = state.selectedVertices.includes(index);
        const isHovered = state.hoveredVertex === index && state.currentMode !== null;
        const isPathVertex = state.lastPath.includes(index);

        const baseRadius = utils.getVertexRadius();
        const hoverRadius = baseRadius + CONFIG.CANVAS.HOVER_EXTRA_RADIUS;

        // Aura de hover/seleção
        if (isSelected || isHovered) {
            elements.ctx.beginPath();
            elements.ctx.arc(pos.x, pos.y, hoverRadius, 0, 2 * Math.PI);
            elements.ctx.fillStyle = isSelected ? CONFIG.COLORS.SELECTED_AURA : CONFIG.COLORS.HOVER_AURA;
            elements.ctx.fill();
        }

        // Círculo do vértice
        elements.ctx.beginPath();
        elements.ctx.arc(pos.x, pos.y, baseRadius, 0, 2 * Math.PI);

        // Cor do vértice baseada no estado
        if (index === origem) {
            elements.ctx.fillStyle = CONFIG.COLORS.VERTEX.ORIGIN;
        } else if (index === destino) {
            elements.ctx.fillStyle = CONFIG.COLORS.VERTEX.DESTINATION;
        } else if (isPathVertex) {
            elements.ctx.fillStyle = CONFIG.COLORS.VERTEX.PATH;
        } else if (isSelected) {
            elements.ctx.fillStyle = CONFIG.COLORS.VERTEX.SELECTED;
        } else if (isHovered) {
            elements.ctx.fillStyle = CONFIG.COLORS.VERTEX.HOVERED;
        } else {
            elements.ctx.fillStyle = CONFIG.COLORS.VERTEX.NORMAL;
        }

        elements.ctx.fill();

        // Borda
        elements.ctx.strokeStyle = isHovered || isSelected ? "#fbbf24" : "#1e293b";
        elements.ctx.lineWidth = isHovered || isSelected ? 3 : 2;
        elements.ctx.stroke();

        // Label
        elements.ctx.fillStyle = "#ffffff";
        const fontSize = utils.getFontSize('VERTEX');
        elements.ctx.font = `bold ${fontSize}px Arial`;
        elements.ctx.textAlign = "center";
        elements.ctx.textBaseline = "middle";
        elements.ctx.fillText(state.vertexLabels[index], pos.x, pos.y);
    }
};

// ===== INICIALIZAÇÃO E EVENTOS =====
const app = {
    // Inicializa a aplicação
    init: () => {
        app.bindEvents();
        ui.updateModeStatus();
        ui.updateButtonStates();
        ui.renderMatrix();
        renderer.drawGraph();
    },

    // Vincula todos os eventos
    bindEvents: () => {
        // Eventos dos botões
        document.getElementById("createGraph").addEventListener("click", eventHandlers.createGraph);
        document.getElementById("generateRandomGraph").addEventListener("click", eventHandlers.generateRandomGraph);
        document.getElementById("addEdgeMode").addEventListener("click", eventHandlers.toggleAddEdgeMode);
        document.getElementById("findPathMode").addEventListener("click", eventHandlers.toggleFindPathMode);
        document.getElementById("resetGraph").addEventListener("click", eventHandlers.resetGraph);
        document.getElementById("downloadGraph").addEventListener("click", eventHandlers.downloadGraph);
        document.getElementById("downloadMatrix").addEventListener("click", eventHandlers.downloadMatrix);

        // Eventos do canvas
        elements.canvas.addEventListener("mousemove", eventHandlers.canvasMouseMove);
        elements.canvas.addEventListener("mouseleave", eventHandlers.canvasMouseLeave);
        elements.canvas.addEventListener("click", eventHandlers.canvasClick);

        // Evento de redimensionamento
        window.addEventListener('resize', () => {
            if (utils.isGraphCreated()) {
                geometry.calculateVertexPositions();
                renderer.drawGraph();
            }
        });
    }
};

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', app.init);

