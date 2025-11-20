import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentProfile } from "@/types/auth";
import { Eye, CheckCircle, XCircle, Users, Clock, Ban } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    loadProfiles();
  }, [user, navigate]);

  const loadProfiles = () => {
    const storedProfiles = localStorage.getItem("studentProfiles");
    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles));
    }
  };

  const pendingProfiles = profiles.filter(p => p.verificationStatus === "pending");
  const approvedProfiles = profiles.filter(p => p.verificationStatus === "approved");
  const rejectedProfiles = profiles.filter(p => p.verificationStatus === "rejected");

  const renderProfileTable = (profileList: StudentProfile[], showActions: boolean = true) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary border-b border-border">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">UID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Branch</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CGPA</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Submitted</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {profileList.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                No profiles found
              </td>
            </tr>
          ) : (
            profileList.map((profile) => (
              <tr key={profile.id} className="hover:bg-accent/50">
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">{profile.name}</div>
                  <div className="text-sm text-muted-foreground">{profile.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-foreground">{profile.uid}</td>
                <td className="px-6 py-4 text-sm text-foreground">{profile.branch}</td>
                <td className="px-6 py-4 text-sm text-foreground">{profile.cgpa}</td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {new Date(profile.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/verify/${profile.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage student verifications and approvals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Verifications</p>
                  <p className="text-3xl font-bold text-warning">{pendingProfiles.length}</p>
                </div>
                <div className="bg-warning/10 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Approved Students</p>
                  <p className="text-3xl font-bold text-success">{approvedProfiles.length}</p>
                </div>
                <div className="bg-success/10 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rejected Requests</p>
                  <p className="text-3xl font-bold text-destructive">{rejectedProfiles.length}</p>
                </div>
                <div className="bg-destructive/10 p-3 rounded-full">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <Tabs defaultValue="pending" className="w-full">
              <div className="border-b border-border px-6">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="pending" className="relative">
                    Pending Verifications
                    {pendingProfiles.length > 0 && (
                      <Badge className="ml-2 bg-warning text-warning-foreground">
                        {pendingProfiles.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approved">Approved Students</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected Requests</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="pending" className="m-0">
                {renderProfileTable(pendingProfiles)}
              </TabsContent>

              <TabsContent value="approved" className="m-0">
                {renderProfileTable(approvedProfiles, false)}
              </TabsContent>

              <TabsContent value="rejected" className="m-0">
                {renderProfileTable(rejectedProfiles, false)}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
