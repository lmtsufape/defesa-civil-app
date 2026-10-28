import { FORMULARIO_INICIAL_VAZIO, FormularioVistoria, StatusVistoria } from '../domain/entities';
import { primeiraEtapaComErro } from '../domain/useCases';
import {
  mapearErrosBackend,
  mapearFormularioParaBackend,
  mapearFormularioParaVistoria,
} from './FormularioService';

const formularioPreenchido = (): FormularioVistoria => ({
  ...FORMULARIO_INICIAL_VAZIO,
  identificacao: {
    localidade: 'Bairro São João',
    setor: 'Setor Norte',
    titular: 'João da Silva',
    endereco: 'Rua das Flores',
    numero: '123',
  },
  caracteristicasImovel: {
    ...FORMULARIO_INICIAL_VAZIO.caracteristicasImovel,
    localizacao: ['encosta'],
    principaisCausas: ['recalque_do_solo', 'fenda'],
  },
  padraoConstrutivo: {
    ...FORMULARIO_INICIAL_VAZIO.padraoConstrutivo,
    numeroPavimentos: '2',
    areaAproximada: '85,5',
    numeroComodos: '5',
    numeroDormitorios: '2',
    tempoConstrucao: '10',
    piso: ['Cerâmica'],
    situacaoPiso: ['Abatimento'],
  },
});

describe('mapearFormularioParaBackend', () => {
  it('gera o JSON no formato de POST /api/formularios', () => {
    const { preenchido_em, ...payload } = mapearFormularioParaBackend(formularioPreenchido());

    expect(payload).toEqual({
      localidade: 'Bairro São João',
      setor: 'Setor Norte',
      titular: 'João da Silva',
      endereco: 'Rua das Flores',
      numero: '123',
      localizacao: ['encosta'],
      causas_problemas: ['recalque_do_solo', 'fenda'],
      num_pavimentos: 2,
      area_aproximada: 85.5,
      num_comodos: 5,
      num_dormitorios: 2,
      tempo_construcao_anos: 10,
      piso: ['Cerâmica'],
      piso_especificacao: null,
      situacao_piso: ['Abatimento'],
      estrutura: [],
      vedacao: [],
      vedacao_especificacao: null,
      situacao_parede: [],
      revestimento_externo: [],
      revestimento_externo_especificacao: null,
      percentual_revestimento_interno: null,
      revestimento_interno: [],
      revestimento_interno_especificacao: null,
      cobertura: [],
      cobertura_especificacao: null,
      conservacao_cobertura: [],
      conservacao_edificacao: [],
      instalacao_eletrica: [],
      sanitario: [],
      sanitario_especificacao: null,
      destino_esgoto_primario: [],
      destino_esgoto_primario_especificacao: null,
      destino_aguas_servidas: [],
      destino_aguas_servidas_especificacao: null,
      destino_lixo: [],
      destino_lixo_especificacao: null,
      intervencao_parede: [],
      intervencao_coberta: [],
      indicacao_atuacao: [],
      indicacao_demolicao: null,
      intervencao_piso: [],
      observacoes: null,
      motivo_remocao: null,
      motivo_remocao_especificacao: null,
      encaminhamentos: [],
      grau_risco: null,
      analista_tecnico: null,
      chefia_gerente: null,
      data_conclusao: null,
    });
    expect(typeof preenchido_em).toBe('string');
  });

  it('permite múltiplos itens para localização, piso e situação do piso', () => {
    const f = formularioPreenchido();
    f.caracteristicasImovel.localizacao = ['encosta', 'topo_de_encosta'];
    f.padraoConstrutivo.piso = ['Cerâmica', 'Cimento'];
    f.padraoConstrutivo.situacaoPiso = ['Rachadura', 'Abatimento'];

    const payload = mapearFormularioParaBackend(f);
    expect(payload.localizacao).toEqual(['encosta', 'topo_de_encosta']);
    expect(payload.piso).toEqual(['Cerâmica', 'Cimento']);
    expect(payload.situacao_piso).toEqual(['Rachadura', 'Abatimento']);
  });

  it('envia campos opcionais vazios como null', () => {
    const f = formularioPreenchido();
    f.identificacao.setor = '  ';
    f.padraoConstrutivo.areaAproximada = '';
    const payload = mapearFormularioParaBackend(f);
    expect(payload.setor).toBeNull();
    expect(payload.area_aproximada).toBeNull();
  });

  it('só envia a especificação do piso quando a opção é "outro"', () => {
    const f = formularioPreenchido();
    f.padraoConstrutivo.outroPisoEspecificacao = 'Porcelanato';
    expect(mapearFormularioParaBackend(f).piso_especificacao).toBeNull();

    f.padraoConstrutivo.piso = ['Outro (Espec)'];
    expect(mapearFormularioParaBackend(f).piso_especificacao).toBe('Porcelanato');
  });
});

