import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Trophy, Award, Code, Briefcase, Medal } from "lucide-react";
import { StudentProfile } from "@/types/auth";
import { listProfiles } from "@/services/studentProfiles";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_CRITERIA_TYPES,
  DEFAULT_RANKING_WEIGHTS,
  RankingAlgorithm,
  buildCandidatesFromProfiles,
  buildPairwiseMatrixFromWeights,
  runAlgorithm,
} from "@/lib/rankingMethods";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RankingType = "academic" | "sports" | "hackathon" | "internship" | "overall";

const CRITERIA_ORDER = Object.keys(DEFAULT_RANKING_WEIGHTS);
const DEFAULT_PAIRWISE_MATRIX = buildPairwiseMatrixFromWeights(CRITERIA_ORDER, DEFAULT_RANKING_WEIGHTS);

const Rankings = () => {
  const [activeTab, setActiveTab] = useState<RankingType>("overall");
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState<RankingAlgorithm>("TOPSIS");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        const approved = await listProfiles("approved");
        setProfiles(approved);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load rankings";
        toast({ title: "Failed to load rankings", description: message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [toast]);

  const candidates = useMemo(() => buildCandidatesFromProfiles(profiles), [profiles]);

  const { rankingResult, rankingError } = useMemo(() => {
    if (!candidates.length) {
      return { rankingResult: null, rankingError: null } as const;
    }

    try {
      const result = runAlgorithm(algorithm, candidates, DEFAULT_RANKING_WEIGHTS, {
        criteriaTypes: DEFAULT_CRITERIA_TYPES,
        criteriaOrder: CRITERIA_ORDER,
        pairwiseMatrix: algorithm === "AHP" ? DEFAULT_PAIRWISE_MATRIX : undefined,
      });
      return { rankingResult: result, rankingError: null } as const;
    } catch (error) {
      return { rankingResult: null, rankingError: error as Error } as const;
    }
  }, [algorithm, candidates]);

  useEffect(() => {
    if (rankingError) {
      toast({
        title: "Ranking calculation failed",
        description: rankingError.message,
        variant: "destructive",
      });
    }
  }, [rankingError, toast]);

  const profileMap = useMemo(() => new Map(profiles.map(profile => [profile.id, profile])), [profiles]);

  const overallRanking = useMemo(() => {
    if (!rankingResult) return [] as StudentProfile[];
    return rankingResult.results
      .map(entry => profileMap.get(entry.id))
      .filter((profile): profile is StudentProfile => Boolean(profile));
  }, [rankingResult, profileMap]);

  const rankingData = useMemo(() => {
    const byType: Record<RankingType, StudentProfile[]> = {
      overall: [],
      academic: [],
      sports: [],
      hackathon: [],
      internship: [],
    };

    const base = [...profiles];

    byType.academic = [...base].sort((a, b) => b.cgpa - a.cgpa);
    byType.sports = [...base]
      .filter(profile => profile.sports.length > 0)
      .sort((a, b) => b.sports.length - a.sports.length);
    byType.hackathon = [...base]
      .filter(profile => profile.hackathons.length > 0)
      .sort((a, b) => b.hackathons.length - a.hackathons.length);
    byType.internship = [...base]
      .filter(profile => profile.internships.length > 0)
      .sort((a, b) => b.internships.length - a.internships.length);

    byType.overall = overallRanking.length ? overallRanking : [...base].sort((a, b) => b.cgpa - a.cgpa);

    return byType;
  }, [profiles, overallRanking]);

  const getRankingIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-primary" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-accent-foreground" />;
    if (rank === 3) return <Award className="h-5 w-5 text-muted-foreground" />;
    return null;
  };

  const renderRankingTable = (type: RankingType) => {
    const students = rankingData[type];

    return (
      <Card className="overflow-hidden bg-card">
        {students.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No rankings available yet.
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Branch</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Year</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CGPA</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Key Achievements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student, index) => {
                const rank = index + 1;
                const achievements = [];
                if (student.certificates.length > 0) achievements.push(`${student.certificates.length} Certs`);
                if (student.internships.length > 0) achievements.push(`${student.internships.length} Internships`);
                if (student.hackathons.length > 0) achievements.push(`${student.hackathons.length} Hackathons`);
                if (type === "overall" && rankingResult) {
                  const score = rankingResult.results.find(result => result.id === student.id)?.score;
                  if (score !== undefined) {
                    achievements.unshift(`Score: ${score.toFixed(3)}`);
                  }
                }

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/student/${student.uid}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          rank === 1 ? "text-primary" :
                          rank === 2 ? "text-accent-foreground" :
                          rank === 3 ? "text-muted-foreground" :
                          "text-foreground"
                        }`}>
                          #{rank}
                        </span>
                        {getRankingIcon(rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.uid}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{student.branch}</td>
                    <td className="px-6 py-4 text-sm text-foreground">Year {student.year}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-semibold">
                        {student.cgpa}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {achievements.map((achievement, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Rankings</h1>
          <p className="text-muted-foreground">View rankings across different categories</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Label className="text-sm text-muted-foreground">Ranking algorithm</Label>
            <Select value={algorithm} onValueChange={(value) => setAlgorithm(value as RankingAlgorithm)}>
              <SelectTrigger className="mt-2 w-full md:w-64">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TOPSIS">TOPSIS (balanced)</SelectItem>
                <SelectItem value="WSM">Weighted Sum Model</SelectItem>
                <SelectItem value="SAW">Simple Additive Weighting</SelectItem>
                <SelectItem value="AHP">Analytic Hierarchy Process</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {rankingResult && (
            <Card className="p-4 text-sm">
              <p className="text-muted-foreground">Currently using {rankingResult.method} with {profiles.length} students.</p>
              <p className="text-muted-foreground">
                Top score: {rankingResult.results[0]?.score.toFixed(3) ?? "0.000"}
              </p>
            </Card>
          )}
        </div>

        {isLoading ? (
          <Card className="p-12 text-center bg-card">
            <p className="text-muted-foreground">Loading rankings...</p>
          </Card>
        ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RankingType)} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overall" className="gap-2">
              <Medal className="h-4 w-4" />
              Overall
            </TabsTrigger>
            <TabsTrigger value="academic" className="gap-2">
              <Award className="h-4 w-4" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="sports" className="gap-2">
              <Trophy className="h-4 w-4" />
              Sports
            </TabsTrigger>
            <TabsTrigger value="hackathon" className="gap-2">
              <Code className="h-4 w-4" />
              Hackathon
            </TabsTrigger>
            <TabsTrigger value="internship" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Internship
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overall">
            {renderRankingTable("overall")}
          </TabsContent>

          <TabsContent value="academic">
            {renderRankingTable("academic")}
          </TabsContent>

          <TabsContent value="sports">
            {renderRankingTable("sports")}
          </TabsContent>

          <TabsContent value="hackathon">
            {renderRankingTable("hackathon")}
          </TabsContent>

          <TabsContent value="internship">
            {renderRankingTable("internship")}
          </TabsContent>
        </Tabs>
        )}
      </main>
    </div>
  );
};

export default Rankings;
