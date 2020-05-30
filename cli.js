#!/usr/bin/env node

const fs = require("fs");
const {parseCSVToSolutions, findMinimalCombination} = require(".");

const data = fs.readFileSync(0, "utf8");

const {patterns, successPatterns, solutions} = parseCSVToSolutions(data);

const {count, sets} = findMinimalCombination(solutions);

console.log(`You must learn ${count} solutions to cover all patterns. There are ${sets.length} combinations of solutions to cover all patterns.`); // eslint-disable-line no-console
  
sets.forEach((set, i) => {
  fs.writeFileSync(`path_minimal_strict_${i}.md`, `
${set.length} minimal solutions  
Success rate: ${(100 * successPatterns.length / patterns.length).toFixed(2)}% (${successPatterns.length} / ${patterns.length})

${set.map(solutionToMarkdown).join("\n")}
`);
});

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
