import { lesson } from "./helper.mjs";

const BC = "CS 411 > Unit 1: Foundations";

export const topics = [
  lesson({
    title: "Welcome to Computer Networks — Your Zero-to-Hero Map",
    titleMatch: "Welcome to Computer Networks%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "You do not need prior networking knowledge — we build from first principles",
      "Every network problem is really about moving bits from A to B reliably enough",
      "Essential lessons get you fluent; Deep lessons get you interview- and systems-ready",
      "Labs turn abstract ideas into something you can see and step through",
      "A 'hero' can explain a page load end-to-end: names, packets, routes, and protocols"
    ],
    learning_objectives: [
      "Describe what CS 411 covers and how Units 1–8 fit together",
      "Find interactive labs on the lesson page (Essential/Deep), not a separate tab",
      "Explain when to read Essential vs Deep content",
      "Name the skills that mark a networks 'hero' graduate",
      "Adopt a debugging habit: ask which layer and which hop failed"
    ],
    content_easy_markdown: `# Welcome to Computer Networks — Your Zero-to-Hero Map

## Where are the interactive labs & animations?
**Right here on this lesson page** — look above this story for the panel titled **Interactive lab · Animation**.

That animated **Packet Journey** (Laptop → Router → ISP → Server) is not a separate menu item. On every Networks lesson that has a matching lab, MustAcademy mounts it **inline under Essential / Deep** — same place, same page. Press **Play** or **Step**.

| Unit theme | Labs you will see on those lessons |
| --- | --- |
| Foundations | Packet Journey, OSI & TCP/IP Stack |
| Performance | Four Delays, Throughput Bottleneck, Congestion Window |
| Application | DNS Lookup, HTTP Request Pipeline |
| Transport | TCP Three-Way Handshake |
| Data / IP | IP Address Anatomy, Routing Path, NAT |

If you only read the text and skip Play, you miss half the course.

## How it started
Computer networks used to be specialist territory: phone companies, research labs, and a handful of universities. Today every app you use — chat, maps, streaming, banking — is a network application. This course takes you from "Wi-Fi magically works" to "I can explain why it works, why it feels slow, and how to fix it."

You start at zero on purpose. Unit 1 builds vocabulary. Later units add performance, applications, transport, the IP data plane, control plane, link/wireless, and security.

## The simple idea
Networking is storytelling about **moving data between machines**.

- **Hosts** create and consume data (laptop, phone, cloud server).
- **Links and routers** carry and forward that data.
- **Protocols** are shared rules so strangers' computers can cooperate.
- **Layers** split the huge problem into smaller jobs (bits, packets, ports, apps).

## Essential vs Deep (the two tracks)
- **Essential Protocol** (this tab) — friendly, concrete, zero-to-hero. Read first. Always.
- **Deep Architecture** — mechanisms, numbers, failure cases, interview tips.

A **hero** graduate of CS 411 can:
1. Trace a browser request from DNS to HTTP response.
2. Name the four delays and spot a bottleneck.
3. Contrast UDP vs TCP and when each fits.
4. Read an IP address with a prefix and say what needs a router.
5. Use an on-page lab to verify an idea — not only memorize slides.

## Your zero-to-hero unit map
1. **Foundations** — Internet, protocols, packets, edge vs core, OSI/TCP/IP, encapsulation.
2. **Performance** — delays, queues, throughput, congestion intuition.
3. **Application** — HTTP, DNS, email/CDN intuition, cookies & caches.
4. **Transport** — UDP, TCP, reliability, congestion control, QUIC taste.
5. **Data plane** — IP, forwarding, NAT, DHCP, IPv6.
6. **Control plane** — routing algorithms, OSPF/BGP intuition, SDN peek.
7. **Link & wireless** — frames, Ethernet, ARP, Wi-Fi.
8. **Security** — threats, crypto/TLS intuition, firewalls, VPNs, secure page-load capstone.

## Step-by-step: how to use each lesson
1. Stay on **Essential Protocol** and scroll to the **Interactive lab** at the top — press Play once.
2. Read the story sections (simple idea → steps → analogy → check yourself).
3. Switch to **Deep Architecture** only when you want interview / systems depth.
4. Use **Research Notebook** to ask follow-up questions about *this* lesson.
5. When something breaks in real life, ask: *which layer?* *which hop?* *loss or delay?*

## Real analogy
Learning networks is like learning a city transit system. Essential is the tourist map. Deep is the operations manual. The **lab animation** is the live train tracker — you watch a hop move instead of only reading the timetable.

## Worked example
You click a video. Hero-level narration (you will earn every phrase later):
- DNS turns the name into an IP (**Application**).
- Your OS opens a transport connection (**Transport**).
- IP packets hop router to router (**Network / data plane**).
- Delays and queues decide if it feels snappy (**Performance**).
- HTTP (or a streaming protocol) fetches chunks (**Application**).

Today you only need the map — and one Play on the Packet Journey above.

## Common mistakes
- Looking for labs in a separate "Labs" tab — they live **on the lesson page**.
- Jumping to Deep and drowning in acronyms before intuition sticks.
- Treating animations as optional fluff — they are the practice gym.
- Memorizing OSI layer names without knowing each layer's *job*.
- Believing "the internet is down" is a diagnosis — it is a symptom.

## Check yourself
1. Where do interactive labs appear in MustAcademy?
   - Answer: Inline on the lesson page under Essential/Deep (Interactive lab · Animation), not a separate course tab.
2. What is Essential vs Deep?
   - Answer: Essential builds intuition first; Deep adds mechanisms, math, and interview depth.
3. What question should you ask first when debugging?
   - Answer: Which layer or hop failed — not "is the internet broken forever?"

## See it now
Scroll up to **Packet Journey**, press **Play**, then **Step**. Say at each hop: "edge host or forwarding hop?" That motion is the heartbeat of the whole course.`,
    content_deep_markdown: `# Course Design, Labs, and Hero Outcomes (Deep)

## Why labs sit on the lesson page
Passive reading underprepares you for traceroute interpretation and outage triage. Each matching CS 411 lesson mounts an interactive animation (Packet Journey, OSI stack, Delay, Throughput, Congestion, TCP handshake, DNS, HTTP pipeline, IP anatomy, Routing, NAT, …) **above the manuscript** so cause → effect stays tied to the same topic. There is no separate lab catalog to hunt for.

## Why zero-to-hero sequencing works
Industry and academia both suffer from "assume the reader already knows packets." We front-load shared vocabulary (host, packet, protocol, edge, core, layer) before performance math and TCP state machines. Students who skip foundations often fail later on congestion control because they never internalized store-and-forward and queuing.

## Essential vs Deep — engineering reading strategy
- **Essential**: mental models, analogies, check questions, lab hooks. Target: explain to a classmate in 90 seconds.
- **Deep**: quantitative reasoning, failure taxonomy, interview phrasing, design trade-offs. Target: whiteboard under pressure.

Interview tip: when asked "Walk me through loading a URL," structure by stages (DNS → TCP/QUIC → TLS → HTTP → render) and name *where reliability and naming live*. That narrative is the course spine.

## Failure cases heroes notice early
- Symptom: "site won't load." Separate DNS failure, TCP SYN drop, TLS cert error, and HTTP 502.
- Symptom: "slow." Ask delay vs throughput vs loss, not only "bad Wi-Fi."
- Symptom: "works on phone, not laptop." Think local edge config, not global internet collapse.

## What "done" looks like for Unit 1
You can draw edge vs core, define a protocol, sketch encapsulation, contrast circuit vs packet switching, and run the Packet Journey lab without notes. Everything later hangs on that scaffolding.`,
  }),

  lesson({
    title: "What Is the Internet, Really?",
    titleMatch: "What Is the Internet%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "The Internet is a network of networks, not one giant wire",
      "End systems (hosts) run applications; the network core forwards packets",
      "Packet switching shares links by slicing data into addressed packets",
      "No single company owns the whole path from you to a distant server",
      "Connectivity is hop-by-hop agreement between cooperating networks"
    ],
    learning_objectives: [
      "Define the Internet as interconnected networks exchanging packets",
      "Distinguish hosts (edge) from routers (core) at a high level",
      "Explain why packet switching enables sharing and scale",
      "Describe ISPs and peering as the business glue between networks",
      "Relate a simple end-to-end path to what users experience"
    ],
    content_easy_markdown: `# What Is the Internet, Really?

## How it started
In the late 1960s, researchers linked a few computers for resilient communication (ARPANET). The big idea was not "one phone call wire per conversation," but a flexible mesh that could route around failures. Over decades, universities, companies, and ISPs interconnected their networks. That federation — not a single machine — became **the Internet**.

## The simple idea
The Internet is a **network of networks**.

- Your home Wi-Fi is a small network.
- Your ISP runs a bigger network.
- Content companies, cloud providers, and other ISPs run theirs.
- They agree to pass **packets** to each other so your laptop can reach a server on another continent.

An **end system** or **host** is any device that originates or consumes application data: phones, laptops, servers, smart TVs. The **network core** is mostly routers and links that forward packets toward destinations. You rarely talk to the destination in one physical hop — you talk through many cooperating networks.

## Step-by-step: a request leaves your house
1. Your browser wants \`example.com\`.
2. Your laptop (a host) sends packets to your home router (first hop).
3. The home router forwards into your ISP's network.
4. ISP routers forward toward the destination network (maybe via other providers).
5. The server's network delivers packets to the server host.
6. Replies travel back — possibly on a different path.

At each hop, a device only needs "who is next?" — not a map of every computer on Earth.

## Real analogy
International mail. Your local post office does not fly the letter itself. It hands the envelope to regional and national carriers that have agreements. The "Internet" is those agreements plus the trucks (links) and sorting hubs (routers). Packet switching is like shipping a novel as many labeled postcards that share the same trucks with everyone else's mail.

## Worked example
You open a news site from Tunis to a server in Europe:
- Host: your phone.
- Access: cellular or Wi-Fi (edge).
- Core: many ISP and backbone routers.
- Destination host: the web server (or a nearby CDN cache — you'll meet CDNs in Unit 3).

If one backbone link fails, routing can shift traffic onto another path. That resilience is a design goal of packet networks.

## Common mistakes
- Thinking "the Internet" is your Wi-Fi password or one company.
- Believing your device knows the full path to the server.
- Confusing the Web (applications/sites) with the Internet (the packet network underneath).
- Assuming every packet of one download follows the identical route (often similar, not guaranteed identical forever).

## Check yourself
1. Is the Internet one network or many?
   - Answer: many interconnected networks.
2. What is a host?
   - Answer: an end system that runs apps and sends/receives data.
3. Why use packets instead of one reserved wire per conversation?
   - Answer: share links efficiently and route around problems.

## See it
Open the **Packet Journey** lab. Press **Play**, then **Step**. At each hop say: "This device is either an edge host or a forwarding hop." That distinction — edge vs core — is the first map of the Internet.`,
    content_deep_markdown: `# Internet Architecture Intuition (Deep)

## Network of networks
Autonomous Systems (ASes) — typically ISPs, cloud providers, large enterprises — exchange reachability with routing protocols (you'll deepen this in later units). Peering and transit are business relationships that determine which paths exist. Technically, IP provides a best-effort datagram service across this federation.

## Packet switching at Internet scale
Statistical multiplexing lets many flows share links. Routers forward hop-by-hop using destination prefixes. End-to-end reliability is mostly *not* provided by IP itself; transport and applications add what they need. This split is deliberate: keep the core simple, push complexity to edges when possible (end-to-end principle) — with real-world middlebox caveats.

## Edge vs core responsibilities
- Edge hosts: addressing config, name resolution, transport connections, apps.
- Core: high-speed forwarding, routing of prefixes, traffic engineering.
Interview tip: "Where should feature X live?" Often at endpoints unless the network must enforce policy (firewall, NAT).

## Failure cases
- Partial outages: one AS loses a peer; some destinations blackhole while others work.
- Congestion at interconnects: peering points become bottlenecks even when access bandwidth looks fine.
- Misleading user language: "Internet is down" often means "my access link" or "this one service."

## Numbers worth remembering
RTT across a continent is often tens of ms; across oceans, ~100+ ms from speed-of-light alone. Packet sizes are commonly bounded by ~1500-byte Ethernet MTUs. Scale comes from hierarchy and aggregation, not from every router knowing every host.`,
  }),

  lesson({
    title: "What Is a Protocol?",
    titleMatch: "What Is a Protocol%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "A protocol is an agreed set of rules for exchanging messages",
      "Protocols define syntax (format), semantics (meaning), and timing",
      "Both sides must implement the same protocol to interoperate",
      "Human greetings are a useful analogy for handshake protocols",
      "Layered protocols let each layer speak to its peer logically"
    ],
    learning_objectives: [
      "Define protocol in networking terms (rules + messages)",
      "Give everyday analogies for handshake and request/response",
      "Explain why standards matter for multi-vendor interoperability",
      "Relate protocols to layers (HTTP vs TCP vs IP)",
      "Identify what breaks when two sides disagree on a protocol"
    ],
    content_easy_markdown: `# What Is a Protocol?

## How it started
Early computer links were custom: each pair of machines needed a private agreement. As networks grew, engineers published **protocols** — shared rulebooks — so any correctly implemented device could talk to any other. TCP/IP, Ethernet, HTTP, and DNS are famous rulebooks that won by being useful and widely implemented.

## The simple idea
A **protocol** is a set of rules that say:
1. **What messages** exist (hello, request, ack, goodbye…).
2. **What each message means**.
3. **When** you may send them (order, timeouts, retries).
4. **How they are formatted** (fields, bits, headers).

If Alice's phone and Bob's server both speak HTTPS correctly, they can cooperate even if different companies built them. If one side speaks a different dialect, communication fails — just like two people shaking hands with incompatible customs.

## Step-by-step: a tiny human protocol (handshake)
Imagine meeting someone:
1. You extend your hand (SYN-like "want to connect?").
2. They extend theirs and smile (SYN-ACK-like "accepted").
3. You shake (ACK-like "we're connected").

Networking handshakes (you'll see TCP's three-way handshake later) are the same idea with bits: agree you're both ready before transferring bulk data. Not every protocol handshakes — UDP is more "yell the datagram and hope" — but the *concept* of agreed rules always applies.

## Real analogy
Board game rules. The box defines legal moves, turn order, and winning conditions. Two strangers can play if they use the same rulebook. Networking protocols are rulebooks for machines. RFCs and standards bodies publish many of them so implementations stay compatible.

## Worked example
Fetching a web page uses stacked protocols:
- **HTTP** messages: \`GET /index.html\` and \`200 OK\` with a body.
- **TCP** (often): ports, ordered byte stream, retransmission.
- **IP**: source/destination addresses for each packet.
- **Wi-Fi/Ethernet**: local delivery on your LAN.

Each protocol assumes the ones below deliver *some* service. HTTP authors do not redesign radio modulation.

## Common mistakes
- Thinking a protocol is "just software" — it is a *specification*; software implements it.
- Mixing layers: "HTTP is how packets find the server" (that's mainly IP/routing + DNS).
- Ignoring timing: formats without timeouts/retries often fail on real lossy links.
- Assuming private undocumented formats are fine at Internet scale — interoperability collapses.

## Check yourself
1. What three things do protocols typically define?
   - Answer: message formats, meanings, and rules for when to send them.
2. Why do standards matter?
   - Answer: so independently built systems interoperate.
3. Give a human analogy for a connection handshake.
   - Answer: greeting/handshake before a conversation.

## See it
In the **OSI & TCP/IP Stack** lab, click layers and read what each **adds**. Each addition is protocol header information for that layer's peer. Say: "This field exists because the protocol rulebook requires it."`,
    content_deep_markdown: `# Protocols as Interfaces (Deep)

## Syntax, semantics, timing
Classic definition: a protocol specifies the format of messages (syntax), the meaning of fields and state transitions (semantics), and timing constraints (timeouts, windowing, retransmission). Missing any of the three yields fragile systems.

## Horizontal vs vertical
- **Peer protocols** (horizontal): TCP on host A logically talks to TCP on host B.
- **Service interfaces** (vertical): TCP uses IP's delivery service; HTTP uses TCP/QUIC.

Interview tip: draw both arrows — "who is my peer?" and "what service do I consume?"

## Standards and ossification
Middleboxes that assume "TCP looks like this" make it hard to deploy new TCP options (protocol ossification). QUIC's design over UDP partly escapes ossified assumptions. Protocol evolution is as much political/operational as mathematical.

## Failure cases
- Version mismatch (HTTP/1.1 vs misunderstood HTTP/2 preface).
- Symmetric misunderstanding of endianness or length fields → silent parse errors.
- Clock/timeout mismatch → premature disconnects on long-fat networks.
- Security: downgrade attacks when fallback rules are too generous.

## Design checklist
When inventing an app protocol: define message types, idempotency, error codes, timeouts, and what happens on duplicate or lost messages. Networks drop and reorder; your rules must say what to do.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "What Is a Protocol?", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "What Is a Protocol?" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "Packets, Hosts, and Links",
    titleMatch: "Packets%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "The internet moves data in packets, not as one giant continuous stream",
      "A host is any end device that can send or receive packets",
      "A link is the communication channel between two neighboring devices",
      "Headers carry delivery instructions; the payload is the actual data",
      "Packet loss is expected; higher layers decide whether to retry or ignore"
    ],
    learning_objectives: [
      "Explain what a packet is and why networks split data into packets",
      "Identify hosts, routers, and links on a simple end-to-end path",
      "Describe header vs payload and why order/metadata matter",
      "Trace how one message hops from your device to a remote server",
      "Relate packet loss to what users see (retry vs glitch)",
      "Use the Packet Journey lab Play/Step controls to verify each hop"
    ],
    content_easy_markdown: `# Packets, Hosts, and Links

## How it started
In the 1960s–70s, researchers building ARPANET rejected the phone network's "keep a dedicated circuit open" model. Circuit switching wastes capacity when you are silent. Packet switching chops conversations into small labeled pieces so many users can share the same wires. That idea scaled into today's Internet.

## The simple idea
The Internet does **not** send your photo, email, or video as one unbroken stream of bits from A to Z. It chops the data into **packets** — small envelopes.

Each packet carries:
- **Payload** — a slice of your data
- **Header** — delivery instructions (addresses, type, length, other metadata)
- Often **order / control info** — so the receiver can reassemble pieces and detect problems

A **host** is any endpoint that can send or receive (phone, laptop, server, IoT camera). A **router** is a forwarder: it looks at the destination and chooses the next hop. A **link** is the cable, fiber, or radio between two neighboring devices.

## Step-by-step: how a message travels
1. Your app hands bytes to the OS networking stack.
2. The stack (and lower layers) split those bytes into packets and stamp headers.
3. Your device sends the first hop — usually to your home/office router over a link.
4. Each router reads the destination, looks up a next hop, and forwards onto the next link.
5. Packets may take slightly different paths and arrive out of order.
6. The receiving host strips headers, reassembles payloads, and delivers data to the app.

No router needs a map of every device on Earth. Each only answers: "For this destination, which neighbor link is best next?"

## Real analogy
Think of shipping a book as many postcards. Each postcard has a to/from address (header) and a page of text (payload). Post offices only sort to the next city — they do not memorize every street worldwide. If one postcard is lost, you resend that page, not the whole book.

## Worked example
You upload a 3 MB photo.
- The stack might create hundreds of packets (exact count depends on MTU and protocol overhead).
- Packet #47 might go Laptop → Wi-Fi AP → home router → ISP → backbone → server network → server.
- Header fields change at some layers each hop (link headers); the IP destination usually stays aimed at the server.
- If packet #47 is dropped on congested Wi-Fi, TCP can request a resend; a live UDP stream might just show a brief glitch.

## Common mistakes
- Believing "the Internet is one wire" — it is a graph of many links and hops.
- Thinking a host must know the full path — it usually only knows a default gateway.
- Assuming lost packet = permanent failure — often only that slice is retried.
- Confusing header (instructions) with payload (your data).
- Confusing routers (between networks) with L2 switches (usually same local network).

## Check yourself
1. Why split a file into packets instead of one giant transfer?
   - Answer: share links fairly, isolate failures, and allow flexible routing.
2. What is header vs payload?
   - Answer: header = delivery/control metadata; payload = the data bytes you care about.
3. If one packet of a photo is lost, is the photo gone forever?
   - Answer: usually no — reliable protocols retransmit the missing piece.

## See it
Open the **Packet Journey** lab above. Press **Play**, then use **Step** to watch one packet hop: Laptop → Router → ISP → Server. Pause on each hop and ask what changed (location on a link, not the identity of your payload).`,
    content_deep_markdown: `# Packets in Depth

## Why packets beat circuits
Circuit switching reserved a path for an entire call — quiet moments still consumed capacity. Packet switching multiplexes many conversations onto shared links. That statistical multiplexing, plus failure isolation and flexible routing, is why the Internet scaled.

## Header stack (encapsulation)
A "packet" at one layer is nested inside another:
- Application bytes become a transport **segment** (TCP/UDP).
- That becomes an IP **packet** with source/destination addresses.
- That becomes a link **frame** (Ethernet/Wi-Fi) for the local hop.
- Physical media carry bits/symbols.

On receive, layers unwrap in reverse. Interview tip: encapsulation = wrap going down; decapsulation = unwrap going up.

## MTU, fragmentation, and PMTUD
The Maximum Transmission Unit (often ~1500 bytes on Ethernet) caps frame size. Oversized IPv4 packets may fragment; IPv6 prefers Path MTU Discovery. Fragmentation is costly and fragile. Production advice: keep segments under the path MTU; watch for black-hole PMTUD when ICMP is filtered.

## Loss, delay, and jitter
- **Loss**: congestion drops, radio errors, failing optics, bad cables.
- **Delay**: propagation + transmission + queuing + processing.
- **Jitter**: delay variation — painful for interactive audio/video.

## Hosts, routers, and the default gateway
A host typically knows: its own IP/prefix, a default gateway, and maybe DNS. Routers store prefixes and next hops. This hop-by-hop design is the scalability trick behind the Internet.

## Failure cases interviewers love
- Congested Wi-Fi drops packets while the WAN is fine — last-mile problem mislabeled as "the Internet is down."
- Asymmetric routing: forward and return paths differ.
- Silent blackholes: TTL expiry, ACLs, or null routes — traceroute/MTR become diagnostic tools.
- Bufferbloat: huge queues inflate latency under load even when loss is low.

## Mental model to keep
Host = addressed endpoint. Router = hop-by-hop forwarder. Link = adjacency. IP = best-effort delivery. Reliability, ordering, and naming are usually layered above.`,
  }),

  lesson({
    title: "The Network Edge — How You Connect",
    titleMatch: "The Network Edge%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "The network edge is where end systems attach to the larger Internet",
      "Access networks (home, enterprise, cellular, Wi-Fi) differ in media and sharing",
      "Your first hop router is usually your gateway to everything beyond the LAN",
      "Edge performance often dominates user experience more than the distant core",
      "Configuration at the edge (DHCP, DNS, Wi-Fi) is a common failure point"
    ],
    learning_objectives: [
      "Define the network edge versus the network core",
      "Compare home, enterprise, and Wi-Fi/cellular access at a high level",
      "Explain the role of the default gateway",
      "Recognize why 'slow Internet' is often an edge problem",
      "Relate edge concepts to the first hop in Packet Journey"
    ],
    content_easy_markdown: `# The Network Edge — How You Connect

## How it started
The earliest hosts sat in labs with dedicated links. As networking reached homes and offices, **access networks** appeared: the last mile that connects ordinary devices to ISP infrastructure. DSL, cable, fiber-to-the-home, enterprise Ethernet, campus Wi-Fi, and cellular all solve the same problem differently — attach people to the Internet.

## The simple idea
The **network edge** is where *you* live digitally: phones, laptops, printers, TVs, and the local gear that connects them (Wi-Fi access points, home routers, office switches). Beyond that sits the **core** of ISP and backbone routers.

At the edge you care about:
- **How you attach** (Wi-Fi, Ethernet, cellular).
- **Who your gateway is** (usually 192.168.x.1 at home).
- **How addresses appear** (often DHCP — automatic).
- **How shared the medium is** (one busy Wi-Fi channel vs dedicated Ethernet).

## Step-by-step: home access
1. Devices join Wi-Fi or plug into Ethernet on your LAN.
2. The home router assigns private addresses (via DHCP) and acts as gateway + NAT.
3. The router has a WAN link to the ISP (fiber ONT, cable modem, etc.).
4. Outbound traffic: device → home router → ISP edge → rest of Internet.
5. Inbound replies reverse the path (with NAT translating addresses — Unit 5).

Enterprise edge adds VLANs, authentication (802.1X), firewalls, and managed Wi-Fi. Cellular edge uses radio towers and mobile-operator networks before reaching the broader Internet.

## Real analogy
The edge is your neighborhood street and driveway. The core is the highway system. A pothole in your driveway (bad Wi-Fi) makes "the trip downtown" feel broken even when highways are clear. Always check the driveway first.

## Worked example
Video call feels choppy at home:
- Core backbone may be fine.
- Likely edge causes: Wi-Fi interference, too many devices, ISP access congestion, or bufferbloat on the home router.
- Quick tests: try Ethernet; compare phone on cellular vs Wi-Fi; run a speed/latency check to the gateway vs a far server.

## Common mistakes
- Blaming "the Internet" when the access point is saturated.
- Ignoring that Wi-Fi is a shared, interference-prone medium.
- Forgetting the home router is both switch/AP *and* IP gateway/NAT box.
- Assuming office Ethernet and home Wi-Fi fail the same way.

## Check yourself
1. What is the network edge?
   - Answer: where end systems and access networks attach to the larger Internet.
2. What is a default gateway?
   - Answer: the first-hop router for traffic leaving your local network.
3. Why might Ethernet feel more stable than Wi-Fi?
   - Answer: less shared interference; more consistent link conditions.

## See it
In **Packet Journey**, the first hop from Laptop to Home Router *is* the edge. Pause there and ask: what access technology am I imagining — Wi-Fi or cable? That question is edge thinking.`,
    content_deep_markdown: `# Access Networks and Edge Reality (Deep)

## Access diversity
- **FTTH/cable/DSL**: different physical layers and MAC scheduling; asymmetric up/down common historically.
- **Enterprise**: structured cabling, PoE APs, controller-based Wi-Fi, segmentation.
- **Cellular**: radio resource scheduling, mobility, operator CGNAT often present.

## Sharing and last-mile economics
Last-mile capacity and contention ratios dominate consumer experience. Peak-hour slowdowns frequently sit at access or aggregation, not "the whole backbone melted."

## Edge as policy enforcement point
Firewalls, parental filters, zero-trust connectors, and VPN clients terminate at the edge. Security posture is often decided before packets reach the public core.

## Failure taxonomy
- DHCP exhaustion or rogue DHCP on a LAN.
- Wi-Fi association OK but captive portal / DNS interception breaks apps.
- Duplex mismatches (rarer on modern autoneg, still classic in exams).
- NAT hairpinning and inbound port-forward mistakes.

## Interview tip
When diagnosing UX issues, measure RTT to gateway separately from RTT to public targets. Large gap → problems beyond the LAN; large LAN RTT/loss → fix edge first.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "The Network Edge — How You Connect", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "The Network Edge — How You Connect" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "The Network Core — Routers and Switching",
    titleMatch: "The Network Core%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "The network core interconnects routers that forward packets toward destinations",
      "Store-and-forward means a router typically receives a full packet before sending it onward",
      "Forwarding is the per-packet lookup; routing is how forwarding tables get built",
      "Core links are shared by many flows via packet switching",
      "Each hop only needs the next hop, not the global path"
    ],
    learning_objectives: [
      "Explain store-and-forward packet switching in a router",
      "Contrast forwarding (data plane) with routing (control plane) at intro level",
      "Describe what a forwarding table entry roughly contains",
      "Relate multi-hop paths to Packet Journey and Routing Path labs",
      "Recognize queuing as a natural consequence of shared core links"
    ],
    content_easy_markdown: `# The Network Core — Routers and Switching

## How it started
Once multiple networks interconnected, we needed machines whose *job* was not running your apps but **moving packets between links**. Those machines are routers. The mesh of routers and high-speed links is the **network core** — the transit fabric of the Internet.

## The simple idea
A **router** connects multiple networks/links. For each arriving packet it:
1. Looks at the destination address (more precisely, finds the best matching prefix).
2. Chooses an output port / next hop.
3. Sends the packet out that link.

Most routers use **store-and-forward**: they receive and check a packet, then transmit it. That introduces transmission delay per hop (Unit 2 will quantify delays).

Two different jobs people mix up:
- **Forwarding** — the fast per-packet decision using a table (data plane).
- **Routing** — the slower process of building/updating those tables (control plane).

## Step-by-step: one hop in the core
1. Packet arrives on input link; bits are received into memory (store).
2. Header is examined; forwarding table says "out interface 3 toward next hop X."
3. Packet is queued if the output link is busy.
4. When its turn comes, the packet is transmitted on the output link (forward).
5. Downstream routers repeat until the edge network of the destination.

## Real analogy
Airport baggage hubs. Bags (packets) arrive on flights (input links), get sorted by destination city (lookup), wait on belts if crowded (queues), then leave on the next flight (output link). The printed sorting rules are the forwarding table; the meetings that redesign routes after a storm are routing.

## Worked example
Path: You → R1 → R2 → R3 → Server.
- R1 might forward all "Server's prefix" traffic to R2.
- If the R1–R2 link fails, routing updates may make R1 prefer R4 instead.
- Forwarding behavior changes only after the table updates — until then, blackholes are possible.

Try the **Routing Path** lab later to see choosing among alternate hops.

## Common mistakes
- Using "routing" for the per-packet lookup (often that is forwarding).
- Thinking core routers run your browser — they generally don't.
- Ignoring queues: a busy output link means waiting, even if the lookup was instant.
- Believing every router knows every host — they know prefixes/aggregates.

## Check yourself
1. What is store-and-forward?
   - Answer: receive (store) the packet, then send it on the next link.
2. Forwarding vs routing?
   - Answer: forwarding = use the table; routing = build/maintain the table.
3. Why do packets wait inside routers?
   - Answer: output links are busy; queues absorb bursts.

## See it
Use **Packet Journey** for hop intuition, then **Routing Path** to see alternate routes. Narrate: "Lookup, queue if needed, transmit." That sentence *is* the core.`,
    content_deep_markdown: `# Routers: Data Plane vs Control Plane (Deep)

## Store-and-forward delay
Transmission delay per hop ≈ L/R for packet length L and link rate R (Unit 2). Cut-through switching exists in some fabrics but Internet routers are classically store-and-forward with full-packet checks.

## Forwarding mechanisms (preview)
Longest-prefix match against a FIB (forwarding information base), then output-port scheduling. High-end routers use specialized hardware (TCAMs, pipelines). Match-action mental model returns in Unit 5.

## Routing protocols (preview)
OSPF/IS-IS inside an AS; BGP between ASes. Control plane failures can leave data plane tables stale — classic outage pattern.

## Queuing and congestion
When input rate to an output exceeds R, queues grow; eventually packets drop. Congestion control (Unit 4) reacts at endpoints; AQM may drop early (e.g., RED/CoDel ideas).

## Failure cases
- Microbursts filling shallow buffers.
- FIB inconsistency during convergence.
- Blackhole routes and routing loops (TTL saves the Internet from eternal loops).
- Silent ACL drops that look like "routing is fine" to traceroute depending on probe type.

## Interview tip
Say: "Forwarding is the per-packet data-plane action; routing is control-plane computation of next hops." That one sentence separates juniors from people who passed networks.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "The Network Core — Routers and Switching", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "The Network Core — Routers and Switching" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "Packet Switching vs Circuit Switching",
    titleMatch: "Packet Switching vs Circuit Switching%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "Circuit switching reserves a path and capacity for a session",
      "Packet switching shares links by multiplexing packets from many users",
      "Packet switching uses resources more efficiently for bursty traffic",
      "Circuits give predictable performance when admission succeeds",
      "The Internet primarily uses packet switching"
    ],
    learning_objectives: [
      "Contrast circuit switching and packet switching with clear examples",
      "Explain statistical multiplexing and bursty traffic",
      "Discuss trade-offs: predictability vs efficiency",
      "Relate phone-era circuits to modern packet Internet",
      "Argue why the Internet chose packets for data"
    ],
    content_easy_markdown: `# Packet Switching vs Circuit Switching

