#!/usr/bin/env node

/* eslint-disable no-console */

const fs = require("fs");
const {decoder, encoder} = require("tetris-fumen");
const {csvToPatterns, patternsToGraph, findMinimalNodes} = require(".");

main();

function main() {
  const data = fs.readFileSync(0, "utf8");
  let ignoreData;
  try {
    ignoreData = fs.readFileSync(".sfinder-minimal-ignore", "utf8");
  } catch (err) {
    // pass
  }
  const ignoreFumens = ignoreData ? new Set(ignoreData.split(/\n/).map(s => s.trim()).filter(Boolean).filter(s => s.startsWith("#"))) : null;
  
  const startTime = Date.now();
  
  const patterns = csvToPatterns(data);
  const successPatterns = patterns.filter(p => p.solutionCount);
  console.log(`${patterns.length} patterns, ${successPatterns.length} success`);
  
  if (ignoreFumens) {
    console.log(`Ignore ${ignoreFumens.size} fumens`);
    for (const pattern of successPatterns) {
      pattern.fumens = pattern.fumens.filter(f => !ignoreFumens.has(f));
    }
  }
  
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
    const solutions = set.map(n => {
      const sol = solutionMap.get(n.key);
      const alters = n.alter.map(n => solutionMap.get(n.key));
      return {
        fumen: sol.fumen,
        patterns: sol.patterns,
        alters
      };
    });
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
  const fumen = sol.alters.length ? fumenJoin([sol.fumen, ...sol.alters.map(a => a.fumen)]) : sol.fumen;
  return `[${fumenImage(fumen)}](${fumenLink(fumen)})`;
}

function fumenJoin(fumens) {
  return encoder.encode(fumens.map(decoder.decode).flat());
}

function solutionToMarkdown(sol, allPatternCount) {
  return `
${solutionToImage(sol)}

${sol.patterns.length} patterns (${(100 * sol.patterns.length / allPatternCount).toFixed(2)}%)

\`\`\`
${[...sol.patterns].join(",")}
\`\`\`
`;
}

function fumenImage(fumen) {
  return `![fumen image](https://fumen-svg-server--eight041.repl.co/?delay=1500&data=${encodeURIComponent(fumen)})`;
}

function fumenLink(fumen) {
  return `https://harddrop.com/fumen/?${fumen}`;
}
