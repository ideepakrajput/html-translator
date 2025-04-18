// html-translator.js
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const translator = require('open-google-translator');

// Function to recursively translate text nodes in an element
async function translateElementContent(element, sourceLanguage, targetLanguage) {
    // Skip script and style elements
    if (element.nodeName === 'SCRIPT' || element.nodeName === 'STYLE') {
        return;
    }

    // Process child nodes
    for (let i = 0; i < element.childNodes.length; i++) {
        const node = element.childNodes[i];

        // Text node - translate content
        if (node.nodeType === 3 && node.textContent.trim()) { // Text node with non-empty content
            const originalText = node.textContent.trim();
            if (originalText) {
                try {
                    const translatedText = await translator
                        .TranslateLanguageData({
                            listOfWordsToTranslate: [originalText],
                            fromLanguage: sourceLanguage,
                            toLanguage: targetLanguage
                        });
                    // console.log(translatedText);
                    node.textContent = node.textContent.replace(originalText, translatedText[0].translation);
                } catch (error) {
                    console.error(`Translation error for text "${originalText}": ${error.message}`);
                }
            }
        }
        // Process element nodes recursively
        else if (node.nodeType === 1) { // Element node
            // Handle alt attributes for images
            if (node.nodeName === 'IMG' && node.hasAttribute('alt') && node.getAttribute('alt').trim()) {
                const altText = node.getAttribute('alt');
                try {
                    const translatedAlt = await translator
                        .TranslateLanguageData({
                            listOfWordsToTranslate: [altText],
                            fromLanguage: sourceLanguage,
                            toLanguage: targetLanguage
                        });
                    // console.log(translatedAlt);
                    node.setAttribute('alt', translatedAlt[0].translation);
                } catch (error) {
                    console.error(`Translation error for alt text "${altText}": ${error.message}`);
                }
            }

            // Handle title attributes
            if (node.hasAttribute('title') && node.getAttribute('title').trim()) {
                const titleText = node.getAttribute('title');
                try {
                    const translatedTitle = await translate({
                        text: titleText,
                        source: sourceLanguage,
                        target: targetLanguage
                    });
                    node.setAttribute('title', translatedTitle);
                } catch (error) {
                    console.error(`Translation error for title "${titleText}": ${error.message}`);
                }
            }

            // Recursively process child elements
            await translateElementContent(node, sourceLanguage, targetLanguage);
        }
    }
}

async function translateHtml(inputFile, outputFile, sourceLang, targetLang) {
    try {
        // Read the HTML file
        const htmlContent = fs.readFileSync(inputFile, 'utf8');

        // Parse HTML using JSDOM
        const dom = new JSDOM(htmlContent);
        const { document } = dom.window;

        console.log(`Starting translation from ${sourceLang} to ${targetLang}...`);

        // Translate all text content in the document
        await translateElementContent(document.body, sourceLang, targetLang);

        // Update the HTML lang attribute
        document.documentElement.setAttribute('lang', targetLang);

        // Get the translated HTML content
        const translatedHtml = dom.serialize();

        // Write the translated content to the output file
        fs.writeFileSync(outputFile, translatedHtml, 'utf8');

        console.log(`Translation completed successfully. Translated file saved to: ${outputFile}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Process command line arguments
function parseArgs() {
    const args = process.argv.slice(2);

    if (args.length < 4) {
        console.error('Usage: node index.js <input-file> <output-file> <source-language> <target-language>');
        console.error('Example: node html-translator.js index.html index-es.html en es');
        process.exit(1);
    }

    return {
        inputFile: args[0],
        outputFile: args[1],
        sourceLanguage: args[2],
        targetLanguage: args[3]
    };
}

// Main function
async function main() {
    const { inputFile, outputFile, sourceLanguage, targetLanguage } = parseArgs();

    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file '${inputFile}' not found.`);
        process.exit(1);
    }

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    await translateHtml(inputFile, outputFile, sourceLanguage, targetLanguage);
}

// Execute the main function
main().catch(err => {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
});