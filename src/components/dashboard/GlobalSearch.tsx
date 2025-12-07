"use client"

import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    User,
    Search,
    FileText,
    HardHat,
    MapPin,
    Flag
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { NAV_ITEMS, NavItem } from "@/config/nav"
import { Button } from "@/components/ui/button"

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    // Flatten nav items for search
    const allNavItems = React.useMemo(() => {
        const items: (NavItem & { group: string })[] = []
        NAV_ITEMS.forEach(group => {
            group.items.forEach(item => {
                items.push({ ...item, group: group.title })
            })
        })
        return items
    }, [])

    return (
        <>
            <Button
                variant="outline"
                className="w-full relative h-9 justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <span className="hidden lg:inline-flex">Search...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Navigation">
                        {allNavItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <CommandItem
                                    key={item.href}
                                    value={item.title}
                                    onSelect={() => {
                                        runCommand(() => router.push(item.href))
                                    }}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                    <span className="ml-auto text-xs text-muted-foreground">{item.group}</span>
                                </CommandItem>
                            )
                        })}
                    </CommandGroup>

                    <CommandSeparator />

                    {/* Future: Add Projects / Reports search here */}

                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
