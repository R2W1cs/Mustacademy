/**
 * Per-lesson interactive labs for CS 411.
 * Each lesson gets 1–2 detailed, lesson-specific animations (not recycled clones).
 * Returns: [{ type, config }]
 */

const timeline = (title, subtitle, steps) => ({
    type: 'timeline',
    config: { title, subtitle, steps },
});

const delivery = (title, subtitle, hops) => ({
    type: 'delivery',
    config: { title, subtitle, hops },
});

/** Exact lesson title → unique lab(s) */
const LESSON_LABS = {
    'Welcome to Computer Networks — Your Zero-to-Hero Map': [
        delivery(
            'Hook: one message, end-to-end',
            'You tap Send — watch how that message actually gets delivered',
            [
                { label: 'You', detail: 'Type “hey” and hit Send', layer: 'App' },
                { label: 'DNS', detail: 'chat.app → finds server IP', layer: 'Name' },
                { label: 'TCP', detail: 'Handshake opens a reliable pipe', layer: 'Transport' },
                { label: 'Home router', detail: 'First hop onto the Internet', layer: 'Network' },
                { label: 'ISP / core', detail: 'Routers forward packet by packet', layer: 'Network' },
                { label: 'Server', detail: 'Delivers “hey” to your friend’s inbox', layer: 'App' },
            ],
        ),
        timeline(
            'Course map in motion',
            'What each unit trains you to see in that delivery path',
            [
                { actor: 'Unit 1', text: 'Hosts, packets, layers — vocabulary for the path' },
                { actor: 'Unit 2', text: 'Why delivery can feel slow (delays & queues)' },
                { actor: 'Unit 3', text: 'Apps: DNS names, HTTP, email' },
                { actor: 'Unit 4', text: 'Transport: ports, UDP vs TCP reliability' },
                { actor: 'Unit 5–6', text: 'IP forwarding + how routes are decided' },
                { actor: 'Unit 7–8', text: 'Wi-Fi frames locally; TLS/VPN for safety' },
            ],
        ),
    ],

    'What Is the Internet, Really?': [
        timeline(
            'Network of networks',
            'Your home net is tiny — the Internet is many nets glued together',
            [
                { actor: 'Home LAN', text: 'Phone ↔ Wi-Fi router (one small network)' },
                { actor: 'ISP AS', text: 'Your ISP’s routers carry you toward the world' },
                { actor: 'Peering', text: 'ISP hands packets to another network (transit/peer)' },
                { actor: 'Cloud AS', text: 'Destination company’s network owns the server' },
                { actor: 'Server host', text: 'End system finally receives your packets' },
            ],
        ),
    ],

    'What Is a Protocol?': [
        timeline(
            'Protocol = shared script',
            'Both sides must know the same rules or the conversation fails',
            [
                { actor: 'Alice', text: 'Sends: “HELLO, I speak Protocol v1”' },
                { actor: 'Bob', text: 'Replies: “OK, v1 — send your request”' },
                { actor: 'Alice', text: 'Sends structured fields Bob expects' },
                { actor: 'Mismatch', text: 'If Bob expects v2 fields → silence / error' },
                { actor: 'Lesson', text: 'HTTP, TCP, DNS are all scripts like this' },
            ],
        ),
    ],

    'Packets, Hosts, and Links': [
        timeline(
            'One file → many packets',
            'Hosts create packets; links carry them; nothing travels as one giant blob',
            [
                { actor: 'Host A', text: 'Photo = 3 MB → sliced into ~2000 packets' },
                { actor: 'Packet #1', text: 'Header (where to) + small data chunk' },
                { actor: 'Link', text: 'Bits on Wi-Fi / fiber / cable' },
                { actor: 'Host B', text: 'Reassembles chunks into the photo' },
                { actor: 'Loss', text: 'If packet #47 drops, only that chunk retries (with TCP)' },
            ],
        ),
    ],

    'The Network Edge — How You Connect': [
        timeline(
            'You live at the edge',
            'Access network → first router → then the core',
            [
                { actor: 'Device', text: 'Phone/laptop runs apps (end system)' },
                { actor: 'Access', text: 'Wi-Fi, fiber ONT, or cellular radio' },
                { actor: 'CPE router', text: 'Home/office gateway, often does NAT' },
                { actor: 'ISP edge', text: 'First provider router — leaving “your” network' },
                { actor: 'Beyond', text: 'Core / peering starts — you rarely control this' },
            ],
        ),
    ],

    'The Network Core — Routers and Switching': [
        timeline(
            'Inside the core',
            'Routers forward; they do not open your chat app',
            [
                { actor: 'Ingress', text: 'Packet arrives on an input port' },
                { actor: 'Lookup', text: 'Match destination prefix → output port' },
                { actor: 'Switch fabric', text: 'Move packet to the chosen output' },
                { actor: 'Egress', text: 'Transmit on the next link' },
                { actor: 'No app logic', text: 'Router usually ignores HTTP body — only IP header' },
            ],
        ),
    ],

    'Packet Switching vs Circuit Switching': [
        timeline(
            'Reserved call vs shared packets',
            'Old phone = circuit; Internet = packets sharing links',
            [
                { actor: 'Circuit', text: 'Reserve A→B path for the whole call' },
                { actor: 'Idle waste', text: 'Silence still holds the reserved capacity' },
                { actor: 'Packet', text: 'Each chunk carries an address; links are shared' },
                { actor: 'Stat mux', text: 'Many flows mix — efficient, variable delay' },
                { actor: 'Internet choice', text: 'Packet switching won at global scale' },
            ],
        ),
    ],

    'OSI and TCP/IP Network Models': [
        timeline(
            'Layers of responsibility',
            'Each layer only talks to the one above/below',
            [
                { actor: 'L7 App', text: 'Browser: “GET /index.html”' },
                { actor: 'L4 Transport', text: 'TCP: ports + reliable byte stream' },
                { actor: 'L3 Network', text: 'IP: source/dest addresses, hop-by-hop' },
                { actor: 'L2 Link', text: 'Ethernet/Wi-Fi frame to next hop MAC' },
                { actor: 'L1 Phy', text: 'Radio / light / voltage pulses' },
                { actor: 'TCP/IP view', text: 'App · Transport · Internet · Link (4 layers)' },
            ],
        ),
    ],

    'Encapsulation — Wrapping Messages Layer by Layer': [
        timeline(
            'Envelope inside envelope',
            'Going down the stack: wrap; going up: unwrap',
            [
                { actor: 'Data', text: 'Your HTTP bytes' },
                { actor: '+ TCP', text: 'Add ports / seq / ack header' },
                { actor: '+ IP', text: 'Add IP addresses' },
                { actor: '+ Frame', text: 'Add MAC addresses for this hop' },
                { actor: 'Wire', text: 'Bits leave the NIC' },
                { actor: 'Far side', text: 'Unwrap frame → IP → TCP → HTTP' },
            ],
        ),
    ],

    'Why Networks Feel Slow — The Four Delays': [
        timeline(
            'Four delays on every hop',
            'Total latency ≈ sum of these — not just “bad Wi-Fi”',
            [
                { actor: 'Processing', text: 'Router CPU looks up the next hop (µs–ms)' },
                { actor: 'Queuing', text: 'Waiting behind other packets (can explode)' },
                { actor: 'Transmission', text: 'Push L bits at rate R → L/R' },
                { actor: 'Propagation', text: 'Signal travel time ≈ distance / speed' },
                { actor: 'Debug tip', text: 'Far away → prop; busy hour → queue' },
            ],
        ),
    ],

    'Queuing, Loss, and Congestion Basics': [
        timeline(
            'When the buffer fills',
            'Arrive faster than the link can drain → queue → drop',
            [
                { actor: 'Influx', text: 'Bursts arrive from many flows' },
                { actor: 'Buffer', text: 'Packets wait in a FIFO queue' },
                { actor: 'Drain', text: 'Link transmits one at a time' },
                { actor: 'Overflow', text: 'Buffer full → drop (loss signal)' },
                { actor: 'Congestion', text: 'Senders must slow down or keep losing' },
            ],
        ),
    ],

    'Throughput and Bottlenecks': [
        timeline(
            'Slowest hop wins',
            'End-to-end throughput ≈ min link rate on the path',
            [
                { actor: 'Wi-Fi', text: '40 Mbps air link' },
                { actor: 'Fiber uplink', text: '300 Mbps to ISP' },
                { actor: 'Server NIC', text: '1 Gbps — not the limit' },
                { actor: 'Bottleneck', text: 'You feel ~40 Mbps — the Wi-Fi hop' },
                { actor: 'Fix', text: 'Upgrade the min hop, not the already-fast ones' },
            ],
        ),
    ],

    'Delay-Bandwidth Product': [
        timeline(
            'Pipe capacity in flight',
            'DBP = bandwidth × RTT — bytes that fill the pipe',
            [
                { actor: 'RTT', text: 'Round trip 100 ms' },
                { actor: 'Rate', text: 'Link 100 Mbps' },
                { actor: 'DBP', text: '≈ 1.25 MB “in the pipe”' },
                { actor: 'Window', text: 'Sender must keep ~DBP outstanding for full use' },
                { actor: 'Too small', text: 'Tiny window → idle pipe → low throughput' },
            ],
        ),
    ],

    'Reading Real Paths — Traceroute Intuition': [
        timeline(
            'Traceroute hop-by-hop',
            'TTL expires → ICMP reply reveals each router',
            [
                { actor: 'TTL=1', text: 'First router answers — hop 1' },
                { actor: 'TTL=2', text: 'Second router — hop 2' },
                { actor: '…', text: 'Keep increasing TTL' },
                { actor: 'Destination', text: 'Host finally responds' },
                { actor: 'Readout', text: 'Each line = a hop + RTT sample' },
            ],
        ),
    ],

    'How Network Applications Talk': [
        timeline(
            'Client–server conversation',
            'Apps use sockets; the network only carries bytes',
            [
                { actor: 'Client app', text: 'Opens a socket to server:443' },
                { actor: 'Request', text: 'Sends an application message (HTTP, etc.)' },
                { actor: 'Server app', text: 'Reads, computes, writes a response' },
                { actor: 'Close', text: 'Connection ends (or stays warm)' },
                { actor: 'Key idea', text: 'Apps speak protocols; IP just delivers' },
            ],
        ),
    ],

    'HTTP and the Web Request Pipeline': [
        timeline(
            'Loading a page — the pipeline',
            'Name → connect → secure → GET → bytes → render',
            [
                { actor: 'URL', text: 'You enter https://must.edu' },
                { actor: 'DNS', text: 'Name → IP address' },
                { actor: 'TCP', text: 'Three-way handshake' },
                { actor: 'TLS', text: 'Encrypt the channel' },
                { actor: 'HTTP', text: 'GET / → 200 OK + HTML' },
                { actor: 'Browser', text: 'Parse, fetch assets, paint' },
            ],
        ),
    ],

    'Cookies, Caches, and Faster Web (HTTP/2)': [
        timeline(
            'Remember me + don’t re-download',
            'Cookies identify you; caches skip the network',
            [
                { actor: 'Set-Cookie', text: 'Server stores a session id in your browser' },
                { actor: 'Next visit', text: 'Cookie rides along automatically' },
                { actor: 'Cache hit', text: 'Browser uses local copy — no round trip' },
                { actor: 'HTTP/2', text: 'Many streams on one TCP connection' },
                { actor: 'Win', text: 'Fewer handshakes, less waiting' },
            ],
        ),
    ],

    'Email and SMTP — Messages Across Servers': [
        timeline(
            'Mail is store-and-forward',
            'Your app rarely talks to their phone directly',
            [
                { actor: 'Compose', text: 'You hit Send in the mail app' },
                { actor: 'Your SMTP', text: 'Submission to your provider' },
                { actor: 'MX lookup', text: 'DNS finds their mail servers' },
                { actor: 'Relay', text: 'SMTP hop to destination MX' },
                { actor: 'Mailbox', text: 'Stored until they fetch (IMAP)' },
            ],
        ),
    ],

    'DNS — Names to Addresses': [
        timeline(
            'Hierarchical name lookup',
            'Root → TLD → authoritative → answer',
            [
                { actor: 'Stub', text: 'Browser asks the OS / resolver' },
                { actor: 'Resolver', text: 'Asks root: who owns .edu?' },
                { actor: 'TLD', text: 'Points to must.edu nameservers' },
                { actor: 'Auth', text: 'Returns A/AAAA record (the IP)' },
                { actor: 'Cache', text: 'Remember for TTL seconds' },
            ],
        ),
    ],

    'CDNs and Streaming Video': [
        timeline(
            'Fetch from a nearby edge',
            'CDN caches content close to viewers',
            [
                { actor: 'Request', text: 'Play video on your phone' },
                { actor: 'DNS/Anycast', text: 'Steer you to a nearby PoP' },
                { actor: 'Edge cache', text: 'Hit → stream locally' },
                { actor: 'Miss', text: 'Pull once from origin, then cache' },
                { actor: 'Result', text: 'Lower delay, less backbone load' },
            ],
        ),
    ],

    'Socket Programming — Your First Network Program': [
        timeline(
            'Socket lifecycle',
            'Create → bind/connect → send/recv → close',
            [
                { actor: 'socket()', text: 'Ask the OS for an endpoint' },
                { actor: 'bind/listen', text: 'Server waits on a port' },
                { actor: 'connect', text: 'Client dials that IP:port' },
                { actor: 'send/recv', text: 'Exchange bytes' },
                { actor: 'close', text: 'Tear down; OS frees the port' },
            ],
        ),
    ],

    'Transport Layer — Ports and Multiplexing': [
        timeline(
            'One IP, many conversations',
            'Ports demux apps sharing an address',
            [
                { actor: 'Browser :443', text: 'HTTPS to a web server' },
                { actor: 'Chat :5222', text: 'Another socket, same Wi-Fi IP' },
                { actor: 'Game :27015', text: 'UDP datagrams for live play' },
                { actor: 'OS demux', text: 'Incoming packet → matching (IP,port)' },
                { actor: 'Lesson', text: 'Transport gives apps the illusion of private pipes' },
            ],
        ),
    ],

    'UDP — Fast and Simple Datagrams': [
        timeline(
            'Fire and forget',
            'UDP: no handshake, no retry — just datagrams',
            [
                { actor: 'Send', text: 'App writes a datagram to a port' },
                { actor: 'Wire', text: 'IP delivers (best effort)' },
                { actor: 'Arrive?', text: 'Maybe — no ACK built in' },
                { actor: 'Order?', text: 'Maybe reordered — app must cope' },
                { actor: 'Use when', text: 'Latency > perfect reliability (games/VoIP/DNS)' },
            ],
        ),
    ],

    'Reliable Data Transfer — From Dreams to Protocols': [
        timeline(
            'Building reliability',
            'ACKs, sequence numbers, timers, retransmit',
            [
                { actor: 'Seq #', text: 'Label every chunk' },
                { actor: 'ACK', text: 'Receiver confirms what arrived' },
                { actor: 'Timer', text: 'No ACK in time → retransmit' },
                { actor: 'Dup detect', text: 'Ignore duplicates using seq' },
                { actor: 'TCP', text: 'Industrial version of this idea' },
            ],
        ),
    ],

    'TCP Handshake and Reliable Delivery': [
        timeline(
            'SYN → SYN-ACK → ACK',
            'Three packets to agree on starting sequence numbers',
            [
                { actor: 'Client', text: 'SYN — “I want to talk, seq=100”' },
                { actor: 'Server', text: 'SYN-ACK — “OK, seq=500, ack=101”' },
                { actor: 'Client', text: 'ACK — “Ready, ack=501”' },
                { actor: 'Data', text: 'Now send bytes with reliable delivery' },
                { actor: 'FIN later', text: 'Graceful close when done' },
            ],
        ),
    ],

    'TCP Flow Control — Don\'t Overwhelm the Receiver': [
        timeline(
            'Receiver window',
            'Sender never sends more than the receiver can buffer',
            [
                { actor: 'rwnd', text: 'Receiver advertises free buffer space' },
                { actor: 'Sender', text: 'Caps in-flight data to rwnd' },
                { actor: 'App slow', text: 'rwnd shrinks → sender pauses' },
                { actor: 'App drains', text: 'rwnd grows → sender resumes' },
                { actor: '≠ congestion', text: 'Flow control = receiver; congestion = network' },
            ],
        ),
    ],

    'TCP Congestion Control — Sharing the Network Fairly': [
        timeline(
            'AIMD / cwnd dance',
            'Probe up, cut on loss — share the bottleneck',
            [
                { actor: 'Slow start', text: 'cwnd grows aggressively at first' },
                { actor: 'Probe', text: 'Additively increase while ACKs arrive' },
                { actor: 'Loss', text: 'Timeout / triple-dup ACK' },
                { actor: 'Cut', text: 'Multiplicative decrease cwnd' },
                { actor: 'Fairness', text: 'Flows sharing a link converge roughly fairly' },
            ],
        ),
    ],

    'QUIC — Transport for the Modern Web': [
        timeline(
            'HTTP/3 over QUIC',
            'TLS+transport in user space, fewer round trips',
            [
                { actor: 'UDP', text: 'QUIC rides on UDP datagrams' },
                { actor: '0/1-RTT', text: 'Faster setup than TCP+TLS stacked' },
                { actor: 'Streams', text: 'Independent streams — no head-of-line block' },
                { actor: 'Migration', text: 'Connection ID survives Wi-Fi→LTE' },
                { actor: 'Web', text: 'HTTP/3 = HTTP semantics on QUIC' },
            ],
        ),
    ],

    'Forwarding vs Routing — Two Jobs of the Network Layer': [
        timeline(
            'Decide vs move',
            'Routing builds the map; forwarding uses it per packet',
            [
                { actor: 'Routing', text: 'Control plane computes best next hops' },
                { actor: 'Table', text: 'FIB / forwarding table installed' },
                { actor: 'Packet in', text: 'Data plane matches destination prefix' },
                { actor: 'Forward', text: 'Send out the chosen interface' },
                { actor: 'Speed', text: 'Forwarding is hot path; routing is slower' },
            ],
        ),
    ],

    'Inside a Router — Match, Switch, Forward': [
        timeline(
            'Match → switch → forward',
            'Hardware path of a single packet',
            [
                { actor: 'Parse', text: 'Read IP destination' },
                { actor: 'Match', text: 'Longest-prefix match in the FIB' },
                { actor: 'Fabric', text: 'Cross to output port' },
                { actor: 'Queue', text: 'Maybe wait if output busy' },
                { actor: 'TX', text: 'Serialize onto the outbound link' },
            ],
        ),
    ],

    'IP Addressing and Subnets': [
        timeline(
            'Network bits vs host bits',
            'Street name (network) + house number (host)',
            [
                { actor: 'Address', text: '192.168.1.42/24' },
                { actor: '/24', text: 'First 24 bits = network' },
                { actor: 'Host', text: 'Last 8 bits pick the device' },
                { actor: 'Same subnet', text: 'Direct delivery via L2' },
                { actor: 'Other subnet', text: 'Send to the default gateway' },
            ],
        ),
    ],

    'DHCP — Getting an Address Automatically': [
        timeline(
            'DORA handshake',
            'Discover → Offer → Request → Ack',
            [
                { actor: 'Discover', text: 'Client: “Anyone giving out IPs?”' },
                { actor: 'Offer', text: 'Server: “Try 192.168.1.50”' },
                { actor: 'Request', text: 'Client: “I’ll take .50”' },
                { actor: 'Ack', text: 'Server: lease + gateway + DNS' },
                { actor: 'Configured', text: 'Host can now leave the LAN' },
            ],
        ),
    ],

    'NAT — Many Devices, One Public IP': [
        timeline(
            'Rewrite and remember',
            'Private → public mapping in the NAT table',
            [
                { actor: 'LAN', text: '192.168.1.10:51515 → internet' },
                { actor: 'NAT', text: 'Rewrite to 203.0.113.8:40001' },
                { actor: 'WAN', text: 'Servers only see the public IP:port' },
                { actor: 'Reply', text: 'Return to :40001' },
                { actor: 'Un-NAT', text: 'Map back to 192.168.1.10:51515' },
            ],
        ),
    ],

    'IPv6 — The Next Address Space': [
        timeline(
            'Bigger addresses, same idea',
            '128-bit addresses; still prefixes + host interface IDs',
            [
                { actor: 'IPv4 pain', text: '4B addresses exhausted / NAT everywhere' },
                { actor: 'IPv6', text: 'Huge space — every device can be unique' },
                { actor: 'Prefix', text: 'Network portion still routes by prefix' },
                { actor: 'SLAAC/DHCPv6', text: 'Ways to autoconfigure' },
                { actor: 'Coexist', text: 'Dual-stack and transition mechanisms' },
            ],
        ),
    ],

    'Middleboxes and the IP Hourglass': [
        timeline(
            'Thin waist, fat edges — plus middleboxes',
            'IP stays simple; firewalls/NAT sit in the middle',
            [
                { actor: 'Hourglass', text: 'Many apps / many links; one IP waist' },
                { actor: 'NAT', text: 'Rewrites addresses at the edge' },
                { actor: 'Firewall', text: 'Allows/drops by policy' },
                { actor: 'Proxy', text: 'May terminate connections mid-path' },
                { actor: 'Reality', text: 'End-to-end purity meets middleboxes' },
            ],
        ),
    ],

    'Control Plane vs Data Plane — Who Decides, Who Forwards': [
        timeline(
            'Brain vs muscle',
            'Control decides; data plane executes at line rate',
            [
                { actor: 'Control', text: 'OSPF/BGP/SDN compute routes' },
                { actor: 'Install', text: 'Push entries into the FIB' },
                { actor: 'Data plane', text: 'Every packet: match & forward' },
                { actor: 'Failure', text: 'Control reconverges; data uses last-known' },
                { actor: 'SDN twist', text: 'Controller can be logically centralized' },
            ],
        ),
    ],

    'Routing Algorithms — Link State and Distance Vector': [
        timeline(
            'Two classic ways to compute paths',
            'Link-state = global map; DV = neighbor gossip',
            [
                { actor: 'Link state', text: 'Flood topology → run Dijkstra' },
                { actor: 'Distance vector', text: 'Share “best cost to X” with neighbors' },
                { actor: 'LS', text: 'DV can count to infinity without care' },
                { actor: 'Scale', text: 'Internet uses hierarchy (IGP + BGP)' },
                { actor: 'Output', text: 'Next-hop per prefix' },
            ],
        ),
    ],

    'OSPF — Routing Inside an AS': [
        timeline(
            'OSPF link-state inside one AS',
            'Areas + LSAs → shortest paths',
            [
                { actor: 'Hello', text: 'Discover neighbors' },
                { actor: 'LSA flood', text: 'Advertise link state' },
                { actor: 'LSDB', text: 'Shared topology database' },
                { actor: 'SPF', text: 'Compute shortest paths' },
                { actor: 'Intra-AS', text: 'Does not replace BGP between ASes' },
            ],
        ),
    ],

    'BGP — How the Internet Glues Domains Together': [
        timeline(
            'BGP between ASes',
            'Policy + path attributes, not just shortest hop count',
            [
                { actor: 'eBGP', text: 'Exchange prefixes with another AS' },
                { actor: 'AS_PATH', text: 'List of ASes already traversed' },
                { actor: 'Policy', text: 'Prefer/avoid paths for business reasons' },
                { actor: 'iBGP', text: 'Distribute learned routes inside the AS' },
                { actor: 'Internet glue', text: 'This is how domains interconnect' },
            ],
        ),
    ],

    'SDN Controllers — Programming the Network': [
        timeline(
            'Logically centralized control',
            'Controller installs rules; switches forward',
            [
                { actor: 'App intent', text: '“Isolate tenant A from B”' },
                { actor: 'Controller', text: 'Computes flow rules' },
                { actor: 'Southbound', text: 'Push rules to switches' },
                { actor: 'Data plane', text: 'Match fields → action at line rate' },
                { actor: 'Flexibility', text: 'Change policy without box-by-box CLI' },
            ],
        ),
    ],

    'Link Layer Job — Frames, MAC, and Local Delivery': [
        timeline(
            'One hop at a time',
            'Frames deliver to the next MAC on this link',
            [
                { actor: 'IP packet', text: 'Needs to cross this Ethernet/Wi-Fi segment' },
                { actor: 'Frame', text: 'Add dest/src MAC + checksum' },
                { actor: 'Local only', text: 'MAC is meaningful on this LAN' },
                { actor: 'Next hop', text: 'May be the gateway, not the final server' },
                { actor: 'Strip', text: 'Receiver unwraps frame → IP again' },
            ],
        ),
    ],

    'Ethernet and Switching — From Shared Cable to Full Duplex': [
        timeline(
            'Hubs vs switches',
            'Switches learn MACs and forward selectively',
            [
                { actor: 'Old hub', text: 'Everyone hears everyone (collisions)' },
                { actor: 'Learn', text: 'Switch records src MAC ↔ port' },
                { actor: 'Forward', text: 'Send frame only toward dest port' },
                { actor: 'Flood', text: 'Unknown dest → flood, then learn' },
                { actor: 'Full duplex', text: 'Modern links: send & receive together' },
            ],
        ),
    ],

    'ARP — IP Addresses Meet MAC Addresses': [
        timeline(
            'Who has this IP?',
            'ARP maps IP → MAC on the LAN',
            [
                { actor: 'Need MAC', text: 'Want to send to 192.168.1.50' },
                { actor: 'ARP req', text: 'Broadcast: “Who has .50?”' },
                { actor: 'Owner', text: 'Replies with aa:bb:cc:dd:ee:ff' },
                { actor: 'Cache', text: 'Store mapping for a while' },
                { actor: 'Frame', text: 'Now build Ethernet frame correctly' },
            ],
        ),
    ],

    'Wireless LANs — Wi-Fi Collisions and Access Points': [
        timeline(
            'Listen before talk',
            'CSMA/CA — shared radio needs politeness',
            [
                { actor: 'Sense', text: 'Is the channel busy?' },
                { actor: 'Backoff', text: 'Wait random time if busy' },
                { actor: 'TX', text: 'Send frame to the AP' },
                { actor: 'ACK', text: 'AP acknowledges or client retries' },
                { actor: 'Wired', text: 'AP bridges onto Ethernet / ISP' },
            ],
        ),
    ],

    'From Home Wi-Fi to Cellular — Mobility Intuition': [
        timeline(
            'Keep the session while moving',
            'IP may change; apps/transport must cope',
            [
                { actor: 'Home Wi-Fi', text: 'Stable private IP via NAT' },
                { actor: 'Walk out', text: 'Leave Wi-Fi → cellular radio' },
                { actor: 'New IP', text: 'Carrier assigns a new address' },
                { actor: 'Break?', text: 'Old TCP may die; QUIC can migrate' },
                { actor: 'Design', text: 'Mobility is a first-class network problem' },
            ],
        ),
    ],

    'Threats on the Wire — Sniffing, Spoofing, DoS': [
        timeline(
            'Attack shapes on the path',
            'Listen, pretend, or overwhelm',
            [
                { actor: 'Sniff', text: 'Passive capture of cleartext frames' },
                { actor: 'Spoof', text: 'Forge source IP/MAC identity' },
                { actor: 'DoS', text: 'Flood until service collapses' },
                { actor: 'Mitigate', text: 'Encrypt, authenticate, filter, rate-limit' },
                { actor: 'Mindset', text: 'Assume hostile links on the public Internet' },
            ],
        ),
    ],

    'Confidentiality with Cryptography — Keys and TLS Intuition': [
        timeline(
            'TLS in one glance',
            'Agree on keys, then encrypt application bytes',
            [
                { actor: 'Hello', text: 'Client/server negotiate algorithms' },
                { actor: 'Cert', text: 'Server proves identity (PKI)' },
                { actor: 'Keys', text: 'Derive shared secrets' },
                { actor: 'Record', text: 'HTTP (etc.) rides encrypted' },
                { actor: 'Result', text: 'Sniffers see ciphertext, not your password' },
            ],
        ),
    ],

    'Firewalls and Secure Network Design': [
        timeline(
            'Policy on the door',
            'Default-deny + allow what business needs',
            [
                { actor: 'Inbound', text: 'Unsolicited SSH from Internet → DROP' },
                { actor: 'Outbound', text: 'HTTPS :443 from laptops → ALLOW' },
                { actor: 'Stateful', text: 'Return traffic for allowed flows → ALLOW' },
                { actor: 'Zones', text: 'DMZ hosts public apps; LAN stays private' },
                { actor: 'Least privilege', text: 'Open only required ports' },
            ],
        ),
    ],

    'VPNs — Private Tunnels Across a Public Internet': [
        timeline(
            'Encrypt + wrap',
            'Private feel over public pipes',
            [
                { actor: 'App packet', text: 'Destined to a private work IP' },
                { actor: 'VPN client', text: 'Encrypt and encapsulate' },
                { actor: 'Internet', text: 'Only sees gateway ↔ gateway' },
                { actor: 'Gateway', text: 'Decrypt, deliver on private net' },
                { actor: 'Remote work', text: 'Laptop acts “inside” from a café' },
            ],
        ),
    ],

    'Putting It All Together — A Secure Page Load Hero Capstone': [
        delivery(
            'Hero path: secure page load',
            'Everything you learned — one HTTPS visit',
            [
                { label: 'Browser', detail: 'https://shop.example', layer: 'App' },
                { label: 'DNS', detail: 'Name → IP (+CDN steer)', layer: 'App' },
                { label: 'TCP/QUIC', detail: 'Transport session', layer: 'Transport' },
                { label: 'TLS', detail: 'Authenticate + encrypt', layer: 'Security' },
                { label: 'Routers', detail: 'IP hops across ASes', layer: 'Network' },
                { label: 'Edge/origin', detail: 'HTTP 200 + HTML/assets', layer: 'App' },
            ],
        ),
        timeline(
            'Defense in depth on that path',
            'DNS authenticity, TLS, firewalls, least privilege',
            [
                { actor: 'DNS', text: 'Right IP? (cache poisoning risk)' },
                { actor: 'TLS', text: 'Right server? Encrypted?' },
                { actor: 'Firewall', text: 'Only needed ports open' },
                { actor: 'App', text: 'Auth cookies / tokens secured' },
                { actor: 'Hero', text: 'You can narrate the whole chain' },
            ],
        ),
    ],
};

/**
 * @param {string} title
 * @returns {{ type: string, config: object }[]}
 */
export function resolveNetworkLabs(title = '') {
    const exact = LESSON_LABS[title];
    if (exact?.length) return exact.map((l) => ({ ...l, config: { ...l.config } }));

    // Non-networks courses: no forced labs
    const t = title.toLowerCase();
    if (!/network|internet|tcp|udp|ip |dns|http|router|packet|osi|wifi|ethernet|bgp|ospf|nat|vpn|tls|socket|smtp|quic|subnet|dhcp|arp|firewall|congestion|throughput|latency|protocol|cdn|wireless/.test(t)) {
        return [];
    }

    // Keyword fallback — still unique-ish timeline, not a pile of recycled generics
    return [
        timeline(
            title,
            'Lesson-focused walkthrough',
            [
                { actor: 'Hook', text: `Why ${title} shows up in real systems` },
                { actor: 'Idea', text: 'One clear mental model' },
                { actor: 'Steps', text: 'Cause → effect on the wire' },
                { actor: 'Check', text: 'What breaks if this layer fails?' },
            ],
        ),
    ];
}
