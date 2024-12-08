use std::{
    collections::{HashMap, HashSet}, sync::{Arc, Mutex}, thread::{self, JoinHandle}, time::Instant
};

use midir::{Ignore, MidiInput, MidiInputConnection, MidiOutput, MidiOutputConnection};
use midly::{
    live::LiveEvent,
    num::{u15, u28},
    Format, Header, Smf, Timing, Track, TrackEvent, TrackEventKind,
};
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::mem;
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Debug, Clone, Copy)]
pub enum PianoKeyCode {
    Eb0 = 15,
    E0 = 16,
    F0 = 17,
    Gb0 = 18,
    G0 = 19,
    Ab0 = 20,
    A1 = 21,
    Bb1 = 22,
    B1 = 23,
    C1 = 24,
    Db1 = 25,
    D1 = 26,
    Eb1 = 27,
    E1 = 28,
    F1 = 29,
    Gb1 = 30,
    G1 = 31,
    Ab1 = 32,
    A2 = 33,
    Bb2 = 34,
    B2 = 35,
    C2 = 36,
    Db2 = 37,
    D2 = 38,
    Eb2 = 39,
    E2 = 40,
    F2 = 41,
    Gb2 = 42,
    G2 = 43,
    Ab2 = 44,
    A3 = 45,
    Bb3 = 46,
    B3 = 47,
    C3 = 48,
    Db3 = 49,
    D3 = 50,
    Eb3 = 51,
    E3 = 52,
    F3 = 53,
    Gb3 = 54,
    G3 = 55,
    Ab3 = 56,
    A4 = 57,
    Bb4 = 58,
    B4 = 59,
    C4 = 60,
    Db4 = 61,
    D4 = 62,
    Eb4 = 63,
    E4 = 64,
    F4 = 65,
    Gb4 = 66,
    G4 = 67,
    Ab4 = 68,
    A5 = 69,
    Bb5 = 70,
    B5 = 71,
    C5 = 72,
    Db5 = 73,
    D5 = 74,
    Eb5 = 75,
    E5 = 76,
    F5 = 77,
    Gb5 = 78,
    G5 = 79,
    Ab5 = 80,
    A6 = 81,
    Bb6 = 82,
    B6 = 83,
    C6 = 84,
    Db6 = 85,
    D6 = 86,
    Eb6 = 87,
    E6 = 88,
    F6 = 89,
    Gb6 = 90,
    G6 = 91,
    Ab6 = 92,
    A7 = 93,
    Bb7 = 94,
    B7 = 95,
    C7 = 96,
    Db7 = 97,
    D7 = 98,
    Eb7 = 99,
    E7 = 100,
    F7 = 101,
    Gb7 = 102,
    G7 = 103,
    Ab7 = 104,
    A8 = 105,
    Bb8 = 106,
    B8 = 107,
    C8 = 108,
    Db8 = 109,
    D8 = 110,
    Eb8 = 111,
    E8 = 112,
    F8 = 113,
}

