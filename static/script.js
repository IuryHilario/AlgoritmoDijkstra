// Algoritmo de Dijkstra - Interface Interativa

// Representação do grafo em matriz de adjacência
let graph = [];
let numVertices = 0;

// Letras para os vértices
const vertexLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Canvas e contexto
const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
let positions = [];
let lastPath = [];

// Estados dos modos interativos
let currentMode = null;
let selectedVertices = [];
let hoveredVertex = -1;

// Elementos da interface
const modeStatus = document.getElementById("modeStatus");
const toggleAddEdgeBtn = document.getElementById("toggleAddEdgeMode");
const toggleFindPathBtn = document.getElementById("toggleFindPathMode");

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

    if (currentMode === null) {
        modeStatus.textContent = 'Clique em "Adicionar Aresta" ou "Buscar Caminho" para começar';
        modeStatus.className = 'mode-status';
    } else if (currentMode === 'addEdge') {
        if (selectedVertices.length === 0) {
            modeStatus.textContent = 'Clique no vértice de origem da aresta';
        } else if (selectedVertices.length === 1) {
            modeStatus.textContent = `Origem: ${vertexLabels[selectedVertices[0]]} - Clique no vértice de destino`;
        }
        modeStatus.className = 'mode-status active';
    } else if (currentMode === 'findPath') {
        if (selectedVertices.length === 0) {
            modeStatus.textContent = 'Clique no vértice de origem do caminho';
        } else if (selectedVertices.length === 1) {
            modeStatus.textContent = `Origem: ${vertexLabels[selectedVertices[0]]} - Clique no vértice de destino`;
        }
        modeStatus.className = 'mode-status active';
    }
}

function updateButtonStates() {
    if (toggleAddEdgeBtn) {
        toggleAddEdgeBtn.className = currentMode === 'addEdge' ? 'btn btn-success active' : 'btn btn-success';
    }
    if (toggleFindPathBtn) {
        toggleFindPathBtn.className = currentMode === 'findPath' ? 'btn btn-primary active' : 'btn btn-primary';
    }
}

function getVertexAt(x, y) {
    // Ajustar coordenadas para o redimensionamento do canvas
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

// Função para calcular posições dos vértices
function calculateVertexPositions() {
    positions = [];
    if (numVertices === 0) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;

    for (let i = 0; i < numVertices; i++) {
        const angle = (2 * Math.PI * i) / numVertices;
        positions.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }
}

// Criar grafo com N vértices
document.getElementById("createGraph").addEventListener("click", () => {
    numVertices = parseInt(document.getElementById("vertices").value);
    if (isNaN(numVertices) || numVertices < 2 || numVertices > 26) {
        alert("Insira um número válido de vértices (2 a 26).");
        return;
    }

    graph = Array.from({ length: numVertices }, () =>
        Array(numVertices).fill(0)
    );

    calculateVertexPositions();
    resetMode();
    renderMatrix();
    drawGraph();
});

// Gerar grafo aleatório
document.getElementById("generateRandomGraph").addEventListener("click", () => {
    if (numVertices < 2) {
        alert("Crie um grafo primeiro!");
        return;
    }

    // Limpar grafo atual
    graph = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));

    // Adicionar arestas aleatórias
    const numEdges = Math.floor(Math.random() * (numVertices * (numVertices - 1) / 4)) + numVertices;

    for (let i = 0; i < numEdges; i++) {
        const origem = Math.floor(Math.random() * numVertices);
        let destino = Math.floor(Math.random() * numVertices);

        // Evitar laços próprios
        while (destino === origem) {
            destino = Math.floor(Math.random() * numVertices);
        }

        // Peso aleatório entre 1 e 10
        const peso = Math.floor(Math.random() * 10) + 1;
        graph[origem][destino] = peso;
    }

    renderMatrix();
    drawGraph();
});

// Eventos dos botões de modo
toggleAddEdgeBtn.addEventListener("click", () => {
    if (currentMode === 'addEdge') {
        resetMode();
    } else {
        currentMode = 'addEdge';
        selectedVertices = [];
        updateModeStatus();
        updateButtonStates();
    }
});

toggleFindPathBtn.addEventListener("click", () => {
    if (currentMode === 'findPath') {
        resetMode();
    } else {
        currentMode = 'findPath';
        selectedVertices = [];
        lastPath = [];
        updateModeStatus();
        updateButtonStates();
        drawGraph();
    }
});

