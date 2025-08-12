// main.js - SP-404MKII Web Controller Logic

let sp404mk2Output = null;

// 1. Request MIDI Access
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({ sysex: false })
        .then(onMIDISuccess, onMIDIFailure);
} else {
    console.error("Web MIDI API is not supported in this browser.");
    alert("Web MIDI is not supported in your browser. Please use a modern browser like Chrome or Edge.");
}

// 2. MIDI Access Success Callback
function onMIDISuccess(midiAccess) {
    console.log("MIDI Access Obtained.");

    // Find the SP-404MKII output port
    for (let output of midiAccess.outputs.values()) {
        // In some systems it may appear as "SP-404MKII" or with a prefix.
        // We'll check if the name includes "SP-404MKII".
        if (output.name.includes("SP-404MKII")) {
            sp404mk2Output = output;
            console.log(`Found SP-404MKII Output: ${output.name}`);
            break; // Stop after finding the first match
        }
    }

    if (!sp404mk2Output) {
        console.error("SP-404MKII MIDI output not found.");
        alert("Could not find the SP-404MKII. Make sure it's connected and your browser has MIDI permissions.");
    }
}

// MIDI Access Failure Callback
function onMIDIFailure(msg) {
    console.error(`Failed to get MIDI access - ${msg}`);
    alert(`Failed to get MIDI access: ${msg}`);
}

// 3. Add Event Listener to the Knob
const knob1 = document.getElementById('knob1');

if (knob1) {
    knob1.addEventListener('input', (event) => {
        const value = parseInt(event.target.value, 10);
        sendMIDIMessage(16, value); // Send CC#16 for Filter Cutoff
    });
}

// 4. Function to Send MIDI Message
function sendMIDIMessage(ccNumber, value) {
    if (sp404mk2Output) {
        // MIDI CC message for Channel 1: 0xB0
        // We assume BUS 1 is on Channel 1.
        const message = [0xB0, ccNumber, value];
        sp404mk2Output.send(message);
        console.log(`Sent MIDI CC: Channel 1, CC#${ccNumber}, Value ${value}`);
    } else {
        // This is for testing without a device connected.
        console.log(`(Pretending to send) MIDI CC: Channel 1, CC#${ccNumber}, Value ${value}`);
    }
}
