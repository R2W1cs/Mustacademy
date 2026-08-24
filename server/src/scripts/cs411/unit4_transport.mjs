import { lesson } from "./helper.mjs";

const BC = "CS 411 > Unit 4: Transport Layer";

export const topics = [
  lesson({
    title: "Transport Layer — Ports and Multiplexing",
    titleMatch: "Transport Layer — Ports%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 4: Transport Layer",
    first_principles: [
      "Transport sits above IP and delivers data to the correct application process",
      "Ports multiplex many applications onto one host IP address",
      "A socket endpoint is typically (IP, port, protocol)",
      "TCP and UDP both use ports but offer different services",
      "Well-known ports identify common services (80, 443, 53, …)"
    ],
    learning_objectives: [
      "Explain why ports exist",
      "Define multiplexing and demultiplexing at transport",
      "Contrast transport responsibilities with IP",
      "Read a simple 5-tuple intuition for a connection",
      "Relate ports to socket programming from Unit 3"
    ],
    content_easy_markdown: `# Transport Layer — Ports and Multiplexing

## How it started
IP delivers packets to a host — but a host runs many apps at once (browser, chat, updates). We needed a way to sort arriving bytes to the right process. **Transport protocols** add **ports** and end-to-end services like reliability (TCP) or simplicity (UDP).

## The simple idea
**Multiplexing**: many apps share the network by tagging data with port numbers.
**Demultiplexing**: on arrival, the OS uses destination port (and more) to deliver to the correct socket.

Examples:
- HTTPS servers often listen on port **443**.
- DNS often uses port **53**.
- Your browser clients use temporary **ephemeral ports**.

IP address = which host. Port = which app doorway on that host.

## Step-by-step: two tabs, one laptop
1. Tab A connects to \`server:443\` from local port 52001.
2. Tab B connects to the same \`server:443\` from local port 52002.
3. Returning packets to 52001 vs 52002 demultiplex to the correct tab/process.
4. IP alone could not tell the tabs apart — ports do.

## Real analogy
An apartment building (host IP) with numbered units (ports). Mail addressed only to the building is ambiguous; unit numbers finish delivery. The postal trucks (IP routers) do not open your letters (app data).

## Worked example
Connection 5-tuple intuition: (protocol, src IP, src port, dst IP, dst port). NAT (Unit 5) rewrites some of these fields for many devices sharing one public IP — transport identity becomes precious.

## Common mistakes
- Thinking ports are physical holes — they are transport identifiers.
- Confusing port filters with IP routing problems.
- Assuming one port means one thread forever — servers accept many connections on one listen port.
- Forgetting UDP and TCP port spaces are separate.

## Check yourself
1. Why aren't IP addresses enough?
   - Answer: one host runs many apps; ports demultiplex among them.
2. What is an ephemeral port?
   - Answer: temporary client port chosen for an outbound connection.
3. Does TCP port 53 mean the same service as UDP 53?
   - Answer: same number, different protocol spaces; DNS uses both patterns historically.

## See it
In the **TCP Three-Way Handshake** lab, note that SYN segments carry ports. In **Packet Journey**, remember: after IP delivers to the host, transport finishes delivery to the app.`,
    content_deep_markdown: `# Multiplexing Details (Deep)

## Demux keys
UDP: primarily dest port (+ local binding). TCP: full 4-tuple for established connections. Listen sockets special-case incoming SYNs.

## Service models
Transport chooses reliability, ordering, congestion control, or not. IP remains best effort.

## Port security
Scans, firewalls, reverse proxies. Binding to 0.0.0.0 vs 127.0.0.1.

## Failure cases
- Ephemeral port exhaustion under extreme NAT/proxy load.
- TIME_WAIT accumulation.
- Middleboxes tracking 5-tuples and breaking unexpected patterns.

## Interview tip
Define multiplexing in one sentence, then give the two-tabs example.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "Transport Layer — Ports and Multiplexing", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "Transport Layer — Ports and Multiplexing" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "UDP — Fast and Simple Datagrams",
    titleMatch: "UDP%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 4: Transport Layer",
    first_principles: [
      "UDP provides connectionless datagram delivery with ports and an optional checksum",
      "UDP does not guarantee delivery, order, or congestion control",
      "Low overhead makes UDP attractive for latency-sensitive and simple query apps",
      "Applications that need reliability must build it themselves (or use QUIC/TCP)",
      "DNS, games, VoIP, and QUIC commonly use UDP"
    ],
    learning_objectives: [
      "Describe UDP's service model",
      "List what UDP does not provide vs TCP",
      "Give realistic UDP use cases",
      "Explain when adding reliability on UDP makes sense",
      "Contrast UDP with the TCP handshake lab"
    ],
    content_easy_markdown: `# UDP — Fast and Simple Datagrams

## How it started
Not every application wants a heavy reliable connection. **UDP** (User Datagram Protocol) was designed as a thin shim over IP: add ports and a checksum, then get out of the way. Decs, media, and modern QUIC all lean on that simplicity.

## The simple idea
UDP sends **datagrams** — self-contained messages — to an IP:port.

UDP gives you:
- Multiplexing via ports
- Optional integrity check (checksum)

UDP does **not** give you:
- Connection handshake
- Guaranteed delivery
- In-order delivery
- Automatic retransmission
- Congestion control (app/QUIC may add)

Fast and simple — with responsibility shifted upward.

## Step-by-step: a UDP exchange
1. Client \`sendto\` a datagram to server IP:port.
2. Network may deliver, drop, duplicate, or reorder.
3. Server \`recvfrom\` may get the message — or never.
4. If the app cares, it must detect loss (timeouts, sequence numbers) itself.

DNS resolvers traditionally used UDP for small queries exactly because most answers fit one datagram and retry is easy.

## Real analogy
UDP is tossing labeled postcards into a crowd. Many arrive; some don't; order isn't promised. TCP is a signed courier service with receipts. Choose based on whether a missing postcard ruins the day.

## Worked example
Live video frame late by 200 ms is useless — better skip (UDP-style) than stall forever retransmitting. A file download must be correct — TCP/QUIC reliability fits better.

## Common mistakes
- Calling UDP "unreliable" as if it always fails — it often works; it just doesn't *promise*.
- Forgetting applications can still implement ACKs on UDP (QUIC does much more).
- Sending huge UDP datagrams that fragment badly.
- Assuming firewalls treat UDP like TCP (many block idle UDP).

## Check yourself
1. Name two things UDP lacks vs TCP.
   - Answer: e.g., retransmission and connection state / congestion control.
2. Why use UDP for DNS queries historically?
   - Answer: low overhead; short request/response; easy timeout retry.
3. Does UDP still use ports?
   - Answer: yes — multiplexing is a core feature.

## See it
Compare with the **TCP Three-Way Handshake** lab: UDP skips that whole dance. When the lab says UDP is faster to start, this lesson is why.`,
    content_deep_markdown: `# UDP Systems (Deep)

## Header
Short: src/dst port, length, checksum. IPv6 UDP checksum effectively required.

## Messaging
Datagram boundaries preserved (unlike TCP streams). Soft size limits; stay under path MTU when possible.

## UDP today
QUIC, HTTP/3, WebRTC, games, VPN tunnels, DNS still. Middlebox NAT timeouts are operational constraints.

## Failure cases
- Silent drops without ICMP (filtered).
- Asymmetric connectivity.
- Amplification attacks if responders are careless (DNS/NTP history).

## Interview tip
"UDP = ports + datagrams − guarantees. Reliability belongs in the app or a richer stack like QUIC."

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "UDP — Fast and Simple Datagrams", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "UDP — Fast and Simple Datagrams" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "Reliable Data Transfer — From Dreams to Protocols",
    titleMatch: "Reliable Data Transfer%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 4: Transport Layer",
    first_principles: [
      "Reliable transfer means delivering data correctly despite loss, corruption, and delay",
      "ACKs, timeouts, and retransmissions are the core toolkit",
      "Sequence numbers detect duplicates and order issues",
      "Pipelining (windows) raises throughput on long-fat paths",
      "TCP implements these ideas in a production protocol"
    ],
    learning_objectives: [
      "Explain rdt goals: correctness despite an unreliable channel",
      "Describe ACK + timeout + retransmit loops",
      "Motivate sequence numbers",
      "Contrast stop-and-wait with pipelined windows",
      "Preview how TCP instantiates these mechanisms"
    ],
    content_easy_markdown: `# Reliable Data Transfer — From Dreams to Protocols

## How it started
IP and UDP can drop packets. Files and many apps need **reliable data transfer**: bits arrive complete, correct, and in order (as a stream or as messages). Researchers built a ladder of toy protocols (rdt) that become the intuition behind TCP.

## The simple idea
To send reliably over an unreliable channel you typically need:
1. **Checksums** — detect corruption.
2. **ACKs** — receiver says "got it."
3. **Timeouts + retransmission** — sender retries if ACK never comes.
4. **Sequence numbers** — tell duplicates from new data; help ordering.
5. **Windows / pipelining** — allow multiple outstanding packets so you fill the pipe (Unit 2 DBP!).

Stop-and-wait is easy but slow on long-delay links. Windowed protocols keep the network busy.

## Step-by-step: stop-and-wait story
1. Sender sends packet 0.
2. Receiver validates checksum, sends ACK0.
3. Sender gets ACK0, sends packet 1.
4. If ACK is lost, sender times out and resends packet 0.
5. Sequence numbers stop the receiver from delivering duplicates twice.

## Real analogy
Texting a friend a multi-part code with "got it" replies. If they go silent, you resend the last part. You number the parts so a delayed "got it" does not confuse you. If you wait for each reply before sending the next page, a slow chat (long RTT) crawls — so you send a few pages at once (window).

## Worked example
RTT = 100 ms, send one tiny packet stop-and-wait → ~10 packets/sec max regardless of huge bandwidth. With window = 50, you can keep far more in flight — same reliability ideas, better throughput.

## Common mistakes
- Forgetting ACK loss can cause unnecessary retransmits (duplicates).
- Ignoring corruption (checksums) and only thinking about drops.
- Believing reliability must live in IP — Internet design pushes it up.
- Setting timeouts too short on long-RTT paths → spurious retransmits.

## Check yourself
1. What does an ACK buy you?
   - Answer: evidence the receiver got the data (or at least the segment).
2. Why sequence numbers?
   - Answer: distinguish new data from retransmissions/duplicates; support order.
3. Why pipeline?
   - Answer: utilize the delay-bandwidth product instead of idling.

## See it
The **TCP Three-Way Handshake** lab is only the beginning; reliability continues with seq/ack numbers during data transfer. Delay Lab + DBP explain why windows must grow.`,
    content_deep_markdown: `# rdt Mechanisms (Deep)

## Channel assumptions
Loss, bit errors, reordering, delay variance. Protocols differ in what they handle.

## ARQ families
Stop-and-wait, Go-Back-N, selective repeat. Trade memory, complexity, and retransmission waste.

## Performance
Utilization ≈ W / (1 + 2a) style formulas in textbooks where a relates to delay bandwidth. Ties Unit 2 to Unit 4.

## Failure cases
- Ambiguous timeout after delay spikes.
- ACK implosion / compression in real stacks.
- Reordering mistaken for loss (fast retransmit heuristics).

## Interview tip
Build from checksum → ACK → timeout → seq → window. Narrate upgrades as channel threats appear.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "Reliable Data Transfer — From Dreams to Protocols", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "Reliable Data Transfer — From Dreams to Protocols" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "TCP Handshake and Reliable Delivery",
    titleMatch: "TCP Handshake%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 4: Transport Layer",
    first_principles: [
      "TCP provides a reliable, ordered byte stream between applications",
      "The three-way handshake establishes shared initial sequence numbers and state",
      "Sequence and acknowledgment numbers track bytes delivered",
      "Retransmission recovers lost segments",
      "Connection teardown is a first-class state machine, not just 'stop sending'"
    ],
    learning_objectives: [
      "Explain SYN, SYN-ACK, ACK in the three-way handshake",
      "Describe TCP as a byte stream with seq/ack numbers",
      "Relate retransmission to reliable delivery",
      "Contrast TCP setup cost with UDP",
      "Step the TCP Three-Way Handshake lab confidently"
    ],
    content_easy_markdown: `# TCP Handshake and Reliable Delivery

## How it started
The Internet needed a workhorse reliable protocol for login, file transfer, and later the Web. **TCP** (Transmission Control Protocol) pairs connection setup, sequenced bytes, ACKs, timers, flow control, and congestion control into one transport used everywhere.

## The simple idea
TCP offers apps a **reliable bidirectional byte stream**. Under the hood it segments bytes, numbers them, and ensures delivery.

**Three-way handshake** (connection setup):
1. Client → Server: **SYN** ("I'd like to connect; here's my initial seq").
2. Server → Client: **SYN-ACK** ("OK; here's my initial seq; I ACK yours").
3. Client → Server: **ACK** ("Got it — connected").

After that, data segments flow with seq/ack numbers; losses trigger retransmit. Closing uses FIN/ACK exchanges (with TIME_WAIT realities).

## Step-by-step: why handshake?
1. Agree that both sides are reachable and willing.
2. Synchronize sequence number spaces.
3. Exchange initial options (window scaling, MSS, SACK, etc.).
4. Only then stream application bytes (HTTP, SSH, …).

UDP skips this — faster start, fewer guarantees.

## Real analogy
Phone call setup: ring, answer, "hello." Then conversation with "uh-huh" acknowledgments. Hang up politely both ways. SYN/SYN-ACK/ACK is the ring/answer/hello.

## Worked example
Client ISN=100, server ISN=500:
- SYN seq=100
- SYN-ACK seq=500 ack=101
- ACK ack=501
Data from client starting at seq=101… Lab captions match this story.

## Common mistakes
- Thinking handshake moves HTTP data — it usually does not; it sets up state.
- Confusing ACKs of handshake with application success.
- Ignoring that middleboxes may track TCP state and break odd stacks.
- Forgetting server must \`listen\` — handshake fails with RST if nothing accepts.

## Check yourself
1. Order of handshake messages?
   - Answer: SYN, SYN-ACK, ACK.
2. What does TCP promise apps?
   - Answer: reliable ordered byte stream (plus flow/congestion control).
3. Does UDP use this handshake?
   - Answer: no.

## See it
Open the **TCP Three-Way Handshake** lab. Press **Play**, then **Step** each flag. Say what each side learns after every message.`,
    content_deep_markdown: `# TCP Connection Mechanics (Deep)

## State machine highlights
LISTEN, SYN-SENT, SYN-RECEIVED, ESTABLISHED, FIN-WAIT, TIME-WAIT… Interviewers may ask why TIME_WAIT exists (old duplicates).

## Seq/ack
Byte numbering; cumulative ACKs; SACK extends recovery. Fast retransmit on duplicate ACKs.

## Options and MSS
Path MTU interactions; middlebox ossification on exotic options.

## Failure cases
- SYN floods / cookies.
- Asymmetric routing with stateful firewalls.
- Half-open connections after crashes.

## Interview tip
Explain handshake purpose (ISN sync + options) not just the mnemonic "three packets."

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "TCP Handshake and Reliable Delivery", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "TCP Handshake and Reliable Delivery" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "TCP Flow Control — Don't Overwhelm the Receiver",
    titleMatch: "TCP Flow Control%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 4: Transport Layer",
    first_principles: [
      "Flow control prevents a fast sender from overflowing a slow receiver's buffer",
      "TCP receivers advertise a window of acceptable outstanding bytes",
      "Senders must respect the advertised receive window",
      "Flow control is about the endpoint app/OS buffers — not the same as congestion control",
      "Zero windows and window updates are normal protocol events"
    ],
    learning_objectives: [
      "Define flow control vs congestion control",
      "Explain the TCP advertised window",
      "Describe what happens when the window hits zero",
      "Give an example where flow control matters",
      "Connect windows to throughput (W/RTT)"
    ],
    content_easy_markdown: `# TCP Flow Control — Don't Overwhelm the Receiver

## How it started
Even on an uncongested network, a powerful server can send faster than a tiny IoT device (or a busy app) can consume. TCP includes **flow control** so senders do not overflow **receiver buffers**.

## The simple idea
The receiver advertises: "I have room for W more bytes" (**receive window**).

The sender keeps \`outstanding_bytes ≤ window\` (also limited by congestion window later). As the app reads data, the receiver sends ACKs with a larger window. If the app stops reading, the window shrinks toward **zero** — sender must pause.

Flow control ≠ congestion control:
- **Flow**: protect the *receiver*.
- **Congestion**: protect the *network*.

## Step-by-step: zero window episode
1. Sender blasts data; receiver buffer fills.
2. ACK advertises window=0.
3. Sender stops sending new data (probes occasionally).
4. App finally reads; receiver sends window update.
5. Sender resumes.

## Real analogy
A friend taking notes while you dictate. They raise a hand (small window) when their page is full. You pause (flow control). Separately, a crowded hallway outside (congestion) may also force you to slow down — different problem.

## Worked example
Mobile app paused in background stops reading a large download. TCP window collapses; sender idle despite excellent Wi-Fi. User blames "Internet" — actually flow control + app behavior.

## Common mistakes
- Mixing up rwnd and cwnd.
- Thinking window=0 means the network path is dead.
- Ignoring that tiny windows cap throughput via W/RTT even on fat pipes.

## Check yourself
1. Who does flow control protect?
   - Answer: the receiving endpoint's buffers.
2. What does advertised window mean?
   - Answer: how many more bytes the receiver can accept right now.
3. Flow vs congestion control?
   - Answer: receiver vs network protection.

## See it
While using the **TCP** handshake lab, remember data transfer later depends on windows. Pair with Unit 2 DBP: if rwnd is tiny, you cannot fill the pipe.`,
    content_deep_markdown: `# Flow Control Details (Deep)

## Window scaling
Large BDP paths need window scale options. Without them, throughput caps near 64KB/RTT.

## Silly window syndrome
Classic interactions between small reads/writes and tiny window updates — stacks implement heuristics.

## Failure cases
- Stuck zero windows from deadlocked apps.
- Window update loss (window probes exist).
- Misinterpreting rwnd-limited flows as network congestion in metrics.

## Interview tip
Draw sender → network → receiver buffer with an advertised W arrow. Separate a second arrow labeled cwnd for congestion.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "TCP Flow Control — Don't Overwhelm the Receiver", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "TCP Flow Control — Don't Overwhelm the Receiver" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "TCP Congestion Control — Sharing the Network Fairly",
    titleMatch: "TCP Congestion Control%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 4: Transport Layer",
    first_principles: [
      "Congestion control prevents senders from collapsing shared network links",
      "TCP uses a congestion window (cwnd) to limit outstanding data",
      "Loss or delay signals often indicate congestion",
      "Slow start and congestion avoidance probe for available capacity",
      "Fairness and utilization are design goals — algorithms differ (CUBIC, BBR, …)"
    ],
    learning_objectives: [
      "Explain why congestion control is required on the Internet",
      "Describe cwnd at an intuition level",
      "Outline slow start vs congestion avoidance",
      "Distinguish congestion control from flow control again",
      "Relate loss/latency signals to sender behavior"
    ],
    content_easy_markdown: `# TCP Congestion Control — Sharing the Network Fairly

## How it started
In the 1980s the Internet suffered **congestion collapse**: rising load caused more loss/retransmits, which caused even more load. **TCP congestion control** introduced rules so endpoints voluntarily slow down when the network is in trouble — a social contract enforced in software.

## The simple idea
Besides the receiver window, TCP keeps a **congestion window (cwnd)** — how much data it may have in flight given *network* conditions.

Effective limit ≈ min(cwnd, rwnd).

Classic loss-based story:
1. **Slow start**: grow cwnd quickly to discover capacity.
2. On loss (signal of congestion): cut cwnd (historically halve) and enter **congestion avoidance** with gentler growth.
3. Repeat probing forever as conditions change.

Modern variants (CUBIC, BBR, etc.) differ in signals and growth curves, but share the goal: use bandwidth without drowning the network.

## Step-by-step: why your download ramps
1. Connection starts with a small cwnd.
2. Each ACK allows growth (slow start roughly exponential).
3. Throughput rises until a bottleneck queue overflows or delay rises.
4. Sender backs off; sawtooth or CUBIC curves appear in graphs.
5. Multiple flows sharing a link each adapt — approximate fairness.

## Real analogy
A highway on-ramp meter. If the freeway is jammed, meters slow cars. TCP is the meter for your packets. Flow control is whether *your passenger seat* has space (rwnd); congestion control is freeway traffic (cwnd).

## Worked example
Two bulk flows on a 100 Mbps bottleneck without priorities ≈ ~50 Mbps each after convergence (idealized). A third flow joins; shares drop. Open a latency-sensitive call and bufferbloat may still hurt unless AQM/QoS helps — congestion control alone is not magic.

## Common mistakes
- Treating every loss as congestion on Wi-Fi (corruption confuses classic TCP).
- Confusing cwnd with rwnd.
- Assuming "TCP is always fair" across CUBIC vs older Reno vs BBR mixes.
- Ignoring that UDP apps without CC can harm neighbors (hence QUIC/DCCP/app CC).

## Check yourself
1. What problem did congestion control address historically?
   - Answer: congestion collapse from uncontrolled retransmission/load.
2. What does cwnd limit?
   - Answer: outstanding data in flight due to network conditions.
3. Name two phases often taught?
   - Answer: slow start and congestion avoidance.

## See it
Use any **Congestion** / TCP congestion lab if present; otherwise pair **Throughput Lab** + **Delay Lab**: fill until queues grow, imagine cwnd backing off. Unit 4's congestion story is Unit 2's queues seen from the endpoint.`,
    content_deep_markdown: `# Congestion Control Algorithms (Deep)

## AIMD intuition
Additive increase / multiplicative decrease yields fairness/efficiency under simple models. CUBIC changes the increase function for high-BDP links.

## Signals
Loss (Reno/CUBIC), delay/bandwidth estimates (BBR), ECN marks. Wrong signal → underutilization or bufferbloat.

## Interaction with AQM
CoDel/PIE/ECN aim to keep queues short so latency-sensitive traffic survives bulk TCP.

## Failure cases
- Bufferbloat masking loss until delay is huge.
- Wireless bit errors triggering false congestion response.
- Reverse-path congestion on ACKs.

## Interview tip
Define collapse, state cwnd vs rwnd, sketch slow start → loss → cut → avoidance. Mention one modern CC name.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "TCP Congestion Control — Sharing the Network Fairly", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "TCP Congestion Control — Sharing the Network Fairly" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "QUIC — Transport for the Modern Web",
    titleMatch: "QUIC%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 4: Transport Layer",
    first_principles: [
      "QUIC is a modern transport running typically over UDP",
      "QUIC integrates security (TLS) and transport features",
      "Multiple streams reduce head-of-line blocking versus TCP+TLS+HTTP/2",
      "Connection migration helps roaming devices keep sessions",
      "HTTP/3 uses QUIC as its transport"
    ],
    learning_objectives: [
      "Explain why QUIC exists (ossification, latency, HOL blocking)",
      "Describe QUIC-over-UDP at a high level",
      "Relate HTTP/3 to QUIC",
      "List user-visible benefits (faster start, better loss recovery on streams)",
      "Contrast QUIC with classical TCP+TLS"
    ],
    content_easy_markdown: `# QUIC — Transport for the Modern Web

## How it started
TCP+TLS+HTTP/2 improved the Web but hit limits: TCP head-of-line blocking, slow connection startup with stacked handshakes, and middleboxes that "ossify" TCP by expecting old patterns. **QUIC**, pioneered for the Web and standardized with TLS 1.3 ideas, runs over **UDP** so it can evolve user-space transport features and power **HTTP/3**.

## The simple idea
QUIC provides:
- Secure, multiplexed **streams** over UDP
- Typically fewer round trips to start (combine transport+crypto setup)
- Stream-level delivery so one lost packet does not stall *all* streams the way TCP's single byte stream can
- Connection IDs that help **migrate** across network changes (Wi-Fi → cellular)

To the network, it often looks like UDP traffic; to apps (via HTTP/3), it feels like a faster, more resilient web transport.

## Step-by-step: why users care
1. Cold load on TCP: TCP handshake + TLS handshake (+ maybe HTTP) costs multiple RTTs.
2. QUIC aims to reduce setup RTTs when possible (0/1-RTT resumes with care).
3. On lossy mobile networks, independent streams keep other assets moving.
4. Roaming devices may keep logical connections alive across IP changes.

## Real analogy
TCP+TLS is a single-file line inside a locked room you must unlock first. QUIC is a modern venue with many parallel secure corridors (streams) and a wristband (connection ID) that still works if you change entrances (networks).

## Worked example
Loading a page with many objects on a lossy link:
- TCP HTTP/2: loss in the TCP stream can pause multiplexed progress (transport HOL).
- HTTP/3/QUIC: loss hurts the affected stream more locally; others proceed (simplified story).

## Common mistakes
- Saying "QUIC is just UDP" — UDP is the substrate; QUIC adds a lot.
- Ignoring that UDP may be blocked on some networks → fallbacks.
- Assuming 0-RTT is always safe (replay considerations).
- Thinking congestion control disappeared — QUIC still implements CC.

## Check yourself
1. What layer does QUIC typically sit on?
   - Answer: application/transport over UDP.
2. What HTTP version uses QUIC?
   - Answer: HTTP/3.
3. Name one problem QUIC targets.
   - Answer: e.g., stacked handshake latency or TCP HOL blocking / ossification.

## See it
Revisit **TCP Handshake** lab as the "classic cost," then remember QUIC's design goal of fewer RTTs and stream multiplexing for the modern Web. Packet Journey still carries the UDP datagrams underneath.`,
    content_deep_markdown: `# QUIC Design Highlights (Deep)

## User-space evolution
Implementations can update without kernel TCP ossification. UDP middleboxes still challenge deployment.

## Streams and frames
Reliable stream abstraction; flow control at connection and stream scope; QPACK for HTTP/3 headers.

## Security
TLS 1.3 integrated; most QUIC headers protected; fewer cleartext fields for middleboxes to meddle with.

## Failure cases
- Enterprise firewalls dropping UDP/443.
- CPU cost of crypto/user-space stacks.
- Debugging opacity vs TCP+TLS introspection tools.

## Interview tip
"QUIC = modern transport+security over UDP enabling HTTP/3; fights HOL and ossification."

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "QUIC — Transport for the Modern Web", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "QUIC — Transport for the Modern Web" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),
];
