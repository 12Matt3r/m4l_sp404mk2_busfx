/**
 * SP-404MKII Web Controller - V2.1
 * Main application logic with Curated Default Presets.
 */
document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // GLOBAL STATE & CONSTANTS
    // =================================================================
    let sp404mk2Output = null;
    let currentBusIndex = 0;
    let isDragging = false;
    const PRESETS_STORAGE_KEY = 'sp404mk2_web_presets_v2.1'; // New key for new format

    let sp404State = {
        buses: [
            { effectIndex: 1, knobs: [63, 63, 63, 63, 63, 63] },
            { effectIndex: 1, knobs: [63, 63, 63, 63, 63, 63] },
            { effectIndex: 1, knobs: [63, 63, 63, 63, 63, 63] },
            { effectIndex: 1, knobs: [63, 63, 63, 63, 63, 63] },
            { effectIndex: 1, knobs: [63, 63, 63, 63, 63, 63] },
        ]
    };

    // =================================================================
    // UI ELEMENT REFERENCES
    // =================================================================
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
    const presetList = document.getElementById('preset-list');
    const presetNameInput = document.getElementById('preset-name');
    const savePresetButton = document.getElementById('save-preset-button');
    const loadPresetButton = document.getElementById('load-preset-button');
    const deletePresetButton = document.getElementById('delete-preset-button');
    const presetDescription = document.getElementById('preset-description');

    // =================================================================
    // MIDI INITIALIZATION
    // =================================================================
    // (Omitted for brevity - no changes)
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
    } else {
        alert("Web MIDI is not supported in your browser. Please use a modern browser like Chrome or Edge.");
    }
    function onMIDISuccess(midiAccess) {
        for (let o of midiAccess.outputs.values()) { if (o.name.includes("SP-404MKII")) { sp404mk2Output = o; return; } }
        alert("Could not find the SP-404MKII.");
    }
    function onMIDIFailure(msg) { console.error(`Failed to get MIDI access - ${msg}`); }

    // =================================================================
    // PRESET MANAGEMENT
    // =================================================================

    function initializePresets() {
        const presets = localStorage.getItem(PRESETS_STORAGE_KEY);
        if (!presets) {
            savePresets(defaultPresets);
        }
    }

    function getPresets() {
        return JSON.parse(localStorage.getItem(PRESETS_STORAGE_KEY)) || {};
    }

    function savePresets(presets) {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    }

    function populatePresetList() {
        const presets = getPresets();
        presetList.innerHTML = '';
        for (const name in presets) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            presetList.appendChild(option);
        }
        updatePresetDescription(); // Update description for the initially selected preset
    }

    function updatePresetDescription() {
        const name = presetList.value;
        if (!name) {
            presetDescription.innerHTML = `<p>Select a preset to see its description.</p>`;
            return;
        }
        const presets = getPresets();
        const preset = presets[name];
        if (preset && preset.description) {
            presetDescription.innerHTML = `<p>${preset.description}</p>`;
        } else {
            presetDescription.innerHTML = `<p>No description available.</p>`;
        }
    }

    function handleSavePreset() {
        const name = presetNameInput.value.trim();
        if (!name) { alert("Please enter a name for the preset."); return; }
        const presets = getPresets();
        presets[name] = {
            description: "User-saved preset.",
            state: JSON.parse(JSON.stringify(sp404State))
        };
        savePresets(presets);
        populatePresetList();
        presetList.value = name; // Select the new preset
        updatePresetDescription();
        presetNameInput.value = '';
    }

    function handleLoadPreset() {
        const name = presetList.value;
        if (!name) return;
        const presets = getPresets();
        const preset = presets[name];
        if (preset && preset.state) {
            sp404State = preset.state;
            preset.state.buses.forEach((busState, busIndex) => {
                sendMIDIMessage(busIndex, 83, busState.effectIndex);
                busState.knobs.forEach((knobValue, knobIndex) => {
                    const cc = parseInt(knobs[knobIndex].dataset.cc, 10);
                    sendMIDIMessage(busIndex, cc, knobValue);
                });
            });
            updateUIForCurrentBus();
        }
    }

    function handleDeletePreset() {
        const name = presetList.value;
        if (!name) return;
        if (confirm(`Are you sure you want to delete the preset "${name}"?`)) {
            const presets = getPresets();
            delete presets[name];
            savePresets(presets);
            populatePresetList();
        }
    }

    // =================================================================
    // UI LOGIC & EVENT HANDLERS
    // =================================================================
    // (Omitted for brevity - functions are mostly the same, just call updateUIForCurrentBus)
    function updateUIForCurrentBus() { populateEffectSelector(); const busState = sp404State.buses[currentBusIndex]; const currentActive = effectSelectorContainer.querySelector('.active'); if (currentActive) currentActive.classList.remove('active'); const newActiveButton = effectSelectorContainer.querySelector(`[data-effect-index="${busState.effectIndex}"]`); if (newActiveButton) newActiveButton.classList.add('active'); updateKnobLabels(); updateKnobValues(); }
    function populateEffectSelector() { let busType = (currentBusIndex <= 1) ? 'oneTwo' : (currentBusIndex <= 3) ? 'threeFour' : 'input'; const effects = fxData[busType]; effectSelectorContainer.innerHTML = ''; effects.forEach((effectName, index) => { if (effectName === "_parameter_range" || effectName === "---") return; const button = document.createElement('button'); button.className = 'effect-button'; button.textContent = effectName; button.dataset.effectIndex = index; button.addEventListener('click', handleEffectSelection); effectSelectorContainer.appendChild(button); }); }
    function updateKnobLabels() { const busState = sp404State.buses[currentBusIndex]; const effectName = fxData[(currentBusIndex <= 1) ? 'oneTwo' : (currentBusIndex <= 3) ? 'threeFour' : 'input'][busState.effectIndex]; const params = fxParams[effectName]; for (let i = 0; i < 6; i++) { const knobLabel = document.querySelector(`label[for="knob${i + 1}"]`); knobLabel.textContent = (params && params[i] && params[i].name) ? params[i].name : '---'; } xyLabelX.textContent = `X: ${params && params[0] ? params[0].name : '---'}`; xyLabelY.textContent = `Y: ${params && params[1] ? params[1].name : '---'}`; }
    function updateKnobValues() { const busState = sp404State.buses[currentBusIndex]; knobs.forEach((knob, index) => knob.value = busState.knobs[index]); }
    function handleEffectSelection(e) { const effectIndex = parseInt(e.target.dataset.effectIndex, 10); sp404State.buses[currentBusIndex].effectIndex = effectIndex; sendMIDIMessage(currentBusIndex, 83, effectIndex); updateUIForCurrentBus(); }
    function handleBusSelection(e) { busButtons.forEach(btn => btn.classList.remove('active')); e.target.classList.add('active'); currentBusIndex = parseInt(e.target.dataset.channel, 10); updateUIForCurrentBus(); }
    knobs.forEach((knob, index) => { knob.addEventListener('input', (e) => { const value = parseInt(e.target.value, 10); sp404State.buses[currentBusIndex].knobs[index] = value; sendMIDIMessage(currentBusIndex, parseInt(knob.dataset.cc, 10), value); }); });
    function handleDrag(e) { if (!isDragging) return; e.preventDefault(); const rect = xyPad.getBoundingClientRect(); const x = Math.max(0, Math.min(rect.width, (e.clientX || e.touches[0].clientX) - rect.left)); const y = Math.max(0, Math.min(rect.height, (e.clientY || e.touches[0].clientY) - rect.top)); xyPuck.style.left = `${x}px`; xyPuck.style.top = `${y}px`; const xValue = Math.round((x / rect.width) * 127); const yValue = Math.round(127 - (y / rect.height) * 127); sp404State.buses[currentBusIndex].knobs[0] = xValue; sp404State.buses[currentBusIndex].knobs[1] = yValue; updateKnobValues(); sendMIDIMessage(currentBusIndex, 16, xValue); sendMIDIMessage(currentBusIndex, 17, yValue); }
    busButtons.forEach(button => button.addEventListener('click', handleBusSelection));
    savePresetButton.addEventListener('click', handleSavePreset);
    loadPresetButton.addEventListener('click', handleLoadPreset);
    deletePresetButton.addEventListener('click', handleDeletePreset);
    presetList.addEventListener('change', updatePresetDescription); // Update description on select
    xyPad.addEventListener('mousedown', (e) => { isDragging = true; handleDrag(e); }); document.addEventListener('mousemove', handleDrag); document.addEventListener('mouseup', () => { isDragging = false; });
    helpButton.addEventListener('click', () => helpModal.classList.remove('hidden')); closeModalButton.addEventListener('click', () => helpModal.classList.add('hidden')); helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.classList.add('hidden'); });

    // =================================================================
    // MIDI SENDING & INITIAL SETUP
    // =================================================================

    function sendMIDIMessage(busIndex, ccNumber, value) {
        if (sp404mk2Output) {
            const statusByte = 0xB0 + busIndex;
            sp404mk2Output.send([statusByte, ccNumber, value]);
        } else {
            console.log(`(Pretending to send) MIDI CC: Channel ${busIndex + 1}, CC#${ccNumber}, Value ${value}`);
        }
    }

    function init() {
        initializePresets();
        populatePresetList();
        updateUIForCurrentBus();
        // populateInstructions(); // Content is now static in HTML, no longer needed
    }

    init();
});