describe('primeiraEtapaComErro', () => {
  it('aceita um formulário completo', () => {
    expect(primeiraEtapaComErro(formularioPreenchido())).toBeNull();
  });

  it('aponta a primeira etapa com campo obrigatório faltando', () => {
    const f = formularioPreenchido();
    f.padraoConstrutivo.piso = [];
    f.caracteristicasImovel.localizacao = [];
    expect(primeiraEtapaComErro(f)).toEqual({
      etapa: 2,
      erros: { localizacao: 'Selecione a localização' },
    });
  });
});

describe('mapearErrosBackend', () => {
  it('converte os erros 422 do Laravel para a etapa e os campos da tela', () => {
    expect(
      mapearErrosBackend({
        piso: ['The selected piso is invalid.'],
        'causas_problemas.0': ['The causas_problemas.0 field must be a string.'],
      })
    ).toEqual({
      etapa: 2,
      erros: { principaisCausas: 'The causas_problemas.0 field must be a string.' },
    });
  });

  it('retorna null quando nenhum campo é reconhecido', () => {
    expect(mapearErrosBackend({ desconhecido: ['x'] })).toBeNull();
    expect(mapearErrosBackend(undefined)).toBeNull();
  });
});

describe('mapearFormularioParaVistoria', () => {
  // Item real devolvido por GET /api/formularios.
  const doBackend = {
    id: 8,
    user_id: 2,
    localidade: 'Bairro São João',
    setor: null,
    titular: 'João da Silva',
    endereco: 'Rua das Flores',
    numero: '123',
    localizacao: 'encosta',
    causas_problemas: ['fenda'],
    piso: 'ceramica',
    situacao_piso: 'abatimento',
    preenchido_em: '2026-09-28T21:12:00.000000Z',
    created_at: '2026-10-07T02:25:56.000000Z',
  };

  it('monta o card da Home a partir do formulário enviado', () => {
    expect(
      mapearFormularioParaVistoria(doBackend, { id: '8', status: StatusVistoria.CONCLUIDA })
    ).toEqual({
      id: '8',
      nomeSolicitante: 'João da Silva',
      endereco: 'Rua das Flores, 123. Bairro São João',
      protocolo: '2026/8',
      status: StatusVistoria.CONCLUIDA,
      dataCriacao: new Date('2026-09-28T21:12:00.000000Z'),
      agenteResponsavelId: '2',
    });
  });

  it('aceita o payload da fila offline (sem id nem user_id)', () => {
    const payload = mapearFormularioParaBackend(formularioPreenchido());
    const card = mapearFormularioParaVistoria(payload, {
      id: 'fila-1',
      status: StatusVistoria.PENDENTE,
      protocolo: 'aguardando envio',
    });
    expect(card).toMatchObject({
      nomeSolicitante: 'João da Silva',
      endereco: 'Rua das Flores, 123. Bairro São João',
      status: StatusVistoria.PENDENTE,
      protocolo: 'aguardando envio',
    });
  });

  it('usa a data de criação quando não há preenchido_em', () => {
    const card = mapearFormularioParaVistoria(
      { ...doBackend, preenchido_em: null },
      { id: '8', status: StatusVistoria.CONCLUIDA }
    );
    expect(card?.dataCriacao).toEqual(new Date('2026-10-07T02:25:56.000000Z'));
  });
});
