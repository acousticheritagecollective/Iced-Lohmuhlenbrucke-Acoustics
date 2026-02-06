# 🧊 Iced Lohmühlenbrücke Acoustics

A minimal web experience that lets you hear your own voice shaped by the frozen acoustics of [Lohmühlenbrücke](https://en.wikipedia.org/wiki/Lohm%C3%BChlenbr%C3%BCcke), a historic bridge in Berlin-Kreuzberg. Using the Web Audio API, your microphone input is convolved in real time with a stereo impulse response captured on site — transforming your voice, claps, or any sound into the resonant character of the bridge's icy underpass.

## How It Works

The page captures audio from your device's microphone and routes it through a `ConvolverNode` loaded with a stereo impulse response (`IR-01.wav`, 44.1 kHz / 16-bit). A dry/wet mix blends your direct signal with the convolved output, and a gain fader lets you adjust microphone input level in real time.

```
Mic → GainNode (user fader) → ConvolverNode (IR) → WetGain → Output
                             ↘ DryGain ─────────────────────→ Output
```

## Demo

![Screenshot](screenshot.png)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/lohmuhlenbrucke.git
   cd lohmuhlenbrucke
   ```

2. Make sure all assets are in the root folder:
   ```
   ├── index.html
   ├── app.js
   ├── home.jpg        # Fullscreen background photo
   ├── IR-01.wav        # Stereo impulse response (44.1 kHz, 16-bit)
   ├── logo.png         # Logo with alpha transparency
   └── ahc.ico          # Favicon
   ```

3. Serve locally (microphone requires HTTPS or localhost):
   ```bash
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

## Requirements

- A modern browser with Web Audio API support (Chrome, Firefox, Safari, Edge)
- Microphone access
- Headphones recommended to avoid feedback loops

## Tech

- Vanilla HTML / CSS / JavaScript — no dependencies, no build step
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — `ConvolverNode`, `GainNode`, `MediaStreamSource`
- [Barlow Condensed](https://fonts.google.com/specimen/Barlow+Condensed) via Google Fonts

## About

Part of the [Acoustic Heritage Collective](https://acousticheritagecollective.org) — documenting and preserving the sonic identity of public spaces through impulse response recordings and immersive web experiences.

## License

MIT
