import { Header } from 'components/Header';
import { Button } from 'components/Button';
import { ReactComponent as Logo } from 'assets/favicon.svg';
import * as Tone from 'tone';
import { useCallback, useState, useEffect } from 'react';
import guitarChords, { ChordPosition } from './components/guitarChords';
import { parseJazzStandard } from './utils/parseJazzStandard';

const autumnLeavesData = `
Title = Autumn Leaves
ComposedBy = Joseph Kosma
DBKeySig = Bb
TimeSig = 4 4
Bars = 32
 Cm7 | F7 | BbM7 | EbM7 |
 Am7b5 | D7 | Gm7 | Gm6 |
 Cm7 | F7 | BbM7 | EbM7 |
 Am7b5 | D7 | Gm6 | Gm6 |
 D7 | D7 | Gm6 | Gm6 |
 Cm7 | F7 | BbM7 | BbM7 |
 Am7b5 | D7 | Gm7 C7 | Fm7 Bb7 |
 Am7b5 | D7 | Gm6 | G7 |
`;

function App() {
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null);
  const [debug, setDebug] = useState<string>('');

  const [jazzStandard, setJazzStandard] = useState(parseJazzStandard(autumnLeavesData));
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    initializePiano();
  }, []);

  const initializePiano = async () => {
    const piano = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3',
        C1: 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',
        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',
        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',
        C8: 'C8.mp3',
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
    }).toDestination();

    await Tone.loaded();
    setSampler(piano);
  };

  const parseChord = (chordName: string): number[] => {
    const match = chordName.match(/^([A-G][b#]?)(.*)$/);
    if (!match) {
      setDebug((prev) => prev + `\nInvalid chord name: ${chordName}`);
      return [];
    }

    const [, key, suffix] = match;
    const actualSuffix = suffix || 'major';

    setDebug((prev) => prev + `\nParsing: Key: ${key}, Suffix: ${actualSuffix}`);

    const chordVariations = guitarChords.chords[key];
    if (!chordVariations) {
      setDebug((prev) => prev + `\nKey not found: ${key}`);
      return [];
    }

    const chordVariation = chordVariations.find((chord) => chord.suffix === actualSuffix);
    if (!chordVariation) {
      setDebug((prev) => prev + `\nSuffix not found: ${actualSuffix} for key ${key}`);
      return [];
    }

    const chordPosition: ChordPosition = chordVariation.positions[0];
    const midiNotes = chordPosition.midi || [];

    setDebug((prev) => prev + `\nChord: ${chordName}\nMIDI: ${midiNotes.join(', ')}`);
    return midiNotes;
  };

  const playChordProgression = useCallback(() => {
    if (!sampler) {
      console.log('Piano not loaded yet');
      return;
    }

    setDebug(''); // Clear previous debug info
    const chordProgression = ['Dm7', 'G7', 'Cmaj7', 'Fmaj7'];
    const now = Tone.now();

    chordProgression.forEach((chordName, index) => {
      const midiNotes = parseChord(chordName);
      midiNotes.forEach((midiNote, noteIndex) => {
        const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
        setDebug(
          (prev) =>
            prev + `\nPlaying: ${chordName} - Note ${noteIndex}: MIDI ${midiNote}, Freq ${freq}`
        );
        sampler.triggerAttackRelease(freq, '2n', now + index + noteIndex * 0.1);
      });
    });
  }, [sampler]);

  const playG7Chord = useCallback(() => {
    if (!sampler) {
      console.log('Piano not loaded yet');
      return;
    }

    const now = Tone.now();

    // G7 chord notes (low to high): G2, B2, F3, G3, D4
    sampler.triggerAttackRelease('G2', '2n', now);
    sampler.triggerAttackRelease('B2', '2n', now + 0.05);
    sampler.triggerAttackRelease('F3', '2n', now + 0.1);
    sampler.triggerAttackRelease('G3', '2n', now + 0.15);
    sampler.triggerAttackRelease('D4', '2n', now + 0.2);
  }, [sampler]);

  const stopAllSounds = useCallback(() => {
    if (sampler) {
      sampler.releaseAll();
    }
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }, [sampler]);

  const playJazzStandard = useCallback(() => {
    if (!sampler) {
      console.log('Piano not loaded yet');
      return;
    }

    setIsPlaying(true);
    setCurrentLine(0);

    const playLine = (lineIndex: number) => {
      if (lineIndex >= jazzStandard.chordLines.length) {
        setIsPlaying(false);
        return;
      }

      const line = jazzStandard.chordLines[lineIndex];
      const now = Tone.now();

      line.forEach((chord, index) => {
        const midiNotes = parseChord(chord);
        midiNotes.forEach((midiNote, noteIndex) => {
          const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
          sampler.triggerAttackRelease(freq, '1n', now + index + noteIndex * 0.1);
        });
      });

      setCurrentLine(lineIndex);
      setTimeout(() => playLine(lineIndex + 1), line.length * 1000);
    };

    playLine(0);
  }, [sampler, jazzStandard, parseChord]);

  return (
    <div className="App">
      <Header title="Jazz Standard Player" />
      <Logo height={100} width={100} />
      <Button onClick={playG7Chord} disabled={!sampler}>
        Play G7 Chord
      </Button>
      <Button onClick={playChordProgression} disabled={!sampler}>
        Play Chord Progression
      </Button>
      <Button onClick={stopAllSounds}>Panic (Stop All Sounds)</Button>
      <div className="mt-8">
        <h2 className="text-2xl font-bold">{jazzStandard.title}</h2>
        <p>Composed by: {jazzStandard.composedBy}</p>
        <p>Key: {jazzStandard.dbKeySig}</p>
        <p>Time Signature: {jazzStandard.timeSig}</p>
        <div className="mt-4">
          {jazzStandard.chordLines.map((line, index) => (
            <div
              key={index}
              className={`flex space-x-4 ${
                index === currentLine && isPlaying ? 'bg-yellow-200' : ''
              }`}
            >
              {line.map((chord, chordIndex) => (
                <span key={chordIndex} className="font-mono">
                  {chord}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
        Debug Output:
        {debug}
      </div>
    </div>
  );
}

export default App;
