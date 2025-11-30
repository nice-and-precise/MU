"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

export default function Services() {
    const containerRef = useRef(null);

    const services = [
        {
            id: 1,
            title: "Directional Boring",
            description: "Trenchless installation minimizing surface disruption.",
            image: "/images/flmagnumart1sm.jpg", // Yellow Drill
            align: "left",
        },
        {
            id: 2,
            title: "Hydro-Excavation",
            description: "Safe daylighting of critical infrastructure.",
            image: "/images/pipe-rehabilitation-charlotte-nc.jpg", // Pipes
            align: "right",
        },
        {
            id: 3,
            title: "Fiber & Telecom",
            description: "Long-haul connectivity for the digital age.",
            image: "/images/Utility-Undergrounding-Blog-Image.png", // Reel
            align: "center",
        },
    ];

    return (
        <section id="services" className="py-24 bg-charcoal relative overflow-hidden" ref={containerRef}>
            <div className="container mx-auto px-6 relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="font-heading text-4xl md:text-6xl text-white mb-20 text-center uppercase"
                >
                    Premier Underground Utility & HDD Solutions
                </motion.h2>

                <div className="space-y-32">
                    {services.map((service, index) => (
                        <div
                            key={service.id}
                            className={`flex flex-col md:flex-row items-center gap-12 ${service.align === "right" ? "md:flex-row-reverse" : ""
                                } ${service.align === "center" ? "flex-col text-center" : ""}`}
                        >
                            {/* Image / Visual */}
                            <motion.div
                                className={`w-full md:w-1/2 ${service.align === "center" ? "md:w-2/3" : ""}`}
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, type: "spring" }}
                                viewport={{ once: true, margin: "-100px" }}
                            >
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-orange/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="relative z-10 w-full h-auto rounded-lg shadow-2xl border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />

                                    {/* Floating Physics Effect on Hover */}
                                    <motion.div
                                        className="absolute -inset-4 border border-orange/30 rounded-lg z-0"
                                        animate={{
                                            y: [0, -10, 0],
                                            rotate: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: index * 0.5,
                                        }}
                                    />
                                </div>
                            </motion.div>

                            {/* Text Content */}
                            <motion.div
                                className={`w-full md:w-1/2 ${service.align === "center" ? "md:w-2/3" : ""}`}
                                initial={{ opacity: 0, x: service.align === "left" ? 50 : -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                <h3 className="font-heading text-3xl md:text-4xl text-white mb-4">
                                    {service.title}
                                </h3>
                                <p className="font-sans text-gray-400 text-lg leading-relaxed mb-6">
                                    {service.description}
                                </p>
                                <button className="text-orange font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 mx-auto md:mx-0">
                                    Learn More <span className="text-xl">→</span>
                                </button>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
