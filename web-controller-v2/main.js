/**
 * SP-404MKII Web Controller
 * Main application logic.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
    let sp404mk2Output = null;
    let currentChannel = 0;
    let isDragging = false;

    // --- UI Element References ---
    const knobs = document.querySelectorAll('.knob');
    const busButtons = document.querySelectorAll('.bus-button');
    const effectSelectorContainer = document.getElementById('effect-selector');
    const xyPad = document.getElementById('xy-pad');
    const xyPuck = document.getElementById('xy-puck');
    const xyLabelX = document.getElementById('xy-label-x');
    const xyLabelY = document.getElementById('xy-label-y');
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeModalButton = helpModal.querySelector('.close-button');
    const instructionsContent = document.getElementById('instructions-content');

    // =================================================================
    // MIDI INITIALIZATION
    // =================================================================

    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
    } else {
        alert("Web MIDI is not supported in your browser. Please use a modern browser like Chrome or Edge.");
    }

    function onMIDISuccess(midiAccess) {
        for (let output of midiAccess.outputs.values()) {
            if (output.name.includes("SP-404MKII")) {
                sp404mk2Output = output;
                console.log(`Found SP-404MKII Output: ${output.name}`);
                return;
            }
        }
        alert("Could not find the SP-404MKII. Make sure it's connected and your browser has MIDI permissions.");
    }

    function onMIDIFailure(msg) {
        console.error(`Failed to get MIDI access - ${msg}`);
        alert(`Failed to get MIDI access: ${msg}`);
    }

    // =================================================================
    // UI LOGIC AND RENDERING
    // =================================================================

    function populateEffectSelector() {
        let busType = (currentChannel <= 1) ? 'oneTwo' : (currentChannel <= 3) ? 'threeFour' : 'input';
        const effects = fxData[busType];
        effectSelectorContainer.innerHTML = '';

        effects.forEach((effectName, index) => {
            if (effectName === "_parameter_range" || effectName === "---") return;
            const button = document.createElement('button');
            button.className = 'effect-button';
            button.textContent = effectName;
            button.dataset.effectIndex = index;
            button.addEventListener('click', handleEffectSelection);
            effectSelectorContainer.appendChild(button);
        });

        const firstEffectButton = effectSelectorContainer.querySelector('.effect-button');
        if (firstEffectButton) {
            firstEffectButton.classList.add('active');
            updateKnobLabels();
        }
    }

    function updateKnobLabels() {
        const activeEffectButton = effectSelectorContainer.querySelector('.effect-button.active');
        if (!activeEffectButton) return;

        const selectedEffectName = activeEffectButton.textContent;
        const params = fxParams[selectedEffectName];

        for (let i = 0; i < 6; i++) {
            const knobLabel = document.querySelector(`label[for="knob${i + 1}"]`);
            if (knobLabel) {
                knobLabel.textContent = (params && params[i] && params[i].name) ? params[i].name : '---';
            }
        }
        xyLabelX.textContent = `X: ${params && params[0] ? params[0].name : '---'}`;
        xyLabelY.textContent = `Y: ${params && params[1] ? params[1].name : '---'}`;
    }

    function populateInstructions() {
        instructionsContent.innerHTML = `
            <h3>Connection</h3>
            <ul>
                <li>Connect your SP-404MKII to your computer via USB-C.</li>
                <li>This web page should ask for MIDI permissions when loaded. Please click "Allow".</li>
                <li>If the controller doesn't seem to work, ensure no other music software (like a DAW) is currently using the SP-404MKII as a MIDI device.</li>
            </ul>
            <h3>How to Use</h3>
            <ul>
                <li><b>BUS Selector:</b> Use the top-left buttons (BUS 1-4, INPUT) to choose which effect unit to control.</li>
                <li><b>Effect Selector:</b> Click an effect from the scrolling list to change the active effect on the selected BUS.</li>
                <li><b>Sliders:</b> Use the 6 vertical sliders to control the parameters of the selected effect. The labels above them will update based on the chosen effect.</li>
                <li><b>X/Y Pad:</b> Click and drag inside the square pad to control the first two effect parameters at the same time. The X-axis controls parameter 1, and the Y-axis controls parameter 2.</li>
            </ul>
        `;
    }

    // =================================================================
    // EVENT HANDLERS
    // =================================================================

    function handleEffectSelection(e) {
        const selectedButton = e.target;
        const currentActive = effectSelectorContainer.querySelector('.active');
        if (currentActive) currentActive.classList.remove('active');
        selectedButton.classList.add('active');
        const effectIndex = parseInt(selectedButton.dataset.effectIndex, 10);
        sendMIDIMessage(83, effectIndex);
        updateKnobLabels();
    }

    knobs.forEach(knob => {
        knob.addEventListener('input', (event) => {
            const value = parseInt(event.target.value, 10);
            const cc = parseInt(knob.dataset.cc, 10);
            sendMIDIMessage(cc, value);
        });
    });

    busButtons.forEach(button => {
        button.addEventListener('click', () => {
            busButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentChannel = parseInt(button.dataset.channel, 10);
            populateEffectSelector();
        });
    });

    function handleDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const rect = xyPad.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, (e.clientX || e.touches[0].clientX) - rect.left));
        const y = Math.max(0, Math.min(rect.height, (e.clientY || e.touches[0].clientY) - rect.top));
        xyPuck.style.left = `${x}px`;
        xyPuck.style.top = `${y}px`;
        const xValue = Math.round((x / rect.width) * 127);
        const yValue = Math.round(127 - (y / rect.height) * 127);
        sendMIDIMessage(16, xValue);
        sendMIDIMessage(17, yValue);
    }

    xyPad.addEventListener('mousedown', (e) => { isDragging = true; handleDrag(e); });
    xyPad.addEventListener('touchstart', (e) => { isDragging = true; handleDrag(e); });
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('mouseup', () => { isDragging = false; });
    document.addEventListener('touchend', () => { isDragging = false; });

    helpButton.addEventListener('click', () => helpModal.classList.remove('hidden'));
    closeModalButton.addEventListener('click', () => helpModal.classList.add('hidden'));
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.classList.add('hidden');
        }
    });

    // =================================================================
    // MIDI SENDING
    // =================================================================

    function sendMIDIMessage(ccNumber, value) {
        if (sp404mk2Output) {
            const statusByte = 0xB0 + currentChannel;
            const message = [statusByte, ccNumber, value];
            sp404mk2Output.send(message);
        } else {
            console.log(`(Pretending to send) MIDI CC: Channel ${currentChannel + 1}, CC#${ccNumber}, Value ${value}`);
        }
    }

    // =================================================================
    // INITIAL SETUP
    // =================================================================

    populateEffectSelector();
    populateInstructions();
});
