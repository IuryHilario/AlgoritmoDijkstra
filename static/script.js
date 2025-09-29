// Variáveis globais
let graph = [];
let numVertices = 0;
const vertexLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Canvas e contexto
const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
let positions = [];
let lastPath = [];

// Estados dos modos
let currentMode = null; // 'addEdge' ou 'findPath'
let selectedVertices = [];
let hoveredVertex = -1;

// Elementos da interface
const modeStatus = document.getElementById("modeStatus");
const addEdgeModeBtn = document.getElementById("addEdgeMode");
const findPathModeBtn = document.getElementById("findPathMode");

// Funções auxiliares
function resetMode() {
    currentMode = null;
    selectedVertices = [];
    hoveredVertex = -1;
    updateModeStatus();
    updateButtonStates();
    drawGraph();
}

function updateModeStatus() {
    if (!modeStatus) return;

    if (numVertices === 0) {
        modeStatus.textContent = 'Crie um grafo para começar';
        modeStatus.className = 'mode-status';
    } else if (currentMode === null) {
        modeStatus.textContent = 'Clique em "Adicionar Arestas" ou "Encontrar Caminho"';
        modeStatus.className = 'mode-status';
    } else if (currentMode === 'addEdge') {
        if (selectedVertices.length === 0) {
            modeStatus.textContent = '🎯 Clique no vértice de ORIGEM da aresta';
        } else if (selectedVertices.length === 1) {
            modeStatus.textContent = `✅ Origem: ${vertexLabels[selectedVertices[0]]} | 🎯 Clique no vértice de DESTINO`;
        }
        modeStatus.className = 'mode-status active';
    } else if (currentMode === 'findPath') {
        if (selectedVertices.length === 0) {
            modeStatus.textContent = '🎯 Clique no vértice de INÍCIO do caminho';
        } else if (selectedVertices.length === 1) {
            modeStatus.textContent = `✅ Início: ${vertexLabels[selectedVertices[0]]} | 🎯 Clique no vértice de DESTINO`;
        }
        modeStatus.className = 'mode-status active';
    }
}

function updateButtonStates() {
    if (addEdgeModeBtn) {
        addEdgeModeBtn.className = currentMode === 'addEdge' ?
            'btn btn-success btn-large active' : 'btn btn-success btn-large';
    }
    if (findPathModeBtn) {
        findPathModeBtn.className = currentMode === 'findPath' ?
            'btn btn-primary btn-large active' : 'btn btn-primary btn-large';
    }
}

function calculateVertexPositions() {
    positions = [];
    if (numVertices === 0) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;

    for (let i = 0; i < numVertices; i++) {
        const angle = (2 * Math.PI * i) / numVertices - Math.PI / 2;
        positions.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }
}

function getVertexAt(x, y) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const adjustedX = x * scaleX;
    const adjustedY = y * scaleY;

    for (let i = 0; i < numVertices; i++) {
        const pos = positions[i];
        const dx = adjustedX - pos.x;
        const dy = adjustedY - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 25) {
            return i;
        }
    }
    return -1;
}

// Eventos dos botões
document.getElementById("createGraph").addEventListener("click", () => {
    const vertices = parseInt(document.getElementById("vertices").value);
    if (isNaN(vertices) || vertices < 2 || vertices > 26) {
        alert("Digite um número válido de vértices (2 a 26).");
        return;
    }

    numVertices = vertices;
    graph = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));
    lastPath = [];

    calculateVertexPositions();
    resetMode();
    renderMatrix();
    drawGraph();
    clearResults();
});

