"use client";

import { motion } from "framer-motion";
import { Shield, HardHat, AlertTriangle } from "lucide-react";

export default function Safety() {
    return (
        <section id="safety" className="py-24 bg-charcoal relative">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">

                {/* Text Content */}
                <div className="w-full md:w-1/2">
                    <h2 className="font-heading text-4xl md:text-6xl text-white uppercase mb-6">
                        Safety is our <br />
                        <span className="text-orange">Culture</span>
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                        It's not just a checklist. It's the foundation of every cubic yard we move.
                        From trench box protocols to daily briefings, we ensure every crew member goes home safe.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-orange/50 transition-colors">
                            <Shield className="w-8 h-8 text-orange flex-shrink-0" />
                            <div>
                                <h4 className="text-white font-bold uppercase mb-1">OSHA Compliant</h4>
                                <p className="text-gray-400 text-sm">Strict adherence to federal and state regulations.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-orange/50 transition-colors">
                            <HardHat className="w-8 h-8 text-orange flex-shrink-0" />
                            <div>
                                <h4 className="text-white font-bold uppercase mb-1">Certified Crew</h4>
                                <p className="text-gray-400 text-sm">Ongoing training and certification programs.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Image */}
                <div className="w-full md:w-1/2 relative group cursor-pointer">
                    <div className="absolute inset-0 bg-orange rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500" />
                    <div className="relative rounded-2xl overflow-hidden border-2 border-white/10">
                        <img
                            src="/images/trench.jpg"
                            alt="Worker in Trench"
                            className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                        />

                        {/* Reveal Stats Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-5xl font-heading text-white font-bold mb-2">100%</div>
                                <div className="text-orange uppercase tracking-widest">Safety Record</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
