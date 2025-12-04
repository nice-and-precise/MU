import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HardHat } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="bg-yellow-500 p-4 rounded-full bg-opacity-10">
                        <HardHat className="w-16 h-16 text-yellow-500" />
                    </div>
                </div>

                <h1 className="text-6xl font-bold tracking-tighter text-yellow-500">404</h1>
                <h2 className="text-2xl font-semibold">Page Not Found</h2>
                <p className="text-slate-400">
                    The page you are looking for might have been moved, deleted, or possibly never existed.
                </p>

                <div className="pt-8">
                    <Link href="/dashboard">
                        <Button size="lg" className="bg-yellow-500 text-slate-900 hover:bg-yellow-400 font-bold">
                            Return to Command Center
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
