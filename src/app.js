const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer();

app.use(express.json());

// Route handler for text-to-speech conversion
app.post('/api/text-to-speech', (req, res) => {
    const { text, speaker = 'male_1', temperature = 0.1 } = req.body;

    // Validate text input
    if (!text) {
        return res.status(400).json({ error: 'Text is required for text-to-speech conversion' });
    }

    // Generate a unique filename to prevent conflicts
    const outputFilename = `output_${Date.now()}.wav`;
    const outputPath = path.join(process.cwd(), outputFilename);

    // Flag to track if response has been sent
    let responseSent = false;

    // Set environment variable to disable oneDNN optimizations
    process.env.TF_ENABLE_ONEDNN_OPTS = '0';

    // Spawn Python process with arguments
    const pythonProcess = spawn('python', [
        'D:\\AllAboutAI\\modelapis\\src\\models\\OutetTTS.py',
        text,
        speaker,
        temperature.toString(),
        outputPath
    ]);

    // Capture standard output
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Output: ${data.toString()}`);
    });


    // Handle process completion
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            // Check if file exists
            if (fs.existsSync(outputPath)) {
                // Send the audio file
                res.download(outputPath, outputFilename, (err) => {
                    // Clean up the file after sending
                    if (!err) {
                        fs.unlinkSync(outputPath);
                    }
                });
            } else {
                if (!responseSent) {
                    responseSent = true; // Mark response as sent
                    res.status(500).json({ error: 'Audio file was not generated' });
                }
            }
        } else {
            if (!responseSent) {
                responseSent = true; // Mark response as sent
                res.status(500).json({ error: 'Failed to convert text to speech' });
            }
        }
    });
});

// New route for Indic-Parler-TTS
app.post('/api/indic-parler-tts', (req, res) => {
    const { prompt, description = "A neutral tone voice with a clear speech quality." } = req.body;

    console.log('Received TTS Request:', { prompt, description });

    // Validate prompt input
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required for Indic-Parler-TTS' });
    }

    // Generate a unique filename for the output
    const outputFilename = `indic_parler_tts_${Date.now()}.wav`;
    const outputPath = path.join(process.cwd(), outputFilename);

    console.log('Output Path:', outputPath);

    // Flag to track if response has been sent
    let responseSent = false;

    // Set environment variable to disable oneDNN optimizations
    process.env.TF_ENABLE_ONEDNN_OPTS = '0';

    // Spawn the Python process with the correct path
    const pythonProcess = spawn('python', [
        'D:\\AllAboutAI\\modelapis\\src\\models\\bharatTTS.py',
        prompt,
        description,
        outputPath
    ]);

    // Capture standard output
    pythonProcess.stdout.on('data', (data) => {
        console.log(`STDOUT: ${data.toString().trim()}`);
    });

    // Capture standard error
    pythonProcess.stderr.on('data', (data) => {
        const errorMessage = data.toString().trim();
        console.error(`STDERR: ${errorMessage}`);
        
        if (!responseSent) {
            responseSent = true;
            return res.status(500).json({ 
                error: 'Failed to process Indic-Parler-TTS', 
                details: errorMessage 
            });
        }
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);

        if (code === 0) {
            // Check if the file exists
            if (fs.existsSync(outputPath)) {
                // Send the audio file
                res.download(outputPath, outputFilename, (err) => {
                    // Clean up the file after sending
                    if (!err) {
                        fs.unlinkSync(outputPath);
                    }
                });
            } else {
                if (!responseSent) {
                    responseSent = true;
                    res.status(500).json({ error: 'Audio file was not generated' });
                }
            }
        } else {
            if (!responseSent) {
                responseSent = true;
                res.status(500).json({ 
                    error: 'Failed to process Indic-Parler-TTS', 
                    exitCode: code 
                });
            }
        }
    });
});

//Fish TTS
app.post('/api/fishtext-to-speech', (req, res) => {
    const { text, speaker = 'male_1', temperature = 0.1 } = req.body;

    // Validate text input
    if (!text) {
        return res.status(400).json({ error: 'Text is required for text-to-speech conversion' });
    }

    // Generate a unique filename to prevent conflicts
    const outputFilename = `output_${Date.now()}.wav`;
    const outputPath = path.join(process.cwd(), outputFilename);

    // Flag to track if response has been sent
    let responseSent = false;

    // Set environment variable to disable oneDNN optimizations
    process.env.TF_ENABLE_ONEDNN_OPTS = '0';

    // Spawn Python process with arguments
    const pythonProcess = spawn('python', [
        'D:\\AllAboutAI\\modelapis\\src\\models\\fishTTS.py',
        text,
        speaker,
        temperature.toString(),
        outputPath
    ]);

    // Capture standard output
    pythonProcess.stdout.on('data', (data) => {
        console.log(`Output: ${data.toString()}`);
    });


    // Handle process completion
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            // Check if file exists
            if (fs.existsSync(outputPath)) {
                // Send the audio file
                res.download(outputPath, outputFilename, (err) => {
                    // Clean up the file after sending
                    if (!err) {
                        fs.unlinkSync(outputPath);
                    }
                });
            } else {
                if (!responseSent) {
                    responseSent = true; // Mark response as sent
                    res.status(500).json({ error: 'Audio file was not generated' });
                }
            }
        } else {
            if (!responseSent) {
                responseSent = true; // Mark response as sent
                res.status(500).json({ error: 'Failed to convert text to speech' });
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
