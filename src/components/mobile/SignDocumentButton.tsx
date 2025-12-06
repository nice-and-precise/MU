'use client';

import { Button } from "@/components/ui/button";
import { signDocument } from "@/actions/employees";
import { useTransition } from "react";
import { toast } from "sonner";

interface SignDocumentButtonProps {
    id: string;
}

export function SignDocumentButton({ id }: SignDocumentButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleSign = () => {
        startTransition(async () => {
            const result = await signDocument(id);
            if (result?.error) {
                toast.error("Failed to sign document");
            } else {
                toast.success("Document signed");
            }
        });
    };

    return (
        <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={handleSign}
            disabled={isPending}
        >
            {isPending ? "Signing..." : "Sign"}
        </Button>
    );
}
