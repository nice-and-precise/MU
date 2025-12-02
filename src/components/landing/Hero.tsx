"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]); // Background moves slower
    const y2 = useTransform(scrollY, [0, 500], [0, -150]); // Text moves faster (up)

    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-charcoal">
            {/* Parallax Background Layer */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{ y: y1 }}
            >


                <div className="absolute inset-0 bg-black/60 z-10" /> {/* Overlay */}
                <Image
                    src="/images/Willmar_Work.jpg"
                    alt="Excavator Background"
                    fill
                    priority
                    className="object-cover scale-110"
                    sizes="100vw"
                />
            </motion.div>

            {/* Hero Content */}
            <motion.div
                className="relative z-10 container mx-auto px-6 text-center"
                style={{ y: y2 }}
            >
                {/* Text Backdrop for better readability */}
                <div className="absolute inset-0 -z-10 bg-radial-gradient from-black/60 to-transparent blur-2xl transform scale-150" />

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold text-white uppercase tracking-tighter mb-6 drop-shadow-2xl"
                >
                    Precision <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                        Beneath
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="font-sans text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-lg"
                >
                    Next-Generation Directional Boring & Utility Infrastructure for Minnesota.
                    Engineering the digital ecosystem of the heavy civil sector.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8, type: "spring", stiffness: 100 }}
                >
                    <a
                        href="#contact"
                        className="inline-flex items-center space-x-3 bg-orange hover:bg-orange/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-orange/20 hover:shadow-orange/40"
                    >
                        <span>Launch Project</span>
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                    <div className="w-1 h-2 bg-orange rounded-full" />
                </div>
            </motion.div>
        </section>
    );
}
