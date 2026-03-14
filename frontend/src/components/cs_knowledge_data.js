export const csKnowledgeData = {
    id: "cs_root",
    label: "Computer Science",
    group: "root",
    children: [
        {
            id: "theory",
            label: "Theoretical CS",
            group: "domain",
            children: [
                {
                    id: "algo",
                    label: "Algorithms",
                    group: "core",
                    children: [
                        {
                            id: "search", label: "Searching", group: "concept", children: [
                                { id: "linear_search", label: "Linear Search", group: "detail" },
                                { id: "binary_search", label: "Binary Search", group: "detail" },
                                { id: "bfs", label: "BFS", group: "detail" },
                                { id: "dfs", label: "DFS", group: "detail" },
                                { id: "a_star", label: "A*", group: "detail" }
                            ]
                        },
                        {
                            id: "sort", label: "Sorting", group: "concept", children: [
                                { id: "bubble", label: "Bubble Sort", group: "detail" },
                                { id: "selection", label: "Selection Sort", group: "detail" },
                                { id: "insertion", label: "Insertion Sort", group: "detail" },
                                { id: "merge", label: "Merge Sort", group: "detail" },
                                { id: "quick", label: "Quick Sort", group: "detail" },
                                { id: "heap", label: "Heap Sort", group: "detail" }
                            ]
                        },
                        {
                            id: "dp", label: "Dynamic Programming", group: "concept", children: [
                                { id: "memo", label: "Memoization", group: "detail" },
                                { id: "tab", label: "Tabulation", group: "detail" },
                                { id: "lcs", label: "LCS", group: "detail" },
                                { id: "knapsack", label: "Knapsack", group: "detail" }
                            ]
                        },
                        { id: "greedy", label: "Greedy Algorithms", group: "concept" },
                        {
                            id: "graph_algo", label: "Graph Algorithms", group: "concept", children: [
                                { id: "dijkstra", label: "Dijkstra", group: "detail" },
                                { id: "bellman", label: "Bellman-Ford", group: "detail" },
                                { id: "kruskal", label: "Kruskal", group: "detail" },
                                { id: "prim", label: "Prim", group: "detail" }
                            ]
                        },
                        {
                            id: "complexity", label: "Complexity Theory", group: "concept", children: [
                                { id: "big_o", label: "Big-O", group: "detail" },
                                { id: "big_theta", label: "Big-Theta", group: "detail" },
                                { id: "big_omega", label: "Big-Omega", group: "detail" },
                                { id: "p_np", label: "P vs NP", group: "detail" }
                            ]
                        }
                    ]
                },
                {
                    id: "ds",
                    label: "Data Structures",
                    group: "core",
                    children: [
                        {
                            id: "linear_ds", label: "Linear Structures", group: "concept", children: [
                                { id: "array", label: "Arrays", group: "detail" },
                                { id: "linked", label: "Linked Lists", group: "detail" },
                                { id: "stack", label: "Stacks", group: "detail" },
                                { id: "queue", label: "Queues", group: "detail" },
                                { id: "deque", label: "Deque", group: "detail" }
                            ]
                        },
                        {
                            id: "tree_ds", label: "Trees", group: "concept", children: [
                                { id: "bst", label: "BST", group: "detail" },
                                { id: "avl", label: "AVL", group: "detail" },
                                { id: "rbt", label: "Red-Black", group: "detail" },
                                { id: "b_tree", label: "B-Tree", group: "detail" },
                                { id: "trie", label: "Trie", group: "detail" }
                            ]
                        },
                        {
                            id: "hash", label: "Hashing", group: "concept", children: [
                                { id: "hash_table", label: "Hash Table", group: "detail" },
                                { id: "collision", label: "Collision Handling", group: "detail" }
                            ]
                        },
                        { id: "heap", label: "Heaps", group: "concept" },
                        { id: "graph_ds", label: "Graphs", group: "concept" }
                    ]
                },
                {
                    id: "toc",
                    label: "Theory of Computation",
                    group: "core",
                    children: [
                        {
                            id: "automata", label: "Automata Theory", group: "concept", children: [
                                { id: "dfa", label: "DFA", group: "detail" },
                                { id: "nfa", label: "NFA", group: "detail" },
                                { id: "pda", label: "PDA", group: "detail" }
                            ]
                        },
                        { id: "formal_lang", label: "Formal Languages", group: "concept" },
                        { id: "tm", label: "Turing Machines", group: "concept" },
                        { id: "decidability", label: "Decidability", group: "concept" },
                        { id: "complexity_classes", label: "Complexity Classes", group: "concept" }
                    ]
                }
            ]
        },
        {
            id: "systems",
            label: "Computer Systems",
            group: "domain",
            children: [
                {
                    id: "os",
                    label: "Operating Systems",
                    group: "core",
                    children: [
                        { id: "process", label: "Processes", group: "concept" },
                        { id: "threads", label: "Threads", group: "concept" },
                        { id: "cpu_sched", label: "CPU Scheduling", group: "concept" },
                        { id: "deadlock", label: "Deadlocks", group: "concept" },
                        {
                            id: "memory", label: "Memory Management", group: "concept", children: [
                                { id: "paging", label: "Paging", group: "detail" },
                                { id: "segmentation", label: "Segmentation", group: "detail" },
                                { id: "virtual", label: "Virtual Memory", group: "detail" }
                            ]
                        },
                        { id: "fs", label: "File Systems", group: "concept" }
                    ]
                },
                {
                    id: "networks",
                    label: "Computer Networks",
                    group: "core",
                    children: [
                        {
                            id: "models", label: "Network Models", group: "concept", children: [
                                { id: "osi", label: "OSI", group: "detail" },
                                { id: "tcp_ip", label: "TCP/IP", group: "detail" }
                            ]
                        },
                        {
                            id: "protocols", label: "Protocols", group: "concept", children: [
                                { id: "http", label: "HTTP/HTTPS", group: "detail" },
                                { id: "tcp", label: "TCP", group: "detail" },
                                { id: "udp", label: "UDP", group: "detail" },
                                { id: "dns", label: "DNS", group: "detail" },
                                { id: "ftp", label: "FTP", group: "detail" }
                            ]
                        },
                        { id: "routing", label: "Routing", group: "concept" }
                    ]
                },
                {
                    id: "arch",
                    label: "Computer Architecture",
                    group: "core",
                    children: [
                        { id: "cpu", label: "CPU Design", group: "concept" },
                        { id: "pipeline", label: "Pipelining", group: "concept" },
                        { id: "cache", label: "Cache Memory", group: "concept" },
                        { id: "instruction", label: "Instruction Sets", group: "concept" }
                    ]
                }
            ]
        },
        {
            id: "se",
            label: "Software Engineering",
            group: "domain",
            children: [
                {
                    id: "prog_lang",
                    label: "Programming Languages",
                    group: "core",
                    children: [
                        {
                            id: "paradigms", label: "Paradigms", group: "concept", children: [
                                { id: "oop", label: "OOP", group: "detail" },
                                { id: "fp", label: "Functional", group: "detail" },
                                { id: "procedural", label: "Procedural", group: "detail" }
                            ]
                        },
                        { id: "typing", label: "Type Systems", group: "concept" },
                        { id: "compilers", label: "Compilers", group: "concept" }
                    ]
                },
                {
                    id: "web",
                    label: "Web Development",
                    group: "core",
                    children: [
                        {
                            id: "frontend", label: "Frontend", group: "concept", children: [
                                { id: "html", label: "HTML", group: "detail" },
                                { id: "css", label: "CSS", group: "detail" },
                                { id: "js", label: "JavaScript", group: "detail" },
                                { id: "react", label: "React", group: "detail" }
                            ]
                        },
                        {
                            id: "backend", label: "Backend", group: "concept", children: [
                                { id: "node", label: "Node.js", group: "detail" },
                                { id: "rest", label: "REST APIs", group: "detail" },
                                { id: "graphql", label: "GraphQL", group: "detail" }
                            ]
                        }
                    ]
                },
                {
                    id: "devops",
                    label: "DevOps",
                    group: "core",
                    children: [
                        { id: "git", label: "Version Control", group: "concept" },
                        { id: "ci_cd", label: "CI/CD", group: "concept" },
                        { id: "docker", label: "Docker", group: "concept" },
                        { id: "k8s", label: "Kubernetes", group: "concept" },
                        { id: "cloud", label: "Cloud Computing", group: "concept" }
                    ]
                }
            ]
        },
        {
            id: "ai",
            label: "Artificial Intelligence",
            group: "domain",
            children: [
                {
                    id: "ml",
                    label: "Machine Learning",
                    group: "core",
                    children: [
                        { id: "supervised", label: "Supervised Learning", group: "concept" },
                        { id: "unsupervised", label: "Unsupervised Learning", group: "concept" },
                        { id: "reinforcement", label: "Reinforcement Learning", group: "concept" }
                    ]
                },
                {
                    id: "dl",
                    label: "Deep Learning",
                    group: "core",
                    children: [
                        { id: "cnn", label: "CNN", group: "concept" },
                        { id: "rnn", label: "RNN/LSTM", group: "concept" },
                        { id: "transformer", label: "Transformers", group: "concept" }
                    ]
                },
                {
                    id: "nlp",
                    label: "Natural Language Processing",
                    group: "core",
                    children: [
                        { id: "token", label: "Tokenization", group: "concept" },
                        { id: "embedding", label: "Embeddings", group: "concept" },
                        { id: "llm", label: "LLMs", group: "concept" }
                    ]
                },
                {
                    id: "cv",
                    label: "Computer Vision",
                    group: "core",
                    children: [
                        { id: "image_proc", label: "Image Processing", group: "concept" },
                        { id: "object_det", label: "Object Detection", group: "concept" }
                    ]
                }
            ]
        },
        {
            id: "security",
            label: "Cybersecurity",
            group: "domain",
            children: [
                {
                    id: "crypto",
                    label: "Cryptography",
                    group: "core",
                    children: [
                        { id: "sym", label: "Symmetric Crypto", group: "concept" },
                        { id: "asym", label: "Asymmetric Crypto", group: "concept" },
                        { id: "hash_func", label: "Hash Functions", group: "concept" }
                    ]
                },
                {
                    id: "net_sec",
                    label: "Network Security", group: "core",
                    children: [
                        { id: "firewall", label: "Firewalls", group: "concept" },
                        { id: "ids", label: "IDS/IPS", group: "concept" }
                    ]
                },
                {
                    id: "app_sec",
                    label: "Application Security",
                    group: "core",
                    children: [
                        { id: "xss", label: "XSS", group: "concept" },
                        { id: "sql_inj", label: "SQL Injection", group: "concept" },
                        { id: "csrf", label: "CSRF", group: "concept" }
                    ]
                }
            ]
        }
    ]
};