// Eventos do canvas
canvas.addEventListener("mousemove", (e) => {
    if (currentMode === null) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const vertex = getVertexAt(x, y);
    if (vertex !== hoveredVertex) {
        hoveredVertex = vertex;
        canvas.style.cursor = vertex !== -1 ? 'pointer' : 'default';
        drawGraph(); // Redesenhar para mostrar hover
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
            alert("Não é possível criar uma aresta para o próprio vértice!");
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
            alert("Digite um peso válido (número positivo)!");
            return;
        }

        graph[origem][destino] = pesoNum;
        selectedVertices = [];
        updateModeStatus();
        renderMatrix();
        drawGraph();
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
            alert("Origem e destino não podem ser iguais!");
            return;
        }

        executeDijkstra(origem, destino);
        resetMode();
    }
}

// Adicionar aresta (método manual)
document.getElementById("addEdge").addEventListener("click", () => {
    const u = vertexLabels.indexOf(document.getElementById("origem").value.toUpperCase());
    const v = vertexLabels.indexOf(document.getElementById("destino").value.toUpperCase());
    const w = parseInt(document.getElementById("peso").value);

    if (u === -1 || v === -1 || isNaN(w)) {
        alert("Valores inválidos para vértices ou peso.");
        return;
    }

    graph[u][v] = w;
    renderMatrix();
    drawGraph();
});

// Remover aresta
document.getElementById("removeEdge").addEventListener("click", () => {
    const u = vertexLabels.indexOf(document.getElementById("origem").value.toUpperCase());
    const v = vertexLabels.indexOf(document.getElementById("destino").value.toUpperCase());

    if (u === -1 || v === -1) {
        alert("Valores inválidos para vértices.");
        return;
    }

    graph[u][v] = 0;
    renderMatrix();
    drawGraph();
});

// Executar Dijkstra (método manual)
document.getElementById("findPath").addEventListener("click", () => {
    const origem = vertexLabels.indexOf(document.getElementById("origemBusca").value.toUpperCase());
    const destino = vertexLabels.indexOf(document.getElementById("destinoBusca").value.toUpperCase());

    if (origem === -1 || destino === -1) {
        alert("Origem ou destino inválido.");
        return;
    }

    executeDijkstra(origem, destino);
});

// Função centralizada para executar Dijkstra
async function executeDijkstra(origem, destino) {
    if (numVertices === 0) {
        alert("Crie um grafo primeiro!");
        return;
    }

    // Converter matriz para formato do backend
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                graph: graphDict,
                start: vertexLabels[origem],
                end: vertexLabels[destino]
            })
        });

        const result = await response.json();

        if (result.distancia !== null) {
            lastPath = result.caminho.map(v => vertexLabels.indexOf(v));
            mostrarResultado(origem, destino, result.distancia, result.caminho);
        } else {
            lastPath = [];
            mostrarResultado(origem, destino, null, []);
        }

        drawGraph(origem, destino, lastPath);

    } catch (error) {
        console.error('Erro ao executar Dijkstra:', error);
        alert('Erro ao calcular o caminho. Verifique se o servidor está rodando.');
    }
}



// Mostrar resultados
function mostrarResultado(origem, destino, distancia, caminho) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (distancia === null || caminho.length === 0) {
        resultsDiv.innerHTML = `<div class="result-item">
            <p><strong>❌ Resultado:</strong></p>
            <p>Não existe caminho de <span class="vertex-label">${vertexLabels[origem]}</span> até <span class="vertex-label">${vertexLabels[destino]}</span></p>
        </div>`;
        return;
    }

    resultsDiv.innerHTML = `
        <div class="result-item">
            <p><strong>✅ Caminho Encontrado!</strong></p>
            <p><strong>Distância mínima:</strong> <span class="distance-value">${distancia}</span></p>
            <p><strong>Caminho:</strong></p>
            <div class="path-display">${caminho.join(" → ")}</div>
            <p><strong>Número de saltos:</strong> ${caminho.length - 1}</p>
        </div>
    `;
}

// Renderizar matriz de adjacência
function renderMatrix() {
    const matrixDiv = document.getElementById("adjacencyMatrix");
    matrixDiv.innerHTML = "";

    if (numVertices === 0) {
        matrixDiv.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Crie um grafo para visualizar a matriz</p>';
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
            table += `<td class="${cellClass}">${value}</td>`;
        }
        table += "</tr>";
    }

    table += "</table>";
    matrixDiv.innerHTML = table;
}

