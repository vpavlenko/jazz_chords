interface JazzStandard {
  title: string;
  composedBy: string;
  dbKeySig: string;
  timeSig: string;
  bars: number;
  chordLines: string[][];
  metadata: Record<string, string>;
}

export function parseJazzStandard(input: string): JazzStandard {
  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);
  const metadata: Record<string, string> = {};
  const chordLines: string[][] = [];

  let currentLine: string[] = [];

  for (const line of lines) {
    if (line.includes('=')) {
      const [key, value] = line.split('=').map((part) => part.trim());
      metadata[key] = value;
    } else if (line.includes('|')) {
      currentLine = line
        .split('|')
        .map((chord) => chord.trim())
        .filter((chord) => chord);
      chordLines.push(currentLine);
    }
  }

  return {
    title: metadata['Title'] || '',
    composedBy: metadata['ComposedBy'] || '',
    dbKeySig: metadata['DBKeySig'] || '',
    timeSig: metadata['TimeSig'] || '',
    bars: parseInt(metadata['Bars'] || '0', 10),
    chordLines,
    metadata,
  };
}
