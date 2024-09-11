type TokenCounts = { [key: string]: number };

export interface AggregateStats {
  singleTokens: [string, number][];
  tokenPairs: [string, number][];
  tokenTriples: [string, number][];
  tokenQuadruples: [string, number][];
  tokenQuintuples: [string, number][];
  tokenSextuples: [string, number][];
  tokenSeptuples: [string, number][];
  tokenOctuples: [string, number][];
}

export function calculateAggregateStats(relativeForm: string[][]): AggregateStats {
  const singleTokens: TokenCounts = {};
  const tokenPairs: TokenCounts = {};
  const tokenTriples: TokenCounts = {};
  const tokenQuadruples: TokenCounts = {};
  const tokenQuintuples: TokenCounts = {};
  const tokenSextuples: TokenCounts = {};
  const tokenSeptuples: TokenCounts = {};
  const tokenOctuples: TokenCounts = {};

  relativeForm.forEach((line) => {
    line.forEach((chord, index) => {
      const tokens = chord.split(' ');

      // Single tokens
      tokens.forEach((token) => {
        singleTokens[token] = (singleTokens[token] || 0) + 1;
      });

      // Token pairs to octuples
      for (let i = 2; i <= 8; i++) {
        if (index + i - 1 < line.length) {
          const sequence = line.slice(index, index + i).join(' ');
          const targetObject =
            i === 2
              ? tokenPairs
              : i === 3
              ? tokenTriples
              : i === 4
              ? tokenQuadruples
              : i === 5
              ? tokenQuintuples
              : i === 6
              ? tokenSextuples
              : i === 7
              ? tokenSeptuples
              : tokenOctuples;
          targetObject[sequence] = (targetObject[sequence] || 0) + 1;
        }
      }
    });
  });

  return {
    singleTokens: sortObjectByValue(singleTokens),
    tokenPairs: sortObjectByValue(tokenPairs),
    tokenTriples: sortObjectByValue(tokenTriples),
    tokenQuadruples: sortObjectByValue(tokenQuadruples),
    tokenQuintuples: sortObjectByValue(tokenQuintuples),
    tokenSextuples: sortObjectByValue(tokenSextuples),
    tokenSeptuples: sortObjectByValue(tokenSeptuples),
    tokenOctuples: sortObjectByValue(tokenOctuples),
  };
}

function countTokens(tokens: string[]): TokenCounts {
  return tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {} as TokenCounts);
}

function countNGrams(tokens: string[], n: number): TokenCounts {
  const nGrams: TokenCounts = {};
  for (let i = 0; i <= tokens.length - n; i++) {
    const nGram = tokens.slice(i, i + n).join(' ');
    nGrams[nGram] = (nGrams[nGram] || 0) + 1;
  }
  return nGrams;
}

function sortTokenCounts(tokenCounts: TokenCounts): [string, number][] {
  return Object.entries(tokenCounts).sort((a, b) => b[1] - a[1]);
}

function sortObjectByValue(obj: TokenCounts): [string, number][] {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}
