let canvas, ctx;
let blinkTimer = 0;
let isBlinking = false;

function initCanvas() {
    // canvas = document.createElement('canvas');
    canvas = document.getElementById("myBotCanvas");
    canvas.width = 450;
    canvas.height = 650;
    ctx = canvas.getContext('2d');

    const container = document.querySelector('.game-container');
    container.appendChild(canvas);

    // resizeCanvas();
    // window.addEventListener('resize', resizeCanvas);

    // Start the animation loop
    requestAnimationFrame(animate);
}

function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.width = containerWidth;
    canvas.height = containerHeight;
}

let isSpeaking = false;
let mouthOpenness = 0;
let speakingStartTime = 0;
const SPEAK_DURATION = 60000; // 2 seconds of speaking animation

function drawBot() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.2;

    // Draw hexagonal face frame
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        hexPoints.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        });
    }

    // Create metallic gradient for face
    const faceGradient = ctx.createLinearGradient(
        centerX - radius,
        centerY - radius,
        centerX + radius,
        centerY + radius
    );
    faceGradient.addColorStop(0, '#2c3e50');
    faceGradient.addColorStop(0.5, '#34495e');
    faceGradient.addColorStop(1, '#2c3e50');

    // Draw hexagonal face
    ctx.beginPath();
    ctx.moveTo(hexPoints[0].x, hexPoints[0].y);
    for (let i = 1; i < hexPoints.length; i++) {
        ctx.lineTo(hexPoints[i].x, hexPoints[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = faceGradient;
    ctx.fill();

    // Draw circuit pattern
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 1;
    for (let i = 0; i < hexPoints.length; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(hexPoints[i].x, hexPoints[i].y);
        ctx.stroke();
    }

    // Draw LED eyes
    const eyeRadius = radius * 0.15;
    const eyeOffsetX = radius * 0.3;
    const eyeOffsetY = -radius * 0.1;

    function drawLEDEye(x, y) {
        // LED glow effect
        const eyeGlow = ctx.createRadialGradient(x, y, 0, x, y, eyeRadius);
        eyeGlow.addColorStop(0, '#3498db');
        eyeGlow.addColorStop(0.7, '#2980b9');
        eyeGlow.addColorStop(1, '#2c3e50');

        if (!isBlinking) {
            // Outer ring
            ctx.beginPath();
            ctx.arc(x, y, eyeRadius, 0, Math.PI * 2);
            ctx.strokeStyle = '#95a5a6';
            ctx.lineWidth = 2;
            ctx.stroke();

            // LED
            ctx.beginPath();
            ctx.arc(x, y, eyeRadius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = eyeGlow;
            ctx.fill();

            // Center dot
            ctx.beginPath();
            ctx.arc(x, y, eyeRadius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = '#ecf0f1';
            ctx.fill();
        } else {
            // Blinking animation - LED off state
            ctx.beginPath();
            ctx.arc(x, y, eyeRadius, 0, Math.PI * 2);
            ctx.strokeStyle = '#95a5a6';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#2c3e50';
            ctx.fill();
        }
    }

    drawLEDEye(centerX - eyeOffsetX, centerY + eyeOffsetY);
    drawLEDEye(centerX + eyeOffsetX, centerY + eyeOffsetY);

    // Draw digital mouth
    const mouthWidth = radius * 0.5;
    const mouthHeight = radius * 0.1;
    const mouthY = centerY + radius * 0.3;

    // Create digital display effect
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(centerX - mouthWidth / 2, mouthY - mouthHeight / 2, mouthWidth, mouthHeight);

    if (isSpeaking) {
        // Digital waveform effect
        ctx.beginPath();
        ctx.moveTo(centerX - mouthWidth / 2, mouthY);
        for (let x = 0; x < mouthWidth; x++) {
            const amplitude = Math.sin(Date.now() * 0.01 + x * 0.1) * mouthHeight * 0.4;
            ctx.lineTo(centerX - mouthWidth / 2 + x, mouthY + amplitude);
        }
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.stroke();
    } else {
        // Idle state - straight line
        ctx.beginPath();
        ctx.moveTo(centerX - mouthWidth / 2, mouthY);
        ctx.lineTo(centerX + mouthWidth / 2, mouthY);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Add metallic panel lines
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 1;
    hexPoints.forEach((point, i) => {
        const nextPoint = hexPoints[(i + 1) % hexPoints.length];
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        ctx.stroke();
    });

}

function animate(timestamp) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update blink state
    if (timestamp - blinkTimer > 100) { // Blink every 4 seconds
        isBlinking = true;
        if (timestamp - blinkTimer > 900) { // Blink duration: 200ms
            isBlinking = false;
            blinkTimer = timestamp;
        }
    }

    // Update speaking state
    if (isSpeaking && timestamp - speakingStartTime > SPEAK_DURATION) {
        isSpeaking = false;
    }

    // Draw the bot
    drawBot();

    // Continue animation loop
    requestAnimationFrame(animate);
}

function startSpeaking() {
    isSpeaking = true;
    speakingStartTime = performance.now();
}

function stopSpeaking() {
    isSpeaking = false;
}

// Initialize when the page loads
window.addEventListener('load', () => {
    initCanvas();

    // Add speak button event listener
    const speakButton = document.getElementById('send-button');
    speakButton.addEventListener('click', () => {
        // const textInput = document.getElementById('textInput');
        // if (textInput.value.trim()) {
            startSpeaking();
        // }
    });
});
// window.addEventListener('load', initCanvas);