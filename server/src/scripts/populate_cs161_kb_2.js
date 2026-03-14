import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

const kb_content = [
    {
        title: "Primary memory (RAM)",
        first_principles: [
            "Axiom of Volatility: Primary memory stores the 'Active State' of the machine, maintained by continuous electrical refreshing (DRAM).",
            "Random Access: Time complexity O(1) for any memory address, independent of location, enabled by the address decoder mesh.",
            "The Memory Matrix: Rows and columns of capacitors storing individual bits as charge levels."
        ],
        architectural_logic: "graph TD\n  CPU -- Address --> Dec[Address Decoder]\n  Dec -- RowSelect --> Matrix[Capacitor Matrix]\n  Matrix -- DataOut --> Sense[Sense Amplifiers]\n  Sense -- Refresh --> Matrix\n  Sense -- Bus --> CPU",
        forge_snippet: "/* Direct Memory Access simulation in C */\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    // Allocating 1KB in the 'Physical' heap (RAM)\n    void* ram_block = malloc(1024);\n    \n    // The CPU writing a pattern directly to the memory mesh\n    memset(ram_block, 0xAA, 1024);\n    \n    free(ram_block);\n}"
    },
    {
        title: "Secondary storage (HDD, SSD)",
        first_principles: [
            "Persistence Axiom: Secondary storage provides long-term non-volatile data retention using magnetic polarity (HDD) or electron-trapping (SSD).",
            "Latency Disparity: Accessing RAM is ~10-100ns; accessing SSD is ~10-100us; accessing HDD is ~5-10ms. A 100,000x gap.",
            "Wear Leveling: In SSDs, the 'write-once' reality of NAND flash requires complex controller algorithms to rotate block usage."
        ],
        architectural_logic: "graph LR\n  CPU -- SATA/NVMe --> Ctrl[Storage Controller]\n  subgraph HDD\n    Ctrl -- Servo --> Arm[Magnetic Head]\n    Arm -- Flux --> Platter[Rotating Disk]\n  end\n  subgraph SSD\n    Ctrl -- Voltage --> Gate[Floating Gate Cell]\n  end",
        forge_snippet: "/* Conceptual File System I/O - Mapping to Block Storage */\n#include <fcntl.h>\n#include <unistd.h>\n\nvoid commit_to_storage() {\n    int fd = open(\"persistent.dat\", O_WRONLY | O_CREAT | O_SYNC);\n    char data[4] = {0xDE, 0xAD, 0xBE, 0xEF};\n    // O_SYNC forces the OS to wait for the HW drive's physical ACK\n    write(fd, data, 4);\n    close(fd);\n}"
    },
    {
        title: "Memory hierarchy",
        first_principles: [
            "Axiom of Locality: Data close to previously used data is likely to be used next (Spatial/Temporal Locality).",
            "The Trade-off Pyramid: Faster memory is physically smaller and more expensive; slower memory is larger and cheaper.",
            "Cache Coherence: Managing the consistency of data across multiple levels of hierarchy in multi-core systems."
        ],
        architectural_logic: "graph BT\n  Cloud[Cloud Storage (ms)] --> Disk[HDD/SSD (us)]\n  Disk --> RAM[RAM (ns)]\n  RAM --> L3[L3 Cache]\n  L3 --> L2[L2 Cache]\n  L2 --> L1[L1 Cache]\n  L1 --> Reg[CPU Registers (ps)]",
        forge_snippet: "/* Demonstrating Cache Locality (Temporal) */\nvoid cache_friendly_loop(int* arr, int n) {\n    // Accessing elements sequentially maximizes Cache Line hits\n    for(int i=0; i<n; i++) {\n        arr[i] *= 2;\n    }\n}\n\nvoid cache_poor_loop(int* arr, int n) {\n    // Accessing with large strides (1024) forces L1/L2 misses constantly\n    for(int i=0; i<n; i+=1024) {\n        arr[i] *= 2;\n    }\n}"
    },
    {
        title: "Volatile vs non-volatile memory",
        first_principles: [
            "Energy Axiom: Volatile memory requires continuous energy to counter thermodynamic decay; Non-volatile memory uses physical states to trap charge.",
            "Refresh Cycle: Volatility necessitates the DRAM refresh controller, consuming bandwidth and power even when the system is idle.",
            "State Retention: ROM, Flash, and MRAM as high-fidelity non-volatile substrate."
        ],
        architectural_logic: "graph LR\n  P[Power Source] -- Refresh Logic --> V[Volatile: RAM]\n  P -- Read Only --> NV[Non-Volatile: Flash]\n  V -- Power Loss --> Loss[Random State]\n  NV -- Power Loss --> Stable[Captured State]",
        forge_snippet: "/* Conceptual 'Persistence Test' Logic */\nvoid test_volatility() {\n    // Logic assuming RAM will reset on cold boot\n    uint32_t volatile_val = 0xCAFEBABE;\n    // Logic assuming EEPROM/Flash will persist\n    write_non_volatile(0x01, 0xDEADC0DE);\n}"
    },
    {
        title: "Bit, byte, word",
        first_principles: [
            "Axiom of Granularity: The bit is the fundamental Shannon entropy unit; the byte is the historical unit of character encoding.",
            "The Processor Word: The native register size (32-bit vs 64-bit) defining the system's addressing and arithmetic throughput.",
            "Alignment: Forcing data to word boundaries to prevent multi-cycle memory fetches (Bus throughput)."
        ],
        architectural_logic: "graph LR\n  B[1 Bit] -- x8 --> BY[1 Byte]\n  BY -- xWords --> W[Machine Word: 4/8 Bytes]\n  W -- Addressability --> Space[RAM Address Space]\n  style W fill:#6366f1,stroke:#fff",
        forge_snippet: "/* Bit and Word manipulation in C */\ntypedef uint64_t machine_word;\n\nvoid inspect_word() {\n    machine_word w = 0x0123456789ABCDEF;\n    // Isolating a byte via bit-masking\n    uint8_t target_byte = (w >> 8) & 0xFF;\n    // A 'Bit' exists as a single physical line pulse\n    bool single_bit = (w & 0x01);\n}"
    },
    {
        title: "Binary representation",
        first_principles: [
            "Axiom of Duality: Computing exists in a binary world because of the physical stability of 2-state transistors (On/Off).",
            "Signed Integers: The elegance of Two's Complement allowing a single hardware circuit to handle both Add and Sub.",
            "Floating Point: The IEEE-754 standard for mapping real numbers into a fixed-width binary Mantissa and Exponent."
        ],
        architectural_logic: "graph TD\n  Dec[Decimal: 10] --> Conv[Conversion Logic]\n  Conv --> Bin[Binary: 1010]\n  Bin --> GateA[Transistor On]\n  Bin --> GateB[Transistor Off]\n  Bin --> GateC[Transistor On]\n  Bin --> GateD[Transistor Off]",
        forge_snippet: "/* Printing binary bits of a float (Mental Model) */\nvoid print_bits(float f) {\n    unsigned int* bits = (unsigned int*)&f;\n    for(int i=31; i>=0; i--) {\n        printf(\"%d\", (*bits >> i) & 1);\n    }\n}"
    },
    {
        title: "Number systems (binary, decimal, hex)",
        first_principles: [
            "Axiom of Base: Hexadecimal acts as a compressed human-readable proxy for binary (1 hex digit = 4 bits).",
            "Positional Notation: Understanding that digit significance scales exponentially with the base (N^Base).",
            "Logic Visualization: Why '0x' is the standard for memory addresses vs '0b' for bitmasks."
        ],
        architectural_logic: "graph LR\n  Hex[0xF] -- Mapping --> Bin[1111]\n  Bin -- Mapping --> Dec[15]\n  style Hex fill:#facc15,stroke:#000",
        forge_snippet: "/* The same value in three systems */\nint dec = 255;\nint bin = 0b11111111;\nint hex = 0xFF;\n\nvoid compare() {\n    if (dec == bin && bin == hex) {\n        printf(\"All systems represent the same physical energy state.\\n\");\n    }\n}"
    },
    {
        title: "Instruction cycle",
        first_principles: [
            "The Universal Loop: The heartbeat of computing; every program is just a billion repetitions of this cyclic state machine.",
            "Program Counter (PC): The pointer to the system's current 'locus of consciousness' in memory.",
            "Pipeline Interlocks: Managing hazards when an instruction depends on the result of a predecessor still in the cycle."
        ],
        architectural_logic: "graph TD\n  PC[Program Counter] -- Load --> FETCH\n  FETCH -- OpCode --> DECODE\n  DECODE -- Signals --> EXECUTE\n  EXECUTE -- Writeback --> REG[Registers]\n  REG -- Next --> PC",
        forge_snippet: "/* CPU Simulator Emulating the Cycle */\nvoid cpu_step() {\n    uint16_t instruction = memory[PC++]; // FETCH\n    uint8_t opcode = (instruction >> 12); // DECODE\n    if (opcode == ADD) {                  // EXECUTE\n        accumulator += memory[target];\n    }\n}"
    },
    {
        title: "Fetch–Decode–Execute cycle",
        first_principles: [
            "Axiom of Staged Execution: Breaking complex work into discrete temporal stages to maximize transistor utilization (Pipelining).",
            "Wait States: When memory lacks the bandwidth to supply the 'Fetch' stage at the CPU's native clock speed.",
            "Branch Prediction: Speculatively 'Fetching' ahead of a conditional jump to prevent cycle stalls."
        ],
        architectural_logic: "graph LR\n  F[Fetch: L1 Instr Cache] --> D[Decode: Microcode ROM]\n  D --> E[Execute: ALU Pipeline]\n  E --> M[Memory Access]\n  M --> W[Writeback to RegFile]",
        forge_snippet: "/* Assembly: Observing the Cycle in action */\nLOOP_START:\n    INC EAX    ; Fetch, Decode, Execute\n    CMP EAX, 10 ; Fetch, Decode, Execute\n    JNE LOOP_START ; Fetch, Decode, Execute (Branch taken)"
    },
    {
        title: "Machine instructions",
        first_principles: [
            "Axiom of the ISA: The Instruction Set Architecture is the ultimate contract between software designer and hardware engineer.",
            "Reduced vs Complex (RISC vs CISC): Fixed-length, simple instructions (ARM) vs variable-length, powerful instructions (x86).",
            "Operational Atomicity: An instruction is the smallest logical unit of work that the CPU can commit."
        ],
        architectural_logic: "graph TD\n  Instr[Machine Code: 01001000]\n  Instr -- Format --> Op[OpCode: 010] \n  Instr -- Format --> RA[Reg A: 01] \n  Instr -- Format --> RB[Reg B: 00]\n  Op -- Signal --> ALU\n  RA -- Select --> RegA_Bus\n  RB -- Select --> RegB_Bus",
        forge_snippet: "/* Inspecting machine code bytes of a function */\nvoid simple_fn() { int x = 1; }\n\n// x86_64 Machine Code equivalent:\n// 55              - push rbp\n// 48 89 e5        - mov rbp, rsp\n// c7 45 fc 01 00  - mov DWORD PTR [rbp-0x4], 0x1"
    }
];

async function run() {
    try {
        console.log("Updating CS 161 Knowledge Base (Topics 11-20)...");

        for (const entry of kb_content) {
            const res = await pool.query(
                "UPDATE topics SET first_principles = $1, architectural_logic = $2, forge_snippet = $3 WHERE title = $4",
                [JSON.stringify(entry.first_principles), entry.architectural_logic, entry.forge_snippet, entry.title]
            );

            if (res.rowCount > 0) {
                console.log(`[OK] Updated: ${entry.title}`);
            } else {
                console.warn(`[??] Topic not found: ${entry.title}`);
            }
        }

        console.log("Batch 2 Successful.");
    } catch (err) {
        console.error("Knowledge Base update failed:", err);
    } finally {
        await pool.end();
    }
}

run();