## How it started
Classic telephone networks used **circuit switching**: when you placed a call, the network reserved a path with dedicated capacity for the whole conversation. That made voice predictable — but silent moments still "used" the circuit. Data traffic is bursty (idle, then a surge of packets), so researchers favored **packet switching**: send labeled chunks only when you have data, and share the wire with others.

## The simple idea
**Circuit switching**
- Reserve resources end-to-end (or along a path) before talking.
- Great for steady streams; wasteful for bursts and silence.
- Admission control: if no circuit free, you get a busy signal.

**Packet switching**
- No dedicated end-to-end reservation for each flow (on the classic Internet).
- Chop data into packets; interleave many users on each link.
- Congestion possible: queues grow; packets may be delayed or dropped.

The Internet is fundamentally a packet-switched network. Some technologies emulate circuit-like behavior (MPLS LSPs, QoS reservations), but the default mental model is packets.

## Step-by-step: same file, two worlds
Circuit world:
1. Request a pipe of X Mbps for T seconds.
2. If accepted, send continuously on your reservation.
3. Release the circuit when done.

Packet world:
1. Start sending packets immediately (after local setup).
2. Packets share links with everyone else.
3. Transport protocols adapt rates when congestion appears (Unit 4).

## Real analogy
Circuit = reserving an entire taxi for your trip even while you sit quietly.
Packet = a subway car shared with strangers; you board with labeled bags (packets) only when you have bags to move. More efficient city-wide; occasionally crowded.

