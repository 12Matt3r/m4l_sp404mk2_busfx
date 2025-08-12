document.addEventListener('DOMContentLoaded', () => {
    let sp404mk2Output = null;
    let currentChannel = 0; // 0-3 for BUS 1-4, 4 for INPUT

    // --- MIDI Setup ---
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
    } else {
        console.error("Web MIDI API is not supported in this browser.");
        alert("Web MIDI is not supported in your browser. Please use a modern browser like Chrome or Edge.");
    }

    function onMIDISuccess(midiAccess) {
        console.log("MIDI Access Obtained.");
        for (let output of midiAccess.outputs.values()) {
            if (output.name.includes("SP-404MKII")) {
                sp404mk2Output = output;
                console.log(`Found SP-404MKII Output: ${output.name}`);
                break;
            }
        }
        if (!sp404mk2Output) {
            console.error("SP-404MKII MIDI output not found.");
            alert("Could not find the SP-404MKII. Make sure it's connected and your browser has MIDI permissions.");
        }
    }

    function onMIDIFailure(msg) {
        console.error(`Failed to get MIDI access - ${msg}`);
        alert(`Failed to get MIDI access: ${msg}`);
    }

    // --- UI Elements ---
    const knobs = document.querySelectorAll('.knob');
    const busButtons = document.querySelectorAll('.bus-button');
    const effectSelectorContainer = document.getElementById('effect-selector');

    // --- UI Logic ---
    function populateEffectSelector() {
        let busType = (currentChannel <= 1) ? 'oneTwo' : (currentChannel <= 3) ? 'threeFour' : 'input';
        const effects = fxData[busType];
        effectSelectorContainer.innerHTML = ''; // Clear existing buttons

        effects.forEach((effectName, index) => {
            if (effectName === "_parameter_range" || effectName === "---") return;

            const button = document.createElement('button');
            button.className = 'effect-button';
            button.textContent = effectName;
            button.dataset.effectIndex = index;

            button.addEventListener('click', () => {
                // Update active state
                const currentActive = effectSelectorContainer.querySelector('.active');
                if (currentActive) currentActive.classList.remove('active');
                button.classList.add('active');

                // Send MIDI and update labels
                const effectIndex = parseInt(button.dataset.effectIndex, 10);
                sendMIDIMessage(83, effectIndex); // CC#83 is for EFX Number
                updateKnobLabels();
            });
            effectSelectorContainer.appendChild(button);
        });

        // Set first effect as active by default
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
                if (params && params[i] && params[i].name) {
                    knobLabel.textContent = params[i].name;
                } else {
                    knobLabel.textContent = '---';
                }
            }
        }
    }

    // --- Event Listeners ---
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
            console.log(`Selected BUS Channel: ${currentChannel + 1}`);
            populateEffectSelector();
        });
    });

    // --- MIDI Sending Function ---
    function sendMIDIMessage(ccNumber, value) {
        if (sp404mk2Output) {
            const statusByte = 0xB0 + currentChannel;
            const message = [statusByte, ccNumber, value];
            sp404mk2Output.send(message);
            console.log(`Sent MIDI CC: Channel ${currentChannel + 1}, CC#${ccNumber}, Value ${value}`);
        } else {
            console.log(`(Pretending to send) MIDI CC: Channel ${currentChannel + 1}, CC#${ccNumber}, Value ${value}`);
        }
    }

    // --- Initial Setup ---
    populateEffectSelector();
});
