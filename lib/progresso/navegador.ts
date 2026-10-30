import { criarProgressService, type ProgressService } from './progress-service';
import { criarRepositorioLocalStorage } from './progress-repository';

const STORAGE_INDISPONIVEL = {
  getItem: () => null,
  setItem: () => {},
};

export function criarProgressServiceDoNavegador(): ProgressService {
  let storage;

  try {
    storage = window.localStorage;
  } catch {
    storage = STORAGE_INDISPONIVEL;
  }

  return criarProgressService(criarRepositorioLocalStorage(storage));
}
