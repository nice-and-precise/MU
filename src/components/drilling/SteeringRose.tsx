"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SteeringRoseProps {
    toolFace: number; // 0-360
    pitch: number; // degrees
    azimuth: number; // 0-360
    targetToolFace?: number;
    status?: 'normal' | 'warning' | 'critical'; // Traffic Light System
    highContrast?: boolean; // Day Mode
}

export default function SteeringRose({
    toolFace,
    pitch,
    azimuth,
    targetToolFace,
    status = 'normal',
    highContrast = false
}: SteeringRoseProps) {
    // Traffic Light Colors
    const statusColors = {
        normal: highContrast ? 'bg-green-600' : 'bg-green-500',
        warning: highContrast ? 'bg-yellow-600' : 'bg-yellow-500',
        critical: highContrast ? 'bg-red-600' : 'bg-red-500',
    };

    const statusBorder = {
        normal: highContrast ? 'border-green-800' : 'border-green-500/50',
        warning: highContrast ? 'border-yellow-800' : 'border-yellow-500/50',
        critical: highContrast ? 'border-red-800' : 'border-red-500/50',
    };

    // High Contrast Styles
    const bgClass = highContrast ? 'bg-[#FFD700]' : 'bg-slate-900';
    const borderClass = highContrast ? 'border-black' : 'border-slate-700';
    const textClass = highContrast ? 'text-black' : 'text-slate-400';
    const needleClass = highContrast ? 'border-b-black' : 'border-b-orange-500';
    const ghostClass = highContrast ? 'border-b-gray-600' : 'border-b-green-500/50';
    const centerBg = highContrast ? 'bg-white' : 'bg-slate-800';
    const centerText = highContrast ? 'text-black' : 'text-white';

    return (
        <motion.div
            className={`relative w-64 h-64 flex items-center justify-center rounded-full border-4 shadow-2xl ${bgClass} ${borderClass}`}
            animate={{ borderColor: highContrast ? (status === 'critical' ? '#991b1b' : '#000') : (status === 'critical' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(51, 65, 85, 1)') }}
            transition={{ duration: 0.5 }}
        >
            {/* Compass Rose Background */}
            <div className={`absolute inset-0 rounded-full border-2 opacity-50 ${highContrast ? 'border-black' : 'border-slate-600'}`}></div>

            {/* Traffic Light Halo (Pulse if critical) */}
            {status === 'critical' && (
                <motion.div
                    className="absolute inset-0 rounded-full bg-red-500/20"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}

            {/* Ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <div
                    key={deg}
                    className="absolute w-full h-full flex justify-center"
                    style={{ transform: `rotate(${deg}deg)` }}
                >
                    <div className={`w-1 ${deg % 90 === 0 ? (highContrast ? 'h-4 bg-black' : 'h-4 bg-slate-400') : (highContrast ? 'h-2 bg-black' : 'h-2 bg-slate-600')}`}></div>
                </div>
            ))}

            {/* Labels */}
            <div className={`absolute top-2 font-bold ${textClass}`}>12</div>
            <div className={`absolute bottom-2 font-bold ${textClass}`}>6</div>
            <div className={`absolute left-3 font-bold ${textClass}`}>9</div>
            <div className={`absolute right-3 font-bold ${textClass}`}>3</div>

            {/* Target Indicator (Ghost Needle) */}
            {targetToolFace !== undefined && (
                <motion.div
                    className="absolute w-full h-full flex justify-center items-start"
                    animate={{ rotate: targetToolFace }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                    <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] mt-4 ${ghostClass}`}></div>
                </motion.div>
            )}

            {/* Tool Face Needle */}
            <motion.div
                className="absolute w-full h-full flex justify-center items-start"
                animate={{ rotate: toolFace }}
                transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1 }}
            >
                {/* Needle Head */}
                <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] mt-2 drop-shadow-lg ${needleClass}`}></div>
            </motion.div>

            {/* Center Info Hub */}
            <div className={`absolute w-32 h-32 rounded-full flex flex-col items-center justify-center border-2 z-10 ${centerBg} ${highContrast ? 'border-black' : 'border-slate-600'}`}>
                <div className={`text-xs uppercase tracking-wider ${textClass}`}>Pitch</div>
                <motion.div
                    key={pitch} // Trigger animation on change
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-2xl font-bold ${centerText}`}
                >
                    {pitch.toFixed(1)}°
                </motion.div>
                <div className={`w-16 h-[1px] my-1 ${highContrast ? 'bg-black' : 'bg-slate-600'}`}></div>
                <div className={`text-xs uppercase tracking-wider ${textClass}`}>TF</div>
                <div className={`text-xl font-bold ${highContrast ? 'text-black' : 'text-orange-400'}`}>{Math.round(toolFace)}°</div>

                {/* Status Indicator Dot */}
                <motion.div
                    className={`mt-1 w-3 h-3 rounded-full ${statusColors[status]}`}
                    animate={{ scale: status === 'critical' ? [1, 1.5, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: status === 'critical' ? Infinity : 0 }}
                />
            </div>
        </motion.div>
    );
}
