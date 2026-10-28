import {
  DadosPadraoConstrutivo,
  OPCAO_PISO_OUTRO,
  OPCOES_PISO,
  OPCOES_SITUACAO_PISO,
} from '../../../domain/entities';
import {
  CheckboxGroup,
  CheckboxOption,
  ImageUpload,
  Input,
} from '../../../components';
import { toggleOpcao } from './toggleOpcao';
import './Etapa3.css';

export interface EtapaPadraoConstrutivoProps {
  dados: DadosPadraoConstrutivo;
  onChange: (dados: DadosPadraoConstrutivo) => void;
  erros?: {
    numeroPavimentos?: string;
    areaAproximada?: string;
    numeroComodos?: string;
    numeroDormitorios?: string;
    tempoConstrucao?: string;
    piso?: string;
    outroPisoEspecificacao?: string;
    situacaoPiso?: string;
  };
}

const EtapaPadraoConstrutivo = ({
  dados,
  onChange,
  erros,
}: EtapaPadraoConstrutivoProps) => {
  const setCampo = (
    campo:
      | 'numeroPavimentos'
      | 'areaAproximada'
      | 'numeroComodos'
      | 'numeroDormitorios'
      | 'tempoConstrucao'
      | 'outroPisoEspecificacao',
    valor: string
  ) => {
    onChange({ ...dados, [campo]: valor });
  };

  const pisoSelecionado = Array.isArray(dados.piso)
    ? dados.piso
    : dados.piso
      ? [dados.piso]
      : [];

  const situacaoPisoSelecionada = Array.isArray(dados.situacaoPiso)
    ? dados.situacaoPiso
    : dados.situacaoPiso
      ? [dados.situacaoPiso]
      : [];

  const isPisoOutro = (piso: string[]) =>
    piso.some(
      (p) =>
        p === OPCAO_PISO_OUTRO ||
        p.toLowerCase() === 'outro' ||
        p.toLowerCase() === 'outro (espec)'
    );

  const handlePiso = (opcao: string) => {
    const novoPiso = toggleOpcao(pisoSelecionado, opcao);
    const temOutro = isPisoOutro(novoPiso);
    onChange({
      ...dados,
      piso: novoPiso,
      outroPisoEspecificacao: temOutro ? dados.outroPisoEspecificacao : '',
    });
  };

  const isPisoChecked = (valor: string) => {
    const valorNorm = valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return pisoSelecionado.some((item) => {
      const itemNorm = item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return item.toLowerCase() === valor.toLowerCase() || itemNorm === valorNorm;
    });
  };

  const handleSituacaoPiso = (opcao: string) => {
    onChange({
      ...dados,
      situacaoPiso: toggleOpcao(situacaoPisoSelecionada, opcao),
    });
  };

  const isSituacaoPisoChecked = (valor: string) => {
    return situacaoPisoSelecionada.some(
      (item) => item.toLowerCase() === valor.toLowerCase()
    );
  };

  const pisoOutroSelecionado = isPisoOutro(pisoSelecionado);

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Padrão construtivo</h2>
        <p className="etapa-card__subtitulo">
          Dimensões, piso e situação do piso
        </p>
      </header>

      <div className="etapa-card__campos">
        <Input
          label="N° de pavimentos"
          placeholder="Ex: 2"
          inputMode="numeric"
          value={dados.numeroPavimentos}
          onChange={(e) => setCampo('numeroPavimentos', e.target.value)}
          error={erros?.numeroPavimentos}
        />

        <Input
          label="Área aproximada (m²)"
          placeholder="Ex: 120"
          inputMode="decimal"
          value={dados.areaAproximada}
          onChange={(e) => setCampo('areaAproximada', e.target.value)}
          error={erros?.areaAproximada}
        />

        <Input
          label="N° de cômodo"
          placeholder="Ex: 5"
          inputMode="numeric"
          value={dados.numeroComodos}
          onChange={(e) => setCampo('numeroComodos', e.target.value)}
          error={erros?.numeroComodos}
        />

        <Input
          label="N° de dormitório"
          placeholder="Ex: 3"
          inputMode="numeric"
          value={dados.numeroDormitorios}
          onChange={(e) => setCampo('numeroDormitorios', e.target.value)}
          error={erros?.numeroDormitorios}
        />

        <Input
          label="Tempo de construção (anos)"
          placeholder="Ex: 15"
          inputMode="numeric"
          value={dados.tempoConstrucao}
          onChange={(e) => setCampo('tempoConstrucao', e.target.value)}
          error={erros?.tempoConstrucao}
        />

        <CheckboxGroup
          label="Piso"
          helperText="Selecione o tipo de piso predominante."
          error={erros?.piso}
          required
        >
          {OPCOES_PISO.map(({ valor, rotulo }) => (
            <CheckboxOption
              key={valor}
              label={rotulo}
              checked={isPisoChecked(valor)}
              onChange={() => handlePiso(valor)}
            />
          ))}
        </CheckboxGroup>

        {pisoOutroSelecionado && (
          <Input
            label="Especifique o tipo de piso"
            placeholder="Especifique, se necessário"
            value={dados.outroPisoEspecificacao}
            onChange={(e) => setCampo('outroPisoEspecificacao', e.target.value)}
            error={erros?.outroPisoEspecificacao}
          />
        )}

        <ImageUpload
          label="Imagem do piso"
          value={dados.imagemPiso}
          onChange={(imagemPiso) => onChange({ ...dados, imagemPiso })}
        />

        <CheckboxGroup
          label="Situação do piso"
          helperText="Selecione a situação observada no piso."
          error={erros?.situacaoPiso}
          required
        >
          {OPCOES_SITUACAO_PISO.map(({ valor, rotulo }) => (
            <CheckboxOption
              key={valor}
              label={rotulo}
              checked={isSituacaoPisoChecked(valor)}
              onChange={() => handleSituacaoPiso(valor)}
            />
          ))}
        </CheckboxGroup>

        <ImageUpload
          label="Imagem da situação do piso"
          value={dados.imagemSituacaoPiso}
          onChange={(imagemSituacaoPiso) => onChange({ ...dados, imagemSituacaoPiso })}
        />
      </div>
    </div>
  );
};

export default EtapaPadraoConstrutivo;
