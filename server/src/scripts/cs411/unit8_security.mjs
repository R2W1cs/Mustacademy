import { lesson } from "./helper.mjs";

const BC = "CS 411 > Unit 8: Network Security";

export const topics = [
  lesson({
    title: "Threats on the Wire — Sniffing, Spoofing, DoS",
    titleMatch: "Threats on the Wire%",
    importance_level: "Critical",
    breadcrumb_path: BC,
    first_principles: [
      "Networks move bits through shared and intermediary systems that may be hostile",
      "Sniffing is unauthorized observation of traffic",
      "Spoofing is forging identity fields (IP, MAC, DNS, email, …)",
      "Denial of Service aims to exhaust resources so legitimate users fail",
      "Security goals include confidentiality, integrity, and availability (CIA)"
    ],
    learning_objectives: [
      "Name sniffing, spoofing, and DoS with concrete network examples",
      "Map each threat to which layer/field is abused",
      "Explain why cleartext protocols are risky on shared links",
      "Relate ARP spoofing and IP spoofing to prior units",
      "State first defensive instincts (encrypt, authenticate, filter, rate-limit)"
    ],
    content_easy_markdown: `# Threats on the Wire — Sniffing, Spoofing, DoS

## How it started
As soon as packets crossed untrusted links, attackers learned three cheap tricks: **watch** (sniff), **lie about who they are** (spoof), and **overwhelm** (DoS). Classic Internet protocols often assumed polite participants. CS 411 security starts by naming the threats so TLS, firewalls, and VPNs have a purpose — they are not decorations.

## The simple idea
**CIA triad (network edition):**
- **Confidentiality** — eavesdroppers should not read your bytes (defeats sniffing of secrets).
- **Integrity** — attackers should not alter or forge messages unnoticed (related to spoofing/MITM).
- **Availability** — the service should stay up (defeats DoS).

| Threat | One-line | Example |
|--------|----------|---------|
| **Sniffing** | Read traffic not meant for you | Open Wi-Fi captures of HTTP passwords (historical) |
| **Spoofing** | Forge addresses or names | ARP spoof, IP spoof, DNS spoof |
| **DoS** | Exhaust bandwidth, CPU, tables | SYN flood, UDP flood, BGP overload |

## Step-by-step: a malicious cafe narrative
1. You join "Free_Cafe_WiFi" (maybe an evil twin AP — Unit 7).
2. Attacker **sniffs** unencrypted HTTP and steals a cookie.
3. Attacker **spoofs** DNS toward a phishing IP (or ARP-spoofs as your gateway).
4. Meanwhile a botnet **DoS**es the real site — availability fails even if you typed correctly.
5. Defenses you will learn: TLS (encrypt+authenticate server), careful Wi-Fi, DNS security ideas, firewalls/rate limits, routing filters.

## Real analogy
A postcard in a crowded train (sniffing), someone wearing a fake courier badge (spoofing), and a mob blocking the post office door (DoS). Sealed envelopes with verified seals (crypto), bouncers (firewalls), and private tunnels (VPNs) respond to those threats.

## Worked example
From earlier units:
- **ARP spoof** → wrong MAC for gateway → frames divert (Unit 7).
- **IP spoof** → SYN flood with fake sources → hard to filter; TCP handshake state burns memory (Unit 4).
- **DNS spoof / cache poison** → wrong IP for a name (Unit 3) → HTTPS cert checks may still save you if you use TLS carefully.
- **BGP hijack** → wrong AS attracts traffic (Unit 6) — control-plane spoofing at Internet scale.

Packet Journey assumes honest hops; real life needs skepticism about every hop's operator and every cleartext header.

## Common mistakes
- Thinking "I have a password" equals network confidentiality (passwords over HTTP still sniffable).
- Believing MAC/IP addresses prove identity.
- Ignoring availability — a secure-but-down bank is still a failed bank.
- Assuming DoS only means "lots of packets" — application-layer DoS can be low packet rate, high work factor.
- Skipping labs' trust assumptions when reasoning about attacks.

## Check yourself
1. What does sniffing attack?
   - Answer: confidentiality (and privacy) of observed traffic.
2. Give one spoofing example from CS 411 topics.
   - Answer: ARP spoof, IP spoof, DNS spoof, BGP hijack, etc.
3. Which CIA letter does DoS primarily hit?
   - Answer: Availability.

## See it
Revisit **Packet Journey** and ask: which headers are visible to a sniffing ISP? **DNS Lookup** / **HTTP**: cleartext DNS/HTTP vs HTTPS. **TCP Handshake**: SYN floods abuse state. **ARP** mental model: spoofable mapping. **Routing Path**: malicious diversion is a control-plane integrity failure.
`,
    content_deep_markdown: `# Threat Models and Attack Surfaces (Deep)

## Passive vs active
Sniffing can be passive (harder to detect). Spoofing and MITM are active. On switched Ethernet, sniffing often needs SPAN, hub leftovers, or ARP MITM — Wi-Fi open networks are easier.

## Spoofing taxonomy
L2 MAC, L3 IP (with or without egress filtering), DNS names, TLS certs (if CA compromised or user ignores warnings), email From headers. Defense must match layer.

## DoS classes
Volumetric (bps), protocol (pps / state), application (requests). Amplification (DNS, NTP historically) multiplies attacker bandwidth. Reflectors need source spoofing — ingress filtering (BCP38) matters.

## Middlebox interactions
NAT state exhaustion is a DoS. Firewall asymmetric routing drops. CDN absorption helps volumetric attacks but not all app logic bugs.

## Failure modes of naive defenses
- Blackholing attacker prefixes that are spoofed (collateral damage).
- Rate limiting without fairness (locking out real users).
- Encrypting everything but skipping auth (you have a private chat with an attacker).

## Numbers
SYN cookies trade CPU for state under flood. A 10 Gbps flood is trivial for large botnets; scrubbing centers operate at Tbps scales. Wireshark on a LAN can capture megabytes/minute of cleartext metadata even when payloads are encrypted (SNI historically, timing, sizes).

## Interview tip
Name CIA, give one example each of sniff/spoof/DoS tied to ARP/DNS/TCP/BGP, then mention encrypt+authenticate+filter as the response pattern.

## Operational checklist
1. Classify: confidentiality, integrity, or availability incident?
2. Identify abused protocol field and whether source can be spoofed.
3. Check on-path observers (Wi-Fi, ISP, compromised host).
4. Apply least-privilege filtering and crypto where appropriate.
5. Measure whether mitigation causes self-DoS.

## Practice
For each MustAcademy lab (Packet Journey, DNS, HTTP, TCP, ARP/Routing), write one sentence: "If an attacker sits here, they can…"

## Quantitative intuition
A 1 Gbps flood is 83k+ full-size frames per second if saturated — enough to bury an untuned server NIC or fill a small uplink. Application-layer DoS might need only hundreds of expensive requests/s. Amplification factors historically ranged from small integers to 50×+ on misconfigured reflectors; filtering spoofed sources collapses many of those designs.

## Design trade-offs
Heavy logging helps forensics and can become a self-DoS. Aggressive automated blocking stops attacks and risks locking out NATed campuses behind one IP. Encrypting early (TLS) shrinks sniffing value but shifts attackers toward endpoints and metadata.

## Operational debugging checklist
1. CIA: which goal failed?
2. On-path observer vs off-path spoof?
3. Volumetric vs state vs application exhaustion?
4. Is source addressing trustworthy on this link?
5. Mitigation collateral: are real users collateral damage?

## Exam and interview phrasing
"Sniffing attacks confidentiality, spoofing attacks identity/integrity of fields, DoS attacks availability. Map each to ARP/DNS/TCP/BGP examples, then encrypt, authenticate, and filter."
`,
  }),

  lesson({
    title: "Confidentiality with Cryptography — Keys and TLS Intuition",
    titleMatch: "Confidentiality with Cryptography%",
    importance_level: "Critical",
    breadcrumb_path: BC,
    first_principles: [
      "Cryptography transforms readable data into ciphertext using keys",
      "Symmetric keys are shared secrets; public-key crypto helps establish them and authenticate",
      "TLS protects application data between client and server on the Internet",
      "Encryption without authentication is incomplete against active attackers",
      "Certificates bind public keys to names when the PKI is working"
    ],
    learning_objectives: [
      "Contrast symmetric vs public-key crypto at intuition level",
      "Explain what TLS buys you for a web session",
      "Describe certificates as name↔key bindings",
      "Separate encryption from integrity/authentication goals",
      "Place TLS relative to TCP and HTTP in the stack"
    ],
    content_easy_markdown: `# Confidentiality with Cryptography — Keys and TLS Intuition

## How it started
Sniffing defeated postcards; people invented envelopes, then locks, then ways to agree on lock combinations without meeting in person. On the Internet, **cryptography** provides those locks with math, and **TLS (Transport Layer Security)** is the practical system browsers use so HTTPS is not just "HTTP with vibes."

## The simple idea
**Symmetric crypto:** same key encrypts and decrypts (fast). Problem: how do strangers share the key safely?
**Public-key crypto:** publish a public key; keep a private key. Others encrypt to you or verify signatures you make. Slower — used to authenticate and to set up symmetric session keys.

**TLS intuition (HTTPS):**
1. Client connects (usually after TCP, or inside QUIC).
2. Server presents a **certificate** claiming "I am example.com" with a public key, signed by a Certificate Authority.
3. Client checks the name, validity, and trust chain.
4. Client and server agree on fresh **session keys**.
5. Application bytes (HTTP) travel encrypted and integrity-protected.

Result: cafe sniffers see ciphertext and some metadata — not your password in the clear.

## Step-by-step: padlock in the browser
1. You type \`https://bank.example\`.
2. DNS returns an IP (still need to trust DNS carefully).
3. TLS handshake authenticates the server (ideally) and creates keys.
4. HTTP GET runs **inside** TLS.
5. If certificate is wrong/expired/self-signed, browsers warn — heed them.

TLS does **not** magically fix BGP hijacks delivering you to the wrong place *if* the attacker also has a valid cert for that name (rare but serious) or if you click through warnings (common).

## Real analogy
Hotel safe:
- Symmetric key = the code you and the hotel desk both know for this stay (session key).
- Public-key / cert = verifying the desk is the real hotel before you whisper the code.
- TLS = the ritual that checks the desk badge and invents a fresh code, then locks the suitcase conversation.

## Worked example
**HTTP lab** without TLS: Packet Journey observers can read Host headers and bodies.
**HTTPS:** observers see IPs, ports, roughly sized packets, maybe SNI (depending on version/extensions), but not the HTML password field.
**TCP lab:** TLS sits above TCP (or is integrated in QUIC). Handshake failures look like connects that die before HTTP.

## Common mistakes
- Thinking TLS hides the destination IP from the network.
- Equating "HTTPS" with "the page cannot be phishing" — certs bind names, not moral purity of content.
- Sharing passwords over HTTP "just this once."
- Ignoring integrity: encrypted but modifiable bitstreams without auth tags are dangerous designs.
- Believing corporate TLS interception middleboxes are "the same" as end-to-end trust without scrutiny.

## Check yourself
1. What problem do session keys solve after TLS handshake?
   - Answer: efficient symmetric confidentiality/integrity for bulk data.
2. What does a certificate primarily bind?
   - Answer: a public key to a name (and related properties), via CA signatures.
3. Does TLS replace the need for firewalls?
   - Answer: No — different threats (crypto ≠ access policy ≠ DDoS).

## See it
**HTTP** lab: imagine the same exchange under TLS. **DNS Lookup**: name must match certificate SAN. **TCP Handshake**: happens first (classic stack). **Packet Journey**: middle hops forward ciphertext. **NAT**: still rewrites IPs/ports; TLS is end-to-end between client and server (unless broken by enterprise MITM proxies).
`,
    content_deep_markdown: `# TLS and Cryptographic Building Blocks (Deep)

## Goals mapped to tools
- Confidentiality: AEAD ciphers (AES-GCM, ChaCha20-Poly1305).
- Integrity/auth of records: AEAD tags.
- Authentication of server (and optionally client): certificates / raw public keys.
- Forward secrecy: ephemeral Diffie-Hellman so stolen long-term keys don't decrypt past sessions.

## Handshake evolution
TLS 1.2 vs 1.3: fewer round trips, removed obsolete ciphers, encrypted more handshake fields. QUIC embeds crypto with 0/1-RTT options and different loss recovery.

## PKI realities
Trust stores, intermediate CAs, revocation (CRL/OCSP) imperfections, CT logs. Name constraints and automation (ACME) changed issuance scale.

## What TLS does not solve
Endpoint malware, phishing with valid certs on lookalike domains, metadata leakage, DoS, malicious JS on a compromised origin, and routing attacks that also obtain certificates.

## Failure modes
- Clock skew failing cert validity.
- Missing intermediate chain.
- Protocol downgrade (mostly historical with modern stacks).
- Improper certificate validation in custom apps (fatal bug class).

## Numbers
RSA-2048 / ECDSA P-256 common historically; TLS1.3 prefers ECDHE + AEAD. Handshake typically 1–2 RTTs depending on version/resumption — mobile RTT dominates UX.

## Interview tip
"TLS authenticates the server via certificates and establishes ephemeral session keys for encrypted HTTP; it protects on-path sniffers but not endpoint compromise or bad name trust decisions."

## Practice
Draw TCP then TLS then HTTP layers. List three fields still visible to a network adversary on a typical HTTPS connection.

## Quantitative intuition
On a 40 ms RTT path, classical TLS 1.2 full handshake could cost ~2 RTTs of crypto setup (~80 ms) before HTTP; TLS 1.3 often saves a round trip. Session resumption / 0-RTT (carefully) matters more to UX than picking AES vs ChaCha on desktop CPUs. Certificate validation failures should be hard errors — soft-failing revocation checks historically traded availability for security.

## Design trade-offs
Long-lived certificates reduce ops toil and enlarge compromise windows; short-lived automated certs invert that. Enterprise TLS interception enables DLP and breaks end-to-end threat assumptions — disclose and manage deliberately. Encrypted Client Hello and DoH shrink metadata leakage and complicate benign network filtering.

## Operational debugging checklist
1. Cert name, chain, time validity.
2. Protocol version and cipher negotiation failures.
3. Middlebox TLS interception trust issues on managed devices.
4. MTU / middlebox breakage during handshake.
5. App custom TLS validation bugs (hostname verify off).

## Exam and interview phrasing
"TLS uses certificates to authenticate servers and ephemeral keys for encrypted application data. It stops casual sniffing of HTTP, not routing lies, endpoint malware, or users ignoring warnings."
`,
  }),

  lesson({
    title: "Firewalls and Secure Network Design",
    titleMatch: "Firewalls and Secure Network Design%",
    importance_level: "Essential",
    breadcrumb_path: BC,
    first_principles: [
      "Firewalls enforce allow/deny policy on traffic crossing a trust boundary",
      "Default-deny with explicit allows is safer than default-allow with random blocks",
      "Stateful firewalls track connections; stateless filters judge packets alone",
      "Zones (Internet, DMZ, internal) structure blast radius",
      "Encryption does not replace access control"
    ],
    learning_objectives: [
      "Define a firewall's role at a trust boundary",
      "Contrast packet filters vs stateful inspection at intuition level",
      "Sketch a simple DMZ design",
      "Explain why outbound and inbound policies both matter",
      "Relate firewalls to NAT, routers, and application gateways"
    ],
    content_easy_markdown: `# Firewalls and Secure Network Design

## How it started
Once networks connected to strangers, operators needed a **policy checkpoint**: which packets may enter the crown jewels? Early **packet filters** on routers grew into **firewalls** — dedicated policy engines. Secure design is more than a box: it is **zones**, least privilege, and assuming some hosts will be compromised.

## The simple idea
A firewall asks: "Given who we trust, should this flow exist?"

- **Stateless filter:** match on IP/ports/flags alone (fast, limited).
- **Stateful firewall:** track TCP handshakes / UDP flows; allow return traffic for established sessions.
- **Application-layer gateway / proxy:** understand HTTP etc.; deeper policy, more CPU.

**Secure design sketch:**
- Internet → **edge firewall** → **DMZ** (public web/mail) → **internal firewall** → sensitive DB/workstations.
- Only DMZ talks to DB on specific ports; workstations cannot be world-reachable.

## Step-by-step: allow HTTPS to a web server
1. Place web server in DMZ with private IP; publish via VIP/NAT/load balancer as needed.
2. Inbound policy: allow TCP/443 to web VIP from Internet; deny direct to DB.
3. Web→DB policy: allow only TCP/5432 from web subnet to DB; deny DB→Internet generally.
4. Stateful inspection: allow established replies.
5. Log drops; alert on scans.

Default deny means forgotten services stay closed — a feature.

## Real analogy
Airport:
- Customs (firewall) between countries (zones).
- Transit area (DMZ) for public shops — not the same as the secure cockpit (internal).
- Boarding pass checks (ports/apps) and watching return paths (state).

## Worked example
Home router NAT is a crude default-deny inbound firewall: unsolicited inbound WAN packets drop unless port-forwarded. That is why hosting a game server needs an explicit allow. Enterprise adds explicit outbound controls (stop malware C2) — homes rarely do.

MustAcademy **NAT** lab ≈ tiny secure-design cousin. **TCP** ports become policy atoms. **HTTP** proxies may sit in DMZ. Spoofed packets with wrong directions should die at the filter if anti-spoof rules exist.

## Common mistakes
- "We have TLS, so no firewall needed."
- Flat network: every PC world-reachable after one VPN login.
- Allow any any because "it broke the app."
- No egress filtering — infected hosts phone home freely.
- Forgetting management planes (SSH to firewall from Internet = new attack surface).

## Check yourself
1. What is a DMZ for?
   - Answer: host Internet-facing services in a zone buffered from internal systems.
2. Stateful vs stateless in one line?
   - Answer: stateful tracks sessions; stateless judges each packet in isolation.
3. Does encryption replace firewall policy?
   - Answer: No — different control (confidentiality vs authorization of flows).

## See it
**NAT** lab: inbound default deny. **Packet Journey**: imagine a drop at the edge — journey ends. **Routing Path**: firewalls often on routed hops. **TCP Handshake**: incomplete handshakes may be rate-limited. **DNS/HTTP**: application firewalls inspect names and URLs carefully (privacy trade-offs).
`,
    content_deep_markdown: `# Firewall Architectures (Deep)

## Policy languages
5-tuples, zones, users/identity-aware rules, time-based rules. Order matters in many ACL engines — first match wins.

## Stateful pitfalls
Asymmetric routing breaks state. Long-lived flows and mid-path failover need carefully shared state or designs that avoid it. UDP "state" is heuristic.

## Next-gen features
IDS/IPS signatures, sandboxing, TLS interception (contentious), DNS filtering. Each adds failure modes and privacy concerns.

## Zero trust direction
Authenticate/authorize every session regardless of network location; firewalls become one enforcement point among many (agents, service meshes).

## Failure modes
- Misordered ACLs shadowing denies.
- "Any any" temporary rules that become permanent.
- Resource exhaustion from state table floods (DoS).
- Change windows causing self-inflicted outages.

## Numbers
State table sizes in millions on large edges; rule counts in thousands become audit problems. SYN proxy/cookies under flood.

## Interview tip
"Firewalls enforce zone policy; prefer default-deny; stateful tracking allows established returns; DMZs isolate public services from internal data."

## Design exercise
Draw three zones with five rules total that allow web+DNS but block direct Internet→DB and restrict DB replies.

## Quantitative intuition
A state table of millions of entries under scan/flood can exhaust memory before CPU saturates — capacity planning is part of security. Rulebases with thousands of lines accumulate shadow rules; audit time grows faster than linear with tribal knowledge lost.

## Design trade-offs
Centralized firewalls simplify policy and create chokepoints. Microsegmentation limits blast radius and multiplies policy surfaces. Decrypting TLS for inspection improves malware detection and weakens privacy/integrity assumptions.

## Operational debugging checklist
1. Hit counters: which rule matched?
2. Stateful drop due to asymmetry?
3. Change window correlation?
4. Egress as well as ingress reviewed?
5. Management access locked to jump hosts?

## Exam and interview phrasing
"Firewalls enforce allow/deny at trust boundaries. Prefer default-deny, stateful return traffic, and DMZ placement for public services — crypto does not replace authorization of flows."

## Extra worked scenario
Compromised web server in DMZ should not freely SSH into payroll subnets. Lateral movement rules matter as much as Internet→DMZ allows. Log and alert on zone violations; treat them as incidents, not noise.
`,
  }),

  lesson({
    title: "VPNs — Private Tunnels Across a Public Internet",
    titleMatch: "VPNs%",
    importance_level: "Essential",
    breadcrumb_path: BC,
    first_principles: [
      "A VPN encapsulates private packets inside protected outer packets across an untrusted network",
      "VPNs provide confidentiality and integrity for the tunnelled traffic when configured correctly",
      "Remote-access VPNs extend a user into an enterprise network; site-to-site VPNs join networks",
      "Tunneling changes apparent topology and often MTU",
      "A VPN is not a complete security program by itself"
    ],
    learning_objectives: [
      "Explain VPN as authenticated encrypted tunneling",
      "Contrast remote-access vs site-to-site use cases",
      "Describe why MTU/MSS issues appear with tunnels",
      "Relate VPNs to TLS and to firewall policy",
      "List what VPNs do and do not protect"
    ],
    content_easy_markdown: `# VPNs — Private Tunnels Across a Public Internet

## How it started
Companies needed branch offices and roaming employees to act "as if on the LAN" without leasing private wires everywhere. The answer: **Virtual Private Networks** — send private IP packets **inside** encrypted outer packets across the public Internet. From the inside, it feels like a direct cable; from the outside, it looks like ciphertext between gateways or to a concentrator.

## The simple idea
**Encapsulation:**
\`[ Outer IP | VPN header | encrypted ( Inner IP | TCP | HTTP… ) ]\`

- **Remote-access VPN:** your laptop runs a client; after login, you get a virtual interface and routes to corporate prefixes. Traffic to those prefixes enters the tunnel.
- **Site-to-site VPN:** two firewalls/routers permanently tunnel between offices; hosts may not even know.

Crypto may use IPsec, TLS-based VPNs (OpenVPN/WireGuard-style designs differ), or commercial variants — same tunnel idea.

## Step-by-step: work-from-cafe
1. Cafe Wi-Fi is untrusted (Unit 7/8 threats).
2. You start VPN; authenticate to company gateway.
3. Tunnel keys established (IKE/TLS/Noise — product-dependent).
4. Your packet to \`10.20.0.5\` is encrypted and sent to the gateway's public IP.
5. Gateway decrypts, forwards on the internal network as if you were local.
6. Firewall policies still apply — VPN ≠ automatic admin rights.

## Real analogy
Armored truck (outer packet) carrying sealed lockboxes (inner packets) across public roads (Internet). Drivers see the truck; they should not read the lockboxes. The destination warehouse (gateway) unlocks and sorts mail onto private conveyors.

## Worked example
Without VPN on cafe Wi-Fi: even HTTPS helps for each site, but DNS may leak, and corporate internal apps are unreachable.
With VPN: internal apps reachable; cafe sniffer sees mostly tunnel ciphertext to one gateway IP.
Split tunnel vs full tunnel: only some vs all traffic enters VPN — trade-off between security policy and performance/privacy.

**NAT** traversal often needed when both sides sit behind NATs. **MTU**: extra headers shrink effective packet size — classic "VPN breaks big transfers" bug when ICMP is filtered (**PMTUD** blackhole).

## Common mistakes
- Believing "VPN on" means malware-proof.
- Ignoring endpoint security — tunnel happily carries infected host traffic inside.
- Full-tunneling everything through a distant region (latency pain) without need.
- Forgetting firewall rules after VPN admission.
- Overlooking WireGuard/IPsec misconfig leaving tunnels unauthenticated.

## Check yourself
1. What does a VPN primarily create?
   - Answer: an authenticated, typically encrypted tunnel carrying inner packets across an untrusted network.
2. Remote-access vs site-to-site?
   - Answer: user device into network vs network-to-network permanent tunnel.
3. Name one side effect of tunneling.
   - Answer: MTU reduction / PMTUD issues; different visible path; policy concentration at gateway.

## See it
**Packet Journey**: add a tunnel hop — outer destination is the VPN gateway. **NAT**: common on both cafe and enterprise edges. **TCP/HTTP**: ride inside the inner packet. **Routing Path**: VPN installs virtual routes. **Delay Lab**: longer path to gateway adds RTT before internal servers.
`,
    content_deep_markdown: `# VPN Protocols and Operations (Deep)

## IPsec sketch
IKE negotiates SAs; ESP provides confidentiality/integrity; transport vs tunnel modes. Policy-based vs route-based VPNs in vendors.

## TLS/user-space VPNs
TCP or UDP underlays; easier NAT traversal sometimes; different performance profiles. WireGuard: modern crypto, simple design, kernel integrations.

## Routing and policy
Overlay routes, BGP over tunnels for large fabrics, traffic selectors. Identity-based admission (MFA) before keying completes.

## Failure modes
- Dead peer detection failures leaving blackholes.
- Overlapping private address spaces (0.0.0.0/8 collisions between home and corp).
- MTU blackholes; TCP MSS clamping fixes.
- Split DNS leaks outside tunnel.

## Numbers
ESP overhead tens of bytes + outer IP; on 1500 MTU paths inner MTU often ~1400. RTT to distant VPN gateway dominates app latency more than cipher cost on modern CPUs.

## Interview tip
"VPNs encapsulate and cryptographically protect inner packets across the public Internet for remote-access or site-to-site connectivity; they change routing/MTU and do not replace host security or least-privilege authorization."

## Practice
Draw cafe laptop → VPN GW → internal server with outer vs inner 5-tuples. Mark where sniffing still sees metadata.

## Quantitative intuition
Adding ~60–80 bytes of outer overhead on a 1500-byte path forces inner MTU near 1400; missing ICMP fragmentation-needed yields mysterious stalls on large transfers only. A VPN gateway 80 ms away adds ~160 ms RTT to internal apps that used to be 5 ms on-campus — users call this "the VPN is slow" when physics is the path.

## Design trade-offs
Full tunnel maximizes control/visibility and concentrates bandwidth/privacy on the gateway. Split tunnel improves performance and risks bypassing DLP. Always-on VPN helps compliance and complicates captive portals and local device administration.

## Operational debugging checklist
1. Outer tunnel up? Auth? SA counters increasing?
2. Inner routes installed? Overlapping 10.0.0.0/8?
3. MTU/MSS symptoms on bulk transfers only?
4. DNS suffix/search leaks outside tunnel?
5. Firewall policy on decrypted inner traffic correct?

## Exam and interview phrasing
"VPNs encapsulate and protect inner packets across the public Internet for remote users or sites. They change routing and MTU; they do not replace endpoint hardening or least privilege."
`,
  }),

  lesson({
    title: "Putting It All Together — A Secure Page Load Hero Capstone",
    titleMatch: "Putting It All Together%",
    importance_level: "Critical",
    breadcrumb_path: BC,
    first_principles: [
      "A page load exercises naming, transport, security, routing, and link delivery together",
      "Heroes narrate layers in order and know what each guarantees",
      "Security sits across layers: TLS, firewalls, routing integrity, endpoint trust",
      "Labs are checkpoints for each stage of the story",
      "Debugging means locating the first failing stage, not blaming 'the Internet'"
    ],
    learning_objectives: [
      "Narrate a secure HTTPS page load from click to pixels at hero level",
      "Identify which CS 411 unit owns each stage",
      "List security controls encountered along the path",
      "Diagnose common failure points with layer-aware questions",
      "Map MustAcademy labs onto the end-to-end story"
    ],
    content_easy_markdown: `# Putting It All Together — A Secure Page Load Hero Capstone

## How it started
Every unit so far was a puzzle piece. Heroes can tell one continuous story: you click a link, and a **secure page load** happens because naming, TCP/TLS, IP forwarding, routing policy, link delivery, and defenses all cooperate. This capstone is your graduation narration for MustAcademy CS 411 — Zero to Hero.

## The simple idea
**Hero script (HTTPS):**
1. **DNS** — name → IP (Application / Unit 3). Lab: **DNS Lookup**.
2. **Route selection** — OS chooses interface/gateway; FIB/BGP/OSPF shaped reachability (Units 5–6). Labs: **Routing Path**, **IP Anatomy**.
3. **ARP/ND / Wi-Fi** — deliver to next hop on the local link (Unit 7). First hop of **Packet Journey**.
4. **TCP** (or QUIC) — ports, handshake, reliability (Unit 4). Lab: **TCP Handshake**.
5. **TLS** — authenticate server, encrypt HTTP (Unit 8). Padlock.
6. **HTTP** — request/response (Unit 3). Lab: **HTTP**.
7. **Performance feel** — delays, queues, loss (Unit 2). Labs: **Delay**, throughput intuition.
8. **Middleboxes** — NAT, firewalls, CDNs reshape the path (Units 5, 8). Lab: **NAT**.

Security is not a single step — TLS confidentiality, firewall allows 443, maybe VPN, routing not hijacked, Wi-Fi not evil-twin.

## Step-by-step: click \`https://shop.example\`
1. Browser checks cache; else DNS query (possibly DoH) → \`203.0.113.80\`.
2. Client connects to 203.0.113.80:443 from an ephemeral port (NAT may rewrite).
3. Packets hop: Wi-Fi → home router → ISP → … → DC edge → server (or CDN POP).
4. TCP SYN/SYN-ACK/ACK (unless QUIC/UDP).
5. TLS verifies certificate for \`shop.example\`, derives keys.
6. HTTP GET \`/\` with cookies; response HTML/CSS/JS.
7. Additional parallel connections/objects; each repeats pieces of the story.
8. Render. You shop. Heroes smile.

## Real analogy
A cross-city sealed courier run: look up address (DNS), choose highways (routing), drive each road segment (links), show ID at the vault (TLS), hand over the form (HTTP), avoid traffic jams (performance), pass checkpoints (firewalls). Missing any piece stalls the delivery.

## Worked example — failure diagnosis
| Symptom | Likely stage | Unit instinct |
|---------|--------------|---------------|
| NXDOMAIN | DNS | Unit 3 |
| ARP incomplete / no gateway | Link/Wi-Fi | Unit 7 |
| SYN timeout | Reachability/firewall/routing | Units 5–6, 8 |
| Cert warning | TLS/PKI/name mismatch | Unit 8 |
| HTTP 502 | App/proxy | Unit 3 |
| Slow but loads | Delay/loss/Wi-Fi airtime | Units 2, 7 |

## Common mistakes
- One-layer thinking ("DNS is down" for every failure).
- Ignoring TLS warnings to "make it work."
- Forgetting NAT when interpreting packet captures on different sides.
- Memorizing acronyms without the page-load story.
- Skipping labs — heroes verify with Packet Journey + DNS + TCP + HTTP mentally sequenced.

## Check yourself
1. Order these: HTTP, DNS, TLS, TCP (classic).
   - Answer: DNS → TCP → TLS → HTTP (QUIC merges transport+TLS differently).
2. Name one lab for naming, one for transport, one for path.
   - Answer: e.g., DNS Lookup; TCP Handshake; Packet Journey or Routing Path.
3. What does TLS not replace?
   - Answer: correct routing, firewall policy, endpoint security, availability defenses.

## See it
Run the mental movie once with every MustAcademy lab you have: **OSI Stack** (where each header lives), **Packet Journey** (hops), **Delay** (feel), **DNS**, **TCP**, **HTTP**, **IP Anatomy**, **Routing Path**, **NAT**. You are done with CS 411 when that movie is fluent — and you can pause it to insert sniffing threats, firewall drops, VPN tunnels, and Wi-Fi retries without losing the plot.
`,
    content_deep_markdown: `# Capstone: End-to-End Reasoning (Deep)

## Layered guarantees
- DNS: name binding (trust varies; DNSSEC/DoH change threat model).
- BGP/IGP: reachability (not authenticity of content).
- TCP: reliable byte stream (not security).
- TLS: crypto session to authenticated endpoint name (if validation correct).
- HTTP: application semantics.
- L2: local delivery (ARP trust).

Heroes never assign a guarantee to the wrong layer.

## Security composition
Defense in depth: filter spoofing, encrypt sessions, patch endpoints, monitor BGP, rate-limit, least privilege. Failures are usually the weakest link, not the missing buzzword.

## Interview whiteboard
"Walk me through HTTPS" — use the hero script; mention NAT; mention CDN anycast; mention what Wireshark shows at each stage; mention one failure mode per stage.

## Quantitative sanity
Estimate DNS RTT + TCP 1 RTT + TLS 1–2 RTT + first HTTP RTT on a 50 ms path → hundreds of ms to first byte without reuse/resumption/parallelism. Connection reuse and HTTP/2/3 matter.

## Failure drill
Practice five outages aloud: expired cert, Wi-Fi auth fail, NAT table full, BGP withdrawal, SYN drop by firewall. Map each to labs/units.

## What "hero" means at MustAcademy
You can teach a classmate the page-load story in five minutes, deepen any chapter on demand, and use labs as evidence. Units 1–8 were scaffolding for that fluency.

## Next practice
Write your own one-page cheat sheet: threats → crypto → firewalls → VPNs → page load. Then re-answer every Check yourself in Unit 8 without notes.

## Quantitative intuition
First contentful byte ≈ DNS (+cache hit 0) + TCP RTT + TLS RTTs + HTTP RTT, minus parallelization and warm connections. On 50 ms RTT with TLS 1.3 and cold cache, hundreds of milliseconds before HTML is normal; blaming only "server CPU" without measuring these stages misleads. Loss on the Wi-Fi hop can dominate even when the backbone is fine.

## Design trade-offs
CDNs shorten physical distance and expand the trust/dependency surface. Connection coalescing and HTTP/3 improve performance and change middlebox visibility. Strict security defaults (no click-through, certificate pinning in apps) raise user friction and stop whole classes of MITM.

## Operational debugging checklist
1. Reproduce with curl -v / browser devtools timing.
2. Stage-isolate: DNS, TCP connect, TLS, HTTP TTFB, assets.
3. Compare Wi-Fi vs Ethernet vs cellular.
4. Check middleboxes: NAT, firewall, VPN, corporate proxy.
5. Only then deep-dive application logs.

## Exam and interview phrasing
"HTTPS page load: DNS, route/ARP, TCP, TLS, HTTP, render — with NAT/CDN likely on path. Security is layered: TLS for the session, firewalls for policy, routing hygiene for delivery, endpoints for the last mile of trust."
`,
  }),
];
