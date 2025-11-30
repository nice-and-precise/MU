export default function TrustBar() {
    const badges = [
        "SQUTI Certified 2026 Ready",
        "MnDOT Approved",
        "Bonded & Insured",
        "Est. 1990",
    ];

    return (
        <div className="bg-charcoal border-y border-white/10 py-6 relative z-20">
            <div className="container mx-auto px-6">
                <div className="flex flex-wrap justify-center md:justify-between items-center gap-6">
                    {badges.map((badge, index) => (
                        <div key={index} className="flex items-center space-x-3 group">
                            <div className="w-2 h-2 bg-orange rounded-full group-hover:scale-150 transition-transform" />
                            <span className="font-heading text-gray-400 text-sm md:text-base uppercase tracking-widest group-hover:text-white transition-colors">
                                {badge}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
