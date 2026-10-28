const normalizar = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const toggleOpcao = (lista: string[], valor: string): string[] => {
  const valorNorm = normalizar(valor);
  const index = lista.findIndex((v) => normalizar(v) === valorNorm);
  if (index >= 0) {
    return lista.filter((_, i) => i !== index);
  }
  return [...lista, valor];
};
