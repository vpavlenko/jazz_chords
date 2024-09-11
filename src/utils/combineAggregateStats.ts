import { AggregateStats } from './calculateAggregateStats';

export function combineAggregateStats(
  stats1: AggregateStats,
  stats2: AggregateStats
): AggregateStats {
  const combinedStats: AggregateStats = {
    singleTokens: [],
    tokenPairs: [],
    tokenTriples: [],
    tokenQuadruples: [],
    tokenQuintuples: [],
    tokenSextuples: [],
    tokenSeptuples: [],
    tokenOctuples: [],
  };

  for (const key in stats1) {
    combinedStats[key as keyof AggregateStats] = combineTokenCounts(
      stats1[key as keyof AggregateStats],
      stats2[key as keyof AggregateStats]
    );
  }

  return combinedStats;
}

function combineTokenCounts(
  counts1: [string, number][],
  counts2: [string, number][]
): [string, number][] {
  const combinedCounts = new Map<string, number>();

  for (const [token, count] of counts1) {
    combinedCounts.set(token, (combinedCounts.get(token) || 0) + count);
  }

  for (const [token, count] of counts2) {
    combinedCounts.set(token, (combinedCounts.get(token) || 0) + count);
  }

  return Array.from(combinedCounts.entries()).sort((a, b) => b[1] - a[1]);
}

export function combineMultipleAggregateStats(statsArray: AggregateStats[]): AggregateStats | null {
  if (statsArray.length === 0) return null;
  if (statsArray.length === 1) return statsArray[0];

  return statsArray.reduce((acc, curr) => combineAggregateStats(acc, curr));
}
