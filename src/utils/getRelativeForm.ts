const chordQualities: { [key: string]: string } = {
  '': 'maj',
  m: 'm',
  maj7: 'maj7',
  M7: 'maj7',
  M9: 'maj7',
  m7: 'm',
  m6: 'm',
  m9: 'm',
  m11: 'm',
  m13: 'm',
  '7': '7',
  '9': '7',
  '11': '7',
  '13': '7',
  dim: 'dim',
  aug: 'aug',
  '6': 'maj',
  sus4: 'sus4',
  sus2: 'sus2',
  '7sus4': '7',
  '7b5': '7',
  '7#5': '7',
  '7b9': '7',
  '7#9': '7',
  '7#11': '7',
  add9: 'maj',
  madd9: 'm',
};

const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getRelativeForm(chordLines: string[][]): string[][] {
  // Flatten and remove repeated chords
  const flattenedChords = chordLines.flatMap((line) =>
    line.filter((chord, index, array) => index === 0 || chord !== array[index - 1])
  );

  let prevRoot: string | null = null;
  const relativeChords = flattenedChords.map((chord, index) => {
    const [root, quality] = parseChord(chord);
    let relativeChord = chordQualities[quality] || quality;

    if (prevRoot) {
      const interval = getInterval(prevRoot, root);
      relativeChord = `(${interval > 0 ? '+' : ''}${interval}) ${relativeChord}`;
    } else {
      // For the first chord, we'll just show its quality
      relativeChord = `(start) ${relativeChord}`;
    }

    prevRoot = root;
    return relativeChord;
  });

  // Split the relative chords back into lines of the same length as the original
  const result: string[][] = [];
  let currentIndex = 0;
  for (const line of chordLines) {
    const lineLength = line.filter(
      (chord, index, array) => index === 0 || chord !== array[index - 1]
    ).length;
    result.push(relativeChords.slice(currentIndex, currentIndex + lineLength));
    currentIndex += lineLength;
  }

  return result;
}

function parseChord(chord: string): [string, string] {
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return ['', ''];
  const [, root, quality] = match;
  return [root, chordQualities[quality] || 'maj'];
}

function getInterval(from: string, to: string): number {
  const normalizeRoot = (root: string) => {
    if (root.length === 2 && root[1] === 'b') {
      const flatToSharp: { [key: string]: string } = {
        Db: 'C#',
        Eb: 'D#',
        Gb: 'F#',
        Ab: 'G#',
        Bb: 'A#',
      };
      return flatToSharp[root] || root;
    }
    return root;
  };

  const normalizedFrom = normalizeRoot(from);
  const normalizedTo = normalizeRoot(to);

  const fromIndex = noteOrder.indexOf(normalizedFrom);
  const toIndex = noteOrder.indexOf(normalizedTo);
  let interval = toIndex - fromIndex;
  if (interval < -6) interval += 12;
  if (interval > 5) interval -= 12;
  return interval;
}

export { getRelativeForm };
