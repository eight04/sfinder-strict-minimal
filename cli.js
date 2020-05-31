#!/usr/bin/env node

/* eslint-disable no-console */

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
  console.log(`Finished in ${(Date.now() - startTime) / 1000}s`);
  
  console.log(`You must learn ${count} solutions to cover all patterns. There are ${sets.length} combinations of solutions to cover all patterns.`);
  
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
  
  console.log("Output first 10 combinations");
  
  sets.slice(0, 10).forEach((set, i) => {
    const solutions = set.map(n => solutionMap.get(n.key));
    solutions.sort((a, b) => b.patterns.length - a.patterns.length);
    output({
      filename: `path_minimal_strict_${i + 1}.md`,
      solutions,
      patternCount: patterns.length,
      successCount: successPatterns.length
    });
  });
}

function output({filename, solutions, patternCount, successCount}) {
  fs.writeFileSync(filename, `
${solutions.length} minimal solutions  
Success rate: ${(100 * successCount / patternCount).toFixed(2)}% (${successCount} / ${patternCount})

### Summary

${solutions.map(solutionToImage).join(" ")}

### Details

${solutions.map(s => solutionToMarkdown(s, successCount)).join("\n")}
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
