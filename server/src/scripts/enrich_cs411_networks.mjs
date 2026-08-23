/**
 * Enrich CS 411 Computer Networks topics with richer course content.
 * Source of truth for lesson markdown / objectives / first principles.
 * Usage: node src/scripts/enrich_cs411_networks.mjs  (from server/)
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const COURSE_ID = 176;

export const topics = [
  {
    title: "Packets, Hosts, and the Internet",
    titleMatch: "Packets, Hosts, and the Internet",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "The internet moves data in small chunks called packets, not as one giant continuous stream",
      "A host is any device with an address that can send or receive packets",
      "No single machine knows the whole path -- each hop only needs the next step",
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
    content_easy_markdown: `# Packets, Hosts, and the Internet

## How it started
In the 1960s-70s, researchers building ARPANET rejected the phone network's "keep a dedicated circuit open" model. Circuit switching wastes capacity when you are silent. Packet switching chops conversations into small labeled pieces so many users can share the same wires. That idea scaled into today's internet.

## The simple idea
The internet does **not** send your photo, email, or video as one unbroken stream of bits from A to Z. It chops the data into **packets** -- small envelopes.

Each packet carries:
- **Payload** -- a slice of your data
- **Addresses** -- source and destination (who sent it, who should get it)
- **Order / control info** -- so the receiver can reassemble pieces and detect problems

A **host** is any endpoint that can send or receive (phone, laptop, server, IoT camera). A **router** is a forwarder: it looks at the destination and chooses the next hop. A **link** is the cable, fiber, or radio between two devices.

## Step-by-step: how a message travels
1. Your app hands bytes to the OS networking stack.
2. The stack (and lower layers) split those bytes into packets and stamp headers.
3. Your device sends the first hop -- usually to your home/office router.
4. Each router reads the destination, looks up a next hop, and forwards.
5. Packets may take slightly different paths and arrive out of order.
6. The receiving host strips headers, reassembles payloads, and delivers data to the app.

No router needs a map of every device on Earth. Each only answers: "For this destination network, which neighbor is best next?"

## Real analogy
Think of shipping a book as many postcards. Each postcard has a to/from address and a page number. Post offices only sort to the next city -- they do not memorize every street worldwide. If one postcard is lost, you resend that page, not the whole book.

## Worked example
You upload a 3 MB photo.
- The stack might create hundreds of packets (exact count depends on MTU and protocol overhead).
- Packet #47 might go Laptop -> Wi-Fi AP -> home router -> ISP -> backbone -> server network -> server.
- If packet #47 is dropped on congested Wi-Fi, TCP can request a resend; a live UDP stream might just show a brief glitch.

## Common mistakes
- Believing "the internet is one wire" -- it is a graph of many links and hops.
- Thinking a host must know the full path -- it usually only knows a default gateway.
- Assuming lost packet = permanent failure -- often only that slice is retried.
- Confusing routers (between networks) with switches (usually same local network).

## Check yourself
1. Why split a file into packets instead of one giant transfer?
   - Answer: share links fairly, isolate failures, and allow flexible routing.
2. What is a host vs a router?
   - Answer: host = endpoint; router = forwarder between networks.
3. If one packet of a photo is lost, is the photo gone forever?
   - Answer: usually no -- reliable protocols retransmit the missing piece.

## See it
Open the **Packet Journey** lab above. Press **Play**, then use **Step** to watch one packet hop: Laptop -> Router -> ISP -> Server. Pause on each hop and ask what changed (location, not the payload identity).`,

    content_deep_markdown: `# Packets in Depth

## Why packets beat circuits
Circuit switching reserved a path for an entire call -- quiet moments still consumed capacity. Packet switching multiplexes many conversations onto shared links. That statistical multiplexing, plus failure isolation and flexible routing, is why the internet scaled.

- **Sharing the wire**: many flows interleave on the same fiber or radio.
- **Failure isolation**: lose one packet, not an entire reserved circuit.
- **Path flexibility**: packets of one flow can take different routes when topology changes (though ECMP/hashing often keeps a flow stable for performance).

## Header stack (encapsulation)
A "packet" at one layer is nested inside another:
- Application bytes become a transport **segment** (TCP/UDP).
- That becomes an IP **packet** with source/destination addresses.
- That becomes a link **frame** (Ethernet/Wi-Fi) for the local hop.
- Physical media carry bits/symbols.

On receive, layers unwrap in reverse. Interview tip: encapsulation = wrap going down; decapsulation = unwrap going up. "Where did it break?" is often "which header never matched?"

## MTU, fragmentation, and PMTUD
The Maximum Transmission Unit (often ~1500 bytes on Ethernet) caps frame size. Oversized IPv4 packets may fragment; IPv6 prefers Path MTU Discovery and "Packet Too Big" instead of router fragmentation. Fragmentation is costly and fragile (lossy networks drop fragments unevenly). Production advice: keep segments under the path MTU; watch for black-hole PMTUD failures when ICMP is filtered.

## Loss, delay, and jitter
- **Loss**: congestion drops, radio errors, failing optics, bad cables.
- **Delay**: propagation + serialization + queuing + processing.
- **Jitter**: delay variation -- painful for interactive audio/video.

TCP recovers loss with retransmission and congestion control. Many real-time apps prefer UDP plus concealment ("skip the late packet") because a retransmitted frame arrives too late to matter.

## Hosts, routers, and the default gateway
A host typically knows: its own IP/prefix, a default gateway, and maybe DNS. It does **not** need a global map. Routers store prefixes and next hops. This hop-by-hop design is the scalability trick behind "the Internet."

## Failure cases interviewers love
- Congested Wi-Fi drops packets while the WAN is fine -- last-mile problem mislabeled as "the internet is down."
- Asymmetric routing: forward and return paths differ; still OK if both directions work and middleboxes allow it.
- Silent blackholes: TTL expiry, ACLs, or null routes -- traceroute/MTR become diagnostic tools.
- Bufferbloat: huge queues inflate latency under load even when loss is low.

## Mental model to keep
Host = addressed endpoint. Router = hop-by-hop forwarder. Link = adjacency. IP = best-effort delivery. Reliability, ordering, and naming are usually layered above. When debugging, ask: did the packet leave, arrive, get dropped, or get delivered to the wrong app?
`
  },

  {
    title: "OSI and TCP/IP Network Models",
    titleMatch: "OSI and TCP/IP Network Models",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 1: Foundations",
    first_principles: [
      "Layering splits networking into jobs that can evolve independently",
      "OSI is a 7-layer teaching map; the internet mostly runs on TCP/IP's ~4 layers",
      "Each layer provides a service to the layer above and uses the layer below",
      "Encapsulation wraps data as it goes down; peer layers logically talk end-to-end",
      "Diagnose failures by asking which layer broke"
    ],
    learning_objectives: [
      "Map OSI layers to everyday jobs (bits, frames, IP, ports, apps)",
      "Relate OSI layers to the TCP/IP model used on the real internet",
      "Explain encapsulation as wrap-on-send and unwrap-on-receive",
      "Place IP below TCP and say why that ordering matters",
      "Use layer thinking to narrow 'network is down' bugs",
      "Click layers in the OSI & TCP/IP Stack lab and state what each adds"
    ],
    content_easy_markdown: `# OSI and TCP/IP Network Models

## How it started
In the 1970s-80s, vendors built incompatible network stacks. The OSI model (Open Systems Interconnection) gave a shared vocabulary with seven layers so people could design, teach, and troubleshoot without rewriting everything for each product. Meanwhile, the ARPANET/Internet community shipped TCP/IP -- a simpler, practical stack that won in the real world. Today we still teach OSI, but we operate mostly on TCP/IP.

## The simple idea
Networking is too big for one brain, so we stack **layers**, each with one job:

| Everyday job | Rough layer |
|---|---|
| Web, email, DNS names | Application |
| Reliable delivery / ports (TCP/UDP) | Transport |
| Finding networks (IP addressing/routing) | Network / Internet |
| Local Wi-Fi/Ethernet framing + bits on the wire | Data link + Physical |

**OSI** = 7-layer teaching map (Physical, Data Link, Network, Transport, Session, Presentation, Application).
**TCP/IP** = the ~4-layer model the internet actually runs (Link, Internet, Transport, Application).

Layers let browser authors change HTTP without rewriting Wi-Fi drivers.

## Step-by-step: encapsulation
Sending a message:
1. Application creates data (e.g., an HTTP request).
2. Transport adds ports and (for TCP) reliability fields -> segment.
3. Internet/IP adds IP addresses -> packet.
4. Link layer adds MAC/frame fields for the local hop -> frame.
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

If Wi-Fi fails, layers above never get a chance -- same "site down" symptom, different root layer.

## Common mistakes
- Memorizing OSI names without knowing what problem each layer solves.
- Thinking OSI Session/Presentation are always separate boxes in modern stacks (often folded into the app/TLS).
- Saying "TCP is below IP" -- wrong: IP is below transport.
- Blaming "the network" when TLS/cert (upper layer) is the real failure.

## Check yourself
1. Does IP sit above or below TCP?
   - Answer: below -- address/route first, then ports/reliability.
2. Why use layers at all?
   - Answer: independent evolution, clearer interfaces, easier debugging.
3. OSI vs TCP/IP -- which does the internet mostly run?
   - Answer: TCP/IP; OSI is the teaching map.

## See it
Open the **OSI & TCP/IP Stack** lab. Click each layer. Read what that layer **adds**. Use **Play/Step** if available to watch wrap/unwrap. Say out loud: "This layer's job is ___."`,

    content_deep_markdown: `# Layering and Encapsulation (Deep)

## Why layering won
Standards at one layer can change without rewriting everything else. Wi-Fi (link) upgraded across generations while HTTP stayed conceptually stable. Clean interfaces also enable competition: many vendors implement IP; applications still interoperate. Without layering, every app would speak radio drivers directly -- an unmaintainable mess.

## OSI vs TCP/IP mapping (interview-ready)
- OSI 5-7 (Session/Presentation/Application) roughly map to TCP/IP Application (TLS often plays a "presentation" role: encryption, certs).
- OSI 4 Transport ~ TCP / UDP / (QUIC transport features).
- OSI 3 Network ~ IP (+ ICMP, routing protocols as control plane).
- OSI 1-2 Physical/Data Link ~ Network Access (Ethernet, Wi-Fi, cellular stacks).

Memorizing names is less valuable than naming the **job**: bits, frames, packets, segments/datagrams, application messages.

## Service models
- **Best effort** (IP): may drop, reorder, duplicate; no connection state.
- **Reliable byte stream** (TCP): connection, order, retransmission, congestion control.
- **Datagram** (UDP): port multiplexing, optional checksum, no delivery guarantees.
- **QUIC**: reliable multiplexed streams over UDP with integrated crypto -- modern hybrid.

## Encapsulation walkthrough
Sending: App data -> TCP segment (ports, seq) -> IP packet (addrs) -> Ethernet frame (MACs) -> bits.
Receiving: reverse. Peer layers "logically" talk end-to-end even though only the physical layer is truly adjacent hop-by-hop.

## Failure taxonomy by layer
- L1: unplugged cable, bad optical power, terrible SNR.
- L2: wrong VLAN, MAC flapping, Wi-Fi association/auth failure.
- L3: bad route, wrong mask, NAT misconfig, blackhole prefix.
- L4: port blocked, SYN drop, UDP filtered, exhausted ephemeral ports.
- L7/TLS: expired cert, SNI mismatch, HTTP 502 from bad upstream.

Ping OK + browser fail is a classic clue: ICMP/IP may work while TCP:443 or TLS fails.

## Middleboxes and the end-to-end principle
Firewalls, NATs, load balancers, and WAFs inspect or modify multiple layers. The end-to-end principle says functions belong at endpoints when possible; reality includes many middleboxes that break assumptions (new TCP options ossify; hence QUIC over UDP).

## Real-world failure
A TLS misconfiguration looks like "the network is down" even when traceroute succeeds. Always ask: **which layer failed?** Layer thinking turns vague outages into actionable hypotheses.
`
  },

  {
    title: "IP Addressing and Subnets",
    titleMatch: "IP Addressing and Subnets",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 2: Addressing & Paths",
    first_principles: [
      "An IP address identifies an interface on a network, not 'a person'",
      "A subnet mask / prefix splits the address into network vs host parts",
      "Same subnet can talk locally; other networks need a router/gateway",
      "Longer prefix = smaller network = fewer host addresses",
      "Private RFC1918 ranges need NAT (or proxy) to reach the public internet"
    ],
    learning_objectives: [
      "Read an address like 192.168.1.42/24 and explain each part",
      "Separate network bits from host bits given a prefix length",
      "Estimate usable hosts for common prefixes (/24, /30, /16)",
      "Explain when traffic needs a default gateway",
      "Recognize private vs public addressing at a high level",
      "Use the IP Address Anatomy lab slider to see prefix effects"
    ],
    content_easy_markdown: `# IP Addressing and Subnets

## How it started
Early networks used ad-hoc host names and flat numbering. As the internet grew, we needed hierarchical addresses so routers could summarize "this whole neighborhood is that way." IPv4's 32-bit addresses and later CIDR (Classless Inter-Domain Routing) replaced rigid Class A/B/C rules with flexible prefixes like /24 or /16.

## The simple idea
An **IPv4 address** is 32 bits, usually written as four decimal numbers 0-255 (dotted quad), e.g. \`192.168.1.42\`.

\`192.168.1.42/24\` means:
- **First 24 bits** = network (the street)
- **Last 8 bits** = host (the house number)

Devices with the **same network portion** are on the same subnet and can usually talk directly (ARP/ND on the LAN). Different network portions -> send to a **router** (your gateway).

IPv6 uses 128-bit addresses and the same prefix idea (e.g. \`2001:db8::1/64\`), but this course focuses on the IPv4 intuition first.

## Step-by-step: using a subnet
1. Your interface gets an IP + prefix (DHCP or static), e.g. 10.0.0.50/24.
2. You also learn a default gateway, e.g. 10.0.0.1.
3. To reach 10.0.0.80: same /24 -> local delivery.
4. To reach 8.8.8.8: different network -> send to the gateway.
5. The gateway routes toward the destination; your host does not need the full path.

## Real analogy
Street name + house number. The \`/xx\` prefix says where the street name ends and the house number begins. Mail trucks (routers) move between streets; within one street, neighbors talk more directly.

## Worked example
Network \`192.168.1.0/24\`:
- Network address: 192.168.1.0
- Broadcast (IPv4): 192.168.1.255
- Usable hosts: 192.168.1.1 -- 192.168.1.254 (254 addresses)
- Host bits = 32-24 = 8 -> 2^8 = 256 total, minus network/broadcast in classic IPv4 LAN usage

\`10.0.0.0/30\` (point-to-point link):
- Host bits = 2 -> 4 addresses total, typically 2 usable -- perfect for router-to-router links.

## Common mistakes
- Treating /24 as magic without understanding bit boundaries.
- Forgetting gateway when destinations are off-subnet ("I set an IP but can't reach the internet").
- Overlapping private ranges across VPN sites (both use 192.168.1.0/24) causing collision.
- Confusing MAC addresses (local link) with IP addresses (network layer identity).

## Check yourself
1. In 10.0.5.9/16, what are network vs host portions (conceptually)?
   - Answer: first 16 bits network; last 16 bits host.
2. Why does /30 appear on WAN links?
   - Answer: only two routers need addresses; tiny subnet wastes fewer IPs.
3. Can two hosts on different /24s talk without a router?
   - Answer: generally no -- different networks need L3 forwarding.

## See it
Use the **IP Address Anatomy** lab. Drag the prefix length. Watch network bits vs host bits change. Press **Play/Step** if the lab animates delivery decisions: same subnet vs via gateway.`,

    content_deep_markdown: `# Subnets, CIDR, and Addressing (Deep)

## From classes to CIDR
Old Class A/B/C boundaries wasted space. CIDR (Classless Inter-Domain Routing) uses arbitrary prefix lengths so ISPs can allocate /20s, /23s, etc., and aggregate advertisements. Longer prefix = smaller network. Routers match the **longest prefix** when multiple routes overlap.

## CIDR math you should be fluent in
Prefix length p => host bits = 32 - p (IPv4). Block size = 2^(32-p). Examples:
- /24 -> 256 addresses
- /16 -> 65536 addresses
- /30 -> 4 addresses (common on point-to-point)
- /32 -> single host route

Classic usable hosts ~= 2^(host bits) - 2 (exclude network & broadcast). Know exceptions: /31 point-to-point (RFC 3021), /32 loopbacks, and IPv6 conventions that do not use broadcast the same way.

## Private addressing and NAT
RFC1918 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) are not globally routable. NAT/PAT maps many private hosts to fewer public IPs. Interview angle: NAT breaks pure end-to-end addressing; hole-punching, STUN/TURN, and ALGs exist because of it. IPv6 restores abundant global addressing and reduces reliance on NAT (though deployments vary).

## How a host actually uses the prefix
Given IP + mask + gateway:
1. Destination AND mask compared to self AND mask -> local vs remote.
2. Local -> ARP/ND for MAC, send on LAN.
3. Remote -> ARP/ND for gateway MAC, send there.
Wrong mask flips local/remote decisions and creates mysterious one-way failures.

## Subnetting practice pattern
Carve 172.16.0.0/16 into /24s for departments or /26s for VLANs. Plan growth; renumbering hurts more than slightly oversized subnets. Document DHCP pools vs static reservations.

## Failure cases
- Duplicate IPs: intermittent chaos, gratuitous ARP wars.
- Overlapping RFC1918 across VPN sites: broken return paths and "random" app failures.
- Public IPv4 exhaustion historically pushed NAT and IPv6.
- Summarization mistakes: advertising a too-broad aggregate that blackholes holes inside the range.

## Interview nuggets
- Explain longest-prefix match in one sentence: more specific routes beat less specific.
- DHCP delivers a bundle: address, mask, gateway, DNS -- not "just an IP."
- Know why /30 and /31 appear on router interconnects.`
  },

  {
    title: "Routing Across Networks",
    titleMatch: "Routing Across Networks",
    importance_level: "High",
    breadcrumb_path: "CS 411 > Unit 2: Addressing & Paths",
    first_principles: [
      "Routing chooses the next hop toward a destination network",
      "Forwarding is the per-packet lookup; routing is how tables get built",
      "Routers exchange reachability; they do not store a path for every host forever",
      "Metrics and policy decide which path wins",
      "Hop-by-hop design scales better than source-routing everything"
    ],
    learning_objectives: [
      "Contrast a switch (local) with a router (between networks)",
      "Follow a shortest/best path on a small router graph",
      "Explain hop-by-hop forwarding vs needing a global map on every host",
      "Distinguish control plane (routing) from data plane (forwarding)",
      "Give one reason alternate paths matter when a link fails",
      "Use the Routing Path lab Play/Step to watch a path light up"
    ],
    content_easy_markdown: `# Routing Across Networks

## How it started
As soon as networks connected to other networks, someone had to choose paths. Early ARPANET used distributed routing updates so the system could survive link failures. Today's internet still routes hop-by-hop: your laptop knows a gateway; that gateway knows regional paths; backbone routers exchange global reachability (notably with BGP between organizations).

## The simple idea
A **router** sits between networks and asks: "For this destination, which neighbor is the best next step?"

Your phone does not store every road on Earth. Each router keeps a **routing table**: destination prefix -> next hop + interface/cost. Packets are forwarded one hop at a time.

**Switch (typical LAN):** forwards within a broadcast domain using MAC learning.
**Router:** forwards between IP networks using routes.

## Step-by-step: a packet crossing networks
1. Host sends to its default gateway (if destination is remote).
2. Gateway looks up the destination IP against prefixes in its table.
3. Longest matching prefix wins; pick next hop.
4. Packet exits the chosen interface toward that neighbor.
5. Neighbor repeats until the destination network is reached.
6. Final router delivers to the target host on the local subnet.

If a link fails, routing protocols recompute and traffic can shift to an alternate path (after convergence).

## Real analogy
Driving with turn-by-turn GPS that only needs the next turn at each intersection. Highway signs (routing advertisements) update when a road closes. You do not carry a paper atlas of every driveway worldwide.

## Worked example
Lab topology: You -> R1 -> R2 -> Dest, with an alternate You -> R1 -> R3 -> Dest.
- Metric on R1-R2 is lower -> primary path uses R2.
- If R1-R2 fails, R1 installs the R3 path.
- Hosts often notice only a brief blip if TCP recovers; some UDP flows glitch.

## Common mistakes
- Saying switches and routers are the same -- different jobs (L2 vs L3 in the usual teaching model).
- Believing your PC "knows the internet path" -- it usually knows one gateway.
- Ignoring convergence: after failure, tables are wrong for a while.
- Assuming "shortest hops" always wins -- policy (especially BGP) may prefer longer paths.

## Check yourself
1. What does a routing table entry minimally need?
   - Answer: destination prefix, next hop (and interface/metric).
2. If R1 fails, can a longer alternate path still work?
   - Answer: yes -- redundancy is why meshes exist.
3. Forwarding vs routing?
   - Answer: forwarding = per-packet lookup; routing = building/updating tables.

## See it
Open the **Routing Path** lab. Press **Play**, then **Step**. Watch the best path light up (e.g., You -> R1 -> Dest). Mentally break a link and predict the failover path.`,

    content_deep_markdown: `# Forwarding vs Routing (Deep)

## Data plane vs control plane
- **Forwarding (data plane):** for each packet, match destination against the FIB and choose an output interface/next hop. Must be fast -- hardware ASICs in large routers.
- **Routing (control plane):** static routes plus protocols (OSPF, IS-IS, BGP, ...) compute and install those entries. Correctness and policy live here.

If the control plane is wrong, the data plane confidently sends packets into a ditch.

## Hop-by-hop scalability
End hosts stay simple (default route). Edge routers know customer/LAN prefixes. Core routers carry aggregated reachability. Nobody stores a host route for every laptop on Earth. Hierarchical addressing + aggregation is the economic foundation of global routing.

## Interior vs exterior protocols (high level)
- **IGP** (inside an AS): OSPF/IS-IS flood topology or distance-vector variants compute shortest paths with metrics (cost, bandwidth-derived).
- **EGP** (between ASes): BGP exchanges prefixes with AS-path and rich attributes. Policy often beats pure shortest path (prefer peer over expensive transit, traffic engineering, etc.).

Interview line: "BGP glues the global internet together; OSPF is common inside an organization."

## Metrics, administrative distance, and policy
Hop count, bandwidth, delay, reliability, administrative distance, local preference, MED, AS path length. Operators intentionally choose "worse" IGP metrics to steer traffic. Understanding that routing is political as well as mathematical is an interview differentiator.

## Failure cases
- **Loops** until TTL expires -- misconfig or slow convergence.
- **Blackholes** to Null0 or wrong next hops.
- **BGP leak/hijack**: accidental or malicious announcements pull traffic; RPKI and filtering reduce risk.
- **Asymmetric routing**: forward != return; stateful firewalls may drop the return path.
- **Micro-loops** during reconvergence after a link failure.

## Design takeaway
Forwarding is a lookup; routing is distributed belief about reachability. Redundancy only helps after convergence. When a path "should work," verify the FIB on each hop, not just the diagram on a whiteboard.
`
  },

  {
    title: "TCP Handshake and Reliable Delivery",
    titleMatch: "TCP Handshake and Reliable Delivery",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 3: Transport",
    first_principles: [
      "TCP creates a connection before exchanging application data",
      "Sequence and acknowledgment numbers track bytes delivered",
      "Lost data can be detected and retransmitted",
      "Ports multiplex many apps on one host IP",
      "Reliability means correct, ordered byte stream -- not zero latency"
    ],
    learning_objectives: [
      "Walk through SYN, SYN-ACK, ACK and what each side learns",
      "Explain what 'reliable' means for TCP (and what it does not mean)",
      "Relate ports to which application receives the data",
      "Describe ACKs and retransmission at an intuitive level",
      "Predict symptoms when SYNs are blocked by a firewall",
      "Step the TCP Three-Way Handshake lab through each message"
    ],
    content_easy_markdown: `# TCP Handshake and Reliable Delivery

## How it started
Early packet networks were lossy. Applications needed a reusable way to get a reliable byte stream on top of best-effort IP. TCP (Transmission Control Protocol), refined through the 1970s-80s RFCs, became the default "careful courier" for the web, email, file transfer, and SSH.

## The simple idea
**TCP** sets up a **connection**, then delivers a **reliable, ordered stream** of bytes between two apps (identified by IP + port on each side).

Three-way handshake:
1. **SYN** -- Client: "I want to connect; here are my starting sequence params."
2. **SYN-ACK** -- Server: "I heard you; here are mine."
3. **ACK** -- Client: "We're agreed -- connected."

After that, TCP numbers data, confirms receipt with **ACKs**, and **resends** what went missing. **Ports** (like 443) select which app on the machine gets the bytes.

## Step-by-step: reliable delivery (intuition)
1. Handshake establishes shared state (sequence space, window).
2. Sender transmits segments within a congestion/receive window.
3. Receiver ACKs what arrived in order (cumulative ACK story).
4. Missing data -> timeout or duplicate ACKs -> retransmission.
5. Either side can close with FIN/ACK (or abort with RST).

"Reliable" means: eventually get the bytes correctly and in order (if the connection survives). It does **not** mean instant or unlimited bandwidth.

## Real analogy
Introductions before a meeting (handshake), then numbered pages with signed receipts. If page 7 never arrives, you ask again -- you do not silently skip to page 8 and pretend the book is fine.

## Worked example
Browser to web server on 443:
1. DNS already resolved the IP (prior lesson).
2. Client sends TCP SYN to server:443.
3. Server replies SYN-ACK.
4. Client ACK -- connection ready.
5. TLS and HTTP ride on this stream (later lesson).
If SYN packets are dropped by a firewall, the browser spins until timeout -- UDP apps on other ports might still work.

## Common mistakes
- Thinking handshake moves the web page itself -- it only prepares the pipe.
- Confusing IP reliability with TCP -- IP is best effort; TCP adds reliability.
- Forgetting both sides need state; middlebox drops can desync.
- Assuming TCP means "fast" -- reliability can add latency under loss.

## Check yourself
1. Order of the handshake messages?
   - Answer: SYN, SYN-ACK, ACK.
2. What do ports do?
   - Answer: choose which application/socket receives the data.
3. If the final ACK is lost, can the server be unsure?
   - Answer: yes -- timers/retries exist; half-open edge cases are real.

## See it
Use the **TCP Three-Way Handshake** lab. Press **Play** and **Step** through SYN -> SYN-ACK -> ACK. Pause on SYN-ACK: who has agreed to what so far?`,

    content_deep_markdown: `# TCP Reliability Mechanics (Deep)

## Why a handshake exists
TCP is stateful. Both sides must agree on initial sequence numbers and confirm two-way reachability before trusting a byte stream. The three-way handshake (SYN, SYN-ACK, ACK) synchronizes that state. Without it, delayed duplicates from old connections could corrupt new ones (TIME-WAIT and ISN choice relate to this history).

## Sequence and ACK numbers
TCP counts bytes, not packets. A segment carries a sequence number for its first byte; ACKs advertise the next expected byte (cumulative ACK story). Selective ACK (SACK) names holes so senders retransmit smarter. Interview: "TCP is a reliable bidirectional byte stream," not a message protocol -- application boundaries are not preserved unless the app adds them.

## Loss recovery and congestion control
- Retransmit timer expires -> resend.
- Fast retransmit: several duplicate ACKs suggest a hole -> resend sooner.
- Congestion control (slow start, AIMD, CUBIC, BBR, ...) slows senders when the network is stressed so shared links remain usable.

Reliability without congestion control would melt the internet under loss. TCP couples "get the bytes there" with "don't destroy the path."

## Windows and flow control
The receive window advertises buffer space so a fast sender cannot overrun a slow receiver. Separate from congestion control, but both limit outstanding data.

## Connection end and aborts
Graceful close: FIN/ACK exchange (half-close possible). Abort: RST. TIME-WAIT holds state to absorb delayed segments -- a classic interview topic and a scaling concern for proxies that open many short connections.

## Head-of-line blocking
Ordered delivery means a lost segment can stall later bytes already in the receiver buffer from the application's perspective. Multiplexed HTTP/1.1 objects on one connection suffer; HTTP/2 multiplexes streams but still sits on TCP HOL; QUIC moves streams onto UDP to avoid TCP-level HOL.

## Failure cases
- SYN floods / backlog exhaustion (mitigations include SYN cookies).
- Firewalls that drop new SYNs but allow "established" weirdness.
- PMTUD black holes: large segments vanish when ICMP "too big" is filtered.
- Wireless loss misread as congestion -> throughput collapse.

## Interview nuggets
- Purpose of handshake: sync sequence space + confirm bidirectional reachability.
- "Reliable" means checksums + seq/ack + retransmit + ordering -- not zero loss on the wire and not zero latency.
`
  },

  {
    title: "UDP vs TCP — Choosing a Transport",
    titleMatch: "UDP vs TCP%",
    importance_level: "High",
    breadcrumb_path: "CS 411 > Unit 3: Transport",
    first_principles: [
      "TCP optimizes for correctness and order; UDP optimizes for minimalism and low overhead",
      "Reliability can be built above UDP when needed (QUIC, games, VoIP)",
      "Choose based on whether a late packet is worse than a missing one",
      "UDP has no handshake or connection state in the base protocol",
      "Ports still multiplex apps for both TCP and UDP"
    ],
    learning_objectives: [
      "Compare TCP and UDP on connection, reliability, ordering, and overhead",
      "Pick a sensible transport for file download vs live media vs DNS",
      "Explain why some 'unreliable' apps still work well on UDP",
      "Recognize that HTTP/3 (QUIC) runs over UDP yet can feel reliable",
      "Describe head-of-line blocking as a TCP downside for real-time use",
      "Relate lab TCP handshake cost to UDP's 'just send' model"
    ],
    content_easy_markdown: `# UDP vs TCP -- Choosing a Transport

## How it started
TCP gave applications a reliable stream, but not every app wants that contract. Voice, games, and simple query protocols often prefer to send a datagram now and move on. UDP (User Datagram Protocol) arrived as a thin layer over IP: ports + checksum, almost nothing else. Decades later, QUIC reinvented reliable transport *on top of* UDP to dodge TCP ossification in the middle of the network.

## The simple idea

| | TCP | UDP |
|---|---|---|
| Connection setup | Handshake first | None in base UDP |
| Delivery | Reliable + ordered stream | Best effort datagrams |
| Overhead / start time | Higher | Lower |
| Great for | Files, web pages, SSH | Video calls, games, DNS, some tunnels |

**Rule of thumb:** If every byte must arrive correctly and in order -> TCP (or reliable-over-UDP like QUIC). If the newest data matters more than old data -> UDP (or UDP-based real-time stacks).

## Step-by-step: choosing
1. Write down failure preference: stall vs glitch.
2. Need connection admission / backpressure? TCP helps; UDP pushes that to the app.
3. Need NAT friendliness and simple request/response? UDP often powers DNS and discovery.
4. Need crypto + multiplexed reliable streams without TCP HOL blocking? Consider QUIC/HTTP3.
5. Implement app-level retry only where it pays off (DNS retries; video uses concealment).

## Real analogy
TCP = registered mail with receipts. UDP = shouting across a busy room -- faster, might miss a word, and for live commentary you care about the latest sentence, not a perfect transcript of every cough.

## Worked example
- Banking statement PDF download -> TCP (or HTTP over QUIC): correctness wins.
- Live esports stream -> UDP/RTP-like: late frame is useless; skip and continue.
- DNS lookup -> traditionally UDP/53 for small queries; retry on timeout; TCP fallback for large responses.
- Zoom call: missing 20ms of audio is better than freezing 2 seconds to wait.

## Common mistakes
- "UDP means the app is unreliable" -- false; apps can add reliability (QUIC, gamedev netcode).
- "TCP is always better" -- false for latency-sensitive media.
- Forgetting firewalls often allow TCP:443 but block UDP -- breaks HTTP/3 and many real-time apps.
- Ignoring that UDP still uses ports and can still be congested.

## Check yourself
1. Transport for a live call vs a software update?
   - Answer: live call leans UDP/real-time; update leans reliable (TCP/QUIC).
2. Is HTTP/3 "UDP so it is unreliable"?
   - Answer: no -- QUIC builds reliability/crypto on UDP.
3. Why might Zoom glitch instead of freeze?
   - Answer: late packets are worthless; prefer newest audio/video.

## See it
Replay the **TCP Three-Way Handshake** lab with **Play/Step**, then read the UDP note: TCP spends time agreeing and confirming; UDP just sends. Compare setup cost before any app data moves.`,

    content_deep_markdown: `# Transport Trade-offs (Deep)

## What UDP actually provides
UDP adds source/destination ports, length, and an optional checksum over a mostly bare IP datagram. There is no handshake, no ordering, no retransmission, and no congestion control in base UDP. That minimalism is the feature: low latency to first byte, simple request/response, and freedom for apps to invent their own reliability.

## TCP's contract (and its cost)
TCP gives a reliable ordered byte stream with congestion control. Cost: handshake RTT, state on both ends, retransmission latency under loss, and head-of-line blocking for independent messages forced into one stream. Excellent for files, SSH, and classical HTTP.

## Head-of-line blocking and real time
If packet N is lost, TCP withholds later bytes from the app until N is recovered. Live media often prefers "play what you have" -- hence RTP/WebRTC over UDP, and QUIC's multiple streams that avoid TCP-level HOL between streams.

## QUIC / HTTP/3
QUIC runs over UDP to avoid middlebox ossification of TCP, enable faster connection setup features, integrate TLS, and multiplex streams. Interview soundbite: "HTTP/3 is not unreliable HTTP; it is HTTP over QUIC over UDP, with reliability implemented in QUIC."

## Congestion, fairness, and operator reality
Uncontrolled UDP floods harm shared networks. Mature stacks implement congestion control (or use TCP). Operators rate-limit abusive UDP; some corporate firewalls allow TCP:443 but drop UDP, breaking HTTP/3 and many VPNs/VoIP modes while "the web still works" in TCP fallback.

## NAT behavior
UDP NAT bindings often expire faster than TCP. Real-time apps send keepalives. TCP's connection state is more visible to middleboxes -- sometimes helpful, sometimes ossifying.

## Decision framework
1. Correctness-first, large transfers, APIs -> TCP or reliable QUIC streams.
2. Freshness-first, interactive media, games -> UDP + app logic.
3. Small query/response with retry -> UDP often fine (DNS), with TCP fallback.
4. Unknown enterprise networks -> plan for UDP blocking; offer TCP fallback.

## Failure cases
- Firewall asymmetry: TCP works, UDP dies.
- DNS truncation -> retry over TCP.
- Assuming UDP apps cannot be secure/reliable -- QUIC proves otherwise.
- Choosing TCP for live video "because reliable" and then wondering why freezes feel worse than glitches.
`
  },

  {
    title: "DNS — Names to Addresses",
    titleMatch: "DNS%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 4: Applications",
    first_principles: [
      "Humans use names; networks route on numbers (IP addresses)",
      "DNS is a distributed hierarchical lookup system, not one giant phone book server",
      "Caching and TTLs make repeat lookups feel instant",
      "Almost every web request begins with a name resolution step",
      "A healthy server can still look 'down' if DNS is wrong"
    ],
    learning_objectives: [
      "Trace a recursive DNS lookup at a high level (stub -> resolver -> hierarchy)",
      "Explain why DNS is critical before almost any named web request",
      "Describe what a cache hit saves (latency and load)",
      "Name common record types at a glance (A/AAAA, CNAME, MX, NS)",
      "Predict user symptoms of DNS outage vs server outage",
      "Step the DNS Lookup lab from resolver to authoritative answer"
    ],
    content_easy_markdown: `# DNS -- Names to Addresses

## How it started
Hosts files (a shared text list of names to addresses) does not scale to a global internet. DNS (Domain Name System), introduced in the 1980s, replaced central lists with a hierarchical, distributed database: roots, top-level domains (.com, .edu), and authoritative servers for each zone. Caching made it fast enough to feel invisible.

## The simple idea
**DNS** translates names like \`must.edu\` into IP addresses so routing and TCP/TLS can proceed.

Typical path:
1. Your app asks the OS stub resolver.
2. Stub asks a **recursive resolver** (home router, ISP, 1.1.1.1, 8.8.8.8, ...).
3. If not cached, resolver walks the hierarchy: **root** -> **TLD** (e.g. .edu) -> **authoritative** for must.edu.
4. Answer (A/AAAA record) returns; TTLs allow caching.
5. Your client connects to that IP.

Without DNS, you would type raw addresses for every site.

## Step-by-step: first visit vs cached visit
1. Type https://example.com and hit enter.
2. Browser needs an IP -> DNS query.
3. Cold cache: multiple referrals until authoritative answer.
4. Warm cache: resolver returns immediately from memory.
5. Client proceeds to TCP/TLS/HTTP (next lesson).

## Real analogy
Contacts app vs driving. DNS looks up the address; routing/TCP is the drive to the building. If the contacts app is wrong, you arrive at an empty lot even if the real store is open across town.

## Worked example
Lookup \`www.example.com\`:
- Resolver may see a CNAME to \`example.com\`, then an A record \`93.184.216.34\` (example numbers vary).
- TTL might be 300 seconds -- for five minutes, repeats are free/cheap.
- If DNS fails but you already know the IP, a raw IP URL might work (TLS/name checks can still break).

## Common mistakes
- "The website is down" when DNS is wrong/expired -- server may be healthy.
- Forgetting negative caching (failed lookups can be remembered too).
- Assuming DNS is only for websites -- email (MX), verification (TXT), services (SRV) use it heavily.
- Ignoring that clients may use different resolvers (privacy, split-horizon corporate DNS).

## Check yourself
1. Which step usually returns the final IP -- root or authoritative?
   - Answer: authoritative (or cache that previously learned it).
2. If DNS is down but the server is up, can users browse by name?
   - Answer: usually no.
3. What does caching save?
   - Answer: round trips, latency, and load on higher hierarchy servers.

## See it
Run the **DNS Lookup** lab. Press **Play** and **Step**: Browser/stub -> Resolver -> Root -> TLD -> Auth -> IP. Identify which step produces the final address.`,

    content_deep_markdown: `# DNS Resolution Path (Deep)

## Why hierarchy beats hosts files
A single flat file of all internet names does not scale operationally or politically. DNS delegates zones: roots point to TLDs; TLDs point to organization authoritative servers. Anyone can update their own zone without editing a global text file.

## Recursive vs authoritative roles
- **Stub resolver**: on the client; usually forwards queries to a recursive resolver.
- **Recursive resolver**: performs the iterative walk (root -> TLD -> auth) and caches answers by TTL.
- **Authoritative server**: stores the zone; returns definitive data for names it owns.

Clients rarely talk to roots directly; resolvers do the heavy lifting and absorb query load via caching.

## Record types worth knowing
- **A / AAAA**: IPv4 / IPv6 addresses
- **CNAME**: alias to another name (watch chains and apex limitations)
- **NS**: delegation to name servers for a zone
- **MX**: mail routing targets
- **TXT**: SPF/DKIM, domain verification, misc metadata
- **SRV / HTTPS / SVCB**: service discovery patterns used by modern stacks

## Caching, TTL, and negative answers
TTL controls reuse lifetime. Low TTL speeds failover/IP changes but increases query volume. High TTL feels snappier but slows updates. Resolvers also cache failures (negative caching) -- a misconfig can "stick" briefly even after you fix the zone.

## Security and privacy
Cache poisoning historically motivated stronger resolver behavior and DNSSEC (signatures over DNS data). DoH/DoT encrypt DNS on the path so cafe Wi-Fi operators cannot as easily inject answers or profile every name you resolve. DNS remains a high-value dependency: hijack the name, hijack the traffic.

## Operational failure modes
- Expired domain or broken NS delegation: healthy origin looks dead.
- Split-horizon DNS: internal vs external views differ -- VPN users see different answers.
- Single resolver outage in a misconfigured network: "entire internet is down."
- NXDOMAIN vs SERVFAIL: different meanings (name does not exist vs resolver/auth failure).

## Interview nuggets
- Almost every named HTTPS request depends on DNS first.
- Caching is why the second visit feels instant.
- "Site down" triage: resolve the name, then ping/TCP, then TLS, then HTTP -- isolate the layer.
`
  },

  {
    title: "HTTP and the Web Request Pipeline",
    titleMatch: "HTTP and the Web Request Pipeline",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 4: Applications",
    first_principles: [
      "HTTP is a request/response application protocol usually running on TCP or QUIC",
      "A page load is a pipeline: DNS -> connect -> encrypt -> request -> render",
      "Methods and status codes communicate intent and outcome",
      "HTTPS is HTTP inside TLS encryption, not a totally unrelated language",
      "This lesson is the capstone that uses packets, IP, routing, transport, and DNS"
    ],
    learning_objectives: [
      "Order the steps of a typical HTTPS page load end-to-end",
      "Explain what a GET asks for and what a status code answers",
      "Connect DNS, TCP/QUIC, TLS, and HTTP into one coherent story",
      "Interpret common status classes (2xx, 3xx, 4xx, 5xx) at a glance",
      "Distinguish 'network down' from cert/HTTP application failures",
      "Step the Full Stack Protocol lab from DNS through render"
    ],
    content_easy_markdown: `# HTTP and the Web Request Pipeline

## How it started
The early 1990s web needed a simple way for browsers to fetch hypertext documents. HTTP (Hypertext Transfer Protocol) began as a tiny request/response language over TCP. It grew through HTTP/1.1 (persistent connections), HTTP/2 (multiplexing), and HTTP/3 (QUIC/UDP). HTTPS wrapped the conversation in TLS so the pipe is private and authenticated.

## The simple idea
**HTTP** is the language browsers and web servers speak:

- Request: \`GET /index.html HTTP/1.1\` (method + path + headers)
- Response: \`200 OK\` plus headers and a body (HTML, JSON, image, ...)

Before HTTP starts, earlier CS 411 pieces chain together:
1. **DNS** finds the IP for the name
2. **TCP** (or **QUIC**) connects
3. **TLS** encrypts and authenticates (HTTPS)
4. **HTTP** fetches resources
5. Browser **renders** pixels (and may fetch more CSS/JS/images)

## Step-by-step: clicking a link
1. Parse URL (scheme, host, path, query).
2. DNS lookup for host (unless cached).
3. Open transport connection to IP:port (443 for HTTPS).
4. TLS handshake (certificates, keys) -- except 0-RTT cases on QUIC/TLS1.3 resume.
5. Send HTTP request; read response status + body.
6. Parse HTML; request dependent assets (often many parallel fetches).
7. Render; run scripts; maybe more API calls.

Milliseconds add up at every stage -- that is why caching, CDNs, and HTTP/2+/3 matter.

## Real analogy
HTTP is the conversation at the service desk. TLS is the private room. TCP/QUIC is entering the building. DNS is looking up the address. Packets are the spoken words traveling through the city.

## Worked example
Visit \`https://example.com/'\`:
- DNS -> IP
- TCP SYN handshake (or QUIC)
- TLS validates certificate for example.com
- \`GET /\` -> \`200 OK\` with HTML
- Browser sees \`<script src=...>\` and \`<img ...>\` -> more GETs
- If certificate is expired, users see a security interstitial -- HTTP never gets a clean channel even if the server process is running.

## Common mistakes
- Calling HTTPS a completely different app protocol -- it is HTTP over TLS.
- Blaming routing when the failure is DNS, TLS, or an HTTP 502 from a bad upstream.
- Forgetting a "page load" is many requests, not one.
- Ignoring status codes: 404 (missing resource) vs 500 (server fault) vs 301 (moved).

## Check yourself
1. Typical order for HTTPS page load?
   - Answer: DNS -> connect (TCP/QUIC) -> TLS -> HTTP -> render (with more fetches).
2. Is HTTPS a different language than HTTP?
   - Answer: same HTTP semantics, encrypted/authenticated transport.
3. Which lab step often costs surprising milliseconds?
   - Answer: DNS cold miss, TLS, or waiting on many small assets -- measure; do not guess blindly.

## See it
Use the **Full Stack Protocol** lab (DNS -> TCP -> TLS -> HTTP -> render). Press **Play**, then **Step** once end-to-end. Name the CS 411 concept behind each stage.`,

    content_deep_markdown: `# HTTP in the Stack (Deep)

## HTTP as an application protocol
HTTP expresses intent with methods, paths, headers, and bodies. It usually rides TCP (HTTP/1.x, HTTP/2) or QUIC/UDP (HTTP/3). HTTPS is HTTP semantics inside a TLS-protected channel -- same verbs and status codes, encrypted and authenticated transport.

## Methods and status codes (working vocabulary)
- Methods: GET (read), POST (submit), PUT/PATCH (update), DELETE, HEAD, OPTIONS, ...
- 2xx success, 3xx redirect, 4xx client/authorization/not found issues, 5xx server/gateway faults.
Interview polish: 401 vs 403, 301 vs 302, 502 (bad gateway) vs 504 (gateway timeout).

## Version evolution and performance
- **HTTP/1.1**: textual headers, persistent connections; browsers open multiple connections to reduce HOL blocking.
- **HTTP/2**: binary frames, multiplexed streams, header compression (HPACK).
- **HTTP/3**: HTTP over QUIC; better loss recovery and connection migration versus TCP.

CDNs, caching headers (Cache-Control, ETag), and compression are application-layer levers that still depend on correct DNS and TLS.

## End-to-end page load pipeline
DNS -> transport connect -> TLS -> HTTP request/response -> parse -> more requests for assets/APIs -> render. Cold caches amplify DNS and TLS cost. HTTP/2+/3 and connection reuse amortize setup. A "single click" is often dozens of requests.

## Failure cases that fool users
- Expired/mismatched certificates: browser interstitial; origin process may be fine.
- DNS points to old IP after cutover: intermittent or sticky wrong host.
- 502/504 from reverse proxies: upstream app/platform issue, not home Wi-Fi.
- Mixed content blocking on HTTPS pages.
- WAF/challenge pages returning 403 that look like "network" problems.

## Capstone mental model
Packets carry bytes across links. IP addresses and routes find networks. TCP/UDP/QUIC deliver to apps. DNS maps names to addresses. HTTP expresses web intent and returns resources. Debugging a broken page means naming which stage failed -- not shrugging "the internet." CS 411's visual labs exist so you can *see* that pipeline instead of only memorizing acronyms.
`
  }
];

function len(s) {
  return s ? s.length : 0;
}

async function enrich() {
  console.log("Enriching CS 411 topics (course_id=%s)...", COURSE_ID);
  const results = [];

  try {
    for (const t of topics) {
      const match = t.titleMatch || t.title;
      const res = await pool.query(
        `UPDATE topics SET
          content_easy_markdown = $1,
          content_deep_markdown = $2,
          content_markdown = $3,
          learning_objectives = $4,
          first_principles = $5,
          importance_level = COALESCE($6, importance_level),
          breadcrumb_path = COALESCE($7, breadcrumb_path)
        WHERE course_id = $8
          AND title ILIKE $9
        RETURNING id, title`,
        [
          t.content_easy_markdown,
          t.content_deep_markdown,
          t.content_easy_markdown,
          JSON.stringify(t.learning_objectives),
          JSON.stringify(t.first_principles),
          t.importance_level || null,
          t.breadcrumb_path || null,
          COURSE_ID,
          match
        ]
      );

      if (res.rowCount === 0) {
        console.error("  MISS:", t.title, "(match:", match + ")");
        results.push({ title: t.title, updated: false, easy: len(t.content_easy_markdown), deep: len(t.content_deep_markdown) });
        continue;
      }

      const row = res.rows[0];
      const easy = len(t.content_easy_markdown);
      const deep = len(t.content_deep_markdown);
      console.log(`  OK  ${row.title}`);
      console.log(`      easy=${easy}  deep=${deep}`);
      results.push({ title: row.title, updated: true, easy, deep });
    }

    console.log("\n=== Summary (title | easy | deep) ===");
    for (const r of results) {
      console.log(`${r.updated ? "OK" : "MISS"}\t${r.title}\teasy=${r.easy}\tdeep=${r.deep}`);
    }
    console.log(`\nDone. Updated ${results.filter((r) => r.updated).length}/${topics.length}.`);
  } catch (err) {
    console.error("Enrich failed:", err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  enrich();
}
