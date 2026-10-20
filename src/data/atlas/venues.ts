import type { Tier, Verification, VerificationBadge } from './types';

export const journalTiers: Record<string, Tier> = {
  TOCS: 'A',
  TOS: 'A',
  TCAD: 'A',
  TC: 'A',
  TPDS: 'A',
  TACO: 'A',
  TOPLAS: 'A',
  TSC: 'A',
  TON: 'A',
  JSAC: 'A',
  TMC: 'A',
  TDSC: 'A',
  TIFS: 'A',
  TODS: 'A',
  TOIS: 'A',
  TKDE: 'A',
  VLDBJ: 'A',
  JMLR: 'A',
};

export const verificationBadges: Record<Verification, VerificationBadge> = {
  ok: { label: '已核实', note: '按原论文或官方页面核对过' },
  part: { label: '部分核实', note: '出处已核对，部分细节未能在线复核' },
  none: { label: '概括', note: '依据官方项目的公开描述概括，未逐条在线核对' },
};

export const stageNames = ['奠基', '代表', '前沿', '跨界入门'] as const;
