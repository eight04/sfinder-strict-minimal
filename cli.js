#!/usr/bin/env node

// eslint-disable no-console

const fs = require("fs");
const {csvToPatterns, patternsToGraph, findMinimalNodes} = require(".");

main();

function main() {
  const data = fs.readFileSync(0, "utf8");
  
  const startTime = Date.now();
  
  const patterns = csvToPatterns(data);
  const successPatterns = patterns.filter(p => p.solutionCount);  
  console.log(`${patterns.length} patterns, ${successPatterns.length} success`);
  
  const {edges, nodes} = patternsToGraph(successPatterns);
  console.log(`${edges.length} edges, ${nodes.length} nodes`);
  
  const {count, sets} = findMinimalNodes(edges);
  // const {count, sets} = findMinimalNodes2(nodes);
  console.log(`Finished in ${(Date.now() - startTime) / 1000}s`);
  
  console.log(`You must learn ${count} solutions to cover all patterns. There are ${sets.length} combinations of solutions to cover all patterns.`);
  
  // make sure there is no duplicate set?
  // const s = new Set;
  // for (const set of sets) {
    // const hash = hashNodes(set, nodes);
    // if (s.has(hash)) {
      // throw new Error("Duplicate set");
    // }
    // s.add(hash);
  // }
  
  // function hashNodes(set, nodes) {
    // const result = [];
    // for (let i = 0; i < nodes.length; i++) {
      // if (set.includes(nodes[i])) {
        // result.push(i);
      // }
    // }
    // return result.join(",");
  // }
  
  // try to find cmmon set?
  // const firstSet = sets[0];
  // const commonNodes = [];
  // for (const node of firstSet) {
    // let inOther = true;
    // for (const otherSet of sets.slice(1)) {
      // if (!otherSet.includes(node)) {
        // inOther = false;
        // break;
      // }
    // }
    // if (inOther) {
      // commonNodes.push(node);
    // }
  // }
  // console.log(`${commonNodes.length} common solutions`);
  
  const solutionMap = new Map();
  for (const pattern of patterns) {
    for (const fumen of pattern.fumens) {
      let sol = solutionMap.get(fumen);
      if (!sol) {
        sol = {
          fumen,
          patterns: []
        };
        solutionMap.set(fumen, sol);
      }
      sol.patterns.push(pattern.pattern);
    }
  }
  
  // make sure there are enough patterns?
  // for (const nodes of sets) {
    // const s = new Set;
    // for (const node of nodes) {
      // for (const pattern of solutionMap.get(node.key).patterns) {
        // s.add(pattern);
      // }
    // }
    // if (s.size !== successPatterns.length) {
      // throw new Error("Some patterns are missing");
    // }
  // }
  
  const solutions = sets[0].map(n => solutionMap.get(n.key));
  solutions.sort((a, b) => b.patterns.length - a.patterns.length);
  
  fs.writeFileSync("path_minimal_strict.md", `
${solutions.length} minimal solutions  
Success rate: ${(100 * successPatterns.length / patterns.length).toFixed(2)}% (${successPatterns.length} / ${patterns.length})

### Summary

${solutions.map(solutionToImage).join(" ")}

### Details

${solutions.map(s => solutionToMarkdown(s, successPatterns.length)).join("\n")}
`);
}

function solutionToImage(sol) {
  return `[${fumenImage(sol.fumen)}](${fumenLink(sol.fumen)})`;
}

function solutionToMarkdown(sol, allPatternCount) {
  return `
[${fumenImage(sol.fumen)}](${fumenLink(sol.fumen)})

${sol.patterns.length} patterns (${(100 * sol.patterns.length / allPatternCount).toFixed(2)}%)

\`\`\`
${[...sol.patterns].join(",")}
\`\`\`
`;
}

function fumenImage(fumen) {
  return `![fumen image](https://fumen-svg-server--eight041.repl.co/?data=${encodeURIComponent(fumen)})`;
}

function fumenLink(fumen) {
  return `https://harddrop.com/fumen/?${fumen}`;
}
