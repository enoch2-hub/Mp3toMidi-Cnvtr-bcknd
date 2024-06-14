// server.js
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { Midi } = require('@tonejs/midi');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, req.file.path);
    const outputFilePath = filePath.replace('.mp3', '.wav');

    // Convert MP3 to WAV using ffmpeg
    ffmpeg(filePath)
        .toFormat('wav')
        .on('end', () => {
            try {
                // Convert WAV to MIDI using @tonejs/midi
                const wavData = fs.readFileSync(outputFilePath);
                const midi = new Midi();

                // Add dummy data to MIDI file (this should be replaced with actual conversion logic)
                midi.addTrack();
                const midiData = midi.toArray();

                const midiFilePath = filePath.replace('.mp3', '.mid');
                fs.writeFileSync(midiFilePath, Buffer.from(midiData));

                // Send the MIDI file to the client
                res.sendFile(midiFilePath);
            } catch (error) {
                console.error('Error converting to MIDI:', error);
                res.status(500).send('Error converting to MIDI.');
            }
        })
        .on('error', (err) => {
            console.error('Error converting MP3 to WAV:', err);
            res.status(500).send('Error converting MP3 to WAV.');
        })
        .save(outputFilePath);
});

app.listen(2000, () => {
    console.log('Server is running on port 2000');
});
