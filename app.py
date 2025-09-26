from flask import Flask, render_template, request, jsonify
import heapq

app = Flask(__name__)

def dijkstra(graph, start, end):
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    previous_nodes = {node: None for node in graph}
    pq = [(0, start)]

    while pq:
        current_distance, current_node = heapq.heappop(pq)

        if current_distance > distances[current_node]:
            continue

        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous_nodes[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))

    path = []
    node = end
    while node is not None:
        path.insert(0, node)
        node = previous_nodes[node]

    return {"distancia": distances[end], "caminho": path}

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
