var fxList = ["_parameter_range", "---", "---"];

// Store all FX lists in a single object for better organization and maintenance.
var fxData = {
  oneTwo: [
    "_parameter_range",
    "(OFF)",
    "Direct FX1",
    "Direct FX2",
    "Direct FX3",
    "Direct FX4",
    "Direct FX5",
    "Scatter",
    "Downer",
    "Ha-Dou",
    "Ko-Da-Ma",
    "Zan-Zou",
    "To-Gu-Ro",
    "SBF",
    "Stopper",
    "Tape Echo",
    "TimeCtrlDly",
    "Super Filter",
    "WrmSaturator",
    "303 VinylSim",
    "404 VinylSim",
    "Cassette Sim",
    "Lo-fi",
    "Reverb",
    "Chorus",
    "JUNO Chorus",
    "Flanger",
    "Phaser",
    "Wah",
    "Slicer",
    "Tremolo/Pan",
    "Chromatic PS",
    "Hyper-Reso",
    "Ring Mod",
    "Crusher",
    "Overdrive",
    "Distortion",
    "Equalizer",
    "Compressor",
    "SX Reverb",
    "SX Delay",
    "Cloud Delay",
    "Back Spin",
  ],
  directFxOptions: [
    "_parameter_range",
    "(OFF)",
    "Filter+Drive",
    "Resonator",
    "Sync Delay",
    "Isolator",
    "DJFX Looper",
    "Scatter",
    "Downer",
    "Ha-Dou",
    "Ko-Da-Ma",
    "Zan-Zou",
    "To-Gu-Ro",
    "SBF",
    "Stopper",
    "Tape Echo",
    "TimeCtrlDly",
    "Super Filter",
    "WrmSaturator",
    "303 VinylSim",
    "404 VinylSim",
    "Cassette Sim",
    "Lo-fi",
    "Reverb",
    "Chorus",
    "JUNO Chorus",
    "Flanger",
    "Phaser",
    "Wah",
    "Slicer",
    "Tremolo/Pan",
    "Chromatic PS",
    "Hyper-Reso",
    "Ring Mod",
    "Crusher",
    "Overdrive",
    "Distortion",
    "Equalizer",
    "Compressor",
    "SX Reverb",
    "SX Delay",
    "Cloud Delay",
    "Back Spin",
  ],
  threeFour: [
    "_parameter_range",
    "(OFF)",
    "303 VinylSim",
    "404 VinylSim",
    "Cassette Sim",
    "Lo-fi",
    "Downer",
    "Compressor",
    "Equalizer",
    "Isolator",
    "Super Filter",
    "Filter+Drive",
    "WrmSaturator",
    "Overdrive",
    "Distortion",
    "Crusher",
    "Ring Mod",
    "SBF",
    "Resonator",
    "Hyper-Reso",
    "Chromatic PS",
    "Reverb",
    "Ha-Dou",
    "Zan-Zou",
    "Sync Delay",
    "TimeCtrlDly",
    "Ko-Da-Ma",
    "Tape Echo",
    "Chorus",
    "JUNO Chorus",
    "Flanger",
    "Phaser",
    "Wah",
    "Slicer",
    "Tremolo/Pan",
    "To-Gu-Ro",
    "DJFX Looper",
    "Scatter",
    "SX Reverb",
    "SX Delay",
    "Cloud Delay",
  ],
  input: [
    "_parameter_range",
    "(OFF)",
    "Auto Pitch",
    "Vocoder",
    "Harmony",
    "GT Amp Sim",
    "Chorus",
    "JUNO Chorus",
    "Reverb",
    "TimeCtrlDly",
    "Chromatic PS",
    "Downer",
    "WrmSaturator",
    "303 VinylSim",
    "404 VinylSim",
    "Cassette Sim",
    "Lo-fi",
    "Equalizer",
    "Compressor",
  ],
};

/**
 * Sends the current fxList to the outlet.
 */
function bang() {
  outlet(0, fxList);
}

/**
 * Updates the global fxList with a new list of effects and calls bang().
 * @param {string} fxKey - The key for the desired FX list in the fxData object.
 */
function updateFxList(fxKey) {
  if (fxData[fxKey]) {
    // Create a copy to avoid modifying the original data.
    fxList = fxData[fxKey].slice(0);
    bang();
  }
}

/**
 * Selects the appropriate FX list based on the FX unit index.
 * @param {number} index - The index of the FX unit (0-3 for FX1-4, 4+ for Input FX).
 */
function selectFx(index) {
  if (index === 0 || index === 1) {
    updateFxList("oneTwo");
  } else if (index === 2 || index === 3) {
    updateFxList("threeFour");
  } else {
    updateFxList("input");
  }
}

/**
 * Selects the FX list for the "Direct FX" options.
 * This function is likely called directly from the Max patch.
 */
function selectDirectFxOptions() {
  updateFxList("directFxOptions");
}
