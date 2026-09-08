import { CutoffRecord } from '../types';
import cutoffsJson from './historical-cutoffs.json';

export const HISTORICAL_CUTOFFS: CutoffRecord[] = cutoffsJson as unknown as CutoffRecord[];
