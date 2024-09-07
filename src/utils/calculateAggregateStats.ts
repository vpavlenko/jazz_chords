type TokenCounts = { [key: string]: number };

export function calculateAggregateStats(relativeForm: string[][]) {
  const allTokens = relativeForm.flat().flatMap((chord) => chord.split(' '));

  const singleTokens = countTokens(allTokens);
  const tokenPairs = countNGrams(allTokens, 2);
  const tokenTriples = countNGrams(allTokens, 3);
  const tokenQuadruples = countNGrams(allTokens, 4);
  // ... up to token octuples

  return {
    singleTokens: sortTokenCounts(singleTokens),
    tokenPairs: sortTokenCounts(tokenPairs),
    tokenTriples: sortTokenCounts(tokenTriples),
    tokenQuadruples: sortTokenCounts(tokenQuadruples),
    // ... up to token octuples
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
