'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateDailyReportSchema, UpdateDailyReportInput, CrewMember, ProductionLog, MaterialUsage, EquipmentUsage } from '@/schemas/daily-report';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { updateDailyReport, approveDailyReport } from '@/actions/reports';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle, ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepGeneral } from './StepGeneral';
import { StepCrew } from './StepCrew';
import { StepEquipment } from './StepEquipment';
import { StepProduction } from './StepProduction';
import { StepMaterials } from './StepMaterials';
import { ReviewSummary } from './ReviewSummary';

// Define steps
const STEPS = [
    { id: 'general', title: 'General' },
    { id: 'crew', title: 'Crew' },
    { id: 'equipment', title: 'Equipment' },
    { id: 'production', title: 'Production' },
    { id: 'materials', title: 'Materials' },
    { id: 'review', title: 'Review' },
] as const;

type StepId = typeof STEPS[number]['id'];

interface DailyReportFormProps {
    report: any;
    employees?: any[];
    assets?: any[];
    inventoryItems?: any[]; // Passed from parent or fetched
}

export default function DailyReportForm({
    report,
    employees = [],
    assets = [],
    inventoryItems = [] // We need to make sure this is passed down or fetched
}: DailyReportFormProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    // Parse initial data
    const crew: CrewMember[] = report.crew ? (JSON.parse(report.crew) as any[]).map((c: any) => ({
        employeeId: String(c.employeeId),
        role: String(c.role || 'Labor'),
        hours: Number(c.hours || 0)
    })) : [];

    const production: ProductionLog[] = report.production ? (JSON.parse(report.production) as any[]).map((p: any) => ({
        activity: String(p.activity || 'Drill'),
        lf: Number(p.lf || 0),
        pitch: Number(p.pitch || 0),
        azimuth: Number(p.azimuth || 0)
    })) : [];

    const materials: MaterialUsage[] = report.materials ? (JSON.parse(report.materials) as any[]).map((m: any) => ({
        inventoryItemId: String(m.inventoryItemId),
        quantity: Number(m.quantity || 0)
    })) : [];

    const equipment: EquipmentUsage[] = report.equipment ? (JSON.parse(report.equipment) as any[]).map((e: any) => ({
        assetId: String(e.assetId),
        hours: Number(e.hours || 0)
    })) : [];

    const defaultValues: Partial<UpdateDailyReportInput> = {
        weather: report.weather || '',
        notes: report.notes || '',
        crew,
        production,
        materials,
        equipment,
    };

    const methods = useForm<UpdateDailyReportInput>({
        resolver: zodResolver(UpdateDailyReportSchema) as any,
        defaultValues: defaultValues as any,
        mode: "onChange"
    });

    const isLastStep = currentStep === STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    const handleNext = async () => {
        const isValid = await methods.trigger();
        if (isValid) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
        } else {
            toast.error("Please fix validation errors before proceeding.");
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSaveDraft = async () => {
        setLoading(true);
        const data = methods.getValues();
        try {
            await updateDailyReport({ id: report.id, data });
            toast.success("Draft saved successfully");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save draft");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        // Double check validation
        const isValid = await methods.trigger();
        if (!isValid) return;

        if (!confirm("Are you sure you want to approve this report? This action cannot be undone.")) return;

        setLoading(true);
        try {
            // Save first to ensure latest state
            await updateDailyReport({ id: report.id, data: methods.getValues() });
            await approveDailyReport(report.id);
            toast.success("Report approved and finalized!");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to approve report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Progress Indicator */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10" />
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                                    idx <= currentStep
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-muted-foreground border-slate-200"
                                )}
                            >
                                {idx + 1}
                            </div>
                            <span className={cn(
                                "text-xs font-medium",
                                idx <= currentStep ? "text-primary" : "text-muted-foreground"
                            )}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <Card className="min-h-[400px]">
                    <CardContent className="p-6">
                        {/* Dynamic Step Rendering */}
                        {currentStep === 0 && <StepGeneral />}
                        {currentStep === 1 && <StepCrew employees={employees} projectId={report.projectId} />}
                        {currentStep === 2 && <StepEquipment assets={assets} />}
                        {currentStep === 3 && <StepProduction />}
                        {currentStep === 4 && <StepMaterials inventoryItems={inventoryItems} />}
                        {currentStep === 5 && <ReviewSummary report={report} formValues={methods.getValues()} />}
                    </CardContent>
                </Card>

                {/* Navigation Footer */}
                <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                    <Button variant="ghost" onClick={handleBack} disabled={isFirstStep || loading}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleSaveDraft} disabled={loading || report.status === 'APPROVED'}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Draft
                        </Button>

                        {isLastStep ? (
                            <Button onClick={handleApprove} disabled={loading || report.status === 'APPROVED'} className="bg-green-600 hover:bg-green-700">
                                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                Approve & Finalize
                            </Button>
                        ) : (
                            <Button onClick={handleNext} disabled={loading}>
                                Next <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}
