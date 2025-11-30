"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                setIsLoading(false);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('/images/Willmar_Work.jpg')] bg-cover bg-center opacity-20" />

            <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-none shadow-2xl">
                <CardHeader className="space-y-4 text-center pb-8">
                    <div className="mx-auto bg-orange w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-heading uppercase tracking-wide text-charcoal">
                        Midwest Underground
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Enter your credentials to access the command center
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@midwestunderground.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-gray-300 focus:border-orange focus:ring-orange"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-gray-300 focus:border-orange focus:ring-orange"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-orange hover:bg-orange/90 text-white font-bold py-6"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
