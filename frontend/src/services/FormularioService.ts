import {
  FormularioVistoria,
  OPCAO_PISO_OUTRO,
  StatusVistoria,
  Vistoria,
} from '../domain/entities';
import { apiClient, isApiError, localDb, LocalSyncQueueRow } from '../data';
import { networkAdapter, syncEngine } from '../sync';

export const FORMULARIOS_ENTITY = 'formularios';

const paraInteiro = (valor: string): number | null => {
  const limpo = valor.trim();
  return limpo ? parseInt(limpo, 10) : null;
};

const paraDecimal = (valor: string): number | null => {
  const limpo = valor.trim().replace(',', '.');
  return limpo ? Number(limpo) : null;
};

const textoOuNull = (valor: string): string | null => valor.trim() || null;

/**
 * Monta o JSON esperado por `POST /api/formularios`.
 * Os campos de escolha já estão guardados como códigos do backend
 * (ver `OpcaoFormulario.valor`), então vão direto.
 */
export const mapearFormularioParaBackend = (
  formulario: FormularioVistoria
): Record<string, unknown> => {
  const {
    identificacao,
    caracteristicasImovel,
    padraoConstrutivo,
    estrutura,
    revestimentos,
    conservacao,
    destinos,
    intervencoes,
    observacao,
    remocao,
    grauRisco,
    conclusao,
  } = formulario;

  const arrayOuVazio = (val: unknown): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) return [val.trim()];
    return [];
  };

  const localizacao = arrayOuVazio(caracteristicasImovel?.localizacao);
  const piso = arrayOuVazio(padraoConstrutivo?.piso);
  const situacaoPiso = arrayOuVazio(padraoConstrutivo?.situacaoPiso);

  const temOutroPiso = piso.some(
    (p) =>
      p === OPCAO_PISO_OUTRO ||
      p.toLowerCase() === 'outro' ||
      p.toLowerCase() === 'outro (espec)'
  );

  const payload: Record<string, unknown> = {
    localidade: identificacao.localidade.trim(),
    setor: textoOuNull(identificacao.setor),
    titular: identificacao.titular.trim(),
    endereco: identificacao.endereco.trim(),
    numero: textoOuNull(identificacao.numero),

    localizacao,
    causas_problemas: caracteristicasImovel?.principaisCausas ?? [],

    num_pavimentos: paraInteiro(padraoConstrutivo?.numeroPavimentos ?? ''),
    area_aproximada: paraDecimal(padraoConstrutivo?.areaAproximada ?? ''),
    num_comodos: paraInteiro(padraoConstrutivo?.numeroComodos ?? ''),
    num_dormitorios: paraInteiro(padraoConstrutivo?.numeroDormitorios ?? ''),
    tempo_construcao_anos: paraInteiro(padraoConstrutivo?.tempoConstrucao ?? ''),
    piso,
    piso_especificacao: temOutroPiso
      ? textoOuNull(padraoConstrutivo?.outroPisoEspecificacao ?? '')
      : null,
    situacao_piso: situacaoPiso,

    preenchido_em: new Date().toISOString(),
  };

  if (estrutura) {
    payload.estrutura = estrutura.estrutura;
    payload.vedacao = estrutura.vedacao;
    payload.vedacao_especificacao = textoOuNull(estrutura.outraVedacaoEspecificacao);
    payload.situacao_parede = estrutura.situacaoParede;
  }

  if (revestimentos) {
    payload.revestimento_externo = revestimentos.revestimentoExterno;
    payload.revestimento_externo_especificacao = textoOuNull(revestimentos.outroRevestimentoExternoEspecificacao);
    payload.percentual_revestimento_interno = textoOuNull(revestimentos.percentualRevestimentoInterno);
    payload.revestimento_interno = revestimentos.revestimentoInterno;
    payload.revestimento_interno_especificacao = textoOuNull(revestimentos.outroRevestimentoInternoEspecificacao);
    payload.cobertura = revestimentos.cobertura;
    payload.cobertura_especificacao = textoOuNull(revestimentos.outraCoberturaEspecificacao);
  }

  if (conservacao) {
    payload.conservacao_cobertura = conservacao.conservacaoCobertura;
    payload.conservacao_edificacao = conservacao.conservacaoEdificacao;
    payload.instalacao_eletrica = conservacao.instalacaoEletrica;
    payload.sanitario = conservacao.sanitario;
    payload.sanitario_especificacao = textoOuNull(conservacao.outroSanitarioEspecificacao);
  }

  if (destinos) {
    payload.destino_esgoto_primario = destinos.destinoEsgoto;
    payload.destino_esgoto_primario_especificacao = textoOuNull(destinos.outroDestinoEsgotoEspecificacao);
    payload.destino_aguas_servidas = destinos.destinoAguasServidas;
    payload.destino_aguas_servidas_especificacao = textoOuNull(destinos.outroDestinoAguasServidasEspecificacao);
    payload.destino_lixo = destinos.destinoLixo;
    payload.destino_lixo_especificacao = textoOuNull(destinos.outroDestinoLixoEspecificacao);
  }

  if (intervencoes) {
    payload.intervencao_parede = intervencoes.parede;
    payload.intervencao_coberta = intervencoes.coberta;
    payload.indicacao_atuacao = intervencoes.indicacaoAtuacao;
    payload.indicacao_demolicao =
      intervencoes.indicacaoDemolicao && intervencoes.indicacaoDemolicao.length > 0
        ? intervencoes.indicacaoDemolicao
        : null;
    payload.intervencao_piso = intervencoes.piso;
  }

  if (observacao) {
    payload.observacoes = textoOuNull(observacao.observacoes);
  }

  if (remocao) {
    payload.motivo_remocao =
      remocao.motivoRemocao && remocao.motivoRemocao.length > 0
        ? remocao.motivoRemocao
        : null;
    payload.motivo_remocao_especificacao = textoOuNull(remocao.outroMotivoRemocaoEspecificacao);
    payload.encaminhamentos = remocao.encaminhamentos;
  }

  if (grauRisco) {
    payload.grau_risco = textoOuNull(grauRisco.grauRisco);
  }

  if (conclusao) {
    payload.analista_tecnico = textoOuNull(conclusao.analistaTecnico);
    payload.chefia_gerente = textoOuNull(conclusao.chefiaGerente);
    payload.data_conclusao = textoOuNull(conclusao.data);
  }

  return payload;
};

