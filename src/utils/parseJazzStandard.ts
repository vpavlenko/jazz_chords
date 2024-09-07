interface JazzStandard {
  title: string;
  composedBy: string;
  dbKeySig: string;
  timeSig: string;
  bars: number;
  chordLines: string[][];
  metadata: Record<string, string>;
}

export function parseJazzStandard(data: string): JazzStandard {
  const lines = data.trim().split('\n');
  const jazzStandard: JazzStandard = {
    title: '',
    composedBy: '',
    dbKeySig: '',
    timeSig: '',
    bars: 0,
    chordLines: [],
    metadata: {},
  };

  lines.forEach((line) => {
    if (line.startsWith('Title =')) {
      jazzStandard.title = line.split('=')[1].trim();
    } else if (line.startsWith('ComposedBy =')) {
      jazzStandard.composedBy = line.split('=')[1].trim();
    } else if (line.startsWith('DBKeySig =')) {
      jazzStandard.dbKeySig = line.split('=')[1].trim();
    } else if (line.startsWith('TimeSig =')) {
      jazzStandard.timeSig = line.split('=')[1].trim();
    } else if (line.startsWith('Bars =')) {
      jazzStandard.bars = parseInt(line.split('=')[1].trim());
    } else if (line.trim() !== '') {
      jazzStandard.chordLines.push(
        line
          .trim()
          .split('|')
          .map((chord) => chord.trim())
          .filter((chord) => chord !== '')
      );
    }
  });

  return jazzStandard;
}