## Worked example
100 users each active only 10% of the time at 1 Mbps peaks.
- Circuits might need ~100 Mbps reserved if everyone could call at once (depending on design).
- Packet multiplexing can often work with far less total capacity because peaks rarely align perfectly — **statistical multiplexing**.
- Risk: if peaks *do* align, queues explode — congestion.

## Common mistakes
- Saying circuits are "old therefore useless" — they trade efficiency for predictability.
- Saying packet networks never reserve anything — QoS and telephony overlays exist.
- Forgetting congestion is the cost of sharing.
- Equating "guaranteed Netflix bitrate" with a phone circuit — usually adaptive streaming over packets.

## Check yourself
1. Which model shares links by interleaving packets?
   - Answer: packet switching.
2. What is a busy signal an example of?
   - Answer: circuit admission failure — no free reservation.
3. Why is data traffic a good fit for packets?
   - Answer: it is bursty; sharing beats idle reserved capacity.

## See it
While stepping **Packet Journey**, imagine dozens of other users' packets interleaved on the ISP hop. That mental overlay *is* packet switching. A circuit would have reserved that hop slice for only you.`,
    content_deep_markdown: `# Multiplexing and Resource Models (Deep)

## FDM/TDM circuits
Traditional circuits divided capacity by frequency or time slots. Predictable delay variance; poor utilization for bursty sources. Call blocking is the congestion manifestation (hard blocking vs packet drops).

## Statistical multiplexing gain
If sources are on with probability p, aggregate capacity near N·p·peak can serve N users with high probability — until correlations spike (evening peaks, viral events). Engineering = sizing for busy hour + accepting loss/delay targets.

## Hybrid reality
PSTN transitioned; VoIP carries voice as packets with jitter buffers. 5G/slicing and MPLS can provide logical isolation resembling circuits. Still, CS 411's default Internet model is best-effort packet switching.

## Failure cases
- Under-provisioned packet links → congestion collapse without end-to-end control.
- Over-admission of circuits → busy signals, wasted idle reservations.
- Misleading SLAs that sound circuit-like but are overbooked statistically.

## Interview tip
Contrast: "Circuits reserve; packets share and risk queues/loss. The Internet bets on statistical multiplexing plus endpoint congestion control."

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "Packet Switching vs Circuit Switching", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "Packet Switching vs Circuit Switching" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "OSI and TCP/IP Network Models",
    titleMatch: "OSI%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "Layering splits networking into jobs that can evolve independently",
      "OSI is a 7-layer teaching map; the Internet mostly runs on TCP/IP's ~4 layers",
      "Each layer provides a service to the layer above and uses the layer below",
      "Encapsulation wraps data as it goes down; peer layers logically talk end-to-end",
      "Diagnose failures by asking which layer broke"
    ],
    learning_objectives: [
      "Map OSI layers to everyday jobs (bits, frames, IP, ports, apps)",
      "Relate OSI layers to the TCP/IP model used on the real Internet",
      "Explain encapsulation as wrap-on-send and unwrap-on-receive",
      "Place IP below TCP and say why that ordering matters",
      "Use layer thinking to narrow 'network is down' bugs",
      "Click layers in the OSI & TCP/IP Stack lab and state what each adds"
    ],
    content_easy_markdown: `# OSI and TCP/IP Network Models