document.getElementById("generateRandomGraph").addEventListener("click", () => {
    if (numVertices < 2) {
        alert("Crie um grafo primeiro!");
        return;
    }

    // Limpar grafo atual
    graph = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));

    // Função para embaralhar array (Fisher-Yates)
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Criar lista de vértices e embaralhar
    const vertices = Array.from({ length: numVertices }, (_, i) => i);
    const shuffledVertices = shuffleArray(vertices);

    // Criar caminho conectivo aleatório
    for (let i = 0; i < shuffledVertices.length; i++) {
        const origem = shuffledVertices[i];
        const destino = shuffledVertices[(i + 1) % shuffledVertices.length];
        const peso = Math.floor(Math.random() * 9) + 1;
        graph[origem][destino] = peso;
    }

    // Adicionar arestas aleatórias extras para tornar o grafo mais denso
    const maxPossibleEdges = numVertices * (numVertices - 1); // Máximo para grafo direcionado
    const currentEdges = numVertices; // Já temos as arestas de conectividade
    const availableSlots = maxPossibleEdges - currentEdges;

    // Calcular número de arestas extras (entre 30% e 70% das possíveis)
    const minExtraEdges = Math.floor(availableSlots * 0.1);
    const maxExtraEdges = Math.floor(availableSlots * 0.4);
    const numEdgesExtras = Math.floor(Math.random() * (maxExtraEdges - minExtraEdges + 1)) + minExtraEdges;

    // Criar lista de todas as possíveis conexões (exceto auto-loops)
    const possibleConnections = [];
    for (let i = 0; i < numVertices; i++) {
        for (let j = 0; j < numVertices; j++) {
            if (i !== j && graph[i][j] === 0) { // Não sobrescrever arestas existentes
                possibleConnections.push([i, j]);
            }
        }
    }

    // Embaralhar e selecionar conexões aleatórias
    const shuffledConnections = shuffleArray(possibleConnections);
    const selectedConnections = shuffledConnections.slice(0, Math.min(numEdgesExtras, shuffledConnections.length));

    // Adicionar as arestas selecionadas
    selectedConnections.forEach(([origem, destino]) => {
        const peso = Math.floor(Math.random() * 9) + 1;
        graph[origem][destino] = peso;
    });

    lastPath = [];
    resetMode();
    renderMatrix();
    drawGraph();
    clearResults();
});

// Modos de interação
addEdgeModeBtn.addEventListener("click", () => {
    if (numVertices === 0) {
        alert("Crie um grafo primeiro!");
        return;
    }

    if (currentMode === 'addEdge') {
        resetMode();
    } else {
        currentMode = 'addEdge';
        selectedVertices = [];
        lastPath = [];
        updateModeStatus();
        updateButtonStates();
        clearResults();
        drawGraph();
    }
});

// Modo de encontrar caminho
findPathModeBtn.addEventListener("click", () => {
    if (numVertices === 0) {
        alert("Crie um grafo primeiro!");
        return;
    }

    if (currentMode === 'findPath') {
        resetMode();
    } else {
        currentMode = 'findPath';
        selectedVertices = [];
        lastPath = [];
        updateModeStatus();
        updateButtonStates();
        clearResults();
        drawGraph();
    }
});

// Resetar grafo
document.getElementById("resetGraph").addEventListener("click", () => {
    if (numVertices > 0) {
        graph = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));
        lastPath = [];
        resetMode();
        renderMatrix();
        drawGraph();
        clearResults();
    }
});

