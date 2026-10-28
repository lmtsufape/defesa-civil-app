export interface DadosIdentificacao {
  localidade: string;
  setor: string;
  titular: string;
  endereco: string;
  numero: string;
}

/**
 * Opção de um campo de escolha do formulário.
 * - `valor`: código enviado ao backend e guardado no estado (não muda).
 * - `rotulo`: texto exibido na tela (pode ser corrigido à vontade).
 */
export interface OpcaoFormulario {
  valor: string;
  rotulo: string;
}

export interface DadosCaracteristicasImovel {
  /** Códigos de `OPCOES_LOCALIZACAO`. */
  localizacao: string[];
  /** Códigos de `OPCOES_PRINCIPAIS_CAUSAS`. */
  principaisCausas: string[];
  imagemLocalizacao: string;
  imagemPrincipaisCausas: string;
}

export const OPCOES_LOCALIZACAO: OpcaoFormulario[] = [
  { valor: 'planicie_corrego', rotulo: 'Planície / Córrego' },
  { valor: 'encosta', rotulo: 'Encosta' },
  { valor: 'topo_de_encosta', rotulo: 'Topo de Encosta' },
];

export const OPCOES_PRINCIPAIS_CAUSAS: OpcaoFormulario[] = [
  { valor: 'recalque_do_solo', rotulo: 'Recalque do Solo' },
  { valor: 'ma_conservacao', rotulo: 'Má conservação' },
  { valor: 'vicios_construtivos', rotulo: 'Vícios construtivos' },
  { valor: 'deslizamento', rotulo: 'Deslizamento' },
  { valor: 'fenda', rotulo: 'Fenda' },
  { valor: 'tombamento_de_arvore', rotulo: 'Tombamento de árvore' },
  { valor: 'deslizamento_de_fossa', rotulo: 'Deslizamento de Fossa' },
  { valor: 'imovel_atingido_por_deslizamento', rotulo: 'Imóvel Atingido por Deslizamento' },
];

export interface DadosPadraoConstrutivo {
  numeroPavimentos: string;
  areaAproximada: string;
  numeroComodos: string;
  numeroDormitorios: string;
  tempoConstrucao: string;
  /** Códigos de `OPCOES_PISO`. */
  piso: string[];
  outroPisoEspecificacao: string;
  /** Códigos de `OPCOES_SITUACAO_PISO`. */
  situacaoPiso: string[];
  imagemPiso: string;
  imagemSituacaoPiso: string;
}

export const OPCAO_PISO_OUTRO = 'Outro (Espec)';

export const OPCOES_PISO: OpcaoFormulario[] = [
  { valor: 'Terra batida', rotulo: 'Terra batida' },
  { valor: 'Cerâmica', rotulo: 'Cerâmica' },
  { valor: 'Madeira', rotulo: 'Madeira' },
  { valor: 'Cimento', rotulo: 'Cimento' },
  { valor: OPCAO_PISO_OUTRO, rotulo: 'Outro (Espec)' },
];

export const OPCOES_SITUACAO_PISO: OpcaoFormulario[] = [
  { valor: 'Rachadura', rotulo: 'Rachadura' },
  { valor: 'Abatimento', rotulo: 'Abatimento' },
];

export interface DadosEstrutura {
  estrutura: string[];
  vedacao: string[];
  outraVedacaoEspecificacao: string;
  situacaoParede: string[];
  imagemEstrutura: string;
  imagemVedacao: string;
  imagemSituacaoParede: string;
}

export const OPCOES_ESTRUTURA: string[] = [
  'Alvenaria',
  'Madeira',
  'Concreto armado',
  'Taipa',
  'Lona',
  'Misto',
  'Outro',
];

export const OPCAO_VEDACAO_OUTRO = 'Outro (Espec)';

export const OPCOES_VEDACAO: string[] = [
  'Alvenaria',
  'Madeira',
  'Taipa',
  'Lona plástica',
  'Resto de materiais',
  'Misto',
  OPCAO_VEDACAO_OUTRO,
];

export const OPCOES_SITUACAO_PAREDE: string[] = [
  'Fissura',
  'Rachada',
  'Recalque',
  'Deslocamento',
  'Infiltração',
  'Desabamento parcial',
  'Desabamento total',
];

export interface DadosRevestimentos {
  revestimentoExterno: string[];
  outroRevestimentoExternoEspecificacao: string;
  percentualRevestimentoInterno: string;
  revestimentoInterno: string[];
  outroRevestimentoInternoEspecificacao: string;
  cobertura: string[];
  outraCoberturaEspecificacao: string;
  imagemRevestimentoExterno: string;
  imagemRevestimentoInterno: string;
  imagemCobertura: string;
}

export const OPCAO_REVESTIMENTO_OUTRO = 'Outro (Espec)';

export const OPCOES_REVESTIMENTO: string[] = [
  'Reboco',
  'Chapisco',
  'Sem revestimento',
  OPCAO_REVESTIMENTO_OUTRO,
];

export const OPCAO_COBERTURA_OUTRO = 'Outro (Espec)';

