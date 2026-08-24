import { lesson } from "./helper.mjs";

const BC = "CS 411 > Unit 5: Network Data Plane";

export const topics = [
  lesson({
    title: "Forwarding vs Routing — Two Jobs of the Network Layer",
    titleMatch: "Forwarding vs Routing%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 5: Network Data Plane",
    first_principles: [
      "Forwarding is the per-packet data-plane action of choosing an output port",
      "Routing is the control-plane process that builds forwarding tables",
      "Routers use longest-prefix match on destination IPs",
      "End hosts usually send non-local traffic to a default gateway",
      "Correct forwarding with stale routing still blackholes traffic during failures"
    ],
    learning_objectives: [
      "Define forwarding vs routing clearly",
      "Explain longest-prefix match at intuition level",
      "Describe the role of a default route",
      "Relate control plane failures to data plane symptoms",
      "Use Routing Path lab language for next hops"
    ],
    content_easy_markdown: `# Forwarding vs Routing — Two Jobs of the Network Layer

## How it started
As soon as networks interconnected, devices needed two complementary skills: **decide how tables should look** (routing) and **use those tables at wire speed** (forwarding). Mixing the words is the most common exam mistake in networking — so we separate them deliberately.

## The simple idea
- **Forwarding (data plane)**: a packet arrives; look up destination; send out the right interface. Happens millions of times per second.
- **Routing (control plane)**: exchange information / run algorithms so the forwarding tables stay correct as links fail and policies change. Happens on a slower timescale.

Analogy refresh: sorting bags now (forwarding) vs rewriting the destination wall chart after a storm (routing).

## Step-by-step: a packet at a router
1. Receive frame; extract IP packet.
2. Decrement TTL/hop limit; drop if zero.
3. Longest-prefix match in the forwarding table (FIB).
4. Determine next hop / output port.
5. Encapsulate in the appropriate link header for that hop.
6. Queue and transmit.

The host that originated the packet typically only knew "send to my gateway" — the core figures the rest hop by hop.

## Real analogy
GPS recalculating a city route (routing/control) vs turning your steering wheel at each intersection based on the current highlighted path (forwarding/data).

## Worked example
Table says:
- \`10.0.0.0/8\` → port A
- \`10.1.2.0/24\` → port B
Packet to \`10.1.2.9\` matches both, but **/24 is longer** → port B. That is longest-prefix match.

## Common mistakes
- Using "routing" for every lookup.
- Thinking hosts run full Internet routing tables (they usually don't).
- Ignoring TTL's role against loops.
- Assuming forwarding is correct while BGP/OSPF is broken — tables go stale.

## Check yourself
1. Which is per-packet and must be fast?
   - Answer: forwarding.
2. What is longest-prefix match?
   - Answer: choose the most specific matching prefix in the table.
3. What does a default route do?
   - Answer: catch destinations not matched by more specific prefixes (often 0.0.0.0/0).

## See it
Open the **Routing Path** lab and narrate next hops. Then remember Packet Journey: each hop is a forwarding action fed by prior routing decisions.`,
    content_deep_markdown: `# Data Plane vs Control Plane (Deep)

## FIB vs RIB
Routing information bases compute candidates; FIB is optimized for lookups. Hardware pipelines implement match-action forwarding.

## Control protocols preview
IGP (OSPF/IS-IS) inside AS; BGP between ASes. Convergence delays cause transient loops/blackholes.

## Policy
Forwarding can implement ACLs/QoS — still data plane, but control systems install the rules.

## Failure cases
- Blackhole routes, recursion errors, next-hop unreachable.
- Asymmetric routing surprising stateful firewalls.
- TCAM exhaustion / aggregation mistakes.

## Interview tip
Open with the one-liner definition pair; then give longest-prefix match example.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "Forwarding vs Routing — Two Jobs of the Network Layer", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "Forwarding vs Routing — Two Jobs of the Network Layer" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "Inside a Router — Match, Switch, Forward",
    titleMatch: "Inside a Router%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 5: Network Data Plane",
    first_principles: [
      "Routers have input ports, a switching fabric, and output ports",
      "Match on headers decides where a packet goes",
      "Output ports queue when the fabric or link is busy",
      "Modern routers use specialized hardware for line-rate forwarding",
      "Control plane CPU is separate from high-speed forwarding paths"
    ],
    learning_objectives: [
      "Sketch input → fabric → output architecture",
      "Explain where queuing typically occurs",
      "Describe match-action at a high level",
      "Relate router internals to delay components",
      "Separate slow-path exceptions from fast-path forwarding"
    ],
    content_easy_markdown: `# Inside a Router — Match, Switch, Forward

## How it started
Early routers were basically computers with multiple network cards running software lookups. As link speeds exploded, architects built **match → switch → forward** pipelines with hardware assistance so packets do not wait on a general-purpose CPU for every hop.

## The simple idea
A router is an assembly line:
1. **Input port**: receive bits, decapsulate link headers, start lookup.
2. **Match**: find the forwarding action (output port / next hop / drop).
3. **Switching fabric**: move the packet to the chosen output.
4. **Output port**: queue if needed, encapsulate, transmit.

If many inputs target one output, **queues** form — Unit 2 delays live here.

## Step-by-step: life of one packet inside
1. Arrives on input interface 2.
2. Header fields matched against FIB / TCAM rules.
3. Action: "output 5, next hop 10.0.0.1."
4. Fabric transfers packet to output 5's queue.
5. Scheduler drains queue onto the link.
6. Exceptions (options, traceroute TTL expire) may punt to control-plane CPU (slow path).

## Real analogy
Airport baggage: unload plane (input), read tag (match), conveyor network (fabric), load outbound flight (output). Overloaded outbound flights create piles (queues). VIP exception bags go to a human agent (slow path).

## Worked example
4×100 Gbps inputs and 1×100 Gbps output toward a popular peering link → fabric/output congestion even if average traffic elsewhere is low. Performance is about *hot* ports, not only aggregate chassis capacity.

## Common mistakes
- Believing "router CPU %" always explains packet slowdowns (fast path may be fine).
- Ignoring output queuing as the main delay source.
- Thinking every packet is processed in deep software.
- Confusing L2 switches with L3 routers (related fabrics, different headers).

## Check yourself
1. Name the three big stages.
   - Answer: match (lookup), switch (fabric), forward (output transmit).
2. Where do packets wait when busy?
   - Answer: typically output queues (also input/fabric in some designs).
3. What is a slow path?
   - Answer: exception processing by control-plane CPU.

## See it
**Delay Lab** queues are a simplified output queue. **Routing Path** shows the match result (which next hop). Together they are the cartoon of this lesson.`,
    content_deep_markdown: `# Router Architecture (Deep)

## Fabrics
Shared bus (old), crossbar, clos fabrics in chassis. Internal speedups reduce HOL blocking.

## Match-action and SDN lineage
OpenFlow popularized explicit match-action; merchant silicon implements rich parsers. ACLs + FIB + QoS classifications compete for TCAM.

## Scheduling
FIFO, priority queues, fair queuing variants — who gets the link when congested.

## Failure cases
- Microbursts overflowing shallow buffers.
- Fabric oversubscription asymmetries.
- Control-plane policers dropping critical ICMP/BGP when under attack.

## Interview tip
Sketch ports + fabric + queues; mention fast path vs slow path once.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "Inside a Router — Match, Switch, Forward", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "Inside a Router — Match, Switch, Forward" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "IP Addressing and Subnets",
    titleMatch: "IP Addressing%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 5: Network Data Plane",
    first_principles: [
      "An IP address identifies an interface on a network, not 'a person'",
      "A subnet mask / prefix splits the address into network vs host parts",
      "Same subnet can talk locally; other networks need a router/gateway",
      "Longer prefix = smaller network = fewer host addresses",
      "Private RFC1918 ranges need NAT (or proxy) to reach the public Internet"
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
Early networks used ad-hoc host names and flat numbering. As the Internet grew, we needed hierarchical addresses so routers could summarize "this whole neighborhood is that way." IPv4's 32-bit addresses and later CIDR (Classless Inter-Domain Routing) replaced rigid classful rules with flexible prefixes like /24 or /16.

## The simple idea
An **IPv4 address** is 32 bits, usually written as four decimal numbers 0–255 (dotted quad), e.g. \`192.168.1.42\`.

\`192.168.1.42/24\` means:
- **First 24 bits** = network (the street)
- **Last 8 bits** = host (the house number)

Devices with the **same network portion** are on the same subnet and can usually talk directly (ARP/ND on the LAN). Different network portions → send to a **router** (your gateway).

IPv6 uses 128-bit addresses and the same prefix idea (e.g. \`2001:db8::1/64\`), covered more in the IPv6 lesson.

## Step-by-step: using a subnet
1. Your interface gets an IP + prefix (DHCP or static), e.g. 10.0.0.50/24.
2. You also learn a default gateway, e.g. 10.0.0.1.
3. To reach 10.0.0.80: same /24 → local delivery.
4. To reach 8.8.8.8: different network → send to the gateway.
5. The gateway routes toward the destination; your host does not need the full path.

## Real analogy
Street name + house number. The \`/xx\` prefix says where the street name ends and the house number begins. Mail trucks (routers) move between streets; within one street, neighbors talk more directly.

## Worked example
Network \`192.168.1.0/24\`:
- Network address: 192.168.1.0
- Broadcast (IPv4): 192.168.1.255
- Usable hosts: 192.168.1.1 – 192.168.1.254 (254 addresses)
- \`/16\` is a much larger block; \`/30\` is tiny (often used on point-to-point links).

Private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) are common at home/enterprise and usually need **NAT** for public Internet access.

## Common mistakes
- Treating the suffix after \`/\` as "number of hosts" directly without computing 2^(32-prefix).
- Forgetting network/broadcast reservations in IPv4 sizing questions.
- Mis-set masks causing "same LAN" devices to think they need a router.
- Assuming private addresses are globally unique — they are not.

## Check yourself
1. What does /24 mean on IPv4?
   - Answer: 24 network bits, 8 host bits.
2. When do you need a gateway?
   - Answer: when the destination is outside your subnet/prefix.
3. Are 10.x addresses public?
   - Answer: no — private RFC1918 space.

## See it
Open the **IP Address Anatomy** lab. Move the prefix slider. Watch network bits, host bits, and usable hosts change. Say out loud what /24 vs /16 means.`,
    content_deep_markdown: `# Addressing and CIDR (Deep)

## CIDR aggregation
Advertisements use prefixes; longer = more specific. Traffic engineering depends on careful aggregation vs specificity.

## Subnet design
Alignment on bit boundaries; leaf/spine data centers; /31 or /30 for p2p; IPv6 /64 LAN convention.

## Lookups
Longest-prefix match ties addressing to forwarding. Mistakes in mask length create blackholes or asymmetric reachability.

## Failure cases
- Overlapping private space after mergers/VPNs.
- Bogon routing of unallocated space.
- Off-by-one in usable host counts on exams.

## Interview tip
Given IP/mask, compute network, broadcast, usable range quickly — still a common screen.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "IP Addressing and Subnets", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "IP Addressing and Subnets" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "DHCP — Getting an Address Automatically",
    titleMatch: "DHCP%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 5: Network Data Plane",
    first_principles: [
      "DHCP dynamically assigns IP configuration to hosts",
      "Typical lease includes address, mask/prefix, gateway, and DNS servers",
      "DORA describes the common IPv4 exchange: Discover, Offer, Request, Ack",
      "Leases expire; renewals keep addresses stable while connected",
      "Rogue DHCP servers can disrupt a LAN"
    ],
    learning_objectives: [
      "Explain why DHCP exists",
      "List the key parameters a lease provides",
      "Describe DORA steps at a high level",
      "Relate DHCP to edge connectivity problems",
      "Contrast static addressing vs dynamic leases"
    ],
    content_easy_markdown: `# DHCP — Getting an Address Automatically

## How it started
Manually typing IP, mask, gateway, and DNS on every machine does not scale — and typos break networks. **DHCP** (Dynamic Host Configuration Protocol) lets hosts request a lease automatically when they join a network.

## The simple idea
When your laptop joins Wi-Fi, it often:
1. Asks: "Is there a DHCP server? I need an address."
2. Receives an **offer** with a candidate IP and settings.
3. **Requests** that offer.
4. Gets an **ACK** lease.

This DORA dance (Discover–Offer–Request–Ack) is the IPv4 story you should remember. The lease includes at least: IP address, subnet mask/prefix, default gateway, DNS servers, and a lifetime.

## Step-by-step: first join vs renew
**First join (simplified):** broadcast discover → offers → request → ack.
**Renew:** unicast to the DHCP server before expiry to keep the same address when possible.
If renew fails and lease expires, the host must stop using the address and start over.

## Real analogy
Hotel check-in. You don't carve a permanent room number into your suitcase. The front desk (DHCP) assigns a room (IP) for your stay (lease), tells you where the elevators/exit are (gateway) and the city map desk (DNS). Stay longer → renew.

## Worked example
Home router runs DHCP for 192.168.1.0/24, gateway 192.168.1.1, DNS 192.168.1.1 or 1.1.1.1. Your phone gets 192.168.1.42 until it leaves. Enterprise DHCP may also push NTP servers, domain search lists, or PXE options for boot.

## Common mistakes
- Two DHCP servers fighting on one LAN (rogue AP/router).
- Exhausted pools → devices fail to join.
- Wrong gateway/DNS in the lease → "connected but no Internet."
- Confusing link-local APIPA addresses (169.254/16) with successful DHCP.

## Check yourself
1. What does DORA stand for?
   - Answer: Discover, Offer, Request, Ack.
2. Name three lease fields.
   - Answer: e.g., IP, mask, gateway (DNS also common).
3. What happens when a lease expires without renew?
   - Answer: host must stop using the address and rediscover.

## See it
After DHCP, **IP Address Anatomy** becomes personal — the prefix in your lease defines your subnet. Packet Journey's first hop is usually the gateway DHCP gave you.`,
    content_deep_markdown: `# DHCP Operations (Deep)

## Lease state machine
Allocation, renewal timers T1/T2, rebinding. Relays (ip helper) for servers off-subnet.

## Security
Rogue DHCP, DHCP snooping in enterprises, starvation attacks. Authentication is limited historically.

## IPv6 note
SLAAC vs DHCPv6 — different common patterns; know that IPv4 DORA is not the whole story worldwide.

## Failure cases
- Split pools after Wi-Fi roaming across VLANs without proper design.
- Stale static reservations colliding with dynamic pool.
- DNS options pointing at dead resolvers.

## Interview tip
Explain DORA + lease contents + symptom "APIPA/169.254 means DHCP failed."

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "DHCP — Getting an Address Automatically", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "DHCP — Getting an Address Automatically" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "NAT — Many Devices, One Public IP",
    titleMatch: "NAT%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 5: Network Data Plane",
    first_principles: [
      "NAT translates addresses (and usually ports) between private and public realms",
      "Home routers commonly share one public IPv4 address among many devices",
      "NAT is a middlebox that breaks the pure end-to-end address model",
      "Inbound connections require mappings, port forwards, or hole punching",
      "Carrier-grade NAT multiplies the same issues at ISP scale"
    ],
    learning_objectives: [
      "Explain why NAT became widespread with IPv4 scarcity",
      "Describe source NAT for outbound connections",
      "Reason about why inbound connections are hard",
      "List application impacts (P2P, hosting games, some VPNs)",
      "Relate NAT to private addressing lessons"
    ],
    content_easy_markdown: `# NAT — Many Devices, One Public IP

## How it started
IPv4 addresses are scarce. Homes and offices still needed many devices online. **Network Address Translation (NAT)** — especially NAPT (address+port translation) — let a whole household share **one public IPv4 address**. It worked operationally so well that it became permanent infrastructure, not a temporary hack.

## The simple idea
Inside: private addresses (\`192.168.x.x\`, \`10.x.x.x\`, …).
Outside: one (or few) public addresses.

When your laptop sends to the Internet:
1. NAT router rewrites the **source** private IP:port to its **public** IP:port.
2. It remembers a mapping in a table.
3. Replies to that public IP:port are translated back to your laptop.

To the server, it looks like the router itself is talking.

## Step-by-step: outbound browsing
1. Host 192.168.1.50:52000 → 93.184.216.34:443
2. NAT maps to 203.0.113.8:62000 → 93.184.216.34:443
3. Server replies to 203.0.113.8:62000
4. NAT rewrites to 192.168.1.50:52000
5. Mapping expires after idle timeout if unused

Inbound: if no mapping/port-forward exists, unsolicited packets are usually dropped — great for casual security, bad for hosting services without setup.

## Real analogy
An office receptionist. Inside extensions (private IPs) share one public phone number. Outbound calls show the main number; the receptionist remembers who dialed. Random people calling the main number cannot reach an extension unless a rule exists (port forward) or someone inside called out first (mapping).

## Worked example
Hosting a game server at home requires port forwarding or UPnP to create inbound mappings. Two gamers behind strict NATs may need a relay server — classic NAT traversal problem. Web browsing works because *you* start the conversation outbound.

## Common mistakes
- Thinking NAT is a firewall substitute (related but not identical).
- Forgetting port translation — many devices cannot all use the same external port mapping.
- Assuming public IPv6 makes NAT irrelevant everywhere (dual-stack realities vary).
- Debugging "server unreachable" without checking if you're behind CGNAT.

## Check yourself
1. What does NAT typically translate on home routers?
   - Answer: private source IP:port ↔ public IP:port.
2. Why do inbound connections fail by default?
   - Answer: no mapping for unsolicited packets.
3. Why did NAT spread?
   - Answer: IPv4 scarcity + easy sharing of one public address.

## See it
In **Packet Journey**, imagine the home-router hop rewriting your private source address before ISP transit. IP labs show private prefixes; this lesson explains how they still reach public servers.`,
    content_deep_markdown: `# NAT Types and Traversal (Deep)

## NAPT tables
Keyed by 5-tuples; endpoint-independent vs dependent behaviors affect hole punching. Hairpin NAT for LAN-to-LAN via public mapping.

## CGNAT
ISPs share public IPv4 across customers — breaks inbound further; motivates IPv6.

## Application impact
Web/client-server OK; P2P harder; WebRTC uses STUN/TURN; VPNs interact with NAT timeouts.

## Failure cases
- Table exhaustion under many connections.
- Asymmetric multi-WAN NATs.
- Broken ALGs rewriting payloads incorrectly.

## Interview tip
Draw private host → NAT → public server with table entry; mention inbound asymmetry.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "NAT — Many Devices, One Public IP", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "NAT — Many Devices, One Public IP" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "IPv6 — The Next Address Space",
    titleMatch: "IPv6%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 5: Network Data Plane",
    first_principles: [
      "IPv6 uses 128-bit addresses to solve IPv4 exhaustion",
      "IPv6 notation uses hex groups and :: compression",
      "Prefix lengths still define subnets; /64 is common on LANs",
      "IPv6 often coexists with IPv4 (dual-stack) rather than flipping a switch",
      "Neighbor Discovery replaces ARP concepts for local delivery"
    ],
    learning_objectives: [
      "Explain why IPv6 exists",
      "Read a simple IPv6 address with :: compression",
      "Compare subnetting mindset to IPv4 CIDR",
      "Describe dual-stack coexistence at a high level",
      "List what changes for hosts (RA/SLAAC/DHCPv6 intuition)"
    ],
    content_easy_markdown: `# IPv6 — The Next Address Space

## How it started
IPv4's ~4 billion addresses were not enough for a planet of phones, sensors, and always-on devices — especially with inefficient historical allocations. **IPv6** expands addresses to 128 bits and modernizes some neighbor/local auto-configuration behaviors. Deployment is gradual via **dual-stack** and translation transition tools.

## The simple idea
IPv6 address example: \`2001:db8:85a3::8a2e:370:7334\`

- Eight groups of hex digits (when fully written).
- \`::\` compresses one run of zeros.
- Prefixes still matter: \`2001:db8::/32\` is a block; LAN interfaces often get \`/64\`.

Hosts still need: an address, a way to find on-link neighbors, and a default router — but mechanisms differ (Router Advertisements, SLAAC, optional DHCPv6).

## Step-by-step: dual-stack browsing
1. DNS may return A (IPv4) and AAAA (IPv6).
2. Client may prefer IPv6 when available (Happy Eyeballs algorithms race wisely).
3. Packets forward with IPv6 headers end-to-end if the path supports it.
4. If IPv6 fails, fall back to IPv4.
5. Servers and CDNs must publish and operate both for full coverage.

## Real analogy
IPv4 is a city that ran out of street numbers and invented complicated shared mailboxes (NAT). IPv6 builds a much larger city with abundant numbers so every house can have a globally unique address again — but moving everyone takes years, so both cities run bridges for a while.

## Worked example
Home dual-stack: devices have \`192.168.1.x\` *and* a global IPv6 address. Some apps use v6 to a CDN; others still v4. A misconfigured firewall allowing v4 but blocking v6 leads to confusing intermittent failures — always test both.

## Common mistakes
- Thinking IPv6 is "just more bits" with zero operational change.
- Broken \`::\` compression (only one \`::\` allowed).
- Assuming NAT is required on IPv6 like home IPv4 (usually not the same pattern).
- Ignoring that security policy must be rewritten for v6 paths.

## Check yourself
1. How wide is an IPv6 address?
   - Answer: 128 bits.
2. What does \`::\` do?
   - Answer: compresses one contiguous run of zero groups.
3. What is dual-stack?
   - Answer: running IPv4 and IPv6 together during coexistence.

## See it
Use **IP Address Anatomy** for IPv4 intuition, then remember IPv6 keeps prefixes but enlarges the space. DNS lab AAAA answers are the naming side of this story.`,
    content_deep_markdown: `# IPv6 Deployment Reality (Deep)

## Header simplification
Fixed basic header; extension headers for options. Fragmentation differences vs IPv4.

## ND and addressing
Neighbor Discovery, RA flags, privacy extensions (temporary addresses), link-local \`fe80::/10\`.

## Transition
Dual-stack, NAT64/DNS64, tunneling. Enterprises linger on IPv4+NAT; mobile and data centers often lead IPv6.

## Failure cases
- RA forgery without RA-guard.
- MTU/PMTUD issues with ICMPv6 filtered.
- Apps incorrectly assuming IPv4-only literals.

## Interview tip
Motivate with exhaustion + NAT pain; mention /64 LANs and dual-stack Happy Eyeballs.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "IPv6 — The Next Address Space", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "IPv6 — The Next Address Space" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "Middleboxes and the IP Hourglass",
    titleMatch: "Middleboxes%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 5: Network Data Plane",
    first_principles: [
      "The IP hourglass says many apps and many links share a narrow IP waist",
      "Middleboxes (NAT, firewalls, load balancers, proxies) sit in the path and modify or filter",
      "Middleboxes improve operations/security but complicate the end-to-end principle",
      "Protocol ossification happens when middleboxes assume old packet shapes",
      "QUIC/HTTP3 and encrypted transports partly respond to middlebox reality"
    ],
    learning_objectives: [
      "Draw the IP hourglass idea (apps above, links below, IP in the middle)",
      "Define middlebox with examples",
      "Explain tension with the end-to-end principle",
      "Give one ossification example motivating QUIC",
      "Adopt a debugging habit that includes 'what middlebox rewrote this?'"
    ],
    content_easy_markdown: `# Middleboxes and the IP Hourglass

## How it started
The Internet's brilliant architecture is often drawn as an **hourglass**: many applications on top, many link technologies at the bottom, and a narrow waist — **IP** — in the middle. That thin waist let the network scale. Over time, operators inserted **middleboxes** (NAT, firewalls, load balancers, caches, WAFs) to add security, sharing, and performance. They help — and they change the rules.

## The simple idea
**Hourglass:** innovate freely at apps and at links as long as you speak IP in the middle.

**Middleboxes:** devices that are not pure IP forwarders — they inspect, filter, rewrite, terminate, or accelerate traffic.

Examples you already met:
- NAT rewriting addresses/ports
- Firewalls dropping ports
- CDN reverse proxies terminating TLS
- Load balancers steering connections

The **end-to-end principle** prefers putting functions at endpoints; middleboxes move functions into the network for practical reasons.

## Step-by-step: debugging with middleboxes in mind
1. Symptom: app fails.
2. Ask: did a firewall block the port?
3. Ask: did NAT prevent inbound?
4. Ask: did a proxy break an unexpected header?
5. Ask: does TCP work while a new UDP protocol fails? (ossification clue)
6. Tooling: compare direct path vs via corporate proxy; check both DNS views.

## Real analogy
Hourglass = many drinks (apps) and many cup shapes (links) sharing one funnel neck (IP). Middleboxes are extra filters and flavor injectors screwed into the funnel. Refreshing sometimes — until a new drink formula clogs a filter designed for yesterday's soda (ossification).

## Worked example
A custom TCP option works in the lab but vanishes on the Internet because a middlebox strips unknown options. Designers move innovation to encrypted UDP (QUIC) where middleboxes cannot meddle as easily — at the cost of less intermediate visibility.

## Common mistakes
- Believing pure end-to-end still describes every enterprise path.
- Ignoring that "ping works" does not mean "middlebox allows your app protocol."
- Assuming more middleboxes always mean more security (complexity can add failure modes).
- Forgetting CDNs and load balancers are on-path entities that change what "the server IP" means.

## Check yourself
1. What sits at the hourglass waist?
   - Answer: IP.
2. Name three middleboxes.
   - Answer: e.g., NAT, firewall, load balancer (CDN proxy also fine).
3. What is ossification?
   - Answer: network intermediaries freezing old protocol assumptions, blocking evolution.

## See it
Look back across CS 411 labs — Packet Journey, OSI Stack, TCP Handshake, DNS, IP Anatomy, Routing Path, Delay/Throughput. Real paths add middleboxes between those cartoon hops. A hero's final skill: explain the clean architecture *and* the messy middlebox Internet we actually run.`,
    content_deep_markdown: `# Architecture Tensions (Deep)

## End-to-end principle
Keep the core simple; add reliability/policy at endpoints when possible. Reality: compliance, DDoS defense, and IPv4 scarcity pushed functions inward.

## Ossification and evolution
TCP option stripping, UDP blocking, DPI assumptions. Encrypted transports reduce visibility for operators — new measurement/telemetry debates.

## Performance middleboxes
PEP, compression proxies, split TCP on satellite — help some metrics, break others (end-to-end sec, authenticity).

## Failure cases
- Asymmetric firewall state.
- Proxy certificate interception breaking pinning.
- Load balancer health checks masking real client IPs (X-Forwarded-For realities).

## Interview tip
Draw the hourglass; list middleboxes; explain one way they both enable and hinder evolution (NAT vs QUIC story).

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "Middleboxes and the IP Hourglass", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "Middleboxes and the IP Hourglass" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),
];
