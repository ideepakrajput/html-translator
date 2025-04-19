const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { translateHtmlContent } = require('./html-translator');
const { supportedLang } = require('./supportedLang.js');

const app = express();
const port = process.env.PORT || 3001;

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Translate endpoint - now works directly with content
app.post('/translate', upload.single('htmlFile'), async (req, res) => {
    try {
        const { sourceLang, targetLang } = req.body;
        const fileName = req.file.originalname;
        const htmlContent = req.file.buffer.toString('utf-8');

        // Translate the HTML content directly
        const translatedHtml = await translateHtmlContent(htmlContent, sourceLang, targetLang);

        // Generate a suggested filename for the download
        const suggestedFilename = `translated-${fileName}`;

        res.json({
            success: true,
            message: 'Translation completed successfully',
            translatedHtml: translatedHtml,
            suggestedFilename: suggestedFilename
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

// For Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`HTML Translator app listening at http://localhost:${port}`);
    });
}

// Export for Vercel serverless deployment
module.exports = app;