type FormularioBackendShape = {
  id?: number | string;
  user_id?: number | string | null;
  titular?: string;
  endereco?: string;
  numero?: string | null;
  localidade?: string;
  preenchido_em?: string | null;
  created_at?: string | null;
};

const textoDe = (valor: unknown): string => (typeof valor === 'string' ? valor.trim() : '');

/** "Rua das Flores, 123. Bairro São João" (mesmo formato dos cards da Home). */
const montarEndereco = (f: FormularioBackendShape): string => {
  const rua = [textoDe(f.endereco), textoDe(f.numero)].filter(Boolean).join(', ');
  return [rua, textoDe(f.localidade)].filter(Boolean).join('. ');
};

/**
 * Converte um formulário no formato do backend (resposta de
 * `GET /formularios` ou payload guardado na fila) para o card da Home.
 */
export const mapearFormularioParaVistoria = (
  raw: unknown,
  opcoes: { id: string; status: StatusVistoria; protocolo?: string }
): Vistoria | null => {
  if (!raw || typeof raw !== 'object') return null;
  const f = raw as FormularioBackendShape;
  const data = new Date(f.preenchido_em || f.created_at || Date.now());
  return {
    id: opcoes.id,
    nomeSolicitante: textoDe(f.titular) || 'Titular não informado',
    endereco: montarEndereco(f),
    protocolo: opcoes.protocolo ?? `${data.getFullYear()}/${opcoes.id}`,
    status: opcoes.status,
    dataCriacao: data,
    agenteResponsavelId: f.user_id != null ? String(f.user_id) : undefined,
  };
};

