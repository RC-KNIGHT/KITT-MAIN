import { EcosystemProduct, CommunityProject, Testimonial, PricingPlan } from '../types';

export const ECOSYSTEM_PRODUCTS: EcosystemProduct[] = [
  {
    id: 'kitt-ai',
    name: 'KITT AI',
    tagline: 'Autonomous AI Electronics Engineering Agent',
    shortDescription: 'Describe your invention in plain text. KITT reasons about electrical requirements, selects components, wires circuits, and writes code.',
    longDescription: 'The intelligent front door of the KITT ecosystem. Powered by specialized hardware design models, KITT AI turns conversational prompts into production schematics, bill of materials, and validation checks.',
    url: '#/kitt-ai',
    category: 'Autonomous AI',
    status: 'Live',
    badge: 'Flagship Agent',
    iconName: 'Bot',
    accentColor: '#FFFFFF', // Antique Gold
    capabilities: [
      'Natural Language Requirement Extraction',
      'Automated Bill-of-Materials (BOM) Synthesis',
      'Rule-Based Design Verification (DRC)',
      'Firmware Generation & Pin Mapping',
      'Instant Transfer to 2D/3D Workspace'
    ],
    roleInEcosystem: 'System Architecture & Agentic Generation',
    targetAudience: 'Makers, Hardware Engineers, Inventors',
    demoMetrics: [
      { label: 'Prompt-to-Circuit', value: '< 4 sec' },
      { label: 'Component Catalog', value: '45,000+' },
      { label: 'Code Gen Accuracy', value: '99.4%' }
    ]
  },
  {
    id: 'kitt-workspace',
    name: 'KITT Engineering Workspace',
    tagline: 'Interactive 2D Schematics & 3D Breadboard Lab',
    shortDescription: 'Unified physical breadboarding and engineering schematic environment with deterministic mixed-signal simulation and instrument telemetry.',
    longDescription: 'A synchronized hardware workbench where 2D schematics and 3D physical breadboards share the exact same canonical electrical netlist. Manipulate components, hook up virtual oscilloscopes, and test firmware in real-time.',
    url: '#/workspace',
    category: '3D & Simulation',
    status: 'Live',
    badge: 'Core Lab',
    iconName: 'Cpu',
    accentColor: '#8F8F8F', // Oceanic Teal
    capabilities: [
      'Bidirectional 2D Schematic & 3D Breadboard Sync',
      'Deterministic Mixed-Signal Simulation',
      'Virtual Multimeter & 4-Channel Oscilloscope',
      'Microcontroller In-Circuit Emulation',
      'Direct Click Component Telemetry & Footprints'
    ],
    roleInEcosystem: 'Physical Prototyping, Simulation & 3D Lab',
    targetAudience: 'Electronics Students, Embedded Developers, Hardware Teams',
    demoMetrics: [
      { label: 'Sync Latency', value: '0 ms (Shared State)' },
      { label: 'Instruments', value: '5 Virtual Tools' },
      { label: '3D Precision', value: 'Sub-millimeter' }
    ]
  },
  {
    id: 'digilogic-gates',
    name: 'DigiLogic Simulator',
    tagline: 'Interactive Digital Logic, Gates & Waveform Analyzer',
    shortDescription: 'Master fundamental logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR), build complex combinatorial logic, and inspect live truth tables.',
    longDescription: 'An interactive digital logic design suite. Assemble full adders, multiplexers, ALU blocks, and sequential flip-flops. Real-time signal propagation and timing diagrams make digital abstractions transparent.',
    url: '#/digilogic',
    category: 'Digital Logic',
    status: 'Live',
    badge: 'Logic Engine',
    iconName: 'Binary',
    accentColor: '#F5F5F5', // Alabaster Sand
    capabilities: [
      '7 Primary Logic Gates + Complex IC Blocks',
      'Dynamic Truth Table Auto-Generation',
      'Real-time Propagation Delay & Waveforms',
      'Multi-bit Bus Routing & Logic Probes',
      'Export Netlists to KITT Workspace'
    ],
    roleInEcosystem: 'Digital Systems & Computer Architecture Logic',
    targetAudience: 'CS & EE Students, Digital Designers, Educators',
    demoMetrics: [
      { label: 'Gate Types', value: 'All 7 Primaries + ICs' },
      { label: 'Clock Speed', value: 'Up to 10 MHz Sim' },
      { label: 'Analysis', value: 'Live Truth Tables' }
    ]
  },
  {
    id: 'number-trainer',
    name: 'Number Trainer',
    tagline: 'Binary, Hexadecimal & Digital Arithmetic Mastery',
    shortDescription: 'Build the mental arithmetic and conversion fluency required for electronics: Binary, Octal, Decimal, Hex, and Two\'s Complement.',
    longDescription: 'The mathematical foundation of all computer engineering. Speed drills, bitwise operations (AND/OR/XOR/Shifts), binary addition, and interactive visual memory maps designed for students and self-learners.',
    url: '#/number-trainer',
    category: 'Foundations & Math',
    status: 'Live',
    badge: 'Foundations',
    iconName: 'Calculator',
    accentColor: '#FFFFFF', // Antique Gold
    capabilities: [
      'Binary ↔ Decimal ↔ Hex ↔ Octal Instant Drills',
      'Bitwise Logic Operations (Masking, Bit Shifts)',
      'Signed Numbers & Two\'s Complement Practice',
      'Speed Challenge Modes with Accuracy Telemetry',
      'Direct Conceptual Bridge to Digital Gate Design'
    ],
    roleInEcosystem: 'Number Systems & Computational Foundations',
    targetAudience: 'Students, Beginners, Aspiring Hardware Hackers',
    demoMetrics: [
      { label: 'Skill Modules', value: '8 Math Modes' },
      { label: 'Challenge Drills', value: 'Infinite Practice' },
      { label: 'Fluency Boost', value: '3.5x Faster Conversions' }
    ]
  }
];

