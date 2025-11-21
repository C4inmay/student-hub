import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StudentProfile } from "@/types/auth";
import { getProfileById } from "@/services/studentProfiles";
import { adminUpdateStudent, adminDeleteStudent } from "@/services/adminStudents";
import { uploadProfileImage } from "@/services/storage";
import { PlusCircle, Trash2 } from "lucide-react";
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

const AdminManageStudent = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    uid: "",
    email: "",
    year: "",
    branch: "",
    cgpa: "",
    skills: "",
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string>("");

  const [certificates, setCertificates] = useState<Array<StudentProfile["certificates"][number]>>([]);
  const [hackathons, setHackathons] = useState<Array<StudentProfile["hackathons"][number]>>([]);
  const [sports, setSports] = useState<Array<StudentProfile["sports"][number]>>([]);
  const [internships, setInternships] = useState<Array<StudentProfile["internships"][number]>>([]);
  const [extracurriculars, setExtracurriculars] = useState<Array<StudentProfile["extracurricular"][number]>>([]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      if (!id) return;
      try {
        setIsFetching(true);
        const remoteProfile = await getProfileById(id);
        setProfile(remoteProfile);
        setFormData({
          name: remoteProfile.name,
          uid: remoteProfile.uid,
          email: remoteProfile.email,
          year: remoteProfile.year.toString(),
          branch: remoteProfile.branch,
          cgpa: remoteProfile.cgpa.toString(),
          skills: remoteProfile.skills.join(", "),
        });
        setCurrentProfilePicture(remoteProfile.profilePicture ?? "");
        setCertificates(remoteProfile.certificates ?? []);
        setHackathons(remoteProfile.hackathons ?? []);
        setSports(remoteProfile.sports ?? []);
        setInternships(remoteProfile.internships ?? []);
        setExtracurriculars(remoteProfile.extracurricular ?? []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load student";
        toast({ title: "Failed to load student", description: message, variant: "destructive" });
        navigate("/admin/dashboard");
      } finally {
        setIsFetching(false);
      }
    };

    loadProfile();
  }, [id, user, isLoading, navigate, toast]);

  useEffect(() => () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  }, [imagePreview]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfileImageFile(null);
      setImagePreview(null);
      return;
    }
    setProfileImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addEntry = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, template: T) =>
    setter((prev) => [...prev, template]);

  const updateEntry = <T extends Record<string, string>>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    field: keyof T,
    value: string
  ) => setter((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));

  const removeEntry = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) =>
    setter((prev) => prev.filter((_, idx) => idx !== index));

  const renderSection = <T extends Record<string, string>>({
    title,
    description,
    items,
    setter,
    fields,
    emptyLabel,
    template,
  }: {
    title: string;
    description: string;
    items: T[];
    setter: React.Dispatch<React.SetStateAction<T[]>>;
    fields: Array<{ name: keyof T; label: string; placeholder?: string }>;
    emptyLabel: string;
    template: T;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => addEntry(setter, template)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={index} className="p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {fields.map(({ name, label, placeholder }) => (
                  <div className="space-y-2" key={`${String(name)}-${index}`}>
                    <Label>{label}</Label>
                    <Input
                      value={item[name]}
                      onChange={(e) => updateEntry(setter, index, name, e.target.value)}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive gap-2"
                  onClick={() => removeEntry(setter, index)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const trimmedUid = formData.uid.trim();
    if (!trimmedUid) {
      toast({ title: "UID required", description: "UID cannot be empty.", variant: "destructive" });
      return;
    }

    const cleanCertificates = certificates.filter((certificate) =>
      certificate.title.trim() && certificate.category.trim() && certificate.year.trim() && certificate.proofLink.trim()
    );
    const cleanHackathons = hackathons.filter((hackathon) =>
      hackathon.eventName.trim() && hackathon.position.trim() && hackathon.year.trim()
    );
    const cleanSports = sports.filter((sport) => sport.sport.trim() && sport.level.trim() && sport.position.trim());
    const cleanInternships = internships.filter((internship) =>
      internship.company.trim() && internship.role.trim() && internship.duration.trim()
    );
    const cleanExtracurriculars = extracurriculars.filter((activity) => activity.activityName.trim() && activity.year.trim());

    let profilePictureUrl = currentProfilePicture || undefined;

    if (profileImageFile) {
      try {
        const { publicUrl } = await uploadProfileImage(profileImageFile, trimmedUid);
        profilePictureUrl = publicUrl;
        setCurrentProfilePicture(publicUrl);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to upload profile image";
        toast({ title: "Upload failed", description: message, variant: "destructive" });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const updatedProfile = await adminUpdateStudent(profile.id, {
        profile: {
          name: formData.name.trim(),
          uid: trimmedUid,
          email: formData.email.trim(),
          year: parseInt(formData.year, 10),
          branch: formData.branch.trim(),
          cgpa: parseFloat(formData.cgpa),
          skills: formData.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
          profilePicture: profilePictureUrl,
        },
        achievements: {
          certificates: cleanCertificates,
          hackathons: cleanHackathons,
          sports: cleanSports,
          internships: cleanInternships,
          extracurricular: cleanExtracurriculars,
        },
      });

      setProfile(updatedProfile);
      setProfileImageFile(null);
      setImagePreview(null);

      toast({ title: "Student Updated", description: "Changes saved successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update student";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    try {
      setIsDeleting(true);
      await adminDeleteStudent(profile.id);
      toast({ title: "Student Deleted", description: "The student and related data were removed." });
      navigate("/admin/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete student";
      toast({ title: "Deletion failed", description: message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading || isFetching || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
          Loading student...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Manage Student</h1>
              <p className="text-muted-foreground">Edit approved student details or remove their record entirely.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>Back</Button>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uid">UID *</Label>
                  <Input id="uid" name="uid" value={formData.uid} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input id="year" name="year" type="number" min="1" max="4" value={formData.year} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch *</Label>
                  <Input id="branch" name="branch" value={formData.branch} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA *</Label>
                  <Input
                    id="cgpa"
                    name="cgpa"
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={formData.cgpa}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileImageFile">Profile Picture</Label>
                  <Input id="profileImageFile" type="file" accept="image/*" onChange={handleProfileImageChange} />
                  <p className="text-xs text-muted-foreground">Upload to replace the current image stored in Supabase, or leave empty to keep it.</p>
                  {(imagePreview || currentProfilePicture) && (
                    <img
                      src={imagePreview || currentProfilePicture}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border border-border"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated) *</Label>
                <Textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., React, Python, Machine Learning"
                  required
                />
              </div>

              <div className="space-y-10">
                {renderSection({
                  title: "Certificates",
                  description: "Curate the student's verified certificates",
                  items: certificates,
                  setter: setCertificates,
                  emptyLabel: "No certificates recorded.",
                  template: { title: "", category: "", year: "", proofLink: "" },
                  fields: [
                    { name: "title", label: "Title", placeholder: "AWS Architect" },
                    { name: "category", label: "Category", placeholder: "Cloud" },
                    { name: "year", label: "Year", placeholder: "2024" },
                    { name: "proofLink", label: "Proof Link", placeholder: "https://..." },
                  ],
                })}

                {renderSection({
                  title: "Hackathons",
                  description: "Maintain hackathon outcomes",
                  items: hackathons,
                  setter: setHackathons,
                  emptyLabel: "No hackathons recorded.",
                  template: { eventName: "", position: "", year: "" },
                  fields: [
                    { name: "eventName", label: "Event Name", placeholder: "Smart India Hackathon" },
                    { name: "position", label: "Position", placeholder: "Winner" },
                    { name: "year", label: "Year", placeholder: "2024" },
                  ],
                })}

                {renderSection({
                  title: "Sports Achievements",
                  description: "Track sports accolades",
                  items: sports,
                  setter: setSports,
                  emptyLabel: "No sports achievements recorded.",
                  template: { sport: "", level: "", position: "" },
                  fields: [
                    { name: "sport", label: "Sport", placeholder: "Basketball" },
                    { name: "level", label: "Level", placeholder: "State" },
                    { name: "position", label: "Position", placeholder: "Gold" },
                  ],
                })}

                {renderSection({
                  title: "Internships",
                  description: "Document internship experience",
                  items: internships,
                  setter: setInternships,
                  emptyLabel: "No internships recorded.",
                  template: { company: "", role: "", duration: "" },
                  fields: [
                    { name: "company", label: "Company", placeholder: "OpenAI" },
                    { name: "role", label: "Role", placeholder: "Research Intern" },
                    { name: "duration", label: "Duration", placeholder: "May 2024 - Aug 2024" },
                  ],
                })}

                {renderSection({
                  title: "Extracurricular Activities",
                  description: "Highlight leadership roles",
                  items: extracurriculars,
                  setter: setExtracurriculars,
                  emptyLabel: "No extracurricular activities recorded.",
                  template: { activityName: "", year: "" },
                  fields: [
                    { name: "activityName", label: "Activity", placeholder: "Coding Club Lead" },
                    { name: "year", label: "Year", placeholder: "2024" },
                  ],
                })}
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  Delete Student
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This action removes the student, their achievements, and their profile picture from storage. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminManageStudent;
