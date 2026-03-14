import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

const kb_content = [
    {
        title: "What a computer system is (hardware + software)",
        first_principles: [
            "Axiom of Computational Ontogeny: A system emerges not from the mere aggregation of components, but from the recursive interaction between physical constraints and formal syntax. Hardware is the crystallized logic of previous abstractions; software is the fluid geometry of current intent.",
            "Functional Abstraction: The computer is an information transformer, mapping physical energy (voltage) to symbolic representation (data).",
            "Hardware Substrate: The physical components (gates, buses, capacitors) that execute electrical transitions.",
            "Software Intent: The sequence of logical instructions that choreograph hardware transitions to achieve a specific outcome."
        ],
        architectural_logic: "graph TD\n  User[User Intent] -- Logic --> SW[Software Layer]\n  SW -- Instructions --> HW[Hardware Layer]\n  HW -- Physics --> Output[Result]\n  subgraph Software\n    OS[Operating System] -- Drivers --> FW[Firmware]\n  end\n  subgraph Hardware\n    FW -- Signals --> CPU[CPU/Memory]\n  end",
        forge_snippet: "/* Conceptual C representation of Hardware-Software Boundary */\n#define HW_PIXEL_BUFFER 0xFF00\n\nvoid draw_logic(int color) {\n    // Software Intent\n    unsigned char* hardware_ptr = (unsigned char*)HW_PIXEL_BUFFER;\n    \n    // The physical act of moving electrical states in RAM\n    *hardware_ptr = color;\n}"
    },
    {
        title: "Computer system layers",
        first_principles: [
            "Axiom of Encapsulation: Each layer hides complexity from the layer above, providing a stable interface for higher-level abstraction.",
            "Vertical Complexity: Mastery requires understanding not just a layer, but the leakage and friction between layers (e.g., Cache misses at the HW level affecting SW performance).",
            "The Stack: User -> Application -> Library -> OS -> Kernel -> Drivers -> Firmware -> ISA -> Digital Logic -> Physics."
        ],
        architectural_logic: "graph BT\n  P[Physics] --> L[Digital Logic]\n  L --> ISA[Instruction Set Architecture]\n  ISA --> K[Kernel]\n  K --> Sys[System Calls]\n  Sys --> App[Application Layer]\n  App --> UI[User Interface]",
        forge_snippet: "/* Demonstrating the OS Layer via a System Call */\n#include <unistd.h>\n\nint main() {\n    // Application Layer intent\n    const char* msg =\"Accessing the HW via the Kernel Layer\\n\";\n    \n    // Transferring control to the OS layer via syscall 1 (write in Linux x86_64)\n    write(1, msg, 36);\n    return 0;\n}"
    },
    {
        title: "Hardware vs software",
        first_principles: [
            "Axiom of Mutability: Hardware is the physical manifestation of logic (hard-wired), while software is the dynamic reconfiguration of that logic.",
            "The Turing Equivalence: Any logic that can be implemented in software can be implemented in hardware, and vice-versa (Complexity vs Speed trade-off).",
            "Permanence: Hardware provides the 'laws' of the world; Software is the 'behavior' within those laws."
        ],
        architectural_logic: "graph LR\n  SW[Software: Dynamic/Code] -- Interpreted by --> ISA[ISA: The Bridge]\n  ISA -- Realized by --> HW[Hardware: Static/Voltage]\n  style SW fill:#6366f1,stroke:#fff\n  style HW fill:#ef4444,stroke:#fff",
        forge_snippet: "// Hardware (Verilog) vs Software (C)\n\n// SOFTWARE (Flexible)\nint add(int a, int b) { return a + b; }\n\n// HARDWARE (Static - Verilog implementation of an Adder gate)\n/*\nmodule adder(input [31:0] a, b, output [31:0] sum);\n    assign sum = a + b;\nendmodule\n*/"
    },
    {
        title: "CPU basics",
        first_principles: [
            "The Von Neumann Bottleneck: CPU performance is restricted by the rate at which it can fetch instructions and data from memory.",
            "State Machine Axiom: The CPU is a complex synchronous state machine that transitions between states on clock ticks.",
            "The Core Loop: Every computation on earth reduces to a Fetch-Decode-Execute cycle within this silicon engine."
        ],
        architectural_logic: "graph TD\n  M[Memory] -- Fetch --> CU[Control Unit]\n  CU -- Control Signals --> ALU[Arithmetic Logic Unit]\n  CU -- Addresses --> REG[Registers]\n  ALU -- Result --> REG\n  REG -- Store --> M",
        forge_snippet: "/* x86 Assembly: The CPU's native tongue */\nsection .text\nglobal _start\n\n_start:\n    mov eax, 5      ; Load '5' into Register EAX\n    add eax, 10     ; CPU sends EAX and 10 to ALU, result back to EAX\n    ; EAX now holds 15. The state machine progresses."
    },
    {
        title: "ALU",
        first_principles: [
            "Combinational Logic: The ALU is the 'calculator' of the system, implementing purely mathematical and logical functions without memory.",
            "Binary Arithmetic: Realizing subtraction via Addition and Two's Complement logic.",
            "Flags: The ALU doesn't just produce results; it produces 'Metadata' (Zero-flag, Carry-flag, Overflow) which drives conditional logic."
        ],
        architectural_logic: "graph TD\n  InA[Input A] --> Adder\n  InB[Input B] --> Adder\n  Op[OpCode select] --> Mux\n  Adder --> Mux[Operation Multiplexer]\n  AndGate[AND Gate] --> Mux\n  Mux --> Result\n  Mux --> Flags[Z/C/V/N Flags]",
        forge_snippet: "// ALU Logic in C (Simulation)\nstruct ALU_Result {\n    int result;\n    bool zero_flag;\n    bool carry_flag;\n};\n\nstruct ALU_Result compute_alu(int a, int b, int opcode) {\n    struct ALU_Result r;\n    if (opcode == 0x01) r.result = a + b;\n    if (opcode == 0x02) r.result = a & b;\n    r.zero_flag = (r.result == 0);\n    return r;\n}"
    },
    {
        title: "Control Unit",
        first_principles: [
            "The Orchestrator: The Control Unit provides the synchronization signals that prevent chaos in the CPU data-path.",
            "Instruction Decoding: Converting high-level Op-Codes into low-level gate-enable signals.",
            "Clock Synchronization: Ensuring that data has settled at gate inputs before the next state transition occurs."
        ],
        architectural_logic: "graph TD\n  IR[Instruction Register] --> Dec[Decoder]\n  Step[Step Counter] --> Dec\n  Dec --> Sig[Control Signals: Read/Write/ALU-Op]\n  Sig -- Enables --> Bus[System Bus]",
        forge_snippet: "/* Control Unit Micro-code Logic (Conceptual) */\nvoid tick_cpu() {\n    // 1. Fetch from PC\n    // 2. Decode current instruction\n    if (instruction == LOAD_REG) {\n        signal_bus(READ_MEM);\n        enable_register(REG_A);\n    }\n    // This code IS the physical wiring of the CU.\n}"
    },
    {
        title: "Registers",
        first_principles: [
            "The Zero-Wait State: Registers reside at the top of the memory hierarchy, providing instantaneous access to operands.",
            "Register Pressure: A system's performance is often bounded by the number of architectural registers available to the compiler.",
            "Specialized State: Distinguishing between General Purpose Registers (GPRs) and Control Registers (PC, SP, FLAGS)."
        ],
        architectural_logic: "graph LR\n  CPU[ALU/CU] <--> REG[Register File]\n  REG <--> L1[L1 Cache]\n  L1 <--> DRAM[Main Memory]\n  style REG fill:#f59e0b,stroke:#000",
        forge_snippet: "// Inspecting register manipulation in inline C assembly\nint main() {\n    int value = 42;\n    int result;\n\n    __asm__ (\n        \"movl %1, %%eax;\"  // Move 'value' into EAX register\n        \"addl $10, %%eax;\" // Directly operate in CPU registers\n        \"movl %%eax, %0;\"  // Move EAX back to C variable\n        : \"=r\" (result)\n        : \"r\" (value)\n        : \"%eax\"\n    );\n}"
    },
    {
        title: "System bus",
        first_principles: [
            "The Data Backbone: The bus is the shared communication channel; its width (32-bit vs 64-bit) determines the system's addressing and throughput limits.",
            "Bus Arbitration: Multiple components (CPU, DMA, I/O) cannot speak simultaneously; the bus arbiter manages access to prevent voltage collisions.",
            "Signal Integrity: At high frequencies (GHz), the bus behaves like a transmission line where timing skew becomes a critical failure mode."
        ],
        architectural_logic: "graph LR\n  CPU <--> Bus((SYSTEM BUS))\n  RAM <--> Bus\n  GPU <--> Bus\n  IO[I/O Bridge] <--> Bus\n  subgraph Bus Components\n    Addr[Address Bus]\n    Data[Data Bus]\n    Ctrl[Control Bus]\n  end",
        forge_snippet: "/* Conceptual Bus Handshake */\nvoid write_to_bus(uint64_t addr, uint64_t data) {\n    wait_for_bus_free();\n    set_address_lines(addr);\n    set_data_lines(data);\n    signal_line(WRITE_ENABLE, HIGH);\n    wait_for_ack();\n}"
    },
    {
        title: "Input devices",
        first_principles: [
            "Axiom of Transduction: Input devices convert physical physical phenomena (pressure, light, motion) into digital electrical signals.",
            "Polling vs Interrupts: The CPU must either constantly check the device status (expensive) or the device must alert the CPU (efficient).",
            "Debouncing: Managing the mechanical noise of physical switches through software or hardware filters."
        ],
        architectural_logic: "graph LR\n  Phy[Physical Event] --> Sense[Sensor/Switch]\n  Sense --> ADC[Analog to Digital Converter]\n  ADC --> DB[Data Buffer]\n  DB -- Interrupt --> CPU",
        forge_snippet: "/* Polling an input register (e.g., GPIO) */\n#define INPUT_REG_ADDR 0x40021000\n\nvoid wait_for_button() {\n    volatile uint32_t* input_ptr = (uint32_t*)INPUT_REG_ADDR;\n    // Polling Loop: CPU is trapped here until button is pressed\n    while ( (*input_ptr & 0x01) == 0 ) {\n        // Burn CPU cycles\n    }\n}"
    },
    {
        title: "Output devices",
        first_principles: [
            "Digital to Physical: Mapping logical states back to observable changes in the physical world (photons on a screen, magnetic fields in a motor).",
            "Buffering: Reconciling the speed of the CPU (GHz) with the slow speed of physical output (Hz/kHz).",
            "Pulse Width Modulation (PWM): Controlling analog power using purely digital on/off signals."
        ],
        architectural_logic: "graph LR\n  CPU -- Write --> Buffer[Output Buffer]\n  Buffer --> Controller[Device Controller]\n  Controller --> Actuator[Physical Mechanism]\n  style Actuator fill:#10b981",
        forge_snippet: "/* Controlling a LED via PWM (Conceptual) */\nvoid set_brightness(int level) {\n    // Map 0-100 to Duty Cycle\n    for(;;) {\n        digital_write(PIN_7, HIGH);\n        delay_us(level);\n        digital_write(PIN_7, LOW);\n        delay_us(100 - level);\n    }\n}"
    }
];

async function run() {
    try {
        console.log("Updating CS 161 Knowledge Base (Topics 1-10)...");

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

        console.log("Bulk Update Successful.");
    } catch (err) {
        console.error("Knowledge Base update failed:", err);
    } finally {
        await pool.end();
    }
}

run();
