const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { translateHtml } = require('./html-translator');
const { supportedLang } = require('./supportedLang.js');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Expose the translateHtml function
app.post('/translate', upload.single('htmlFile'), async (req, res) => {
    try {
        const { sourceLang, targetLang } = req.body;
        const inputFile = req.file.path;
        const fileName = req.file.originalname;
        const outputFileName = `translated-${Date.now()}-${fileName}`;
        const outputFile = path.join('public', 'downloads', outputFileName);

        // Create downloads directory if it doesn't exist
        if (!fs.existsSync(path.join('public', 'downloads'))) {
            fs.mkdirSync(path.join('public', 'downloads'), { recursive: true });
        }

        // Translate the HTML file
        await translateHtml(inputFile, outputFile, sourceLang, targetLang);

        // Delete the uploaded file
        fs.unlinkSync(inputFile);

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