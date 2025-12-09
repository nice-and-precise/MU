import ComingSoon from "@/components/ui/ComingSoon";

export default function MobilePayPage() {
    return (
        <div className="p-4 space-y-4 pb-20">
            <h1 className="text-2xl font-bold mb-4 font-heading text-foreground">Pay Stubs</h1>
            <ComingSoon
                title="Pay Stubs Coming Soon"
                description="View your pay history and download stubs directly from your mobile device."
            />
        </div>
    );
}
