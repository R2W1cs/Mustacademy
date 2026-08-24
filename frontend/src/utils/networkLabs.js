/**
 * CS 411 Networks — which interactive lab animation(s) mount on each lesson.
 * Multiple labs are intentional when a concept has several moving parts.
 */
const LAB = {
    packet: 'packet',
    osi: 'osi',
    tcp: 'tcp',
    dns: 'dns',
    routing: 'routing',
    ip: 'ip',
    delay: 'delay',
    throughput: 'throughput',
    congestion: 'congestion',
    http: 'http',
    nat: 'nat',
    multiplex: 'multiplex',
    circuit: 'circuit',
    arp: 'arp',
    wifi: 'wifi',
    firewall: 'firewall',
    vpn: 'vpn',
    smtp: 'smtp',
};

/** Exact title → ordered list of lab types (never empty for CS 411 titles). */
const BY_TITLE = {
    'Welcome to Computer Networks — Your Zero-to-Hero Map': [LAB.packet, LAB.osi, LAB.http],
    'What Is the Internet, Really?': [LAB.packet, LAB.routing],
    'What Is a Protocol?': [LAB.tcp, LAB.packet],
    'Packets, Hosts, and Links': [LAB.packet, LAB.ip],
    'The Network Edge — How You Connect': [LAB.packet, LAB.nat],
    'The Network Core — Routers and Switching': [LAB.routing, LAB.packet],
    'Packet Switching vs Circuit Switching': [LAB.circuit, LAB.packet],
    'OSI and TCP/IP Network Models': [LAB.osi, LAB.packet],
    'Encapsulation — Wrapping Messages Layer by Layer': [LAB.osi, LAB.packet],

    'Why Networks Feel Slow — The Four Delays': [LAB.delay, LAB.packet],
    'Queuing, Loss, and Congestion Basics': [LAB.congestion, LAB.delay],
    'Throughput and Bottlenecks': [LAB.throughput, LAB.delay],
    'Delay-Bandwidth Product': [LAB.delay, LAB.throughput],
    'Reading Real Paths — Traceroute Intuition': [LAB.routing, LAB.delay, LAB.packet],

    'How Network Applications Talk': [LAB.http, LAB.dns],
    'HTTP and the Web Request Pipeline': [LAB.http, LAB.dns, LAB.tcp],
    'Cookies, Caches, and Faster Web (HTTP/2)': [LAB.http, LAB.dns],
    'Email and SMTP — Messages Across Servers': [LAB.smtp, LAB.dns],
    'DNS — Names to Addresses': [LAB.dns, LAB.packet],
    'CDNs and Streaming Video': [LAB.http, LAB.dns, LAB.routing],
    'Socket Programming — Your First Network Program': [LAB.multiplex, LAB.tcp],

    'Transport Layer — Ports and Multiplexing': [LAB.multiplex, LAB.tcp],
    'UDP — Fast and Simple Datagrams': [LAB.multiplex, LAB.packet],
    'Reliable Data Transfer — From Dreams to Protocols': [LAB.tcp, LAB.congestion],
    'TCP Handshake and Reliable Delivery': [LAB.tcp, LAB.packet],
    'TCP Flow Control — Don\'t Overwhelm the Receiver': [LAB.tcp, LAB.congestion],
    'TCP Congestion Control — Sharing the Network Fairly': [LAB.congestion, LAB.tcp],
    'QUIC — Transport for the Modern Web': [LAB.http, LAB.tcp],

    'Forwarding vs Routing — Two Jobs of the Network Layer': [LAB.routing, LAB.packet],
    'Inside a Router — Match, Switch, Forward': [LAB.routing, LAB.ip],
    'IP Addressing and Subnets': [LAB.ip, LAB.packet],
    'DHCP — Getting an Address Automatically': [LAB.ip, LAB.packet],
    'NAT — Many Devices, One Public IP': [LAB.nat, LAB.ip],
    'IPv6 — The Next Address Space': [LAB.ip, LAB.packet],
    'Middleboxes and the IP Hourglass': [LAB.nat, LAB.firewall],

    'Control Plane vs Data Plane — Who Decides, Who Forwards': [LAB.routing, LAB.packet],
    'Routing Algorithms — Link State and Distance Vector': [LAB.routing],
    'OSPF — Routing Inside an AS': [LAB.routing, LAB.packet],
    'BGP — How the Internet Glues Domains Together': [LAB.routing],
    'SDN Controllers — Programming the Network': [LAB.routing, LAB.packet],

    'Link Layer Job — Frames, MAC, and Local Delivery': [LAB.packet, LAB.arp],
    'Ethernet and Switching — From Shared Cable to Full Duplex': [LAB.packet, LAB.arp],
    'ARP — IP Addresses Meet MAC Addresses': [LAB.arp, LAB.ip],
    'Wireless LANs — Wi-Fi Collisions and Access Points': [LAB.wifi, LAB.packet],
    'From Home Wi-Fi to Cellular — Mobility Intuition': [LAB.wifi, LAB.packet, LAB.routing],

    'Threats on the Wire — Sniffing, Spoofing, DoS': [LAB.packet, LAB.firewall],
    'Confidentiality with Cryptography — Keys and TLS Intuition': [LAB.http, LAB.tcp],
    'Firewalls and Secure Network Design': [LAB.firewall, LAB.packet],
    'VPNs — Private Tunnels Across a Public Internet': [LAB.vpn, LAB.packet],
    'Putting It All Together — A Secure Page Load Hero Capstone': [LAB.http, LAB.dns, LAB.tcp, LAB.routing],
};

