import { Header } from 'components/Header';
import { Button } from 'components/Button';
import { ReactComponent as Logo } from 'assets/favicon.svg';
import * as Tone from 'tone';
import { useCallback, useState, useEffect } from 'react';
import guitarChords, { ChordPosition } from './components/guitarChords';
import { parseJazzStandard } from './utils/parseJazzStandard';
import { Transport } from 'tone';
import { getRelativeForm } from './utils/getRelativeForm';

const autumnLeavesData = `
Title = Autumn Leaves
ComposedBy = Joseph Kosma
DBKeySig = Bb
TimeSig = 4 4
Bars = 32
 Cm7 | F7 | Bbmaj7 | Ebmaj7 |
 Am7b5 | D7 | Gm7 | Gm6 |
 Cm7 | F7 | Bbmaj7 | Ebmaj7 |
 Am7b5 | D7 | Gm6 | Gm6 |
 D7 | D7 | Gm6 | Gm6 |
 Cm7 | F7 | Bbmaj7 | Bbmaj7 |
 Am7b5 | D7 | Gm7 C7 | Fm7 Bb7 |
 Am7b5 | D7 | Gm6 | G7 |
`;

const blueBossaData = `
Title = Blue Bossa
ComposedBy = Kenny Dorham
DBKeySig = Eb
TimeSig = 4 4
Bars = 16
 Cm6 | Cm6 | Fm9 | Fm9 |
 Dm7 | G7 | Cm6 | Cm6 |
 Ebm9 | Ab13 | Dbmaj7 | Dbmaj7 |
 Dm7 | G7 | Cm6 | Dm7 G7 |
`;

const satinDollData = `
Title = Satin Doll
ComposedBy = Billy Strayhorn and Duke Ellington
DBKeySig = C
TimeSig = 4 4
Bars = 32
 Dm7 G7 | Dm7 G7 | Em7 A7 | Em7 A7 |
 D7 | Db7 | C | A7 |
 Dm7 G7 | Dm7 G7 | Em7 A7 | Em7 A7 |
 D7 | Db7 | C | C |
 Gm7 | C7 | F | F |
 Am7 | D7 | G7 | A7 |
 Dm7 G7 | Dm7 G7 | Em7 A7 | Em7 A7 |
 D7 | Db7 | C | C |
`;

