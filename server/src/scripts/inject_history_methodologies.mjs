import fs from 'fs';

let p1 = 'c:/Users/rayen/cs-roadmap-platform/server/src/scripts/seed_cs321_methodologies.js';
let content1 = fs.readFileSync(p1, 'utf8');

const historyMethodologies = {
    "Waterfall": {
        origins: "Invented in 1970 by Winston W. Royce (though he originally presented it as flawed!). It was adopted from manufacturing and construction industries where physical constraints dictate linear progression.",
        purpose: "To impose discipline and predictable stages (design, build, test) onto the historically chaotic software development process.",
        application: "Used in highly regulated industries (defense, healthcare, aerospace) where requirements are 100% known upfront and changes are life-threatening or wildly expensive."
    },
    "V-Model": {
        origins: "Emerged in the late 1980s in Germany as a government standard (V-Modell) to address the Waterfall's late-testing flaw.",
        purpose: "To guarantee that every phase of development has a corresponding, pre-planned testing phase to catch defects on paper before they reach code.",
        application: "Commonly applied in safety-critical sectors like medical device manufacturing, automotive (ISO 26262), and aviation software."
    },
    "Incremental": {
        origins: "Developed in the 1970s and 80s as developers realized waiting for a massive 'Big Bang' release was too risky and often resulted in obsolete products.",
        purpose: "To split a massive project into smaller, fully-functional slices, allowing early value delivery and partial return on investment.",
        application: "Used in enterprise software rollouts (e.g., releasing a core HR system first, then adding payroll later) and large-scale web applications."
    },
    "Spiral": {
        origins: "Described in 1986 by Barry Boehm to combine the iterative nature of prototyping with the controlled aspects of Waterfall.",
        purpose: "To explicitly identify, explicitly analyze, and explicitly mitigate highest-priority risks early through continuous prototyping.",
        application: "Utilized in unprecedented, massive-scale systems like aerospace missions, defense infrastructure, and bleeding-edge R&D projects."
    },
    "Agile": {
        origins: "Born in 2001 at the Snowbird resort in Utah, where 17 software rebels wrote the Agile Manifesto to overthrow heavy, documentation-obsessed Waterfall processes.",
        purpose: "To deliver working software rapidly, welcome changing requirements, and empower self-organizing teams through iterative development.",
        application: "The default standard for modern tech startups, SaaS companies, and consumer-facing apps where market demands shift weekly."
    },
    "Kanban": {
        origins: "Created by Taiichi Ohno at Toyota in the 1940s to optimize manufacturing. Adapted to software development by David J. Anderson in the mid-2000s.",
        purpose: "To visualize work, identify bottlenecks, and maximize efficiency by strictly limiting the 'Work-in-Progress' (WIP).",
        application: "Dominant in continuous delivery environments, IT support, DevOps, operations, and teams managing a steady stream of incoming tickets."
    },
    "Extreme": {
        origins: "Created by Kent Beck in the late 1990s while working on the Chrysler Comprehensive Compensation System to push good engineering practices to 'extreme' levels.",
        purpose: "To achieve the highest possible code quality and responsiveness to changing requirements through Pair Programming and Test-Driven Development (TDD).",
        application: "Found in elite software teams building mission-critical business logic or systems requiring extreme agility and near-zero defect rates."
    },
    "Choosing": {
        origins: "Evolved organically over the decades as the industry realized there is no 'Silver Bullet' (per Fred Brooks).",
        purpose: "To prevent projects from failing due to mismatched processes—aligning the framework with the project's risk profile, team size, and regulatory needs.",
        application: "Applied at the genesis of EVERY project by technical architects and project/product managers."
    }
};

content1 = content1.replace(/title: "(.*?)",/g, (match, title) => {
    return match; // Keep this just to map later
});

Object.keys(historyMethodologies).forEach(key => {
    const hist = historyMethodologies[key];
    const injection = `
> **Historical Context**
> 🏛️ **The Origins:** ${hist.origins}
> 🎯 **The Purpose:** ${hist.purpose}
> 🌍 **The Application:** ${hist.application}

`;
    // Find the forge protocol string and inject right after the backtick and heading
    const regex = new RegExp(`(title: ".*${key}.*"[\\s\\S]*?forge: \\\`### .*?\\n)`, 'g');
    content1 = content1.replace(regex, `$1${injection}`);
});

fs.writeFileSync(p1, content1);
console.log('Injected context into Methodologies seeder');
