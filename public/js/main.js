document.addEventListener('DOMContentLoaded', function () {
    const translationForm = document.getElementById('translationForm');
    const htmlFileInput = document.getElementById('htmlFile');
    const selectedFileName = document.getElementById('selectedFileName');
    const sourceLangSelect = document.getElementById('sourceLang');
    const targetLangSelect = document.getElementById('targetLang');
    const translateBtn = document.getElementById('translateBtn');
    const progressContainer = document.getElementById('progressContainer');
    const resultContainer = document.getElementById('resultContainer');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const downloadBtn = document.getElementById('downloadBtn');

    // Load supported languages
    fetch('/languages')
        .then(response => response.json())
        .then(languages => {
            // Populate language dropdowns
            for (const [code, name] of Object.entries(languages)) {
                const sourceOption = document.createElement('option');
                sourceOption.value = code;
                sourceOption.textContent = `${name} (${code})`;
                sourceLangSelect.appendChild(sourceOption);

                const targetOption = document.createElement('option');
                targetOption.value = code;
                targetOption.textContent = `${name} (${code})`;
                targetLangSelect.appendChild(targetOption);
            }

            // Set default values
            sourceLangSelect.value = 'en';
            targetLangSelect.value = 'es';
        })
        .catch(error => {
            console.error('Error loading languages:', error);
            errorContainer.classList.remove('hidden');
            errorMessage.textContent = 'Failed to load supported languages. Please refresh the page.';
        });

    // Show selected file name
    htmlFileInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            selectedFileName.textContent = this.files[0].name;
            selectedFileName.classList.remove('hidden');
        } else {
            selectedFileName.classList.add('hidden');
        }
    });

    // Handle drag and drop
    const uploadArea = document.getElementById('uploadArea');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        uploadArea.closest('label').classList.add('bg-blue-50', 'border-blue-300');
    }

    function unhighlight() {
        uploadArea.closest('label').classList.remove('bg-blue-50', 'border-blue-300');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        htmlFileInput.files = files;

        if (files.length > 0) {
            selectedFileName.textContent = files[0].name;
            selectedFileName.classList.remove('hidden');
        }
    }

    // Handle form submission
    translationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Validate form
        if (!htmlFileInput.files.length) {
            showError('Please select an HTML file to translate.');
            return;
        }

        if (!sourceLangSelect.value) {
            showError('Please select a source language.');
            return;
        }

        if (!targetLangSelect.value) {
            showError('Please select a target language.');
            return;
        }

        // Hide any previous results or errors
        resultContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');

        // Show progress indicator
        progressContainer.classList.remove('hidden');

        // Disable form elements during translation
        setFormEnabled(false);

        // Create form data
        const formData = new FormData();
        formData.append('htmlFile', htmlFileInput.files[0]);
        formData.append('sourceLang', sourceLangSelect.value);
        formData.append('targetLang', targetLangSelect.value);

        // Send translation request
        fetch('/translate', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // Hide progress indicator
                progressContainer.classList.add('hidden');

                if (data.success) {
                    // Show success message and download button
                    resultContainer.classList.remove('hidden');
                    downloadBtn.href = data.downloadPath;
                    downloadBtn.download = `translated-${htmlFileInput.files[0].name}`;
                } else {
                    // Show error message
                    showError(data.message || 'Translation failed. Please try again.');
                }

                // Re-enable form
                setFormEnabled(true);
            })
            .catch(error => {
                // Hide progress indicator
                progressContainer.classList.add('hidden');

                // Show error message
                showError('An error occurred during translation. Please try again.');
                console.error('Translation error:', error);

                // Re-enable form
                setFormEnabled(true);
            });
    });

    function showError(message) {
        errorContainer.classList.remove('hidden');
        errorMessage.textContent = message;
    }

    function setFormEnabled(enabled) {
        htmlFileInput.disabled = !enabled;
        sourceLangSelect.disabled = !enabled;
        targetLangSelect.disabled = !enabled;
        translateBtn.disabled = !enabled;

        if (!enabled) {
            translateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            translateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
});