impl PianoKeyCode {
    pub fn to_key_name(self) -> String {
        (match self {
            Self::Eb0 => "D#",
            Self::E0 => "E",
            Self::F0 => "F",
            Self::Gb0 => "F#",
            Self::G0 => "G",
            Self::Ab0 => "G#",
            Self::A1 => "A",
            Self::Bb1 => "A#",
            Self::B1 => "B",
            Self::C1 => "C",
            Self::Db1 => "C#",
            Self::D1 => "D",
            Self::Eb1 => "D#",
            Self::E1 => "E",
            Self::F1 => "F",
            Self::Gb1 => "F#",
            Self::G1 => "G",
            Self::Ab1 => "G#",
            Self::A2 => "A",
            Self::Bb2 => "A#",
            Self::B2 => "B",
            Self::C2 => "C",
            Self::Db2 => "C#",
            Self::D2 => "D",
            Self::Eb2 => "D#",
            Self::E2 => "E",
            Self::F2 => "F",
            Self::Gb2 => "F#",
            Self::G2 => "G",
            Self::Ab2 => "G#",
            Self::A3 => "A",
            Self::Bb3 => "A#",
            Self::B3 => "B",
            Self::C3 => "C",
            Self::Db3 => "C#",
            Self::D3 => "D",
            Self::Eb3 => "D#",
            Self::E3 => "E",
            Self::F3 => "F",
            Self::Gb3 => "F#",
            Self::G3 => "G",
            Self::Ab3 => "G#",
            Self::A4 => "A",
            Self::Bb4 => "A#",
            Self::B4 => "B",
            Self::C4 => "C",
            Self::Db4 => "C#",
            Self::D4 => "D",
            Self::Eb4 => "D#",
            Self::E4 => "E",
            Self::F4 => "F",
            Self::Gb4 => "F#",
            Self::G4 => "G",
            Self::Ab4 => "G#",
            Self::A5 => "A",
            Self::Bb5 => "A#",
            Self::B5 => "B",
            Self::C5 => "C",
            Self::Db5 => "C#",
            Self::D5 => "D",
            Self::Eb5 => "D#",
            Self::E5 => "E",
            Self::F5 => "F",
            Self::Gb5 => "F#",
            Self::G5 => "G",
            Self::Ab5 => "G#",
            Self::A6 => "A",
            Self::Bb6 => "A#",
            Self::B6 => "B",
            Self::C6 => "C",
            Self::Db6 => "C#",
            Self::D6 => "D",
            Self::Eb6 => "D#",
            Self::E6 => "E",
            Self::F6 => "F",
            Self::Gb6 => "F#",
            Self::G6 => "G",
            Self::Ab6 => "G#",
            Self::A7 => "A",
            Self::Bb7 => "A#",
            Self::B7 => "B",
            Self::C7 => "C",
            Self::Db7 => "C#",
            Self::D7 => "D",
            Self::Eb7 => "D#",
            Self::E7 => "E",
            Self::F7 => "F",
            Self::Gb7 => "F#",
            Self::G7 => "G",
            Self::Ab7 => "G#",
            Self::A8 => "A",
            Self::Bb8 => "A#",
            Self::B8 => "B",
            Self::C8 => "C",
            Self::Db8 => "C#",
            Self::D8 => "D",
            Self::Eb8 => "D#",
            Self::E8 => "E",
            Self::F8 => "F",
        })
        .to_string()
    }

    fn from_u8(key: u8) -> Self {
        match key {
            15 => Self::Eb0,
            16 => Self::E0,
            17 => Self::F0,
            18 => Self::Gb0,
            19 => Self::G0,
            20 => Self::Ab0,
            21 => Self::A1,
            22 => Self::Bb1,
            23 => Self::B1,
            24 => Self::C1,
            25 => Self::Db1,
            26 => Self::D1,
            27 => Self::Eb1,
            28 => Self::E1,
            29 => Self::F1,
            30 => Self::Gb1,
            31 => Self::G1,
            32 => Self::Ab1,
            33 => Self::A2,
            34 => Self::Bb2,
            35 => Self::B2,
            36 => Self::C2,
            37 => Self::Db2,
            38 => Self::D2,
            39 => Self::Eb2,
            40 => Self::E2,
            41 => Self::F2,
            42 => Self::Gb2,
            43 => Self::G2,
            44 => Self::Ab2,
            45 => Self::A3,
            46 => Self::Bb3,
            47 => Self::B3,
            48 => Self::C3,
            49 => Self::Db3,
            50 => Self::D3,
            51 => Self::Eb3,
            52 => Self::E3,
            53 => Self::F3,
            54 => Self::Gb3,
            55 => Self::G3,
            56 => Self::Ab3,
            57 => Self::A4,
            58 => Self::Bb4,
            59 => Self::B4,
            60 => Self::C4,
            61 => Self::Db4,
            62 => Self::D4,
            63 => Self::Eb4,
            64 => Self::E4,
            65 => Self::F4,
            66 => Self::Gb4,
            67 => Self::G4,
            68 => Self::Ab4,
            69 => Self::A5,
            70 => Self::Bb5,
            71 => Self::B5,
            72 => Self::C5,
            73 => Self::Db5,
            74 => Self::D5,
            75 => Self::Eb5,
            76 => Self::E5,
            77 => Self::F5,
            78 => Self::Gb5,
            79 => Self::G5,
            80 => Self::Ab5,
            81 => Self::A6,
            82 => Self::Bb6,
            83 => Self::B6,
            84 => Self::C6,
            85 => Self::Db6,
            86 => Self::D6,
            87 => Self::Eb6,
            88 => Self::E6,
            89 => Self::F6,
            90 => Self::Gb6,
            91 => Self::G6,
            92 => Self::Ab6,
            93 => Self::A7,
            94 => Self::Bb7,
            95 => Self::B7,
            96 => Self::C7,
            97 => Self::Db7,
            98 => Self::D7,
            99 => Self::Eb7,
            100 => Self::E7,
            101 => Self::F7,
            102 => Self::Gb7,
            103 => Self::G7,
            104 => Self::Ab7,
            105 => Self::A8,
            106 => Self::Bb8,
            107 => Self::B8,
            108 => Self::C8,
            109 => Self::Db8,
            110 => Self::D8,
            111 => Self::Eb8,
            112 => Self::E8,
            113 => Self::F8,
            k => panic!("Invalid Piano Key Code: {}", k),
        }
    }
}

