import { lesson } from "./helper.mjs";

const BC = "CS 411 > Unit 3: Application Layer";

export const topics = [
  lesson({
    title: "How Network Applications Talk",
    titleMatch: "How Network Applications Talk%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 3: Application Layer",
    first_principles: [
      "Network applications are processes that exchange messages over the network",
      "Client-server and peer-to-peer are two common architectural patterns",
      "Apps use transport services (TCP/UDP/QUIC) via sockets/APIs",
      "Application protocols define the messages apps understand",
      "User experience depends on both app design and lower-layer performance"
    ],
    learning_objectives: [
      "Describe client-server vs P2P at a high level",
      "Explain what an application protocol is versus TCP/IP",
      "Relate processes, sockets, and ports conceptually",
      "Give examples of app protocols (HTTP, SMTP, DNS)",
      "Preview the Unit 3 map of web, mail, DNS, CDN, sockets"
    ],
    content_easy_markdown: `# How Network Applications Talk

## How it started
Once hosts could exchange packets, people built **applications**: remote login, file transfer, email, then the Web. Each app needed a shared language on top of transport — an **application protocol**. This unit is about those languages and the architectures that use them.

## The simple idea
A network application is (at least) two programs on different hosts sending **messages**.

Common patterns:
- **Client-server**: clients open conversations with a always-on server (web browsers → web servers).
- **P2P**: peers both consume and provide (BitTorrent-style ideas; many real systems are hybrids).

Apps do not invent radio signals; they ask the OS for a **socket** — an interface to TCP or UDP (or QUIC stacks) — and then speak HTTP, SMTP, DNS, etc.

## Step-by-step: what happens when you "use an app"
1. You trigger an action (open URL, send email).
2. The app may resolve a name with DNS.
3. The app opens a transport connection or sends datagrams to an IP:port.
4. It writes protocol messages (e.g., HTTP request).
5. The peer replies with protocol messages.
6. The app presents results to you.

Lower layers carry bytes; the **application protocol** gives those bytes meaning.

## Real analogy
Shipping crates (transport) vs the language of the letters inside (application protocol). Perfect shipping of gibberish still fails the business conversation. HTTP/SMTP/DNS are letter languages.

## Worked example
Chat app:
- Architecture: often client-server via cloud (sometimes with P2P media).
- Naming: DNS to API endpoints.
- Transport: TLS over TCP or QUIC.
- App messages: JSON/WebSocket payloads — an application protocol (custom or standard).

## Common mistakes
- Saying "the app talks IP" — apps usually talk app protocols over transport APIs.
- Assuming all apps need reliable TCP — games/VoIP often use UDP with custom recovery.
- Ignoring that servers must be reachable (ports, firewalls, reverse proxies).
- Confusing architecture (client-server) with protocol (HTTP).

## Check yourself
1. What is an application protocol?
   - Answer: rules/messages that apps use to understand each other.
2. Client-server vs P2P in one line?
   - Answer: dedicated servers vs peers both serving/consuming (hybrids common).
3. What OS abstraction do apps typically use?
   - Answer: sockets (or higher frameworks wrapping them).

## See it
Keep **Full Stack Protocol** / DNS → TCP → HTTP labs in mind as Unit 3 proceeds. Each stage is a different conversation layered on the last.`,
    content_deep_markdown: `# Application Architectures (Deep)

## Process model
Communicating processes identified by IP + port (+ protocol). Concurrency: thread-per-client, event loops, reverse proxies.

## Service requirements
Apps choose transport based on needs: reliable in-order (file transfer) vs timely partially unreliable (interactive media). Designing app-level recovery on UDP is common.

## APIs and middleboxes
HTTP dominates as a universal substrate (even for APIs that are not "web pages"). Middleboxes understand HTTP/TLS differently than raw custom TCP — operational reality shapes design.

## Failure cases
- Chatty app protocols on high-RTT links.
- Hard-coded IPs bypassing DNS — operational nightmare.
- Single-region servers without CDN/anycast → latency floors.

## Interview tip
Separate "architecture," "application protocol," and "transport" in three bullets before diving deep.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "How Network Applications Talk", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "How Network Applications Talk" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "HTTP and the Web Request Pipeline",
    titleMatch: "HTTP and the Web%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 3: Application Layer",
    first_principles: [
      "HTTP is a request/response application protocol for the Web and APIs",
      "Methods and status codes express intent and outcomes",
      "HTTPS is HTTP over a secure transport (TLS)",
      "A page load is a pipeline: DNS, connect, TLS, HTTP, render, more fetches",
      "HTTP versions evolve performance (1.1, 2, 3) without changing core semantics"
    ],
    learning_objectives: [
      "Describe an HTTP request and response at field level (high level)",
      "Explain the end-to-end web request pipeline",
      "Distinguish HTTP vs HTTPS",
      "Recognize common status code classes",
      "Use HTTP-oriented labs to step the pipeline"
    ],
    content_easy_markdown: `# HTTP and the Web Request Pipeline

## How it started
Tim Berners-Lee's Web needed a simple way to fetch documents. **HTTP** (Hypertext Transfer Protocol) began as a minimal request/response language and grew into the planet's default application protocol for browsers and APIs.

## The simple idea
HTTP messages are mostly:
- **Request**: method + path + headers (+ optional body). Example: \`GET /index.html\`.
- **Response**: status code + headers + body. Example: \`200 OK\` with HTML.

**HTTPS** means those HTTP semantics travel inside a cryptographically protected channel (TLS), so eavesdroppers cannot easily read or alter content.

Before HTTP starts, earlier CS 411 pieces chain together: DNS finds an address, transport connects, TLS may handshake, *then* HTTP request bytes flow.

## Step-by-step: loading a page
1. DNS lookup for the hostname (unless cached).
2. TCP connect (or QUIC setup for HTTP/3).
3. TLS handshake for HTTPS.
4. HTTP request(s) for the document.
5. Parse HTML → discover CSS/JS/images.
6. More HTTP requests (often many).
7. Render. Latency compounds across the pipeline.

## Real analogy
Ordering at a restaurant with a secure private booth (TLS):
- Menu language = HTTP methods/paths.
- Waiter bringing dishes = responses.
- Finding the restaurant address = DNS.
- Getting a table = transport connection.

## Worked example
\`GET /api/user\` → \`401 Unauthorized\` means the HTTP conversation worked, but auth failed — not "the Internet is down." \`502 Bad Gateway\` often means a proxy could not reach an upstream app. Different layers, different fixes.

## Common mistakes
- Thinking HTTPS is a totally different document language — semantics are still HTTP.
- Ignoring how many requests a modern page makes.
- Blaming DNS forever when TLS certificates expired.
- Using GET for state-changing operations carelessly (cache/semantics issues).

## Check yourself
1. Typical order for HTTPS page load?
   - Answer: DNS → connect (TCP/QUIC) → TLS → HTTP → render (with more fetches).
2. Is HTTPS a different language than HTTP?
   - Answer: same HTTP semantics, encrypted/authenticated transport.
3. What does a 404 tell you?
   - Answer: server understood the request but resource missing — transport likely fine.

## See it
Use the **Full Stack Protocol** lab (DNS → TCP → TLS → HTTP → render) if available, and any **HTTP** lab tied to this topic. Press **Play**, then **Step**. Name the CS 411 concept behind each stage.`,
    content_deep_markdown: `# HTTP in the Stack (Deep)

## Methods and status codes
GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS… 2xx success, 3xx redirect, 4xx client, 5xx server. Interview polish: 401 vs 403, 301 vs 302, 502 vs 504.

## Version evolution
- HTTP/1.1: textual headers, persistent connections; many parallel TCP connections historically.
- HTTP/2: binary frames, multiplexed streams, HPACK.
- HTTP/3: HTTP over QUIC/UDP; improved loss recovery and migration.

## Caching and CDNs
Cache-Control, ETag, Vary — correctness vs speed. CDNs push content to the edge (later lesson).

## Failure cases
- Expired certs; SNI mismatches.
- DNS to stale IP after cutover.
- Mixed content on HTTPS pages.
- WAF 403s looking like "network" failures.

## Capstone mental model
Packets → IP → transport → DNS names → HTTP intent. Debugging means naming the failed stage.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "HTTP and the Web Request Pipeline", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "HTTP and the Web Request Pipeline" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "Cookies, Caches, and Faster Web (HTTP/2)",
    titleMatch: "Cookies, Caches%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 3: Application Layer",
    first_principles: [
      "HTTP is stateless by default; cookies add client-side state for servers",
      "Caches store responses to avoid repeating expensive fetches",
      "Correctness headers matter as much as speed headers",
      "HTTP/2 multiplexes streams to reduce head-of-line blocking at HTTP layer",
      "Performance is a stack: DNS, TCP/TLS, HTTP version, caching, CDN"
    ],
    learning_objectives: [
      "Explain why cookies exist on a stateless protocol",
      "Describe browser and intermediary caching at a high level",
      "List what HTTP/2 improves versus HTTP/1.1",
      "Identify privacy and security caveats of cookies",
      "Connect caching to perceived web speed"
    ],
    content_easy_markdown: `# Cookies, Caches, and Faster Web (HTTP/2)

## How it started
HTTP's early design treated each request as independent — simple, but awkward for "keep me logged in" and "don't re-download the logo every time." **Cookies** carried state; **caches** reused responses; later **HTTP/2** redesigned framing for multiplexed performance.

## The simple idea
- **Cookies**: server asks browser to store small key/value data and send it back on later requests (session IDs, preferences). Powerful and privacy-sensitive.
- **Caches**: browser (or CDN/proxy) stores a response and reuses it if headers say it is fresh enough.
- **HTTP/2**: multiple requests share one connection with binary frames and header compression — less stalling than many HTTP/1.1 workarounds.

## Step-by-step: a faster repeat visit
1. First visit: full DNS/TLS/HTTP fetch of HTML/CSS/JS.
2. Responses include \`Cache-Control\` / \`ETag\` information.
3. Cookie may mark your session.
4. Second visit: browser uses cached static assets; only revalidates or fetches what changed.
5. With HTTP/2, many small assets multiplex efficiently on one connection.

## Real analogy
Library card (cookie) proves who you are on each visit. Photocopy machine (cache) avoids re-fetching the same textbook page. HTTP/2 is a better conveyor belt carrying many books at once instead of one-at-a-time lines.

## Worked example
A 2 MB homepage with 50 tiny icons:
- HTTP/1.1 browsers historically opened multiple connections to avoid blocking.
- HTTP/2 multiplexes streams — still watch TLS and server push myths; measure.
- Proper caching of icons can make repeat views feel instant.

## Common mistakes
- Storing secrets in non-HttpOnly cookies readable by XSS.
- Caching personalized pages publicly (privacy leak).
- Assuming HTTP/2 fixes bad API design (too many round trips still hurt).
- Ignoring that cache *incorrectness* is worse than slowness.

## Check yourself
1. Why do cookies exist?
   - Answer: to add state on top of stateless HTTP.
2. What do caches save?
   - Answer: repeated transfers of reusable responses.
3. Name one HTTP/2 benefit.
   - Answer: multiplexed streams / binary framing / header compression.

## See it
When stepping an **HTTP** pipeline lab, notice repeated asset fetches. Ask: "Would a cache skip this?" That question is web performance thinking.`,
    content_deep_markdown: `# Web Performance Levers (Deep)

## Cookie attributes
Secure, HttpOnly, SameSite — mitigate theft and CSRF classes of bugs. Partitioned cookies evolve with browser privacy.

## Cache hierarchy
Browser cache, reverse proxy, CDN POP, origin. \`Vary\` and authentication complicate correctness. Stale-while-revalidate patterns trade freshness.

## HTTP/2/3 specifics
HPACK/QPACK; stream priorities (evolving); HOL blocking moves under TCP for H2 ( motivating H3/QUIC).

## Failure cases
- Cache poisoning / ambiguous keys.
- Cookie bombs and header bloat.
- Third-party cookie loss breaking SSO assumptions.

## Interview tip
Order levers: reduce RTT count, cache, compress, upgrade protocol, move content closer (CDN).

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "Cookies, Caches, and Faster Web (HTTP/2)", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "Cookies, Caches, and Faster Web (HTTP/2)" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "Email and SMTP — Messages Across Servers",
    titleMatch: "Email and SMTP%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 3: Application Layer",
    first_principles: [
      "Email is store-and-forward across mail servers, not only a direct client-to-client chat",
      "SMTP is the protocol commonly used to transfer mail between servers (and submit from clients)",
      "User agents retrieve mail with protocols like IMAP/POP (separate from SMTP send path)",
      "DNS MX records point to mail exchangers for a domain",
      "Spam and authentication (SPF/DKIM/DMARC) are operational realities"
    ],
    learning_objectives: [
      "Sketch the path of an email from sender UA to receiver UA",
      "Explain SMTP's role versus IMAP/POP",
      "Relate MX records to mail delivery",
      "Describe store-and-forward at application layer",
      "List why email authentication exists"
    ],
    content_easy_markdown: `# Email and SMTP — Messages Across Servers

## How it started
Email predates the Web. The Internet needed a reliable way to pass messages between administrative domains. **SMTP** (Simple Mail Transfer Protocol) became the workhorse for moving mail from server to server, while users read inboxes with other protocols.

## The simple idea
Sending mail is usually:
1. Your mail app submits a message to your provider (often SMTP submission).
2. Your provider's servers use SMTP to relay toward the recipient's domain.
3. DNS **MX** records tell senders which hosts accept mail for \`@example.com\`.
4. The message waits in the recipient's mailbox store.
5. The recipient fetches it with **IMAP** or **POP** (or a webmail HTTP UI).

Email is classic **store-and-forward** at the application layer — messages can sit on servers, unlike a live phone call.

## Step-by-step: Alice → Bob
1. Alice writes to \`bob@b.org\`.
2. Alice's server looks up MX for \`b.org\`.
3. SMTP dialogue delivers the message to Bob's mail exchanger.
4. If Bob's server is down, Alice's server queues and retries — application-level reliability.
5. Bob later syncs inbox via IMAP.

## Real analogy
Postal service between cities. SMTP is the truck protocol between post offices. IMAP is you checking your P.O. box. MX records are the published address of Bob's post office for his domain.

## Worked example
You send a PDF resume. The body and attachment are encoded in mail formats (MIME). Size limits, spam filters, and authentication checks may reject or delay — the network can be fine while mail policy blocks delivery.

## Common mistakes
- Thinking SMTP is how your phone "reads" mail (that's usually IMAP/web).
- Ignoring MX DNS as part of the pipeline.
- Assuming instant delivery — queues and greylisting exist.
- Forgetting spoofing: without SPF/DKIM/DMARC, From: addresses are easy to forge.

## Check yourself
1. What do MX records do?
   - Answer: name the mail servers that accept mail for a domain.
2. SMTP vs IMAP?
   - Answer: SMTP moves/submits mail; IMAP retrieves/manages mailbox.
3. Why can email arrive minutes later?
   - Answer: store-and-forward queues and retries.

## See it
No single cartoon replaces mail, but map it onto **Packet Journey**: your message still rides packets; SMTP is the *language* between mail hosts. DNS labs matter because MX is DNS data.`,
    content_deep_markdown: `# Mail Transfer Reality (Deep)

## SMTP dialogue
Client/server commands: EHLO, MAIL FROM, RCPT TO, DATA. Extensions (STARTTLS, AUTH size limits). Submission (587) vs transfer (25) operational split.

## Abuse and auth
SPF authorizes sending IPs; DKIM signs messages; DMARC policies align identifiers. Deliverability is a socio-technical problem.

## Failure cases
- Open relays (historical disasters).
- Misconfigured MX → blackholes.
- TLS downgrade and certificate issues on mail paths.
- Attachment malware scanning delaying mail.

## Interview tip
Draw UA → MSA → MTAs → MDA → UA and label SMTP vs IMAP.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "Email and SMTP — Messages Across Servers", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "Email and SMTP — Messages Across Servers" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "DNS — Names to Addresses",
    titleMatch: "DNS%",
    importance_level: "Critical",
    breadcrumb_path: "CS 411 > Unit 3: Application Layer",
    first_principles: [
      "DNS maps human-readable names to IP addresses (and other records)",
      "Resolution is hierarchical: stub → resolver → root/TLD/authoritative",
      "Caching makes the Internet fast enough to use",
      "DNS failures look like 'the Internet is down' even when IP connectivity works",
      "Security and authenticity (DNSSEC, DoH/DoT) matter in modern deployments"
    ],
    learning_objectives: [
      "Explain why DNS exists",
      "Trace a recursive lookup at a high level",
      "Define A/AAAA and MX record roles",
      "Describe caching and TTLs simply",
      "Use the DNS Lookup lab Play/Step controls"
    ],
    content_easy_markdown: `# DNS — Names to Addresses

## How it started
People remember names; routers need numbers. Hosts.txt files did not scale. The **Domain Name System (DNS)** distributed the namespace hierarchically so the Internet could grow without a single mega-file of every host.

## The simple idea
DNS is a global directory:
- You ask: "What IP is \`must.edu\`?"
- DNS answers with records (e.g., **A** for IPv4, **AAAA** for IPv6).
- Other record types exist (**MX** for mail, **CNAME** aliases, **TXT** for policies, etc.).

Usually your device asks a **recursive resolver** (ISP or public 1.1.1.1/8.8.8.8). The resolver walks the hierarchy if needed: root → TLD (like \`.edu\`) → authoritative servers for the name.

## Step-by-step: a lookup
1. Browser checks its cache; OS checks its cache.
2. Query goes to the configured resolver.
3. Resolver uses cached answers when fresh (TTL not expired).
4. On cold miss: query root hints → referral to TLD → referral to authoritative → answer.
5. Resolver caches and returns the IP to you.
6. Your app connects to that IP.

## Real analogy
Phone contacts vs phone network. You look up "Clinic" to get a number, then dial. DNS is the contact book; IP is the number. Wrong book entry → you call the wrong clinic even if the phone network works.

## Worked example
\`example.com\` → \`93.184.216.34\` (illustrative). If DNS is broken but you hardcode the IP in a tool, the site may load — proving the failure was naming, not transit. Captive portals often intercept DNS — another clue.

## Common mistakes
- Confusing DNS failure with total connectivity failure.
- Ignoring TTLs when cutovers "don't propagate."
- Using only one resolver with no fallback.
- Forgetting clients cache aggressively.

## Check yourself
1. What does an A record map?
   - Answer: name → IPv4 address.
2. Who usually walks the hierarchy for you?
   - Answer: a recursive resolver.
3. What does TTL control?
   - Answer: how long caches may reuse an answer.

## See it
Open the **DNS Lookup** lab. Press **Play**/ **Step** through stub → resolver → root → TLD → authoritative. Say what each actor knows.`,
    content_deep_markdown: `# DNS Internals (Deep)

## Recursive vs iterative
Resolvers perform recursion for stubs; upper servers often respond with referrals (iterative). Authority and zones matter for operations.

## Caching and consistency
TTLs create eventual consistency. Low TTL aids failover but increases load. Negative caching also exists.

## Security
DNSSEC authenticates records; DoT/DoH encrypt client-resolver channel. Cache poisoning history motivates randomization and DNSSEC.

## Failure cases
- Split-horizon DNS confusion on VPN.
- NXDOMAIN vs SERVFAIL differences.
- CDN dual-A records and geo-DNS changing answers by resolver location.

## Interview tip
Narrate the hierarchy cold-cache path in under a minute — classic screening question.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "DNS — Names to Addresses", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "DNS — Names to Addresses" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "CDNs and Streaming Video",
    titleMatch: "CDNs and Streaming%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 3: Application Layer",
    first_principles: [
      "CDNs replicate content at edge locations closer to users",
      "The goal is lower latency, higher throughput, and origin offload",
      "Streaming typically downloads chunks over HTTP with adaptive bitrate",
      "DNS and anycast often steer clients to a nearby CDN node",
      "Buffering hides jitter; rebuffering reveals bottlenecks"
    ],
    learning_objectives: [
      "Explain what a CDN is and why sites use one",
      "Describe adaptive streaming in plain language",
      "Relate CDN edge caches to Unit 2 delay/throughput",
      "Identify origin vs edge roles",
      "Connect streaming quality switches to measured throughput"
    ],
    content_easy_markdown: `# CDNs and Streaming Video

## How it started
As the Web went global, a single origin server could not serve every photo and video efficiently. **Content Delivery Networks (CDNs)** place copies of content in many cities. Streaming video then evolved to fetch small **chunks** at bitrates that match your current throughput.

## The simple idea
A **CDN** is a distributed cache network:
- Origin holds the master content.
- Edge servers (PoPs) hold copies near users.
- You often get steered to a nearby edge via DNS or anycast routing.

**Streaming** usually means: download video segment files over HTTP(S), play from a buffer, and switch quality (360p↔1080p) as throughput changes — **adaptive bitrate (ABR)**.

## Step-by-step: press play on a video
1. Player fetches a manifest listing available qualities and chunk URLs.
2. DNS/CDN maps those URLs to a nearby edge.
3. Player downloads the next few chunks into a buffer.
4. If throughput drops, request lower-bitrate chunks.
5. If throughput rises and buffer healthy, step quality up.
6. Origin is contacted mainly on cache misses or dynamic content.

## Real analogy
Instead of one mega-bookstore shipping every paperback worldwide, local pop-up shops stock popular titles (CDN edges). Streaming is reading chapter booklets (chunks) and choosing large-print vs tiny-print editions based on how fast booklets arrive.

## Worked example
Cross-ocean origin RTT 120 ms; nearby CDN RTT 15 ms. Static assets feel snappier; video startup improves. During Wi-Fi congestion, ABR ladders down so playback continues — throughput lesson from Unit 2 in action.

## Common mistakes
- Thinking CDN means "no origin ever."
- Confusing live streaming delays with VOD chunking.
- Blaming only video codecs when the bottleneck is last-mile throughput.
- Forgetting HTTPS/TLS still applies to CDN hosts (certificates, SNI).

## Check yourself
1. What problem do CDNs solve?
   - Answer: move popular content closer; reduce latency and origin load.
2. What is adaptive bitrate?
   - Answer: switching quality/chunks based on measured network conditions.
3. Why buffer video?
   - Answer: absorb jitter and short throughput dips.

## See it
Revisit **Throughput** and **Delay** labs mentally: CDN reduces effective distance (delay) and can raise achievable throughput by avoiding congested long paths. Packet labs still carry the chunks.`,
    content_deep_markdown: `# CDN and Streaming Systems (Deep)

## Mapping and caching
DNS geo-steering, anycast PoPs, cache keys, purge/invalidate. Hit ratio drives economics.

## ABR algorithms
Buffer-based vs rate-based vs hybrid. Too aggressive upswitches cause rebuffering.

## Protocol stack
Often HTTP/2 or HTTP/3 to CDN; TLS session reuse matters for startup. CMAF/DASH/HLS are packaging families.

## Failure cases
- Cache stampedes on cold popular objects.
- Wrong Cache-Control on personalized content.
- Regional outages: failover to farther PoP raises RTT.

## Interview tip
Tie CDN to RTT and bottleneck shift; tie streaming to ABR + buffer as application-layer congestion response.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "CDNs and Streaming Video", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "CDNs and Streaming Video" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),

  lesson({
    title: "Socket Programming — Your First Network Program",
    titleMatch: "Socket Programming%",
    importance_level: "Essential",
    breadcrumb_path: "CS 411 > Unit 3: Application Layer",
    first_principles: [
      "A socket is an OS endpoint for sending/receiving network data",
      "TCP sockets provide a bidirectional byte stream between processes",
      "UDP sockets send/receive datagrams without connection setup",
      "Server sockets listen on a well-known port; clients connect to IP:port",
      "Application protocols are just byte messages over sockets"
    ],
    learning_objectives: [
      "Define socket in practical terms",
      "Contrast TCP listen/accept/connect with UDP send/receive",
      "Explain host:port addressing for applications",
      "Sketch a tiny client-server exchange",
      "Connect sockets to HTTP/DNS as 'just messages on transport'"
    ],
    content_easy_markdown: `# Socket Programming — Your First Network Program

## How it started
Before fancy frameworks, programmers needed a simple OS abstraction to use TCP/IP. The **Berkeley sockets** API won: create a socket, bind/listen/connect, send/receive bytes. Almost every modern network library still wraps this idea.

## The simple idea
A **socket** is your program's doorway to the network.

**TCP pattern (server)**
1. \`socket\` → \`bind\` to a port → \`listen\`
2. \`accept\` a client connection
3. \`recv\`/\`send\` bytes (your application protocol)
4. close when done

**TCP pattern (client)**
1. \`socket\` → \`connect\` to server IP:port
2. \`send\`/\`recv\`
3. close

**UDP**: no connect handshake required (optional connect for defaults); \`sendto\`/\`recvfrom\` datagrams.

## Step-by-step: mental mini-lab
1. Server listens on port 5000.
2. Client connects to \`127.0.0.1:5000\`.
3. Client sends \`HELLO\\n\`.
4. Server replies \`OK\\n\`.
5. That is an application protocol with two message types — crude but real.

Replace HELLO with HTTP bytes and you have a baby web stack.

## Real analogy
Sockets are phone handsets. The phone network (IP/TCP) delivers sound; the language you speak (English vs HTTP) is the application protocol. Binding a port is publishing your extension number at an office.

## Worked example
A Python or Node "echo server" assignment: whatever the client sends, the server returns. You will feel: blocking vs non-blocking I/O, partial reads (TCP is a stream — message boundaries are your job), and "address already in use" when ports stick in TIME_WAIT.

## Common mistakes
- Assuming one \`recv\` returns one application message (TCP stream vs UDP datagrams).
- Hardcoding ports without handling conflicts.
- Forgetting to flush or frame messages.
- Binding only to localhost when you meant LAN access (or the reverse — security!).

## Check yourself
1. What does a server \`listen\`+\`accept\` do?
   - Answer: wait for and accept incoming TCP connections on a port.
2. TCP vs UDP sockets in one line?
   - Answer: streams with connections vs datagrams without the same reliability.
3. Who defines message meaning over a socket?
   - Answer: your application protocol.

## See it
After socket basics, the **TCP Three-Way Handshake** lab shows what \`connect\` waits for underneath. DNS and HTTP labs show real message formats you could send as raw bytes.`,
    content_deep_markdown: `# Sockets Beyond Hello World (Deep)

## Addressing
AF_INET/AF_INET6, ephemeral client ports, SO_REUSEADDR semantics. Dual-stack gotchas.

## Framing
Length prefixes, delimiters, or HTTP-style parsers. Never assume TCP preserves write-sized reads.

## Concurrency
Thread-per-connection, select/poll/epoll/kqueue, async runtimes. Head-of-line in app logic still matters.

## Failure cases
- Partial writes on nonblocking sockets.
- UDP large datagrams exceeding path MTU silently failing.
- TLS wrapping sockets (STARTTLS vs separate ports).

## Interview tip
Explain stream vs message boundaries clearly — filters out people who only called libraries.

## Quantitative intuition
Whenever you can, run a quick numbers check: pick a packet length L, a link rate R, and a distance d. Compare transmission delay L/R to propagation delay d/s. If a send window W and an RTT are known, estimate W/RTT and compare it to the bottleneck rate. Those three comparisons — delay terms, throughput caps, and pipe volume — turn vague "it feels slow" reports into testable hypotheses for this topic.

## Design trade-offs
Every mechanism optimizes something and risks something else: reliability versus latency, simplicity versus fairness, endpoint control versus middlebox policy, global addressing versus address sharing, cache freshness versus hit ratio. When you study "Socket Programming — Your First Network Program", name the objective and the failure mode in one breath. Interviewers reward that framing more than acronym lists.

## Operational debugging checklist
1. Reproduce and scope: one user, one site, one network path, or a widespread outage?
2. Separate naming (DNS), reachability (IP/ICMP), transport (ports and handshakes), and application success (HTTP, TLS, mail).
3. Measure RTT to the local gateway versus a remote target; note loss and jitter when tools allow.
4. Identify the last hop or layer that still worked; change one variable at a time.
5. Account for middleboxes: NAT mappings, firewalls, proxies, load balancers, and CDNs rewrite the textbook path.

## Exam and interview phrasing
Lead with a one-sentence definition, give a concrete example, then state a realistic failure case. Example pattern: define the idea, show a host/router/app scenario, then say what breaks when assumptions fail. Practiced aloud, that structure makes "Socket Programming — Your First Network Program" sound like engineering judgment rather than memorization.

## What to practice next
Re-answer the Essential Check yourself prompts without looking. Re-run any lab named in See it. Teach the core idea to a classmate in about ninety seconds. If that is hard, the gap is usually earlier vocabulary (packet, delay, layer, port) rather than a missing advanced formula. Strengthen the foundation, then return to this Deep section.
`,
  }),
];
