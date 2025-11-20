import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { mockStudents } from "@/data/mockStudents";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { TrendingUp, Users, Award, Briefcase } from "lucide-react";

const Analytics = () => {
  // CGPA Distribution
  const cgpaRanges = [
    { range: "9.0-10.0", count: 0 },
    { range: "8.0-8.9", count: 0 },
    { range: "7.0-7.9", count: 0 },
    { range: "6.0-6.9", count: 0 },
    { range: "< 6.0", count: 0 },
  ];

  mockStudents.forEach(student => {
    if (student.cgpa >= 9.0) cgpaRanges[0].count++;
    else if (student.cgpa >= 8.0) cgpaRanges[1].count++;
    else if (student.cgpa >= 7.0) cgpaRanges[2].count++;
    else if (student.cgpa >= 6.0) cgpaRanges[3].count++;
    else cgpaRanges[4].count++;
  });

  // Branch Distribution
  const branchData = mockStudents.reduce((acc, student) => {
    acc[student.branch] = (acc[student.branch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const branchChartData = Object.entries(branchData).map(([branch, count]) => ({
    name: branch,
    value: count,
  }));

  // Year-wise Distribution
  const yearData = [1, 2, 3, 4, 5].map(year => ({
    year: `Year ${year}${year === 5 ? ' (Grad)' : ''}`,
    students: mockStudents.filter(s => s.year === year).length,
  }));

  // Achievements Distribution
  const achievementsData = [
    {
      category: "Certificates",
      count: mockStudents.reduce((sum, s) => sum + s.certificates.length, 0),
    },
    {
      category: "Internships",
      count: mockStudents.reduce((sum, s) => sum + s.internships.length, 0),
    },
    {
      category: "Hackathons",
      count: mockStudents.reduce((sum, s) => sum + s.hackathons.length, 0),
    },
    {
      category: "Sports",
      count: mockStudents.reduce((sum, s) => sum + s.sports.length, 0),
    },
  ];

  const COLORS = ['hsl(211, 96%, 48%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Student Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into student performance and achievements</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{mockStudents.length}</p>
              </div>
              <Users className="h-10 w-10 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average CGPA</p>
                <p className="text-3xl font-bold text-foreground">
                  {(mockStudents.reduce((sum, s) => sum + s.cgpa, 0) / mockStudents.length).toFixed(2)}
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
                  {mockStudents.reduce((sum, s) => sum + s.certificates.length, 0)}
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
                  {mockStudents.reduce((sum, s) => sum + s.internships.length, 0)}
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cgpaRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Branch Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Students by Branch</h3>
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
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Year-wise Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Students by Year</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--success))', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Achievements Distribution */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Achievements by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={achievementsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--warning))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