impl Serialize for PianoKeyCode {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // Serialize the enum as a u8
        serializer.serialize_u8(*self as u8)
    }
}

// Implement Deserialize for NoteState
impl<'de> Deserialize<'de> for PianoKeyCode {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        // Deserialize the value as a u8
        let value = u8::deserialize(deserializer)?;
        match value {
            15..=113 => Ok(PianoKeyCode::from_u8(value)),
            _ => Err(serde::de::Error::custom(format!(
                "Invalid NoteState value: {}",
                value
            ))),
        }
    }
}

#[derive(Debug, Clone, Copy)]
enum NoteState {
    On = 144,
    Off = 128,
}

impl Serialize for NoteState {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // Serialize the enum as a u8
        serializer.serialize_u8(*self as u8)
    }
}

// Implement Deserialize for NoteState
impl<'de> Deserialize<'de> for NoteState {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        // Deserialize the value as a u8
        let value = u8::deserialize(deserializer)?;
        match value {
            144 => Ok(NoteState::On),
            128 => Ok(NoteState::Off),
            _ => Err(serde::de::Error::custom(format!(
                "Invalid NoteState value: {}",
                value
            ))),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
struct Velocity(u8);

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
enum EventType {
    Note(NoteState, PianoKeyCode, Velocity),
}

#[derive(Debug, Clone, Copy)]
enum Channel {
    Ch1 = 0,
    Ch2 = 1,
    Ch3 = 2,
    Ch4 = 3,
    Ch5 = 4,
    Ch6 = 5,
    Ch7 = 6,
    Ch8 = 7,
    Ch9 = 8,
    Ch10 = 9,
    Ch11 = 10,
    Ch12 = 11,
    Ch13 = 12,
    Ch14 = 13,
    Ch15 = 14,
    Ch16 = 15,
}

impl Channel {
    fn from_u8(channel: u8) -> Channel {
        match channel {
            0 => Channel::Ch1,
            1 => Channel::Ch2,
            2 => Channel::Ch3,
            3 => Channel::Ch4,
            4 => Channel::Ch5,
            5 => Channel::Ch6,
            6 => Channel::Ch7,
            7 => Channel::Ch8,
            8 => Channel::Ch9,
            9 => Channel::Ch10,
            10 => Channel::Ch11,
            11 => Channel::Ch12,
            12 => Channel::Ch13,
            13 => Channel::Ch14,
            14 => Channel::Ch15,
            15 => Channel::Ch16,
            _ => panic!("Invalid channel number"),
        }
    }
}

impl Serialize for Channel {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // Serialize the enum as a u8
        serializer.serialize_u8(*self as u8)
    }
}

// Implement Deserialize for Channel
impl<'de> Deserialize<'de> for Channel {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let value = u8::deserialize(deserializer)?;
        match value {
            0..=15 => Ok(Channel::from_u8(value)),
            _ => Err(serde::de::Error::custom(format!(
                "Invalid Channel value: {}",
                value
            ))),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
struct PianoEvent {
    event_type: EventType,
    channel: Channel,
}

struct MidiMessageParser<'a> {
    msg: &'a [u8],
}

impl<'a> MidiMessageParser<'a> {
    fn parse(&self) -> Option<PianoEvent> {
        let channel = Channel::from_u8(self.msg[0] & 0x0F);

        let event_type = match self.msg[0] & 0xF0 {
            144 => EventType::Note(
                NoteState::On,
                PianoKeyCode::from_u8(self.msg[1]),
                Velocity(self.msg[2]),
            ),
            128 => EventType::Note(
                NoteState::Off,
                PianoKeyCode::from_u8(self.msg[1]),
                Velocity(self.msg[2]),
            ),
            _ => return None,
        };

        let piano_event = PianoEvent {
            event_type,
            channel,
        };

        Some(piano_event)
    }
}


enum MidiOutState {
    Connected(Option<(MidiOutputConnection, AvailableMidiOutput)>),
    Disconnected(Option<MidiOutput>),
}

impl MidiOutState {
    fn close(&mut self) -> bool {
        if let MidiOutState::Connected(midi_out_conn) = self {
            let (midi_out) = midi_out_conn.take().unwrap().0.close();
            *self = MidiOutState::Disconnected(Some(midi_out));
            return true;
        }
        false
    }

