const parse = require("csv-parse/lib/sync");

function parseCSVToSolutions(data) {
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
  
  const successPatterns = patterns.filter(p => p.solutionCount);
  
  // collect all solutions
  const solutions = new Map;
  for (const pattern of patterns) {
    for (const fumen of pattern.fumens) {
      let sol = solutions.get(fumen);
      if (!sol) {
        sol = {
          fumen,
          patterns: new Set
        };
        solutions.set(fumen, sol);
      }
      
      sol.patterns.add(pattern.pattern);
    }
  }
  
  const solutionArray = Array.from(solutions.values()).sort((a, b) => b.patterns.size - a.patterns.size);
  
  return {
    patterns,
    successPatterns,
    solutions: solutionArray
  };
}

function findMinimalCombination(solutions) {
  const state = {
    solutionArray: solutions,
    resultArray: [],
    solutionCount: 0,
    coveredPatterns: new Set,
    finalSets: [],
    finalCount: solutions.length + 1
  };
  
  digest(state, 0);
  
  return {
    count: state.finalCount,
    sets: state.finalSets
  };
}

function digest(state, index) {
  if (index >= state.solutionArray.length) {
    if (state.solutionCount > state.finalCount) {
      return;
    }
    if (state.solutionCount < state.finalCount) {
      state.finalCount = state.solutionCount;
      state.finalSets = [state.resultArray.slice()];
      return;
    }
    state.finalSets.push(state.resultArray.slice());
    return;
  }
  
  const sol = state.solutionArray[index];
  const newPatterns = []; // patterns that will be covered if we use this solution
  for (const pattern of sol.patterns) {
    if (state.coveredPatterns.has(pattern)) {
      continue;
    }
    newPatterns.push(pattern);
  }
  
  if (!newPatterns.length) {
    digest(state, index + 1);
    return;
  }
  
  if (newPatterns.every(p => insideSolution(p, state.solutionArray, index + 1))) {
    // try not to use this solution
    digest(state, index + 1);
  }
  
  // use this solution
  state.resultArray.push(sol);
  state.solutionCount++;
  for (const pattern of newPatterns) {
    state.coveredPatterns.add(pattern);
  }
  digest(state, index + 1);
  // revert
  state.resultArray.pop();
  state.solutionCount--;
  for (const pattern of newPatterns) {
    state.coveredPatterns.delete(pattern);
  }
}

function insideSolution(pattern, solutions, index) {
  for (let i = index; i < solutions.length; i++) {
    if (solutions[i].patterns.has(pattern)) {
      return true;
    }
  }
  return false;
}

module.exports = {
  parseCSVToSolutions,
  findMinimalCombination
};