inlets = 2;

var output = [0, 0, 1];

function bang() {
  outlet(0, output);
}

function filter2Grid(pitch, vel) {
  // Check for note-on messages within the SP-404MKII's pattern trigger range (MIDI notes 36-51)
  if (vel > 0 && pitch >= 36 && pitch <= 51) {
    // Normalize the pitch to a 0-15 range for the 4x4 grid
    var normalized_pitch = pitch - 36;

    output[0] = normalized_pitch % 4;
    output[1] = Math.floor(normalized_pitch / 4);
    bang();
  }
}
