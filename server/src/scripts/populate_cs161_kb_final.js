import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

const kb_content = [
    {
        title: "Interrupts",
        first_principles: [
            "Axiom of Asynchronicity: Interrupts allow the hardware to divert the CPU's attention from its current thread of execution to handle high-priority external events.",
            "The Interrupt Vector Table (IVT): A hardwired memory array mapping interrupt numbers to the memory addresses of their Service Routines (ISRs).",
            "Masking: The ability of the CPU to temporarily ignore certain priority levels to ensure the atomicity of critical kernel operations."
        ],
        architectural_logic: "graph TD\n  HW[Hardware: Timer/Keyboard] -- Pulse --> Controller[Interrupt Controller]\n  Controller -- Assert --> PIN[CPU Interrupt Pin]\n  PIN -- Save PC/Flags --> STACK[Kernel Stack]\n  PIN -- Jump --> Vector[Vector Table]\n  Vector -- Call --> ISR[Service Routine]\n  ISR -- IRET --> HW",
        forge_snippet: "/* Conceptual C Interrupt Service Routine (Bare Metal) */\nvoid __attribute__ ((interrupt)) timer_isr(void* frame) {\n    // 1. Handle the event (e.g., increment system tick)\n    system_ticks++;\n    // 2. Clear hardware flag (ACK)\n    *TIMER_STATUS_REG = 0;\n    // 3. Hardware performs IRET automatically\n}"
    },
    {
        title: "I/O management",
        first_principles: [
            "Axiom of Mapping: I/O devices exist in the CPU's worldview as either specialized Address Space (Memory-Mapped I/O) or specific CPU instructions (Port-Mapped I/O).",
            "Direct Memory Access (DMA): Relieving the CPU of the mundane 'Data Shoveling' work by allowing hardware to write directly to RAM.",
            "Device Drivers: The translation layer mapping the Kernel's generic 'Write' intent to the device's specific electrical registers."
        ],
        architectural_logic: "graph LR\n  CPU -- Control --> DMA[DMA Controller]\n  DMA -- Read --> Disk[Disk Hardware]\n  Disk -- Data --> RAM[System RAM]\n  DMA -- Signal --> CPU[Done Interrupt]\n  style DMA fill:#f59e0b,stroke:#000",
        forge_snippet: "/* Memory Mapped I/O Example */\n#define UART_DATA_REG 0x10000000\n\nvoid uart_send(char c) {\n    volatile char* uart_ptr = (char*)UART_DATA_REG;\n    // CPU writes to a memory address, but physics sends it to a serial port\n    *uart_ptr = c;\n}"
    },
    {
        title: "Booting process",
        first_principles: [
            "Axiom of Initialization: The journey from a 'Dumb' physical state (Reset Vector) to a 'Sentient' logical state (OS Kernel).",
            "The Boot Chain: A sequence of stages where each loader initializes just enough hardware to load the next, more complex stage.",
            "Power-On Self-Test (POST): Physical validation of the ALU, RAM, and Bus integrity before logical execution begins."
        ],
        architectural_logic: "graph TD\n  Power[Power On] --> Reset[Reset Vector: 0xFFFF0]\n  Reset --> BIOS[Firmware/BIOS EXEC]\n  BIOS --> MBR[Master Boot Record/GPT]\n  MBR --> Loader[Bootmgr/GRUB]\n  Loader --> Kernel[Kernel Entry]\n  Kernel --> User[Process 1: Init/Systemd]",
        forge_snippet: "/* 16-bit Assembly (Real Mode) - First stage boot loader snippet */\n[bits 16]\nmov ah, 0x0e     ; BIOS teletype function\nmov al, 'B'      ; Output 'B' for Booting\nint 0x10         ; Trigger BIOS Video Interrupt\n; Physical hardware initialized. Proceeding to find Disk Sector 0."
    },
    {
        title: "Firmware (BIOS / UEFI)",
        first_principles: [
            "Axiom of the Bridge: Firmware is the permanent software residing in non-volatile ROM that provides the primitive abstraction for the hardware.",
            "BIOS vs UEFI: Transitioning from a 16-bit legacy interrupt model to a modern, modular, 64-bit C-based Pre-OS Environment.",
            "Secure Boot: Using cryptographic signatures in firmware to prevent the execution of malicious kernel code during the boot chain."
        ],
        architectural_logic: "graph LR\n  CPU -- PEI Phase --> NVRAM[Non-Volatile Storage]\n  NVRAM -- DXE Phase --> Drivers[Firmware Drivers]\n  Drivers -- BDS Phase --> Selection[Boot Device Selection]\n  style Drivers fill:#6366f1,stroke:#fff",
        forge_snippet: "// Conceptual UEFI Driver logic (C-style)\nEFI_STATUS efi_main(EFI_HANDLE image, EFI_SYSTEM_TABLE *table) {\n    // UEFI provides a high-level API before the OS even starts\n    table->ConOut->OutputString(table->ConOut, L\"Dr. Aris // UEFI Module Loaded\\r\\n\");\n    return EFI_SUCCESS;\n}"
    },
    {
        title: "Virtual memory (intro)",
        first_principles: [
            "The Great Illusion: Every process believes it has access to a contiguous, private memory space, regardless of physical RAM fragmentation.",
            "Paging: The physical partitioning of memory into fixed blocks, mapped dynamically via the Memory Management Unit (MMU).",
            "Demand Paging: Exploiting the latency gap by keeping only the active parts of a process in RAM, 'swapping' the rest to disk."
        ],
        architectural_logic: "graph TD\n  VA[Virtual Address] -- Page Table --> MMU[Hardware MMU]\n  MMU -- Physical Map --> PR[Physical RAM]\n  MMU -- Page Fault --> SWAP[Secondary Storage]\n  subgraph Translation\n    PT[Page Table Entry]\n    PT --> PresentBit\n    PT --> DirtyBit\n  end",
        forge_snippet: "/* Inspecting memory mapping in Linux */\n// cat /proc/self/maps \n// Output shows the virtual 'Logical' addresses mapped by the kernel MMU\n// 555555554000-555555558000 r-xp 00000000 08:02 12345 (executable code)"
    },
    {
        title: "Stack vs heap (intro)",
        first_principles: [
            "Axiom of Lifecycle: The Stack manages 'Automatic' memory (Function frames); the Heap manages 'Manual' memory (Dynamic allocation).",
            "The Determinism Gap: Stack access is O(1) and cache-hot; Heap access is O(N) due to allocator searching and fragmented address layout.",
            "The Growth Collision: In a classic address space, the Stack grows 'Down' while the Heap grows 'Up'; if they meet, the process panics."
        ],
        architectural_logic: "graph BT\n  Static[Global Data] --> Heap[HEAP: Dynamic Growth UP]\n  Heap --> Empty[Free Space Gap]\n  Empty --> Stack[STACK: Local Frames Growth DOWN]\n  Stack --> Env[Environment Variables]",
        forge_snippet: "/* Memory Geography in C */\nvoid function() {\n    int stack_var = 10;           // STACK: Allocated instantly on SP decrement\n    int* heap_ptr = malloc(4);    // HEAP: Involves kernel-level allocator search\n    *heap_ptr = 20;\n    free(heap_ptr);               // HEAP: Must manually return to avoid leak\n}"
    },
    {
        title: "Performance basics (CPU, memory, I/O)",
        first_principles: [
            "Axiom of the Critical Path: Overall system performance is dictated by the slowest component in the data-path (Amdahl's Law).",
            "Throughput vs Latency: The volume of tasks completed per unit time vs the time taken to complete a single task.",
            "I/O Bound vs CPU Bound: Identifying if a system is restricted by the math speed (ALU) or the data arrival speed (SSD/Bus)."
        ],
        architectural_logic: "graph LR\n  CPU[Compute] -- Performance Bound --> Bus[Bus Bandwidth]\n  Bus -- Performance Bound --> RAM[Memory Latency]\n  RAM -- Performance Bound --> IO[Disk/Network]\n  style CPU fill:#ef4444",
        forge_snippet: "/* Performance Profiling Logic */\nlong start = get_nanoseconds();\nperform_crunch_work();\nlong end = get_nanoseconds();\nprintf(\"Physical Time Cost: %ld ns\\n\", end - start);"
    },
    {
        title: "Computer architecture vs computer organization",
        first_principles: [
            "Architecture: The 'What' - The logical attributes of a system visible to a programmer (Set of instructions, registers, data types).",
            "Organization: The 'How' - The operational units and their interconnections that realize the architectural specifications.",
            "Implementation Independence: Two identical architectures (e.g., x86) can have radically different organizations (e.g., Intel vs AMD circuitry)."
        ],
        architectural_logic: "graph LR\n  Arch[Architecture: Programmer Contract] -- Specifies --> LogicGate[Op-Codes/Addrs]\n  LogicGate -- Realized By --> Org[Organization: Hardware Design]\n  Org -- Build --> Circuitry[Transistors/Buses]",
        forge_snippet: "/* Architecture vs Organization Concept */\n// ARCHITECTURE: Both ARM and x86 have 'ADD' instructions.\n// ORGANIZATION: ARM might use a simple 3-stage pipeline;\n//               x86 might use out-of-order execution with 15 stages.\n// THE RESULT IS LOGICALLY THE SAME."
    }
];

async function run() {
    try {
        console.log("Updating CS 161 Knowledge Base (Batch 4: Final Topics)...");

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

        console.log("Full Population Successful.");
    } catch (err) {
        console.error("Knowledge Base update failed:", err);
    } finally {
        await pool.end();
    }
}

run();