// Eventos do canvas
canvas.addEventListener("mousemove", (e) => {
    if (currentMode === null || numVertices === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const vertex = getVertexAt(x, y);
    if (vertex !== hoveredVertex) {
        hoveredVertex = vertex;
        canvas.style.cursor = vertex !== -1 ? 'pointer' : 'default';
        drawGraph();
    }
});

canvas.addEventListener("mouseleave", () => {
    if (hoveredVertex !== -1) {
        hoveredVertex = -1;
        canvas.style.cursor = 'default';
        drawGraph();
    }
});

canvas.addEventListener("click", (e) => {
    if (currentMode === null || numVertices === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedVertex = getVertexAt(x, y);
    if (clickedVertex === -1) return;

    if (currentMode === 'addEdge') {
        handleAddEdgeClick(clickedVertex);
    } else if (currentMode === 'findPath') {
        handleFindPathClick(clickedVertex);
    }
});

function handleAddEdgeClick(vertex) {
    if (selectedVertices.length === 0) {
        selectedVertices.push(vertex);
        updateModeStatus();
        drawGraph();
    } else if (selectedVertices.length === 1) {
        const origem = selectedVertices[0];
        const destino = vertex;

        if (origem === destino) {
            alert("❌ Não é possível criar uma aresta para o próprio vértice!");
            return;
        }

        const peso = prompt(`Digite o peso da aresta ${vertexLabels[origem]} → ${vertexLabels[destino]}:`, "1");
        if (peso === null) {
            selectedVertices = [];
            updateModeStatus();
            drawGraph();
            return;
        }

        const pesoNum = parseInt(peso);
        if (isNaN(pesoNum) || pesoNum <= 0) {
            alert("❌ Digite um peso válido (número positivo)!");
            return;
        }

        graph[origem][destino] = pesoNum;
        selectedVertices = [];
        updateModeStatus();
        renderMatrix();
        drawGraph();

        showSuccessMessage(`✅ Aresta ${vertexLabels[origem]} → ${vertexLabels[destino]} (peso: ${pesoNum}) adicionada!`);
    }
}

function handleFindPathClick(vertex) {
    if (selectedVertices.length === 0) {
        selectedVertices.push(vertex);
        updateModeStatus();
        drawGraph();
    } else if (selectedVertices.length === 1) {
        const origem = selectedVertices[0];
        const destino = vertex;

        if (origem === destino) {
            alert("❌ Origem e destino devem ser diferentes!");
            return;
        }

        executeDijkstra(origem, destino);
        resetMode();
    }
}

async function executeDijkstra(origem, destino) {
    const graphDict = {};
    for (let i = 0; i < numVertices; i++) {
        graphDict[vertexLabels[i]] = {};
        for (let j = 0; j < numVertices; j++) {
            if (graph[i][j] > 0) {
                graphDict[vertexLabels[i]][vertexLabels[j]] = graph[i][j];
            }
        }
    }

    try {
        const response = await fetch('/dijkstra', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                graph: graphDict,
                start: vertexLabels[origem],
                end: vertexLabels[destino]
            })
        });

        const result = await response.json();

        if (result.distancia !== null) {
            lastPath = result.caminho.map(v => vertexLabels.indexOf(v));
            showResult(origem, destino, result.distancia, result.caminho);
        } else {
            lastPath = [];
            showResult(origem, destino, null, []);
        }

        drawGraph(origem, destino, lastPath);

    } catch (error) {
        console.error('Erro ao executar Dijkstra:', error);
        alert('❌ Erro ao calcular o caminho. Verifique se o servidor está rodando.');
    }
}

// Mostrar resultados
function showResult(origem, destino, distancia, caminho) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (distancia === null || caminho.length === 0) {
        resultsDiv.innerHTML = `<div class="result-item">
            <p><strong>❌ Caminho não encontrado</strong></p>
            <p>Não existe caminho de <span class="vertex-label">${vertexLabels[origem]}</span>
            até <span class="vertex-label">${vertexLabels[destino]}</span></p>
            <p><em>Verifique se os vértices estão conectados.</em></p>
        </div>`;
        return;
    }

    resultsDiv.innerHTML = `
        <div class="result-item">
            <p><strong>🎉 Caminho Encontrado!</strong></p>
            <p><strong>📏 Distância mínima:</strong> <span class="distance-value">${distancia}</span></p>
            <p><strong>🛤️ Caminho:</strong></p>
            <div class="path-display">${caminho.join(" → ")}</div>
            <p><strong>📊 Estatísticas:</strong></p>
            <p>• Número de saltos: ${caminho.length - 1}</p>
            <p>• Vértices visitados: ${caminho.length}</p>
        </div>
    `;
}

function showSuccessMessage(message) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `<div class="result-item">
        <p>${message}</p>
        <p><em>Continue adicionando arestas ou busque um caminho.</em></p>
    </div>`;
}

function clearResults() {
    document.getElementById("results").innerHTML = "";
}

// Renderizar matriz de adjacência
function renderMatrix() {
    const matrixDiv = document.getElementById("adjacencyMatrix");
    matrixDiv.innerHTML = "";

    if (numVertices === 0) {
        matrixDiv.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Crie um grafo para ver a matriz</p>';
        return;
    }

    let table = "<table><tr><th></th>";
    for (let i = 0; i < numVertices; i++) {
        table += `<th>${vertexLabels[i]}</th>`;
    }
    table += "</tr>";

    for (let i = 0; i < numVertices; i++) {
        table += `<tr><th>${vertexLabels[i]}</th>`;
        for (let j = 0; j < numVertices; j++) {
            const value = graph[i][j];
            const cellClass = value > 0 ? 'cell-edge' : 'cell-empty';
            table += `<td class="${cellClass}">${value || '-'}</td>`;
        }
        table += "</tr>";
    }

    table += "</table>";
    matrixDiv.innerHTML = table;
}

