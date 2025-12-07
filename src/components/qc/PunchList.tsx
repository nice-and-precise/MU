'use client';

import { useState } from 'react';
import { createPunchItem, updatePunchItem, deletePunchItem } from '@/actions/qc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckSquare, Plus, User as UserIcon, MoreHorizontal, Pencil, Trash2, AlertCircle, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import {
    Form,
} from '@/components/ui/form';
import { FormLayout } from '@/components/ui/FormLayout';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PunchListProps {
    projectId: string;
    items: any[];
    users: any[];
}

const punchItemSchema = z.object({
    title: z.string().min(2, "Description must be at least 2 characters"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    assigneeId: z.string().optional()
});

export default function PunchList({ projectId, items, users }: PunchListProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [deletingItem, setDeletingItem] = useState<any>(null);

    // Filters
    const [viewMode, setViewMode] = useState<string>('all_open');
    const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
    const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');

    const form = useForm<z.infer<typeof punchItemSchema>>({
        resolver: zodResolver(punchItemSchema),
        defaultValues: {
            title: '',
            priority: 'MEDIUM',
            assigneeId: ''
        }
    });

    const editForm = useForm<z.infer<typeof punchItemSchema>>({
        resolver: zodResolver(punchItemSchema),
        defaultValues: {
            title: '',
            priority: 'MEDIUM',
            assigneeId: ''
        }
    });

    const onSubmit = async (values: z.infer<typeof punchItemSchema>) => {
        setLoading(true);
        const res = await createPunchItem({
            projectId,
            title: values.title,
            priority: values.priority,
            assigneeId: values.assigneeId === '' ? undefined : values.assigneeId
        });

        if (res.success) {
            toast.success("Punch item created");
            form.reset({ title: '', priority: 'MEDIUM', assigneeId: '' });
            setShowForm(false);
            router.refresh();
        } else {
            toast.error("Failed to create item");
        }
        setLoading(false);
    };

    const onEditSubmit = async (values: z.infer<typeof punchItemSchema>) => {
        if (!editingItem) return;
        setLoading(true);
        const res = await updatePunchItem({
            id: editingItem.id,
            title: values.title,
            priority: values.priority,
            assigneeId: values.assigneeId === '' ? undefined : values.assigneeId
        });

        if (res.success) {
            toast.success("Item updated");
            setEditingItem(null);
            router.refresh();
        } else {
            toast.error("Failed to update item");
        }
        setLoading(false);
    };

    const onDeleteConfirm = async () => {
        if (!deletingItem) return;
        setLoading(true);
        const res = await deletePunchItem({ id: deletingItem.id, projectId });

        if (res.success) {
            toast.success("Item deleted");
            setDeletingItem(null);
            router.refresh();
        } else {
            toast.error("Failed to delete item");
        }
        setLoading(false);
    };

    const toggleStatus = async (item: any) => {
        const newStatus = item.status === 'OPEN' ? 'COMPLETED' : 'OPEN';
        const res = await updatePunchItem({
            id: item.id,
            status: newStatus,
            completedAt: newStatus === 'COMPLETED' ? new Date() : undefined
        });

        if (res.success) {
            toast.success(`Item marked as ${newStatus.toLowerCase()}`);
            router.refresh();
        } else {
            toast.error("Failed to update status");
        }
    };

    const startEditing = (item: any) => {
        setEditingItem(item);
        editForm.reset({
            title: item.title,
            priority: item.priority as any,
            assigneeId: item.assigneeId || ''
        });
    };

    // Derived state
    const filteredItems = items.filter(item => {
        const createdDate = new Date(item.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // View Mode Filter
        if (viewMode === 'all_open') {
            if (item.status !== 'OPEN') return false;
        } else if (viewMode === 'closed') {
            if (item.status !== 'COMPLETED') return false;
        } else if (viewMode === 'today') {
            // Created today
            if (createdDate < today) return false;
        } else if (viewMode === 'last_30_days') {
            // Created in last 30 days
            if (createdDate < thirtyDaysAgo) return false;
        }

        if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
        if (assigneeFilter !== 'ALL') {
            if (assigneeFilter === 'UNASSIGNED') {
                if (item.assigneeId) return false;
            } else {
                if (item.assigneeId !== assigneeFilter) return false;
            }
        }
        return true;
    });

    const metrics = {
        total: items.length,
        open: items.filter(i => i.status === 'OPEN').length,
        completed: items.filter(i => i.status === 'COMPLETED').length,
        highPriority: items.filter(i => i.status === 'OPEN' && i.priority === 'HIGH').length
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4 space-y-4">
                <div className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl font-heading tracking-tight">
                            <CheckSquare className="w-5 h-5 text-primary" /> Punch List
                        </CardTitle>
                        <CardDescription>
                            manage tasks and issues
                        </CardDescription>
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        variant={showForm ? "secondary" : "default"}
                        size="sm"
                        className="gap-2"
                    >
                        {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> New Item</>}
                    </Button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-muted/30 p-2 rounded-lg text-center border border-border/50">
                        <p className="text-2xl font-bold">{metrics.open}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Open</p>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-lg text-center border border-border/50">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.highPriority}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">High Prio</p>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-lg text-center border border-border/50">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.completed}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Done</p>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-lg text-center border border-border/50">
                        <p className="text-2xl font-bold">{metrics.total}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                    </div>
                </div>

                {/* Tabs & Filters */}
                <div className="space-y-4 pt-2">
                    <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="today">Today</TabsTrigger>
                            <TabsTrigger value="last_30_days">Last 30 Days</TabsTrigger>
                            <TabsTrigger value="all_open">All Open</TabsTrigger>
                            <TabsTrigger value="closed">Closed</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex flex-col md:flex-row gap-2">
                        {/* Status Filter Removed */}
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-full md:w-[130px] h-8 text-xs">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Priority</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                            <SelectTrigger className="w-full md:w-[150px] h-8 text-xs">
                                <SelectValue placeholder="Assignee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Assignees</SelectItem>
                                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                                {users.map(u => (
                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {(viewMode !== 'all_open' || priorityFilter !== 'ALL' || assigneeFilter !== 'ALL') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setViewMode('all_open');
                                    setPriorityFilter('ALL');
                                    setAssigneeFilter('ALL');
                                }}
                                className="h-8 px-2 text-xs ml-auto md:ml-0"
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 pt-0">
                {showForm && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border animate-in fade-in slide-in-from-top-2">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormLayout
                                    name="title"
                                    label="Description"
                                    required
                                    children={(field) => (
                                        <Input placeholder="Describe the issue..." {...field} className="bg-background" />
                                    )}
                                />
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <FormLayout
                                            name="priority"
                                            label="Priority"
                                            required
                                            children={(field) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue placeholder="Priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="LOW">Low</SelectItem>
                                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                                        <SelectItem value="HIGH">High</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <FormLayout
                                            name="assigneeId"
                                            label="Assign To"
                                            children={(field) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue placeholder="Unassigned" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                                                        {users.map(u => (
                                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Save Item'}
                                </Button>
                            </form>
                        </Form>
                    </div>
                )}

                <div className="space-y-3">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className={cn(
                                "group flex items-start gap-4 p-4 rounded-xl border border-transparent bg-card transition-all hover:shadow-sm hover:border-border/50",
                                item.status === 'COMPLETED' ? 'opacity-60 bg-muted/30' : 'bg-background shadow-xs border-border/20'
                            )}
                        >
                            <input
                                type="checkbox"
                                checked={item.status === 'COMPLETED'}
                                onChange={() => toggleStatus(item)}
                                className="mt-1 h-5 w-5 rounded-md border-input text-primary focus:ring-primary/20 transition-colors cursor-pointer"
                            />
                            <div className="flex-1 space-y-1">
                                <p className={cn(
                                    "font-medium leading-none transition-all",
                                    item.status === 'COMPLETED' ? 'line-through text-muted-foreground' : 'text-foreground'
                                )}>
                                    {item.title}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                                    <StatusBadge status={item.priority} />
                                    {item.assignee && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                                            <UserIcon className="w-3 h-3" />
                                            <span className="truncate max-w-[100px]">{item.assignee.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => startEditing(item)}>
                                        <Pencil className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDeletingItem(item)} className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                    {filteredItems.length === 0 && !showForm && (
                        <div className="py-8">
                            <EmptyState
                                title={items.length === 0 ? "No Punch Items" : "No Matches Found"}
                                description={items.length === 0
                                    ? "No punch items yet. This is where field issues will appear once created."
                                    : "No items found matching your filters."}
                                icon={Filter}
                            />
                            {items.length > 0 && (
                                <div className="text-center mt-4">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => {
                                            setViewMode('all_open');
                                            setPriorityFilter('ALL');
                                            setAssigneeFilter('ALL');
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Punch Item</DialogTitle>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                            <FormLayout
                                name="title"
                                label="Description"
                                required
                                children={(field) => (
                                    <Input placeholder="Describe the issue..." {...field} />
                                )}
                            />
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <FormLayout
                                        name="priority"
                                        label="Priority"
                                        required
                                        children={(field) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LOW">Low</SelectItem>
                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                    <SelectItem value="HIGH">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="flex-1">
                                    <FormLayout
                                        name="assigneeId"
                                        label="Assign To"
                                        children={(field) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Assign To" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                                                    {users.map(u => (
                                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the punch item <span className="font-bold">{deletingItem?.title}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                onDeleteConfirm();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
