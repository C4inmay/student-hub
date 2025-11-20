import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { listProfiles } from "@/services/studentProfiles";
import { StudentProfile } from "@/types/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Users, Award, Briefcase } from "lucide-react";

const COLORS = [
  "hsl(211, 96%, 48%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(264, 83%, 62%)",
  "hsl(17, 88%, 62%)",
];

const Analytics = () => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const data = await listProfiles("approved");
        setProfiles(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load analytics";
        toast({ title: "Failed to load analytics", description: message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [toast]);

  const stats = useMemo(() => {
    if (profiles.length === 0) {
      return {
        totalStudents: 0,
        avgCGPA: "0.00",
        totalCertificates: 0,
        totalInternships: 0,
      };
    }

    const totalCertificates = profiles.reduce((sum, profile) => sum + profile.certificates.length, 0);
    const totalInternships = profiles.reduce((sum, profile) => sum + profile.internships.length, 0);
    const avgCGPA = (profiles.reduce((sum, profile) => sum + profile.cgpa, 0) / profiles.length).toFixed(2);

    return {
      totalStudents: profiles.length,
      avgCGPA,
      totalCertificates,
      totalInternships,
    };
  }, [profiles]);

  const cgpaRanges = useMemo(() => {
    const ranges = [
      { range: "9.0-10.0", count: 0 },
      { range: "8.0-8.9", count: 0 },
      { range: "7.0-7.9", count: 0 },
      { range: "6.0-6.9", count: 0 },
      { range: "< 6.0", count: 0 },
    ];

    profiles.forEach((profile) => {
      if (profile.cgpa >= 9.0) ranges[0].count += 1;
      else if (profile.cgpa >= 8.0) ranges[1].count += 1;
      else if (profile.cgpa >= 7.0) ranges[2].count += 1;
      else if (profile.cgpa >= 6.0) ranges[3].count += 1;
      else ranges[4].count += 1;
    });

    return ranges;
  }, [profiles]);

  const branchChartData = useMemo(() => {
    const branchTotals = profiles.reduce((acc, profile) => {
      acc[profile.branch] = (acc[profile.branch] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(branchTotals).map(([branch, count]) => ({
      name: branch,
      value: count,
    }));
  }, [profiles]);

  const yearData = useMemo(
    () =>
      [1, 2, 3, 4, 5].map((year) => ({
        year: `Year ${year}${year === 5 ? " (Grad)" : ""}`,
        students: profiles.filter((profile) => profile.year === year).length,
      })),
    [profiles]
  );

  const achievementsData = useMemo(() => {
    const totals = profiles.reduce(
      (acc, profile) => {
        acc.certificates += profile.certificates.length;
        acc.internships += profile.internships.length;
        acc.hackathons += profile.hackathons.length;
        acc.sports += profile.sports.length;
        return acc;
      },
      { certificates: 0, internships: 0, hackathons: 0, sports: 0 }
    );

    return [
      { category: "Certificates", count: totals.certificates },
      { category: "Internships", count: totals.internships },
      { category: "Hackathons", count: totals.hackathons },
      { category: "Sports", count: totals.sports },
    ];
  }, [profiles]);

  const hasData = profiles.length > 0;
  const showPlaceholder = !isLoading && !hasData;
  const totalCgpaEntries = useMemo(() => cgpaRanges.reduce((sum, item) => sum + item.count, 0), [cgpaRanges]);
  const branchHasData = branchChartData.some((entry) => entry.value > 0);
  const yearHasData = yearData.some((entry) => entry.students > 0);
  const achievementsTotal = useMemo(
    () => achievementsData.reduce((sum, item) => sum + item.count, 0),
    [achievementsData]
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Student Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into student performance and achievements</p>
        </div>

        {isLoading && (
          <Card className="p-6 mb-6 bg-card">
            <p className="text-muted-foreground">Loading analytics...</p>
          </Card>
        )}

        {showPlaceholder && (
          <Card className="p-6 mb-6 bg-card">
            <p className="text-muted-foreground">
              No approved profiles found yet. Approve student profiles to unlock analytics insights.
            </p>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? "…" : stats.totalStudents}
                </p>
              </div>
              <Users className="h-10 w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average CGPA</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? "…" : stats.avgCGPA}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-success" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Certificates</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? "…" : stats.totalCertificates}
                </p>
              </div>
              <Award className="h-10 w-10 text-warning" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Internships</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? "…" : stats.totalInternships}
                </p>
              </div>
              <Briefcase className="h-10 w-10 text-destructive" />
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CGPA Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">CGPA Distribution</h3>
            {totalCgpaEntries > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cgpaRanges}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No CGPA submissions yet.</p>
            )}
          </Card>

          {/* Branch Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Students by Branch</h3>
            {branchHasData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={branchChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {branchChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">Branch information will appear once profiles are approved.</p>
            )}
          </Card>

          {/* Year-wise Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Students by Year</h3>
            {yearHasData ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--success))", r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">Year-wise data unavailable until profiles span multiple batches.</p>
            )}
          </Card>

          {/* Achievements Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Achievements by Category</h3>
            {achievementsTotal > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={achievementsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--warning))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No achievements published yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
