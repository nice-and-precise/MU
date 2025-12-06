import { MobileNavBar } from '@/components/mobile/MobileNavBar';

export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="flex-1 pb-16">
                {children}
            </div>
            <MobileNavBar />
        </div>
    );
}
