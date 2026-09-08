import { EcosystemProduct, CommunityProject, Testimonial, PricingPlan } from '../types';

export const ECOSYSTEM_PRODUCTS: EcosystemProduct[] = [
  {
    id: 'kitt-ai',
    name: 'KITT AI',
    tagline: 'Autonomous AI Electronics Engineering Agent',
    shortDescription: 'Describe your invention in plain text. KITT reasons about electrical requirements, selects components, wires circuits, and writes code.',
    longDescription: 'The intelligent front door of the KITT ecosystem. Powered by specialized hardware design models, KITT AI turns conversational prompts into production schematics, bill of materials, and validation checks.',
    url: 'https://kitt-1-0-agent.ai.studio',
    category: 'Autonomous AI',
    status: 'Live',
    badge: 'Flagship Agent',
    iconName: 'Bot',
    accentColor: '#A58D66', // Antique Gold
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
    url: 'https://kitt-ai-ravi.ai.studio',
    category: '3D & Simulation',
    status: 'Live',
    badge: 'Core Lab',
    iconName: 'Cpu',
    accentColor: '#407E8C', // Oceanic Teal
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
    url: 'https://logic-gates-simulator-4jo.pages.dev/',
    category: 'Digital Logic',
    status: 'Live',
    badge: 'Logic Engine',
    iconName: 'Binary',
    accentColor: '#E5E1DD', // Alabaster Sand
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
    url: 'https://sriyansraj.github.io/Number_Trainer/index1.html',
    category: 'Foundations & Math',
    status: 'Live',
    badge: 'Foundations',
    iconName: 'Calculator',
    accentColor: '#A58D66', // Antique Gold
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
    title: 'Autonomous Plant Hydration System',
    creator: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      role: 'IoT Hardware Maker'
    },
    category: 'IoT & Sensors',
    description: 'Automated soil moisture sensing with an ESP32, IRLZ44N MOSFET motor driver, 5V mini pump, and sleep mode for 6-month battery life.',
    tags: ['ESP32', 'Sensors', 'MOSFET', 'Battery Saver', '3D Lab'],
    likes: 342,
    rating: 4.9,
    ratingCount: 58,
    commentsCount: 14,
    views: 4210,
    forkCount: 87,
    hardwareList: ['ESP32 DevKit', 'Capacitive Moisture Sensor', 'IRLZ44N MOSFET', '5V DC Submersible Pump', '18650 Battery'],
    previewGradient: 'from-emerald-900/60 to-purple-950/60',
    comments: [
      {
        id: 'c1',
        author: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        date: '2 days ago',
        text: 'The 3D breadboard wiring in KITT made it so obvious how to wire the flyback diode across the pump motor!',
        likes: 12
      },
      {
        id: 'c2',
        author: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        date: '1 week ago',
        text: 'Tested the code directly in KITT Workspace before flashing. The hysteresis threshold prevents pump jitter perfectly.',
        likes: 8
      }
    ]
  },
  {
    id: 'proj-2',
    title: '4-Way Intelligent Traffic Intersection',
    creator: {
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      role: 'Embedded Robotics Engineer'
    },
    category: 'Arduino / MCU',
    description: 'State machine traffic intersection with pedestrian interrupt pushbuttons, yellow cautionary blinkers, and synchronized timer registers.',
    tags: ['Arduino Uno', 'State Machine', 'LED Array', 'Interrupts', 'Simulation'],
    likes: 284,
    rating: 4.8,
    ratingCount: 43,
    commentsCount: 9,
    views: 3120,
    forkCount: 52,
    hardwareList: ['Arduino Uno R3', '6x LEDs (Red/Yellow/Green)', '6x 220Ω Resistors', '2x Pushbuttons', 'Pull-down Resistors'],
    previewGradient: 'from-amber-900/60 to-purple-950/60',
    comments: [
      {
        id: 'c3',
        author: 'Ananya Roy',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        date: '3 days ago',
        text: 'Used this for my university intro to microcontrollers lab. The visual simulation matched our physical bench tests 100%.',
        likes: 5
      }
    ]
  },
  {
    id: 'proj-3',
    title: '8-Bit Ripple Carry ALU with Flag Registers',
    creator: {
      name: 'Tariq Al-Mansoor',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      role: 'Computer Architecture TA'
    },
    category: 'Digital Logic',
    description: 'Full 8-bit arithmetic logic unit built using DigiLogic gates. Supports ADD, SUB, AND, OR, XOR with Zero, Carry, and Overflow flags.',
    tags: ['DigiLogic', 'Logic Gates', 'ALU', 'Full Adders', 'Truth Tables'],
    likes: 419,
    rating: 5.0,
    ratingCount: 82,
    commentsCount: 23,
    views: 5890,
    forkCount: 142,
    hardwareList: ['8x Full Adder Blocks', '16x XOR Gates', '8x Multiplexers', '7-Segment Display Bus'],
    previewGradient: 'from-blue-900/60 to-emerald-950/60',
    comments: [
      {
        id: 'c4',
        author: 'Liam Scott',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
        date: '5 days ago',
        text: 'Designing this in DigiLogic simulator then exporting directly into KITT Workspace was a super seamless workflow.',
        likes: 19
      }
    ]
  },
  {
    id: 'proj-4',
    title: 'Precision Temperature & Humidity Telemetry Node',
    creator: {
      name: 'Sophie Müller',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      role: 'Environmental Systems Engineer'
    },
    category: 'IoT & Sensors',
    description: 'I2C digital telemetry node featuring SHT31 sensor, 128x64 SSD1306 OLED display, ESP32 Wi-Fi MQTT publisher, and low-noise LDO power rail.',
    tags: ['ESP32', 'I2C Bus', 'OLED SSD1306', 'SHT31', 'MQTT'],
    likes: 198,
    rating: 4.7,
    ratingCount: 31,
    commentsCount: 6,
    views: 2450,
    forkCount: 39,
    hardwareList: ['ESP32-WROOM-32', 'SHT31 Sensor', '0.96" I2C OLED', 'AMS1117-3.3 LDO', 'Decoupling Caps'],
    previewGradient: 'from-cyan-900/60 to-purple-950/60',
    comments: []
  },
  {
    id: 'proj-5',
    title: 'Variable Frequency PWM Motor Speed Controller',
    creator: {
      name: 'Kenji Sato',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      role: 'Power Electronics Maker'
    },
    category: 'Power & Analog',
    description: 'Analog 555 timer astable multivibrator producing 1 kHz - 25 kHz PWM with dual steering diodes for independent duty cycle control.',
    tags: ['NE555', 'PWM', 'Analog', 'Oscilloscope', 'MOSFET'],
    likes: 275,
    rating: 4.9,
    ratingCount: 49,
    commentsCount: 11,
    views: 3600,
    forkCount: 64,
    hardwareList: ['NE555 Timer IC', '10k Potentiometer', '1N4148 Diodes', 'IRFZ44N MOSFET', '12V DC Motor'],
    previewGradient: 'from-purple-900/60 to-red-950/60',
    comments: []
  },
  {
    id: 'proj-6',
    title: 'Dual 7-Segment Binary & Hexadecimal Stopwatch',
    creator: {
      name: 'Zoe Washington',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop&q=80',
      role: 'Computer Engineering Student'
    },
    category: 'Digital Logic',
    description: 'Direct application of Number Trainer concepts: Binary counters (74HC393) decoded through BCD-to-7-segment decoders (74HC4511).',
    tags: ['Number Trainer', '7-Segment', 'Counters', 'BCD Decoding', 'Clock'],
    likes: 312,
    rating: 4.8,
    ratingCount: 52,
    commentsCount: 15,
    views: 4100,
    forkCount: 71,
    hardwareList: ['2x 7-Segment Displays', '2x 74HC4511 Decoders', '74HC393 Dual Ripple Counter', '555 Clock Generator'],
    previewGradient: 'from-amber-950/60 to-blue-950/60',
    comments: []
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Dr. Arthur Pendelton',
    role: 'Associate Professor of Electrical Engineering',
    organization: 'Georgia Institute of Technology',
    quote: 'KITT is the first ecosystem that actually connects the theoretical abstractions of number systems and digital logic directly to live 3D breadboards and physical code. Our students understand circuit dynamics twice as fast.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    badge: 'Verified Educator'
  },
  {
    id: 'test-2',
    name: 'Mira Sundaram',
    role: 'Lead Hardware Prototyping Engineer',
    organization: 'AeroVolt Robotics',
    quote: 'Describing a circuit to KITT AI, having it select verified components with proper flyback protection and generating firmware that matches the exact pinout on the 3D board has reduced our proof-of-concept phase from days to hours.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    badge: 'Industry Professional'
  },
  {
    id: 'test-3',
    name: 'Julian Alvarez',
    role: 'Second-Year Computer Engineering Student',
    organization: 'Purdue University',
    quote: 'Starting with Number Trainer drills, jumping into DigiLogic to see gate delays, and then testing real ESP32 sensors in the KITT 3D Lab made everything click. It took the fear out of electronics for me.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    badge: 'Student Innovator'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Community & Student',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Full access to all 4 learning and simulation platforms for students and hobbyists.',
    aiCredits: '50 AI Prompts / month',
    features: [
      'Unlimited access to DigiLogic Simulator',
      'Unlimited access to Number Trainer',
      'Standard 2D & 3D KITT Workspace projects',
      'Deterministic digital & analog simulation',
      'Community project browsing & remixing',
      'Standard C++ firmware export'
    ],
    ctaText: 'Start Free Forever',
    buttonVariant: 'secondary'
  },
  {
    id: 'intermediate',
    name: 'Maker & Engineer',
    monthlyPrice: 16,
    yearlyPrice: 13,
    description: 'Accelerate hardware development with advanced AI reasoning, larger netlists, and PCB tools.',
    badge: 'Most Popular',
    isPopular: true,
    aiCredits: '500 AI Generations / month',
    features: [
      'Everything in Free Plan',
      'High-capacity KITT AI engineering assistant',
      'Automated DRC & Electrical Rules Checking',
      '4-Channel Virtual Oscilloscope & Logic Analyzer',
      'Two-layer PCB auto-routing & Gerber export',
      'Priority cloud simulation performance',
      'Full Project Version History & Cloud Sync'
    ],
    ctaText: 'Get Maker Plan',
    buttonVariant: 'primary'
  },
  {
    id: 'pro',
    name: 'Pro Hardware Lab',
    monthlyPrice: 39,
    yearlyPrice: 32,
    description: 'Designed for professional engineering teams, university labs, and production hardware startups.',
    badge: 'Full Power',
    aiCredits: 'Unlimited Fast AI Generations',
    features: [
      'Everything in Maker Plan',
      'Multi-board system hierarchy & modular buses',
      'Mixed-signal SPICE co-simulation engine',
      'Custom component packaging & footprint editor',
      'Multi-layer PCB generation (4 & 6 layers)',
      'Direct turnkey PCBA fabrication quote integration',
      'Team shared workspace & live collaboration',
      'Dedicated engineering support'
    ],
    ctaText: 'Join Pro Lab',
    buttonVariant: 'accent'
  }
];
