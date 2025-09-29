# 🔗 Algoritmo de Dijkstra - Visualização Interativa

Uma aplicação web interativa para visualizar e demonstrar o **Algoritmo de Dijkstra** para encontrar o caminho mais curto em grafos direcionados ponderados.

![Algoritmo de Dijkstra](https://img.shields.io/badge/Algoritmo-Dijkstra-blue)
![Flask](https://img.shields.io/badge/Backend-Flask-green)
![JavaScript](https://img.shields.io/badge/Frontend-JavaScript-yellow)
![HTML5](https://img.shields.io/badge/Interface-HTML5-orange)
![CSS3](https://img.shields.io/badge/Estilo-CSS3-blue)

## 🎯 Funcionalidades

### ✨ Principais Recursos

- **🎮 Interface Interativa**: Criação e manipulação visual de grafos
- **🎲 Geração Aleatória**: Criação automática de grafos com distribuição aleatória
- **🔍 Visualização em Tempo Real**: Animação do caminho mínimo encontrado
- **📊 Matriz de Adjacência**: Visualização dinâmica da estrutura do grafo
- **📈 Estatísticas Detalhadas**: Informações completas sobre distâncias e caminhos
- **💾 Exportação**: Salvar grafos como PNG e matrizes como CSV
- **📱 Design Responsivo**: Interface adaptável a diferentes tamanhos de tela

## 🚀 Demonstração

### 🎬 Fluxo de Uso

1. **Criar Grafo**: Defina o número de vértices (2-26)
2. **Adicionar Arestas**: Clique em vértices para conectá-los com pesos
3. **Encontrar Caminho**: Selecione origem e destino para calcular rota mínima
4. **Visualizar Resultado**: Veja o caminho destacado no grafo
5. **Exportar**: Salve o grafo ou matriz para uso posterior

### 📊 Exemplo Visual

```
Grafo com 4 vértices (A, B, C, D):
A ──5──> B
│        │
3        2
│        │
▼        ▼
D ──1──> C

Caminho mínimo de A para C: A → B → C (distância: 7)
```

## ⚙️ Instalação

### 📋 Pré-requisitos

- **Python 3.7+**
- **Flask 2.0+**
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

### 🔽 Passos de Instalação

1. **Clone o repositório**:
```bash
git clone https://github.com/IuryHilario/AlgoritmoDijkstra.git
cd AlgoritmoDijkstra
```

2. **Instale as dependências**:
```bash
pip install -r requirements.txt
```

3. **Execute a aplicação**:
```bash
python app.py
```

4. **Acesse no navegador**:
```
http://localhost:5000
```

### 📦 Dependências

```txt
Flask==2.3.3
```

## 🔧 Como Usar

### 1️⃣ **Criando um Grafo**

#### Método Manual:
1. **Definir Vértices**: Insira um número de 2 a 26 vértices
2. **Criar Grafo**: Clique em "Criar" para gerar a estrutura vazia
3. **Adicionar Arestas**:
   - Clique em "Adicionar Arestas"
   - Selecione vértice de origem
   - Selecione vértice de destino
   - Defina o peso da aresta 

#### Método Automático:
1. **Gerar Aleatoriamente**: Clique em "Gerar Grafo Aleatório"
   - Cria conectividade garantida entre todos os vértices
   - Adiciona arestas extras para densidade variável
   - Pesos aleatórios entre 1 e 9

### 2️⃣ **Encontrando Caminhos**

1. **Ativar Modo**: Clique em "Encontrar Caminho Mínimo"
2. **Selecionar Origem**: Clique no vértice de partida (fica verde)
3. **Selecionar Destino**: Clique no vértice de chegada (fica vermelho)
4. **Ver Resultado**: O caminho mínimo será destacado automaticamente

### 3️⃣ **Interpretando Resultados**

#### 📊 Painel de Resultados:
- **🎉 Caminho Encontrado**: Confirmação de sucesso
- **📏 Distância Mínima**: Soma total dos pesos do caminho
- **🛤️ Caminho**: Sequência de vértices (A → B → C)
- **📊 Estatísticas**: Número de saltos e vértices visitados

#### 🎨 Legendas Visuais:
- 🔵 **Azul**: Vértices normais
- 🟢 **Verde**: Vértice de origem
- 🔴 **Vermelho**: Vértice de destino
- 🟡 **Amarelo**: Arestas do caminho mínimo

### 4️⃣ **Exportando Dados**

#### 🖼️ **Salvar Grafo (PNG)**:
- Exporta visualização atual do grafo
- Inclui vértices, arestas e caminho destacado
- Formato: `grafo_dijkstra.png`

#### 📋 **Salvar Matriz (CSV)**:
- Exporta matriz de adjacência
- Formato compatível com Excel/Google Sheets
- Arquivo: `matriz_adjacencia.csv`

## 📊 Estrutura do Projeto

```
AlgoritmoDijkstra/
│
├── 📄 app.py                 # Servidor Flask principal
├── 📄 requirements.txt       # Dependências Python
├── 📄 vercel.json           # Configuração de deploy
├── 📄 README.md             # Documentação
│
├── 📁 templates/
│   └── 📄 index.html        # Interface principal
│
└── 📁 static/
    ├── 📄 script.js         # Lógica JavaScript
    └── 📄 styles.css        # Estilos CSS
```

### 🗂️ Descrição dos Arquivos

| Arquivo | Responsabilidade |
|---------|------------------|
| `app.py` | Backend Flask, API REST, implementação do algoritmo |
| `index.html` | Estrutura HTML, layout da interface |
| `script.js` | Interatividade, canvas, eventos, comunicação com API |
| `styles.css` | Design responsivo, animações, tema visual |

## 🧮 Algoritmo

### 📐 **Algoritmo de Dijkstra**

O **Algoritmo de Dijkstra** é um algoritmo guloso que encontra o caminho mais curto entre um vértice origem e todos os outros vértices em um grafo com pesos não-negativos.

#### 🔄 **Funcionamento**:

1. **Inicialização**:
   - Distância do vértice origem = 0
   - Distância dos demais vértices = -
   - Conjunto de vértices não visitados

2. **Iteração**:
   - Seleciona vértice não visitado com menor distância
   - Atualiza distâncias dos vizinhos
   - Marca vértice como visitado

3. **Finalização**:
   - Reconstroi caminho usando vértices anteriores
   - Retorna distância mínima e sequência de vértices

#### ⚡ **Complexidade**:
- **Tempo**: O(V² + E) - implementação simples
- **Espaço**: O(V) - para arrays de distância e predecessores

#### 🎯 **Casos de Uso**:
- Sistemas de navegação GPS
- Roteamento de redes
- Jogos (pathfinding)
- Planejamento de rotas logísticas

### 🔍 **Implementação**

```python
def dijkstra(graph, start, end):
    # Inicializar distâncias
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    previous_nodes = {node: None for node in graph}
    unvisited = set(graph.keys())

    while unvisited:
        # Encontrar nó com menor distância
        current_node = min(unvisited, key=lambda node: distances[node])

        if distances[current_node] == float('infinity'):
            break

        unvisited.remove(current_node)

        # Atualizar vizinhos
        for neighbor, weight in graph[current_node].items():
            if neighbor in unvisited:
                new_distance = distances[current_node] + weight
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    previous_nodes[neighbor] = current_node

    # Reconstruir caminho
    path = []
    current = end
    while current is not None:
        path.insert(0, current)
        current = previous_nodes[current]

    return {
        "distancia": distances[end] if distances[end] != float('infinity') else None,
        "caminho": path
    }
```

## 🎨 Interface

### 🖥️ **Layout Responsivo**

A interface é dividida em **3 painéis principais**:

#### 1️⃣ **Painel de Controle (Esquerda)**
- **🔧 Criar Grafo**: Configurações iniciais
- **🎮 Ações**: Modos de interação (adicionar arestas, encontrar caminho)
- **🧹 Limpeza**: Reset do grafo atual

#### 2️⃣ **Área de Visualização (Centro)**
- **🎨 Canvas Interativo**: Renderização do grafo
- **🏷️ Legenda**: Códigos de cores e símbolos
- **🖱️ Interação**: Cliques e hover nos vértices

#### 3️⃣ **Painel de Resultados (Direita)**
- **📊 Matriz de Adjacência**: Representação tabular
- **🎯 Resultados**: Caminho e distância encontrados
- **💾 Exportação**: Download de arquivos

## 📁 Exportação

### 🖼️ **Exportar Grafo (PNG)**

Salva uma imagem do estado atual do grafo:

**Características**:
- ✅ Resolução alta (900x500px)
- ✅ Inclui vértices rotulados
- ✅ Mostra pesos das arestas
- ✅ Destaca caminho mínimo (se calculado)
- ✅ Formato PNG transparente

**Uso**:
```javascript
document.getElementById("downloadGraph").click();
// Baixa: grafo_dijkstra.png
```

### 📊 **Exportar Matriz (CSV)**

Salva a matriz de adjacência em formato CSV:

**Formato**:
```csv
,A,B,C,D
A,0,5,0,3
B,0,0,2,0
C,0,0,0,0
D,0,0,1,0
```

**Características**:
- ✅ Compatível com Excel/Google Sheets
- ✅ Cabeçalhos com rótulos dos vértices
- ✅ Valores numéricos dos pesos
- ✅ Zeros para ausência de arestas

**Uso**:
```javascript
document.getElementById("downloadMatrix").click();
// Baixa: matriz_adjacencia.csv
```

### 💡 **Casos de Uso para Exportação**

1. **📚 Educacional**:
   - Preparar material didático
   - Exercícios para estudantes
   - Documentação de exemplos

2. **📊 Acadêmico**:
   - Artigos científicos
   - Apresentações
   - Relatórios de pesquisa

3. **💼 Profissional**:
   - Documentação de sistemas
   - Análise de redes
   - Planejamento logístico

## 🔬 Tecnologias

### 🛠️ **Stack Tecnológico**

| Camada | Tecnologia | Versão | Propósito |
|--------|------------|---------|-----------|
| **Backend** | Python | 3.7+ | Lógica do servidor |
| **Framework** | Flask | 2.3+ | API REST e roteamento |
| **Frontend** | HTML5 | - | Estrutura da página |
| **Estilo** | CSS3 | - | Design e layout |
| **Interação** | JavaScript | ES6+ | Lógica do cliente |
| **Canvas** | HTML5 Canvas | - | Renderização gráfica |

### 🏗️ **Arquitetura**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Algoritmo     │
│                 │    │                 │    │                 │
│ • HTML5 Canvas  │◄──►│ • Flask Router  │◄──►│ • Dijkstra      │
│ • JavaScript    │    │ • JSON API      │    │ • Validação     │
│ • CSS3          │    │ • Error Handle  │    │ • Otimização    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔧 **APIs e Endpoints**

#### **GET /**
- **Descrição**: Página principal da aplicação
- **Retorno**: Renderiza `index.html`

#### **POST /dijkstra**
- **Descrição**: Executa algoritmo de Dijkstra
- **Parâmetros**:
  ```json
  {
    "graph": {"A": {"B": 5}, "B": {"C": 2}},
    "start": "A",
    "end": "C"
  }
  ```
- **Retorno**:
  ```json
  {
    "distancia": 7,
    "caminho": ["A", "B", "C"]
  }
  ```

## 🤝 Contribuições

Contribuições são bem-vindas! Siga estas diretrizes:

### 🔄 **Processo de Contribuição**

1. **Fork** do repositório
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Faça** suas alterações
5. **Teste** thoroughly
6. **Commit** com mensagens descritivas
7. **Push** para sua branch
8. **Abra** um Pull Request

### 🐛 **Reportando Bugs**

Use o template de issue:

```markdown
## Descrição do Bug
Descrição clara e concisa do problema.

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '....'
3. Role até '....'
4. Veja o erro

## Comportamento Esperado
O que deveria acontecer.

## Screenshots
Se aplicável, adicione screenshots.

## Ambiente
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Versão: [e.g. 1.0.0]
```

### ✨ **Sugestões de Features**

Áreas abertas para contribuição:

1. **🎨 Melhorias Visuais**:
   - Animações de transição
   - Temas personalizáveis
   - Modo escuro

2. **🔧 Funcionalidades**:
   - Algoritmos alternativos (A*, Bellman-Ford)
   - Grafos não-direcionados
   - Importação de grafos

3. **📊 Analytics**:
   - Estatísticas de performance
   - Histórico de execuções
   - Comparação de algoritmos


## ⭐ Apoie o Projeto

Se este projeto foi útil para você, considere:

- ⭐ **Dar uma estrela** no GitHub
- 🐛 **Reportar bugs** que encontrar
- 💡 **Sugerir melhorias**
- 📢 **Compartilhar** com outros desenvolvedores
- 🤝 **Contribuir** com código

---
