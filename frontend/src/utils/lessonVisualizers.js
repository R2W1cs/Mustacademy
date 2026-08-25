/**
 * Per-lesson interactive visuals for CS 342, CS 321, and fallbacks.
 * Returns [{ viz, props? }] — always at least one entry.
 */
import { resolveNetworkLabs } from './networkLabs';

const tl = (title, subtitle, steps) => ({
    viz: 'network',
    props: { type: 'timeline', config: { title, subtitle, steps } },
});

const del = (title, subtitle, hops) => ({
    viz: 'network',
    props: { type: 'delivery', config: { title, subtitle, hops } },
});

/** Title-keyed labs (exact or partial match via findLabs) */
const LESSON_VIZ = {
    // ── CS 342 Algorithms & Complexity ──
    'complexity fundamentals': [{ viz: 'complexity' }, tl('Why scale matters', 'From 100 users to 1 million', [
        { actor: 'Small n', text: 'Nested loops feel fine on tiny data' },
        { actor: 'Growth', text: 'Operations multiply as input grows' },
        { actor: 'Asymptotic', text: 'We compare growth rates, not seconds' },
        { actor: 'Decision', text: 'Pick algorithms by how they scale' },
    ])],
    'asymptotic framework': [{ viz: 'complexity' }, tl('Big-O, Omega, Theta', 'Three ways to bound growth', [
        { actor: 'O', text: 'Upper bound — worst case guarantee' },
        { actor: 'Ω', text: 'Lower bound — best you can hope' },
        { actor: 'Θ', text: 'Tight bound — grows at same rate' },
    ])],
    'growth comparison': [{ viz: 'complexity' }, tl('Limit test', 'Compare f(n) and g(n) as n → ∞', [
        { actor: 'Ratio', text: 'Compute lim f(n)/g(n)' },
        { actor: '→ 0', text: 'f grows slower (o)' },
        { actor: '→ c', text: 'Same growth class (Θ)' },
        { actor: '→ ∞', text: 'f outruns g (ω)' },
    ])],
    'forward substitution': [{ viz: 'recurrence' }, tl('Expand the recurrence', 'T(n) = 2T(n/2) + n', [
        { actor: 'Level 0', text: 'Write the recurrence' },
        { actor: 'Level 1', text: 'Substitute T(n/2)' },
        { actor: 'Level 2', text: 'Substitute again — spot pattern' },
        { actor: 'Base', text: 'Stop when n/2^k = 1' },
        { actor: 'Solve', text: 'Closed form → Θ(n log n)' },
    ])],
    'backward substitution': [{ viz: 'recurrence' }, tl('Work up from base case', 'Good when size shrinks by 1', [
        { actor: 'Base', text: 'T(1) is known' },
        { actor: 'Expand', text: 'Express T(n) using smaller values' },
        { actor: 'Pattern', text: 'Sum the levels' },
        { actor: 'Closed form', text: 'Simplify to Θ(...)' },
    ])],
    'algorithmic domains': [{ viz: 'sorting' }, { viz: 'complexity' }],
    'breadth-first': [{ viz: 'graph', props: { algorithm: 'BFS' } }, tl('BFS wave', 'Queue explores layer by layer', [
        { actor: 'Enqueue', text: 'Start node enters queue' },
        { actor: 'Dequeue', text: 'Visit front node' },
        { actor: 'Neighbors', text: 'Add unvisited neighbors' },
        { actor: 'Repeat', text: 'Shortest path in unweighted graphs' },
    ])],
    'depth-first': [{ viz: 'graph', props: { algorithm: 'DFS' } }, tl('DFS dive', 'Stack/recursion goes deep first', [
        { actor: 'Push', text: 'Mark visited, go to neighbor' },
        { actor: 'Deep', text: 'Follow one branch to the end' },
        { actor: 'Backtrack', text: 'Return when stuck' },
        { actor: 'Use', text: 'Cycles, connectivity, topo sort' },
    ])],
    'minimum spanning': [{ viz: 'graph', props: { algorithm: 'BFS' } }, tl('MST idea', 'Connect all nodes, minimize total edge weight', [
        { actor: 'Cut property', text: 'Cheapest crossing edge belongs in MST' },
        { actor: 'Greedy', text: 'Prim grows a tree; Kruskal sorts edges' },
        { actor: 'Apps', text: 'Networks, clustering, infrastructure' },
    ])],
    'dijkstra': [{ viz: 'graph', props: { algorithm: 'BFS' } }, tl('Shortest path', 'Non-negative weights only', [
        { actor: 'Init', text: 'dist[start] = 0, others = ∞' },
        { actor: 'Pick', text: 'Extract min-distance node' },
        { actor: 'Relax', text: 'Update neighbors if shorter found' },
        { actor: 'Done', text: 'All reachable nodes labeled' },
    ])],
    'prim & kruskal': [{ viz: 'graph', props: { algorithm: 'BFS' } }, tl('Two greedy MST algorithms', 'Same goal, different view', [
        { actor: 'Prim', text: 'Grow tree from a start vertex' },
        { actor: 'Kruskal', text: 'Sort edges, add if no cycle' },
        { actor: 'Union-Find', text: 'Kruskal needs cycle detection' },
    ])],
    'dynamic programming': [{ viz: 'knapsack' }, tl('DP pattern', 'Optimal substructure + overlapping subproblems', [
        { actor: 'Recurse', text: 'Break problem into smaller pieces' },
        { actor: 'Memo', text: 'Store results — never recompute' },
        { actor: 'Table', text: 'Bottom-up fills a grid' },
        { actor: 'Win', text: 'Exponential → polynomial' },
    ])],
    'coin change': [{ viz: 'knapsack' }, tl('Minimum coins', 'Greedy fails — DP finds optimum', [
        { actor: 'State', text: 'dp[i] = min coins for amount i' },
        { actor: 'Try', text: 'Each coin updates smaller amounts' },
        { actor: 'Answer', text: 'dp[target] after fill' },
    ])],
    'p vs np': [{ viz: 'complexity' }, tl('Complexity classes', 'Tractable vs hard problems', [
        { actor: 'P', text: 'Solvable in polynomial time' },
        { actor: 'NP', text: 'Solution easy to verify' },
        { actor: 'NP-complete', text: 'Hardest in NP — one breakthrough solves all' },
        { actor: 'Engineering', text: 'Use heuristics when exact is too costly' },
    ])],
    'brute force': [{ viz: 'sorting' }],
    'divide & conquer': [{ viz: 'recurrence' }],
    'quicksort': [{ viz: 'sorting' }, { viz: 'recurrence' }],
    'decidability': [{ viz: 'complexity' }],

    // ── CS 321 Software Engineering ──
    'introduction to software engineering': [tl('Code vs engineering', 'When a program becomes software', [
        { actor: 'Program', text: 'Works for one person, short timeline' },
        { actor: 'Team', text: 'Multiple devs need process' },
        { actor: 'Quality', text: 'Reliability, maintenance, ethics' },
        { actor: 'Engineering', text: 'Repeatable methods + tools' },
    ])],
    'system development life cycles': [{ viz: 'methodology', props: { type: 'waterfall' } }],
    'methodologies': [{ viz: 'methodology', props: { type: 'scrum' } }],
    'evaluating & selecting': [tl('Pick a process', 'Match methodology to project context', [
        { actor: 'Stable reqs', text: 'Waterfall / V-model may fit' },
        { actor: 'Changing reqs', text: 'Scrum / Kanban / XP' },
        { actor: 'Risk', text: 'Spiral emphasizes risk analysis' },
        { actor: 'Hybrid', text: 'Large orgs mix governance + agile teams' },
    ])],
    'feasibility study': [tl('Should we build it?', 'Before full requirements', [
        { actor: 'Technical', text: 'Can we build with current tech?' },
        { actor: 'Economic', text: 'Costs vs benefits' },
        { actor: 'Operational', text: 'Will users adopt it?' },
        { actor: 'Go / no-go', text: 'Decision gates the project' },
    ])],
    'elicitation': [tl('Gather requirements', 'Talk to stakeholders', [
        { actor: 'Interview', text: 'One-on-one depth' },
        { actor: 'Workshop', text: 'Group alignment' },
        { actor: 'Observe', text: 'Watch real workflows' },
        { actor: 'Document', text: 'Turn findings into specs' },
    ])],
    'use cases': [{ viz: 'uml', props: { type: 'usecase' } }],
    'sequence diagrams': [{ viz: 'uml', props: { type: 'sequence' } }],
    'package & class': [{ viz: 'uml', props: { type: 'class' } }],
    'class diagrams': [{ viz: 'uml', props: { type: 'class' } }],
    'srs document': [tl('Requirements spec', 'Contract between team and client', [
        { actor: 'Scope', text: 'What is in / out' },
        { actor: 'Functional', text: 'What the system must do' },
        { actor: 'Non-functional', text: 'Performance, security, usability' },
        { actor: 'Validate', text: 'Reviews + prototypes' },
    ])],
    'architectural design': [tl('Structure the system', 'Components and connections', [
        { actor: 'Styles', text: 'Layered, microservices, event-driven…' },
        { actor: 'Quality', text: 'Trade-offs drive choices' },
        { actor: 'Model', text: 'Diagrams + ADRs document why' },
    ])],
    'trade-offs': [tl('ATAM thinking', 'No perfect architecture', [
        { actor: 'Scenario', text: 'Stress a quality attribute' },
        { actor: 'Options', text: 'Compare alternatives' },
        { actor: 'Trade-off', text: 'Document what you gain vs lose' },
    ])],
    'software construction': [tl('Build with quality', 'From design to code', [
        { actor: 'Standards', text: 'Style guides, reviews' },
        { actor: 'CI', text: 'Automated build + test' },
        { actor: 'Refactor', text: 'Keep design healthy' },
    ])],
    'software testing': [tl('Find defects early', 'Test levels', [
        { actor: 'Unit', text: 'Functions in isolation' },
        { actor: 'Integration', text: 'Modules together' },
        { actor: 'System', text: 'Whole product vs requirements' },
        { actor: 'Acceptance', text: 'User sign-off' },
    ])],
    'project presentation': [tl('Ship the story', 'Deliverables checklist', [
        { actor: 'Demo', text: 'Working software' },
        { actor: 'Docs', text: 'SRS, design, test report' },
        { actor: 'Retrospective', text: 'What to improve next time' },
    ])],
    'waterfall': [{ viz: 'methodology', props: { type: 'waterfall' } }],
    'spiral model': [{ viz: 'methodology', props: { type: 'spiral' } }],
    'scrum': [{ viz: 'methodology', props: { type: 'scrum' } }],
    'kanban': [{ viz: 'methodology', props: { type: 'kanban' } }],
    'extreme programming': [{ viz: 'methodology', props: { type: 'xp' } }],
    'v-model': [{ viz: 'methodology', props: { type: 'waterfall' } }],
    'incremental': [{ viz: 'methodology', props: { type: 'scrum' } }],
};

