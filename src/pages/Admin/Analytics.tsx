import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

const AnalyticsPage = () => {
    const [engagementData, setEngagementData] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalLikes: 0,
        totalComments: 0,
        totalRevenue: 0,
        activeUsers: 0 // Placeholder until we have advanced tracking
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // 1. Fetch Likes with dates
            const { data: likes } = await supabase
                .from("likes")
                .select("created_at")
                .order("created_at", { ascending: true });

            // 2. Fetch Comments with dates
            const { data: comments } = await supabase
                .from("comments")
                .select("created_at")
                .order("created_at", { ascending: true });

            // 3. Fetch Revenue (Transactions)
            const { data: transactions } = await supabase
                .from("transactions")
                .select("created_at, platform_fee")
                .order("created_at", { ascending: true });

            // --- Aggregation Logic for Engagement ---
            // Group by date (DD Mon) for the last 7 days or just all available
            const engagementMap = new Map();

            // Helper to init map entry
            const initEntry = (dateKey: string) => {
                if (!engagementMap.has(dateKey)) {
                    engagementMap.set(dateKey, { name: dateKey, likes: 0, comments: 0 });
                }
            };

            likes?.forEach(like => {
                const dateKey = new Date(like.created_at).toLocaleDateString('default', { day: '2-digit', month: 'short' });
                initEntry(dateKey);
                engagementMap.get(dateKey).likes++;
            });

            comments?.forEach(comment => {
                const dateKey = new Date(comment.created_at).toLocaleDateString('default', { day: '2-digit', month: 'short' });
                initEntry(dateKey);
                engagementMap.get(dateKey).comments++;
            });

            // Convert map to array and take last 7 days of activity
            const engagementChart = Array.from(engagementMap.values()).slice(-7);
            setEngagementData(engagementChart);
            setStats(prev => ({
                ...prev,
                totalLikes: likes?.length || 0,
                totalComments: comments?.length || 0
            }));


            // --- Aggregation Logic for Revenue ---
            // Group by Week or Month? Let's do daily for now to keep consistent, or monthly if data spans long
            const revenueMap = new Map();
            let totalRev = 0;

            transactions?.forEach(tx => {
                const dateKey = new Date(tx.created_at).toLocaleDateString('default', { month: 'short', day: 'numeric' });
                if (!revenueMap.has(dateKey)) {
                    revenueMap.set(dateKey, { name: dateKey, revenue: 0 });
                }
                const fee = Number(tx.platform_fee) || 0;
                revenueMap.get(dateKey).revenue += fee;
                totalRev += fee;
            });

            const revenueChart = Array.from(revenueMap.values());
            setRevenueData(revenueChart);
            setStats(prev => ({ ...prev, totalRevenue: totalRev }));


        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics Reports</h2>
                    <p className="text-muted-foreground mt-1">Detailed performance metrics and trends (Real Data).</p>
                </div>

                <Tabs defaultValue="engagement" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="engagement">Engagement</TabsTrigger>
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    </TabsList>

                    <TabsContent value="engagement" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalLikes}</div>
                                    <p className="text-xs text-muted-foreground">Lifetime</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalComments}</div>
                                    <p className="text-xs text-muted-foreground">Lifetime</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">Est. Daily Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">~{(stats.totalLikes + stats.totalComments) / 30 | 0}</div>
                                    <p className="text-xs text-muted-foreground">Actions / day (approx)</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>User Engagement Trends</CardTitle>
                                <CardDescription>Likes and Comments over time (Real Data)</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={engagementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                            <YAxis tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="likes" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                            <Line type="monotone" dataKey="comments" stroke="#82ca9d" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="revenue">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Overview</CardTitle>
                                <CardDescription>Total Platform Fees Earned: ${stats.totalRevenue.toFixed(2)}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                            <YAxis tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                            <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default AnalyticsPage;
