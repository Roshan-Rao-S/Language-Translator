document.addEventListener('DOMContentLoaded', function () {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const micButton = document.getElementById('mic-button'); // Microphone button
    let history = [];

    sendButton.addEventListener('click', () => sendMessage());
    micButton.addEventListener('click', startSpeechToText);

    // Trigger sendMessage on Enter key press
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage(message = null) {
        const inputMessage = message || userInput.value.trim(); // Use voice input or text input
        if (inputMessage) {
            appendMessage(inputMessage, 'user');
            userInput.value = '';

            fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: inputMessage, history: history })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    appendMessage(data.response, 'bot'); // Display bot response
                    history = data.history;
                    speakText(data.response, 'en-US'); // Convert bot response to speech (default to English)
                })
                .catch(error => console.error('Error:', error));
        }
    }

    function appendMessage(message, role) {
        const messageElement = document.createElement('div');
        messageElement.className = role;
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function startSpeechToText() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US'; // Set language as needed
        recognition.interimResults = false;

        recognition.start();

        recognition.onresult = function (event) {
            const speechResult = event.results[0][0].transcript; // Capture the recognized speech
            sendMessage(speechResult); // Send the recognized speech as input
        };

        recognition.onerror = function (event) {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onspeechend = function () {
            recognition.stop(); // Stop recognition after speech ends
        };
    }

    function speakText(text, lang) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        // Set the language for the speech synthesis
        utterance.lang = lang;

        // Select a compatible voice for the specified language
        const voices = synth.getVoices();
        const voice = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        if (voice) {
            utterance.voice = voice;
        } else {
            console.warn(`No voice found for language: ${lang}. Using the default voice.`);
        }

        // Optional: Adjust pitch, rate, and volume for a softer tone
        utterance.pitch = 2.2; // Higher pitch for a softer tone
        utterance.rate = 0.75;  // Slower rate for clarity
        utterance.volume = 0.5; // Reduced volume for a soft tone

        synth.speak(utterance);
    }

    // Ensure the list of voices is loaded
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(voice => `${voice.name} (${voice.lang})`));
    };
});






