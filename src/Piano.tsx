import { useAtom } from "jotai";
import { BlackKeyPos, loadedVideoAtom, PianoKey, speedMultiAtom } from "./state";
import { useKeyBeam } from "./useKeyBeam";
import { useEffect, useRef, useState } from "react";
import { Event, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

type CNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
function ScaleButton({ cNumber, colRefs }: { cNumber: CNumber; colRefs: ColRefs }) {
  const [isMoving, setIsMoving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const initialWidth = window.innerWidth * 0.018 * 2 + window.innerWidth * 0.0014 * 3;
    const octaveWidth = window.innerWidth * 0.018 * 7 + window.innerWidth * 0.0014 * 6;
    const leftOffset = ((cNumber - 1) * octaveWidth + initialWidth) / window.innerWidth;

    buttonRef.current!.style.left = `${leftOffset * 100}%`;
  }, []);

  useEffect(() => {
    if (!isMoving) {
      return;
    }

    function checkIfTouchesAdjacentScaleButtons(newLeftOffset: number): boolean {
      function checkLeftAdjacent(): boolean {
        const leftAdjacent = buttonRef.current!.previousElementSibling as HTMLButtonElement;

        const leftAdjacentLeftOffset =
          parseFloat(leftAdjacent.style.left.replace("%", "")) + window.innerWidth * 0.0018;

        if (newLeftOffset < leftAdjacentLeftOffset) {
          return true;
        }

        return false;
      }

      function checkRightAdjacent(): boolean {
        const rightAdjacent = buttonRef.current!.nextElementSibling as HTMLButtonElement;

        const rightAdjacentLeftOffset =
          parseFloat(rightAdjacent.style.left.replace("%", "")) - window.innerWidth * 0.0018;

        if (newLeftOffset > rightAdjacentLeftOffset) {
          return true;
        }

        return false;
      }

      if (cNumber === 1) {
        return checkRightAdjacent();
      } else if (cNumber === 8) {
        return checkLeftAdjacent();
      } else {
        return checkLeftAdjacent() || checkRightAdjacent();
      }
    }

    function onMouseMove(e: MouseEvent) {
      const x = e.clientX - window.innerWidth * 0.009;
      const windowWidth = window.innerWidth;
      const newLeftOffset = (x / windowWidth) * 100;

      if (!isMoving || !buttonRef.current || e.buttons === 0) {
        setIsMoving(false);
        return;
      }

      if (!checkIfTouchesAdjacentScaleButtons(newLeftOffset)) {
        const prevLeftOffset = parseFloat(buttonRef.current!.style.left.replace("%", ""));
        const delta = newLeftOffset - prevLeftOffset;

        buttonRef.current.style.left = `${newLeftOffset}%`;

        if (cNumber === 1) {
          colRefs.colRef1.current!.style.width = `${newLeftOffset / 2}%`;

          const prevColWidth = parseFloat(colRefs.colRef2.current!.style.width.replace("%", ""));

          colRefs.colRef2.current!.style.width = `${prevColWidth - delta / 7}%`;
        } else if (cNumber < 9) {
          const leftAdjacent = buttonRef.current.previousElementSibling as HTMLButtonElement;
          const leftAdjacentLeftOffset = parseFloat(leftAdjacent.style.left.replace("%", ""));

          colRefs[`colRef${cNumber}`].current!.style.width = `${
            (newLeftOffset - leftAdjacentLeftOffset) / 7
          }%`;

          const prevColWidth = parseFloat(
            colRefs[`colRef${(cNumber + 1) as CNumber}`].current!.style.width.replace("%", "")
          );

          colRefs[`colRef${(cNumber + 1) as CNumber}`].current!.style.width = `${
            prevColWidth - delta / 7
          }%`;
        }
      }
    }
    function onMouseUp() {
      setIsMoving(false);
    }

    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isMoving]);

  return (
    <button
      id={`C${cNumber}`}
      className="scale-button"
      ref={buttonRef}
      onMouseDown={() => setIsMoving(true)}
    >
      C{cNumber}
    </button>
  );
}