## How it started
In the 1970s–80s, vendors built incompatible network stacks. The OSI model (Open Systems Interconnection) gave a shared vocabulary with seven layers so people could design, teach, and troubleshoot without rewriting everything for each product. Meanwhile, the ARPANET/Internet community shipped TCP/IP — a simpler, practical stack that won in the real world. Today we still teach OSI, but we operate mostly on TCP/IP.

## The simple idea
Networking is too big for one brain, so we stack **layers**, each with one job:

| Everyday job | Rough layer |
|---|---|
| Web, email, DNS names | Application |
| Reliable delivery / ports (TCP/UDP) | Transport |
| Finding networks (IP addressing/routing) | Network / Internet |
| Local Wi-Fi/Ethernet framing + bits on the wire | Data link + Physical |

**OSI** = 7-layer teaching map (Physical, Data Link, Network, Transport, Session, Presentation, Application).
**TCP/IP** = the ~4-layer model the Internet actually runs (Link, Internet, Transport, Application).

Layers let browser authors change HTTP without rewriting Wi-Fi drivers.

## Step-by-step: encapsulation
Sending a message:
1. Application creates data (e.g., an HTTP request).
2. Transport adds ports and (for TCP) reliability fields → segment.
3. Internet/IP adds IP addresses → packet.
4. Link layer adds MAC/frame fields for the local hop → frame.
5. Physical layer turns bits into signals.

