#!/usr/bin/env node

// eslint-disable no-console

const fs = require("fs");
const {csvToPatterns, patternsToGraph, findMinimalNodes} = require(".");

main();

// sets.forEach((set, i) => {
  // fs.writeFileSync(`path_minimal_strict_${i}.md`, `
// ${set.length} minimal solutions  
// Success rate: ${(100 * successPatterns.length / patterns.length).toFixed(2)}% (${successPatterns.length} / ${patterns.length})

// ### Summary

// ${set.map(solutionToImage).join(" ")}

// ### Details

// ${set.map(solutionToMarkdown).join("\n")}
// `);
// });

function main() {
  const data = fs.readFileSync(0, "utf8");
  
  const startTime = Date.now();
  
  const patterns = csvToPatterns(data);
  const successPatterns = patterns.filter(p => p.solutionCount);  
  console.log(`${patterns.length} patterns, ${successPatterns.length} success`);
  
  const {edges, nodes} = patternsToGraph(successPatterns);
  console.log(`${edges.length} edges, ${nodes.length} nodes`);
  
  const {count, sets} = findMinimalNodes(edges);
  console.log(`Finished in ${(Date.now() - startTime) / 1000}s`);
  
  console.log(`You must learn ${count} solutions to cover all patterns. There are ${sets.length} combinations of solutions to cover all patterns.`);
}

function solutionToImage(sol) {
  return `[${fumenImage(sol.fumen)}](${fumenLink(sol.fumen)})`;
}

function solutionToMarkdown(sol) {
  return `
[${fumenImage(sol.fumen)}](${fumenLink(sol.fumen)})

${sol.patterns.size} patterns (${(100 * sol.patterns.size / successPatterns.length).toFixed(2)}%)

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

function parseCSV(data) {
  return 
}