interface ColRefs {
  colRef1: React.RefObject<HTMLTableColElement | null>;
  colRef2: React.RefObject<HTMLTableColElement | null>;
  colRef3: React.RefObject<HTMLTableColElement | null>;
  colRef4: React.RefObject<HTMLTableColElement | null>;
  colRef5: React.RefObject<HTMLTableColElement | null>;
  colRef6: React.RefObject<HTMLTableColElement | null>;
  colRef7: React.RefObject<HTMLTableColElement | null>;
  colRef8: React.RefObject<HTMLTableColElement | null>;
  colRef9: React.RefObject<HTMLTableColElement | null>;
}

function PianoScalingSlider(colRefs: ColRefs) {
  return (
    <div className="piano-scaling-slider">
      <div>
        <ScaleButton cNumber={1} colRefs={colRefs} />
        <ScaleButton cNumber={2} colRefs={colRefs} />
        <ScaleButton cNumber={3} colRefs={colRefs} />
        <ScaleButton cNumber={4} colRefs={colRefs} />
        <ScaleButton cNumber={5} colRefs={colRefs} />
        <ScaleButton cNumber={6} colRefs={colRefs} />
        <ScaleButton cNumber={7} colRefs={colRefs} />
        <ScaleButton cNumber={8} colRefs={colRefs} />
      </div>
    </div>
  );
}