export const JOURNEY_STEPS = [
  {
    step: '01',
    id: 'idea',
    title: 'Natural Language Idea',
    shortTitle: 'Idea',
    description: 'Describe what you envision in conversational language. No CAD syntax or netlist knowledge needed.',
    badge: 'Input',
    example: '"Build an automatic soil moisture monitoring system with an ESP32, 5V water pump, and battery backup."'
  },
  {
    step: '02',
    id: 'requirements',
    title: 'Requirements Extraction',
    shortTitle: 'Extract',
    description: 'KITT isolates operating voltages, current consumption requirements, sensor accuracy, and safety constraints.',
    badge: 'AI Analysis',
    example: 'Power: 3.7V LiPo → 5V Step-up; Logic: 3.3V GPIO; Inductive kickback clamp required for motor.'
  },
  {
    step: '03',
    id: 'components',
    title: 'Component Selection',
    shortTitle: 'Select',
    description: 'Deterministic component matching from a verified library of microcontrollers, discrete semiconductors, and ICs.',
    badge: 'Catalog Matching',
    example: 'ESP32 DevKit v1, Capacitive Moisture v1.2, IRLZ44N N-Ch MOSFET, 1N4007 Diode, 10kΩ Resistor.'
  },
  {
    step: '04',
    id: 'schematic',
    title: '2D Schematic Synthesis',
    shortTitle: 'Schematic',
    description: 'Automatic netlist generation with clean, orthogonal signal flow from power rails to sensors to driver stages.',
    badge: '2D Layout',
    example: 'GPIO34 (ADC) → Sensor Analog Out; GPIO26 (PWM) → MOSFET Gate via 220Ω resistor.'
  },
  {
    step: '05',
    id: '3d-prototype',
    title: '3D Physical Breadboard',
    shortTitle: '3D Lab',
    description: 'Real-world physical layout assembled on a standard solderless breadboard with color-coded jumper wires.',
    badge: '3D Physics',
    example: 'Components snapped into breadboard tie points with realistic lead spacing and pin connections.'
  },
  {
    step: '06',
    id: 'firmware',
    title: 'Hardware-Synced Firmware',
    shortTitle: 'Firmware',
    description: 'Clean C++ / Arduino / MicroPython code matching the exact physical pins mapped in the circuit model.',
    badge: 'Code Engine',
    example: 'Non-blocking sampling loop, threshold hysteresis logic, deep-sleep battery optimization.'
  },
  {
    step: '07',
    id: 'simulation',
    title: 'Mixed-Signal Simulation',
    shortTitle: 'Simulate',
    description: 'Deterministic electrical simulation calculates true node voltages, loop currents, switching transients, and signal wave shapes.',
    badge: 'Physics Truth',
    example: 'V_gate = 3.3V, I_drain = 210mA, inductive flyback voltage clamped to 5.7V safely.'
  },
  {
    step: '08',
    id: 'experiment',
    title: 'Live Experimentation',
    shortTitle: 'Experiment',
    description: 'Modify values on the fly: adjust moisture levels, change resistor values, alter battery charge, and see live results.',
    badge: 'What-If Testing',
    example: 'Swap 10kΩ pull-up with 4.7kΩ; observe rise-time improvements on scope waveform.'
  },
  {
    step: '09',
    id: 'pcb',
    title: 'PCB Trace Layout',
    shortTitle: 'PCB',
    description: 'Convert prototype breadboards into two-layer or four-layer production printed circuit boards with DRC rules.',
    badge: 'CAD Export',
    example: 'Gerber RS-274X, drill files, Pick-and-Place centroid files, and ground plane pours.'
  },
  {
    step: '10',
    id: 'real-world',
    title: 'Manufactured Invention',
    shortTitle: 'Physical Hardware',
    description: 'Order physical boards, receive pre-assembled PCBA kits, flash generated firmware, and operate in real life.',
    badge: 'Reality',
    example: 'From an initial prompt to a soldered working device in your physical hands.'
  }
];

