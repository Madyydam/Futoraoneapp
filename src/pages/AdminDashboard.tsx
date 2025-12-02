import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, XCircle, Clock, Shield, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VerificationRequest {
  id: string;
  user_id: string;
  reason: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; request: VerificationRequest | null }>({
    open: false,
    request: null,
  });
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      const { data: requestsData, error } = await query;

      if (error) throw error;

      // Fetch profiles separately for each request
      const requestsWithProfiles = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', request.user_id)
            .single();

          return {
            ...request,
            profiles: profile || { username: 'Unknown', full_name: 'Unknown User', avatar_url: null },
          } as VerificationRequest;
        })
      );

      setRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch verification requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterCategory, toast]);

  useEffect(() => {
    if (adminLoading) return;
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/feed');
      return;
    }

    fetchRequests();
  }, [isAdmin, adminLoading, navigate, fetchRequests, toast]);

  const handleAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('manage-verification', {
        body: { requestId, action, reviewerNotes: notes },
      });

      if (response.error) throw response.error;

      toast({
        title: action === 'approve' ? "✅ Approved!" : "❌ Rejected",
        description: `Verification request has been ${action}ed`,
      });

      setSelectedRequests(new Set());
      setReviewDialog({ open: false, request: null });
      setReviewNotes("");
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: "Failed to process verification request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedRequests.size === 0) return;

    setProcessing(true);
    const promises = Array.from(selectedRequests).map(id => 
      handleAction(id, action)
    );

    await Promise.all(promises);
    setSelectedRequests(new Set());
    setProcessing(false);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRequests(newSelected);
  };

  const selectAll = () => {
    if (selectedRequests.size === requests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(requests.map(r => r.id)));
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const categoryEmoji: Record<string, string> = {
    developer: "💻",
    creator: "🎨",
    business: "🚀",
    other: "⭐",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/feed')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Manage verification requests</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="developer">💻 Developer</SelectItem>
              <SelectItem value="creator">🎨 Creator</SelectItem>
              <SelectItem value="business">🚀 Business</SelectItem>
              <SelectItem value="other">⭐ Other</SelectItem>
            </SelectContent>
          </Select>

          {selectedRequests.size > 0 && activeTab === 'pending' && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleBulkAction('approve')}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve ({selectedRequests.size})
              </Button>
              <Button
                onClick={() => handleBulkAction('reject')}
                disabled={processing}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject ({selectedRequests.size})
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="h-4 w-4 mr-2" />
              Rejected
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {activeTab === 'pending' && requests.length > 0 && (
              <div className="mb-4">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedRequests.size === requests.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            )}

            {requests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No verification requests found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {requests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {activeTab === 'pending' && (
                            <Checkbox
                              checked={selectedRequests.has(request.id)}
                              onCheckedChange={() => toggleSelection(request.id)}
                            />
                          )}
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              {request.profiles?.username || 'Unknown User'}
                              <Badge variant="secondary">
                                {categoryEmoji[request.category]} {request.category}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {request.profiles?.full_name} • Submitted {new Date(request.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Reason for Verification:</p>
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                        </div>

                        {request.reviewer_notes && (
                          <div>
                            <p className="text-sm font-medium mb-2">Reviewer Notes:</p>
                            <p className="text-sm text-muted-foreground">{request.reviewer_notes}</p>
                          </div>
                        )}

                        {request.status === 'pending' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => setReviewDialog({ open: true, request })}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={processing}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleAction(request.id, 'reject')}
                              variant="destructive"
                              disabled={processing}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification Request</DialogTitle>
            <DialogDescription>
              Add optional notes about this approval (visible to the user)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., Verified based on portfolio and GitHub contributions"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (reviewDialog.request) {
                    handleAction(reviewDialog.request.id, 'approve', reviewNotes);
                  }
                }}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {processing ? 'Processing...' : 'Confirm Approval'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewDialog({ open: false, request: null });
                  setReviewNotes("");
                }}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;