function VirtualPiano() {
  const [loadedVideo, _] = useAtom(loadedVideoAtom);
  const [speedMulti, __] = useAtom(speedMultiAtom);

  const colRef1 = useRef<HTMLTableColElement>(null);
  const colRef2 = useRef<HTMLTableColElement>(null);
  const colRef3 = useRef<HTMLTableColElement>(null);
  const colRef4 = useRef<HTMLTableColElement>(null);
  const colRef5 = useRef<HTMLTableColElement>(null);
  const colRef6 = useRef<HTMLTableColElement>(null);
  const colRef7 = useRef<HTMLTableColElement>(null);
  const colRef8 = useRef<HTMLTableColElement>(null);
  const colRef9 = useRef<HTMLTableColElement>(null);

  useEffect(() => {
    listen("future_piano_playback", (e: Event<[number, number, number]>) => {
      const pixelsPerSecond = 200 * speedMulti;
      const movePixels = window.innerHeight - window.innerHeight * 0.122 - 128 + 10;
      const moveTime = (movePixels / pixelsPerSecond) * 1000;

      setTimeout(() => {
        invoke("playback_midi_event", { ev: e.payload });
      }, moveTime);
    });
  }, []);

  return (
    <div
      className="piano-view"
      data-has-loaded-video={loadedVideo.file !== null ? "true" : "false"}
    >
      <PianoScalingSlider
        colRef1={colRef1}
        colRef2={colRef2}
        colRef3={colRef3}
        colRef4={colRef4}
        colRef5={colRef5}
        colRef6={colRef6}
        colRef7={colRef7}
        colRef8={colRef8}
        colRef9={colRef9}
      />
      <video controls muted>
        <source src={loadedVideo.url || undefined}></source>
      </video>
      <table>
        <colgroup>
          <col span={2} ref={colRef1} style={{ width: "1.8%" }} />
          <col span={7} ref={colRef2} style={{ width: "1.8%" }} />
          <col span={7} ref={colRef3} style={{ width: "1.8%" }} />
          <col span={7} ref={colRef4} style={{ width: "1.8%" }} />
          <col span={7} ref={colRef5} style={{ width: "1.8%" }} />
          <col span={7} ref={colRef6} style={{ width: "1.8%" }} />
          <col span={7} ref={colRef7} style={{ width: "1.8%" }} />
          <col span={7} ref={colRef8} style={{ width: "1.8%" }} />
          <col span={7} ref={colRef9} style={{ width: "1.8%" }} />
          <col span={1} />
        </colgroup>
        <tbody>
          <tr>
            <WhiteKey blackKeyPos={BlackKeyPos.LongDistance} pianoKey={PianoKey.A0} />
            <WhiteKey blackKeyPos={BlackKeyPos.None} pianoKey={PianoKey.B0} />

            <Octave
              pianoKeys={{
                C: PianoKey.C1,
                D: PianoKey.D1,
                E: PianoKey.E1,
                F: PianoKey.F1,
                G: PianoKey.G1,
                A: PianoKey.A1,
                B: PianoKey.B1,
              }}
            />
            <Octave
              pianoKeys={{
                C: PianoKey.C2,
                D: PianoKey.D2,
                E: PianoKey.E2,
                F: PianoKey.F2,
                G: PianoKey.G2,
                A: PianoKey.A2,
                B: PianoKey.B2,
              }}
            />
            <Octave
              pianoKeys={{
                C: PianoKey.C3,
                D: PianoKey.D3,
                E: PianoKey.E3,
                F: PianoKey.F3,
                G: PianoKey.G3,
                A: PianoKey.A3,
                B: PianoKey.B3,
              }}
            />
            <Octave
              pianoKeys={{
                C: PianoKey.C4,
                D: PianoKey.D4,
                E: PianoKey.E4,
                F: PianoKey.F4,
                G: PianoKey.G4,
                A: PianoKey.A4,
                B: PianoKey.B4,
              }}
            />
            <Octave
              pianoKeys={{
                C: PianoKey.C5,
                D: PianoKey.D5,
                E: PianoKey.E5,
                F: PianoKey.F5,
                G: PianoKey.G5,
                A: PianoKey.A5,
                B: PianoKey.B5,
              }}
            />
            <Octave
              pianoKeys={{
                C: PianoKey.C6,
                D: PianoKey.D6,
                E: PianoKey.E6,
                F: PianoKey.F6,
                G: PianoKey.G6,
                A: PianoKey.A6,
                B: PianoKey.B6,
              }}
            />
            <Octave
              pianoKeys={{
                C: PianoKey.C7,
                D: PianoKey.D7,
                E: PianoKey.E7,
                F: PianoKey.F7,
                G: PianoKey.G7,
                A: PianoKey.A7,
                B: PianoKey.B7,
              }}
            />
            <WhiteKey blackKeyPos={BlackKeyPos.None} pianoKey={PianoKey.C8} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface OctavePianoKeys {
  C: PianoKey;
  D: PianoKey;
  E: PianoKey;
  F: PianoKey;
  G: PianoKey;
  A: PianoKey;
  B: PianoKey;
}

function Octave({ pianoKeys }: { pianoKeys: OctavePianoKeys }) {
  return (
    <>
      {/* C to E */}
      <WhiteKey blackKeyPos={BlackKeyPos.SmallDistance} pianoKey={pianoKeys.C} />
      <WhiteKey blackKeyPos={BlackKeyPos.LongDistance} pianoKey={pianoKeys.D} />
      <WhiteKey blackKeyPos={BlackKeyPos.None} pianoKey={pianoKeys.E} />

      {/* F to B */}
      <WhiteKey blackKeyPos={BlackKeyPos.SmallDistance} pianoKey={pianoKeys.F} />
      <WhiteKey blackKeyPos={BlackKeyPos.MediumDistance} pianoKey={pianoKeys.G} />
      <WhiteKey blackKeyPos={BlackKeyPos.LongDistance} pianoKey={pianoKeys.A} />
      <WhiteKey blackKeyPos={BlackKeyPos.None} pianoKey={pianoKeys.B} />
    </>
  );
}

function BlackKey({ blackKeyPos, pianoKey }: { blackKeyPos: BlackKeyPos; pianoKey: PianoKey }) {
  const keyRef = useKeyBeam<HTMLDivElement>({
    activeColor: "#8b0000",
    inactiveColor: "black",
    pianoKey,
    blackKeyPos,
    isWhiteKey: false,
  });

  let secondClass = "black-key-none";
  if (blackKeyPos === BlackKeyPos.SmallDistance) {
    secondClass = "black-key-small-dist";
  } else if (blackKeyPos === BlackKeyPos.MediumDistance) {
    secondClass = "black-key-medium-dist";
  } else if (blackKeyPos === BlackKeyPos.LongDistance) {
    secondClass = "black-key-long-dist";
  }

  return <div ref={keyRef} className={`black-key ${secondClass}`}></div>;
}

function WhiteKey({ blackKeyPos, pianoKey }: { blackKeyPos: BlackKeyPos; pianoKey: PianoKey }) {
  const keyRef = useKeyBeam<HTMLTableCellElement>({
    activeColor: "red",
    inactiveColor: "white",
    pianoKey,
    blackKeyPos,
    isWhiteKey: true,
  });

  return (
    <td ref={keyRef} className="white-key">
      <BlackKey blackKeyPos={blackKeyPos} pianoKey={++pianoKey} />
    </td>
  );
}

export { VirtualPiano };