export const COMMUNITY_PROJECTS: CommunityProject[] = [
  {
    id: 'proj-1',
    title: 'Sub-GHz LoRa Agro-Hydrology Profiler',
    creator: {
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      role: 'Hardware Systems Lead (IIT Bombay)'
    },
    category: 'IoT & Sensors',
    description: 'Precision agro-hydrology sensor node deployed in Maharashtra cane belts. Features Semtech SX1262 LoRa, ESP32 deep-sleep cycling (18µA), MPPT solar harvester, and capacitive soil moisture dielectric profiling.',
    tags: ['ESP32', 'SX1262 LoRa', 'Precision Agri', 'MPPT Solar', 'e-Yantra'],
    likes: 489,
    rating: 5.0,
    ratingCount: 78,
    commentsCount: 19,
    views: 5340,
    forkCount: 128,
    hardwareList: ['ESP32 DevKit v1', 'Semtech SX1262 LoRa', 'Capacitive Moisture Probe v2.0', 'CN3791 MPPT Solar Charger', '18650 LiFePO4 Cell'],
    previewGradient: 'from-[#8F8F8F]/25 via-[#1D1D1E] to-[#000000]',
    comments: [
      {
        id: 'c1',
        author: 'Prof. K. R. Venkatesh',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        date: '2 days ago',
        text: 'The 3D breadboard wiring in KITT made the flyback and sleep current path so clear. Our e-Yantra lab students reproduced it effortlessly.',
        likes: 24
      },
      {
        id: 'c2',
        author: 'Siddharth Mallick',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        date: '1 week ago',
        text: 'Tested the sleep current in the KITT mixed-signal simulation before tape-out. Hysteresis on the ADC prevents battery drain.',
        likes: 18
      }
    ]
  },
  {
    id: 'proj-2',
    title: '48V BLDC Vector Motor Controller & Telemetry',
    creator: {
      name: 'Priya Nair',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      role: 'Electric Mobility Lab (NIT Trichy)'
    },
    category: 'Power & Analog',
    description: 'Field-Oriented Control (FOC) driver for 1.5kW light electric two-wheelers. Employs STM32G4 mixed-signal MCU, DRV8301 gate driver, isolated CAN transceiver, and low-side shunt current reconstruction.',
    tags: ['STM32G4', 'FOC Motor Control', 'DRV8301', 'CAN Bus', 'EV Drive'],
    likes: 532,
    rating: 4.9,
    ratingCount: 65,
    commentsCount: 14,
    views: 4890,
    forkCount: 147,
    hardwareList: ['STM32G431KB Nucleo', 'TI DRV8301 Gate Driver', '6x NTMFS5C612N MOSFETs', 'Isolated ISO1050 CAN', '0.005Ω Shunts'],
    previewGradient: 'from-[#FFFFFF]/25 via-[#1D1D1E] to-[#000000]',
    comments: [
      {
        id: 'c3',
        author: 'Rohan Kulkarni',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
        date: '3 days ago',
        text: 'The gate driver bootstrap circuit simulated cleanly in KITT Workspace. Perfect dead-time insertion without shoot-through.',
        likes: 15
      }
    ]
  },
  {
    id: 'proj-3',
    title: 'Shakti RISC-V 32-Bit ALU & Forwarding Matrix',
    creator: {
      name: 'Vikramaditya Sen',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      role: 'Microprocessor Architecture Lab (BITS Pilani)'
    },
    category: 'Digital Logic',
    description: 'Clean-room RV32I integer datapath modeled in DigiLogic. Features Booth radix-4 multiplier, multi-level carry-lookahead adder, hazard unit, and cycle-accurate waveform telemetry.',
    tags: ['DigiLogic', 'RISC-V', 'ALU', 'Carry Lookahead', 'RV32I'],
    likes: 614,
    rating: 5.0,
    ratingCount: 94,
    commentsCount: 31,
    views: 7420,
    forkCount: 182,
    hardwareList: ['DigiLogic ALU Macro Blocks', 'Booth Radix-4 Multiplier', '32-Bit CLA', 'Bypass Forwarding Mux'],
    previewGradient: 'from-[#B4B4B4]/20 via-[#141415] to-[#000000]',
    comments: [
      {
        id: 'c4',
        author: 'Dr. Ananya Mukherjee',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        date: '4 days ago',
        text: 'Designing this in DigiLogic simulator then exporting directly into KITT Workspace was a super seamless workflow for our BITS VLSI course.',
        likes: 27
      }
    ]
  },
  {
    id: 'proj-4',
    title: 'Affordable 12-Lead Diagnostic ECG Front-End',
    creator: {
      name: 'Dr. Ananya Mukherjee',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      role: 'Center for VLSI & Embedded Systems (IIIT Hyderabad)'
    },
    category: 'IoT & Sensors',
    description: 'Ultra-low-noise biopotential acquisition node built with ADS1298 analog front-end and ESP32-S3. Includes Wilson Central Terminal generator, 50Hz notch filter, and defibrillator protection clamp.',
    tags: ['ADS1298', 'Biomedical', 'ESP32-S3', 'AFE', 'Notch Filter'],
    likes: 418,
    rating: 4.9,
    ratingCount: 53,
    commentsCount: 12,
    views: 3950,
    forkCount: 96,
    hardwareList: ['ADS1298 24-Bit ADC', 'ESP32-S3-WROOM-1', 'AD8606 Precision Op-Amps', 'BAV99 Diode Clamps', 'Medical Isolation Barrier'],
    previewGradient: 'from-[#8F8F8F]/20 via-[#1D1D1E] to-[#000000]',
    comments: []
  },
  {
    id: 'proj-5',
    title: 'Autonomous NavIC & RTK Precision Rover Node',
    creator: {
      name: 'Rohan Kulkarni',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      role: 'Robotics & Automation Society (COEP Pune)'
    },
    category: 'Robotics',
    description: 'Centimeter-level differential GNSS rover receiver tuned for India’s NavIC constellation (L5/S band) and GPS L1/L2. Direct UART link to STM32F4 navigation autopilot and dual-frequency helical antenna.',
    tags: ['NavIC', 'RTK GNSS', 'STM32F4', 'Autonomous Rover', 'COEP'],
    likes: 379,
    rating: 4.8,
    ratingCount: 47,
    commentsCount: 11,
    views: 3620,
    forkCount: 84,
    hardwareList: ['NavIC / GPS Dual-Band Module', 'STM32F405 Autopilot', 'BNO085 9-DOF IMU', 'Dual Helical Patch Antenna'],
    previewGradient: 'from-[#FFFFFF]/20 via-[#1D1D1E] to-[#000000]',
    comments: []
  },
  {
    id: 'proj-6',
    title: 'High-Speed BCD to Binary Radix Converter',
    creator: {
      name: 'Tanvi Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop&q=80',
      role: 'Department of Electronics (DTU Delhi)'
    },
    category: 'Digital Logic',
    description: 'Shift-and-Add-3 (Double Dabble) reverse radix converter designed directly from Number Trainer concepts. Translates multi-decade thumbwheel switch inputs into clean 12-bit parallel words for FPGA ingestion.',
    tags: ['Number Trainer', 'Double Dabble', 'Radix Converter', 'BCD', 'Logic Gates'],
    likes: 341,
    rating: 4.9,
    ratingCount: 52,
    commentsCount: 15,
    views: 4100,
    forkCount: 77,
    hardwareList: ['74HC283 4-Bit Adders', '74HC85 Comparators', 'Multiplexed Bus Transceivers', 'Number Trainer Testbench'],
    previewGradient: 'from-[#E8E8E8]/15 via-[#141415] to-[#000000]',
    comments: []
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Prof. K. R. Venkatesh',
    role: 'Professor & Head of Department, Electrical & Electronics',
    organization: 'IIT Bombay (e-Yantra & Microelectronics Labs)',
    quote: 'KITT is the breakthrough our engineering laboratories needed. Students transition seamlessly from Number Trainer math drills to DigiLogic RTL design, then simulate 3D circuits with KITT AI. What previously took a semester of hardware frustration now clicks in three lab sessions.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    badge: 'Verified Academic Dean'
  },
  {
    id: 'test-2',
    name: 'Siddharth Mallick',
    role: 'Principal Hardware System Architect',
    organization: 'Bharat Semiconductor Innovations & Fabless Consortium',
    quote: 'The unified netlist model connecting KITT AI prompts directly into the 3D breadboard and 2D schematic lab has dramatically accelerated our prototyping. We verified power decoupling, flyback snubbers, and firmware pin mappings without a single blown MOSFET.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    badge: 'Industry Fellow'
  },
  {
    id: 'test-3',
    name: 'Meera Nambiar',
    role: 'Robotics Lead & Research Director',
    organization: 'Maker Village Kochi & BITS Pilani',
    quote: 'Having all four portals—KITT AI, KITT Workspace, DigiLogic, and Number Trainer—operate under a single shared token and profile gives our hardware incubator a superpower. It is by far the most cohesive electronics engineering environment built in India.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    badge: 'Incubator Director'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Explorer',
    monthlyPrice: 0,
    yearlyPrice: 0,
    originalMonthlyPrice: 0,
    originalYearlyPrice: 0,
    description: 'Ideal for students, school tinkering, and open-source hobbyists beginning their hardware journey.',
    aiCredits: '100 Credits / month',
    features: [
      'Full access to DigiLogic Simulator (All 7 gates + ICs)',
      'Full access to Number Trainer drills & math modes',
      'Standard 2D Schematic & 3D Breadboard Workspace',
      '2 GB Cloud Schematics & C++ Storage',
      'Community project cloning & netlist downloads',
      'Standard community support'
    ],
    ctaText: 'Start Free Forever',
    buttonVariant: 'secondary'
  },
  {
    id: 'pioneer',
    name: 'Pioneer Maker',
    monthlyPrice: 6,
    yearlyPrice: 4,
    originalMonthlyPrice: 19,
    originalYearlyPrice: 15,
    promoBadge: '70% OFF • NEW REGISTRATION',
    description: 'For passionate makers, competitive robotics teams, and engineering undergrads prototyping real devices.',
    badge: 'Essential Maker',
    aiCredits: '500 Compute Credits / month',
    features: [
      'Everything in Free Explorer',
      'High-speed KITT AI Circuit & BOM synthesis',
      '10 GB Cloud Schematics & Firmware Storage',
      '4-Channel Virtual Oscilloscope & Signal Analyzer',
      '2-Layer PCB Gerber & Pick-and-Place export',
      'Cross-portal auto-synchronization & cloud backup',
      'Email & Discord developer community access'
    ],
    ctaText: 'Claim 70% Off • Pioneer Maker',
    buttonVariant: 'primary'
  },
  {
    id: 'pro',
    name: 'Pro Engineer',
    monthlyPrice: 15,
    yearlyPrice: 12,
    originalMonthlyPrice: 49,
    originalYearlyPrice: 39,
    promoBadge: '70% OFF • NEW REGISTRATION',
    description: 'Engineered for startup founders, VLSI researchers, and university labs building production silicon.',
    badge: 'Signature Edition',
    isPopular: true,
    aiCredits: '1,500 High-Speed Compute Credits / month',
    features: [
      'Everything in Pioneer Maker',
      'Mixed-signal deterministic simulation & SPICE engine',
      '50 GB Cloud Schematics, RTL & Firmware Storage',
      'Automated Electrical Rules Check (ERC & DRC)',
      'Multi-layer (4 & 6-Layer) PCB layout generator',
      'Direct C++ HAL & Verilog RTL testbench exporter',
      'Indian Academic & AICTE Lab grant eligible',
      'Priority cluster compute & sub-second response'
    ],
    ctaText: 'Claim 70% Off • Pro Silicon',
    buttonVariant: 'primary'
  },
  {
    id: 'studio',
    name: 'Autonomous Studio',
    monthlyPrice: 39,
    yearlyPrice: 29,
    originalMonthlyPrice: 129,
    originalYearlyPrice: 99,
    promoBadge: '70% OFF • NEW REGISTRATION',
    description: 'Dedicated enterprise infrastructure for semiconductor teams, robotics incubators, and university departments.',
    badge: 'Turnkey Enterprise',
    aiCredits: '5,000 Enterprise Credits / month',
    features: [
      'Everything in Pro Engineer',
      '250 GB Cloud Storage with multi-user team seats',
      'Turnkey PCBA fabrication queue & BOM pricing sync',
      'Unlimited cross-portal database state replication',
      'Custom component packaging & footprint editor',
      'Dedicated hardware specialist SLA support',
      'On-premise / private cloud deployable nodes'
    ],
    ctaText: 'Claim 70% Off • Autonomous Studio',
    buttonVariant: 'accent'
  }
];

