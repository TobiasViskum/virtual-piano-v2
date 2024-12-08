import "./App.css";
import "./reset.css";
import "./utils.css";

import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { VirtualPiano } from "./Piano";
import { useEffect, useRef, useState } from "react";
import { MdSpeed } from "react-icons/md";
import { useAtom } from "jotai";
import {
  AppMode,
  loadedVideoAtom,
  midiConnectionInfo,
  midiFileAtom,
  MidiInput,
  modeAtom,
  speedMultiAtom,
} from "./state";
import { LuSettings2 } from "react-icons/lu";
import { message, open } from "@tauri-apps/plugin-dialog";
import { Window } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

function App() {
  const [midiInConnectionInfo] = useAtom(midiConnectionInfo);
  const [appMode] = useAtom(modeAtom);

  return (
    <main>
      <div className="settings-container">
        <div className="settings-navbar">
          <MidiConnect />

          {appMode == AppMode.Piano ? (
            <>
              {midiInConnectionInfo !== null && (
                <>
                  <SpeedControl /> <Recorder />
                </>
              )}
            </>
          ) : (
            <>
              <ImportVideo />
              <MidiFileSelector />
            </>
          )}

          <ModeSelector />
        </div>
      </div>

      <VirtualPiano />
    </main>
  );
}

function ModeSelector() {
  const [mode, setMode] = useAtom(modeAtom);

  async function newWindow() {
    // import { Window } from "@tauri-apps/api/window";

    const webview = new WebviewWindow("note-viewer", {
      url: "/note-viewer.html",
      title: "Note viewer",
      x: 0,
      y: 0,
      width: 575,
      height: 850,
      resizable: false,
    });

    webview.once("tauri://created", function (e) {
      webview.show();
      console.log("webview window successfully created");

      // webview window successfully created
    });
    webview.once("tauri://error", function (e) {
      console.log("an error happened creating the webview window: ", e);

      // an error happened creating the webview window
    });
  }

  return (
    <button
      role="button"
      popoverTarget="mode-popover"
      id="mode-popover-button"
      style={{ cursor: "pointer", marginLeft: "auto" }}
    >
      <LuSettings2 role="button" style={{ width: 32, height: 32 }} />
      <div popover="manual" id="mode-popover">
        <p>Mode:</p>
        <div
          role="button"
          data-selected={mode == AppMode.Piano}
          onClick={() => {
            setMode(AppMode.Piano);
          }}
        >
          Piano
        </div>
        <div
          role="button"
          data-selected={mode == AppMode.Video}
          onClick={() => {
            setMode(AppMode.Video);
          }}
        >
          Video
        </div>
        <div role="button" onClick={newWindow}>
          New Window
        </div>
      </div>
    </button>
  );
}

function Recorder() {
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      let isRecording = await invoke<boolean>("is_recording");
      setIsRecording(isRecording);
    })();
  }, []);

  return (
    <div className="recorder">
      <p>Record:</p>
      {isRecording ? (
        <button
          onClick={() => {
            invoke("stop_recording");
            setIsRecording(false);
          }}
        >
          Stop recording
        </button>
      ) : (
        <button
          onClick={() => {
            invoke("start_recording");
            setIsRecording(true);
          }}
        >
          Start recording
        </button>
      )}
    </div>
  );
}

function MidiFileSelector() {
  const [midiFile, setMidiFile] = useAtom(midiFileAtom);

  return (
    <div className="import-midi">
      <div>
        <p>Choose midi file:</p>
        <button
          onClick={async (_) => {
            const file = await open({
              multiple: false,
              directory: false,
            });

            if (!file) {
              return;
            }

            setMidiFile(file);
          }}
        >
          {midiFile ? midiFile.split("/")[midiFile.split("/").length - 1] : "Select file"}
        </button>
      </div>
      <button
        onClick={(_) => {
          setMidiFile("");
        }}
        disabled={midiFile === ""}
      >
        X
      </button>
      <button
        onClick={async (_) => {
          if (midiFile === "") {
            message("No file selected", {
              title: "Virtual Piano",
              kind: "error",
            });
            return;
          }

          invoke("playback_midi_file", { path: midiFile });
        }}
        disabled={midiFile === ""}
      >
        Play
      </button>
    </div>
  );
}

