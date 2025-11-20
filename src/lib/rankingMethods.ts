import { StudentProfile } from "@/types/auth";

export type RankingAlgorithm = "TOPSIS" | "WSM" | "SAW" | "AHP";

export type CriteriaWeights = Record<string, number>;

export type CriteriaTypes = Record<string, "benefit" | "cost">;

export interface RankingCandidate {
  id: string;
  label: string;
  metrics: Record<string, number>;
  meta?: Record<string, unknown>;
}

export interface RankingBreakdown {
  normalized: Record<string, number>;
  weighted?: Record<string, number>;
  weightedContributions?: Record<string, number>;
  idealBestDistance?: number;
  idealWorstDistance?: number;
}

export interface RankingResultEntry {
  id: string;
  label: string;
  score: number;
  rank: number;
  breakdown: RankingBreakdown;
  meta?: Record<string, unknown>;
}

export interface RankingResult {
  method: RankingAlgorithm;
  results: RankingResultEntry[];
}

const ensureData = (candidates: RankingCandidate[]) => {
  if (!candidates.length) {
    throw new Error("No candidates available for ranking.");
  }
};

const ensureCriteria = (candidate: RankingCandidate, weights: CriteriaWeights) => {
  const columns = Object.keys(candidate.metrics).filter(column => column in weights);
  if (!columns.length) {
    throw new Error("Weights do not overlap with candidate metrics.");
  }
  return columns;
};

const normalizeWeights = (weights: CriteriaWeights, criteria: string[]) => {
  const total = criteria.reduce((sum, key) => sum + Math.abs(weights[key] ?? 0), 0);
  if (!total) {
    throw new Error("At least one weight must be non-zero.");
  }
  const normalized: CriteriaWeights = {};
  criteria.forEach(key => {
    normalized[key] = (weights[key] ?? 0) / total;
  });
  return normalized;
};

const buildMatrix = (candidates: RankingCandidate[], criteria: string[]) =>
  candidates.map(candidate => criteria.map(column => Number(candidate.metrics[column] ?? 0)));

const transpose = (matrix: number[][]) => (matrix.length ? matrix[0].map((_, colIdx) => matrix.map(row => row[colIdx])) : []);

const vectorNormalize = (matrix: number[][]) => {
  const transposed = transpose(matrix);
  const denominators = transposed.map(column => {
    const sumSquares = column.reduce((sum, value) => sum + value ** 2, 0);
    return sumSquares === 0 ? 1 : Math.sqrt(sumSquares);
  });
  return matrix.map(row => row.map((value, idx) => (denominators[idx] ? value / denominators[idx] : 0)));
};

const minMaxNormalize = (matrix: number[][], benefitFlags: boolean[]) => {
  const transposed = transpose(matrix);
  const normalized: number[][] = matrix.map(() => [] as number[]);
  transposed.forEach((column, idx) => {
    const minVal = Math.min(...column);
    const maxVal = Math.max(...column);
    const span = maxVal - minVal || 1;
    column.forEach((value, rowIdx) => {
      if (benefitFlags[idx]) {
        normalized[rowIdx][idx] = (value - minVal) / span;
      } else {
        normalized[rowIdx][idx] = (maxVal - value) / span;
      }
    });
  });
  return normalized;
};

const rankResults = (
  method: RankingAlgorithm,
  scores: number[],
  candidates: RankingCandidate[],
  breakdowns: RankingBreakdown[],
): RankingResult => {
  const ordered = scores
    .map((score, idx) => ({ score, idx }))
    .sort((a, b) => b.score - a.score);

  const results: RankingResultEntry[] = ordered.map((entry, rankIdx) => {
    const candidate = candidates[entry.idx];
    return {
      id: candidate.id,
      label: candidate.label,
      score: Number(entry.score.toFixed(6)),
      rank: rankIdx + 1,
      breakdown: breakdowns[entry.idx],
      meta: candidate.meta,
    };
  });

  return { method, results };
};