    fn connect_with_id(&mut self, id: String, app_handle: AppHandle) -> bool {
        if let MidiOutState::Disconnected(midi_out) = self {
            let midi_out = midi_out.take().unwrap();
            let port = midi_out.find_port_by_id(id).unwrap();
            let available_midi_output = AvailableMidiOutput {
                name: midi_out.port_name(&port).unwrap(),
                index: port.id(),
            };

            let midi_out_conn = midi_out
                    .connect(
                        &port,
                        "midir-write-output",
                    )
                    .expect("error while connecting to midi output");

            *self = MidiOutState::Connected(Some((midi_out_conn, available_midi_output)));
            return true;
        }
        false
    }

    fn send_out(&mut self, data: &[u8]) {
        if let MidiOutState::Connected(midi_out_conn) = self {
            let midi_out_conn = midi_out_conn.as_mut().unwrap();
            midi_out_conn.0.send(data).expect("error while sending midi data");
        }
    }
}

enum MidiInState {
    Connected(Option<(JoinHandle<MidiInputConnection<()>>, AvailableMidiInput)>),
    Disconnected(Option<MidiInput>),
}

impl MidiInState {
    fn close(&mut self) -> bool {
        if let MidiInState::Connected(midi_in_conn) = self {
            let (midi_in, _) = midi_in_conn.take().unwrap().0.join().unwrap().close();
            *self = MidiInState::Disconnected(Some(midi_in));
            return true;
        }
        false
    }