function ImportVideo() {
  const [loadedVideo, setLoadedVideo] = useAtom(loadedVideoAtom);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <div className="import-video">
      <div>
        <p>Video:</p>
        <button
          disabled={loadedVideo.file === null}
          onClick={() => {
            if (formRef.current) {
              formRef.current.reset();
              URL.revokeObjectURL(loadedVideo.url);
              setLoadedVideo({ url: "", file: null });
            }
          }}
        >
          X
        </button>
      </div>
      <form ref={formRef}>
        <input
          type="file"
          onChange={(e) => {
            let file = e.target.files?.[0];

            if (!file || !(file.name.endsWith(".mp4") || file.name.endsWith(".mov"))) {
              message("Invalid file type, only .mp4, .mov files are supported for now", {
                title: "Virtual Piano",
                kind: "error",
              });
              formRef.current?.reset();
              return;
            }
            setLoadedVideo({
              url: URL.createObjectURL(file),
              file: file,
            });
          }}
        ></input>
      </form>
    </div>
  );
}

function SpeedControl() {
  const DEFAULT_SPEED = 31; /* Makes it 100% */
  const [speedValue, setSpeedValue] = useState(DEFAULT_SPEED);
  const [_, setSpeedMulti] = useAtom(speedMultiAtom);

  function calculateSpeed(): number {
    return Math.round(speedValue * 3 + 10 * (1 - speedValue / 100));
  }

  useEffect(() => {
    setSpeedMulti(calculateSpeed() / 100);
  }, [speedValue]);

  return (
    <div className="speed-control">
      <p>Notes speed: {calculateSpeed()}%</p>
      <div>
        <MdSpeed
          role="button"
          onClick={() => {
            setSpeedValue(DEFAULT_SPEED);
          }}
        />
        <input
          value={speedValue}
          onChange={(e) => {
            setSpeedValue(Number(e.target.value));
          }}
          type="range"
        ></input>
      </div>
    </div>
  );
}

function MidiConnect() {
  const [availableMidiInputs, setAvailableMidiInputs] = useState([] as MidiInput[]);
  const [midiInConnectionInfo, setMidiInConnectionInfo] = useAtom(midiConnectionInfo);

  async function updateAvailableMidiInputs() {
    let inputs = (await invoke("get_available_midi_inputs")) as MidiInput[];
    setAvailableMidiInputs(inputs);
  }

  async function connectMidiInput(midiInput: MidiInput) {
    try {
      await invoke("connect_to_midi_in", { index: midiInput.index });
      setMidiInConnectionInfo(midiInput);
    } catch (e) {
      console.error(e);
    }
  }

  async function disconnectMidiInput() {
    try {
      await invoke("disconnect_from_midi_in");
      setMidiInConnectionInfo(null);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    (async () => {
      setMidiInConnectionInfo(await invoke("get_midi_in_connection_info"));
      updateAvailableMidiInputs();
    })();
  }, []);

  return (
    <>
      <button
        data-midi-is-connected={midiInConnectionInfo !== null}
        onClick={updateAvailableMidiInputs}
        popoverTarget={midiInConnectionInfo ? "midi-disconnect-popover" : "midi-connect-popover"}
        className="midi-connect-button"
      >
        <h4>Midi:</h4>
        <p>{midiInConnectionInfo ? midiInConnectionInfo.name : "Not connected"}</p>
      </button>
      {midiInConnectionInfo ? (
        <div popover="manual" id="midi-disconnect-popover">
          <button onClick={disconnectMidiInput}>Disconnect</button>
        </div>
      ) : (
        <div popover="manual" id="midi-connect-popover">
          <button onClick={updateAvailableMidiInputs}>Refresh</button>
          <ul>
            {availableMidiInputs.length == 0 ? (
              <li>No midi devices found</li>
            ) : (
              availableMidiInputs.map((x) => {
                return (
                  <li
                    role="button"
                    key={x.index}
                    onClick={(_) => {
                      connectMidiInput(x);
                    }}
                  >
                    {x.name}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </>
  );
}

// function SelectMidi() {
//   const [availableMidiInputs, setAvailableMidiInputs] = useState<MidiInput[]>([]);

//   async function updateAvailableMidiInputs() {
//     try {
//       let inputs = (await invoke("get_available_midi_inputs")) as MidiInput[];
//       console.log(inputs);

//       setAvailableMidiInputs(inputs);
//     } catch (e) {
//       console.log(e);

//       setAvailableMidiInputs([]);
//     }
//   }

//   return (
//     <div>
//       Search
//       <select defaultValue="None">
//         <option key="0">None</option>
//         {availableMidiInputs.map((x) => {
//           return <option key={x.index}>{x.name}</option>;
//         })}
//       </select>
//     </div>
//   );
// }

export default App;
