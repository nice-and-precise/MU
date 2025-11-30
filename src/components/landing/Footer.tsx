import { MapPin, Phone, Mail, Facebook, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer id="contact" className="bg-black text-white pt-20 pb-10 border-t border-white/10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="font-heading text-2xl uppercase mb-6 tracking-wider">Midwest Underground</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Engineering the digital ecosystem of heavy civil infrastructure.
                            Precision directional boring and utility services for Minnesota.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-orange transition-colors"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-orange transition-colors"><Linkedin className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-1">
                        <h4 className="font-heading text-lg text-orange uppercase mb-6">Command Center</h4>
                        <ul className="space-y-4 text-sm text-gray-300">
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-orange flex-shrink-0" />
                                <span>
                                    4320 CTY RD 8 SE<br />
                                    Willmar, MN 56201
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-orange flex-shrink-0" />
                                <a href="tel:+13205550123" className="hover:text-white transition-colors">(320) 555-0123</a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-orange flex-shrink-0" />
                                <a href="mailto:info@midwestunderground.com" className="hover:text-white transition-colors">info@midwestunderground.com</a>
                            </li>
                        </ul>
                    </div>

                    {/* Engineer's Notebook (SEO FAQ) */}
                    <div className="col-span-1 md:col-span-2 bg-white/5 p-8 rounded-lg border border-white/10">
                        <h4 className="font-heading text-lg text-orange uppercase mb-4">Engineer's Notebook</h4>
                        <div className="space-y-4">
                            <div>
                                <h5 className="text-white font-bold text-sm mb-1">Who provides directional boring in Willmar?</h5>
                                <p className="text-gray-400 text-xs">Midwest Underground specializes in precision directional boring and trenchless technology throughout Kandiyohi County and West Central Minnesota.</p>
                            </div>
                            <div>
                                <h5 className="text-white font-bold text-sm mb-1">What is SQUTI Certification?</h5>
                                <p className="text-gray-400 text-xs">Beginning Jan 1, 2026, underground telecom installation must be performed by Safety Qualified Underground Telecommunications Installers. We are 2026 ready.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Midwest Underground. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Employee Portal</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
