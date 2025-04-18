# HTML Translator

A web application that translates HTML files from one language to another while preserving the HTML structure.

## Overview

HTML Translator is a Node.js application that allows users to upload HTML files and translate all text content to a different language. The application preserves the HTML structure and also translates attributes like `alt` and `title`.

## Features

-   Upload HTML files through a web interface
-   Translate HTML content between multiple languages
-   Preserve HTML structure during translation
-   Translate image alt text and title attributes
-   Download translated HTML files

## Technologies Used

-   Node.js
-   Express.js
-   Multer (for file uploads)
-   JSDOM (for HTML parsing)
-   open-google-translator (for translation)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ideepakrajput/html-translator.git
```

2. Navigate to the project directory:

```bash
cd html-translator
```

3. Install dependencies:

```bash
npm install
```

4. Create required directories:

```bash
mkdir -p public/downloads uploads
```

## Usage

### Starting the Server

Run the application:

```bash
node index.js
```

The server will start at http://localhost:3000

### Web Interface

1. Open your browser and navigate to http://localhost:3000
2. Select the HTML file you want to translate
3. Choose the source and target languages
4. Click "Translate" to process the file
5. Download the translated HTML file when ready

### API Endpoints

-   **POST /translate**: Upload and translate an HTML file

    -   Request: multipart/form-data with:
        -   `htmlFile`: The HTML file to translate
        -   `sourceLang`: Source language code (e.g., 'en')
        -   `targetLang`: Target language code (e.g., 'es')
    -   Response: JSON with download path for the translated file

-   **GET /languages**: Get a list of supported languages
    -   Response: JSON array of supported language codes and names

### Command Line Usage

You can also use the translator directly from the command line:

```bash
node html-translator.js <input-file> <output-file> <source-language> <target-language>
```

Example:

```bash
node html-translator.js index.html index-es.html en es
```

## How It Works

1. The application parses the uploaded HTML file using JSDOM
2. It recursively traverses the DOM tree, identifying text nodes and translatable attributes
3. Each text content is translated using the open-google-translator library
4. The translated content replaces the original text while maintaining the HTML structure
5. The translated HTML file is saved and made available for download

## Project Structure

-   `index.js`: Main Express server and API endpoints
-   `html-translator.js`: Core translation functionality
-   `supportedLang.js`: List of supported languages
-   `public/`: Static files and download directory
-   `uploads/`: Temporary storage for uploaded files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