Receiving reverses the unwrap. Each layer only "talks" to its peer on the other host, using the layers below as a delivery service.

## Real analogy
Nested envelopes. Your letter (app data) goes in a courier pouch (transport), inside a city-addressed box (IP), inside a local truck tote (Ethernet/Wi-Fi). Each handler only reads the label they need.

## Worked example
You open \`https://example.com\`:
- Application: HTTPS/HTTP conversation
- Transport: TCP (or QUIC over UDP) with ports (e.g., 443)
- Internet: IP packets to the server's address
- Link: Wi-Fi frames to your router, then Ethernet/fiber beyond

If Wi-Fi fails, layers above never get a chance — same "site down" symptom, different root layer.

## Common mistakes
- Memorizing OSI names without knowing what problem each layer solves.
- Thinking OSI Session/Presentation are always separate boxes in modern stacks (often folded into the app/TLS).
- Saying "TCP is below IP" — wrong: IP is below transport.
- Blaming "the network" when TLS/cert (upper layer) is the real failure.

## Check yourself
1. Does IP sit above or below TCP?
   - Answer: below — address/route first, then ports/reliability.
2. Why use layers at all?
   - Answer: independent evolution, clearer interfaces, easier debugging.
3. OSI vs TCP/IP — which does the Internet mostly run?
   - Answer: TCP/IP; OSI is the teaching map.

## See it
Open the **OSI & TCP/IP Stack** lab. Click each layer. Read what that layer **adds**. Use **Play/Step** if available to watch wrap/unwrap. Say out loud: "This layer's job is ___."`,
    content_deep_markdown: `# Layering and Encapsulation (Deep)

## Why layering won
Standards at one layer can change without rewriting everything else. Wi-Fi (link) upgraded across generations while HTTP stayed conceptually stable. Clean interfaces also enable competition: many vendors implement IP; applications still interoperate.

## OSI vs TCP/IP mapping (interview-ready)
- OSI 5–7 (Session/Presentation/Application) roughly map to TCP/IP Application (TLS often plays a "presentation" role: encryption, certs).
- OSI 4 Transport ≈ TCP / UDP / (QUIC transport features).
- OSI 3 Network ≈ IP (+ ICMP, routing protocols as control plane).
- OSI 1–2 Physical/Data Link ≈ Network Access (Ethernet, Wi-Fi, cellular stacks).

Memorizing names is less valuable than naming the **job**: bits, frames, packets, segments/datagrams, application messages.

## Service models
- **Best effort** (IP): may drop, reorder, duplicate; no connection state.
- **Reliable byte stream** (TCP): connection, order, retransmission, congestion control.
- **Datagram** (UDP): port multiplexing, optional checksum, no delivery guarantees.
- **QUIC**: reliable multiplexed streams over UDP with integrated crypto — modern hybrid.

## Failure taxonomy by layer
- L1: unplugged cable, bad optical power, terrible SNR.
- L2: wrong VLAN, MAC flapping, Wi-Fi association/auth failure.
- L3: bad route, wrong mask, NAT misconfig, blackhole prefix.
- L4: port blocked, SYN drop, UDP filtered, exhausted ephemeral ports.
- L7/TLS: expired cert, SNI mismatch, HTTP 502 from bad upstream.

Ping OK + browser fail is a classic clue: ICMP/IP may work while TCP:443 or TLS fails.

## Middleboxes and the end-to-end principle
Firewalls, NATs, load balancers, and WAFs inspect or modify multiple layers. The end-to-end principle says functions belong at endpoints when possible; reality includes middleboxes that ossify protocols (hence QUIC over UDP).

## Real-world failure
A TLS misconfiguration looks like "the network is down" even when traceroute succeeds. Always ask: **which layer failed?**`,
  }),

  lesson({
    title: "Encapsulation — Wrapping Messages Layer by Layer",
    titleMatch: "Encapsulation%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "Encapsulation adds a header (and sometimes trailer) as data moves down the stack",
      "Decapsulation removes headers as data moves up the stack on the receiver",
      "Each layer treats the layer above's message as opaque payload",
      "The same bytes are a segment, packet, or frame depending on which header you look at",
      "Troubleshooting means asking which wrapper is wrong or missing"
    ],
    learning_objectives: [
      "Describe encapsulation and decapsulation with a concrete send/receive walk",
      "Name segment vs packet vs frame at the right layer",
      "Explain why lower layers should not need to understand app data",
      "Relate encapsulation to the OSI lab's 'what each layer adds'",
      "Use encapsulation language in debugging explanations"
    ],
    content_easy_markdown: `# Encapsulation — Wrapping Messages Layer by Layer

## How it started
Once layering existed, we needed a clear rule for how layers cooperate on the wire. The rule is **encapsulation**: each layer wraps the message from above in its own header (and maybe trailer), like nested gift boxes. Receivers unwrap in reverse. This idea is older than your phone — and it still explains Wireshark captures today.

## The simple idea
When sending:
- Application data
- + transport header → **segment** (TCP) or **datagram** (UDP)
- + IP header → **packet**
- + link header/trailer → **frame**
- → bits on the physical medium

When receiving, peel wrappers upward until the application gets its data. Lower layers treat upper messages as **opaque payload** — IP does not need to understand your JSON.

## Step-by-step: one HTTP GET gets dressed
1. Browser builds HTTP request bytes.
2. TLS may encrypt (still "app data" from TCP's view in many stacks).
3. TCP adds ports and sequence fields.
4. IP adds source/destination IPs.
5. Wi-Fi adds MAC addresses for the hop to your AP/router.
6. On the far server, unwrap: Wi-Fi/Ethernet → IP → TCP → TLS → HTTP.

At a router in the middle, often only link headers change hop-by-hop; the IP packet is forwarded onward (with TTL decrement, checksum updates, etc.).

## Real analogy
Shipping a letter inside a courier envelope inside a crate. The truck driver reads the crate label, not your handwriting. The courier facility reads the courier envelope. Your friend reads the letter. Wrong crate label = wrong city even if the letter is perfect — encapsulation debugging in real life.

## Worked example
Wireshark shows Ethernet | IP | TCP | TLS | HTTP.
- If MAC is wrong, local delivery fails (link).
- If IP destination is wrong, routing fails (network).
- If TCP port is closed, connection fails (transport).
- If HTTP path is 404, network may be fine (application).

Same user complaint ("doesn't work"); different wrapper is guilty.

## Common mistakes
- Using "packet" for every layer's message — be precise when it matters (exam/interview).
- Thinking routers must parse HTTP to forward — usually they forward IP.
- Forgetting trailers (like Ethernet FCS) exist on some layers.
- Assuming encryption means "no headers left" — encrypted payload still has clear lower headers (unless more tunnels wrap further).

## Check yourself
1. What does encapsulation add?
   - Answer: layer-specific headers (and sometimes trailers) around the payload from above.
2. What is a frame vs a packet?
   - Answer: frame usually includes link-layer header; packet usually refers to IP-level.
3. Why keep upper data opaque to lower layers?
   - Answer: so layers can evolve independently and stay simple.

## See it
Return to the **OSI & TCP/IP Stack** lab. As you click layers, picture a new wrapper appearing. Then step **Packet Journey** and remember: between hops, link wrappers change; the journey is still one logical end-to-end conversation.`,
    content_deep_markdown: `# Encapsulation Mechanics and Tunnels (Deep)

## PDU naming
Protocol data units: message/segment/packet/frame — interview fluency matters less than pointing to the header you mean. Be ready to say "TCP segment inside IP packet inside Ethernet frame."

## Hop-by-hop vs end-to-end headers
Link headers are rewritten each hop. IP headers are largely end-to-end (TTL aside). Transport headers are end-to-end between communicating hosts (middleboxes may meddle).

## Tunneling as recursive encapsulation
VPN/GRE/IPsec/VXLAN wrap packets inside other packets. Mental model: encapsulation can nest intentionally for overlays. Debugging overlays = unwrap twice.

## Performance implications
Header overhead reduces goodput. Small payloads with large headers waste capacity (why coalescing/Nagle/LRO/GRO and HTTP/2 multiplexing matter in practice).

## Failure cases
- Incorrect length fields → truncated or over-read payloads.
- Double NAT + tunnels → unexpected address rewriting.
- Gro/GSO offload bugs showing "impossible" large segments on the wire capture points.
- MTU black holes when encapsulated packets exceed path MTU.

## Interview tip
Draw nested boxes quickly. Label which device strips which header. That sketch answers half of "how does a packet traverse…?" questions.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "Encapsulation — Wrapping Messages Layer by Layer", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "Encapsulation — Wrapping Messages Layer by Layer" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),
];
