import type { Topic } from '../../types';
import { indefinido } from './indefinido';
import { imperfecto } from './imperfecto';
import { perfecto } from './perfecto';
import { contrasteIndImp } from './contraste-ind-imp';
import { contrasteIndPerf } from './contraste-ind-perf';
import { pronombres } from './pronombres';
import { preposiciones } from './preposiciones';
import { serEstarHay } from './ser-estar-hay';
import { presente, gerundio, gustar, conectores, basicos } from './repaso';
import { interrogativos } from './interrogativos';

/** Ordered by priority for the exams */
export const TOPICS: Topic[] = [
  indefinido,
  imperfecto,
  perfecto,
  contrasteIndImp,
  contrasteIndPerf,
  pronombres,
  preposiciones,
  serEstarHay,
  presente,
  gerundio,
  gustar,
  conectores,
  basicos,
  interrogativos,
];
