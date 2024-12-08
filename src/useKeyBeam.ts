import { useAtom } from "jotai";
import { BlackKeyPos, PianoKey, speedMultiAtom } from "./state";
import { useEffect, useRef, useState } from "react";
import { Event, listen } from "@tauri-apps/api/event";

const basePixelsPerSecond = 200;

export function useKeyBeam<T extends HTMLElement>({
  activeColor,
  inactiveColor,
  pianoKey,
  blackKeyPos,
  isWhiteKey,
}: {
  activeColor: string;
  inactiveColor: string;
  pianoKey: PianoKey;
  blackKeyPos: BlackKeyPos;
  isWhiteKey: boolean;
}): React.RefObject<T | null> {
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [isKeyFuturePressed, setIsKeyFuturePressed] = useState(false);
  const [speedMulti, _] = useAtom(speedMultiAtom);
  const pixelsPerSecond = useRef(basePixelsPerSecond * speedMulti);
  const isKeyReleased = useRef(true);
  const keyRef = useRef<T>(null);

  useEffect(() => {
    listen(
      "future_piano_event",
      (
        e: Event<{
          message: [number, number, number];
          is_note_on: boolean;
          time_length: number;
        }>
      ) => {
        let [_, note, __] = e.payload.message;

        if (e.payload.is_note_on && pianoKey === note) {
          const timeLength = e.payload.time_length;
          const pianoView = document.querySelector(".piano-view") as HTMLDivElement;

          const height = timeLength * 0.001 * pixelsPerSecond.current;
          const movePixelsToTouch = window.innerHeight - window.innerHeight * 0.122 - 128 + 36;
          const movePixelsTotal = movePixelsToTouch + height;
          const moveTime = movePixelsTotal / pixelsPerSecond.current;

          const beam = document.createElement("div");
          const domRect = keyRef.current!.getBoundingClientRect();
          beam.style.width = domRect.width + "px";
          beam.style.left = domRect.left + "px";
          beam.style.height = height + "px";
          beam.style.background = activeColor;
          beam.style.position = "fixed";
          beam.style.top = -1 * height + 64 + "px";
          beam.style.borderRadius = "5px";
          beam.style.transform = "translateY(0px)";
          beam.style.zIndex = "0";
          beam.style.transition = `transform ${moveTime}s linear`;

          beam.addEventListener("transitionend", () => {
            pianoView.removeChild(beam);
            beam.remove();
          });

          pianoView.appendChild(beam);

          setTimeout(() => {
            keyRef.current!.style.background = activeColor;
          }, movePixelsToTouch / pixelsPerSecond.current);

          requestAnimationFrame(() => {
            beam.style.transform = `translateY(${movePixelsTotal}px)`;
          });
        }
      }
    );

    listen(
      "piano_event",
      (
        e: Event<{
          channel: number;
          event_type: {
            Note: [number, number, number];
          };
        }>
      ) => {
        let [noteState, note, _] = e.payload.event_type.Note;
        let isPressed = noteState === 144;
        if (pianoKey === note) {
          if (isPressed) {
            setIsKeyPressed(true);
            isKeyReleased.current = false;
          } else {
            setIsKeyPressed(false);
            isKeyReleased.current = true;
          }
        }
      }
    );

    function onMouseDown(e: MouseEvent) {
      e.stopPropagation();
      setIsKeyPressed(true);
      isKeyReleased.current = false;
    }
    function onMouseUp(e: MouseEvent) {
      e.stopPropagation();
      setIsKeyPressed(false);
      isKeyReleased.current = true;
    }
    function onMouseLeave(_: MouseEvent) {
      setIsKeyPressed(false);
      isKeyReleased.current = true;
    }

    keyRef.current?.addEventListener("mousedown", onMouseDown);
    keyRef.current?.addEventListener("mouseup", onMouseUp);
    keyRef.current?.addEventListener("mouseleave", onMouseLeave);

    return () => {
      keyRef.current?.removeEventListener("mousedown", onMouseDown);
      keyRef.current?.removeEventListener("mouseup", onMouseUp);
      keyRef.current?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  useEffect(() => {
    pixelsPerSecond.current = basePixelsPerSecond * speedMulti;
  }, [speedMulti]);

  useEffect(() => {
    let pianoView = document.querySelector(".piano-view") as HTMLDivElement;

    let prevTimestamp = 0;
    let domRect = keyRef.current!.getBoundingClientRect();

    if (isKeyPressed && keyRef.current) {
      keyRef.current.style.background = activeColor;
      requestAnimationFrame(firstFrame);
    } else if (keyRef.current) {
      keyRef.current.style.background = inactiveColor;
    }

    function firstFrame(timestamp: number) {
      prevTimestamp = timestamp;

      const beam = document.createElement("div");

      let width = domRect.width;
      let left = domRect.left;

      {
        // if (isWhiteKey) {
        //   if (blackKeyPos === BlackKeyPos.SmallDistance) {
        //     width = domRect.width * 0.591;
        //   } else if (blackKeyPos === BlackKeyPos.MediumDistance) {
        //     width = domRect.width * 0.727;
        //   } else if (blackKeyPos === BlackKeyPos.LongDistance) {
        //     width = domRect.width * 0.864;
        //   }
        //   const prevWhiteKey = keyRef.current!.previousElementSibling as HTMLDivElement;
        //   let blackKey = prevWhiteKey.children[0] as HTMLDivElement;
        //   if (prevWhiteKey && !blackKey.classList.contains("black-key-none")) {
        //     const gap = domRect.width * 0.07272727;
        //     if (blackKey.classList.contains("black-key-small-dist")) {
        //       const subWidth = blackKey.getBoundingClientRect().width - domRect.width * 0.409;
        //       width = width - subWidth + gap;
        //       left = left + subWidth - gap;
        //     } else if (blackKey.classList.contains("black-key-medium-dist")) {
        //       const subWidth = blackKey.getBoundingClientRect().width - domRect.width * 0.273;
        //       width = width - subWidth + gap;
        //       left = left + subWidth - gap;
        //     } else if (blackKey.classList.contains("black-key-long-dist")) {
        //       const subWidth = blackKey.getBoundingClientRect().width - domRect.width * 0.136;
        //       width = width - subWidth + gap;
        //       left = left + subWidth - gap;
        //     }
        //   }
        // }
      }

      beam.style.width = width + "px";
      beam.style.left = left + "px";
      beam.style.position = "fixed";
      beam.style.height = "5px";
      beam.style.background = activeColor;
      beam.style.top = domRect.top - 7 + "px";
      beam.style.borderTopRightRadius = "5px";
      beam.style.borderTopLeftRadius = "5px";
      beam.style.zIndex = "0";

      pianoView.appendChild(beam);

      requestAnimationFrame((timestamp) => onAnimationFrame(timestamp, beam));
    }

    function onAnimationFrame(timestamp: number, beam: HTMLDivElement) {
      let delta = computeDelta(timestamp);
      let distance = (delta / 1000) * pixelsPerSecond.current;
      let height = parseFloat(beam.style.height);
      beam.style.height = height + distance + "px";

      let top = parseFloat(beam.style.top);
      beam.style.top = top - distance + "px";

      if (!isKeyReleased.current) {
        requestAnimationFrame((timestamp) => onAnimationFrame(timestamp, beam));
      } else {
        beam.style.borderBottomRightRadius = "5px";
        beam.style.borderBottomLeftRadius = "5px";
        function step(timestamp: number, beam: HTMLDivElement) {
          let delta = computeDelta(timestamp);
          let distance = (delta / 1000) * pixelsPerSecond.current;
          let top = parseFloat(beam.style.top);
          beam.style.top = top - distance + "px";
          const rect = beam.getBoundingClientRect();

          if (rect.bottom > 0) {
            requestAnimationFrame((timestamp) => step(timestamp, beam));
          } else {
            pianoView.removeChild(beam);
            beam.remove();
          }
        }

        requestAnimationFrame((timestamp) => step(timestamp, beam));
      }
    }

    function computeDelta(timestamp: number) {
      let delta = timestamp - prevTimestamp;
      prevTimestamp = timestamp;
      return delta;
    }
  }, [isKeyPressed]);

  useEffect(() => {
    if (isKeyFuturePressed) {
      let pianoView = document.querySelector(".piano-view") as HTMLDivElement;
      let prevTimestamp = 0;
      let domRect = keyRef.current!.getBoundingClientRect();

      requestAnimationFrame(firstFrame);

      function computeDelta(timestamp: number) {
        let delta = timestamp - prevTimestamp;
        prevTimestamp = timestamp;
        return delta;
      }

      function firstFrame(timestamp: number) {
        const beam = document.createElement("div");
        prevTimestamp = timestamp;

        beam.style.width = domRect.width + "px";
        beam.style.height = "5px";
        beam.style.background = activeColor;
        beam.style.position = "fixed";
        beam.style.top = "64px";
        beam.style.left = domRect.left + "px";
        beam.style.borderBottomRightRadius = "5px";
        beam.style.borderBottomLeftRadius = "5px";
        beam.style.zIndex = "0";

        pianoView.appendChild(beam);

        requestAnimationFrame((timestamp) => onAnimationFrame(timestamp, beam));
      }

      function onAnimationFrame(timestamp: number, beam: HTMLDivElement) {
        let delta = computeDelta(timestamp);
        prevTimestamp = timestamp;

        let distance = (delta / 1000) * pixelsPerSecond.current;
        let height = parseFloat(beam.style.height);

        beam.style.height = height + distance + "px";

        if (!isKeyReleased.current) {
          requestAnimationFrame((timestamp) => onAnimationFrame(timestamp, beam));
        } else {
          beam.style.borderTopRightRadius = "5px";
          beam.style.borderTopLeftRadius = "5px";

          const movePixels = window.innerHeight - window.innerHeight * 0.122 - 128 + 36;
          const moveTime = movePixels / pixelsPerSecond.current;

          beam.style.transition = `transform ${moveTime}s linear`;
          beam.style.transform = `translateY(${movePixels}px)`;

          beam.addEventListener("transitionend", () => {
            pianoView.removeChild(beam);
            beam.remove();
          });
        }
      }
    }
  }, [isKeyFuturePressed]);

  return keyRef;
}

/*

PIANO KEYBOARD DIMENSIONS:
    
Piano width:
122.8 cm

White key width:
2.2 cm = 1.8% of piano width

Black key width:
1.2 cm = 0.98% of piano width

Space between white keys:
0.16 cm = 0.13%
    
*/