/** Campo do backend → etapa e nome do campo na tela. */
const CAMPOS_BACKEND: Record<string, { etapa: number; campo: string }> = {
  localidade: { etapa: 1, campo: 'localidade' },
  setor: { etapa: 1, campo: 'setor' },
  titular: { etapa: 1, campo: 'titular' },
  endereco: { etapa: 1, campo: 'endereco' },
  numero: { etapa: 1, campo: 'numero' },
  localizacao: { etapa: 2, campo: 'localizacao' },
  causas_problemas: { etapa: 2, campo: 'principaisCausas' },
  num_pavimentos: { etapa: 3, campo: 'numeroPavimentos' },
  area_aproximada: { etapa: 3, campo: 'areaAproximada' },
  num_comodos: { etapa: 3, campo: 'numeroComodos' },
  num_dormitorios: { etapa: 3, campo: 'numeroDormitorios' },
  tempo_construcao_anos: { etapa: 3, campo: 'tempoConstrucao' },
  piso: { etapa: 3, campo: 'piso' },
  piso_especificacao: { etapa: 3, campo: 'outroPisoEspecificacao' },
  situacao_piso: { etapa: 3, campo: 'situacaoPiso' },
  estrutura: { etapa: 4, campo: 'estrutura' },
  vedacao: { etapa: 4, campo: 'vedacao' },
  vedacao_especificacao: { etapa: 4, campo: 'outraVedacaoEspecificacao' },
  situacao_parede: { etapa: 4, campo: 'situacaoParede' },
  revestimento_externo: { etapa: 5, campo: 'revestimentoExterno' },
  revestimento_externo_especificacao: { etapa: 5, campo: 'outroRevestimentoExternoEspecificacao' },
  percentual_revestimento_interno: { etapa: 5, campo: 'percentualRevestimentoInterno' },
  revestimento_interno: { etapa: 5, campo: 'revestimentoInterno' },
  revestimento_interno_especificacao: { etapa: 5, campo: 'outroRevestimentoInternoEspecificacao' },
  cobertura: { etapa: 5, campo: 'cobertura' },
  cobertura_especificacao: { etapa: 5, campo: 'outraCoberturaEspecificacao' },
  conservacao_cobertura: { etapa: 6, campo: 'conservacaoCobertura' },
  conservacao_edificacao: { etapa: 6, campo: 'conservacaoEdificacao' },
  instalacao_eletrica: { etapa: 6, campo: 'instalacaoEletrica' },
  sanitario: { etapa: 6, campo: 'sanitario' },
  sanitario_especificacao: { etapa: 6, campo: 'outroSanitarioEspecificacao' },
  destino_esgoto_primario: { etapa: 7, campo: 'destinoEsgoto' },
  destino_esgoto_primario_especificacao: { etapa: 7, campo: 'outroDestinoEsgotoEspecificacao' },
  destino_aguas_servidas: { etapa: 7, campo: 'destinoAguasServidas' },
  destino_aguas_servidas_especificacao: { etapa: 7, campo: 'outroDestinoAguasServidasEspecificacao' },
  destino_lixo: { etapa: 7, campo: 'destinoLixo' },
  destino_lixo_especificacao: { etapa: 7, campo: 'outroDestinoLixoEspecificacao' },
  intervencao_parede: { etapa: 8, campo: 'parede' },
  intervencao_coberta: { etapa: 8, campo: 'coberta' },
  indicacao_atuacao: { etapa: 8, campo: 'indicacaoAtuacao' },
  indicacao_demolicao: { etapa: 8, campo: 'indicacaoDemolicao' },
  intervencao_piso: { etapa: 8, campo: 'piso' },
  observacoes: { etapa: 9, campo: 'observacoes' },
  motivo_remocao: { etapa: 10, campo: 'motivoRemocao' },
  motivo_remocao_especificacao: { etapa: 10, campo: 'outroMotivoRemocaoEspecificacao' },
  encaminhamentos: { etapa: 10, campo: 'encaminhamentos' },
  grau_risco: { etapa: 11, campo: 'grauRisco' },
  analista_tecnico: { etapa: 12, campo: 'analistaTecnico' },
  chefia_gerente: { etapa: 12, campo: 'chefiaGerente' },
  data_conclusao: { etapa: 12, campo: 'data' },
};

