import { lesson } from "./helper.mjs";

const BC = "CS 411 > Unit 6: Control Plane";

export const topics = [
  lesson({
    title: "Control Plane vs Data Plane — Who Decides, Who Forwards",
    titleMatch: "Control Plane vs Data Plane%",
    importance_level: "Critical",
    breadcrumb_path: BC,
    first_principles: [
      "The data plane forwards packets using tables already installed",
      "The control plane decides what those tables should contain",
      "Routing protocols, SDN controllers, and static config all feed the control plane",
      "Fast hardware lookups belong to the data plane; slow decision-making belongs to the control plane",
      "When the control plane is wrong or slow, the data plane still forwards — often into blackholes or loops"
    ],
    learning_objectives: [
      "Separate control-plane decisions from data-plane forwarding in one clear sentence each",
      "Explain why routers need both planes even on a tiny two-router network",
      "Relate Unit 5 forwarding tables to the algorithms that build them",
      "Name failure symptoms that are control-plane vs data-plane in origin",
      "Preview OSPF, BGP, and SDN as different ways to program the control plane"
    ],
    content_easy_markdown: `# Control Plane vs Data Plane — Who Decides, Who Forwards

## How it started
In Unit 5 you lived inside the **data plane**: a packet arrives, a router matches a destination prefix, and the packet leaves on an output port. That story assumes the forwarding table already exists. Early networks filled those tables by hand. As topologies grew and links failed, humans could not keep up. Engineers invented a second job: **figure out what the tables should say** and keep them correct as the network changes. That job is the **control plane**.

This unit is about that slower, smarter brain — routing algorithms, OSPF inside an AS, BGP between ASes, and SDN controllers that centralize decisions.

## The simple idea
Two planes, two timescales, two questions:

| Plane | Question | Speed | Typical tools |
|-------|----------|-------|---------------|
| **Data plane** | "This packet — which port?" | Wire speed (ns–µs) | FIB, TCAM, ASICs |
| **Control plane** | "What should the FIB say?" | Seconds to minutes | OSPF, BGP, SDN, static routes |

- **Forwarding** = use the map.
- **Routing / control** = draw and update the map.

If you remember only one line from CS 411: *control decides; data forwards*.

## Step-by-step: from link failure to a new path
1. A fiber between routers R2 and R3 cuts.
2. Neighbors detect loss (hello timers, interface down, BFD).
3. **Control plane** protocols flood or advertise the change.
4. Each router recomputes best paths and installs a new FIB.
5. **Data plane** starts sending packets on the alternate next hop.
6. Until step 4 finishes, some packets may loop or blackhole — that is **convergence**.

Hosts barely notice the algorithm; they feel the symptom (timeouts, brief loss). Heroes notice the *plane*.

## Real analogy
A warehouse:
- **Data plane** = workers who grab a box and put it on conveyor belt 7 because the wall chart says so.
- **Control plane** = managers who rewrite the wall chart after an aisle collapses.
Workers keep moving boxes even while managers argue — which is why a wrong chart (stale control) produces confidently wrong deliveries (bad forwarding).

## Worked example
Your laptop sends to \`203.0.113.50\`.
- Home router data plane: match \`0.0.0.0/0\` → ISP next hop. Instant.
- ISP routers: each hop is another data-plane lookup.
- Somewhere upstream, **BGP** (control) decided which ISP path reaches that prefix.
- Inside the ISP, **OSPF** (control) decided which internal next hop leads toward the BGP exit.

Packet Journey shows the hops. This lesson names *who wrote the tables those hops use*.

## Common mistakes
- Using "routing" for every packet lookup (that is forwarding).
- Believing control-plane CPU load always equals packet loss (fast path may be fine while BGP is sad).
- Assuming static routes need no control plane — static config *is* a (manual) control plane.
- Ignoring convergence: "the link is up" ≠ "every FIB is already correct."
- Thinking SDN deletes the data plane — it relocates where control decisions are made.

## Check yourself
1. Which plane answers "where does *this* packet go right now?"
   - Answer: data plane (forwarding).
2. Which plane answers "what should the table look like after a failure?"
   - Answer: control plane (routing / policy).
3. Name one control-plane protocol you will meet next.
   - Answer: OSPF (inside AS), BGP (between ASes), or an SDN southbound API.

## See it
Open the **Routing Path** lab and narrate each next hop as a *data-plane* action. Then ask: who installed that next hop? That question is Unit 6. Revisit **Packet Journey** and label one hop "forwarding" and the path choice "control." Use **OSI & TCP/IP Stack** to place routing protocols above the IP data plane but still in the network layer story.`,
    content_deep_markdown: `# Control vs Data Plane Mechanics (Deep)

## Architectural split
Modern routers separate:
- **Forwarding Information Base (FIB)** — optimized, often hardware, for longest-prefix match.
- **Routing Information Base (RIB)** — software tables collecting candidates from OSPF, BGP, static, connected.
- Selection: administrative distance / preference → best route → install into FIB.

SDN collapses distributed RIBs into a logically centralized controller that programs FIBs via OpenFlow, P4Runtime, or vendor APIs.

## Timescales and consistency
Data plane: line rate. Control plane: hello intervals (often 1–10 s), SPF timers, BGP MRAI, policy evaluation. During convergence you can observe:
- Transient loops (TTL death).
- Blackholes (next hop withdrawn, alternate not yet installed).
- Micro-loops in link-state networks without ordered FIB updates.

## Failure taxonomy
| Symptom | Likely plane |
|---------|----------------|
| Wrong next hop forever | Control / policy bug |
| Correct next hop, drops under load | Data / queue / ACL |
| Flapping routes | Control instability |
| FIB full / TCAM exhaustion | Data-plane resource; often triggered by control scale |

## Numbers worth knowing
- OSPF hello often 10 s (1 s on some LAN/aggressive setups); dead interval typically 4× hello.
- BGP keepalive default 60 s; hold timer 180 s (tunable).
- Convergence targets for enterprise IGPs: sub-second with BFD; classic OSPF often seconds.
- Internet BGP convergence for a prefix can be tens of seconds to minutes depending on path exploration.

## Interview tip
Define both planes in one breath, then give a fiber cut story ending in FIB install. Mention "control can be distributed (OSPF/BGP) or centralized (SDN)."

## Design trade-offs
Distributed control scales trust boundaries and survives controller loss; centralized control simplifies global policy and traffic engineering but needs careful HA and southbound reliability.

## What to practice next
Sketch RIB → FIB. Explain why a packet can still be forwarded with a stale control view. Then open the OSPF and BGP lessons with that vocabulary locked in.
`,
  }),

  lesson({
    title: "Routing Algorithms — Link State and Distance Vector",
    titleMatch: "Routing Algorithms%",
    importance_level: "Critical",
    breadcrumb_path: BC,
    first_principles: [
      "Routing algorithms compute least-cost paths on a graph of routers and link costs",
      "Link-state algorithms give every node a map of the whole topology",
      "Distance-vector algorithms share only distance estimates to neighbors",
      "Cost metrics can be hops, bandwidth-inverse, delay, or administrative weights",
      "Algorithm choice shapes convergence speed, message overhead, and failure behavior"
    ],
    learning_objectives: [
      "State the graph model behind routing (nodes, edges, costs)",
      "Contrast link-state (Dijkstra-style) with distance-vector (Bellman-Ford-style) intuition",
      "Explain flooding of LSAs versus neighbor distance exchanges",
      "Describe count-to-infinity as a distance-vector failure mode",
      "Connect these algorithms to OSPF (LS) and classic RIP (DV)"
    ],
    content_easy_markdown: `# Routing Algorithms — Link State and Distance Vector

## How it started
Once multiple paths existed between networks, operators needed an automatic way to pick a "best" path. The mathematical view is simple: treat routers as **nodes**, links as **edges** with **costs**, and run a shortest-path algorithm. Two families dominated textbooks and industry: **link state** and **distance vector**. Understanding them is how you understand OSPF, RIP history, and why BGP is *not* the same kind of algorithm.

## The simple idea
**Goal of routing:** for every destination, choose a next hop that leads along a least-cost path.

**Link state (LS):**
1. Each router measures cost to neighbors.
2. Floods a "here is my local topology piece" advertisement to everyone.
3. Every router builds the same map and runs shortest path (think Dijkstra).
4. Result: consistent view if flooding succeeds.

**Distance vector (DV):**
1. Each router keeps a vector: estimated cost to each destination.
2. Periodically tells neighbors those estimates.
3. Neighbors update: "if I go through you, cost = your cost + link to you."
4. Result: distributed Bellman-Ford — no full map, only rumors of distance.

## Step-by-step: link-state on a tiny net
Routers A—B—C, costs 1 on each link. Destination C from A:
1. A floods: "A connected to B cost 1."
2. B floods: "B connected to A cost 1 and C cost 1."
3. C floods: "C connected to B cost 1."
4. A builds graph, Dijkstra finds A→B→C cost 2, next hop B.
5. Data plane installs: dest C → out toward B.

## Step-by-step: distance-vector update
Same topology. Initially A only knows itself.
1. B tells A: "I reach C at cost 1."
2. A sets cost(C) = 1 (to B) + 1 = 2, next hop B.
3. Later, if B–C breaks, B may still hear a stale "A reaches C at 2" and bounce the distance upward — **count-to-infinity** risk without mitigations (poison reverse, split horizon, path attributes).

## Real analogy
**Link state** = every city publishes a road map page; everyone assembles the same atlas and draws the best route.
**Distance vector** = you only ask neighboring towns "how far to the coast from your door?" and trust their number. Faster chatter, easier to get fooled by stale rumors.

## Worked example
Costs: A–B=1, B–C=4, A–C=10 (direct).
- LS Dijkstra from A: A–B–C cost 5 beats direct 10 → next hop B.
- DV converges to the same if updates propagate; a temporary A–C=10 then learning B's offer yields the same FIB.

Change B–C to cost 100: LS refloods, everyone recomputes. DV may take multiple iterations as estimates climb.

## Common mistakes
- Memorizing "OSPF = Dijkstra" without knowing *what* is flooded (link state advertisements).
- Thinking DV and LS always pick different paths — with same costs they agree when converged.
- Ignoring metrics: hop count ≠ bandwidth-aware cost.
- Believing BGP is just "Internet Dijkstra" — BGP is path-vector *policy*, covered later.
- Forgetting Routing Path lab is the *result* of an algorithm, not the algorithm itself.

## Check yourself
1. Who has the full topology map — LS or DV?
   - Answer: link state (each node after flooding).
2. What classic problem can DV suffer after a failure?
   - Answer: count-to-infinity / slow bad-news propagation.
3. Name a protocol family for each style.
   - Answer: OSPF/IS-IS ≈ LS; RIP ≈ DV; BGP ≈ path-vector (related but policy-heavy).

## See it
In **Routing Path**, change which links exist mentally and predict next hops as if you ran Dijkstra. Use **Packet Journey** to see packets follow whatever next hop the algorithm installed. **Delay Lab** reminds you: lower cost in the algorithm is not always lower latency unless your metric says so.`,
    content_deep_markdown: `# Link State vs Distance Vector (Deep)

## Graph model
Undirected (or directed) weighted graph G=(V,E). Cost c(u,v) > 0 typically. Shortest path tree from each source; only next hop stored in FIB for scalability.

## Link-state details
- Reliable flooding of LSAs with sequence numbers and aging.
- SPF run on topology database; triggered by LSA changes.
- Complexity roughly O(n log n + m) with binary heap Dijkstra for n nodes, m edges.
- Scale: areas / hierarchy (OSPF) to limit flood domains.

## Distance-vector details
- Asynchronous Bellman-Ford iterations.
- Split horizon, poison reverse, triggered updates mitigate loops but imperfectly.
- Message size grows with destination count; slow recovery from failures historically.

## Metrics and traffic engineering
Administrative weights let operators steer flows without changing physical topology. Inconsistent metrics across domains break "global optimality" — hence BGP's different model.

## Failure modes
- LS: flooding storms, corrupted LSA databases, SPF CPU spikes.
- DV: count-to-infinity, routing loops lasting many periods.
- Both: cost 0 / negative weights (invalid), unequal-cost multipath surprises.

## Interview tip
"Link state floods topology and runs Dijkstra locally; distance vector shares distance estimates with neighbors and risks count-to-infinity. OSPF is LS; RIP is DV."

## Numbers
RIP hop limit 15 (infinity = 16) — hard scale bound. OSPF enterprise domains: hundreds of routers per area typically before design pressure. Hello/dead timers dominate detection delay before SPF even starts.

## Practice
Hand-run Dijkstra on a 5-node graph. Hand-run two DV iterations after a link cut. That muscle memory makes OSPF and BGP lessons land faster.

## Quantitative intuition
Suppose costs equal hop counts and every hello/update interval is T seconds. After a failure, DV may need O(diameter) exchanges in the worst teaching examples before distances stabilize, while LS detection is dominated by dead timers plus one SPF. If T=30 s (old RIP-like), bad news can crawl; if LS dead interval is 40 s untuned, detection alone already dwarfs SPF CPU time on small graphs.

## Design trade-offs
LS spends bandwidth and memory on topology databases for fast, consistent recomputation. DV saves map state but risks temporary loops and slow recovery. Operators who need traffic engineering prefer explicit link weights in LS IGPs; operators who need interdomain policy leave the building and use BGP.

## Operational debugging checklist
1. Is the symptom a wrong permanent next hop (algorithm/policy) or transient during convergence?
2. Capture whether neighbors still advertise the prefix.
3. Compare estimated costs on both ends of a link for asymmetry.
4. Check for filters that turn a routing problem into a silent blackhole.
5. Reproduce on a three-router lab topology before blaming the Internet.

## Exam and interview phrasing
"Routing algorithms compute least-cost paths. Link-state floods topology and runs Dijkstra; distance-vector shares distance estimates and can count to infinity. Real IGPs add timers, hierarchies, and mitigations on top of the textbook core."
`,
  }),

  lesson({
    title: "OSPF — Routing Inside an AS",
    titleMatch: "OSPF%",
    importance_level: "Essential",
    breadcrumb_path: BC,
    first_principles: [
      "OSPF is a link-state IGP used inside a single Autonomous System",
      "Routers flood Link State Advertisements and compute SPF trees",
      "Areas hierarchicalize large OSPF domains to limit flooding",
      "Cost metrics are typically interface bandwidth-derived or admin-set",
      "OSPF converges the internal fabric that BGP and hosts rely on"
    ],
    learning_objectives: [
      "Place OSPF as an Interior Gateway Protocol (IGP) inside an AS",
      "Describe neighbor formation, flooding, and SPF at intuition level",
      "Explain why OSPF areas exist",
      "Contrast OSPF's job with BGP's job",
      "Relate OSPF next hops to what Routing Path and Packet Journey display"
    ],
    content_easy_markdown: `# OSPF — Routing Inside an AS

## How it started
Enterprises and ISPs needed a fast, loop-resistant way to route **inside** their own network — campuses, data centers, backbone POPs — without asking the entire Internet for help. **OSPF (Open Shortest Path First)** became a standard **Interior Gateway Protocol (IGP)**: link-state routing with hierarchical areas, widely deployed and exam-favorite.

Think of an **Autonomous System (AS)** as one organization's routing policy domain. OSPF keeps that internal map healthy.

## The simple idea
OSPF ≈ "link state done for real networks."

1. Routers become **neighbors** on a link (Hellos).
2. They exchange and flood **LSAs** describing local links and costs.
3. Each router builds a **link-state database** (hopefully identical within an area).
4. Each runs **SPF (Dijkstra)** to each destination prefix.
5. Best next hops install into the FIB → data plane forwards.

External Internet routes usually enter via **BGP**; OSPF's job is "how do I reach my BGP exit router / internal subnet from here?"

## Step-by-step: bring-up sketch
1. Enable OSPF on interfaces; assign them to an **area** (often area 0 backbone in multi-area designs).
2. Hellos discover neighbors; adjacency forms (DR/BDR nuances on multi-access LANs).
3. Database description / LS exchange until synchronized.
4. On change: new LSA flooded → SPF → FIB update.
5. Packets to internal prefix 10.2.0.0/16 take the computed next hop.

## Real analogy
A company campus with many buildings:
- OSPF is the internal wayfinding system that updates when a hallway closes.
- BGP is how the company connects to other companies' campuses.
- Guests (packets) only care that doors open toward the right building; OSPF maintains the door signs.

## Worked example
AS 64500 has R1 (access), R2 (core), R3 (edge toward Internet).
- OSPF advertises 10.1.0.0/24 behind R1 and loopbacks.
- Cost(R1–R2)=10, cost(R2–R3)=5.
- From R1, destination "default / Internet" might be a route to R3's address; OSPF ensures R1→R2→R3 is the internal path.
- BGP on R3 learns external prefixes; recursive next-hop resolution uses OSPF reachability to R3.

If R1–R2 fails and an alternate link R1–R3 cost 40 exists, OSPF reconverges; BGP may stay put while the IGP path to the exit changes.

## Common mistakes
- Running OSPF between unrelated organizations (that's not its role — use BGP).
- Forgetting area 0 rules in multi-area designs (all areas connect via backbone conceptually).
- Confusing OSPF "cost" with ping latency (cost is configured/derived metric).
- Blaming OSPF for a bad BGP policy (different plane of decisions).
- Ignoring that host default gateways still matter at the edge.

## Check yourself
1. Is OSPF an IGP or EGP?
   - Answer: IGP — inside an AS.
2. What algorithm family is OSPF?
   - Answer: link state / SPF (Dijkstra).
3. Who typically brings Internet prefixes into the AS?
   - Answer: BGP at the edge; OSPF helps reach those edge routers.

## See it
**Routing Path**: treat the path inside one AS as "OSPF-shaped" next hops. **Packet Journey**: each internal hop assumes IGP convergence already happened. **IP Anatomy**: OSPF routes prefixes, not single host stories alone. **Delay Lab**: after failover, queuing on the backup link may spike even when OSPF "is fine."`,
    content_deep_markdown: `# OSPF Internals (Deep)

## LSA types (conceptual)
Router LSAs, network LSAs, summary LSAs across areas, AS-external LSAs for redistribution. Exact type numbers matter for ops exams; conceptually know "topology vs prefix vs external."

## Areas and hierarchy
Area 0 as backbone; ABRs summarize; stub/NSSA variants reduce external LSA burden. Design goal: contain flooding and SPF blast radius.

## Adjacencies
2-way vs full; DR/BDR on broadcast segments reduce adjacency mesh from O(n²) to O(n). Point-to-point links skip DR election.

## Timers and detection
Hello/Dead; LSA refresh (default aging ~30 min refresh patterns); SPF pacing / LSA throttling to avoid CPU meltdown during flaps. BFD often used for sub-second failure detection underneath OSPF.

## Failure modes
- Area partition from backbone → reachability islands.
- MTU mismatches preventing adjacency.
- Redistribution loops with another IGP or BGP.
- Max-metric / overload tricks for maintenance.

## Numbers
Default reference bandwidth historically 100 Mbps (cost = ref/bw) — multi-gig links need updated reference or explicit costs. Dead interval commonly 40 s with 10 s hellos unless tuned.

## Interview tip
"OSPF is a link-state IGP: flood LSAs, run SPF, hierarchical areas. It routes inside an AS; BGP connects ASes."

## Ops debugging
\`show ip ospf neighbor\`, database, and route — verify adjacency before chasing SPF. Confirm the FIB next hop matches the expected SPF tree after a change.

## Quantitative intuition
With hello=10 s and dead=40 s, a silent neighbor can take up to ~40 s to declare down before SPF. Enabling BFD at 300 ms detect multiplies recovery speed for the same SPF logic. On a 200-router area, an LSA storm can spike control CPU even when data-plane ASICs are fine — separate the planes when interpreting "router high CPU" tickets.

## Design trade-offs
One big area is simple but floods everywhere; many areas add ABR summarization complexity. Aggressive timers detect fast but risk false positives on congested links. Redistributing BGP into OSPF can be convenient and dangerous (feedback loops, table size).

## Operational debugging checklist
1. Neighbor FULL? If not, fix MTU/network type/timers first.
2. Is the prefix in the LSDB but not in the RIB (SPF preference / AD issue)?
3. Is the next hop reachable via OSPF (recursive lookup)?
4. Did an ABR summary hide a more specific you needed?
5. Correlate failure with interface cost changes and recent redistribution.

## Exam and interview phrasing
"OSPF is a link-state IGP: adjacencies, LSA flooding, SPF, optional areas. It builds internal reachability so packets can reach BGP edge routers and campus prefixes."
`,
  }),

  lesson({
    title: "BGP — How the Internet Glues Domains Together",
    titleMatch: "BGP%",
    importance_level: "Critical",
    breadcrumb_path: BC,
    first_principles: [
      "BGP is the interdomain routing protocol that connects Autonomous Systems",
      "BGP is path-vector and policy-driven, not pure shortest-path",
      "AS path attributes help detect loops and express preferences",
      "eBGP speaks between ASes; iBGP distributes routes inside an AS",
      "Most Internet reachability failures that are 'routing' are BGP-related at scale"
    ],
    learning_objectives: [
      "Define BGP's role as the Internet's glue between ASes",
      "Explain why policy matters more than hop count in BGP",
      "Read an AS path at intuition level",
      "Contrast eBGP and iBGP purposes",
      "Connect BGP decisions to end-user symptoms and labs"
    ],
    content_easy_markdown: `# BGP — How the Internet Glues Domains Together

## How it started
No single algorithm can optimally route the entire Internet under one administrative brain — different ISPs have different business contracts, traffic preferences, and trust boundaries. **BGP (Border Gateway Protocol)** emerged as the way Autonomous Systems **advertise which prefixes they can reach** and **choose among paths using policy**, not merely Dijkstra on a shared metric.

When people say "the Internet's routing," they usually mean BGP at the boundaries.

## The simple idea
- An **AS** is a network under one routing policy (ISP, cloud, university, big enterprise).
- BGP speakers tell neighbors: "I can reach 203.0.113.0/24 via me; here is my AS path."
- Receivers apply **import policy**, pick a best path, maybe **export** a modified advertisement onward.
- The AS path (e.g., 64500 64501 64502) is a **path vector** — loop if you see your own AS; prefer shorter AS paths *all else equal*, but local preference and business rules often dominate.

**OSPF** = inside the building. **BGP** = between buildings and cities.

## Step-by-step: a prefix travels the globe (cartoon)
1. Origin AS originates \`203.0.113.0/24\` in BGP.
2. Neighbor ISP accepts (import policy allows) and advertises to its peers/customers.
3. Your ISP learns multiple paths; **best path selection** picks one.
4. Your ISP's IGP (OSPF/IS-IS) carries you to the chosen exit router.
5. Data plane hops follow that engineered chain.
6. If origin withdraws or a path fails, BGP explores alternatives — can take a while.

## Real analogy
Airlines and alliances:
- Each airline (AS) decides which tickets (prefixes) it sells and which partners it interlines with (peering/transit policy).
- The "path" is the sequence of airlines, not the shortest geographic arc.
- You might fly a longer AS path because of price (policy), not distance.

## Worked example
You fetch \`https://example.com\` (after DNS → IP).
- That IP sits in some prefix announced with BGP.
- Your packets leave home → access ISP → possibly transit → destination AS.
- A **BGP hijack** (someone else falsely announces the prefix) can redirect traffic — control plane lie, data plane obedience.
- A **route leak** exports a path that policy should have filtered — traffic takes a weird detour.

MustAcademy heroes separate "DNS wrong" vs "TCP stuck" vs "BGP took a bad path."

## Common mistakes
- Treating BGP like OSPF with bigger numbers.
- Thinking "shorter AS path always wins" (local pref, MED, communities, etc. matter).
- Ignoring that hosts do not run BGP; edge routers do.
- Confusing traceroute hop counts with AS path length.
- Assuming instant global convergence after a withdrawal.

## Check yourself
1. What does BGP connect?
   - Answer: Autonomous Systems (interdomain routing).
2. Is BGP primarily shortest-path or policy?
   - Answer: policy / path-vector with attributes; not pure LS Dijkstra.
3. eBGP vs iBGP in one line?
   - Answer: eBGP between ASes; iBGP distributes external routes inside an AS.

## See it
**Routing Path** and **Packet Journey**: imagine AS boundaries on long paths — BGP chose the interdomain skeleton; IGP fills intradomain hops. **DNS Lookup** and **HTTP** labs still depend on BGP having a valid route to the resolved IP. **NAT** sits at edges of ASes but does not replace BGP. When a site is "off the Internet," ask whether the *prefix* is still announced.`,
    content_deep_markdown: `# BGP Mechanics and Policy (Deep)

## Path attributes (core set)
- **AS_PATH**: loop detection + tie-break.
- **NEXT_HOP**: where to send; must be IGP-reachable.
- **LOCAL_PREF**: prefer exit inside an AS (higher wins).
- **MED**: hint to neighbor for entry preference (lower wins; limited trust).
- **Communities**: opaque tags for policy contracts.

Decision process is ordered; operators live in local-pref and AS-path prepending more than raw SPF.

## eBGP vs iBGP
eBGP: AS boundary, TTL 1 often, rewrite next hop typically. iBGP: full mesh or route reflectors/confederations to avoid loops while distributing externals; next-hop reachability via IGP is crucial.

## Scale and the default-free zone
Global table: hundreds of thousands of prefixes (order of magnitude grows over years). Memory, TCAM, and CPU for churn matter. Aggregation and carefully scoped advertisements are survival skills.

## Failure modes
- Hijacks / more-specifics stealing traffic.
- Route leaks (especially customer→provider→peer mistakes).
- Persistent oscillation and slow convergence (path exploration).
- Next-hop unresolved → blackhole despite "BGP up."
- RPKI/ROA invalid filtering changing reachability.

## Numbers
Hold timer commonly 90–180 s; keepalive ~1/3 hold. MRAI historically slowed advertisements (implementation-dependent today). A single /24 withdrawal can trigger global exploration lasting tens of seconds.

## Interview tip
"BGP glues ASes with policy-based path-vector routing. LOCAL_PREF and business relationships dominate hop count. OSPF/IS-IS handle the path to the BGP next hop."

## Security note
TLS protects application bytes; it does not stop BGP from delivering you to the wrong AS. Routing security (RPKI, filtering) is a different layer of trust.

## Quantitative intuition
If an AS path explores four alternate routes and each advertisement is delayed on the order of tens of seconds by timers/policy, end-user loss can outlast many TCP retransmit epochs. More-specific /24 announcements can attract traffic away from an aggregate /16 — length and policy beat naive geography.

## Design trade-offs
Transit vs peer vs customer relationships define which routes you accept and re-advertise. Open peering maximizes paths but can import instability; strict filtering protects you and the Internet. iBGP route reflection scales mesh but introduces mediocre-path and visibility caveats.

## Operational debugging checklist
1. Is the prefix in BGP RIB on the edge? Best path? Why not?
2. Is next hop resolvable via IGP?
3. Check local preference / AS path / communities against intended policy.
4. Look for accidental export to peers (leak) or missing customer routes.
5. Validate RPKI state if invalids are filtered in your network.

## Exam and interview phrasing
"BGP connects ASes with policy-heavy path-vector routing. Business relationships and attributes choose paths; IGP carries packets to the chosen BGP next hop."
`,
  }),

  lesson({
    title: "SDN Controllers — Programming the Network",
    titleMatch: "SDN Controllers%",
    importance_level: "Essential",
    breadcrumb_path: BC,
    first_principles: [
      "SDN separates control decisions from forwarding boxes more explicitly",
      "A controller computes policy and programs switches/routers via APIs",
      "Match-action pipelines make the data plane programmable",
      "Southbound interfaces talk to devices; northbound interfaces talk to apps",
      "SDN does not remove the need for correct forwarding — it changes who authors the rules"
    ],
    learning_objectives: [
      "Explain SDN as logically centralized control over distributed data planes",
      "Distinguish northbound vs southbound interfaces",
      "Relate OpenFlow-style match-action to Unit 5 router internals",
      "Compare SDN trade-offs with distributed OSPF/BGP control",
      "Give a concrete example of what a controller might install"
    ],
    content_easy_markdown: `# SDN Controllers — Programming the Network

## How it started
Distributed protocols (OSPF, BGP) are powerful but hard to reason about globally: each box runs its own brain. Researchers and hyperscalers asked: what if forwarding boxes were simpler **match-action engines**, and a **controller** (or cluster) programmed them with an explicit network-wide policy? That idea became **Software-Defined Networking (SDN)** — not magic Wi-Fi, but a control-plane architecture.

## The simple idea
Classic: each router speaks OSPF/BGP and builds its own FIB.
SDN-ish: switches expose a programmable pipeline; a **controller** installs rules like:

> Match: dst IP 203.0.113.0/24 → Action: output port 3  
> Match: TCP dst port 22 → Action: drop  
> Match: src 10.0.0.5 → Action: encapsulate & send to collector

- **Southbound**: controller ↔ devices (OpenFlow historically; today also vendor APIs, P4Runtime, NETCONF/gNMI…).
- **Northbound**: apps ↔ controller (intent: "isolate tenant A," "steer video via path X").

Data plane still forwards at line rate. Control plane moved into software you can version, test, and automate.

## Step-by-step: reactive flow setup (classic OpenFlow cartoon)
1. Packet arrives at switch; **no matching rule**.
2. Switch punts header (or packet) to controller.
3. Controller decides based on topology + policy.
4. Controller installs a flow rule (possibly hard timeout / idle timeout).
5. Subsequent packets match in hardware — fast path.
6. On link failure, controller recomputes and reprograms affected switches.

Proactive setups install rules before traffic; reactive learns on demand. Production fabrics often mix both.

## Real analogy
Traffic lights:
- Old world: every intersection runs its own timed controller with limited coordination.
- SDN world: a city traffic computer updates signal plans based on global congestion — intersections still move cars (data plane), but the *plan* is programmed centrally.

## Worked example
Campus goal: "Exam servers only reachable from library VLAN."
- Without SDN: ACLs on many routers/firewalls, easy to drift.
- With SDN: controller app expresses intent; installs deny/allow match-action consistently; telemetry verifies.
- Failure: controller unreachable — design must define fail-open vs fail-closed and high availability.

Compare to BGP: you still might use BGP at Internet edges while SDN steers inside a DC fabric (hybrid is normal).

## Common mistakes
- Thinking SDN means "no more packets, only APIs."
- Assuming one controller box with no HA is fine for production.
- Confusing overlay virtual networks with the SDN control idea (related tooling, different layer).
- Believing match-action replaces TCP/TLS — it does not; apps still need transport and security.
- Ignoring rule capacity (TCAM limits) when installing too many microflows.

## Check yourself
1. What does the SDN controller primarily own?
   - Answer: control decisions / programming of forwarding rules.
2. Southbound vs northbound?
   - Answer: southbound to devices; northbound to applications/intent APIs.
3. Does SDN eliminate the data plane?
   - Answer: No — it programs it.

## See it
**Routing Path**: imagine next hops written by a controller instead of OSPF. **Packet Journey**: same hops, different author of the tables. **OSI Stack**: SDN control apps sit conceptually "beside" the stack while still targeting forwarding at L2/L3. **TCP** and **HTTP** labs still run over whatever paths SDN/IGP/BGP installed — application success depends on control correctness.`,
    content_deep_markdown: `# SDN Controller Architecture (Deep)

## Planes revisited
SDN makes the control/data split contractual: devices offer pipelines; controllers own intent→rules compilation. Management plane (config, streaming telemetry) often coexists.

## Match-action and P4
OpenFlow popularized header matches + actions. P4 describes programmable parsers and pipelines — portable specs compiled to targets. Complexity shifts to compiler correctness and resource packing (tables, meters).

## Controller HA and consistency
Active/standby vs distributed consensus; split-brain risks; eventual consistency of rule updates across switches can create transient loops — same family of problems as distributed protocols, new failure shapes.

## Comparison with distributed routing
| Concern | OSPF/BGP | SDN |
|---------|----------|-----|
| Global view | Emergent | First-class |
| Failure domain | Protocol + policy | Controller + southbound path |
| Policy expressiveness | Attribute soup | App logic + compilers |
| Incremental deploy | Universal | Fabric-by-fabric |

## Failure modes
- Controller partition from fabric → stale or default behaviors.
- Flow table overflow → punts or drops.
- App bugs installing blackholes at scale (blast radius larger).
- In-band control planes depending on the data plane they manage (bootstrapping hazards).

## Numbers
Reactive setups: first-packet RTT includes controller RTT (can be ms–tens of ms). Idle timeouts commonly tens of seconds. DC fabrics may hold tens/hundreds of thousands of rules carefully aggregated.

## Interview tip
"SDN logically centralizes control to program match-action data planes via southbound APIs; northbound apps express intent. Trade-off: simpler global policy vs controller availability and scale."

## Practice
Write three match-action rules for: (1) L3 forward, (2) ACL drop, (3) mirror to IDS. Explain where each lives relative to Unit 5 router ports and queues.

## Quantitative intuition
A reactive miss that punts to a controller 2 ms away adds at least that RTT before the first packet of a flow proceeds — tiny in WAN terms, huge at DC nanosecond budgets if overused. Rule timeouts of 10–60 s trade table size against setup frequency. Aggregating microflows into prefix/port classes is how operators stay within TCAM limits.

## Design trade-offs
Central intent is easier to audit than emergent OSPF+ACL spaghetti, but the controller cluster becomes critical infrastructure. Pure OpenFlow fabrics are rarer than hybrids: BGP/OSPF at the edge, SDN or proprietary controllers in the leaf-spine, overlays (VXLAN) programmed by automation.

## Operational debugging checklist
1. Is the packet hitting a wrong rule, no rule, or a correct rule on a down port?
2. Controller connected? Which node owns the switch?
3. Table capacity / eviction evicting critical flows?
4. Compare intended app policy vs compiled rules on device.
5. Confirm in-band control path is not riding the broken data path alone.

## Exam and interview phrasing
"SDN programs match-action data planes from logically centralized control. Southbound talks to devices; northbound exposes intent. You still need HA, rule scale discipline, and hybrid routing for the wide area."
`,
  }),
];
