const parse = require("csv-parse/lib/sync");

function csvToPatterns(data) {
  return parse(data, {
    cast: (value, {index}) => {
      if (index === 1) {
        return Number(value);
      }
      if (index > 1) {
        if (!value) {
          return [];
        }
        return value.split(";");
      }
      return value;
    },
    from: 2,
    columns: [
      "pattern", "solutionCount", "solutions", "unusedMinos", "fumens"
    ]
  });
}

function patternsToGraph(patterns) {
  const fumenStore = createFumenStore();
  const edges = patterns.map(p => ({
    nodes: new Set(p.fumens.map(fumenStore.fumenToNode)),
    color: 0,
    groupId: 0
  }));
  for (const edge of edges) {
    for (const node of edge.nodes) {
      node.edges.add(edge);
    }
  }
  edges.sort((a, b) => a.nodes.size - b.nodes.size);
  
  for (const edge of edges) {
    if (edge.redundant) continue;
    
    for (const siblingEdge of setFirst(edge.nodes).edges) {
      if (edge === siblingEdge) continue;
      
      if (setContain(siblingEdge.nodes, edge.nodes)) {
        siblingEdge.redundant = true;
      }
    }
  }
  
  const cleanEdges = edges.filter(e => !e.redundant);
  const nodes = [...fumenStore.getNodes()];
  for (const node of nodes) {
    for (const edge of node.edges) {
      if (edge.redundant) {
        node.edges.delete(edge);
      }
    }
  }
  
  return {
    edges: cleanEdges,
    nodes
  };
}

function findMinimalNodes(edges) {
  let currentNodes = [];
  let resultCount = Infinity;
  const resultNodeSet = [];
  digest(0);
  return {
    count: resultCount,
    sets: resultNodeSet
  };
  
  function digest(index) {
    if (currentNodes.length > resultCount) {
      return;
    }
    
    if (index >= edges.length) {
      if (currentNodes.length < resultCount) {
        resultCount = currentNodes.length;
        resultNodeSet.length = 0;
      }
      resultNodeSet.push(currentNodes.slice());
      return;
    }
    
    const edge = edges[index];
    
    if (edge.color) {
      digest(index + 1);
      return;
    }
    
    for (const node of edge.nodes) {
      currentNodes.push(node);
      for (const siblingEdge of node.edges) {
        siblingEdge.color++;
      }
      digest(index + 1);
      currentNodes.pop();
      for (const siblingEdge of node.edges) {
        siblingEdge.color--;
      }
    }
  }
}

function setContain(a, b) {
  for (const item of b) {
    if (!a.has(item)) {
      return false;
    }
  }
  return true;
}

function setFirst(s) {
  return s.values().next().value;
}

function createFumenStore() {
  const fumenMap = new Map;
  return {
    fumenToNode,
    getNodes: () => fumenMap.values()
  };
  
  function fumenToNode(fumen) {
    if (fumenMap.has(fumen)) {
      return fumenMap.get(fumen);
    }
    const node = {
      key: fumen,
      edges: new Set,
      groupId: 0
    };
    fumenMap.set(fumen, node);
    return node;
  }
}

module.exports = {
  csvToPatterns,
  patternsToGraph,
  findMinimalNodes
};