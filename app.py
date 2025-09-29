from flask import Flask, render_template, request, jsonify


app = Flask(__name__)

def dijkstra(graph, start, end):
    """
    Implementa o algoritmo de Dijkstra para encontrar o caminho mais curto em um grafo.
    """
    # Inicializar distâncias e nós anteriores
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    previous_nodes = {node: None for node in graph}
    unvisited = set(graph.keys())

    while unvisited:
        # Encontrar o nó não visitado com menor distância
        current_node = None
        for node in unvisited:
            if current_node is None or distances[node] < distances[current_node]:
                current_node = node

        # Se não há caminho possível, parar
        if distances[current_node] == float('infinity'):
            break

        # Remover nó atual dos não visitados
        unvisited.remove(current_node)

        # Atualizar distâncias dos vizinhos
        for neighbor, weight in graph[current_node].items():
            if neighbor in unvisited:
                new_distance = distances[current_node] + weight
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    previous_nodes[neighbor] = current_node

    # Reconstruir caminho
    path = []
    if distances[end] != float('infinity'):
        current = end
        while current is not None:
            path.insert(0, current)
            current = previous_nodes[current]

    return {
        "distancia": distances[end] if distances[end] != float('infinity') else None,
        "caminho": path
    }


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/dijkstra", methods=["POST"])
def run_dijkstra():
    data = request.get_json()
    graph = data["graph"]
    start = data["start"]
    end = data["end"]

    result = dijkstra(graph, start, end)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
