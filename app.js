(function () {
  'use strict';

  const micBtn = document.getElementById('micBtn');
  const statusEl = document.getElementById('status');
  const faderWrap = document.getElementById('faderWrap');
  const gainFader = document.getElementById('gainFader');
  const gainVal = document.getElementById('gainVal');

  let audioCtx = null;
  let convolver = null;
  let sourceNode = null;
  let micGain = null;
  let dryGain = null;
  let wetGain = null;
  let stream = null;
  let isActive = false;
  let irBuffer = null;

  // ---------- helpers ----------

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  async function loadIR() {
    setStatus('Loading impulse response…');
    const resp = await fetch('IR-01.wav');
    if (!resp.ok) throw new Error('Could not load IR-01.wav');
    const arrayBuf = await resp.arrayBuffer();
    irBuffer = await audioCtx.decodeAudioData(arrayBuf);
    setStatus('');
  }

  // ---------- fader ----------

  gainFader.addEventListener('input', function () {
    const pct = parseInt(this.value, 10);
    gainVal.textContent = pct + '%';
    if (micGain) {
      micGain.gain.setTargetAtTime(pct / 100, audioCtx.currentTime, 0.02);
    }
  });

  // ---------- start / stop ----------

  async function start() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
      }

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      if (!irBuffer) {
        await loadIR();
      }

      setStatus('Requesting microphone…');
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      // Build graph: mic → micGain → convolver → wetGain → dest
      //                            ↘ dryGain → dest
      sourceNode = audioCtx.createMediaStreamSource(stream);

      micGain = audioCtx.createGain();
      micGain.gain.value = parseInt(gainFader.value, 10) / 100;

      convolver = audioCtx.createConvolver();
      convolver.buffer = irBuffer;
      convolver.normalize = false;

      dryGain = audioCtx.createGain();
      wetGain = audioCtx.createGain();
      dryGain.gain.value = 0.25;
      wetGain.gain.value = 1.0;

      sourceNode.connect(micGain);
      micGain.connect(dryGain);
      micGain.connect(convolver);
      convolver.connect(wetGain);

      dryGain.connect(audioCtx.destination);
      wetGain.connect(audioCtx.destination);

      isActive = true;
      micBtn.classList.add('active');
      faderWrap.classList.add('visible');
      setStatus('Listening — speak into the bridge');

    } catch (err) {
      console.error(err);
      setStatus(err.name === 'NotAllowedError'
        ? 'Microphone access denied. Please allow it in your browser settings.'
        : 'Error: ' + err.message);
    }
  }

  function stop() {
    if (sourceNode) { try { sourceNode.disconnect(); } catch (e) {} sourceNode = null; }
    if (micGain) { try { micGain.disconnect(); } catch (e) {} micGain = null; }
    if (convolver) { try { convolver.disconnect(); } catch (e) {} convolver = null; }
    if (dryGain) { try { dryGain.disconnect(); } catch (e) {} dryGain = null; }
    if (wetGain) { try { wetGain.disconnect(); } catch (e) {} wetGain = null; }

    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }

    isActive = false;
    micBtn.classList.remove('active');
    faderWrap.classList.remove('visible');
    setStatus('');
  }

  // ---------- event ----------

  micBtn.addEventListener('click', function () {
    if (isActive) {
      stop();
    } else {
      start();
    }
  });
})();
