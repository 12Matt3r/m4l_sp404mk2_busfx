/**
 * SP-404MKII Web Controller
 * Main application logic.
 *
 * This script handles:
 * - MIDI connection to the SP-404MKII.
 * - Dynamic UI creation for BUS and Effect selection.
 * - Event handling for all UI controls (knobs, buttons, X/Y pad).
 * - Sending MIDI CC messages to the hardware.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
    let sp404mk2Output = null;
    let currentChannel = 0; // 0-3 for BUS 1-4, 4 for INPUT
    let isDragging = false; // For X/Y pad state

    // --- UI Element References ---
    const knobs = document.querySelectorAll('.knob');
    const busButtons = document.querySelectorAll('.bus-button');
    const effectSelectorContainer = document.getElementById('effect-selector');
    const xyPad = document.getElementById('xy-pad');
    const xyPuck = document.getElementById('xy-puck');
    const xyLabelX = document.getElementById('xy-label-x');
    const xyLabelY = document.getElementById('xy-label-y');

    // =================================================================
    // MIDI INITIALIZATION
    // =================================================================

    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
    } else {
        console.error("Web MIDI API is not supported in this browser.");
        alert("Web MIDI is not supported in your browser. Please use a modern browser like Chrome or Edge.");
    }

    /**
     * Handles successful MIDI access.
     * @param {MIDIAccess} midiAccess - The MIDI access object.
     */
    function onMIDISuccess(midiAccess) {
        console.log("MIDI Access Obtained.");
        // Find the first output port that looks like an SP-404MKII
        for (let output of midiAccess.outputs.values()) {
            if (output.name.includes("SP-404MKII")) {
                sp404mk2Output = output;
                console.log(`Found SP-404MKII Output: ${output.name}`);
                return; // Exit after finding the port
            }
        }
        console.error("SP-404MKII MIDI output not found.");
        alert("Could not find the SP-404MKII. Make sure it's connected and your browser has MIDI permissions.");
    }

    /**
     * Handles MIDI access failure.
     * @param {string} msg - The error message.
     */
    function onMIDIFailure(msg) {
        console.error(`Failed to get MIDI access - ${msg}`);
        alert(`Failed to get MIDI access: ${msg}`);
    }

    // =================================================================
    // UI LOGIC AND RENDERING
    // =================================================================

    /**
     * Populates the effect selector container with buttons based on the current BUS.
     */
    function populateEffectSelector() {
        // Determine which list of effects to use based on the selected BUS channel
        let busType = (currentChannel <= 1) ? 'oneTwo' : (currentChannel <= 3) ? 'threeFour' : 'input';
        const effects = fxData[busType];
        effectSelectorContainer.innerHTML = ''; // Clear existing buttons

        // Create a button for each effect in the list
        effects.forEach((effectName, index) => {
            if (effectName === "_parameter_range" || effectName === "---") return; // Skip placeholder entries

            const button = document.createElement('button');
            button.className = 'effect-button';
            button.textContent = effectName;
            button.dataset.effectIndex = index;

            // Add a click listener to each new effect button
            button.addEventListener('click', handleEffectSelection);
            effectSelectorContainer.appendChild(button);
        });

        // Activate the first effect by default
        const firstEffectButton = effectSelectorContainer.querySelector('.effect-button');
        if (firstEffectButton) {
            firstEffectButton.classList.add('active');
            updateKnobLabels(); // Update labels to match the default effect
        }
    }

    /**
     * Updates the labels for the 6 knobs and the X/Y pad based on the currently active effect.
     */
    function updateKnobLabels() {
        const activeEffectButton = effectSelectorContainer.querySelector('.effect-button.active');
        if (!activeEffectButton) return;

        const selectedEffectName = activeEffectButton.textContent;
        const params = fxParams[selectedEffectName];

        // Update the 6 main knob labels
        for (let i = 0; i < 6; i++) {
            const knobLabel = document.querySelector(`label[for="knob${i + 1}"]`);
            if (knobLabel) {
                knobLabel.textContent = (params && params[i] && params[i].name) ? params[i].name : '---';
            }
        }

        // Update X/Y Pad labels to show what they control (always CTRL 1 and 2)
        xyLabelX.textContent = `X: ${params && params[0] ? params[0].name : '---'}`;
        xyLabelY.textContent = `Y: ${params && params[1] ? params[1].name : '---'}`;
    }

    // =================================================================
    // EVENT HANDLERS
    // =================================================================

    /**
     * Handles the selection of a new effect from the button list.
     * @param {Event} e - The click event from the effect button.
     */
    function handleEffectSelection(e) {
        const selectedButton = e.target;
        // Update active state for effect buttons
        const currentActive = effectSelectorContainer.querySelector('.active');
        if (currentActive) currentActive.classList.remove('active');
        selectedButton.classList.add('active');

        // Send MIDI message to change the effect and update the UI
        const effectIndex = parseInt(selectedButton.dataset.effectIndex, 10);
        sendMIDIMessage(83, effectIndex); // CC#83 is for EFX Number
        updateKnobLabels();
    }

    // Attach event listeners to the 6 knobs
    knobs.forEach(knob => {
        knob.addEventListener('input', (event) => {
            const value = parseInt(event.target.value, 10);
            const cc = parseInt(knob.dataset.cc, 10);
            sendMIDIMessage(cc, value);
        });
    });

    // Attach event listeners to the BUS selector buttons
    busButtons.forEach(button => {
        button.addEventListener('click', () => {
            busButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentChannel = parseInt(button.dataset.channel, 10);
            populateEffectSelector(); // Repopulate effects when BUS changes
        });
    });

    // --- X/Y Pad Event Handlers ---
    function handleDrag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const rect = xyPad.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, (e.clientX || e.touches[0].clientX) - rect.left));
        const y = Math.max(0, Math.min(rect.height, (e.clientY || e.touches[0].clientY) - rect.top));

        xyPuck.style.left = `${x}px`;
        xyPuck.style.top = `${y}px`;

        const xValue = Math.round((x / rect.width) * 127);
        const yValue = Math.round(127 - (y / rect.height) * 127); // Invert Y-axis for natural feel

        sendMIDIMessage(16, xValue); // X maps to CTRL 1 (CC 16)
        sendMIDIMessage(17, yValue); // Y maps to CTRL 2 (CC 17)
    }

    xyPad.addEventListener('mousedown', (e) => { isDragging = true; handleDrag(e); });
    xyPad.addEventListener('touchstart', (e) => { isDragging = true; handleDrag(e); });
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('mouseup', () => { isDragging = false; });
    document.addEventListener('touchend', () => { isDragging = false; });

    // =================================================================
    // MIDI SENDING
    // =================================================================

    /**
     * Sends a MIDI Control Change message to the SP-404MKII.
     * @param {number} ccNumber - The Control Change number (0-127).
     * @param {number} value - The value for the CC (0-127).
     */
    function sendMIDIMessage(ccNumber, value) {
        if (sp404mk2Output) {
            const statusByte = 0xB0 + currentChannel;
            const message = [statusByte, ccNumber, value];
            sp404mk2Output.send(message);
            // console.log(`Sent MIDI CC: Channel ${currentChannel + 1}, CC#${ccNumber}, Value ${value}`);
        } else {
            // Log to console if device not connected, for testing purposes.
            console.log(`(Pretending to send) MIDI CC: Channel ${currentChannel + 1}, CC#${ccNumber}, Value ${value}`);
        }
    }

    // =================================================================
    // INITIAL SETUP
    // =================================================================

    populateEffectSelector(); // Initial population of the effect buttons
});
