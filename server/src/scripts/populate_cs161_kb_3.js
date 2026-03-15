import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import pool from "../config/db.js";

const kb_content = [
    {
        title: "Assembly vs high-level languages",
        first_principles: [
            "Axiom of Transparency: Assembly provides a 1-to-1 mapping to hardware reality, while high-level languages provide 1-to-N abstractions to human logic.",
            "The Cost of Abstraction: High-level languages prioritize developer productivity at the expense of deterministic execution and memory layout Control.",
            "Indirection: Understanding that every high-level construct (objects, arrays) eventually deconstructs into raw memory offsets and address calculation in Assembly."
        ],
        architectural_logic: "graph LR\n  HLL[High-Level: Python/JS] -- Compiler/VM --> IR[Intermediate Rep]\n  IR -- Back-end --> ASM[Assembly: mov, add]\n  ASM -- Assembler --> MC[Machine Code: 0101]\n  style ASM fill:#f59e0b,stroke:#000",
        forge_snippet: "/* Comparing C and its x86_64 Assembly output */\n// C Source\nint sum(int a, int b) { return a + b; }\n\n/* x86_64 Assembly (Mental Model)\nsum:\n    push rbp\n    mov rbp, rsp\n    add edi, esi   ; Physical ALU operation on registers\n    mov eax, edi   ; Return value convention\n    pop rbp\n    ret\n*/"
    },
    {
        title: "Operating System role",
        first_principles: [
            "Axiom of Stewardship: The OS is the 'Government' of the computer; its role is not to perform tasks, but to manage the resources that do.",
            "Resource Arbitration: Resolving conflicts between competing processes for finite CPU, RAM, and I/O bandwidth.",
            "The Illusion of Ownership: Providing each process with the virtual environment that suggests it is the sole owner of the hardware."
        ],
        architectural_logic: "graph TD\n  U[User] --> App[Applications]\n  App -- Request --> OS((OPERATING SYSTEM))\n  OS -- Manage --> CPU\n  OS -- Manage --> RAM\n  OS -- Manage --> IO\n  style OS fill:#6366f1,stroke:#fff",
        forge_snippet: "/* Interfacing with the OS Role (POSIX) */\n#include <sys/resource.h>\n\nvoid get_limits() {\n    struct rlimit lim;\n    // Asking the OS 'Steward' for our allocated memory limits\n    getrlimit(RLIMIT_AS, &lim);\n    printf(\"My Virtual Domain size: %lu\\n\", lim.rlim_cur);\n}"
    },
    {
        title: "Kernel",
        first_principles: [
            "Axiom of Privilege: The kernel is the only code with unrestricted access to physical hardware, running in Ring 0.",
            "Indestructibility: The kernel must be bug-free as its failure is 'Kernel Panic'—the death of the entire system state.",
            "The Monolithic vs Microkernel: Balancing the performance of a single address space vs the security of isolated services."
        ],
        architectural_logic: "graph TD\n  Ring3[User Space: Apps] -- Gate --> SVC[System Call Interface]\n  subgraph Kernel Space (Ring 0)\n    SVC --> Scheduler\n    SVC --> VM[Virtual Memory]\n    SVC --> FS[File Systems]\n    Scheduler --> Driver[Device Drivers]\n  end\n  Driver --> HW[Physical Hardware]",
        forge_snippet: "// Simplified Kernel-level Entry point (Conceptual)\nvoid kernel_entry() {\n    initialize_gdt();      // Memory protection\n    initialize_paging();   // Virtual addressing\n    initialize_interrupts(); // Hardware alerts\n    spawn_init_process();   // Moving to User Space\n}"
    },
    {
        title: "System calls",
        first_principles: [
            "The Controlled Gateway: System calls transition the machine state from unprivileged (User) to privileged (Kernel) mode.",
            "Software Interrupts: Triggering a physical CPU exception (e.g., 'INT 80h' or 'SYSCALL') to switch privilege contexts.",
            "Standardization: APIs like POSIX ensure software logic remains independent of specific kernel implementations."
        ],
        architectural_logic: "graph LR\n  App[App: write] -- Push Params --> Stack\n  Stack -- Execute --> Trap[SYSCALL Instruction]\n  Trap -- Switch --> K[Kernel ISR]\n  K -- Result --> RegA[EAX Register]\n  RegA -- Resume --> App",
        forge_snippet: "/* Triggering a syscall manually in Assembly (x86_64 Linux) */\nmov rax, 60     ; syscall number 60 (exit)\nmov rdi, 0      ; return code 0\nsyscall         ; Execute transition to Kernel"
    },
    {
        title: "Process concept",
        first_principles: [
            "Axiom of Isolation: A process is a program in execution, encapsulated within its own virtual address space to prevent memory leakage.",
            "Temporal Context: A process is defined by its architectural state (Registers, PC, Stack) at a specific moment in the clock cycle.",
            "Lifecycle: The journey from static binary on disk to dynamic entity in RAM."
        ],
        architectural_logic: "graph TD\n  Prog[Static Code on Disk] -- Loader --> Proc[Dynamic Process in RAM]\n  subgraph Process Address Space\n    Proc --> Text[Code Section]\n    Proc --> Data[Globals]\n    Proc --> Heap[MALLOC]\n    Proc --> Stack[Function Calls]\n  end",
        forge_snippet: "/* Creating a new process in Unix */\n#include <unistd.h>\n\nint main() {\n    pid_t pid = fork(); // One process becomes two\n    if (pid == 0) {\n        // I am the child, with my own isolated address space\n    } else {\n        // I am the parent\n    }\n    return 0;\n}"
    },
    {
        title: "Program vs process",
        first_principles: [
            "Axiom of Potentiality: A program is passive (data on disk); a process is active (state in execution).",
            "Multiplicity: A single program on disk can spawn a thousand independent processes, each with unique memory and PID.",
            "Resource Ownership: Programs have no resources; processes own RAM, file handles, and CPU time slices."
        ],
        architectural_logic: "graph LR\n  Prog[Program: bin/bash] -- Execution --> P1[Process 101]\n  Prog -- Execution --> P2[Process 102]\n  Prog -- Execution --> P3[Process 103]\n  style Prog fill:#94a3b8\n  style P1 fill:#10b981\n  style P2 fill:#10b981",
        forge_snippet: "/* Checking process identity */\nvoid identify() {\n    printf(\"I am a process running image 'my_prog'\\n\");\n    printf(\"My unique ID assigned by OS: %d\\n\", getpid());\n}"
    },
    {
        title: "Process states",
        first_principles: [
            "Axiom of Multitasking: Processes spend the majority of their life 'Waiting' or 'Ready', not actually 'Running'.",
            "State Transitions: The Scheduler logic that cycles processes between execution and suspension based on I/O availability.",
            "Blocked State: Understanding that a process waiting for a disk read is physically unable to utilize the CPU."
        ],
        architectural_logic: "graph TD\n  New[NEW] -- Admitted --> Ready[READY]\n  Ready -- Dispatch --> Run[RUNNING]\n  Run -- Interrupt --> Ready\n  Run -- Wait Event --> Block[BLOCKED]\n  Block -- Event Occurs --> Ready\n  Run -- Exit --> Term[TERMINATED]",
        forge_snippet: "/* Putting a process into BLOCKED state */\n#include <stdio.h>\n#include <unistd.h>\n\nvoid sleep_and_block() {\n    printf(\"Moving from Running to Blocked state for 5 seconds...\\n\");\n    sleep(5); // Process is removed from Ready queue by OS\n    printf(\"Waking up and returning to Running state.\\n\");\n}"
    },
    {
        title: "Threads (intro)",
        first_principles: [
            "Axiom of Shared Context: Threads are 'Lightweight Processes' that inhabit the same address space as their parent, enabling O(1) communication overhead.",
            "Thread Safety: The catastrophic reality of Race Conditions when multiple hardware cores write to the same memory address simultaneously.",
            "Turing Units: A thread is the smallest sequence of programmed instructions that can be managed independently by a scheduler."
        ],
        architectural_logic: "graph TD\n  subgraph Process\n    Mem[Shared Memory: Data/Heap]\n    subgraph Thread 1\n       Reg1[Registers/PC/Stack]\n    end\n    subgraph Thread 2\n       Reg2[Registers/PC/Stack]\n    end\n  end",
        forge_snippet: "/* Spawing a thread in C (Pthreads) */\n#include <pthread.h>\n\nvoid* work(void* arg) { /* Independent execution flow */ return NULL; }\n\nint main() {\n    pthread_t t1;\n    pthread_create(&t1, NULL, work, NULL);\n    pthread_join(t1, NULL);\n}"
    },
    {
        title: "Context switching",
        first_principles: [
            "The Cost of Illusion: Multitasking requires the CPU to save and load massive register files (state), consuming cycles that perform no 'useful' work.",
            "Atomic Save: The kernel must preserve the exact electrical state of the ALU and Registers for the process to resume correctly later.",
            "Trashing: When context switches happen so frequently that the CPU spends more time switching than executing."
        ],
        architectural_logic: "graph LR\n  P1[Process 1] -- Alarm --> K[Kernel]\n  K -- Save Regs --> PCB1[Process Control Block 1]\n  K -- Load Regs --> PCB2[Process Control Block 2]\n  K -- Return --> P2[Process 2]\n  style K fill:#ef4444",
        forge_snippet: "// Conceptual Assembly logic during Context Switch\n/*\nsave_context:\n    push rax; push rbx; push rcx ... // Dump all CPU state to RAM\n    mov [current_task_ptr], rsp     // Save Stack Pointer\n\nload_context:\n    mov rsp, [next_task_ptr]       // Switch to new process stack\n    pop rdi; pop rsi ...            // Restore state of next process\n    iretq                           // Return to User Space\n*/"
    },
    {
        title: "CPU scheduling (basic idea)",
        first_principles: [
            "Axiom of Allocation: Determining the 'Optimal' order of execution to maximize throughput and minimize latency.",
            "Fairness vs Priority: Balancing the needs of interactive users (low latency) against batch processing (high throughput).",
            "Preemption: The authority of the OS to forcibly remove a 'greedy' process from the hardware cores."
        ],
        architectural_logic: "graph LR\n  Q[Ready Queue] -- Decision --> S{Scheduler}\n  S -- FCFS --> P1\n  S -- Round Robin --> P2\n  S -- Priority --> P3\n  P1[Process Target]",
        forge_snippet: "/* Simulation of a Simple Round Robin Scheduler */\nvoid schedule() {\n    while(true) {\n        Process* p = queue_pop();\n        run_for_timeslice(p, 10); // 10ms slice\n        if (!p->finished) queue_push(p);\n    }\n}"
    }
];

async function run() {
    try {
        console.log("Updating CS 161 Knowledge Base (Batch 3: Topics 21-30)...");

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

        console.log("Batch 3 Successful.");
    } catch (err) {
        console.error("Knowledge Base update failed:", err);
    } finally {
        await pool.end();
    }
}

run();
