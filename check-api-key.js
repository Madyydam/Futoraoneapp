const API_KEY = 'AIzaSyC9gmzhbPBgR-zBm-4nuclsiiAraHtQwNs';

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const text = await response.text();

        console.log('Status:', response.status);
        console.log('Response:', text.substring(0, 500));

        if (response.ok) {
            const data = JSON.parse(text);
            console.log('\nAvailable models:');
            data.models?.forEach(model => {
                const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
                console.log(`- ${model.name} [Generate: ${supportsGenerate}]`);
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
