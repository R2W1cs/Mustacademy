import os
import torch
from TTS.api import TTS

print("Initializing XTTS-v2 for zero-shot voice cloning...")
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cpu")

aria_ref = os.path.abspath(os.path.join("..", "tts-service", "podcasts", "complexity", "BFS", "download (1).wav"))
nova_ref = os.path.abspath(os.path.join("..", "tts-service", "podcasts", "complexity", "DFS", "best one.wav"))

topics = {
    "Sorting": [
        "[Studio Recording - Part 1] Welcome to the neural studio. Today we're exploring the elegant realm of Sorting Algorithms.",
        "[Studio Recording - Part 2] Sorting is fundamental. It transforms chaotic data into an ordered sequence, enabling binary search and optimizing overall architectural latency.",
        "[Studio Recording - Part 3] Exactly. But developers must be careful to choose the right algorithm. Quick Sort performs exceptionally well, unless confronted with adversarial inputs that trigger its O(N squared) worst case.",
        "[Studio Recording - Part 4] That's where hybrid approaches like Tim Sort come in, providing robustness across dynamic real-world datasets."
    ],
    "Knapsack": [
        "[Studio Recording - Part 1] Welcome back. Today we tackle finding optimal constraints with the Knapsack Problem.",
        "[Studio Recording - Part 2] This is a brilliant showcase of dynamic programming, where we must maximize total value without exceeding a strict weight boundary.",
        "[Studio Recording - Part 3] If implemented naively with recursion, the time complexity scales exponentially. However, employing a memoization table reduces it to pseudo-polynomial time.",
        "[Studio Recording - Part 4] It's a perfect architectural metaphor for resource allocation in any modern scalable system."
    ]
}

for topic, lines in topics.items():
    folder = os.path.abspath(os.path.join("..", "tts-service", "podcasts", "complexity", topic))
    os.makedirs(folder, exist_ok=True)
    
    for i, text in enumerate(lines):
        speaker_ref = aria_ref if i % 2 == 0 else nova_ref
        out_path = os.path.join(folder, f"download ({i+1}).wav")
        
        if os.path.exists(out_path):
            print(f"Skipping {topic} {i+1}, already exists.")
            continue
            
        print(f"Cloning voice for {topic} Segment {i+1}...")
        try:
            tts.tts_to_file(text=text.split("] ")[1], speaker_wav=speaker_ref, language="en", file_path=out_path)
            print(f"Success! Saved to {out_path}")
        except Exception as e:
            print(f"Failed extracting voice pattern: {e}")