export const calculateTopsis = (
  candidates: RankingCandidate[],
  weights: CriteriaWeights,
  criteriaTypes: CriteriaTypes = {},
): RankingResult => {
  ensureData(candidates);
  const criteria = ensureCriteria(candidates[0], weights);
  const normalizedWeights = normalizeWeights(weights, criteria);
  const matrix = buildMatrix(candidates, criteria);
  const normalizedMatrix = vectorNormalize(matrix);

  const weightedMatrix = normalizedMatrix.map(row => row.map((value, idx) => value * normalizedWeights[criteria[idx]]));
  const isBenefit = criteria.map(column => (criteriaTypes[column] || "benefit") !== "cost");
  const transposed = transpose(weightedMatrix);
  const idealBest = transposed.map((column, idx) => (isBenefit[idx] ? Math.max(...column) : Math.min(...column)));
  const idealWorst = transposed.map((column, idx) => (isBenefit[idx] ? Math.min(...column) : Math.max(...column)));

  const scores: number[] = [];
  const breakdowns: RankingBreakdown[] = [];

  weightedMatrix.forEach((row, rowIdx) => {
    const distBest = Math.sqrt(row.reduce((sum, value, idx) => sum + (value - idealBest[idx]) ** 2, 0));
    const distWorst = Math.sqrt(row.reduce((sum, value, idx) => sum + (value - idealWorst[idx]) ** 2, 0));
    const score = distWorst / ((distBest + distWorst) || 1);
    scores.push(score);
    breakdowns.push({
      normalized: Object.fromEntries(criteria.map((key, idx) => [key, normalizedMatrix[rowIdx][idx]])),
      weighted: Object.fromEntries(criteria.map((key, idx) => [key, row[idx]])),
      idealBestDistance: distBest,
      idealWorstDistance: distWorst,
    });
  });

  return rankResults("TOPSIS", scores, candidates, breakdowns);
};

export const calculateWsm = (
  candidates: RankingCandidate[],
  weights: CriteriaWeights,
  criteriaTypes: CriteriaTypes = {},
): RankingResult => {
  ensureData(candidates);
  const criteria = ensureCriteria(candidates[0], weights);
  const normalizedWeights = normalizeWeights(weights, criteria);
  const matrix = buildMatrix(candidates, criteria);
  const isBenefit = criteria.map(column => (criteriaTypes[column] || "benefit") !== "cost");
  const normalizedValues = minMaxNormalize(matrix, isBenefit);

  const scores: number[] = [];
  const breakdowns: RankingBreakdown[] = [];

  normalizedValues.forEach(row => {
    const contributions: Record<string, number> = {};
    const normalizedRecord: Record<string, number> = {};
    row.forEach((value, idx) => {
      const key = criteria[idx];
      normalizedRecord[key] = value;
      contributions[key] = value * normalizedWeights[key];
    });
    scores.push(Object.values(contributions).reduce((sum, contribution) => sum + contribution, 0));
    breakdowns.push({ normalized: normalizedRecord, weightedContributions: contributions });
  });

  return rankResults("WSM", scores, candidates, breakdowns);
};

export const calculateSaw = (
  candidates: RankingCandidate[],
  weights: CriteriaWeights,
  maxReference?: CriteriaWeights,
): RankingResult => {
  ensureData(candidates);
  const criteria = ensureCriteria(candidates[0], weights);
  const normalizedWeights = normalizeWeights(weights, criteria);
  const matrix = buildMatrix(candidates, criteria);

  const references = maxReference ||
    criteria.reduce<CriteriaWeights>((acc, key, idx) => {
      acc[key] = Math.max(...matrix.map(row => row[idx])) || 1;
      return acc;
    }, {});

  const normalizedRows = matrix.map(row => row.map((value, idx) => value / (references[criteria[idx]] || 1)));

  const scores: number[] = [];
  const breakdowns: RankingBreakdown[] = [];

  normalizedRows.forEach(row => {
    const contributions: Record<string, number> = {};
    const normalizedRecord: Record<string, number> = {};
    row.forEach((value, idx) => {
      const key = criteria[idx];
      normalizedRecord[key] = value;
      contributions[key] = value * normalizedWeights[key];
    });
    scores.push(Object.values(contributions).reduce((sum, contribution) => sum + contribution, 0));
    breakdowns.push({ normalized: normalizedRecord, weightedContributions: contributions });
  });

  return rankResults("SAW", scores, candidates, breakdowns);
};

