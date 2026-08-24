import { lesson } from "./helper.mjs";

const BC = "CS 411 > Unit 7: Link Layer & Wireless";

export const topics = [
  lesson({
    title: "Link Layer Job — Frames, MAC, and Local Delivery",
    titleMatch: "Link Layer Job%",
    importance_level: "Critical",
    breadcrumb_path: BC,
    first_principles: [
      "The link layer moves frames between nodes on the same local network segment or hop",
      "Frames encapsulate network-layer packets with link headers and trailers",
      "MAC addresses identify interfaces on a local link",
      "Error detection (CRC) helps find corrupted frames",
      "IP routing assumes each hop can deliver across the next link"
    ],
    learning_objectives: [
      "State the link layer's job relative to IP and physical bits",
      "Define frame, MAC address, and local delivery",
      "Explain why CRC exists at L2",
      "Relate encapsulation: packet inside frame",
      "Connect link hops to what Packet Journey shows between routers"
    ],
    content_easy_markdown: `# Link Layer Job — Frames, MAC, and Local Delivery

## How it started
IP can name any host on Earth, but a cable or Wi-Fi radio only talks to **neighbors on the same hop**. Early Ethernet and serial links needed rules for: who may transmit, how bits are grouped, and how to detect garbage. That bundle of rules is the **link layer** (OSI L2 / TCP/IP Network Interface ideas). Without it, routers would have nowhere to put the IP packet for the *next* physical trip.

## The simple idea
Each hop:
1. Take an IP packet (or other network PDU).
2. Wrap it in a **frame** with a link header (and often a trailer).
3. Address the frame with a **MAC** (or link) destination for *this* hop — not the final IP destination (unless they coincide on a LAN).
4. Send bits on the medium; receiver checks integrity (e.g., **CRC**).
5. If OK, strip the frame and pass the packet up (to IP on a host/router).

**MAC address** ≈ burned-in (or assigned) hardware identifier for an interface on a LAN. **IP address** ≈ global-ish locator/routing identifier. ARP (next lessons) maps between them on Ethernet.

## Step-by-step: laptop → home router hop
1. Laptop wants to send an IP packet to 8.8.8.8.
2. Routing table says: next hop = default gateway 192.168.1.1 on interface eth0 / wlan0.
3. Link layer must deliver to the *gateway's MAC*, not to 8.8.8.8's MAC (that MAC isn't on your Wi-Fi).
4. Frame: dst MAC = router, src MAC = laptop, ethertype = IPv4, payload = IP packet.
5. Router receives, CRC OK, de-frames, decrements TTL, forwards out WAN with a *new* frame toward the ISP.

## Real analogy
Postal system:
- **IP packet** = letter with a city address.
- **Frame** = the mailbag used on *this truck route* between two sorting centers.
- **MAC** = the truck bay ID at this facility — only meaningful locally.
- Changing trucks at each hop = new frame encapsulation (just like new link headers).

## Worked example
Packet Journey shows Laptop → Router → ISP → Server. Between Laptop and Router there is exactly one link-layer trip: one frame type (Ethernet or Wi-Fi), one local MAC delivery. Between Router and ISP, a *different* link technology might wrap the *same* IP packet. Heroes say: "IP is end-to-end addressing of the datagram; link is hop-by-hop delivery."

CRC example intuition: if noise flips bits, CRC fails → frame dropped. IP/TCP may recover higher up; the link layer usually does **not** retransmit on classic Ethernet (Wi-Fi link retries are a special case).

## Common mistakes
- Thinking the destination MAC is always the final server's MAC.
- Believing link layer replaces IP — it serves IP hop by hop.
- Ignoring that switches (later) forward on MAC tables, routers on IP tables.
- Assuming CRC corrects errors — detection ≠ correction on typical Ethernet.
- Confusing ports (TCP/UDP) with MAC addresses.

## Check yourself
1. What does the link layer deliver between?
   - Answer: neighboring nodes on a single hop / local network segment.
2. What sits inside an Ethernet frame when browsing the web?
   - Answer: typically an IP packet (which itself carries TCP/TLS/HTTP…).
3. Why new frames each hop?
   - Answer: each link has its own addressing and headers; IP packet is the passenger.

## See it
**Packet Journey**: pause on the first hop and name the frame delivery. **OSI & TCP/IP Stack**: find Link / Network Interface under IP. **IP Anatomy**: IP header stays; link header changes. **Routing Path**: each next hop implies a successful L2 delivery to that next hop's interface.
`,
    content_deep_markdown: `# Link Layer Mechanisms (Deep)

## Services
Framing, addressing, error detection, optional reliability/flow control (varies by technology), medium access control when the medium is shared.

## Framing and demux
Ethertype / length fields distinguish IPv4, IPv6, ARP, etc. Trailers commonly carry FCS/CRC. Preamble/SOF sync physical receivers.

## MAC address structure
48-bit IEEE addresses common; OUI + NIC-specific bits; unicast vs multicast vs broadcast (FF:FF:FF:FF:FF:FF). Locally administered bits matter in virtualization.

## Error detection
CRC polynomial detection of burst errors with high probability; corrupted frames dropped. Upper layers see loss, not "bit error" signals usually.

## Relationship to MTU
Link MTU caps frame payload; IP fragmentation or TCP MSS clamping deals with path limits — classic operational footgun with tunnels.

## Failure modes
- Duplex mismatch (classic Ethernet).
- CRC error storms from bad cabling/NICs.
- MAC flapping on miswired loops without STP.
- Oversized frames dropped (MTU).

## Numbers
Ethernet CRC-32; classic MTU 1500 bytes payload; jumbo frames often ~9000 in DCs. Wi-Fi frame overhead and retries change effective goodput vs raw PHY rate.

## Interview tip
"Link layer delivers frames hop-by-hop using MAC addressing and CRC; IP packet is rewritten into a new frame at each router hop."

## Practice
Draw encapsulation boxes for L2/L3/L4 on one hop, then redraw after a router hop with new MACs and same IP endpoints.

## Quantitative intuition
A 1500-byte IP packet on Ethernet gains 18 bytes of header/FCS (without VLAN tag) — small overhead at large payloads, painful for tiny packets (ACKs, voice). CRC detects common burst errors; undetected error probability is tiny for random noise but not a substitute for end-to-end checks at higher layers when systems are buggy or adversarial.

## Design trade-offs
Rich link services (Wi-Fi retries) hide loss from IP but inflate delay variance. Thin Ethernet drops and lets TCP recover — simpler L2, more visible loss. Choosing MTU (1500 vs jumbo) trades compatibility against per-packet header amortization in data centers.

## Operational debugging checklist
1. Link up with FCS/CRC errors? Suspect cable, optics, duplex.
2. ARP complete but ping fails? Move up to IP/ACL.
3. Traceroute first hop fails? Local L2/gateway problem.
4. Capture: confirm ethertype and MAC pairing match the intended next hop.
5. After a router hop, expect new MACs — same IP endpoints.

## Exam and interview phrasing
"The link layer delivers frames to the next hop using local addressing and error detection. IP packets are passengers that get a fresh frame at every router interface."
`,
  }),

  lesson({
    title: "Ethernet and Switching — From Shared Cable to Full Duplex",
    titleMatch: "Ethernet and Switching%",
    importance_level: "Essential",
    breadcrumb_path: BC,
    first_principles: [
      "Classic Ethernet shared a medium and used CSMA/CD for collisions",
      "Switches forward frames based on MAC learning tables",
      "Modern Ethernet is typically full duplex with no CSMA/CD on switched links",
      "Broadcast and flooding still matter for unknown unicasts and ARP",
      "Spanning Tree or similar prevents loops in bridged topologies"
    ],
    learning_objectives: [
      "Contrast shared-medium Ethernet with switched full-duplex Ethernet",
      "Explain MAC learning and forwarding/flooding behavior",
      "Define collision domain vs broadcast domain at intuition level",
      "State why loops need spanning tree or equivalent",
      "Relate switching (L2) to routing (L3) from prior units"
    ],
    content_easy_markdown: `# Ethernet and Switching — From Shared Cable to Full Duplex

## How it started
Original Ethernet was a shared coaxial cable: everyone heard everyone, and **collisions** happened if two stations transmitted at once. **CSMA/CD** (Carrier Sense Multiple Access with Collision Detection) was the politeness protocol: listen, talk, detect clash, back off. Hubs repeated bits to all ports — still one big collision domain.

Then **switches** arrived: each port a separate collision domain, frames forwarded only where needed (mostly), and eventually **full duplex** links killed CSMA/CD on those links. Your home "router" is often a switch + Wi-Fi AP + IP router in one box.

## The simple idea
A **switch**:
1. Learns source MAC → port bindings by watching frames.
2. For known unicast dst MAC → forward out that port only.
3. For unknown unicast / broadcast / multicast (often) → **flood** within the VLAN/broadcast domain.
4. Does **not** decrement IP TTL or rewrite IP — that is a router's job.

**Collision domain**: who can collide. Hub = big; switched full duplex port = essentially none for that link.
**Broadcast domain**: who receives L2 broadcasts. Separated by routers (and VLAN boundaries).

## Step-by-step: first frame to a silent printer
1. PC wants MAC of printer (via ARP) or already knows it.
2. Frame enters switch port 1; switch learns PC MAC on port 1.
3. If printer MAC unknown, switch floods frame to other ports in VLAN.
4. Printer replies; switch learns printer MAC on port 7.
5. Later frames PC↔printer are switched directly port 1↔7 — no flood.

## Real analogy
Old Ethernet hub = party line telephone — everyone hears the chatter; talking over each other = collision.
Switch = private intercom matrix — receptionist learns who sits on which line and connects only those two, unless someone hits the "all hands" broadcast button.

## Worked example
Three PCs on a switch, one router uplink.
- PC-A sends to PC-B (same subnet): switch only; router idle.
- PC-A sends to Internet host: frame to *router MAC*; router de-frames, routes, new frame out WAN.
- Someone wires two switch ports together without STP → loop → broadcast storm possible.

MustAcademy **Packet Journey** often abstracts the LAN switch; remember it exists under the first hop when multiple devices share a home LAN.

## Common mistakes
- Calling every box a "router" when L2 switching is enough for same-subnet traffic.
- Thinking switches understand IP addresses (L3 switches blur this — learn the idea first).
- Forgetting floods on unknown MACs still create traffic.
- Ignoring VLAN separation vs "flat" networks.
- Believing full duplex means unlimited bandwidth — links still have capacity and queues.

## Check yourself
1. Who forwards on MAC tables — switch or classic router?
   - Answer: switch (L2). Router forwards on IP.
2. What killed everyday CSMA/CD on modern office Ethernet?
   - Answer: switched full-duplex point-to-point links.
3. What happens to an unknown unicast?
   - Answer: typically flooded in the broadcast domain/VLAN.

## See it
**Packet Journey** / **Routing Path**: same-subnet vs cross-subnet — only cross-subnet needs the router hop. **OSI Stack**: Ethernet sits at link. **Delay Lab**: switch queues under bursty fan-in still add queuing delay even without classic collisions.
`,
    content_deep_markdown: `# Ethernet Switching Deep Dive

## Evolution
Shared medium → hubs → bridges/switches → VLANs → data-center fabrics (TRILL/SPB/EVPN overlays). CSMA/CD retained mainly as historical/exam knowledge for half-duplex edge cases.

## MAC learning and aging
Tables age out; mobility and VM moves cause relearning. Security: port security, MAC limiting, 802.1X.

## STP family
802.1D/w/s prevent loops by blocking redundant ports; convergence improvements in RSTP/MSTP. Misconfig → blackholes or subtle asymmetric paths.

## VLANs
Logical broadcast domains on shared hardware; trunk tags (802.1Q). Router-on-a-stick / L3 switch SVIs route between VLANs.

## Failure modes
- Broadcast storms.
- Duplex mismatch → late collisions / CRC errors.
- CAM overflow forcing fail-open flooding (security concern).
- Asymmetric L2 paths breaking voice/stateful middleboxes.

## Numbers
Classic 10/100/1000/10G/… rates; 1500-byte MTU; cut-through vs store-and-forward latency trade-offs (microseconds matter in HFT/DC).

## Interview tip
"Switches learn MAC→port, forward/flood frames; modern Ethernet is full duplex. Routers separate broadcast domains and forward IP."

## Practice
Draw collision vs broadcast domains for hub vs switch vs router topologies. Predict ARP flood behavior.

## Quantitative intuition
Store-and-forward of a 1500-byte frame at 1 Gbps is about 12 µs of transmission serialization alone; switching latency adds little unless queues build. A broadcast storm on a looped 1 Gbps link can saturate cores and uplinks in milliseconds — STP exists because L2 loops are not "slightly bad," they are catastrophic.

## Design trade-offs
Large flat L2 domains ease VM mobility and complicate failure domains. Routing between smaller L2 islands (L3 leaf designs) contains broadcasts. Cut-through switching lowers latency but can forward corrupted frames further.

## Operational debugging checklist
1. Unexpected flooding? Check CAM capacity and unknown unicasts.
2. Loops? Verify STP state / MLAG / fabric controls.
3. Duplex mismatch counters on older copper edges.
4. Same-subnet traffic hairpinning through a router unnecessarily?
5. VLAN tag mismatch between access and trunk ports.

## Exam and interview phrasing
"Ethernet evolved from shared CSMA/CD to switched full duplex. Switches learn MAC-to-port mappings and flood when needed; routers separate broadcast domains and forward on IP."
`,
  }),

  lesson({
    title: "ARP — IP Addresses Meet MAC Addresses",
    titleMatch: "ARP%",
    importance_level: "Critical",
    breadcrumb_path: BC,
    first_principles: [
      "ARP resolves an IPv4 address to a MAC address on a local link",
      "ARP requests are typically broadcast; replies are unicast",
      "Hosts cache ARP entries soft-state with timeouts",
      "Without correct ARP, IP forwarding to the next hop fails even if routes exist",
      "ARP spoofing is a classic local-link attack surface"
    ],
    learning_objectives: [
      "Explain why ARP exists between IP and Ethernet",
      "Walk through request/reply for a default gateway",
      "Describe ARP cache behavior at intuition level",
      "Predict what breaks when ARP is wrong",
      "Relate ARP to Packet Journey's first hop and security unit later"
    ],
    content_easy_markdown: `# ARP — IP Addresses Meet MAC Addresses

## How it started
Ethernet delivers frames to **MAC** addresses. IP routing decides the **next-hop IP**. Something had to translate "please deliver to 192.168.1.1" into "use MAC aa:bb:… on this LAN." That something is **ARP — Address Resolution Protocol**. (IPv6 uses Neighbor Discovery instead; same job, different protocol.)

## The simple idea
On a LAN:
1. You know next-hop **IP** (often the default gateway).
2. Check **ARP cache** for its MAC.
3. If missing: broadcast **Who has 192.168.1.1? Tell 192.168.1.50.**
4. Owner unicasts **ARP reply** with its MAC.
5. Cache it; encapsulate the IP packet in a frame to that MAC.

ARP is **link-local**. You never ARP for a remote Internet IP across the WAN — you ARP for your *gateway*, then the gateway handles the rest.

## Step-by-step: first packet after boot
1. Host 192.168.1.50 wants 203.0.113.10.
2. Route: default via 192.168.1.1, interface eth0.
3. ARP cache empty for 192.168.1.1 → ARP request flooded on LAN.
4. Router replies: 192.168.1.1 is at MAC R.
5. Frame to MAC R carries the IP packet destined to 203.0.113.10.
6. Later packets reuse the cache until timeout or flush.

## Real analogy
You know your friend's apartment number (IP) but the building intercom needs their buzz code (MAC). You press "directory" (broadcast): "Who lives in 1A?" They answer with the code; you cache it on a sticky note (ARP table). You do not buzz every apartment in another city — only resolve locally.

## Worked example
\`ping 192.168.1.1\` on a home LAN:
- ICMP is IP.
- Before the first echo request leaves as bits, ARP may run.
- Wireshark would show ARP request/reply then ICMP.
- If someone answers ARP with the wrong MAC (**spoofing**), your frames go to an attacker — Unit 8 territory.

Gateway reachable by ping but "Internet dead" can still be DHCP/DNS/BGP — but gateway ARP failure looks like "no one home on the LAN."

## Common mistakes
- ARPing for remote IPs directly (wrong mental model).
- Clearing nothing after MAC changes (stale cache) — VM moves, NIC swaps.
- Confusing DNS (name→IP) with ARP (IP→MAC).
- Thinking ARP runs end-to-end across the Internet.
- Ignoring gratuitous ARP uses (announce/update) in HA failover.

## Check yourself
1. What question does ARP answer?
   - Answer: What MAC should I use to reach this local next-hop IP?
2. Are ARP requests usually broadcast or unicast?
   - Answer: requests broadcast; replies unicast (typically).
3. Do you ARP for 8.8.8.8 from your laptop on Wi-Fi?
   - Answer: No — ARP for your gateway; send IP to 8.8.8.8 inside that frame.

## See it
**Packet Journey**: the laptop→router hop *assumes* ARP (or ND) succeeded. **IP Anatomy**: ARP is not an IP routing protocol — it supports local delivery. **OSI Stack**: ARP sits beside/beneath IP on Ethernet. **NAT**: WAN side has its own next-hop resolution toward the ISP. Lab hint: on a real OS, \`arp -a\` / \`ip neigh\` shows the cache you just learned conceptually.
`,
    content_deep_markdown: `# ARP Details and Failure Modes (Deep)

## Packet formats
Hardware type, protocol type (IPv4), opcode request/reply, sender/target MAC/IP fields. Ethernet ethertype 0x0806.

## Caching
Minutes-scale timeouts common; positive and negative caching behaviors vary by OS. Incomplete entries while waiting for replies.

## Proxy ARP and variants
Routers answering ARP for remote addresses (legacy/special designs). Gratuitous ARP for updates and conflict detection. ARP probes in IPv4 Address Conflict Detection.

## Security
ARP has no authentication — spoofing enables MITM on L2. Mitigations: dynamic ARP inspection, static bindings, 802.1X, encrypted higher layers (TLS) still help confidentiality but not path integrity alone.

## IPv6 note
Neighbor Discovery (NS/NA) + SLAAC interplay; same resolution role.

## Failure modes
- Duplicate IPs → flapping ARP.
- VLAN mismatch → requests unseen.
- Switch floods vs filtered broadcast issues.
- Stale entry after failover VIP/MAC move.

## Numbers
Broadcast domain size multiplies ARP noise; large L2 domains historically painful (one reason to route more, bridge less).

## Interview tip
"ARP maps next-hop IPv4 addresses to MAC addresses on a LAN using broadcast requests; remote destinations are reached by ARPing the gateway, not the remote IP."

## Practice
Write the ARP exchange for host→gateway→server including which MACs appear in each Ethernet header on the LAN side only.

## Quantitative intuition
One ARP broadcast wakes every host NIC in the VLAN — cheap occasionally, expensive as a scan/chatty storm across thousands of hosts. Cache TTLs of tens of seconds to minutes balance freshness against chatter. Failover that depends on gratuitous ARP must fit within client cache lifetimes or use shorter timeouts.

## Design trade-offs
Huge L2 domains make ARP (and broadcasts generally) scale poorly — another reason for L3 segmentation. Static ARP is secure and operationally brittle. Dynamic ARP inspection costs switch features and correct DHCP snooping bindings.

## Operational debugging checklist
1. \`ip neigh\` / ARP table: incomplete, stale, or wrong MAC?
2. Capture whether requests leave and replies return on the right VLAN.
3. Duplicate address detection symptoms (flapping MACs)?
4. After VM move, did the switch and hosts relearn?
5. Never expect ARP for a remote Internet destination from the client.

## Exam and interview phrasing
"ARP resolves the next-hop IPv4 address to a MAC on the local link. Remote servers are reached by ARPing the gateway, then routing IP hop by hop."
`,
  }),

  lesson({
    title: "Wireless LANs — Wi-Fi Collisions and Access Points",
    titleMatch: "Wireless LANs%",
    importance_level: "Critical",
    breadcrumb_path: BC,
    first_principles: [
      "Wi-Fi shares a radio channel so transmitters must coordinate access",
      "CSMA/CA and acknowledgments replace wired CSMA/CD assumptions",
      "Access points bridge wireless clients into an Ethernet LAN",
      "Interference, retries, and rate adaptation dominate real Wi-Fi performance",
      "Association and security handshakes precede useful data transfer"
    ],
    learning_objectives: [
      "Explain why Wi-Fi cannot detect collisions like classic wired Ethernet",
      "Describe AP association at a high level",
      "Relate Wi-Fi retries to delay and throughput symptoms",
      "Contrast infrastructure mode with a simple ad-hoc mental model",
      "Connect home Wi-Fi to the first hop in Packet Journey"
    ],
    content_easy_markdown: `# Wireless LANs — Wi-Fi Collisions and Access Points

## How it started
Radios cannot "hear and talk" the way a wired Ethernet NIC detects collisions on a cable. Early wireless LANs needed a different politeness protocol and a way to connect laptops to the existing Ethernet world. **Wi-Fi (IEEE 802.11)** standardized **CSMA/CA**, link-layer ACKs, and the **Access Point (AP)** as the bridge most people use every day.

## The simple idea
**Shared channel:** if two stations transmit at once, the AP may hear garbage — a collision in effect, even if senders cannot detect it mid-air the wired way.

**CSMA/CA intuition:**
1. Listen (carrier sense). If busy, wait.
2. Use random backoff to reduce overlap.
3. Transmit frame.
4. Wait for **ACK** from receiver; if no ACK, assume loss and retry.
5. Rate control may slow modulation if the channel is messy.

**Access Point:** clients **associate** to an AP; the AP bridges to Ethernet (and usually to your IP router/NAT). Your phone's MAC talks to the AP's radio; the AP may use Ethernet MACs toward the wired LAN.

## Step-by-step: join home Wi-Fi
1. Scan for SSIDs / beacons.
2. Authenticate/associate (open, WPA2/WPA3-PSK, enterprise 802.1X — details in security unit).
3. Often DHCP for an IP (Unit 5).
4. ARP for gateway.
5. Data frames flow; AP ACKs; wired side continues as Ethernet switching/routing.

Hidden terminals (A sees AP, B sees AP, A/B cannot hear each other) make collisions worse — RTS/CTS exists as an optional mitigation.

## Real analogy
A dark classroom where students shout answers:
- They try not to talk over each other (carrier sense + backoff).
- Teacher nods (ACK) if the answer was heard.
- No nod → repeat louder/slower (retry / lower rate).
- Teacher (AP) relays to the hallway Ethernet world.

## Worked example
Streaming video feels fine near the AP, awful two rooms away:
- PHY rate drops; airtime per byte rises.
- Retries add delay jitter (**Delay Lab** thinking).
- Throughput collapses even though "Wi-Fi connected" bars look okay.
- Ethernet backhaul to the ISP may be fine — bottleneck is the radio hop.

Packet Journey's first hop on a laptop is often this Wi-Fi hop before the home router.

## Common mistakes
- Blaming "the Internet" when only the radio hop is bad.
- Assuming Wi-Fi bandwidth is like a dedicated Ethernet full-duplex pipe to each client — airtime is shared.
- Ignoring interference (neighbors, microwaves, DFS radar events).
- Confusing SSID name with security quality.
- Thinking more bars always means more TCP goodput.

## Check yourself
1. Why CSMA/CA not CD for Wi-Fi?
   - Answer: stations generally cannot reliably detect mid-air collisions like on a wire; ACKs/retries used instead.
2. What device bridges Wi-Fi clients to Ethernet?
   - Answer: the Access Point (often combined in a home gateway).
3. What does a missing ACK cause?
   - Answer: link-layer retry (and possible rate drop), increasing delay and reducing throughput.

## See it
**Packet Journey**: treat Laptop→Router as potentially a Wi-Fi hop with retries invisible to IP. **Delay Lab**: retries ≈ extra delay. **Throughput** intuition from Unit 2: airtime is the scarce resource. **HTTP/DNS** labs still work over Wi-Fi — failures may be local RF, not server-side.
`,
    content_deep_markdown: `# 802.11 Mechanisms (Deep)

## Channel access
DCF/EDCA, contention windows, IFS timings. Collision domains are spatial and frequency-based. OFDMA/MU-MIMO in modern amendments improve multi-user efficiency.

## Frame types
Management (beacons, assoc), control (ACK, RTS/CTS), data. Aggregation (A-MPDU) amortizes overhead at high rates.

## Rate adaptation
Algorithms pick MCS based on loss; wrong choices tank goodput. Duty cycle of management frames matters in dense SSIDs.

## Security handshake preview
4-way handshake installs keys; unencrypted management historically problematic (improvements ongoing). Evil twin APs are a threat model.

## Failure modes
- Hidden/exposed terminals.
- Sticky clients associated to far AP.
- Channel width / interference misconfig.
- Captive portals and DNS interception surprises.

## Numbers
20/40/80/160 MHz channels; airtime fairness debates; tens of ms RTT spikes under retry storms common on bad links. UDP/TCP see loss differently — TCP congestion reacts to Wi-Fi loss sometimes too aggressively.

## Interview tip
"Wi-Fi uses CSMA/CA with ACKs because collision detection mid-air is impractical; APs bridge to Ethernet; performance is airtime- and interference-dominated."

## Practice
Explain why a 600 Mbps PHY link can deliver far less TCP throughput with weak signal and many retries.

## Quantitative intuition
If a frame needs average 3 transmissions because of corruption, airtime cost triples and TCP goodput collapses more than "one third" once backoff and TCP congestion reactions stack. Cutting PHY rate from 300 Mbps to 50 Mbps to improve reliability may raise application throughput if retries vanish — counterintuitive but common.

## Design trade-offs
Wider channels raise peak rates and interference footprints. More APs improve coverage and increase co-channel contention if channels are poorly planned. Forcing a minimum rate can clear airtime of ultra-slow clients at the cost of edge coverage.

## Operational debugging checklist
1. RSSI/SNR and retry counters before blaming the WAN.
2. Channel utilization and neighboring SSIDs.
3. Sticky client associated to a distant AP?
4. DHCP/DNS working — confirm failure is really RF.
5. Compare Ethernet performance on the same service as a control.

## Exam and interview phrasing
"Wi-Fi shares RF with CSMA/CA and ACKs; APs bridge to Ethernet. Real performance is airtime, interference, and retries — not just the marketing PHY rate."
`,
  }),

  lesson({
    title: "From Home Wi-Fi to Cellular — Mobility Intuition",
    titleMatch: "From Home Wi-Fi%",
    importance_level: "Essential",
    breadcrumb_path: BC,
    first_principles: [
      "Mobility means the point of attachment to the network can change while apps keep running",
      "Home Wi-Fi mobility inside one LAN often keeps the same IP via the same gateway",
      "Roaming across APs may need fast re-association and sometimes DHCP renew",
      "Cellular systems manage handoffs across base stations under operator control",
      "Apps experience mobility as RTT/loss changes, not as magic continuous cables"
    ],
    learning_objectives: [
      "Contrast staying on one home SSID vs moving across networks",
      "Explain why changing networks often changes IP and breaks naive connections",
      "Describe cellular handoff at intuition level",
      "Relate mobility to transport and app resilience (TCP/QUIC)",
      "Connect home lab intuition to real multi-network life"
    ],
    content_easy_markdown: `# From Home Wi-Fi to Cellular — Mobility Intuition

## How it started
Early networks assumed hosts stayed plugged in. Laptops and phones broke that assumption: you walk from desk to kitchen, then leave home and your phone switches to **cellular**. Networking had to explain what stays the same (app sessions, names) and what must change (link, often IP, sometimes path). This lesson builds **mobility intuition** without drowning in 3GPP specs.

## The simple idea
Three mobility "distances":

1. **Same AP, you move a few meters** — same association; rate adaptation may change; IP usually same.
2. **Same SSID, different AP (roam)** — re-associate; enterprise networks optimize fast roam; DHCP may or may not renew; IP often kept on same L2/L3 design.
3. **Different network (home Wi-Fi → LTE/5G)** — new link, new gateway, **new IP**; old TCP sockets bound to old address break unless the app reconnects or uses mobility-aware tricks.

Cellular operators run a managed radio access network: as you drive, the phone **handoffs** between base stations while the operator updates tunnels/anchors so your sessions can survive more often than a naive Wi-Fi flip.

## Step-by-step: leave home with video playing
1. On Wi-Fi: NAT public mapping via home router (Unit 5); TCP/QUIC to CDN.
2. Signal fades; OS may switch to cellular.
3. New interface, new address, new NAT in the operator network.
4. Old socket paths fail; player **retries** — DNS may run again; new TCP/QUIC.
5. You experience a hiccup, not a physics-defying continuous IP.

Hero apps assume reconnects. Heroes debugging assume **which interface won**.

## Real analogy
Working from a cafe:
- Moving tables under the same cafe Wi-Fi ≈ roaming in one network.
- Leaving to the subway cellular ≈ changing ISPs mid-sentence — your "phone number at the cafe" (IP) no longer rings there.

Postal forwarding helps some cellular designs; cafe Wi-Fi rarely forwards your old address to the train.

## Worked example
MustAcademy labs on home Wi-Fi:
- **Packet Journey** path starts Laptop → Home Router → ISP…
- On cellular, first hop is operator UE→base station→core, then Internet — different control planes (including mobility management).
- **DNS** and **HTTP** still apply at the edge; RTT and loss profiles differ (bufferbloat on either is possible).
- **TCP** congestion control adapts; a sudden path change can look like heavy loss.

## Common mistakes
- Believing IP addresses are permanent identity for phones.
- Blaming the video server when the handoff dropped local state.
- Assuming Wi-Fi calling / VoIP survives every roam without special design.
- Ignoring that VPNs (Unit 8) can mask IP changes at the cost of battery and MTU.
- Thinking cellular "has no MAC/IP" — it has its own layered stack under IP.

## Check yourself
1. What often changes when you move from home Wi-Fi to cellular?
   - Answer: link technology, gateway, public IP / NAT mapping; sockets may break.
2. Is roaming between APs on one campus the same as switching to LTE?
   - Answer: No — roaming can keep one enterprise design; cellular is a different operator network.
3. Why do apps reconnect after network switches?
   - Answer: Transport endpoints tied to old addresses/paths no longer work cleanly.

## See it
Re-run **Packet Journey** mentally with "cellular first hop." Use **Delay Lab** to imagine RTT jumping after a handoff. **DNS Lookup** may repeat on reconnect. **TCP Handshake** lab = what apps redo. **NAT** appears in both home and carrier-grade forms — mobility multiplies mapping churn.
`,
    content_deep_markdown: `# Mobility Across Wi-Fi and Cellular (Deep)

## Address anchoring vs reconnect
Mobile IP historical ideas vs today's app-level reconnect and QUIC connection migration (limited cases). Most web apps simply open new connections.

## Wi-Fi roaming
802.11r/k/v assist fast BSS transition; sticky client problems; controller-based enterprise WLANs centralize decision making (SDN-ish flavors).

## Cellular handoff (intuition)
Radio measurement → target cell → user-plane path update in the core (SGW/UPF analogs depending on generation). Voice and data may take different paths (IMS). Latency budgets are engineered; failures become dropped calls / stalling.

## Middleboxes
CGNAT, firewalls, and stateful TCP timers interact badly with long dormancy and IP changes. Keepalives and push channels exist for a reason.

## Failure modes
- Blackhole routes during handoff windows.
- MTU changes breaking PMTUD.
- Captive portal on guest Wi-Fi vs seamless cellular.
- Policy routing (Wi-Fi assist) flipping interfaces under load.

## Numbers
Inter-AP roam targets often tens of ms for voice; Wi-Fi↔cellular make-before-break varies by OS. TCP RTO after a path change can pause apps for a second-scale stall if not aborted.

## Interview tip
"Local Wi-Fi roam may keep IP; moving to cellular usually changes IP and breaks sockets; cellular handoffs are operator-managed; apps should tolerate reconnects."

## Practice
List five layers/components that change when a phone leaves home Wi-Fi for LTE, from radio to HTTP.

## Quantitative intuition
A make-before-break handoff aiming for <50 ms media gap still collides with TCP RTOs of hundreds of ms if the old path blackholes without aborting sockets. Apps that hard-fail after one RTT timeout feel "broken" on mobility; apps that retry with backoff feel "resilient." Carrier RTT may be 30–70 ms in good conditions and much worse at cell edge — Delay Lab instincts transfer.

## Design trade-offs
Always-on VPN across mobility smooths IP changes for some apps and burns battery/MTU headroom. OS "Wi-Fi assist" improves availability and complicates debugging which interface carried a flow. Keeping large L2 stretched networks for mobility eases addresses and worsens failure domains.

## Operational debugging checklist
1. Which interface and public IP does the OS show now?
2. Did the app reconnect or stall on an old socket?
3. Captive portal on the new Wi-Fi?
4. Compare against cellular-only and Wi-Fi-only tests.
5. Check whether DNS results differ per network (CDN steering).

## Exam and interview phrasing
"Moving within one Wi-Fi domain may keep your IP; moving to cellular usually changes attachment and address. Cellular handoffs are operator-managed; applications must tolerate reconnects."
`,
  }),
];
