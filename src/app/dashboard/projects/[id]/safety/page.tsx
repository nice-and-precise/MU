import { getSafetyMeetings, getJSAs, getInspections } from "@/actions/safety";
import { getAssets } from "@/actions/equipment";
import ToolboxTalkForm from "@/components/safety/ToolboxTalkForm";
import JSABuilder from "@/components/safety/JSABuilder";
import InspectionForm from "@/components/safety/InspectionForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SafetyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const [meetingsRes, jsasRes, inspectionsRes, assetsRes] = await Promise.all([
        getSafetyMeetings(projectId),
        getJSAs(projectId),
        getInspections(projectId),
        getAssets()
    ]);

    const meetings = meetingsRes.data || [];
    const jsas = jsasRes.data || [];
    const inspections = inspectionsRes.data || [];
    const assets = assetsRes.data || [];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Safety Management</h1>
                <p className="text-gray-500">Compliance, JSAs, and Inspections.</p>
            </div>

            <Tabs defaultValue="forms" className="w-full">
                <TabsList>
                    <TabsTrigger value="forms">Forms</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="forms" className="space-y-8 mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ToolboxTalkForm projectId={projectId} />
                        <InspectionForm projectId={projectId} assets={assets} />
                    </div>
                    <JSABuilder projectId={projectId} />
                </TabsContent>

                <TabsContent value="history" className="space-y-8 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded bg-white">
                            <h3 className="font-bold mb-2">Recent Meetings</h3>
                            {meetings.map(m => (
                                <div key={m.id} className="text-sm mb-2 pb-2 border-b last:border-0">
                                    <p className="font-semibold">{m.topic}</p>
                                    <p className="text-gray-500">{new Date(m.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border rounded bg-white">
                            <h3 className="font-bold mb-2">Recent JSAs</h3>
                            {jsas.map(j => (
                                <div key={j.id} className="text-sm mb-2 pb-2 border-b last:border-0">
                                    <p className="font-semibold">{j.taskDescription}</p>
                                    <p className="text-gray-500">{new Date(j.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border rounded bg-white">
                            <h3 className="font-bold mb-2">Recent Inspections</h3>
                            {inspections.map(i => (
                                <div key={i.id} className="text-sm mb-2 pb-2 border-b last:border-0">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">{i.type}</span>
                                        <span className={i.passed ? "text-green-600" : "text-red-600"}>{i.passed ? "PASS" : "FAIL"}</span>
                                    </div>
                                    <p className="text-gray-500">{new Date(i.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
