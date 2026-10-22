export type Tier = 'A' | 'B' | 'C' | '—';
export type Verification = 'ok' | 'part' | 'none';
export type Stage = 0 | 1 | 2 | 3;
export type AreaKey = 'mlsys' | 'db' | 'edge' | 'quantum' | 'dist' | 'hpc' | 'stor' | 'net' | 'os' | 'cloud' | 'comp' | 'arch' | 'eda' | 'sec' | 'rel' | 'energy';
export type LayerKey = 'apps' | 'scale' | 'sw' | 'hw' | 'rail';
export type Tab = 'ov' | 'tree' | 'tools' | 'papers';

export interface Layer {
  key: Exclude<LayerKey, 'rail'>;
  title: string;
  subtitle: string;
}

export interface Conference {
  name: string;
  tier: Tier;
  note: string;
}

export interface Branch {
  id: string;
  name: string;
  english: string;
  description: string;
  leaves: { text: string; crossArea?: AreaKey }[];
  tools: string[];
  papers: string[];
}

export interface Method {
  id: string;
  name: string;
  examples: string;
  pros: string;
  cons: string;
}

export interface Tool {
  name: string;
  use: string;
  capabilities: string;
  limitations: string;
  validation: string;
  sources: { label: string; url: string }[];
  verification: Verification;
  verificationNote?: string;
}

export interface VerificationBadge {
  label: string;
  note: string;
}

export interface Paper {
  id: string;
  stage: Stage;
  branch: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  tier: string;
  question: string;
  contribution: string;
  whyRead: string;
  takeaway: string;
  source: string;
}

export interface Area {
  key: AreaKey;
  layer: LayerKey;
  name: string;
  abbr: string;
  english: string;
  summary: string;
  topics: string[];
  conferences: Conference[];
  hot: string[];
  neighbors: AreaKey[];
  branches: Branch[];
  methods: Method[];
  addon?: Method;
  toolRefs: { tool: string; method: string }[];
  papers: Paper[];
  start: { courses: { title: string; url?: string }[]; project: string };
  nextArea: AreaKey;
  journals: { name: string; tier: Tier }[];
}

export type SearchKind = '方向' | '研究分支' | '研究方法' | '论文' | '入门课程' | '动手项目' | '工具' | '会议' | '期刊';

export interface SearchItem {
  id: number;
  kind: SearchKind;
  label: string;
  owners: AreaKey[];
  tab: Tab;
  target: string | null;
  snippet: string;
  title: string;
  text: string;
}
