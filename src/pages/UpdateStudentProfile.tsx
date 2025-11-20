import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StudentProfile } from "@/types/auth";
import { getProfileByUserId, updateProfile } from "@/services/studentProfiles";
import { syncProfileAchievements } from "@/services/profileAchievements";
import { uploadProfileImage, deleteProfileImage } from "@/services/storage";
import { PlusCircle, Trash2 } from "lucide-react";

const UpdateStudentProfile = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    uid: "",
    email: "",
    year: "",
    branch: "",
    major: "",
    cgpa: "",
    skills: "",
    profilePicture: "",
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Array<StudentProfile["certificates"][number]>>([]);
  const [hackathons, setHackathons] = useState<Array<StudentProfile["hackathons"][number]>>([]);
  const [sports, setSports] = useState<Array<StudentProfile["sports"][number]>>([]);
  const [internships, setInternships] = useState<Array<StudentProfile["internships"][number]>>([]);
  const [extracurriculars, setExtracurriculars] = useState<Array<StudentProfile["extracurricular"][number]>>([]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user || user.role !== "student") {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        setIsFetching(true);
        const remoteProfile = await getProfileByUserId(user.id);
        if (!remoteProfile) {
          toast({
            title: "Profile not found",
            description: "Create a profile before trying to update it.",
            variant: "destructive",
          });
          navigate("/student/create-profile");
          return;
        }

        setProfile(remoteProfile);
        setFormData({
          name: remoteProfile.name,
          uid: remoteProfile.uid,
          email: remoteProfile.email,
          year: remoteProfile.year.toString(),
          branch: remoteProfile.branch,
          major: remoteProfile.major,
          cgpa: remoteProfile.cgpa.toString(),
          skills: remoteProfile.skills.join(", "),
          profilePicture: remoteProfile.profilePicture ?? "",
        });
        setCertificates(remoteProfile.certificates ?? []);
        setHackathons(remoteProfile.hackathons ?? []);
        setSports(remoteProfile.sports ?? []);
        setInternships(remoteProfile.internships ?? []);
        setExtracurriculars(remoteProfile.extracurricular ?? []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load profile";
        toast({ title: "Failed to load profile", description: message, variant: "destructive" });
        navigate("/student/dashboard");
      } finally {
        setIsFetching(false);
      }
    };

    loadProfile();
  }, [user, navigate, isLoading, toast]);

  useEffect(() => () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  }, [imagePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) return;

    try {
      setIsSubmitting(true);
      const cleanCertificates = certificates.filter((certificate) =>
        certificate.title.trim() && certificate.category.trim() && certificate.year.trim() && certificate.proofLink.trim()
      );
      const cleanHackathons = hackathons.filter((hackathon) =>
        hackathon.eventName.trim() && hackathon.position.trim() && hackathon.year.trim()
      );
      const cleanSports = sports.filter((sport) =>
        sport.sport.trim() && sport.level.trim() && sport.position.trim()
      );
      const cleanInternships = internships.filter((internship) =>
        internship.company.trim() && internship.role.trim() && internship.duration.trim()
      );
      const cleanExtracurriculars = extracurriculars.filter((activity) =>
        activity.activityName.trim() && activity.year.trim()
      );

      const trimmedUid = formData.uid.trim();
      let profilePictureUrl = formData.profilePicture.trim() || undefined;

      if (profileImageFile) {
        try {
          const { publicUrl } = await uploadProfileImage(profileImageFile, trimmedUid);
          if (profile.profilePicture && profile.profilePicture !== publicUrl && trimmedUid !== profile.uid) {
            await deleteProfileImage(profile.profilePicture).catch(() => undefined);
          }
          profilePictureUrl = publicUrl;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to upload profile image";
          toast({ title: "Upload failed", description: message, variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
      }

      const updated = await updateProfile(profile.id, {
        name: formData.name.trim(),
        uid: trimmedUid,
        email: formData.email.trim(),
        year: parseInt(formData.year, 10),
        branch: formData.branch.trim(),
        major: formData.major.trim(),
        cgpa: parseFloat(formData.cgpa),
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        profilePicture: profilePictureUrl,
        verificationStatus: "pending",
        submittedAt: new Date().toISOString(),
        rejectionReason: undefined,
      });
      await syncProfileAchievements(profile.id, user.id, {
        certificates: cleanCertificates,
        hackathons: cleanHackathons,
        sports: cleanSports,
        internships: cleanInternships,
        extracurricular: cleanExtracurriculars,
      });
      setProfile({
        ...updated,
        profilePicture: profilePictureUrl,
        certificates: cleanCertificates,
        hackathons: cleanHackathons,
        sports: cleanSports,
        internships: cleanInternships,
        extracurricular: cleanExtracurriculars,
      } as StudentProfile);
      setFormData((prev) => ({ ...prev, profilePicture: profilePictureUrl ?? "" }));
      setProfileImageFile(null);
      setImagePreview(null);
      toast({
        title: "Profile Updated",
        description: "Your profile has been resubmitted for admin review.",
      });
      navigate("/student/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update profile";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const addEntry = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, template: T) =>
    setter((prev) => [...prev, template]);

  const updateEntry = <T extends Record<string, string>>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    field: keyof T,
    value: string
  ) =>
    setter((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));

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

  if (isLoading || isFetching || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Update Your Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uid">UID *</Label>
                  <Input
                    id="uid"
                    name="uid"
                    value={formData.uid}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="1"
                    max="4"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch *</Label>
                  <Input
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Major *</Label>
                  <Input
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA *</Label>
                  <Input
                    id="cgpa"
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileImageFile">Profile Picture</Label>
                  <Input id="profileImageFile" type="file" accept="image/*" onChange={handleProfileImageChange} />
                  <p className="text-xs text-muted-foreground">
                    Uploading a new image replaces the previous one stored in Supabase.
                  </p>
                  {(imagePreview || formData.profilePicture) && (
                    <img
                      src={imagePreview || formData.profilePicture}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border border-border"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture URL (optional)</Label>
                <Input
                  id="profilePicture"
                  name="profilePicture"
                  value={formData.profilePicture}
                  onChange={handleChange}
                  placeholder="https://..."
                />
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
                  description: "Add certifications with proof links for verification",
                  items: certificates,
                  setter: setCertificates,
                  emptyLabel: "No certificates added yet.",
                  template: { title: "", category: "", year: "", proofLink: "" },
                  fields: [
                    { name: "title", label: "Certificate Title", placeholder: "AWS Cloud Practitioner" },
                    { name: "category", label: "Category", placeholder: "Cloud" },
                    { name: "year", label: "Year", placeholder: "2024" },
                    { name: "proofLink", label: "Proof Link", placeholder: "https://..." },
                  ],
                })}

                {renderSection({
                  title: "Hackathons",
                  description: "Showcase hackathon achievements",
                  items: hackathons,
                  setter: setHackathons,
                  emptyLabel: "No hackathons added yet.",
                  template: { eventName: "", position: "", year: "" },
                  fields: [
                    { name: "eventName", label: "Event Name", placeholder: "Smart India Hackathon" },
                    { name: "position", label: "Position", placeholder: "Winner" },
                    { name: "year", label: "Year", placeholder: "2024" },
                  ],
                })}

                {renderSection({
                  title: "Sports Achievements",
                  description: "List sports achievements and levels",
                  items: sports,
                  setter: setSports,
                  emptyLabel: "No sports achievements added yet.",
                  template: { sport: "", level: "", position: "" },
                  fields: [
                    { name: "sport", label: "Sport", placeholder: "Basketball" },
                    { name: "level", label: "Level", placeholder: "State" },
                    { name: "position", label: "Position", placeholder: "Gold" },
                  ],
                })}

                {renderSection({
                  title: "Internships",
                  description: "Detail your internship experience",
                  items: internships,
                  setter: setInternships,
                  emptyLabel: "No internships added yet.",
                  template: { company: "", role: "", duration: "" },
                  fields: [
                    { name: "company", label: "Company", placeholder: "OpenAI" },
                    { name: "role", label: "Role", placeholder: "Research Intern" },
                    { name: "duration", label: "Duration", placeholder: "May 2024 - Aug 2024" },
                  ],
                })}

                {renderSection({
                  title: "Extracurricular Activities",
                  description: "Highlight leadership and club activities",
                  items: extracurriculars,
                  setter: setExtracurriculars,
                  emptyLabel: "No extracurricular activities added yet.",
                  template: { activityName: "", year: "" },
                  fields: [
                    { name: "activityName", label: "Activity Name", placeholder: "Music Club President" },
                    { name: "year", label: "Year", placeholder: "2023" },
                  ],
                })}
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <p className="text-sm text-warning">
                  Your updated profile will be sent to admin for re-verification.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Update & Submit for Review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/student/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UpdateStudentProfile;
