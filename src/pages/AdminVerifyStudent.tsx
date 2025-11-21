import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StudentProfile } from "@/types/auth";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProfileById, approveProfile, rejectProfile as rejectProfileRequest } from "@/services/studentProfiles";
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

const AdminVerifyStudent = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      if (!id) return;

      try {
        setIsFetching(true);
        const found = await getProfileById(id);
        setProfile(found);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load profile";
        toast({ title: "Failed to load profile", description: message, variant: "destructive" });
        navigate("/admin/dashboard");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [id, user, navigate, isLoading, toast]);

  const handleApprove = async () => {
    if (!profile) return;

    try {
      setIsSubmitting(true);
      await approveProfile(profile.id);
      toast({
        title: "Student Approved",
        description: `${profile.name}'s profile has been approved.`,
      });
      navigate("/admin/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to approve profile";
      toast({ title: "Approval failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!profile || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await rejectProfileRequest(profile.id, rejectionReason.trim());
      toast({
        title: "Student Rejected",
        description: `${profile.name}'s profile has been rejected.`,
      });
      navigate("/admin/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reject profile";
      toast({ title: "Rejection failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderListCard = (
    title: string,
    items: Array<Record<string, string>>,
    renderItem: (item: Record<string, string>, index: number) => React.ReactNode
  ) => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-border p-4">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </Card>
  );

  if (isLoading || isFetching || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
          Loading student profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Student Profile Review</h1>
              <p className="text-muted-foreground">Review and verify student details</p>
            </div>
            <Badge className="bg-warning text-warning-foreground">
              Pending Review
            </Badge>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Personal Information</h2>

            {profile.profilePicture && (
              <div className="flex justify-center mb-8">
                <img
                  src={profile.profilePicture}
                  alt={profile.name}
                  className="w-28 h-28 rounded-full object-cover border border-border"
                />
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="text-lg font-semibold text-foreground">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">UID</p>
                  <p className="text-lg font-semibold text-foreground">{profile.uid}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-lg font-semibold text-foreground">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="text-lg font-semibold text-foreground">Year {profile.year}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="text-lg font-semibold text-foreground">{profile.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CGPA</p>
                  <p className="text-lg font-semibold text-foreground">{profile.cgpa}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted On</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(profile.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {profile.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {profile.certificates.length > 0 &&
                  renderListCard("Certificates", profile.certificates as Array<Record<string, string>>, (item) => (
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.category} · {item.year}</p>
                      <a
                        href={item.proofLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary underline"
                      >
                        Proof Link
                      </a>
                    </div>
                  ))}

                {profile.hackathons.length > 0 &&
                  renderListCard("Hackathons", profile.hackathons as Array<Record<string, string>>, (item) => (
                    <div>
                      <p className="font-semibold text-foreground">{item.eventName}</p>
                      <p className="text-sm text-muted-foreground">{item.position} · {item.year}</p>
                    </div>
                  ))}

                {profile.sports.length > 0 &&
                  renderListCard("Sports Achievements", profile.sports as Array<Record<string, string>>, (item) => (
                    <div>
                      <p className="font-semibold text-foreground">{item.sport}</p>
                      <p className="text-sm text-muted-foreground">{item.level} · {item.position}</p>
                    </div>
                  ))}

                {profile.internships.length > 0 &&
                  renderListCard("Internships", profile.internships as Array<Record<string, string>>, (item) => (
                    <div>
                      <p className="font-semibold text-foreground">{item.company}</p>
                      <p className="text-sm text-muted-foreground">{item.role} · {item.duration}</p>
                    </div>
                  ))}

                {profile.extracurricular.length > 0 &&
                  renderListCard("Extracurricular Activities", profile.extracurricular as Array<Record<string, string>>, (item) => (
                    <div>
                      <p className="font-semibold text-foreground">{item.activityName}</p>
                      <p className="text-sm text-muted-foreground">{item.year}</p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
              <Button onClick={handleApprove} className="flex-1 bg-success hover:bg-success/90" disabled={isSubmitting}>
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve Student
              </Button>
              <Button
                onClick={() => setShowRejectDialog(true)}
                variant="destructive"
                className="flex-1"
                disabled={isSubmitting}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Reject Student
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Student Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this student's profile. This will help them improve their submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Rejection Reason *</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              className="mt-2"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={isSubmitting}>
              Reject Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVerifyStudent;