function App() {
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null);
  const [debug, setDebug] = useState<string>('');

  const [jazzStandard, setJazzStandard] = useState(parseJazzStandard(autumnLeavesData));
  const [currentLine, setCurrentLine] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentStandard, setCurrentStandard] = useState(autumnLeavesData);
  const [relativeForm, setRelativeForm] = useState<string[][]>([]);

  const parseChords = useCallback((chordString: string): string[] => {
    return chordString
      .split('|')
      .flatMap((bar) => bar.trim().split(/\s+/))
      .filter((chord) => chord !== '');
  }, []);

  useEffect(() => {
    const parsedStandard = parseJazzStandard(currentStandard);
    setJazzStandard(parsedStandard);
    setRelativeForm(getRelativeForm(parsedStandard.chordLines));
  }, [currentStandard]);

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
    setDebug((prev) => prev + `\nOriginal chord: ${chordName}`);

    // Replace flat keys with sharp equivalents
    const flatToSharp: { [key: string]: string } = {
      Db: 'C#',
      Eb: 'D#',
      Gb: 'F#',
      Ab: 'G#',
      Bb: 'A#',
    };

    let modifiedChordName = chordName;
    for (const [flat, sharp] of Object.entries(flatToSharp)) {
      if (chordName.startsWith(flat)) {
        modifiedChordName = chordName.replace(flat, sharp);
        setDebug((prev) => prev + `\nFlat key replaced: ${chordName} -> ${modifiedChordName}`);
        break;
      }
    }

    const match = modifiedChordName.match(/^([A-G][b#]?)(.*)$/);
    if (!match) {
      setDebug((prev) => prev + `\nInvalid chord name: ${modifiedChordName}`);
      return [];
    }

    const [, key, suffix] = match;
    let actualSuffix = suffix || 'major';

    // Handle M7 as maj7
    if (actualSuffix === 'M7') {
      actualSuffix = 'maj7';
    }

    setDebug((prev) => prev + `\nParsed chord: Key: ${key}, Suffix: ${actualSuffix}`);

    const chordVariations = guitarChords.chords[key];
    if (!chordVariations) {
      setDebug((prev) => prev + `\nKey not found in guitarChords: ${key}`);
      return [];
    }

    const chordVariation = chordVariations.find((chord) => chord.suffix === actualSuffix);
    if (!chordVariation) {
      setDebug(
        (prev) => prev + `\nSuffix not found in guitarChords: ${actualSuffix} for key ${key}`
      );
      return [];
    }

    const chordPosition: ChordPosition = chordVariation.positions[0];
    const midiNotes = chordPosition.midi || [];

    setDebug((prev) => prev + `\nFinal chord: ${key}${actualSuffix}`);
    setDebug((prev) => prev + `\nMIDI notes: ${midiNotes.join(', ')}`);
    return midiNotes;
  };

  const scheduleChordProgression = useCallback(() => {
    if (!sampler) {
      console.log('Piano not loaded yet');
      return;
    }

    setDebug(''); // Clear previous debug info
    const chordProgression = ['Dm7', 'G7', 'Cmaj7', 'Fmaj7'];

    Transport.cancel(); // Clear any previously scheduled events
    Transport.stop(); // Stop the transport if it's running

    chordProgression.forEach((chordName, index) => {
      const midiNotes = parseChord(chordName);
      Transport.schedule((time) => {
        midiNotes.forEach((midiNote, noteIndex) => {
          const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
          setDebug(
            (prev) =>
              prev + `\nPlaying: ${chordName} - Note ${noteIndex}: MIDI ${midiNote}, Freq ${freq}`
          );
          sampler.triggerAttackRelease(freq, '2n', time + noteIndex * 0.1);
        });
      }, index);
    });

    Transport.start();
  }, [sampler, parseChord]);

  const scheduleG7Chord = useCallback(() => {
    if (!sampler) {
      console.log('Piano not loaded yet');
      return;
    }

    Transport.cancel();
    Transport.stop();

    Transport.schedule((time) => {
      // G7 chord notes (low to high): G2, B2, F3, G3, D4
      sampler.triggerAttackRelease('G2', '2n', time);
      sampler.triggerAttackRelease('B2', '2n', time + 0.05);
      sampler.triggerAttackRelease('F3', '2n', time + 0.1);
      sampler.triggerAttackRelease('G3', '2n', time + 0.15);
      sampler.triggerAttackRelease('D4', '2n', time + 0.2);
    }, 0);

    Transport.start();
  }, [sampler]);

  const scheduleJazzStandard = useCallback(() => {
    if (!sampler) {
      console.log('Piano not loaded yet');
      return;
    }

    setIsPlaying(true);
    setCurrentLine(0);
    setDebug(''); // Clear previous debug info

    Transport.cancel();
    Transport.stop();

    jazzStandard.chordLines.forEach((line, lineIndex) => {
      line.forEach((chord, chordIndex) => {
        Transport.schedule((time) => {
          const simplifiedChord = chord.replace(/#5#9|#5|#9/, ''); // Simplify chord extensions
          const midiNotes = parseChord(simplifiedChord);
          setDebug((prev) => prev + `\nLine ${lineIndex + 1}, Chord ${chordIndex + 1}: ${chord}`);
          setDebug((prev) => prev + `\nSimplified: ${simplifiedChord}`);
          setDebug((prev) => prev + `\nMIDI notes: ${midiNotes.join(', ')}`);

          midiNotes.forEach((midiNote, noteIndex) => {
            const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
            sampler.triggerAttackRelease(freq, '1n', time + noteIndex * 0.1);
          });
          setCurrentLine(lineIndex);
        }, lineIndex * 4 + chordIndex);
      });
    });

    Transport.schedule(() => {
      setIsPlaying(false);
    }, jazzStandard.chordLines.length * 4);

    Transport.start();
  }, [sampler, jazzStandard, parseChord]);

  const stopAllSounds = useCallback(() => {
    if (sampler) {
      sampler.releaseAll();
    }
    Transport.cancel(); // Clear all scheduled events
    Transport.stop(); // Stop the transport
    setIsPlaying(false);
  }, [sampler]);

  const playChord = useCallback(
    (chord: string) => {
      if (!sampler) return;

      const simplifiedChord = chord.replace(/#5#9|#5|#9/, '');
      const midiNotes = parseChord(simplifiedChord);

      midiNotes.forEach((midiNote, index) => {
        const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
        sampler.triggerAttackRelease(freq, '1n', Tone.now() + index * 0.1);
      });

      setDebug(
        `Playing chord: ${chord}\nSimplified: ${simplifiedChord}\nMIDI notes: ${midiNotes.join(
          ', '
        )}`
      );
    },
    [sampler, parseChord]
  );

  return (
    <div className="App">
      <Header title="Jazz Standard Player" />
      <Logo height={100} width={100} />
      <Button onClick={scheduleG7Chord} disabled={!sampler}>
        Play G7 Chord
      </Button>
      <Button onClick={scheduleChordProgression} disabled={!sampler}>
        Play Chord Progression
      </Button>
      <Button onClick={() => setCurrentStandard(autumnLeavesData)} disabled={!sampler}>
        Load Autumn Leaves
      </Button>
      <Button onClick={() => setCurrentStandard(blueBossaData)} disabled={!sampler}>
        Load Blue Bossa
      </Button>
      <Button onClick={() => setCurrentStandard(satinDollData)} disabled={!sampler}>
        Load Satin Doll
      </Button>
      <Button onClick={scheduleJazzStandard} disabled={!sampler}>
        Play Jazz Standard
      </Button>
      <Button onClick={stopAllSounds}>Panic (Stop All Sounds)</Button>
      <div className="mt-8">
        <h2 className="text-2xl font-bold">{jazzStandard.title}</h2>
        <p>Composed by: {jazzStandard.composedBy}</p>
        <p>Key: {jazzStandard.dbKeySig}</p>
        <p>Time Signature: {jazzStandard.timeSig}</p>
        <div className="mt-4 flex">
          <div className="w-1/2">
            {jazzStandard.chordLines.map((line, index) => (
              <div
                key={index}
                className={`flex flex-wrap space-x-2 ${
                  index === currentLine && isPlaying ? 'bg-yellow-200' : ''
                }`}
              >
                {line.map((chord, chordIndex) => (
                  <button
                    key={chordIndex}
                    className="font-mono border border-gray-300 px-2 py-1 m-1 hover:bg-gray-100"
                    onClick={() => playChord(chord)}
                  >
                    {chord}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="w-1/2 ml-4">
            {relativeForm.map((line, index) => (
              <div key={index} className="flex flex-wrap space-x-2">
                {line.map((relativeChord, chordIndex) => (
                  <span key={chordIndex} className="font-mono border border-gray-300 px-2 py-1 m-1">
                    {relativeChord.split(' ').map((token, tokenIndex) => (
                      <span
                        key={tokenIndex}
                        className={`inline-block ${tokenIndex > 0 ? 'ml-1' : ''}`}
                      >
                        {token}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            ))}
          </div>
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