export const OPCOES_COBERTURA: string[] = [
  'Cerâmica - inglesa',
  'Cerâmica - Inglesa',
  'Canal',
  'Amianto',
  'Laje',
  'Metálica',
  'Canalão',
  'Rest. materiais',
  OPCAO_COBERTURA_OUTRO,
];

export interface DadosConservacao {
  conservacaoCobertura: string[];
  conservacaoEdificacao: string[];
  instalacaoEletrica: string[];
  sanitario: string[];
  outroSanitarioEspecificacao: string;
  imagemConservacaoCobertura: string;
  imagemConservacaoEdificacao: string;
  imagemInstalacaoEletrica: string;
  imagemSanitario: string;
}

export const OPCOES_ESTADO_CONSERVACAO: string[] = [
  'Bom',
  'Regular',
  'Precária com risco',
  'Precária sem risco',
  'Desabamento parcial',
  'Desabamento total',
];

export const OPCOES_INSTALACAO_ELETRICA: string[] = [
  'Bom',
  'Regular',
  'Precária com risco',
  'Precária sem risco',
  'Não tem',
];

export const OPCAO_SANITARIO_OUTRO = 'Outros (Espec.)';

export const OPCOES_SANITARIO: string[] = [
  'Individual interno',
  'Individual externo',
  'Coletivo',
  'Não tem',
  OPCAO_SANITARIO_OUTRO,
];

export interface DadosDestinos {
  destinoEsgoto: string[];
  outroDestinoEsgotoEspecificacao: string;
  destinoAguasServidas: string[];
  outroDestinoAguasServidasEspecificacao: string;
  destinoLixo: string[];
  outroDestinoLixoEspecificacao: string;
  imagemDestinoEsgoto: string;
  imagemDestinoAguasServidas: string;
  imagemDestinoLixo: string;
}

export const OPCAO_DESTINO_OUTRO = 'Outros (Espec.)';

export const OPCOES_DESTINO_ESGOTO: string[] = [
  'Direto na rede geral',
  'Galeria de águas pluviais',
  'Na fossa',
  'Vala a céu aberto',
  "Linha d'água",
  "Curso d'água",
  'No talude',
  OPCAO_DESTINO_OUTRO,
];

export const OPCOES_DESTINO_AGUAS_SERVIDAS: string[] = [
  'Direto na rede geral',
  'Galeria de águas pluviais',
  'Na fossa',
  'Vala a céu aberto',
  "Linha d'água",
  "Curso d'água",
  'No talude',
  'Canaleta',
  OPCAO_DESTINO_OUTRO,
];

export const OPCOES_DESTINO_LIXO: string[] = [
  'Coleta domiciliar',
  'C. estacionária',
  'Via pública',
  'Terreno baldio',
  "Curso d'água",
  'Talude',
  'Queima',
  'Coletivo',
  OPCAO_DESTINO_OUTRO,
];

export interface DadosIntervencoes {
  parede: string[];
  coberta: string[];
  indicacaoAtuacao: string[];
  indicacaoDemolicao: string[];
  piso: string[];
  imagemParede: string;
  imagemCoberta: string;
  imagemIndicacaoAtuacao: string;
  imagemIndicacaoDemolicao: string;
  imagemPiso: string;
}

export const OPCOES_INTERVENCAO_PAREDE: string[] = [
  'Reconstrução',
  'Recuperação',
  'Revestimento',
  'Reforço estrutural',
  'Revisão',
];

export const OPCOES_INTERVENCAO_COBERTA: string[] = [
  'Reconstrução',
  'Reposição',
  'Tratamento de madeiramento',
  'Revisão',
];

export const OPCOES_INDICACAO_INTERVENCAO: string[] = [
  'Muro confinante',
  'Imóvel',
  'Construção de risco',
  'Ocupação de área imprópria',
  'Monitoramento',
];

export const OPCOES_INTERVENCAO_PISO: string[] = [
  'Recuperação',
];

export interface DadosObservacao {
  observacoes: string;
}

export interface DadosRemocao {
  motivoRemocao: string[];
  outroMotivoRemocaoEspecificacao: string;
  encaminhamentos: string[];
  imagemMotivoRemocao: string;
  imagemEncaminhamentos: string;
}

export const OPCAO_MOTIVO_REMOCAO_OUTRO = 'Outros (Espec.)';

export const OPCOES_MOTIVO_REMOCAO: string[] = [
  'Desabamento por má conservação',
  'Deslizamento de encosta',
  'Risco de deslizamento',
  OPCAO_MOTIVO_REMOCAO_OUTRO,
];

export const OPCOES_ENCAMINHAMENTOS: string[] = [
  'Monitoramento',
  'Retirada imediata',
  'Retirada em caso de chuva',
  'Auxílio moradia',
];

export interface DadosGrauRisco {
  grauRisco: string;
}

export const OPCOES_GRAU_RISCO: string[] = [
  'R1 Baixo',
  'R2 Médio',
  'R3 Alto',
  'R4 Muito Alto',
];

export interface DadosConclusao {
  analistaTecnico: string;
  chefiaGerente: string;
  data: string;
}

