export function combineAggregateStats(stats1: any, stats2: any): any {
  const combinedStats: any = {};

  for (const key in stats1) {
    combinedStats[key] = combineTokenCounts(stats1[key], stats2[key]);
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

export function combineMultipleAggregateStats(statsArray: any[]): any {
  if (statsArray.length === 0) return null;
  if (statsArray.length === 1) return statsArray[0];

  return statsArray.reduce((acc, curr) => combineAggregateStats(acc, curr));
}