function matchKey(title) {
    const t = title.toLowerCase();
    for (const key of Object.keys(LESSON_VIZ)) {
        if (t.includes(key)) return key;
    }
    return null;
}

function genericLab(title) {
    return tl(
        title,
        'Walk through this lesson step by step',
        [
            { actor: 'Goal', text: `Understand the core idea of "${title}"` },
            { actor: 'Concept', text: 'Read the lesson, then replay this walkthrough' },
            { actor: 'Practice', text: 'Use the 1-on-1 AI Tutor to quiz yourself' },
            { actor: 'Apply', text: 'Connect this topic to the next lesson' },
        ],
    );
}

/**
 * @param {string} title - topic.title
 * @returns {Array<{ viz: string, props?: object }>}
 */
export function resolveLessonVisualizers(title) {
    const out = [];
    const key = matchKey(title || '');

    if (key) {
        for (const lab of LESSON_VIZ[key]) {
            if (!out.some((x) => JSON.stringify(x) === JSON.stringify(lab))) out.push(lab);
        }
    }

    // Legacy title heuristics (sorting, graph, etc.)
    const t = (title || '').toLowerCase();
    const pushOnce = (viz, props) => {
        if (!out.some((x) => x.viz === viz && JSON.stringify(x.props) === JSON.stringify(props))) {
            out.push({ viz, props });
        }
    };
    if (t.includes('sorting')) pushOnce('sorting');
    if (t.includes('knapsack')) pushOnce('knapsack');
    if (t.includes('recurrence') && !out.some((x) => x.viz === 'recurrence')) pushOnce('recurrence');
    if ((t.includes('graph') || t.includes('bfs') || t.includes('dfs')) && !out.some((x) => x.viz === 'graph')) {
        pushOnce('graph', { algorithm: 'BFS' });
    }
    if ((t.includes('complexity') || t.includes('big o') || t.includes('asymptotic') || t.includes('growth')) && !out.some((x) => x.viz === 'complexity')) {
        pushOnce('complexity');
    }
    if (t.includes('uml') || t.includes('use case') || t.includes('sequence') || t.includes('activity')) {
        pushOnce('uml', {
            type: t.includes('sequence') ? 'sequence' : t.includes('activity') ? 'activity' : t.includes('use case') ? 'usecase' : 'class',
        });
    }
    if (t.includes('sdlc') || t.includes('waterfall') || t.includes('scrum') || t.includes('agile') || t.includes('kanban') || t.includes('spiral') || t.includes(' xp')) {
        const mType = t.includes('spiral') ? 'spiral' : t.includes('scrum') ? 'scrum' : t.includes('kanban') ? 'kanban' : t.includes('xp') ? 'xp' : 'waterfall';
        if (!out.some((x) => x.viz === 'methodology')) pushOnce('methodology', { type: mType });
    }

    // CS 411 network labs (timeline/delivery/etc.)
    for (const net of resolveNetworkLabs(title)) {
        out.push({ viz: 'network', props: { type: net.type, config: net.config } });
    }

    if (out.length === 0) out.push(genericLab(title));

    return out;
}
