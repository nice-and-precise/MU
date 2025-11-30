"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function ProjectOrbit() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"],
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

    const projects = [
        {
            id: 1,
            title: "Hwy 23 Expansion",
            location: "Kandiyohi County",
            description: "2.5 miles of utility relocation for MnDOT corridor expansion.",
            image: "/images/Willmar_Work.jpg", // Placeholder
        },
        {
            id: 2,
            title: "Willmar Industrial Park",
            location: "Willmar, MN",
            description: "Fiber optic backbone installation for new commercial zone.",
            image: "/images/pipe-rehabilitation-charlotte-nc.jpg", // Placeholder
        },
        {
            id: 3,
            title: "Spicer Water Main",
            location: "Spicer, MN",
            description: "Directional boring under Green Lake access road.",
            image: "/images/flmagnumart1sm.jpg", // Placeholder
        },
        {
            id: 4,
            title: "Renville Wind Farm",
            location: "Renville County",
            description: "Collection system cabling for 15 turbine sites.",
            image: "/images/Utility-Undergrounding-Blog-Image.png", // Placeholder
        },
    ];

    return (
        <section ref={targetRef} className="relative h-[400vh] bg-charcoal">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-10 px-10">
                    <div className="flex flex-col justify-center min-w-[400px]">
                        <h2 className="font-heading text-6xl text-white uppercase leading-tight">
                            Project <br /> Orbit
                        </h2>
                        <p className="text-gray-400 mt-4 max-w-xs">
                            Navigating complex subterranean environments across West Central Minnesota.
                        </p>
                    </div>

                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="group relative h-[60vh] w-[80vw] md:w-[40vw] overflow-hidden rounded-2xl bg-gray-900 border border-white/10"
                        >
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                            <img
                                src={project.image}
                                alt={project.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
                                <h3 className="font-heading text-3xl text-white mb-2">{project.title}</h3>
                                <p className="text-orange font-bold uppercase text-sm mb-2">{project.location}</p>
                                <p className="text-gray-300 text-sm">{project.description}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
