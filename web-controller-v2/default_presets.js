/**
 * Default presets for the SP-404MKII Web Controller.
 * This file contains a set of pre-made effect chains to get users started.
 */

const defaultPresets = {
    "Vinyl Sim Classic": {
        "buses": [
            { "effectIndex": 21, "knobs": [63, 80, 50, 63, 63, 63] }, // BUS 1: 303 VinylSim
            { "effectIndex": 40, "knobs": [80, 63, 90, 100, 63, 63] }, // BUS 2: Compressor
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] }
        ]
    },
    "Lo-fi Dream": {
        "buses": [
            { "effectIndex": 23, "knobs": [50, 70, 80, 63, 75, 63] }, // BUS 1: Cassette Sim
            { "effectIndex": 25, "knobs": [63, 80, 70, 50, 90, 63] }, // BUS 2: Reverb
            { "effectIndex": 30, "knobs": [70, 60, 80, 63, 63, 63] }, // BUS 3: Chorus
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] }
        ]
    },
    "Warped Delay": {
        "buses": [
            { "effectIndex": 18, "knobs": [80, 90, 70, 63, 63, 127] }, // BUS 1: TimeCtrlDly (Sync ON)
            { "effectIndex": 29, "knobs": [90, 80, 63, 100, 80, 127] }, // BUS 2: Phaser (Sync ON)
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] }
        ]
    },
    "Vocal Doubler": {
        "buses": [
            { "effectIndex": 25, "knobs": [63, 70, 60, 40, 80, 30] }, // BUS 1: Reverb
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
            { "effectIndex": 3, "knobs": [70, 63, 90, 127, 63, 63] } // INPUT: Harmony
        ]
    },
    "Slicer Mincer": {
        "buses": [
            { "effectIndex": 31, "knobs": [63, 80, 100, 63, 63, 127] }, // BUS 1: Slicer (Sync ON)
            { "effectIndex": 36, "knobs": [80, 90, 80, 63, 63, 63] }, // BUS 2: Crusher
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
            { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] }
        ]
    }
};
