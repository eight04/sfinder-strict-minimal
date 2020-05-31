const parse = require("csv-parse/lib/sync");

function csvToPatterns(data) {
  const patterns = parse(data, {
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
  
  // https://github.com/knewjade/solution-finder/issues/3
  const map = new Map;
  for (const p of patterns) {
    map.set(p.pattern, p);
  }
  return [...map.values()];
}

function patternsToGraph(patterns) {
  const fumenStore = createFumenStore();
  const edges = patterns.map(p => ({
    nodes: new Set(p.fumens.map(fumenStore.fumenToNode)),
    color: 0,
    // visit: 0,
    // groupId: 0
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
  
  const cleanNodes = nodes.filter(n => n.edges.size);
  
  cleanNodes.sort((a, b) => a.edges.size - b.edges.size);
  
  for (const node of cleanNodes) {
    if (node.redundant) continue;
    
    for (const siblingNode of setFirst(node.edges).nodes) {
      if (siblingNode === node) continue;
      
      if (setEqual(node.edges, siblingNode.edges)) {
        siblingNode.redundant = true;
        node.alter.push(siblingNode);
      }
    }
  }
  
  for (const edge of cleanEdges) {
    for (const node of edge.nodes) {
      if (node.redundant) {
        edge.nodes.delete(node);
      }
    }
  }
  
  return {
    edges: cleanEdges,
    nodes: cleanNodes.filter(n => !n.redundant)
  };
}

function setEqual(a, b) {
  if (a.size !== b.size) {
    return false;
  }
  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
}

function findMinimalNodes(edges) {
  const currentNodes = [];
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
      node.color++;
      if (node.color > 1) continue; // the node has been tried by other edges
      
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
    for (const node of edge.nodes) {
      node.color--;
    }
  }
}

/*
function findMinimalNodes2(nodes) {
  let currentNodes = [];
  let resultCount = 50;
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
    
    if (index >= nodes.length) {
      if (currentNodes.length < resultCount) {
        resultCount = currentNodes.length;
        resultNodeSet.length = 0;
      }
      resultNodeSet.push(currentNodes.slice());
      // if (!(resultNodeSet.length % 100)) {
        // console.log(currentNodes.length, resultNodeSet.length);
      // }
      return;
    }
    
    const node = nodes[index];
    
    // node.color++;
    
    let mustPick = false;
    let allColored = true;
    
    for (const edge of node.edges) {
      edge.visit++;
      if (!edge.color) {
        allColored = false;
        if (edge.visit >= edge.nodes.size) {
          mustPick = true;
        }
      }
    }
    
    if (!allColored && currentNodes.length < resultCount) {
      currentNodes.push(node);
      for (const edge of node.edges) {
        edge.color++;
      }
      digest(index + 1);
      currentNodes.pop();
      for (const edge of node.edges) {
        edge.color--;
      }
    }
    
    if (!mustPick) {
      digest(index + 1);
    }
    
    for (const edge of node.edges) {
      edge.visit--;
    }
    
    // node.color--;
  }
}
*/

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
      color: 0,
      alter: []
      // groupId: 0,
      // pick: false
    };
    fumenMap.set(fumen, node);
    return node;
  }
}

module.exports = {
  csvToPatterns,
  patternsToGraph,
  findMinimalNodes,
  // findMinimalNodes2
};
