"use client";

import { motion } from "framer-motion";

export default function Fleet() {
    return (
        <section id="fleet" className="py-24 bg-charcoal relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="mb-16 text-center">
                    <h2 className="font-heading text-4xl md:text-6xl text-white uppercase mb-4">
                        The Iron Fleet
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Owning the assets means controlling the schedule. Our Vermeer fleet is ready for deployment.
                    </p>
                </div>

                <div className="relative h-[60vh] flex items-center justify-center">
                    {/* Floating Platform Effect */}
                    <motion.div
                        className="relative z-10 w-full max-w-5xl"
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-black/50 blur-xl rounded-full transform scale-x-75 translate-y-10" />
                        <img
                            src="/images/Vermeer-1074x654.jpg"
                            alt="Vermeer Directional Drill"
                            className="w-full h-auto object-contain drop-shadow-2xl"
                        />

                        {/* Tech Specs Overlay */}
                        <motion.div
                            className="absolute top-10 right-10 bg-black/80 backdrop-blur border border-orange/50 p-6 rounded-lg max-w-xs hidden md:block"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className="text-orange font-bold uppercase mb-2">Vermeer Navigator</h3>
                            <ul className="text-gray-300 text-sm space-y-2">
                                <li>• High-torque performance</li>
                                <li>• Precision steering</li>
                                <li>• Rock-boring capability</li>
                            </ul>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
