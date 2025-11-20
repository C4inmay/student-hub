import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";
import { listStudents } from "@/services/students";
import { Student } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

const StudentDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const data = await listStudents();
        setStudents(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load students";
        toast({ title: "Failed to load students", description: message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [toast]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Directory</h1>
          <p className="text-muted-foreground">Browse and search all registered students</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, UID, email, or branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <Card className="p-12 text-center bg-card">
            <p className="text-muted-foreground">Loading students...</p>
          </Card>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="p-6 hover:shadow-lg transition-shadow bg-card">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-accent-foreground" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-1">{student.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{student.email}</p>
                
                <div className="space-y-2 w-full mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">UID:</span>
                    <Badge variant="secondary" className="font-semibold">{student.uid}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Year:</span>
                    <span className="text-sm font-medium text-foreground">Year {student.year}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Branch:</span>
                    <span className="text-sm font-medium text-foreground">{student.branch}</span>
                  </div>
                </div>

                {student.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4 justify-center">
                    {student.skills.slice(0, 4).map((skill, index) => (
                      <Badge key={`${student.id}-${skill}-${index}`} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {student.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{student.skills.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                <Button 
                  onClick={() => navigate(`/student/${student.uid}`)}
                  className="w-full"
                >
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
        )}

        {!isLoading && filteredStudents.length === 0 && (
          <Card className="p-12 text-center bg-card">
            <p className="text-muted-foreground">No students found matching your search.</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default StudentDirectory;