    fn connect_with_id(&mut self, id: String, app_handle: AppHandle) -> bool {
        if let MidiInState::Disconnected(midi_in) = self {
            let midi_in = midi_in.take().unwrap();
            let port = midi_in.find_port_by_id(id).unwrap();
            let available_midi_input = AvailableMidiInput {
                name: midi_in.port_name(&port).unwrap(),
                index: port.id(),
            };

            let join_handle = thread::spawn(move || {
                let midi_in_conn = midi_in
                    .connect(
                        &port,
                        "midir-read-input",
                        move |_timestamp, message, _| {
                            let parser = MidiMessageParser { msg: message };
                            let piano_event = parser.parse();
                            if let Some(piano_event) = piano_event {
                                app_handle
                                    .emit("piano_event", piano_event)
                                    .expect("error while emitting piano event");
                            }

                            let state: State<'_, Mutex<AppState>> = app_handle.state();
                            let mut state = state.lock().unwrap();

                            if let Some((recording, timestart, last_event_time)) =
                                &mut state.recording
                            {
                                if let LiveEvent::Midi { channel, message } =
                                    LiveEvent::parse(message).unwrap()
                                {
                                 
                                    let now = timestart.elapsed().as_millis() as u32;
                                    let delta = now - *last_event_time; // Delta since the last event
                                    *last_event_time = now;
                                    let track_event = TrackEvent {
                                        delta: u28::from_int_lossy(delta),
                                        kind: TrackEventKind::Midi { channel, message },
                                    };
                                    recording.push(track_event);
                                } else {
                                    println!("Invalid MIDI message");
                                }
                            }
                        },
                        (),
                    )
                    .expect("error while connecting to midi input");

                midi_in_conn
            });

            *self = MidiInState::Connected(Some((join_handle, available_midi_input)));
            return true;
        }
        false
    }
}
struct AppState<'a> {
    midi_in_state: MidiInState,
    midi_out_state: MidiOutState,
    recording: Option<(Track<'a>, Instant, u32)>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            app.manage(Mutex::new(AppState {
                midi_in_state: MidiInState::Disconnected(Some(
                    MidiInput::new("midir input").expect("error while creating midi input"),
                )),
                midi_out_state: MidiOutState::Disconnected(Some(
                    MidiOutput::new("midir output").expect("error while creating midi output"),
                )),
                recording: None,
            }));
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_available_midi_inputs,
            get_midi_in_connection_info,
            connect_to_midi_in,
            disconnect_from_midi_in,
            start_recording,
            stop_recording,
            is_recording,playback_midi_file,
            playback_midi_event
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AvailableMidiInput {
    name: String,
    index: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AvailableMidiOutput {
    name: String,
    index: String,
}

#[tauri::command]
fn get_available_midi_inputs(state: State<'_, Mutex<AppState>>) -> Vec<AvailableMidiInput> {
    let state = state.lock().unwrap();
    let available_midi_inputs = match &state.midi_in_state {
        MidiInState::Connected(_) => {
            return vec![];
        }
        MidiInState::Disconnected(midi_in) => {
            let midi_in = midi_in.as_ref().unwrap();
            midi_in
                .ports()
                .iter()
                .map(|port| {
                    let port_name = midi_in.port_name(port).unwrap();
                    AvailableMidiInput {
                        name: port_name,
                        index: port.id(),
                    }
                })
                .collect::<Vec<_>>()
        }
    };

    available_midi_inputs
}

#[tauri::command]
fn get_midi_in_connection_info(app: AppHandle) -> Option<AvailableMidiInput> {
    let state: State<'_, Mutex<AppState>> = app.state();
    let state = state.lock().unwrap();
    match &state.midi_in_state {
        MidiInState::Connected(conn) => Some(conn.as_ref().unwrap().1.clone()),
        MidiInState::Disconnected(_) => None,
    }
}

#[tauri::command]
fn connect_to_midi_in(app: AppHandle, index: String) -> bool {
    let app_handle = app.clone();
    let state: State<'_, Mutex<AppState>> = app.state();
    let mut state = state.lock().unwrap();
    state.midi_in_state.connect_with_id(index, app_handle)
}

#[tauri::command]
fn disconnect_from_midi_in(app: AppHandle) -> bool {
    let state: State<'_, Mutex<AppState>> = app.state();
    let mut state = state.lock().unwrap();
    state.midi_in_state.close()
}

#[tauri::command]
fn is_recording(app: AppHandle) -> bool {
    let state: State<'_, Mutex<AppState>> = app.state();
    let state = state.lock().unwrap();
    state.recording.is_some()
}

#[tauri::command]
fn start_recording(app: AppHandle) -> bool {
    let state: State<'_, Mutex<AppState>> = app.state();
    let mut state = state.lock().unwrap();
    if state.recording.is_some() {
        return false;
    }
    let recording = Track::default();
    state.recording = Some((recording, Instant::now(), 0));
    true
}

#[tauri::command]
fn stop_recording(app: AppHandle) -> bool {
    let state: State<'_, Mutex<AppState>> = app.state();
    let mut state = state.lock().unwrap();
    let mut success = false;
    if let Some((recording, timestart, last_time_event)) = &mut state.recording {
        let delta = timestart.elapsed().as_millis() as u32 - *last_time_event;
        recording.push(TrackEvent {
            delta: u28::from_int_lossy(delta),
            kind: TrackEventKind::Meta(midly::MetaMessage::EndOfTrack),
        });

        let mut smf = Smf::new(Header {
            format: Format::SingleTrack,
            timing: Timing::Metrical(u15::from_int_lossy(480)),
        });

        smf.tracks.push(mem::replace(recording, Track::default()));

        smf.save("recording.mid")
            .expect("error while saving midi file");

        success = true;
    }

    state.recording = None;

    return success;
}

struct PlaybackEvent {
    delta: u32,
    message: [u8; 3],
    time_length: u32,
    is_note_on: bool,
}

impl PlaybackEvent {
    fn to_packed(&self) -> PackedPlaybackEvent {
        PackedPlaybackEvent {
            is_note_on: self.is_note_on,
            message: self.message,
            time_length: self.time_length,
        }
    }

    fn take_raw(self) -> [u8; 3] {
        self.message
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct PackedPlaybackEvent {
    is_note_on: bool,
    message: [u8; 3],
    time_length: u32,
}

impl PlaybackEvent {
    fn from_track_event(track_event: &TrackEvent) -> Self {
        if let TrackEventKind::Midi { channel, message } = track_event.kind {
            let event = LiveEvent::Midi {
                channel,
                message,
            };

            let is_note_on = match message {
                midly::MidiMessage::NoteOn { .. } => true,
                _ => false,
            };

            // Create a buffer to hold the raw MIDI bytes
            let mut buf = Vec::with_capacity(3);

            // Write the event's raw bytes into the buffer
            event.write(&mut buf).expect("Failed to write MIDI event");

            PlaybackEvent {
                delta: track_event.delta.as_int(),
                message: [buf[0], buf[1], buf[2]],
                is_note_on,
                time_length: 0,
            }
        } else {
            panic!("Invalid TrackEventKind");
        }
    }
}

#[tauri::command]
async fn playback_midi_file(app: AppHandle, path: String) -> bool {
    let app_handle = app.clone();
    let app_state = app.clone();
    {
        let state: State<'_, Mutex<AppState>> = app_state.state();
        let mut state = state.lock().unwrap();

        let out_id = match &state.midi_out_state {
            MidiOutState::Connected(conn) => {
                return false;
            },
            MidiOutState::Disconnected(midi_out) => {
                let ports = midi_out.as_ref().unwrap().ports();
                let available_port = ports.iter().next().unwrap();
        
                available_port.id()
            }
        };
        

        state.midi_out_state.connect_with_id(out_id, app_handle.clone());
    }




   let join_handle = std::thread::spawn(move || {
        let data = std::fs::read(path).expect("Error while reading MIDI file");
        let smf = Smf::parse(&data).expect("Error while parsing MIDI file");

        if smf.tracks.is_empty() {
            return false;
        }

        // u8 is note, u32 is start time, usize is index in playback_track
        let mut events_map: HashMap<u8, (u32, usize)> = HashMap::new();
        let mut playback_track: Vec<PlaybackEvent> = Vec::new();
        let mut elapsed_time = 0u32;

        for event in smf.tracks[0].iter() {
            elapsed_time += event.delta.as_int();
            if let TrackEventKind::Midi { message,.. } = event.kind {
                let playback_event = PlaybackEvent::from_track_event(&event);
                playback_track.push(playback_event);

                if let midly::MidiMessage::NoteOn { key, .. } = message {
                    events_map.insert(key.as_int(), (elapsed_time, playback_track.len() - 1));
                } else if let midly::MidiMessage::NoteOff { key, .. } = message {
                    if let Some((start_time, index)) = events_map.remove(&key.as_int()) {
                        let time_length = elapsed_time - start_time;
                        playback_track[index].time_length = time_length;
                    }
                }
            }
        }

        

        // Keep track of elapsed time
        let playback_start = std::time::Instant::now();
        let mut cumulative_delta = 0u64; // Cumulative delta time in milliseconds

        let track = &smf.tracks[0];

        for (i, event) in playback_track.iter().enumerate() {
            cumulative_delta += event.delta as u64;

            // Calculate the target playback time for the current event
            let target_time = std::time::Duration::from_millis(cumulative_delta);
            let elapsed_time = playback_start.elapsed();

            // Wait until the target time is reached
            if target_time > elapsed_time {
                std::thread::sleep(target_time - elapsed_time);
            }

            app.emit("future_piano_event", event.to_packed()).expect("Error while emitting piano event");

            let track_event = &track[i];
            if let TrackEventKind::Midi { channel, message } = &track_event.kind {
                let event = LiveEvent::Midi {
                    channel: *channel,
                    message: message.clone(),
                };

                let mut buf = Vec::with_capacity(3);
                event.write(&mut buf).expect("Failed to write MIDI event");

                let event = [buf[0], buf[1], buf[2]];

                println!("I: {}, len: {}", i, track.len());

                app.emit("future_piano_playback", event).expect("Error while emitting piano event");
            }
        }
        true
    });

    

    join_handle.join().expect("Error while joining thread");

    std::thread::sleep(std::time::Duration::from_secs(5));

    let state: State<'_, Mutex<AppState>> = app_handle.state();
    let mut state = state.lock().unwrap();
    state.midi_out_state.close();

    true
}

#[tauri::command]
async fn playback_midi_event(app: AppHandle, ev: [u8; 3]) -> bool {
    let state: State<'_, Mutex<AppState>> = app.state();
    let mut state = state.lock().unwrap();
    
    match &mut state.midi_out_state {
        MidiOutState::Connected(midi_out) => {
            midi_out.as_mut().unwrap().0.send(&ev).expect("error while sending midi data");
            return true;
        },
        MidiOutState::Disconnected(_) => {
            return false;
        }
    }
}