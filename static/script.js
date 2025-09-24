
// vitor monteiro //

// Representação do grafo em matriz de adjacência //
let graph = [];
let numVertices = 0;

// Letras para os vértices
const vertexLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// --- CANVAS ---
const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
let positions = []; // posições dos vértices para desenhar
let lastPath = [];  // último caminho encontrado

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

    // distribui vértices em círculo
    positions = [];
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

    renderMatrix();
    drawGraph();
});

// Adicionar aresta
document.getElementById("addEdge").addEventListener("click", () => {
    const u = vertexLabels.indexOf(document.getElementById("origem").value.toUpperCase());
    const v = vertexLabels.indexOf(document.getElementById("destino").value.toUpperCase());
    const w = parseInt(document.getElementById("peso").value);

    if (u === -1 || v === -1 || isNaN(w)) {
        alert("Valores inválidos para vértices ou peso.");
        return;
    }

    graph[u][v] = w; // grafo direcionado
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

// Executar Dijkstra
document.getElementById("findPath").addEventListener("click", () => {
    const origem = vertexLabels.indexOf(document.getElementById("origemBusca").value.toUpperCase());
    const destino = vertexLabels.indexOf(document.getElementById("destinoBusca").value.toUpperCase());

    if (origem === -1 || destino === -1) {
        alert("Origem ou destino inválido.");
        return;
    }

    const { dist, prev } = dijkstra(graph, origem);

    lastPath = [];
    if (dist[destino] !== Infinity) {
        for (let at = destino; at !== null; at = prev[at]) {
            lastPath.push(at);
        }
        lastPath.reverse();
    }

    mostrarResultado(origem, destino, dist, prev);
    drawGraph(origem, destino, lastPath);
});

// --- Algoritmo de Dijkstra ---
function dijkstra(graph, start) {
    const dist = Array(numVertices).fill(Infinity);
    const visited = Array(numVertices).fill(false);
    const prev = Array(numVertices).fill(null);
    dist[start] = 0;

    for (let i = 0; i < numVertices - 1; i++) {
        let u = -1;
        for (let j = 0; j < numVertices; j++) {
            if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
                u = j;
            }
        }

        if (u === -1 || dist[u] === Infinity) break;
        visited[u] = true;

        for (let v = 0; v < numVertices; v++) {
            if (graph[u][v] !== 0 && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
                prev[v] = u;
            }
        }
    }

    return { dist, prev };
}

// --- Mostrar resultados ---
function mostrarResultado(origem, destino, dist, prev) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (dist[destino] === Infinity) {
        resultsDiv.innerHTML = `<p>Não existe caminho de ${vertexLabels[origem]} até ${vertexLabels[destino]}.</p>`;
        return;
    }

    resultsDiv.innerHTML = `
        <p><strong>Distância mínima:</strong> ${dist[destino]}</p>
        <p><strong>Caminho:</strong> ${lastPath.map(v => vertexLabels[v]).join(" → ")}</p>
    `;
}

// --- Renderizar matriz de adjacência ---
function renderMatrix() {
    const matrixDiv = document.getElementById("adjacencyMatrix");
    matrixDiv.innerHTML = "";

    if (numVertices === 0) return;

    let table = "<table border='1' cellpadding='5'><tr><th></th>";
    for (let i = 0; i < numVertices; i++) table += `<th>${vertexLabels[i]}</th>`;
    table += "</tr>";

    for (let i = 0; i < numVertices; i++) {
        table += `<tr><th>${vertexLabels[i]}</th>`;
        for (let j = 0; j < numVertices; j++) {
            table += `<td>${graph[i][j]}</td>`;
        }
        table += "</tr>";
    }

    table += "</table>";
    matrixDiv.innerHTML = table;
}

// --- Desenhar grafo ---
function drawGraph(origem = null, destino = null, caminho = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // desenha arestas
    for (let u = 0; u < numVertices; u++) {
        for (let v = 0; v < numVertices; v++) {
            if (graph[u][v] !== 0) {
                const from = positions[u];
                const to = positions[v];

                // cor especial se estiver no caminho mínimo
                let isPathEdge = false;
                for (let i = 0; i < caminho.length - 1; i++) {
                    if (caminho[i] === u && caminho[i + 1] === v) {
                        isPathEdge = true;
                        break;
                    }
                }

                ctx.strokeStyle = isPathEdge ? "#f59e0b" : "#555";
                ctx.lineWidth = isPathEdge ? 3 : 1.5;

                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();

                // seta (direção)
                const angle = Math.atan2(to.y - from.y, to.x - from.x);
                const arrowSize = 15;
                ctx.beginPath();
                ctx.moveTo(to.x, to.y);
                ctx.lineTo(
                    to.x - arrowSize * Math.cos(angle - Math.PI / 6),
                    to.y - arrowSize * Math.sin(angle - Math.PI / 6)
                );
                ctx.lineTo(
                    to.x - arrowSize * Math.cos(angle + Math.PI / 6),
                    to.y - arrowSize * Math.sin(angle + Math.PI / 6)
                );
                ctx.closePath();
                ctx.fillStyle = ctx.strokeStyle;
                ctx.fill();

                // peso
                ctx.fillStyle = "#f70000ff";
                ctx.font = "16px Arial";
                ctx.fillText(graph[u][v], (from.x + to.x) / 2, (from.y + to.y) / 2);
            }
        }
    }

    // desenha vértices
    for (let i = 0; i < numVertices; i++) {
        const pos = positions[i];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);

        if (i === origem) {
            ctx.fillStyle = "#10b981"; // origem verde
        } else if (i === destino) {
            ctx.fillStyle = "#ef4444"; // destino vermelho
        } else {
            ctx.fillStyle = "#3b82f6"; // normal azul
        }

        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(vertexLabels[i], pos.x, pos.y); // usa letra
    }
}

