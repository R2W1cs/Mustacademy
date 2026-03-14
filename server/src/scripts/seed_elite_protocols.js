import pool from "../config/db.js";

const ELITE_PROTOCOLS = [
    {
        title: "Pointers & Memory Safety",
        forge_protocol: "## Battlefield Scenario\nThe firmware is experiencing intermittent heap corruption in the packet processing buffer. Traditional debugging fails to isolate the dangling pointer. You must implement a deterministic tracking layer using a Red-Zone Guard protocol to catch out-of-bounds writes in real-time.\n\n## Maestro Protocol (C/Systems)\n```c\n// Red-Zone Memory Allocation Wrapper\nvoid* forge_alloc(size_t size) {\n    size_t total_size = size + (GUARD_ZONE_SIZE * 2);\n    uint8_t* block = malloc(total_size);\n    \n    // Pattern Injection (Industrial Standard: 0xDEADBEEF)\n    memset(block, 0xDE, GUARD_ZONE_SIZE);\n    memset(block + GUARD_ZONE_SIZE + size, 0xBE, GUARD_ZONE_SIZE);\n    \n    return block + GUARD_ZONE_SIZE;\n}\n\n// Integrity Check (The 'Forge' Sentry)\nvoid forge_verify(void* ptr, size_t size) {\n    uint8_t* block = (uint8_t*)ptr - GUARD_ZONE_SIZE;\n    for(int i=0; i < GUARD_ZONE_SIZE; i++) {\n        if(block[i] != 0xDE) trigger_industrial_fault(\"Corruption Detected!\");\n    }\n}\n```\n\n## Implementation Axioms\n- **Axiom 1**: If it isn't hardware-checked, it isn't safe.\n- **Axiom 2**: Latency is better than silence in a corrupt state."
    },
    {
        title: "Wait-Free Concurrency",
        forge_protocol: "## Battlefield Scenario\nThe high-frequency trading engine is bottlenecked by mutex contention in the order book. Every lock acquisition adds 500ns of jitter. Your objective is to switch from a Mutex-protected Queue to a Wait-Free Single-Producer/Single-Consumer (SPSC) ring buffer using C11 atomics.\n\n## Maestro Protocol (Atomics)\n```cpp\ntemplate<typename T, size_t Size>\nclass WaitFreeForge {\n    std::atomic<size_t> head{0};\n    std::atomic<size_t> tail{0};\n    T buffer[Size];\n\npublic:\n    bool push(const T& val) {\n        size_t t = tail.load(std::memory_order_relaxed);\n        size_t next_t = (t + 1) % Size;\n        if (next_t == head.load(std::memory_order_acquire)) return false;\n        buffer[t] = val;\n        tail.store(next_t, std::memory_order_release);\n        return true;\n    }\n};\n```\n\n## Industrial Metrics\n- **Throughput**: 40M ops/sec\n- **Safety**: Linearizable\n- **Contention**: Zero"
    },
    {
        title: "TCP/IP Congestion Avoidance",
        forge_protocol: "## Battlefield Scenario\nSatellite uplink is dropping 30% of packets during atmospheric interference. The standard Reno algorithm is collapsing the window too aggressively (Multiplicative Decrease). Switch the protocol to a BBR-style (Bottleneck Bandwidth and RTT) estimation to maintain high throughput despite random loss.\n\n## Maestro Protocol (BBR Strategy)\n```javascript\n// Conceptual BBR Estimation Loop\nconst calculatePacingRate = (maxBandwidth, minRTT) => {\n    // BBR doesn't wait for loss; it measures the pipe.\n    // Rate = G * BW_estimated\n    const gain = 2.885; // Initial probe gain\n    return maxBandwidth * gain;\n};\n\n/* \nIndustrial Rule: \nNever confuse congestion with corruption. \nWireless loss != Pipe fullness.\n*/\n```"
    }
];

async function seed() {
    try {
        console.log("🛠️ Seeding Elite Forge Protocols...");
        for (const p of ELITE_PROTOCOLS) {
            // Find topic by title (case insensitive)
            const topicRes = await pool.query("SELECT id FROM topics WHERE title ILIKE $1 LIMIT 1", [`%${p.title.split(' ')[0]}%`]);
            if (topicRes.rows.length > 0) {
                await pool.query(
                    "UPDATE topics SET forge_protocol = $1 WHERE id = $2",
                    [p.forge_protocol, topicRes.rows[0].id]
                );
                console.log(`[OK] Injected protocol for: ${p.title}`);
            } else {
                // If not found, insert a dummy topic for the dashboard demo
                await pool.query(
                    "INSERT INTO topics (title, forge_protocol, course_id, importance_level) VALUES ($1, $2, (SELECT id FROM courses LIMIT 1), 'Critical')",
                    [p.title, p.forge_protocol]
                );
                console.log(`[NEW] Created topic for protocol: ${p.title}`);
            }
        }
        console.log("✅ Elite Protocols Active.");
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        process.exit(0);
    }
}

seed();
