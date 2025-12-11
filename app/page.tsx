/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import {
  Zap,
  ArrowRight,
  MessageSquare,
  Database,
  BarChart3,
  CheckCircle2,
  Smartphone,
  Globe,
  Sparkles,
  Settings,
  Wifi,
  Battery,
  QrCode,
  Loader2,
  Send,
  Plus,
  Play,
} from "lucide-react";

// --- Animation Variants ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
};

const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// --- Components ---

const Navbar = () => (
  <motion.nav
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ type: "spring", stiffness: 100, damping: 20 }}
    className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800"
  >
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sahayata<span className="text-blue-600 dark:text-blue-400">Agent</span>
        </span>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600 dark:text-gray-300">
        <Link href="#demo" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Demo</Link>
        <Link href="#capabilities" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Capabilities</Link>
        <Link href="#integration" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Integrations</Link>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Log In
        </Link>
        <Link
          href="/register"
          className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Start Building
        </Link>
      </div>
    </div>
  </motion.nav>
);

const Hero = () => {
  const { scrollY } = useScroll();
  // Parallax for background blobs
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  // Parallax for the main simulation container
  const containerY = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <section className="relative pt-32 lg:pt-40 lg:pb-32 overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50 via-white to-white dark:from-slate-900 dark:via-gray-950 dark:to-gray-950">

      {/* --- Background Ambient Effects --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div style={{ y: y1 }} className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px]" />
        <motion.div style={{ y: y2 }} className="absolute top-[10%] -right-[10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">

        {/* --- 1. Impactful Headlines --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-3"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-blue-100 dark:border-gray-700 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 mr-2" />
              The Future of Work is Here
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
            Scale Your Business, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              Create your own AI
            </span>
          </motion.h1>

          {/* Subtext Quote */}
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Hire an autonomous workforce that never sleeps, never quits, and speaks 50 languages fluently.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }}
            style={{ y: containerY }} // Parallax scroll effect
            className="relative max-w-6xl mx-auto"
          >
            {/* Glowing Backlight - Creating the 'Main Event' feel */}
            <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 dark:opacity-40 animate-pulse"></div>

            {/* Browser Window Frame */}
            <div className="relative rounded-4xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">

              {/* Browser Toolbar */}
              <div className="h-12 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex items-center px-6 gap-4 backdrop-blur-sm">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-sm" />
                </div>
                {/* Fake URL Bar */}
                <div className="flex-1 max-w-2xl h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center px-4 text-xs text-gray-400 border border-gray-200 dark:border-gray-700 mx-auto shadow-sm">
                  <span className="text-green-500 mr-2">🔒</span> sahayata.ai/demo
                </div>
                <div className="w-16"></div>
              </div>

              <VideoDemoSection />

            </div>

            {/* Floating 'Live' Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 }}
              className="absolute -right-4 top-20 md:-right-12 md:top-32 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping absolute inset-0" />
                  <div className="w-3 h-3 bg-green-500 rounded-full relative" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">System Online</div>
                  <div className="text-[10px] text-gray-500">Processing real-time</div>
                </div>
              </div>
            </motion.div>

          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-28">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-blue-600/40"
            >
              Start Building Now <ArrowRight className="w-5 h-5" />
            </Link>

          </motion.div>

        </motion.div>

        {/* --- 2. The Main Event: Animation Container --- */}


      </div>

      {/* Bottom Gradient Fade to blend with next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white dark:from-gray-950 to-transparent pointer-events-none"></div>
    </section>
  );
};

// --- AUTOMATED DEMO SIMULATION COMPONENT ---
const AnimatedWorkflow = () => {
  // PLAYBACK STATE
  const [isPlaying, setIsPlaying] = useState(false);

  // STEPS STATE
  const [step, setStep] = useState(0);

  // DATA STATE
  const [typedName, setTypedName] = useState("");
  const [typedTask, setTypedTask] = useState("");
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // CONSTANTS
  const NAME_TEXT = "Sahayata Support Bot";
  const TASK_TEXT = "Customer Service";

  // --- LOGIC: Step Manager ---
  // This effect handles the transition time between steps.
  // It only runs if isPlaying is true.
  useEffect(() => {
    if (!isPlaying) return;

    // Define duration for each step (in milliseconds)
    const stepDurations: { [key: number]: number } = {
      0: 1500, // Idle Dashboard -> Hover
      1: 1000, // Hover -> Click/Form Open
      2: 500,  // Form Opening -> Start Typing Name
      3: 2000, // Typing Name Duration
      4: 2000, // Typing Task Duration
      5: 1500, // Select Tone
      6: 3000, // Upload File
      7: 2500, // Deploying Spinner
      8: 3000, // QR Code Success
      9: 2500, // WhatsApp Open
      10: 4000, // Chat Interaction
      11: 100, // Instant Reset
    };

    const currentDuration = stepDurations[step] || 2000;

    const timer = setTimeout(() => {
      if (step === 11) {
        // RESET LOOP
        setStep(0);
        setTypedName("");
        setTypedTask("");
        setSelectedTone(null);
        setUploadProgress(0);
      } else {
        // ADVANCE STEP
        setStep(s => s + 1);

        // Trigger specific instant actions when entering a new step
        if (step === 5) setTimeout(() => setSelectedTone("Empathetic"), 500);
      }
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [isPlaying, step]);


  // --- LOGIC: Typing Simulation (Name) ---
  useEffect(() => {
    if (!isPlaying || step !== 3) return;

    // We want to type "Sahayata Support Bot" over 2 seconds
    // If user pauses, this effect clears. When resumed, it restarts typing from 0 (simplification)
    // or continues if we checked current length. Let's restart for simplicity or use existing length.

    let currentIndex = typedName.length;
    const interval = setInterval(() => {
      if (currentIndex <= NAME_TEXT.length) {
        setTypedName(NAME_TEXT.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 60); // Speed of typing

    return () => clearInterval(interval);
  }, [isPlaying, step]);

  // --- LOGIC: Typing Simulation (Task) ---
  useEffect(() => {
    if (!isPlaying || step !== 4) return;

    let currentIndex = typedTask.length;
    const interval = setInterval(() => {
      if (currentIndex <= TASK_TEXT.length) {
        setTypedTask(TASK_TEXT.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isPlaying, step]);

  // --- LOGIC: Upload Progress ---
  useEffect(() => {
    if (!isPlaying || step !== 6) return;

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Speed of upload
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isPlaying, step]);


  return (
    <div
      onClick={() => setIsPlaying(!isPlaying)}
      className="w-full h-full relative flex items-center bg-transaprent justify-center p-4 md:p-8 overflow-hidden rounded-b-3xl cursor-pointer"
    >

      {/* --- PLAY BUTTON OVERLAY --- */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/20 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-2xl hover:bg-blue-700 transition-all shadow-blue-600/40 ring-4 ring-white/20 dark:ring-gray-900/20"
            >
              {step === 0 ? (
                <>
                  <div className="absolute inset-0 rounded-full animate-ping bg-blue-600 opacity-20"></div>
                  <Play className="w-6 h-6 fill-current" />
                  Start Interactive Demo
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  Resume Demo
                </>
              )}
            </motion.button>
            <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-900/80 px-4 py-1 rounded-full">
              {step === 0 ? "Click to watch the agent creation workflow" : "Demo Paused"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* --- PHASE 0: DASHBOARD --- */}
        {step < 2 && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl h-[600px] bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex"
          >
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-6">
              {/* Sidebar Header */}
              <div className="flex items-center gap-2 px-2">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm">Sahayata</span>
              </div>

              {/* Create Button (The Target) */}
              <motion.div
                animate={step === 1 ? { scale: 0.95 } : { scale: 1 }}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-300 ${step === 1 ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200 dark:ring-blue-900' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-semibold">Create Agent</span>
                {/* Mouse Cursor Simulation */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    className="absolute -bottom-4 -right-4 pointer-events-none"
                  >
                    <div className="w-4 h-4 bg-gray-900 dark:bg-white rounded-full opacity-50 blur-sm absolute" />
                    <svg className="w-6 h-6 text-gray-900 dark:text-white relative z-10 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 4z" /></svg>
                  </motion.div>
                )}
              </motion.div>

              {/* Nav Items */}
              <div className="space-y-1">
                {['Dashboard', 'Agents', 'Conversations', 'Settings'].map((item, i) => (
                  <div key={item} className={`px-3 py-2 rounded-lg text-sm text-gray-500 flex items-center gap-3 ${i === 0 ? 'bg-gray-200/50 dark:bg-gray-800/50 text-gray-900 dark:text-white' : ''}`}>
                    <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 p-8 bg-white dark:bg-gray-950">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Overview</h3>
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800" />
              </div>

              {/* Dummy Charts */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 mb-2" />
                    <div className="w-16 h-2 rounded bg-gray-200 dark:bg-gray-800" />
                  </div>
                ))}
              </div>
              <div className="h-48 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-6 flex items-end gap-4">
                {[40, 70, 50, 90, 30, 80, 60].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-100 dark:bg-blue-900/20 rounded-t-lg relative group">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- PHASE 1: AGENT BUILDER UI (The Form) --- */}
        {step >= 2 && step < 8 && (
          <motion.div
            key="builder"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl h-[400px] bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Window Controls */}
            <div className="h-10 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-2 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex gap-1.5 opacity-50"><div className="w-2.5 h-2.5 rounded-full bg-gray-400" /><div className="w-2.5 h-2.5 rounded-full bg-gray-400" /><div className="w-2.5 h-2.5 rounded-full bg-gray-400" /></div>
              <div className="text-[10px] text-gray-400 font-mono ml-2 uppercase tracking-widest">Create New Agent</div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Left Column: Form Fields */}
              <div className="space-y-5">

                {/* Field 1: Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agent Name</label>
                  <div className={`relative transition-all duration-300 ${step === 3 ? 'ring-2 ring-blue-500/20 scale-[1.02]' : ''}`}>
                    <div className="h-10 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center px-3 text-sm text-gray-900 dark:text-white">
                      {typedName}
                      {step === 3 && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="ml-0.5 w-0.5 h-4 bg-blue-500" />}
                    </div>
                  </div>
                </div>

                {/* Field 2: Agent Task */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agent Task</label>
                  <div className={`relative transition-all duration-300 ${step === 4 ? 'ring-2 ring-blue-500/20 scale-[1.02]' : ''}`}>
                    <div className="h-10 w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center px-3 text-sm text-gray-900 dark:text-white">
                      {typedTask}
                      {step === 4 && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="ml-0.5 w-0.5 h-4 bg-blue-500" />}
                    </div>
                  </div>
                </div>

                {/* Field 3: Tone Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personality & Tone</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Formal', 'Empathetic'].map((tone) => (
                      <div
                        key={tone}
                        className={`h-10 rounded-lg border flex items-center justify-center text-sm font-medium transition-all duration-300
                          ${selectedTone === tone
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 text-gray-400 bg-white dark:bg-gray-900'
                          }
                          ${step === 5 && !selectedTone ? 'animate-pulse' : ''}
                        `}
                      >
                        {tone}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Field 4: Privacy */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-traqnsparent dark:bg-gray-900/50">
                  {/* <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">PII Redaction</span>
                  </div>
                  <div className="w-8 h-4 bg-green-500 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div> */}
                </div>

              </div>

              {/* Right Column: Upload & Deploy */}
              <div className="flex flex-col justify-between space-y-6">

                {/* Upload Area */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Knowledge Base</label>
                  <div
                    className={`relative h-full min-h-[140px] w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-500 overflow-hidden
                        ${step === 6
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                      }`}
                  >
                    {step >= 6 && uploadProgress > 0 ? (
                      <div className="w-full px-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-blue-600 flex items-center gap-2">
                            <Database className="w-3 h-3" /> manuals_v2.pdf
                          </span>
                          <span className="text-xs text-blue-600">{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        {uploadProgress === 100 && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center justify-center text-green-500 text-xs font-bold gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Vectorized
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-3 flex items-center justify-center">
                          <Plus className="w-5 h-5" />
                        </div>
                        <p className="text-xs">Drop PDF, TXT or URLs</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deploy Button */}
                <motion.button
                  animate={step === 7 ? { scale: 0.98 } : {}}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-300
                    ${step >= 7 ? 'bg-gray-800 dark:bg-gray-700 cursor-wait' : 'bg-blue-600 shadow-blue-600/20'}
                  `}
                >
                  {step === 7 ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="animate-pulse">Training Model...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" /> Deploy Agent
                    </>
                  )}
                </motion.button>

              </div>
            </div>
          </motion.div>
        )}

        {/* --- PHASE 2: SUCCESS / QR --- */}
        {step === 8 && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="bg-white dark:bg-gray-950 p-10 rounded-3xl shadow-2xl text-center border border-gray-200 dark:border-gray-800 max-w-sm w-full relative overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Agent Active</h3>
            <p className="text-gray-500 mb-8 text-sm">Integration complete. <br />Scan to test on WhatsApp.</p>

            <div className="bg-white p-3 rounded-2xl shadow-inner inline-block border border-gray-100 relative group cursor-pointer">
              <QrCode className="w-40 h-40 text-gray-900" />
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                <span className="text-xs font-bold text-blue-600">Simulating Scan...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- PHASE 3: WHATSAPP CHAT --- */}
        {step >= 9 && (
          <motion.div
            key="whatsapp"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[320px] bg-gray-900 rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative"
          >
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-gray-900 rounded-b-xl z-20"></div>

            <div className="bg-[#0b141a] h-[600px] w-full flex flex-col font-sans relative">

              {/* Status Bar */}
              <div className="h-8 bg-[#202c33] w-full flex items-center justify-between px-6 pt-2">
                <span className="text-[10px] text-white font-medium">9:41</span>
                <div className="flex gap-1"><Wifi className="w-3 h-3 text-white" /><Battery className="w-3 h-3 text-white" /></div>
              </div>

              {/* Header */}
              <div className="bg-[#202c33] p-3 flex items-center gap-3 border-b border-gray-700/50 z-10">
                <ArrowRight className="w-5 h-5 text-gray-300 rotate-180" />
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">S</div>
                <div>
                  <div className="text-white text-sm font-semibold">Sahayata Bot</div>
                  <div className="text-[10px] text-gray-400">Business • {step === 9 ? 'online' : 'typing...'}</div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-90 relative">

                {/* Message 1: Bot Intro */}
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring" }}
                  className="bg-[#202c33] p-3 rounded-2xl rounded-tl-none self-start max-w-[85%] shadow-md"
                >
                  <p className="text-white text-xs leading-relaxed">Namaste! I am the Sahayata Virtual Assistant. How can I help you today?</p>
                  <span className="text-[9px] text-gray-500 block text-right mt-1">9:41 AM</span>
                </motion.div>

                {/* Message 2: User Question */}
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="bg-[#005c4b] p-3 rounded-2xl rounded-tr-none ml-auto max-w-[85%] shadow-md"
                >
                  <p className="text-white text-xs leading-relaxed">I need to check the status of my refund.</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[9px] text-green-200">9:42 AM</span>
                    <CheckCircle2 className="w-3 h-3 text-blue-300" />
                  </div>
                </motion.div>

                {/* Message 3: Bot Reply */}
                {step >= 10 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#202c33] p-3 rounded-2xl rounded-tl-none self-start max-w-[85%] shadow-md"
                  >
                    <p className="text-white text-xs leading-relaxed">
                      I can help with that. Please provide your <span className="font-bold text-blue-300">Ticket ID</span>.
                    </p>
                    <span className="text-[9px] text-gray-500 block text-right mt-1">9:42 AM</span>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="bg-[#202c33] p-2 flex items-center gap-2 pb-6">
                <div className="flex-1 bg-[#2a3942] h-10 rounded-full px-4 flex items-center justify-between">
                  <span className="text-gray-500 text-xs">Message...</span>
                </div>
                <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform">
                  <Send className="w-4 h-4 text-white ml-0.5" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

const VideoDemoSection = () => {
  return (
    <section id="demo" className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm tracking-wider uppercase mb-3 block">From Idea to WhatsApp in Seconds</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            See Sahayata In Action
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
            Watch the actual workflow: Create an agent, train it on your documents, and start chatting instantly.
          </p>
        </div>

        {/* Demo Container */}
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden">
          {/* Browser Toolbar for realism */}
          {/* <div className="h-12 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            {/* Search Bar Visual */}
          {/* <div className="flex-1 max-w-2xl h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center px-3 text-xs text-gray-400 border border-gray-200 dark:border-gray-700 mx-auto">
              <span className="text-gray-300 dark:text-gray-600 mr-2">🔒</span> sahayata.ai/demo
            </div>
            <div className="w-20"></div>  */}

          {/* Spacer for balance */}
          {/* </div>  */}

          {/* The Animation Component */}
          <div className="h-[650px] w-full">
            <AnimatedWorkflow />
          </div>
        </div>

        {/* Steps Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          {[
            { title: "1. Configure Persona", desc: "Define tone, privacy rules, and bot identity.", icon: Settings },
            { title: "2. Train Knowledge", desc: "Upload PDFs, Notion docs, or URLs.", icon: Database },
            { title: "3. Auto-Deploy", desc: "Instant availability on WhatsApp & Web.", icon: Smartphone }
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Define explicit types for feature prop
interface FeatureProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FeatureCard = ({ feature, index }: { feature: FeatureProps, index: number }) => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    whileInView="whileInView"
    viewport={{ once: true, margin: "-50px" }}
    className="group relative bg-white dark:bg-gray-900 p-8 rounded-4xl border border-gray-200 dark:border-gray-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 overflow-hidden"
  >
    <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-transparent to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${feature.bg}`}>
      <feature.icon className={`w-7 h-7 ${feature.color}`} />
    </div>

    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 relative z-10">{feature.title}</h3>
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed relative z-10 text-sm">
      {feature.description}
    </p>
  </motion.div>
);

const Features = () => {
  const features = [
    {
      title: "WhatsApp Native",
      description: "Direct integration with WhatsApp Business API. Deploy agents that live where your customers are, with zero latency.",
      icon: Smartphone,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "RAG Knowledge Engine",
      description: "Ingest PDFs, websites, and Notion docs. Your agent learns your business context instantly without hallucinations.",
      icon: Database,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Sentiment Analytics",
      description: "Real-time emotional analysis of conversations to flag frustrated customers and trigger human intervention.",
      icon: BarChart3,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "CRM Bi-Directional Sync",
      description: "Don't just chat. Update HubSpot, Salesforce, or Telerivet contact records automatically based on conversation intent.",
      icon: MessageSquare,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20"
    },
    {
      title: "Human-in-the-Loop",
      description: "The AI handles 80% of queries. The complex 20% are handed off to your team with full context history.",
      icon: CheckCircle2,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-900/20"
    },
    {
      title: "Neural Translation",
      description: "Speak your customer's language. Real-time translation supporting 50+ languages with cultural nuance.",
      icon: Globe,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/20"
    }
  ];

  return (
    <section id="capabilities" className="py-32 bg-gray-50 dark:bg-gray-950 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase text-sm">Capabilities</span>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-3 mb-6">
            Engineered for Enterprise Scale
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            A complete suite of tools designed to automate your workforce, reduce operational costs, and increase customer satisfaction.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Sahayata
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
            The intelligent agent platform for modern businesses. Built to scale, secure by design, and crafted with ❤️ in Nepal.
          </p>
          <div className="flex gap-4">
            {/* Social placeholders */}
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" />
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" />
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-6">Platform</h4>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Agents</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Playground</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Integrations</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Analytics</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-6">Resources</h4>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">API Reference</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Community</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Status</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-6">Company</h4>
          <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <li><Link href="#" className="hover:text-blue-600 transition-colors">About</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Blog</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Careers</Link></li>
            <li><Link href="#" className="hover:text-blue-600 transition-colors">Legal</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Sahayata Agent Inc. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-gray-400">
          <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</Link>
          <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}