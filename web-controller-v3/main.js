/**
 * SP-404MKII Web Controller - V3
 * Main application logic with Control Re-mapping.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
    let sp404mk2Output = null;
    let currentBusIndex = 0;
    let isDragging = false;
    let knobToMap = null; // To track which knob (1-6) is being mapped
    const PRESETS_STORAGE_KEY = 'sp404mk2_web_presets_v3';

    // Default state includes initial mappings [0,1,2,3,4,5] for each bus
    const getDefaultState = () => ({
        buses: Array(5).fill(null).map(() => ({
            effectIndex: 1,
            knobs: Array(6).fill(63),
            mappings: [0, 1, 2, 3, 4, 5]
        }))
    });
    let sp404State = getDefaultState();

    // --- UI Element References ---
    const knobs = document.querySelectorAll('.knob');
    const busButtons = document.querySelectorAll('.bus-button');
    const mapButtons = document.querySelectorAll('.map-button');
    const effectSelectorContainer = document.getElementById('effect-selector');
    const xyPad = document.getElementById('xy-pad');
    const xyPuck = document.getElementById('xy-puck');
    const xyLabelX = document.getElementById('xy-label-x');
    const xyLabelY = document.getElementById('xy-label-y');
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeModalButtons = document.querySelectorAll('.close-button');
    const instructionsContent = document.getElementById('instructions-content');
    const presetList = document.getElementById('preset-list');
    const presetNameInput = document.getElementById('preset-name');
    const savePresetButton = document.getElementById('save-preset-button');
    const loadPresetButton = document.getElementById('load-preset-button');
    const deletePresetButton = document.getElementById('delete-preset-button');
    const presetDescription = document.getElementById('preset-description');
    const mapModal = document.getElementById('map-modal');
    const mapParamList = document.getElementById('map-param-list');

    // --- MIDI Initialization ---
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
    } else {
        alert("Web MIDI is not supported.");
    }
    function onMIDISuccess(midi) {
        for (let o of midi.outputs.values()) if (o.name.includes("SP-404MKII")) sp404mk2Output = o;
        if (!sp404mk2Output) alert("SP-404MKII not found.");
    }
    function onMIDIFailure(msg) { console.error(`MIDI access failed: ${msg}`); }

    // --- Preset Management ---
    function initializePresets() {
        if (!localStorage.getItem(PRESETS_STORAGE_KEY)) savePresets(defaultPresets);
    }
    function getPresets() { return JSON.parse(localStorage.getItem(PRESETS_STORAGE_KEY)) || {}; }
    function savePresets(p) { localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(p)); }
    function populatePresetList() { const p = getPresets(); presetList.innerHTML = ''; for (const n in p) { const o = document.createElement('option'); o.value = n; o.textContent = n; presetList.appendChild(o); } updatePresetDescription(); }
    function updatePresetDescription() { const p = getPresets(), n = presetList.value; presetDescription.innerHTML = n && p[n] ? `<p>${p[n].description}</p>` : `<p>Select a preset.</p>`; }
    function handleSavePreset() { const n = presetNameInput.value.trim(); if (!n) { alert("Enter a preset name."); return; } const p = getPresets(); p[n] = { description: "User Preset", state: JSON.parse(JSON.stringify(sp404State)) }; savePresets(p); populatePresetList(); presetList.value = n; updatePresetDescription(); presetNameInput.value = ''; }
    function handleLoadPreset() { const n = presetList.value; if (!n) return; const p = getPresets()[n]; if (p && p.state) { sp404State = p.state; p.state.buses.forEach((b, i) => { sendMIDIMessage(i, 83, b.effectIndex); b.knobs.forEach((v, k) => sendMIDIMessage(i, fxParams[fxData[i <= 1 ? 'oneTwo' : i <= 3 ? 'threeFour' : 'input'][b.effectIndex]][b.mappings[k]].cc, v)); }); updateUIForCurrentBus(); } }
    function handleDeletePreset() { const n = presetList.value; if (!n) return; if (confirm(`Delete preset "${n}"?`)) { const p = getPresets(); delete p[n]; savePresets(p); populatePresetList(); } }

    // --- UI Logic & Rendering ---
    function updateUIForCurrentBus() { populateEffectSelector(); const bus = sp404State.buses[currentBusIndex]; const active = effectSelectorContainer.querySelector('.active'); if (active) active.classList.remove('active'); const btn = effectSelectorContainer.querySelector(`[data-effect-index="${bus.effectIndex}"]`); if (btn) btn.classList.add('active'); updateKnobLabels(); updateKnobValues(); }
    function populateEffectSelector() { const busType = (currentBusIndex <= 1) ? 'oneTwo' : (currentBusIndex <= 3) ? 'threeFour' : 'input'; const effects = fxData[busType]; effectSelectorContainer.innerHTML = ''; effects.forEach((name, i) => { if (name === "_parameter_range" || name === "---") return; const btn = document.createElement('button'); btn.className = 'effect-button'; btn.textContent = name; btn.dataset.effectIndex = i; btn.addEventListener('click', handleEffectSelection); effectSelectorContainer.appendChild(btn); }); }
    function updateKnobLabels() { const bus = sp404State.buses[currentBusIndex]; const effectName = fxData[bus.effectIndex <= 1 ? 'oneTwo' : bus.effectIndex <= 3 ? 'threeFour' : 'input'][bus.effectIndex]; const params = fxParams[effectName]; for (let i = 0; i < 6; i++) { const label = document.querySelector(`label[for="knob${i + 1}"]`); const mappedParamIndex = bus.mappings[i]; label.textContent = (params && params[mappedParamIndex] && params[mappedParamIndex].name) ? params[mappedParamIndex].name : '---'; } const xParam = params && params[bus.mappings[0]] ? params[bus.mappings[0]].name : '---'; const yParam = params && params[bus.mappings[1]] ? params[bus.mappings[1]].name : '---'; xyLabelX.textContent = `X: ${xParam}`; xyLabelY.textContent = `Y: ${yParam}`; }
    function updateKnobValues() { const bus = sp404State.buses[currentBusIndex]; knobs.forEach((k, i) => k.value = bus.knobs[bus.mappings[i]]); }
    function openMapModal(knobIdx) { knobToMap = knobIdx; mapParamList.innerHTML = ''; const bus = sp404State.buses[currentBusIndex]; const effectName = fxData[bus.effectIndex <= 1 ? 'oneTwo' : bus.effectIndex <= 3 ? 'threeFour' : 'input'][bus.effectIndex]; const params = fxParams[effectName]; if (!params) return; Object.values(params).forEach((p, i) => { const btn = document.createElement('button'); btn.className = 'effect-button'; btn.textContent = p.name; btn.addEventListener('click', () => handleParamSelection(i)); mapParamList.appendChild(btn); }); mapModal.classList.remove('hidden'); }
    function handleParamSelection(paramIdx) { if (knobToMap === null) return; sp404State.buses[currentBusIndex].mappings[knobToMap - 1] = paramIdx; mapModal.classList.add('hidden'); updateKnobLabels(); }

    // --- Event Handlers ---
    function handleEffectSelection(e) { const i = parseInt(e.target.dataset.effectIndex, 10); sp404State.buses[currentBusIndex].effectIndex = i; sp404State.buses[currentBusIndex].mappings = [0,1,2,3,4,5]; sendMIDIMessage(currentBusIndex, 83, i); updateUIForCurrentBus(); }
    function handleBusSelection(e) { busButtons.forEach(b => b.classList.remove('active')); e.target.classList.add('active'); currentBusIndex = parseInt(e.target.dataset.channel, 10); updateUIForCurrentBus(); }
    knobs.forEach((k, i) => k.addEventListener('input', e => { const val = parseInt(e.target.value, 10); const mappedIdx = sp404State.buses[currentBusIndex].mappings[i]; sp404State.buses[currentBusIndex].knobs[mappedIdx] = val; const cc = fxParams[fxData[sp404State.buses[currentBusIndex].effectIndex <= 1 ? 'oneTwo' : sp404State.buses[currentBusIndex].effectIndex <= 3 ? 'threeFour' : 'input'][sp404State.buses[currentBusIndex].effectIndex]][mappedIdx].cc; sendMIDIMessage(currentBusIndex, cc, val); }));
    function handleDrag(e) { if (!isDragging) return; e.preventDefault(); const rect = xyPad.getBoundingClientRect(); const x = Math.max(0, Math.min(rect.width, (e.clientX || e.touches[0].clientX) - rect.left)); const y = Math.max(0, Math.min(rect.height, (e.clientY || e.touches[0].clientY) - rect.top)); xyPuck.style.left = `${x}px`; xyPuck.style.top = `${y}px`; const xVal = Math.round((x / rect.width) * 127); const yVal = Math.round(127 - (y / rect.height) * 127); const bus = sp404State.buses[currentBusIndex]; const xMap = bus.mappings[0], yMap = bus.mappings[1]; bus.knobs[xMap] = xVal; bus.knobs[yMap] = yVal; updateKnobValues(); const effectName = fxData[bus.effectIndex <= 1 ? 'oneTwo' : bus.effectIndex <= 3 ? 'threeFour' : 'input'][bus.effectIndex]; const xCC = fxParams[effectName][xMap].cc, yCC = fxParams[effectName][yMap].cc; sendMIDIMessage(currentBusIndex, xCC, xVal); sendMIDIMessage(currentBusIndex, yCC, yVal); }

    // Attach Listeners
    const controllerContainer = document.getElementById('controller-container');
    controllerContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('map-button')) {
            openMapModal(parseInt(e.target.dataset.knob, 10));
        }
    });

    busButtons.forEach(b => b.addEventListener('click', handleBusSelection));
    savePresetButton.addEventListener('click', handleSavePreset);
    loadPresetButton.addEventListener('click', handleLoadPreset);
    deletePresetButton.addEventListener('click', handleDeletePreset);
    presetList.addEventListener('change', updatePresetDescription);
    xyPad.addEventListener('mousedown', e => { isDragging = true; handleDrag(e); });
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', () => isDragging = false);
    helpButton.addEventListener('click', () => helpModal.classList.remove('hidden'));
    closeModalButtons.forEach(b => b.addEventListener('click', () => b.closest('.modal-overlay').classList.add('hidden')));
    helpModal.addEventListener('click', e => { if (e.target === helpModal) helpModal.classList.add('hidden'); });
    mapModal.addEventListener('click', e => { if (e.target === mapModal) mapModal.classList.add('hidden'); });

    // --- MIDI Sending & Initial Setup ---
    function sendMIDIMessage(bus, cc, val) { if (sp404mk2Output) sp404mk2Output.send([0xB0 + bus, cc, val]); else console.log(`(Pretend) MIDI: Ch ${bus + 1}, CC#${cc}, Val ${val}`); }
    function init() { initializePresets(); populatePresetList(); updateUIForCurrentBus(); }

    init();
});
