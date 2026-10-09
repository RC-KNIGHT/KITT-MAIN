import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Sparkles, 
  Cpu, 
  Binary, 
  Layers, 
  Activity, 
  CheckCircle2,
  ExternalLink,
  FileVideo,
  Check,
  Settings2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { getHeroVideo, saveHeroVideo } from '../utils/videoStorage';
import { AnimatedCircuitOverlay } from './AnimatedCircuitOverlay';
import { DynamicCircuitBackdrop } from './DynamicCircuitBackdrop';
import { KittLogo } from './KittLogo';

interface HeroVideoProps {
  onExploreEcosystem?: () => void;
  onTryKittAi?: () => void;
}

export const HeroVideo: React.FC<HeroVideoProps> = ({ onExploreEcosystem, onTryKittAi }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10.0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('/kitt-hero.mp4');
  const [videoName, setVideoName] = useState<string>('kitt-hero.mp4');
  const [showSubtitles] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const AMBITIOUS_TAGLINES = [
    "From natural language intent to verified physical hardware.",
    "Autonomous system architecture, mixed-signal simulation & PCBA synthesis.",
    "Master digital logic, embed firmware, and command production silicon.",
    "Bridging mental architecture, real-time simulation, and manufactured electronics."
  ];
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % AMBITIOUS_TAGLINES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const timeRef = useRef<number>(0);
  const lastStateUpdateTimeRef = useRef<number>(0);
  const spokenMilestonesRef = useRef<{ [key: string]: boolean }>({});

  // Subtitles from the canonical video audio transcript
  const subtitles = [
    { start: 0.0, end: 1.8, text: "You imagined it." },
    { start: 1.8, end: 3.4, text: "Kitt built it." },
    { start: 3.4, end: 5.2, text: "Simulated it. Tested it." },
    { start: 5.2, end: 8.6, text: "Kitt. Where ideas become inventions." },
    { start: 8.6, end: 10.0, text: "KITT AI — Where Ideas Become Inventions" }
  ];

  // 10-Second Engineering Sequence Milestones matching the video
  const milestones = [
    { time: 0.0, label: 'Idea', detail: 'Natural language requirement parsed', icon: Sparkles, tag: 'Imagined' },
    { time: 1.8, label: 'Architecture', detail: 'ESP32 + Sensor + MOSFET + Pump matched', icon: Cpu, tag: 'Built' },
    { time: 3.5, label: '2D Circuit', detail: 'Schematic, pinout & dual-rail verification', icon: Binary, tag: 'Simulated' },
    { time: 5.2, label: '3D Prototype', detail: 'Physical breadboard, pins & wires connected', icon: Layers, tag: 'Tested' },
    { time: 6.8, label: 'Copilot Code', detail: 'Threshold & firmware dynamically updated', icon: Settings2, tag: 'Firmware' },
    { time: 7.8, label: 'Lab Bench', detail: 'Oscilloscope, multimeter & live pump test', icon: Activity, tag: 'Verified' },
    { time: 8.8, label: 'Invention', detail: 'Dual-layer PCB & manufactured hardware', icon: CheckCircle2, tag: 'Invention' }
  ];

  // Restore saved video from IndexedDB on startup
  useEffect(() => {
    getHeroVideo().then((blob) => {
      if (blob) {
        if (activeBlobUrlRef.current) URL.revokeObjectURL(activeBlobUrlRef.current);
        const objectUrl = URL.createObjectURL(blob);
        activeBlobUrlRef.current = objectUrl;
        setVideoUrl(objectUrl);
        setVideoName('Custom KITT AI Video');
      } else {
        setVideoUrl('/kitt-hero.mp4');
        setVideoName('kitt-hero.mp4');
      }
    }).catch(() => {
      setVideoUrl('/kitt-hero.mp4');
      setVideoName('kitt-hero.mp4');
    });

    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, []);

  // Subtle scroll-driven presence: gently scales by ~1.5% so the user feels like they reached it,
  // without any layout reflow or aggressive screen overflow.
  useEffect(() => {
    let ticking = false;

    const updateVideoPresence = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const videoCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;

      // Vertical distance from center of viewport
      const distFromCenter = Math.abs(videoCenter - viewportCenter);
      const maxInfluenceRange = windowHeight * 0.65;

      // Normalized proximity: 1.0 when perfectly centered, 0.0 when off-screen
      const proximity = Math.max(0, 1 - distFromCenter / maxInfluenceRange);
      const expansion = 0.5 - 0.5 * Math.cos(proximity * Math.PI);

      // Very subtle, comfortable presence scale (0.985 -> 1.01) with pure GPU transform
      const scale = 0.985 + 0.025 * expansion;
      containerRef.current.style.transform = `scale(${scale.toFixed(4)})`;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateVideoPresence();
          ticking = false;
        });
        ticking = true;
      }
    };

    updateVideoPresence();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Compute active milestone stage purely from currentTime
  const activeStageIndex = (() => {
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (currentTime >= milestones[i].time) {
        return i;
      }
    }
    return 0;
  })();

  // Current subtitle text
  const currentSubtitle = (() => {
    if (!showSubtitles) return null;
    const match = subtitles.find(s => currentTime >= s.start && currentTime < s.end);
    return match ? match.text : null;
  })();

  // Procedural Canvas Animation for when no external video is loaded
  useEffect(() => {
    if (videoUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlaying) {
        timeRef.current += delta;
        if (timeRef.current >= duration) {
          timeRef.current = 0;
          spokenMilestonesRef.current = {};
        }

        // Throttle React state updates to ~20fps to prevent render depth issues
        if (now - lastStateUpdateTimeRef.current > 50) {
          lastStateUpdateTimeRef.current = now;
          setCurrentTime(timeRef.current);
        }
      }

      // Procedural audio voiceover synthesis in canvas mode when unmuted
      if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const t = timeRef.current;
        const triggerMilestone = (key: string, text: string) => {
          if (!spokenMilestonesRef.current[key]) {
            spokenMilestonesRef.current[key] = true;
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.rate = 1.05;
            utter.pitch = 0.95;
            window.speechSynthesis.speak(utter);
          }
        };

        if (t >= 0.1 && t < 1.6) triggerMilestone('m1', 'You imagined it.');
        else if (t >= 1.9 && t < 3.2) triggerMilestone('m2', 'Kitt built it.');
        else if (t >= 3.5 && t < 5.0) triggerMilestone('m3', 'Simulated it. Tested it.');
        else if (t >= 5.5 && t < 8.0) triggerMilestone('m4', 'Kitt. Where ideas become inventions.');
      }

      const width = canvas.width;
      const height = canvas.height;
      const t = timeRef.current;

      // Dark background
      ctx.fillStyle = '#07080c';
      ctx.fillRect(0, 0, width, height);

      // Engineering grid
      ctx.strokeStyle = 'rgba(204, 204, 204, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Ambient radial glow
      const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width / 2);
      grad.addColorStop(0, 'rgba(124, 58, 237, 0.22)');
      grad.addColorStop(0.5, 'rgba(180, 180, 180, 0.09)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);

      // SCENE 1 (0 - 1.8s): "You imagined it" - Workspace with developer typing natural language prompt
      if (t < 1.8) {
        // Monitor frame
        ctx.fillStyle = '#141415';
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-240, -130, 480, 240, 10);
        ctx.fill();
        ctx.stroke();

        // Monitor stand
        ctx.fillStyle = '#1e2230';
        ctx.fillRect(-30, 110, 60, 40);
        ctx.fillRect(-80, 145, 160, 12);

        // KITT AI Prompt header inside monitor
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ KITT AI', 0, -85);

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('What do you want to build?', 0, -55);

        // User prompt bubble with typing animation
        const fullPrompt = "I want to build an automatic plant watering system.";
        const charsToShow = Math.min(fullPrompt.length, Math.floor((t / 1.6) * fullPrompt.length));
        const currentTyped = fullPrompt.substring(0, charsToShow);

        ctx.fillStyle = 'rgba(204, 204, 204, 0.15)';
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-190, -30, 380, 45, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f3e8ff';
        ctx.font = '500 12px "Fira Code", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(currentTyped + (Math.floor(t * 4) % 2 === 0 ? '▌' : ''), -175, -3);

        // Developer silhouette in foreground
        ctx.fillStyle = '#06070a';
        ctx.beginPath();
        ctx.arc(-140, 190, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-220, 190, 160, 120);
      } 
      // SCENE 2 (1.8 - 3.5s): "Kitt built it" - System Architecture Synthesizer
      else if (t < 3.5) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('AUTOMATIC PLANT WATERING SYSTEM', 0, -110);

        ctx.font = '500 11px "Fira Code", monospace';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText('Components matched: ESP32 • Soil Moisture Sensor • MOSFET Driver • Pump', 0, -88);

        // Architecture Flow Diagram: SOIL SENSOR -> ESP32 -> MOSFET DRIVER -> PUMP
        const blocks = [
          { name: 'SOIL SENSOR', color: '#F5F5F5', x: -220 },
          { name: 'ESP32 MCU', color: '#B4B4B4', x: -70 },
          { name: 'MOSFET DRIVER', color: '#f59e0b', x: 80 },
          { name: 'WATER PUMP', color: '#8F8F8F', x: 230 }
        ];

        blocks.forEach((b, i) => {
          ctx.save();
          ctx.translate(b.x, -10);

          ctx.fillStyle = '#141415';
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(-55, -30, 110, 60, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(b.name, 0, 5);

          // Arrow to next block
          if (i < blocks.length - 1) {
            ctx.strokeStyle = '#CCCCCC';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(55, 0);
            ctx.lineTo(95, 0);
            ctx.stroke();
            // Arrowhead
            ctx.fillStyle = '#CCCCCC';
            ctx.beginPath();
            ctx.moveTo(95, 0);
            ctx.lineTo(88, -4);
            ctx.lineTo(88, 4);
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
        });

        // [ BUILD WITH KITT ] Button
        ctx.fillStyle = '#8F8F8F';
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-90, 60, 180, 36, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('[ BUILD WITH KITT ]', 0, 83);
      }
      // SCENE 3 (3.5 - 5.2s): "Simulated it. Tested it" - 2D Schematic
      else if (t < 5.2) {
        // Mode toggle tabs
        ctx.fillStyle = '#161922';
        ctx.beginPath();
        ctx.roundRect(-130, -125, 260, 26, 6);
        ctx.fill();

        ctx.fillStyle = '#8F8F8F';
        ctx.beginPath();
        ctx.roundRect(-128, -123, 126, 22, 5);
        ctx.fill();

        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('[ 2D CIRCUIT ]', -65, -108);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('[ 3D PROTOTYPE ]', 65, -108);

        // ESP32 Schematic IC Block
        ctx.fillStyle = '#0f1117';
        ctx.strokeStyle = '#B4B4B4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-180, -70, 120, 140, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('ESP32', -120, 5);

        // Pin leads
        const pins = ['D2', 'D4', '3V3', 'GND', 'EN', 'RX'];
        ctx.font = '9px "Fira Code", monospace';
        ctx.fillStyle = '#94a3b8';
        pins.forEach((p, idx) => {
          const py = -50 + idx * 20;
          ctx.strokeStyle = '#B4B4B4';
          ctx.beginPath();
          ctx.moveTo(-60, py);
          ctx.lineTo(-30, py);
          ctx.stroke();
          ctx.fillText(p, -50, py - 3);
        });

        // MOSFET Q1 symbol & wiring
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-30, -30);
        ctx.lineTo(40, -30);
        ctx.lineTo(40, -10);
        ctx.stroke();

        ctx.fillStyle = '#141415';
        ctx.beginPath();
        ctx.roundRect(40, -25, 60, 50, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 10px "Fira Code", monospace';
        ctx.fillText('Q1 N-FET', 70, 5);

        // Pump & flyback diode
        ctx.strokeStyle = '#CCCCCC';
        ctx.beginPath();
        ctx.moveTo(100, 0);
        ctx.lineTo(160, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(180, 0, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#1e1b4b';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#CCCCCC';
        ctx.font = 'bold 10px "Fira Code", monospace';
        ctx.fillText('PUMP', 180, 4);

        ctx.font = '500 11px "Fira Code", monospace';
        ctx.fillStyle = '#F5F5F5';
        ctx.fillText('✓ Circuit Validated: 3.3V Logic Safe • No Shorts • Netlist Verified', 0, 95);
      }
      // SCENE 4 (5.2 - 6.8s): "YOUR PROJECT IS READY" - 3D Breadboard Assembly Pop-Up
      else if (t < 6.8) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('YOUR PROJECT IS READY', 0, -115);

        // Tabs showing 3D active
        ctx.fillStyle = '#161922';
        ctx.beginPath();
        ctx.roundRect(-130, -95, 260, 24, 6);
        ctx.fill();

        ctx.fillStyle = '#8F8F8F';
        ctx.beginPath();
        ctx.roundRect(2, -93, 126, 20, 5);
        ctx.fill();

        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('[ 2D CIRCUIT ]', -65, -80);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('[ 3D PROTOTYPE ]', 65, -80);

        // 3D Breadboard Body
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-200, -45, 400, 90, 6);
        ctx.fill();
        ctx.stroke();

        // Breadboard center ditch & power rails
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-190, -1, 380, 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-190, -38, 380, 1.5);
        ctx.fillStyle = '#B4B4B4';
        ctx.fillRect(-190, 36, 380, 1.5);

        // ESP32 Board mounted on breadboard
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#B4B4B4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-90, -30, 90, 60, 4);
        ctx.fill();
        ctx.stroke();

        // Metal shield & antenna
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-85, -20, 40, 40);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-40, -15, 12, 30);

        // Colored curved jumper wires
        const wireProgress = Math.min(1, (t - 5.2) / 1.2);
        
        // Yellow wire
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-45, -20);
        ctx.bezierCurveTo(-20, -75 * wireProgress, 50, -60 * wireProgress, 80, -20);
        ctx.stroke();

        // Red VCC wire
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-45, -35);
        ctx.bezierCurveTo(-10, -50 * wireProgress, 30, -50 * wireProgress, 60, -35);
        ctx.stroke();

        // Green signal wire
        ctx.strokeStyle = '#F5F5F5';
        ctx.beginPath();
        ctx.moveTo(-45, 20);
        ctx.bezierCurveTo(-10, 60 * wireProgress, 70, 50 * wireProgress, 120, 20);
        ctx.stroke();

        ctx.font = '500 11px "Fira Code", monospace';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText('3D Physical Geometry & Pin Matrix Snapped', 0, 85);
      }
      // SCENE 5 (6.8 - 7.8s): KITT Copilot & Firmware Editor
      else if (t < 7.8) {
        // Left pane: Firmware Editor
        ctx.fillStyle = '#0d1117';
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(-240, -100, 230, 180, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#58a6ff';
        ctx.font = 'bold 11px "Fira Code", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('main.cpp (ESP32)', -225, -78);

        ctx.font = '9px "Fira Code", monospace';
        ctx.fillStyle = '#7ee787';
        ctx.fillText('const int SOIL_PIN = 34;', -225, -55);
        ctx.fillText('const int PUMP_PIN = 26;', -225, -40);
        ctx.fillStyle = '#ff7b72';
        ctx.fillText('const int THRESHOLD = 25; // %', -225, -25);
        ctx.fillStyle = '#d2a8ff';
        ctx.fillText('void loop() {', -225, -5);
        ctx.fillStyle = '#c9d1d9';
        ctx.fillText('  int m = readMoisture();', -215, 10);
        ctx.fillText('  if (m < THRESHOLD) {', -215, 25);
        ctx.fillText('    digitalWrite(PUMP_PIN, 1);', -205, 40);
        ctx.fillText('  }', -215, 55);
        ctx.fillText('}', -225, 70);

        // Right pane: KITT Copilot Chat
        ctx.fillStyle = '#141415';
        ctx.strokeStyle = '#CCCCCC';
        ctx.beginPath();
        ctx.roundRect(10, -100, 230, 180, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#CCCCCC';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('KITT COPILOT', 25, -78);

        // User message bubble
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.roundRect(25, -60, 200, 32, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Change pump threshold from 35% to 25%.', 35, -40);

        // KITT reply bubble
        ctx.fillStyle = 'rgba(204, 204, 204, 0.15)';
        ctx.beginPath();
        ctx.roundRect(25, -18, 200, 42, 6);
        ctx.fill();
        ctx.fillStyle = '#e9d5ff';
        ctx.fillText('Done. I updated the control logic', 35, 2);
        ctx.fillText('and active simulation parameters.', 35, 16);
      }
      // SCENE 6 (7.8 - 8.8s): 3D Electronics Lab Bench with Oscilloscope & Pump
      else if (t < 8.8) {
        // Oscilloscope Screen on right
        ctx.fillStyle = '#021810';
        ctx.strokeStyle = '#F5F5F5';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(30, -90, 210, 110, 6);
        ctx.fill();
        ctx.stroke();

        // Oscilloscope graticule
        ctx.strokeStyle = 'rgba(245, 245, 245, 0.2)';
        ctx.lineWidth = 0.5;
        for (let gx = 45; gx <= 225; gx += 20) {
          ctx.beginPath();
          ctx.moveTo(gx, -80);
          ctx.lineTo(gx, 10);
          ctx.stroke();
        }
        for (let gy = -75; gy <= 5; gy += 18) {
          ctx.beginPath();
          ctx.moveTo(40, gy);
          ctx.lineTo(230, gy);
          ctx.stroke();
        }

        // Live yellow oscilloscope waveform
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 40; x <= 230; x += 2) {
          const wavePhase = (x + t * 140) * 0.08;
          const y = -35 + Math.sin(wavePhase) * 20 + Math.cos(wavePhase * 2) * 5;
          if (x === 40) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.font = '9px "Fira Code", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CH1: 3.30V | PWM: 880Hz', 45, 12);

        // Digital Multimeter on left
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-240, -90, 120, 110, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-230, -75, 100, 35);
        ctx.fillStyle = '#B4B4B4';
        ctx.font = 'bold 16px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('00.00 V', -180, -52);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('DIGITAL MULTIMETER', -180, -25);

        // DC Pump & "PUMP ON" alert in center
        ctx.fillStyle = '#F5F5F5';
        ctx.strokeStyle = '#E8E8E8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-80, -70, 90, 30, 15);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('● PUMP ON', -35, -51);

        // Spinning pump impeller
        ctx.save();
        ctx.translate(-35, -5);
        const spinAngle = t * 15;
        ctx.rotate(spinAngle);
        ctx.strokeStyle = '#B4B4B4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(15, 0);
        ctx.moveTo(0, -15);
        ctx.lineTo(0, 15);
        ctx.stroke();
        ctx.restore();

        // Telemetry dock metrics
        ctx.font = '500 10px "Fira Code", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Telemetry: Voltage: 0.56V  |  Moisture: 3.99%  |  Pump: 20%', 0, 45);

        // Pipeline ribbon at bottom
        ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText('IDEA → REQUIREMENTS → ARCHITECTURE → CIRCUIT → CODE → SIMULATION → 3D → PCB', 0, 75);
      }
      // SCENE 7 (8.8 - 10.0s): Title card "KITT AI - Where Ideas Become Inventions"
      else {
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('KITT AI', 0, -20);

        ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#E8E8E8';
        ctx.fillText('Where Ideas Become Inventions', 0, 20);

        ctx.font = '500 11px "Fira Code", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Ready for Engineering • Prototyping • PCB Manufacturing', 0, 60);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying, duration, videoUrl, isMuted]);

  // Video element sync when external video is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handleTimeUpdate = () => {
      timeRef.current = video.currentTime;
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    if (videoUrl && videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleSeek = (newTime: number) => {
    timeRef.current = newTime;
    setCurrentTime(newTime);
    if (videoUrl && videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    loadVideoFromFile(file);
  };

  const loadVideoFromFile = (file: File) => {
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    activeBlobUrlRef.current = objectUrl;
    setVideoUrl(objectUrl);
    setVideoName(file.name);
    saveHeroVideo(file);
    setIsPlaying(true);
    setUploadSuccessMessage(`Successfully added "${file.name}" to the landing page!`);
    setTimeout(() => setUploadSuccessMessage(null), 5000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        loadVideoFromFile(file);
      }
    }
  };

  return (
    <section id="hero" className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-surreal-grid">
      {/* Dynamic Ambient Circuit & Horizon Backdrop */}
      <DynamicCircuitBackdrop />

      {/* Subtle Ambient Circuit-Line Overlay using CSS keyframes */}
      <AnimatedCircuitOverlay />

      {/* Cinematic Surreal Glows in Oceanic Teal & Solar Antique Gold */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-[#8F8F8F]/25 via-[#FFFFFF]/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#FFFFFF]/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Hidden File Input for Drag & Drop / Fallback */}
      <input 
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="max-w-7xl mx-auto relative">
        {/* UPPER HERO ZONE: Frames the Signature 3D Particle K positioned strictly ABOVE the video */}
        <motion.div 
          initial={{ opacity: 0, y: 36, scale: 0.96, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto min-h-[380px] sm:min-h-[440px] flex flex-col items-center justify-center will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Header Badges & Taglines - elevated in front of the 3D particle K */}
          <div className="text-center w-full space-y-6 relative z-20 py-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#8F8F8F]/15 border border-[#FFFFFF]/40 text-[#F5F5F5] text-xs font-mono tracking-widest uppercase shadow-inner backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#FFFFFF] shadow-[0_0_8px_#FFFFFF]" />
              <span className="font-semibold text-[#FFFFFF]">KITT AI LABS • HARDWARE SYNTHESIS MATRIX</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F5F5] font-cinzel drop-shadow-xl animate-title-breathe">
              Where Ideas Become <br className="hidden sm:inline" />
              <span id="hero-inventions-word" className="animate-text-shimmer italic font-cormorant font-normal inline-block mt-1 animate-text-glow">
                Inventions.
              </span>
            </h1>

            {/* Dynamic Rotating Ambitious Mind-Hitting Taglines */}
            <div className="min-h-[56px] flex items-center justify-center px-4">
              <p 
                key={taglineIndex}
                className="text-base sm:text-xl text-[#F5F5F5] max-w-2xl mx-auto font-serif italic drop-shadow-md transition-all duration-700 leading-relaxed animate-in fade-in zoom-in-95 animate-gold-radiance font-medium"
              >
                "{AMBITIOUS_TAGLINES[taglineIndex]}"
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#/kitt-ai"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FFFFFF] via-[#CCCCCC] to-[#FFFFFF] hover:from-[#CCCCCC] hover:to-[#FFFFFF] text-[#000000] font-bold text-sm shadow-[0_0_30px_rgba(255,255,255,0.35)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#000000]" />
                <span>Launch KITT AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href="#ecosystem-launchpad"
                className="px-6 py-3.5 rounded-xl surreal-card hover:border-[#8F8F8F]/60 text-[#F5F5F5] font-semibold text-sm transition-all flex items-center gap-2 backdrop-blur-md shadow-lg"
              >
                <span>Explore 4 Ecosystem Portals</span>
                <ExternalLink className="w-4 h-4 text-[#FFFFFF]" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Upload Success Alert Toast */}
        {uploadSuccessMessage && (
          <div className="mt-4 max-w-lg mx-auto p-3 rounded-xl bg-[#1D1D1E]/90 border border-[#FFFFFF]/50 text-[#F5F5F5] text-xs flex items-center gap-2.5 shadow-xl animate-fade-in relative z-20">
            <Check className="w-4 h-4 text-[#FFFFFF] shrink-0" />
            <span className="font-medium text-[#F5F5F5]">{uploadSuccessMessage}</span>
          </div>
        )}

        {/* 10-SECOND HERO VIDEO CENTERPIECE - SEAMLESSLY MIXED WITH BACKGROUND */}
        <div 
          ref={containerRef}
          onClick={togglePlay}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-8 sm:mt-10 relative max-w-5xl mx-auto cursor-pointer group select-none z-10 will-change-transform ${
            isDraggingOver ? 'ring-2 ring-[#FFFFFF]' : ''
          }`}
          style={{
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          title="Click anywhere on the video area to pause or resume"
        >
          {/* Ambient Soft Glow behind Video */}
          <div className="absolute inset-0 bg-[#8F8F8F]/15 blur-[140px] rounded-full pointer-events-none -z-10" />

          {/* Decorative SMD IC Lead Pins along left edge */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 pointer-events-none z-0 opacity-40 group-hover:opacity-75 transition-opacity">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={`pin-l-${i}`} className="w-2.5 h-1 bg-gradient-to-r from-[#E8E8E8] to-[#FFFFFF] rounded-l-sm shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
            ))}
          </div>
          {/* Decorative SMD IC Lead Pins along right edge */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 pointer-events-none z-0 opacity-40 group-hover:opacity-75 transition-opacity">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={`pin-r-${i}`} className="w-2.5 h-1 bg-gradient-to-l from-[#E8E8E8] to-[#8F8F8F] rounded-r-sm shadow-[0_0_4px_rgba(143,143,143,0.5)]" />
            ))}
          </div>

          {/* Borderless Seamless Mixed Video Canvas */}
          <div className="relative rounded-3xl overflow-hidden aspect-video sm:aspect-[16/9] flex items-center justify-center bg-[#000000] border border-[#FFFFFF]/25 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(143,143,143,0.18)]">
            {/* Precision Reticle Corner Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#FFFFFF]/60 rounded-tl pointer-events-none z-20" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#FFFFFF]/60 rounded-tr pointer-events-none z-20" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#FFFFFF]/60 rounded-bl pointer-events-none z-20" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#FFFFFF]/60 rounded-br pointer-events-none z-20" />
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <canvas
                ref={canvasRef}
                width={960}
                height={540}
                className="w-full h-full object-contain pointer-events-none"
              />
            )}

            {/* Seamless Vignette & Edge Feathering blending into #000000 background */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_50px_#000000]" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#000000] via-transparent to-[#000000]/60" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#000000]/70 via-transparent to-[#000000]/70" />

            {/* Drag-over dropzone overlay (if user drags file) */}
            {isDraggingOver && (
              <div className="absolute inset-0 bg-[#000000]/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#FFFFFF] rounded-3xl animate-pulse pointer-events-none">
                <FileVideo className="w-12 h-12 text-[#FFFFFF] mb-3" />
                <p className="text-base font-bold font-cinzel text-[#F5F5F5]">Drop your KITT AI video here</p>
                <p className="text-xs text-[#FFFFFF] mt-1 font-mono">Loads instantly</p>
              </div>
            )}

            {/* Subtle Pause Indicator Overlay when paused */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-30 transition-all pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFFFFF] to-[#737373] border border-[#F5F5F5]/40 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)] text-[#000000]">
                  <Play className="w-7 h-7 fill-[#000000] translate-x-0.5" />
                </div>
              </div>
            )}

            {/* Subtle Closed Caption / Subtitle Banner */}
            {currentSubtitle && (
              <div className="absolute bottom-8 inset-x-0 flex justify-center pointer-events-none z-30 px-4">
                <div className="px-5 py-2.5 rounded-xl bg-[#000000]/85 backdrop-blur-md border border-[#FFFFFF]/30 text-[#F5F5F5] font-serif-luxury text-sm sm:text-base font-normal tracking-wide shadow-2xl text-center">
                  {currentSubtitle}
                </div>
              </div>
            )}

            {/* Synced Floating HUD Badges that appear as the video progresses */}
            <div className="absolute top-4 left-4 pointer-events-none z-20 space-y-2">
              <div className={`transition-all duration-500 transform ${currentTime >= 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="px-3 py-1.5 rounded-lg bg-[#000000]/80 backdrop-blur-md border border-[#FFFFFF]/35 text-[11px] font-mono text-[#F5F5F5] flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFFFFF]" />
                  <span>Requirement: Auto-Hydration Architecture</span>
                </div>
              </div>

              <div className={`transition-all duration-500 transform ${currentTime >= 5.0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="px-3 py-1.5 rounded-lg bg-[#000000]/80 backdrop-blur-md border border-[#8F8F8F]/40 text-[11px] font-mono text-[#B4B4B4] flex items-center gap-2 shadow-lg">
                  <Layers className="w-3.5 h-3.5 text-[#8F8F8F]" />
                  <span>3D Assembly: ESP32 + 5V Pump Tied</span>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 pointer-events-none z-20 space-y-2 text-right">
              <div className={`transition-all duration-500 transform ${currentTime >= 7.0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <div className="px-3 py-1.5 rounded-lg bg-[#000000]/80 backdrop-blur-md border border-[#8F8F8F]/40 text-[11px] font-mono text-[#B4B4B4] flex items-center gap-2 shadow-lg justify-end">
                  <span>Simulation Engine: 3.3V Logic Safe</span>
                  <Activity className="w-3.5 h-3.5 text-[#B4B4B4]" />
                </div>
              </div>

              <div className={`transition-all duration-500 transform ${currentTime >= 8.8 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <div className="px-3 py-1.5 rounded-lg bg-[#000000]/80 backdrop-blur-md border border-[#FFFFFF]/40 text-[11px] font-mono text-[#F5F5F5] flex items-center gap-2 shadow-lg justify-end">
                  <span>Hardware Fabrication: DRC Pass</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFFFFF]" />
                </div>
              </div>
            </div>

            {/* Very Small Transparent Volume On/Off Icon on the right */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-[#000000]/90 backdrop-blur-md border border-[#FFFFFF]/25 hover:border-[#FFFFFF] text-[#F5F5F5]/80 hover:text-[#F5F5F5] transition-all shadow-lg cursor-pointer flex items-center justify-center group/vol"
              title={isMuted ? 'Turn volume on' : 'Turn volume off'}
              aria-label={isMuted ? 'Volume Off (Click to turn on)' : 'Volume On (Click to turn off)'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5F5F5]/70 group-hover/vol:text-[#F5F5F5] transition-colors" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFFFFF] group-hover/vol:text-[#F5F5F5] transition-colors" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