const FALLBACK_RULES = [
    { test: (t) => /welcome|zero-to-hero|zero to hero/.test(t), labs: [LAB.packet, LAB.osi] },
    { test: (t) => /\bosi\b|encapsulation|network models/.test(t), labs: [LAB.osi, LAB.packet] },
    { test: (t) => /delay|feel slow|traceroute|bandwidth product/.test(t), labs: [LAB.delay, LAB.packet] },
    { test: (t) => /throughput|bottleneck/.test(t), labs: [LAB.throughput, LAB.delay] },
    { test: (t) => /congestion|queuing|queueing|flow control/.test(t), labs: [LAB.congestion, LAB.tcp] },
    { test: (t) => /\bnat\b|public ip|middlebox/.test(t), labs: [LAB.nat, LAB.ip] },
    { test: (t) => /\bhttp\b|web request|cookies|cdn|streaming|secure page|page load/.test(t), labs: [LAB.http, LAB.dns] },
    { test: (t) => /\bsmtp\b|email/.test(t), labs: [LAB.smtp, LAB.dns] },
    { test: (t) => /handshake|reliable|\/?\btcp\b|quic/.test(t), labs: [LAB.tcp, LAB.packet] },
    { test: (t) => /\budp\b|multiplex|ports|socket|transport layer/.test(t), labs: [LAB.multiplex, LAB.packet] },
    { test: (t) => /\bdns\b|names to addresses/.test(t), labs: [LAB.dns, LAB.packet] },
    { test: (t) => /routing|forwarding|ospf|bgp|control plane|sdn|network core|router/.test(t), labs: [LAB.routing, LAB.packet] },
    { test: (t) => /ip address|subnet|dhcp|ipv6|\barp\b/.test(t), labs: [LAB.ip, LAB.packet] },
    { test: (t) => /wi-?fi|wireless|cellular|mobility/.test(t), labs: [LAB.wifi, LAB.packet] },
    { test: (t) => /firewall|threat|sniff|spoof|dos/.test(t), labs: [LAB.firewall, LAB.packet] },
    { test: (t) => /\bvpn\b|tunnel|tls|crypto/.test(t), labs: [LAB.vpn, LAB.http] },
    { test: (t) => /circuit/.test(t), labs: [LAB.circuit, LAB.packet] },
    { test: (t) => /ethernet|link layer|frame|mac/.test(t), labs: [LAB.packet, LAB.arp] },
    { test: (t) => /packet|internet|protocol|edge|host|link/.test(t), labs: [LAB.packet] },
];

/**
 * @param {string} title
 * @returns {string[]} lab type ids (at least one for networks-ish titles)
 */
export function resolveNetworkLabs(title = '') {
    const exact = BY_TITLE[title];
    if (exact?.length) return [...exact];

    const t = title.toLowerCase();
    for (const rule of FALLBACK_RULES) {
        if (rule.test(t)) return [...rule.labs];
    }
    // Networks course safety net: never blank if it looks like CS 411
    if (/network|internet|tcp|udp|ip |dns|http|router|packet|osi|wifi|ethernet/.test(t)) {
        return [LAB.packet];
    }
    return [];
}

export { LAB };
