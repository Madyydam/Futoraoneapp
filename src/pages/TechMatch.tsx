import { useState, useRef, useEffect } from "react";
                </TabsContent >

    {/* Find Devs Tab (Original Waitlist Content) */ }
    < TabsContent value = "find-devs" className = "mt-0 p-4 space-y-6 max-w-md mx-auto" >
                    <div className="text-center space-y-4 pt-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
                            <Heart className="w-10 h-10 text-white fill-white" />
                        </div>
                        <h2 className="text-3xl font-bold">Find Real Connections</h2>
                        <p className="text-muted-foreground">Match with developers who ship code and share coffee.</p>
                    </div>

                    <Card className="border-border shadow-lg">
                        <CardContent className="p-6 text-center space-y-4">
                            <h3 className="text-xl font-bold">Why match with a dev?</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex flex-col items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                                    <Code className="text-primary" />
                                    <span>Code Together</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                                    <Coffee className="text-orange-500" />
                                    <span>Coffee runs</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                                    <Gamepad2 className="text-purple-500" />
                                    <span>Gaming Duo</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-secondary/50 rounded-xl">
                                    <Rocket className="text-pink-500" />
                                    <span>Build Products</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 border-0">BETA ACCESS</Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Sparkles size={12} className="text-yellow-500" /> 1,240 on waitlist
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Join the Early Access List</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                We are strictly matching algorithms to find you the perfect code-compatible partner. Be the first to know when we launch!
                            </p>
                            <Button className="w-full font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg shadow-pink-500/20">
                                Join Waitlist <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent >
            </Tabs >

    <BottomNav />
        </div >
    );
};

export default TechMatch;