/**
 * Converte os erros de validação do Laravel (422) para a etapa/campos da
 * tela. Devolve a primeira etapa que tiver erro, ou `null` se nenhum campo
 * for reconhecido.
 */
export const mapearErrosBackend = (
  errors: Record<string, string[]> | undefined
): { etapa: number; erros: Record<string, string> } | null => {
  if (!errors) return null;
  const porEtapa = new Map<number, Record<string, string>>();
  for (const [chave, mensagens] of Object.entries(errors)) {
    // `causas_problemas.0` → `causas_problemas`
    const destino = CAMPOS_BACKEND[chave.split('.')[0]];
    if (!destino) continue;
    const erros = porEtapa.get(destino.etapa) ?? {};
    erros[destino.campo] ??= mensagens[0];
    porEtapa.set(destino.etapa, erros);
  }
  if (porEtapa.size === 0) return null;
  const etapa = Math.min(...porEtapa.keys());
  return { etapa, erros: porEtapa.get(etapa)! };
};

/**
 * Envia para a API um formulário que estava na fila offline.
 * Registrado no `syncEngine` por `iniciarSincronizacao()`.
 */
export const sincronizarItemFormulario = async (item: LocalSyncQueueRow): Promise<void> => {
  if (item.operation !== 'create') {
    throw new Error(`Operação de formulário não suportada: ${item.operation}`);
  }
  await apiClient.post('/formularios', item.payload, { timeoutMs: 10_000 });
};

export interface EnvioFormularioResultado {
  /** `true` quando salvo na API; `false` quando ficou na fila offline. */
  enviado: boolean;
}

export class FormularioService {
  /** Formulários já salvos no backend pelo usuário logado (`GET /formularios`). */
  async listarEnviados(): Promise<Vistoria[]> {
    const raw = await apiClient.get<unknown>('/formularios', { timeoutMs: 10_000 });
    const lista = raw && typeof raw === 'object' && 'data' in raw ? (raw as { data: unknown }).data : raw;
    if (!Array.isArray(lista)) return [];
    return lista
      .map((f) => {
        const id = (f as FormularioBackendShape)?.id;
        return id == null
          ? null
          : mapearFormularioParaVistoria(f, { id: String(id), status: StatusVistoria.CONCLUIDA });
      })
      .filter((v): v is Vistoria => !!v);
  }

  /** Formulários que ainda estão na fila offline, aguardando envio. */
  async listarNaFila(): Promise<Vistoria[]> {
    const queue = await localDb.queue();
    const itens = await queue.getByEntity(FORMULARIOS_ENTITY);
    return itens
      .map((item) =>
        mapearFormularioParaVistoria(item.payload, {
          id: `fila-${item.id}`,
          status: StatusVistoria.PENDENTE,
          protocolo: 'aguardando envio',
        })
      )
      .filter((v): v is Vistoria => !!v);
  }

  private async enfileirar(payload: Record<string, unknown>): Promise<void> {
    const queue = await localDb.queue();
    await queue.push({ entity: FORMULARIOS_ENTITY, operation: 'create', payload });
    syncEngine.sincronizarEmBreve();
  }

  /**
   * Envia o formulário para a API. Sem internet (ou com falha de rede/servidor),
   * guarda na fila de sincronia para ser enviado depois por `sincronizar()`.
   * Erros 4xx (validação, sessão expirada) são repassados para a UI.
   */
  async enviar(formulario: FormularioVistoria): Promise<EnvioFormularioResultado> {
    const payload = mapearFormularioParaBackend(formulario);

    if (!networkAdapter.isOnline()) {
      await this.enfileirar(payload);
      return { enviado: false };
    }

    try {
      await apiClient.post('/formularios', payload, { timeoutMs: 10_000 });
      return { enviado: true };
    } catch (e) {
      if (isApiError(e) && e.status >= 400 && e.status < 500) {
        throw e;
      }
      await this.enfileirar(payload);
      return { enviado: false };
    }
  }
}

export const formularioService = new FormularioService();