export interface FormularioVistoria {
  identificacao: DadosIdentificacao;
  caracteristicasImovel: DadosCaracteristicasImovel;
  padraoConstrutivo: DadosPadraoConstrutivo;
  estrutura: DadosEstrutura;
  revestimentos: DadosRevestimentos;
  conservacao: DadosConservacao;
  destinos: DadosDestinos;
  intervencoes: DadosIntervencoes;
  observacao: DadosObservacao;
  remocao: DadosRemocao;
  grauRisco: DadosGrauRisco;
  conclusao: DadosConclusao;
}

export interface EtapaFormulario {
  indice: number;
  titulo: string;
  subtitulo: string;
}

export const ETAPAS_FORMULARIO: EtapaFormulario[] = [
  { indice: 1, titulo: 'Identificação', subtitulo: 'Dados básicos do imóvel e do titular' },
  { indice: 2, titulo: 'Características do Imóvel', subtitulo: 'Localização e principais causas' },
  { indice: 3, titulo: 'Padrão Construtivo', subtitulo: 'Dimensões, piso e situação do piso' },
  { indice: 4, titulo: 'Padrão Construtivo', subtitulo: 'Estrutura, vedação e situação da parede' },
  { indice: 5, titulo: 'Revestimentos', subtitulo: 'Acabamento externo, interno e cobertura' },
  { indice: 6, titulo: 'Conservação', subtitulo: 'Estado do imóvel e instalação' },
  { indice: 7, titulo: 'Destinos', subtitulo: 'Esgotos, águas servidas, lixo e ocupação' },
  { indice: 8, titulo: 'Intervenções', subtitulo: 'Medidas necessárias no imóvel' },
  { indice: 9, titulo: 'Observação', subtitulo: 'Registro técnico livre da vistoria' },
  { indice: 10, titulo: 'Remoção e encaminhamento', subtitulo: 'Motivo da remoção e providências indicadas' },
  { indice: 11, titulo: 'Grau de risco', subtitulo: 'Classificação final da vistoria' },
  { indice: 12, titulo: 'Conclusão', subtitulo: 'Responsáveis, matrícula, carimbo e data' },
];

export const FORMULARIO_INICIAL_VAZIO: FormularioVistoria = {
  identificacao: {
    localidade: '',
    setor: '',
    titular: '',
    endereco: '',
    numero: '',
  },
  caracteristicasImovel: {
    localizacao: [],
    principaisCausas: [],
    imagemLocalizacao: '',
    imagemPrincipaisCausas: '',
  },
  padraoConstrutivo: {
    numeroPavimentos: '',
    areaAproximada: '',
    numeroComodos: '',
    numeroDormitorios: '',
    tempoConstrucao: '',
    piso: [],
    outroPisoEspecificacao: '',
    situacaoPiso: [],
    imagemPiso: '',
    imagemSituacaoPiso: '',
  },
  estrutura: {
    estrutura: [],
    vedacao: [],
    outraVedacaoEspecificacao: '',
    situacaoParede: [],
    imagemEstrutura: '',
    imagemVedacao: '',
    imagemSituacaoParede: '',
  },
  revestimentos: {
    revestimentoExterno: [],
    outroRevestimentoExternoEspecificacao: '',
    percentualRevestimentoInterno: '',
    revestimentoInterno: [],
    outroRevestimentoInternoEspecificacao: '',
    cobertura: [],
    outraCoberturaEspecificacao: '',
    imagemRevestimentoExterno: '',
    imagemRevestimentoInterno: '',
    imagemCobertura: '',
  },
  conservacao: {
    conservacaoCobertura: [],
    conservacaoEdificacao: [],
    instalacaoEletrica: [],
    sanitario: [],
    outroSanitarioEspecificacao: '',
    imagemConservacaoCobertura: '',
    imagemConservacaoEdificacao: '',
    imagemInstalacaoEletrica: '',
    imagemSanitario: '',
  },
  destinos: {
    destinoEsgoto: [],
    outroDestinoEsgotoEspecificacao: '',
    destinoAguasServidas: [],
    outroDestinoAguasServidasEspecificacao: '',
    destinoLixo: [],
    outroDestinoLixoEspecificacao: '',
    imagemDestinoEsgoto: '',
    imagemDestinoAguasServidas: '',
    imagemDestinoLixo: '',
  },
  intervencoes: {
    parede: [],
    coberta: [],
    indicacaoAtuacao: [],
    indicacaoDemolicao: [],
    piso: [],
    imagemParede: '',
    imagemCoberta: '',
    imagemIndicacaoAtuacao: '',
    imagemIndicacaoDemolicao: '',
    imagemPiso: '',
  },
  observacao: {
    observacoes: '',
  },
  remocao: {
    motivoRemocao: [],
    outroMotivoRemocaoEspecificacao: '',
    encaminhamentos: [],
    imagemMotivoRemocao: '',
    imagemEncaminhamentos: '',
  },
  grauRisco: {
    grauRisco: '',
  },
  conclusao: {
    analistaTecnico: '',
    chefiaGerente: '',
    data: '',
  },
};