export const calculateAhp = (
  candidates: RankingCandidate[],
  pairwiseMatrix: number[][],
  criteriaOrder: string[],
): RankingResult => {
  ensureData(candidates);
  if (pairwiseMatrix.length !== criteriaOrder.length) {
    throw new Error("Pairwise matrix must be square and match the criteria list length.");
  }
  pairwiseMatrix.forEach(row => {
    if (row.length !== criteriaOrder.length) {
      throw new Error("Each row inside pairwise matrix must match criteria length.");
    }
  });

  const columnSums = criteriaOrder.map((_, colIdx) => pairwiseMatrix.reduce((sum, row) => sum + (row[colIdx] || 0), 0) || 1);
  const normalized = pairwiseMatrix.map(row => row.map((value, idx) => value / columnSums[idx]));
  const weights: CriteriaWeights = {};
  normalized.forEach((row, idx) => {
    weights[criteriaOrder[idx]] = row.reduce((sum, value) => sum + value, 0) / criteriaOrder.length;
  });

  return calculateSaw(candidates, weights);
};

export const buildCandidatesFromProfiles = (profiles: StudentProfile[]): RankingCandidate[] =>
  profiles.map(profile => ({
    id: profile.id,
    label: profile.name,
    metrics: {
      cgpa: profile.cgpa,
      certificates: profile.certificates.length,
      hackathons: profile.hackathons.length,
      internships: profile.internships.length,
      sports: profile.sports.length,
      extracurricular: profile.extracurricular.length,
      skills: profile.skills.length,
    },
    meta: {
      uid: profile.uid,
      profile,
    },
  }));

export const DEFAULT_RANKING_WEIGHTS: CriteriaWeights = {
  cgpa: 0.4,
  certificates: 0.15,
  hackathons: 0.15,
  internships: 0.15,
  sports: 0.1,
  extracurricular: 0.05,
  skills: 0.05,
};

export const DEFAULT_CRITERIA_TYPES: CriteriaTypes = {
  cgpa: "benefit",
  certificates: "benefit",
  hackathons: "benefit",
  internships: "benefit",
  sports: "benefit",
  extracurricular: "benefit",
  skills: "benefit",
};

export const runAlgorithm = (
  method: RankingAlgorithm,
  candidates: RankingCandidate[],
  weights: CriteriaWeights,
  options?: { criteriaTypes?: CriteriaTypes; pairwiseMatrix?: number[][]; criteriaOrder?: string[] },
): RankingResult => {
  switch (method) {
    case "TOPSIS":
      return calculateTopsis(candidates, weights, options?.criteriaTypes);
    case "WSM":
      return calculateWsm(candidates, weights, options?.criteriaTypes);
    case "SAW":
      return calculateSaw(candidates, weights);
    case "AHP":
      if (!options?.pairwiseMatrix || !options?.criteriaOrder) {
        throw new Error("AHP requires a pairwise matrix and criteria order.");
      }
      return calculateAhp(candidates, options.pairwiseMatrix, options.criteriaOrder);
    default:
      return calculateTopsis(candidates, weights, options?.criteriaTypes);
  }
};

export const buildPairwiseMatrixFromWeights = (criteria: string[], weights: CriteriaWeights): number[][] => {
  const sanitized = criteria.map(key => Math.abs(weights[key] ?? 0) || Number.EPSILON);
  return sanitized.map(weightI => sanitized.map(weightJ => weightI / weightJ));
};
