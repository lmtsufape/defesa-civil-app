import {
  DadosRevestimentos,
  OPCAO_COBERTURA_OUTRO,
  OPCAO_REVESTIMENTO_OUTRO,
  OPCOES_COBERTURA,
  OPCOES_REVESTIMENTO,
} from '../../../domain/entities';
import {
  CheckboxGroup,
  CheckboxOption,
  ImageUpload,
  Input,
} from '../../../components';
import { toggleOpcao } from './toggleOpcao';
import './Etapa5.css';

export interface EtapaRevestimentosProps {
  dados: DadosRevestimentos;
  onChange: (dados: DadosRevestimentos) => void;
}

const EtapaRevestimentos = ({ dados, onChange }: EtapaRevestimentosProps) => {
  const handleRevestimentoExterno = (valor: string) => {
    const revestimentoExterno = toggleOpcao(dados.revestimentoExterno, valor);
    onChange({
      ...dados,
      revestimentoExterno,
      outroRevestimentoExternoEspecificacao: revestimentoExterno.includes(OPCAO_REVESTIMENTO_OUTRO)
        ? dados.outroRevestimentoExternoEspecificacao
        : '',
    });
  };

  const handleRevestimentoInterno = (valor: string) => {
    const revestimentoInterno = toggleOpcao(dados.revestimentoInterno, valor);
    onChange({
      ...dados,
      revestimentoInterno,
      outroRevestimentoInternoEspecificacao: revestimentoInterno.includes(OPCAO_REVESTIMENTO_OUTRO)
        ? dados.outroRevestimentoInternoEspecificacao
        : '',
    });
  };

  const handleCobertura = (valor: string) => {
    const cobertura = toggleOpcao(dados.cobertura, valor);
    onChange({
      ...dados,
      cobertura,
      outraCoberturaEspecificacao: cobertura.includes(OPCAO_COBERTURA_OUTRO)
        ? dados.outraCoberturaEspecificacao
        : '',
    });
  };

  const revestimentoExternoOutro = dados.revestimentoExterno.includes(OPCAO_REVESTIMENTO_OUTRO);
  const revestimentoInternoOutro = dados.revestimentoInterno.includes(OPCAO_REVESTIMENTO_OUTRO);
  const coberturaOutro = dados.cobertura.includes(OPCAO_COBERTURA_OUTRO);

  return (
    <div className="etapa-card">
      <header className="etapa-card__cabecalho">
        <h2 className="etapa-card__titulo">Revestimentos</h2>
        <p className="etapa-card__subtitulo">
          Acabamento externo, interno e cobertura
        </p>
      </header>

      <div className="etapa-card__campos">
        <CheckboxGroup label="Revestimento externo">
          {OPCOES_REVESTIMENTO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.revestimentoExterno.includes(opcao)}
              onChange={() => handleRevestimentoExterno(opcao)}
            />
          ))}
        </CheckboxGroup>

        {revestimentoExternoOutro && (
          <Input
            label="Especifique o revestimento externo"
            placeholder="Especifique, se necessário"
            value={dados.outroRevestimentoExternoEspecificacao}
            onChange={(e) =>
              onChange({
                ...dados,
                outroRevestimentoExternoEspecificacao: e.target.value,
              })
            }
          />
        )}

        <ImageUpload
          label="Imagem do revestimento externo"
          value={dados.imagemRevestimentoExterno}
          onChange={(imagemRevestimentoExterno) =>
            onChange({ ...dados, imagemRevestimentoExterno })
          }
        />

        <Input
          label="Percentual de revestimento interno (%)"
          placeholder="Ex: 80%"
          value={dados.percentualRevestimentoInterno}
          onChange={(e) =>
            onChange({
              ...dados,
              percentualRevestimentoInterno: e.target.value,
            })
          }
        />

        <CheckboxGroup label="Revestimento interno">
          {OPCOES_REVESTIMENTO.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.revestimentoInterno.includes(opcao)}
              onChange={() => handleRevestimentoInterno(opcao)}
            />
          ))}
        </CheckboxGroup>

        {revestimentoInternoOutro && (
          <Input
            label="Especifique o revestimento interno"
            placeholder="Especifique, se necessário"
            value={dados.outroRevestimentoInternoEspecificacao}
            onChange={(e) =>
              onChange({
                ...dados,
                outroRevestimentoInternoEspecificacao: e.target.value,
              })
            }
          />
        )}

        <ImageUpload
          label="Imagem do revestimento interno"
          value={dados.imagemRevestimentoInterno}
          onChange={(imagemRevestimentoInterno) =>
            onChange({ ...dados, imagemRevestimentoInterno })
          }
        />

        <CheckboxGroup label="Cobertura">
          {OPCOES_COBERTURA.map((opcao) => (
            <CheckboxOption
              key={opcao}
              label={opcao}
              checked={dados.cobertura.includes(opcao)}
              onChange={() => handleCobertura(opcao)}
            />
          ))}
        </CheckboxGroup>

        {coberturaOutro && (
          <Input
            label="Especifique a cobertura"
            placeholder="Especifique, se necessário"
            value={dados.outraCoberturaEspecificacao}
            onChange={(e) =>
              onChange({ ...dados, outraCoberturaEspecificacao: e.target.value })
            }
          />
        )}

        <ImageUpload
          label="Imagem da cobertura"
          value={dados.imagemCobertura}
          onChange={(imagemCobertura) => onChange({ ...dados, imagemCobertura })}
        />
      </div>
    </div>
  );
};

export default EtapaRevestimentos;
