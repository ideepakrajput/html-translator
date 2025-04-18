const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { translateHtml } = require('./html-translator');
const { supportedLang } = require('./supportedLang.js');

const app = express();
const port = 3000;

// Configure multer to store files in memory instead of disk
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Expose the translateHtml function
app.post('/translate', upload.single('htmlFile'), async (req, res) => {
    try {
        const { sourceLang, targetLang } = req.body;
        const fileName = req.file.originalname;
        const htmlContent = req.file.buffer.toString('utf-8');
        const outputFileName = `translated-${Date.now()}-${fileName}`;
        const outputFile = path.join('public', 'downloads', outputFileName);

        // Create downloads directory if it doesn't exist
        if (!fs.existsSync(path.join('public', 'downloads'))) {
            fs.mkdirSync(path.join('public', 'downloads'), { recursive: true });
        }

        // We need to modify translateHtml function to accept content directly
        // For now, let's write the buffer to a temporary file and then process it
        const tempInputFile = path.join('temp', `temp-${Date.now()}-${fileName}`);

        // Create temp directory if it doesn't exist
        if (!fs.existsSync('temp')) {
            fs.mkdirSync('temp', { recursive: true });
        }

        // Write the buffer to a temporary file
        fs.writeFileSync(tempInputFile, htmlContent);

        // Translate the HTML file
        await translateHtml(tempInputFile, outputFile, sourceLang, targetLang);

        // Delete the temporary file
        fs.unlinkSync(tempInputFile);

        res.json({
            success: true,
            message: 'Translation completed successfully',
            downloadPath: `/downloads/${outputFileName}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: `Translation failed: ${error.message}`
        });
    }
});

// Endpoint to get supported languages
app.get('/languages', (req, res) => {
    res.send(supportedLang);
});

app.listen(port, () => {
    console.log(`HTML Translator app listening at http://localhost:${port}`);
});