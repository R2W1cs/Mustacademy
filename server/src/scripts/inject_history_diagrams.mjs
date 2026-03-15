import fs from 'fs';

let p2 = 'c:/Users/rayen/cs-roadmap-platform/server/src/scripts/seed_cs321_diagrams.js';
let content2 = fs.readFileSync(p2, 'utf8');

const historyDiagrams = {
    "Use Case": {
        origins: "Introduced by Ivar Jacobson in 1992 based on his work at Ericsson. It was designed to capture functional requirements from the perspective of external actors.",
        purpose: "To provide a high-level, non-technical overview of what a system should DO, completely separated from HOW it does it.",
        application: "Used during the requirements gathering phase to align business stakeholders, clients, and developers on the scope of the software."
    },
    "System Sequence": {
        origins: "Derived from Message Sequence Charts used in telecommunications in the early 1990s, later incorporated into UML to model interactions over time.",
        purpose: "To meticulously trace the chronological flow of messages between objects, exposing potential logic gaps and asynchronous timing issues.",
        application: "Essential for designing APIs, microservices communication, real-time messaging protocols, and complex multi-actor authentication flows."
    },
    "Activity": {
        origins: "An evolution of traditional flowcharts, integrated into UML to handle parallel execution and complex object states.",
        purpose: "To map out complex business processes, algorithmic logic, or parallel workflows that a simple sequence diagram cannot capture.",
        application: "Used extensively by Business Analysts to map current vs. future state processes, and by developers to design multi-threaded algorithms."
    },
    "Domain Class": {
        origins: "Evolved from Entity-Relationship (ER) diagrams in the 1970s. Object-Oriented pioneers like Grady Booch formalized it to model both data (attributes) and behavior (methods) together.",
        purpose: "To serve as the definitive structural blueprint of the system's static architecture, directly translating into code (classes, interfaces, database schemas).",
        application: "The most common and critical UML diagram, used throughout enterprise software engineering to design object models and ORM entities."
    },
    "Package": {
        origins: "Added to UML to address the 'spaghetti code' problem at a massive scale, drawing inspiration from namespace management in languages like Java and C++.",
        purpose: "To group related classes into logical modules, visualizing architectural layers and strictly managing dependencies to prevent coupling.",
        application: "Crucial for large-scale enterprise architectures, monolith-to-microservices migrations, and defining clear boundaries in Domain-Driven Design (DDD)."
    }
};

Object.keys(historyDiagrams).forEach(key => {
    const hist = historyDiagrams[key];
    const injection = `
> **Historical Context**
> 🏛️ **The Origins:** ${hist.origins}
> 🎯 **The Purpose:** ${hist.purpose}
> 🌍 **The Application:** ${hist.application}

`;
    const regex = new RegExp(`(title: ".*${key}.*"[\\s\\S]*?forge: \\\`### .*?\\n)`, 'g');
    content2 = content2.replace(regex, `$1${injection}`);
});

fs.writeFileSync(p2, content2);
console.log('Injected context into Diagrams seeder');