// Desenhar grafo
function drawGraph(origem = null, destino = null, caminho = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (numVertices === 0) {
        // Desenhar mensagem de instrução
        ctx.fillStyle = "#6b7280";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Crie um grafo para começar a visualização", canvas.width / 2, canvas.height / 2);
        return;
    }

    // Desenhar arestas primeiro
    for (let u = 0; u < numVertices; u++) {
        for (let v = 0; v < numVertices; v++) {
            if (graph[u][v] !== 0) {
                drawEdge(u, v, graph[u][v], caminho);
            }
        }
    }

    // Desenhar vértices por último
    for (let i = 0; i < numVertices; i++) {
        drawVertex(i, origem, destino);
    }
}

function drawEdge(from, to, weight, caminho) {
    const fromPos = positions[from];
    const toPos = positions[to];

    let isPathEdge = false;
    for (let i = 0; i < caminho.length - 1; i++) {
        if (caminho[i] === from && caminho[i + 1] === to) {
            isPathEdge = true;
            break;
        }
    }

    const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
    const radius = 22;

    const startX = fromPos.x + radius * Math.cos(angle);
    const startY = fromPos.y + radius * Math.sin(angle);
    const endX = toPos.x - radius * Math.cos(angle);
    const endY = toPos.y - radius * Math.sin(angle);

    // Linha da aresta
    ctx.strokeStyle = isPathEdge ? "#fbbf24" : "#64748b";
    ctx.lineWidth = isPathEdge ? 4 : 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Seta
    const arrowSize = isPathEdge ? 14 : 10;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();

    // Peso da aresta
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;

    ctx.fillStyle = "white";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    const textMetrics = ctx.measureText(weight);
    const padding = 4;
    ctx.fillRect(midX - textMetrics.width/2 - padding, midY - 9, textMetrics.width + 2*padding, 18);
    ctx.strokeRect(midX - textMetrics.width/2 - padding, midY - 9, textMetrics.width + 2*padding, 18);

    ctx.fillStyle = isPathEdge ? "#92400e" : "#374151";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(weight, midX, midY);
}

function drawVertex(index, origem, destino) {
    const pos = positions[index];
    const isSelected = selectedVertices.includes(index);
    const isHovered = hoveredVertex === index && currentMode !== null;
    const isPathVertex = lastPath.includes(index);

    // Aura de hover/seleção
    if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 28, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? "rgba(251, 191, 36, 0.5)" : "rgba(251, 191, 36, 0.3)";
        ctx.fill();
    }

    // Círculo do vértice
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);

    if (index === origem) {
        ctx.fillStyle = "#10b981";
    } else if (index === destino) {
        ctx.fillStyle = "#ef4444";
    } else if (isPathVertex) {
        ctx.fillStyle = "#fbbf24";
    } else if (isSelected) {
        ctx.fillStyle = "#f59e0b";
    } else if (isHovered) {
        ctx.fillStyle = "#60a5fa";
    } else {
        ctx.fillStyle = "#3b82f6";
    }

    ctx.fill();

    // Borda
    ctx.strokeStyle = isHovered || isSelected ? "#fbbf24" : "#1e293b";
    ctx.lineWidth = isHovered || isSelected ? 3 : 2;
    ctx.stroke();

    // Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(vertexLabels[index], pos.x, pos.y);
}

// Funções de download
document.getElementById("downloadGraph").addEventListener("click", () => {
    if (numVertices === 0) {
        alert("Crie um grafo primeiro!");
        return;
    }

    const link = document.createElement('a');
    link.download = 'grafo_dijkstra.png';
    link.href = canvas.toDataURL();
    link.click();
});

document.getElementById("downloadMatrix").addEventListener("click", () => {
    if (numVertices === 0) {
        alert("Crie um grafo primeiro!");
        return;
    }

    let csvContent = ",";
    for (let i = 0; i < numVertices; i++) {
        csvContent += vertexLabels[i] + (i < numVertices - 1 ? "," : "\n");
    }

    for (let i = 0; i < numVertices; i++) {
        csvContent += vertexLabels[i] + ",";
        for (let j = 0; j < numVertices; j++) {
            csvContent += graph[i][j] + (j < numVertices - 1 ? "," : "\n");
        }
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'matriz_adjacencia.csv';
    link.click();
    window.URL.revokeObjectURL(url);
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateModeStatus();
    updateButtonStates();
    renderMatrix();
    drawGraph();
});

window.addEventListener('resize', () => {
    if (numVertices > 0) {
        calculateVertexPositions();
        drawGraph();
    }
});

