import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentProfile } from "@/types/auth";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { listProfiles, listPendingProfiles } from "@/services/studentProfiles";
import { listEvents } from "@/services/events";
import { countRegistrations } from "@/services/registrations";
import { countAttendanceRecords } from "@/services/attendance";
import { countCertificates } from "@/services/certificates";
import { listLogs } from "@/services/logs";
import { LogEntry } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    events: 0,
    registrations: 0,
    attendance: 0,
    certificates: 0,
    pending: 0,
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        setIsFetching(true);
        const [allProfiles, eventsData, registrationsTotal, attendanceTotal, certificatesTotal, logsData, pendingProfiles] =
          await Promise.all([
            listProfiles(),
            listEvents(),
            countRegistrations(),
            countAttendanceRecords(),
            countCertificates(),
            listLogs(5),
            listPendingProfiles(),
          ]);

        setProfiles(allProfiles);
        setRecentLogs(logsData);
        setStats({
          events: eventsData.length,
          registrations: registrationsTotal,
          attendance: attendanceTotal,
          certificates: certificatesTotal,
          pending: pendingProfiles.length,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load profiles";
        toast({ title: "Failed to load profiles", description: message, variant: "destructive" });
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [user, navigate, isLoading, toast]);

  const pendingProfiles = profiles.filter(p => p.verificationStatus === "pending");
  const approvedProfiles = profiles.filter(p => p.verificationStatus === "approved");
  const rejectedProfiles = profiles.filter(p => p.verificationStatus === "rejected");

  const renderProfileTable = (
    profileList: StudentProfile[],
    options?: { canReview?: boolean }
  ) => (
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
                  <div className="flex flex-wrap gap-2">
                    {options?.canReview && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/verify/${profile.id}`)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/admin/students/${profile.id}/edit`)}
                    >
                      Manage
                    </Button>
                    {!options?.canReview && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {profile.verificationStatus}
                      </Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
          Loading admin data...
        </div>
      </div>
    );
  }

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
                  <p className="text-3xl font-bold text-warning">{stats.pending}</p>
                </div>
                <div className="bg-warning/10 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                  <p className="text-3xl font-bold text-success">{stats.events}</p>
                </div>
                <div className="bg-success/10 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Registrations</p>
                  <p className="text-3xl font-bold text-destructive">{stats.registrations}</p>
                </div>
                <div className="bg-destructive/10 p-3 rounded-full">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Attendance Records</p>
              <p className="text-3xl font-bold text-primary">{stats.attendance}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Certificates Issued</p>
              <p className="text-3xl font-bold text-primary">{stats.certificates}</p>
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
                {renderProfileTable(pendingProfiles, { canReview: true })}
              </TabsContent>

              <TabsContent value="approved" className="m-0">
                {renderProfileTable(approvedProfiles, { canReview: false })}
              </TabsContent>

              <TabsContent value="rejected" className="m-0">
                {renderProfileTable(rejectedProfiles, { canReview: false })}
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Admin Activity</h2>
              <span className="text-sm text-muted-foreground">Last {recentLogs.length} actions</span>
            </div>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No admin activity recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentLogs.map((log) => (
                  <li key={log.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{log.id}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