// Desenhar grafo
function drawGraph(origem = null, destino = null, caminho = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (numVertices === 0) return;

    // Desenhar arestas
    for (let u = 0; u < numVertices; u++) {
        for (let v = 0; v < numVertices; v++) {
            if (graph[u][v] !== 0) {
                drawEdge(u, v, graph[u][v], caminho);
            }
        }
    }

    // Desenhar vértices
    for (let i = 0; i < numVertices; i++) {
        drawVertex(i, origem, destino);
    }
}

function drawEdge(from, to, weight, caminho) {
    const fromPos = positions[from];
    const toPos = positions[to];

    // Verificar se faz parte do caminho mínimo
    let isPathEdge = false;
    for (let i = 0; i < caminho.length - 1; i++) {
        if (caminho[i] === from && caminho[i + 1] === to) {
            isPathEdge = true;
            break;
        }
    }

    // Calcular pontos ajustados para não sobrepor os círculos
    const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
    const radius = 22; // raio do vértice + margem

    const startX = fromPos.x + radius * Math.cos(angle);
    const startY = fromPos.y + radius * Math.sin(angle);
    const endX = toPos.x - radius * Math.cos(angle);
    const endY = toPos.y - radius * Math.sin(angle);

    // Desenhar linha
    ctx.strokeStyle = isPathEdge ? "#000000" : "#555"; // Preto para caminho
    ctx.lineWidth = isPathEdge ? 3 : 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Desenhar seta
    const arrowSize = isPathEdge ? 12 : 10;
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

    // Desenhar peso
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;

    // Fundo branco para o peso
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    const textMetrics = ctx.measureText(weight);
    const padding = 3;
    ctx.fillRect(midX - textMetrics.width/2 - padding, midY - 8, textMetrics.width + 2*padding, 16);
    ctx.strokeRect(midX - textMetrics.width/2 - padding, midY - 8, textMetrics.width + 2*padding, 16);

    // Texto do peso
    ctx.fillStyle = isPathEdge ? "#000000" : "#333"; // Preto para caminho
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(weight, midX, midY);
}

function drawVertex(index, origem, destino) {
    const pos = positions[index];
    const isSelected = selectedVertices.includes(index);
    const isHovered = hoveredVertex === index && currentMode !== null;

    // Verificar se o vértice faz parte do caminho
    const isPathVertex = lastPath.includes(index);

    // Desenhar aura de hover/seleção
    if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 26, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? "rgba(251, 191, 36, 0.4)" : "rgba(251, 191, 36, 0.2)";
        ctx.fill();
    }

    // Desenhar círculo do vértice
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);

    // Definir cor baseada no estado
    if (index === origem) {
        ctx.fillStyle = "#10b981"; // origem verde
    } else if (index === destino) {
        ctx.fillStyle = "#ef4444"; // destino vermelho
    } else if (isPathVertex) {
        ctx.fillStyle = "#fbbf24"; // vértice no caminho amarelo
    } else if (isSelected) {
        ctx.fillStyle = "#fbbf24"; // selecionado amarelo
    } else if (isHovered) {
        ctx.fillStyle = "#60a5fa"; // hover azul claro
    } else {
        ctx.fillStyle = "#3b82f6"; // normal azul
    }

    ctx.fill();

    // Borda
    ctx.strokeStyle = isHovered || isSelected ? "#fbbf24" : "#000";
    ctx.lineWidth = isHovered || isSelected ? 3 : 2;
    ctx.stroke();

    // Label do vértice
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(vertexLabels[index], pos.x, pos.y);
}

// Resetar grafo
document.getElementById("resetGraph").addEventListener("click", () => {
    if (numVertices > 0) {
        graph = Array.from({ length: numVertices }, () => Array(numVertices).fill(0));
        lastPath = [];
        resetMode();
        renderMatrix();
        drawGraph();
        document.getElementById("results").innerHTML = "";
    }
});

// Funções de download
document.getElementById("downloadGraph").addEventListener("click", () => {
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

// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
    updateModeStatus();
    updateButtonStates();
    renderMatrix();

    // Configuração inicial
    document.getElementById("vertices").value = "4";

    // Limpar campos de entrada
    document.getElementById("origem").value = "";
    document.getElementById("destino").value = "";
    document.getElementById("peso").value = "";
    document.getElementById("origemBusca").value = "";
    document.getElementById("destinoBusca").value = "";
});

// Recalcular posições quando a janela for redimensionada
window.addEventListener('resize', () => {
    if (numVertices > 0) {
        calculateVertexPositions();
        drawGraph();
    }
});

