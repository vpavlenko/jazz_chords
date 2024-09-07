const chordQualities: { [key: string]: string } = {
  '': 'maj',
  m: 'm',
  maj7: 'maj7',
  m7: 'm7',
  '7': '7',
  dim: 'dim',
  aug: 'aug',
  '6': '6',
  m6: 'm6',
  '9': '9',
  m9: 'm9',
  maj9: 'maj9',
  '11': '11',
  m11: 'm11',
  '13': '13',
  m13: 'm13',
  sus4: 'sus4',
  sus2: 'sus2',
  '7sus4': '7sus4',
  '7b5': '7b5',
  '7#5': '7#5',
  '7b9': '7b9',
  '7#9': '7#9',
  '7#11': '7#11',
  add9: 'add9',
  madd9: 'madd9',
};

const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getRelativeForm(chordLines: string[][]): string[][] {
  return chordLines.map((line) => {
    let prevRoot: string | null = null;
    return line.map((chord) => {
      const [root, quality] = parseChord(chord);
      let relativeChord = chordQualities[quality] || quality;

      if (prevRoot) {
        const interval = getInterval(prevRoot, root);
        relativeChord = `${relativeChord} (${interval > 0 ? '+' : ''}${interval})`;
      }

      prevRoot = root;
      return relativeChord;
    });
  });
}

function parseChord(chord: string): [string, string] {
  const match = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return ['', ''];
  return [match[1], match[2]];
}

function getInterval(from: string, to: string): number {
  const fromIndex = noteOrder.indexOf(from);
  const toIndex = noteOrder.indexOf(to);
  let interval = toIndex - fromIndex;
  if (interval < -6) interval += 12;
  if (interval > 5) interval -= 12;
  return interval;
}

export { getRelativeForm };
