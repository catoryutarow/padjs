/**
 * Audio Pad Web App (Express + React in a single file)
 * ---------------------------------------------------
 * Usage:
 * 1. Create a project folder and place this file inside (e.g., server.js).
 * 2. In that folder, run:
 *        npm init -y
 *        npm install express
 * 3. Create a sub‑folder named "audio" and drop any .mp3/.wav/.ogg/.m4a files into it.
 * 4. Start the app:
 *        node server.js
 * 5. Visit http://localhost:3000 — a button for each audio file will appear, labelled with the file name (sans extension). Click a button to play the sound.
 *
 * Files can be added/removed from the audio folder at any time; just refresh the page to see updated buttons.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const audioDir = path.join(__dirname, 'audio');

// Serve audio files statically
app.use('/audio', express.static(audioDir));

// API → list available audio files
app.get('/api/audioList', (_req, res) => {
  fs.readdir(audioDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const exts = ['.mp3', '.wav', '.ogg', '.m4a'];
    const list = files
      .filter(f => exts.includes(path.extname(f).toLowerCase()))
      .map(f => ({
        name: path.basename(f, path.extname(f)), // label = file name without extension
        url: `/audio/${encodeURIComponent(f)}`,
      }));
    res.json(list);
  });
});

// React UI served from root
app.get('/', (_req, res) => res.send(html));

const html = `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Audio Pad</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <style>
      body { margin: 0; padding: 2rem; font-family: system-ui, sans-serif; }
      .grid { display: flex; flex-wrap: wrap; gap: 1rem; }
      button {
        padding: 1rem 1.5rem;
        font-size: 1rem;
        border: none;
        border-radius: 0.5rem;
        background: #4f46e5;
        color: #fff;
        cursor: pointer;
        transition: transform 0.05s ease;
      }
      button:active { transform: scale(0.96); }
    </style>
  </head>
  <body>
    <h1>Audio Pad</h1>
    <div id="root"></div>

    <script type="text/babel">
      const { useEffect, useState } = React;

      function App() {
        const [tracks, setTracks] = useState([]);

        useEffect(() => {
          fetch('/api/audioList')
            .then(r => r.json())
            .then(setTracks)
            .catch(console.error);
        }, []);

        const play = url => new Audio(url).play();

        return (
          <div className="grid">
            {tracks.map(t => (
              <button key={t.url} onClick={() => play(t.url)}>
                {t.name}
              </button>
            ))}
            {tracks.length === 0 && <p>audio フォルダに音源を追加してください。</p>}
          </div>
        );
      }

      ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
  </body>
</html>`;

app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`)); 