import { FormularioVistoria } from '../entities';

/** Mensagens de erro por campo da etapa (chave = nome do campo no front). */
export type ErrosEtapa = Record<string, string>;

const obrigatorio = (valor: string) => valor.trim().length > 0;
const tamanhoMaximo = (valor: string, max: number) => valor.trim().length <= max;
const inteiroOuVazio = (valor: string) => !valor.trim() || /^\d+$/.test(valor.trim());
const decimalOuVazio = (valor: string) =>
  !valor.trim() || /^\d+([.,]\d+)?$/.test(valor.trim());

const validarIdentificacao = ({ identificacao: d }: FormularioVistoria): ErrosEtapa => {
  const erros: ErrosEtapa = {};
  if (!obrigatorio(d.localidade)) erros.localidade = 'Informe a localidade';
  else if (!tamanhoMaximo(d.localidade, 255)) erros.localidade = 'Máximo de 255 caracteres';
  if (!tamanhoMaximo(d.setor, 255)) erros.setor = 'Máximo de 255 caracteres';
  if (!obrigatorio(d.titular)) erros.titular = 'Informe o titular do imóvel';
  else if (!tamanhoMaximo(d.titular, 255)) erros.titular = 'Máximo de 255 caracteres';
  if (!obrigatorio(d.endereco)) erros.endereco = 'Informe o endereço';
  else if (!tamanhoMaximo(d.endereco, 255)) erros.endereco = 'Máximo de 255 caracteres';
  if (!tamanhoMaximo(d.numero, 20)) erros.numero = 'Máximo de 20 caracteres';
  return erros;
};

const validarCaracteristicas = ({ caracteristicasImovel: d }: FormularioVistoria): ErrosEtapa => {
  const erros: ErrosEtapa = {};
  // Campo localização não é mais obrigatório
  return erros;
};

const validarPadraoConstrutivo = ({ padraoConstrutivo: d }: FormularioVistoria): ErrosEtapa => {
  const erros: ErrosEtapa = {};
  const somenteInteiro = 'Informe apenas números inteiros';
  if (!inteiroOuVazio(d.numeroPavimentos)) erros.numeroPavimentos = somenteInteiro;
  if (!decimalOuVazio(d.areaAproximada)) erros.areaAproximada = 'Informe um número (ex: 85,5)';
  if (!inteiroOuVazio(d.numeroComodos)) erros.numeroComodos = somenteInteiro;
  if (!inteiroOuVazio(d.numeroDormitorios)) erros.numeroDormitorios = somenteInteiro;
  if (!inteiroOuVazio(d.tempoConstrucao)) erros.tempoConstrucao = somenteInteiro;
  if (!d.piso) erros.piso = 'Selecione o tipo de piso';
  if (!tamanhoMaximo(d.outroPisoEspecificacao, 255)) {
    erros.outroPisoEspecificacao = 'Máximo de 255 caracteres';
  }
  if (!d.situacaoPiso) erros.situacaoPiso = 'Selecione a situação do piso';
  return erros;
};

/**
 * Validadores por número de etapa. Etapas sem validador são livres.
 * As regras espelham o `FormularioController@store` do backend, para que o
 * erro apareça na tela antes de chegar a um 422.
 */
const VALIDADORES_ETAPA: Record<number, (formulario: FormularioVistoria) => ErrosEtapa> = {
  1: validarIdentificacao,
  2: validarCaracteristicas,
  3: validarPadraoConstrutivo,
};

export const validarEtapa = (etapa: number, formulario: FormularioVistoria): ErrosEtapa =>
  VALIDADORES_ETAPA[etapa]?.(formulario) ?? {};

/**
 * Valida todas as etapas e devolve a PRIMEIRA que tiver erro
 * (ou `null` se o formulário estiver pronto para envio).
 */
export const primeiraEtapaComErro = (
  formulario: FormularioVistoria
): { etapa: number; erros: ErrosEtapa } | null => {
  const etapas = Object.keys(VALIDADORES_ETAPA)
    .map(Number)
    .sort((a, b) => a - b);
  for (const etapa of etapas) {
    const erros = validarEtapa(etapa, formulario);
    if (Object.keys(erros).length > 0) return { etapa, erros };
  }
  return null;
};
