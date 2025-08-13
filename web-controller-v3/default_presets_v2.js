/**
 * Curated default presets for the SP-404MKII Web Controller - V2.1
 * Based on user-provided list of popular and creative effect chains.
 */

const defaultPresets = {
    "Drum Punch": {
        "description": "Use Isolator to boost the low end of a kick or snare, and the compressor to add punch and glue.",
        "state": {
            "buses": [
                { "effectIndex": 57, "knobs": [80, 63, 63, 63, 63, 63] }, // BUS 1: Isolator
                { "effectIndex": 40, "knobs": [80, 63, 90, 100, 63, 63] }, // BUS 2: Compressor
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] }
            ]
        }
    },
    "Melody Atmos": {
        "description": "Classic combo to create atmosphere and movement for melodic samples. Filter to shape, then add space.",
        "state": {
            "buses": [
                { "effectIndex": 59, "knobs": [80, 70, 50, 63, 63, 63] }, // BUS 1: Filter+Drive
                { "effectIndex": 28, "knobs": [75, 80, 70, 63, 63, 127] }, // BUS 2: Sync Delay
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] }
            ]
        }
    },
    "Evolving Texture": {
        "description": "Use Resonator and Delay to create unique, evolving textures and pitched effects.",
        "state": {
            "buses": [
                { "effectIndex": 72, "knobs": [63, 80, 70, 80, 63, 63] }, // BUS 1: Resonator
                { "effectIndex": 28, "knobs": [90, 90, 60, 63, 63, 127] }, // BUS 2: Sync Delay
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] }
            ]
        }
    },
    "Warm Master": {
        "description": "A mastering chain to add warmth, glue, and character. Great for the final mix.",
        "state": {
            "buses": [
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 52, "knobs": [50, 60, 70, 63, 63, 63] }, // BUS 3: Cassette Sim
                { "effectIndex": 55, "knobs": [70, 63, 80, 90, 63, 63] }, // BUS 4: Compressor
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] }
            ]
        }
    },
    "Vinyl Master": {
        "description": "An alternative mastering chain using the classic Vinyl Sim for character. Use the EQ to shape the final tone.",
        "state": {
            "buses": [
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 57, "knobs": [63, 63, 63, 63, 63, 63] }, // BUS 3: Isolator
                { "effectIndex": 51, "knobs": [63, 80, 50, 90, 63, 63] }, // BUS 4: 303 VinylSim
                { "effectIndex": 18, "knobs": [63, 63, 63, 63, 63, 63] }  // INPUT: Equalizer
            ]
        }
    },
    "Live Looper": {
        "description": "A performance setup. Use BUS 1 for on-the-fly looping effects on your melodic samples.",
        "state": {
            "buses": [
                { "effectIndex": 69, "knobs": [127, 100, 127, 63, 63, 63] }, // BUS 1: DJFX Looper
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] }
            ]
        }
    },
    "Lo-fi Crunch": {
        "description": "Use Distortion and the Lo-fi effect to add crunch and character to drums or samples.",
        "state": {
            "buses": [
                { "effectIndex": 38, "knobs": [80, 70, 90, 90, 63, 63] }, // BUS 1: Distortion
                { "effectIndex": 24, "knobs": [63, 63, 63, 80, 90, 100] }, // BUS 2: Lo-fi
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] },
                { "effectIndex": 1, "knobs": [63, 63, 63, 63, 63, 63] }
            ]
        }
    }
};
