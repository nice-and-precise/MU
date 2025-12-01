import { getInvoice } from "@/actions/invoicing";
import { notFound } from "next/navigation";
import InvoiceEditor from "@/components/invoicing/InvoiceEditor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = await getInvoice(id);

    if (!invoice) {
        notFound();
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href={`/dashboard/projects/${invoice.projectId}/invoicing`} className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Invoices
                </Link>
                <h1 className="text-3xl font-bold">Application #{invoice.applicationNo}</h1>
                <p className="text-gray-500">{invoice.project.name}</p>
            </div>

            <InvoiceEditor invoice={invoice} />
        </div>
    );
}
