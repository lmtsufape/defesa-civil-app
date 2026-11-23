import { useCallback, useEffect, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  useIonToast,
  IonLoading,
  useIonRouter,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import {
  chevronBackOutline,
} from 'ionicons/icons';
import {
  FormularioVistoria,
  FORMULARIO_INICIAL_VAZIO,
  OPCOES_LOCALIZACAO,
  OPCOES_PRINCIPAIS_CAUSAS,
  OPCOES_PISO,
  OPCOES_SITUACAO_PISO,
  OPCOES_ESTRUTURA,
  OPCOES_VEDACAO,
  OPCOES_SITUACAO_PAREDE,
  OPCOES_REVESTIMENTO,
  OPCOES_COBERTURA,
  OPCOES_ESTADO_CONSERVACAO,
  OPCOES_INSTALACAO_ELETRICA,
  OPCOES_SANITARIO,
  OPCOES_DESTINO_ESGOTO,
  OPCOES_DESTINO_AGUAS_SERVIDAS,
  OPCOES_DESTINO_LIXO,
  OPCOES_INTERVENCAO_PAREDE,
  OPCOES_INTERVENCAO_COBERTA,
  OPCOES_INDICACAO_INTERVENCAO,
  OPCOES_MOTIVO_REMOCAO,
  OPCOES_ENCAMINHAMENTOS,
} from '@/domain/entities';
import { formularioService } from '@/services';
import { getLabels } from '@/utils/formUtils';
import { usePdfExport } from '@/hooks/usePdfExport';
import { PdfHeader, PdfSection, PdfFieldRow, PdfFooter } from './components';
import './VisualizacaoVistoria.css';

const IMAGE_LABELS: Record<string, string> = {
  imagemLocalizacao: 'Localização',
  imagemPrincipaisCausas: 'Principais Causas',
  imagemPiso: 'Piso',
  imagemSituacaoPiso: 'Situação do Piso',
  imagemEstrutura: 'Estrutura',
  imagemVedacao: 'Vedação',
  imagemSituacaoParede: 'Situação da Parede',
  imagemRevestimentoExterno: 'Revestimento Externo',
  imagemRevestimentoInterno: 'Revestimento Interno',
  imagemCobertura: 'Cobertura',
  imagemConservacaoCobertura: 'Conservação da Coberta',
  imagemConservacaoEdificacao: 'Conservação da Edificação',
  imagemInstalacaoEletrica: 'Instalação Elétrica',
  imagemSanitario: 'Sanitário',
  imagemDestinoEsgoto: 'Destino de Esgoto',
  imagemDestinoAguasServidas: 'Águas Servidas',
  imagemDestinoLixo: 'Destino de Lixo',
  imagemParede: 'Intervenção Parede',
  imagemCoberta: 'Intervenção Coberta',
  imagemIndicacaoAtuacao: 'Indicação de Atuação',
  imagemIndicacaoDemolicao: 'Indicação de Demolição',
  imagemPisoIntervencao: 'Intervenção Piso',
  imagemMotivoRemocao: 'Motivo da Remoção',
  imagemEncaminhamentos: 'Encaminhamentos',
};

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const VisualizacaoVistoria = () => {
  const router = useIonRouter();
  const { id } = useParams<{ id: string }>();
  const [dados, setDados] = useState<FormularioVistoria>(FORMULARIO_INICIAL_VAZIO);
  const [isLoading, setIsLoading] = useState(true);
  const [presentToast] = useIonToast();
  const { exportToPdf } = usePdfExport();

  const carregarDados = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const form = await formularioService.obterPorVistoriaId(id);
      if (form) setDados(form);
      else {
        presentToast({
          message: 'Não foi possível carregar os dados.',
          duration: 3000,
          color: 'danger',
          position: 'bottom',
        });
      }
    } catch (e) {
      console.error(e);
      presentToast({ message: 'Erro ao carregar vistoria.', duration: 3000, color: 'danger', position: 'bottom' });
    } finally {
      setIsLoading(false);
    }
  }, [id, presentToast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleDownload = () => {
    const nomeTitular = dados.identificacao.titular || 'vistoria';
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    exportToPdf({
      fileName: `Vistoria_${nomeTitular}_${dataAtual}`,
      containerSelector: '.pdf-container'
    });
  };

  const handleFechar = () => {
    router.push('/home', 'root', 'replace');
  };

  if (isLoading) return <IonLoading isOpen={true} message="Carregando visualização..." />;

  if (!dados) {
    return (
      <IonPage>
        <IonContent>
          <div className="visualizacao-erro">
            <h2>Vistoria não encontrada</h2>
            <p>Não foi possível carregar os dados desta vistoria.</p>
            <button onClick={handleFechar}>Voltar para Home</button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  // Coleta todas as imagens que possuem valor
  const fotos: { label: string; url: string }[] = [];
  
  const adicionarSeExiste = (labelKey: string, url?: string) => {
    if (url && url.trim()) {
      fotos.push({ label: IMAGE_LABELS[labelKey] || labelKey, url });
    }
  };

  adicionarSeExiste('imagemLocalizacao', dados.caracteristicasImovel.imagemLocalizacao);
  adicionarSeExiste('imagemPrincipaisCausas', dados.caracteristicasImovel.imagemPrincipaisCausas);
  adicionarSeExiste('imagemPiso', dados.padraoConstrutivo.imagemPiso);
  adicionarSeExiste('imagemSituacaoPiso', dados.padraoConstrutivo.imagemSituacaoPiso);
  adicionarSeExiste('imagemEstrutura', dados.estrutura.imagemEstrutura);
  adicionarSeExiste('imagemVedacao', dados.estrutura.imagemVedacao);
  adicionarSeExiste('imagemSituacaoParede', dados.estrutura.imagemSituacaoParede);
  adicionarSeExiste('imagemRevestimentoExterno', dados.revestimentos.imagemRevestimentoExterno);
  adicionarSeExiste('imagemRevestimentoInterno', dados.revestimentos.imagemRevestimentoInterno);
  adicionarSeExiste('imagemCobertura', dados.revestimentos.imagemCobertura);
  adicionarSeExiste('imagemConservacaoCobertura', dados.conservacao.imagemConservacaoCobertura);
  adicionarSeExiste('imagemConservacaoEdificacao', dados.conservacao.imagemConservacaoEdificacao);
  adicionarSeExiste('imagemInstalacaoEletrica', dados.conservacao.imagemInstalacaoEletrica);
  adicionarSeExiste('imagemSanitario', dados.conservacao.imagemSanitario);
  adicionarSeExiste('imagemDestinoEsgoto', dados.destinos.imagemDestinoEsgoto);
  adicionarSeExiste('imagemDestinoAguasServidas', dados.destinos.imagemDestinoAguasServidas);
  adicionarSeExiste('imagemDestinoLixo', dados.destinos.imagemDestinoLixo);
  adicionarSeExiste('imagemParede', dados.intervencoes.imagemParede);
  adicionarSeExiste('imagemCoberta', dados.intervencoes.imagemCoberta);
  adicionarSeExiste('imagemIndicacaoAtuacao', dados.intervencoes.imagemIndicacaoAtuacao);
  adicionarSeExiste('imagemIndicacaoDemolicao', dados.intervencoes.imagemIndicacaoDemolicao);
  adicionarSeExiste('imagemPisoIntervencao', dados.intervencoes.imagemPiso);
  adicionarSeExiste('imagemMotivoRemocao', dados.remocao.imagemMotivoRemocao);
  adicionarSeExiste('imagemEncaminhamentos', dados.remocao.imagemEncaminhamentos);

  // Agrupa fotos em pares para as páginas do PDF (4 por página)
  const paginasFotos: { label: string; url: string }[][] = [];
  for (let i = 0; i < fotos.length; i += 4) {
    paginasFotos.push(fotos.slice(i, i + 4));
  }

  return (
    <IonPage className="visualizacao-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleFechar}>
              <IonIcon slot="icon-only" icon={chevronBackOutline} color="medium" />
            </IonButton>
          </IonButtons>
          <IonTitle>Visualização da Vistoria</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="visualizacao-content">
        <div className="pdf-container">
          {/* Página 1 */}
          <div className="pdf-page A4">
            <PdfHeader 
              localidade={dados.identificacao.localidade}
              setor={dados.identificacao.setor}
              titular={dados.identificacao.titular}
              endereco={dados.identificacao.endereco}
              numero={dados.identificacao.numero}
            />

            <PdfSection title="CARACTERIZAÇÃO DO IMÓVEL:">
              <PdfFieldRow 
                label="LOCALIZAÇÃO" 
                value={getLabels(dados.caracteristicasImovel.localizacao, OPCOES_LOCALIZACAO)} 
                wrap 
              />
              <PdfFieldRow 
                label="PRINCIPAIS CAUSAS DE PROBLEMAS" 
                value={getLabels(dados.caracteristicasImovel.principaisCausas, OPCOES_PRINCIPAIS_CAUSAS)} 
                wrap 
              />
            </PdfSection>

            <PdfSection title="PADRÃO CONSTRUTIVO:">
              <div className="pdf-grid-2">
                <div className="pdf-column">
                  <PdfFieldRow label="Nº. DE PAVIMENTOS" value={dados.padraoConstrutivo.numeroPavimentos} />
                  <PdfFieldRow label="ÁREA APROXIMADA" value={dados.padraoConstrutivo.areaAproximada} unit="m²" />
                  <PdfFieldRow label="Nº. DE CÔMODOS" value={dados.padraoConstrutivo.numeroComodos} />
                  <PdfFieldRow label="Nº. DE DORMITÓRIOS" value={dados.padraoConstrutivo.numeroDormitorios} />
                  <PdfFieldRow label="TEMPO DE CONSTRUÇÃO" value={dados.padraoConstrutivo.tempoConstrucao} unit="anos" />
                </div>
                <div className="pdf-column">
                  <PdfFieldRow 
                    label="PISO" 
                    value={getLabels(dados.padraoConstrutivo.piso, OPCOES_PISO, dados.padraoConstrutivo.outroPisoEspecificacao)} 
                    wrap 
                  />
                  <PdfFieldRow 
                    label="SITUAÇÃO DO PISO" 
                    value={getLabels(dados.padraoConstrutivo.situacaoPiso, OPCOES_SITUACAO_PISO)} 
                    wrap 
                  />
                </div>
              </div>
            </PdfSection>

            <PdfSection title="ESTRUTURA E VEDAÇÃO:">
              <PdfFieldRow label="ESTRUTURA" value={getLabels(dados.estrutura.estrutura, OPCOES_ESTRUTURA)} wrap />
              <PdfFieldRow 
                label="VEDAÇÃO" 
                value={getLabels(dados.estrutura.vedacao, OPCOES_VEDACAO, dados.estrutura.outraVedacaoEspecificacao)} 
                wrap 
              />
              <PdfFieldRow label="SITUAÇÃO DA PAREDE" value={getLabels(dados.estrutura.situacaoParede, OPCOES_SITUACAO_PAREDE)} wrap />
            </PdfSection>

            <PdfSection title="REVESTIMENTOS E COBERTURA:">
              <div className="pdf-field-row pdf-field-row--wrap">
                <span className="pdf-label">REVESTIMENTO EXTERNO:</span>
                <span className="pdf-value">{getLabels(dados.revestimentos.revestimentoExterno, OPCOES_REVESTIMENTO, dados.revestimentos.outroRevestimentoExternoEspecificacao)}</span>
                <span className="pdf-label" style={{ marginLeft: '10px' }}>PORCENTAGEM:</span>
                <span className="pdf-value">{dados.revestimentos.percentualRevestimentoExterno}%</span>
              </div>
              <div className="pdf-field-row pdf-field-row--wrap">
                <span className="pdf-label">REVESTIMENTO INTERNO:</span>
                <span className="pdf-value">{getLabels(dados.revestimentos.revestimentoInterno, OPCOES_REVESTIMENTO, dados.revestimentos.outroRevestimentoInternoEspecificacao)}</span>
                <span className="pdf-label" style={{ marginLeft: '10px' }}>PORCENTAGEM:</span>
                <span className="pdf-value">{dados.revestimentos.percentualRevestimentoInterno}%</span>
              </div>
              <PdfFieldRow 
                label="COBERTURA" 
                value={getLabels(dados.revestimentos.cobertura, OPCOES_COBERTURA, dados.revestimentos.outraCoberturaEspecificacao)} 
                wrap 
              />
            </PdfSection>

            <PdfSection title="ESTADO DE CONSERVAÇÃO:">
              <div className="pdf-grid-2">
                <div className="pdf-column">
                  <PdfFieldRow label="DA COBERTA" value={getLabels(dados.conservacao.conservacaoCobertura, OPCOES_ESTADO_CONSERVACAO)} wrap />
                  <PdfFieldRow label="DA EDIFICAÇÃO" value={getLabels(dados.conservacao.conservacaoEdificacao, OPCOES_ESTADO_CONSERVACAO)} wrap />
                </div>
                <div className="pdf-column">
                  <PdfFieldRow label="INSTALAÇÕES ELÉTRICAS" value={getLabels(dados.conservacao.instalacaoEletrica, OPCOES_INSTALACAO_ELETRICA)} wrap />
                  <PdfFieldRow 
                    label="SANITÁRIO" 
                    value={getLabels(dados.conservacao.sanitario, OPCOES_SANITARIO, dados.conservacao.outroSanitarioEspecificacao)} 
                    wrap 
                  />
                </div>
              </div>
            </PdfSection>

            <PdfSection title="DESTINOS:">
              <PdfFieldRow label="ESGOTO PRIMÁRIO" value={getLabels(dados.destinos.destinoEsgoto, OPCOES_DESTINO_ESGOTO, dados.destinos.outroDestinoEsgotoEspecificacao)} wrap />
              <PdfFieldRow label="ÁGUAS SERVIDAS" value={getLabels(dados.destinos.destinoAguasServidas, OPCOES_DESTINO_AGUAS_SERVIDAS, dados.destinos.outroDestinoAguasServidasEspecificacao)} wrap />
              <PdfFieldRow label="LIXO" value={getLabels(dados.destinos.destinoLixo, OPCOES_DESTINO_LIXO, dados.destinos.outroDestinoLixoEspecificacao)} wrap />
            </PdfSection>

            <PdfSection title="INTERVENÇÕES E ATUAÇÃO:">
              <PdfFieldRow label="PAREDE" value={getLabels(dados.intervencoes.parede, OPCOES_INTERVENCAO_PAREDE)} wrap />
              <PdfFieldRow label="COBERTA" value={getLabels(dados.intervencoes.coberta, OPCOES_INTERVENCAO_COBERTA)} wrap />
              <PdfFieldRow label="INDICAÇÃO DE ATUAÇÃO" value={getLabels(dados.intervencoes.indicacaoAtuacao, OPCOES_INDICACAO_INTERVENCAO)} wrap />
              <PdfFieldRow label="INDICAÇÃO DE DEMOLIÇÃO" value={getLabels(dados.intervencoes.indicacaoDemolicao, OPCOES_INDICACAO_INTERVENCAO)} wrap />
            </PdfSection>
          </div>

          {/* Páginas de Registros Fotográficos (2 por página) */}
          {paginasFotos.map((par, index) => (
            <div key={`page-photo-${index}`} className="pdf-page A4">
              <PdfHeader 
                localidade={dados.identificacao.localidade}
                setor={dados.identificacao.setor}
                titular={dados.identificacao.titular}
                endereco={dados.identificacao.endereco}
                numero={dados.identificacao.numero}
              />
              
              <PdfSection title={`REGISTROS FOTOGRÁFICOS - PARTE ${index + 1}`}>
                <div className="pdf-photos-grid">
                  {par.map((foto, fIdx) => (
                    <div key={`foto-${index}-${fIdx}`} className="pdf-photo-item">
                      <img 
                        src={foto.url} 
                        alt={foto.label} 
                        className="pdf-photo-img" 
                      />
                      <span className="pdf-photo-label">{foto.label}</span>
                    </div>
                  ))}
                </div>
              </PdfSection>
            </div>
          ))}

          {/* Página 2 (Agora Página Final) */}
          <div className="pdf-page A4">
            <PdfHeader 
              localidade={dados.identificacao.localidade}
              setor={dados.identificacao.setor}
              titular={dados.identificacao.titular}
              endereco={dados.identificacao.endereco}
              numero={dados.identificacao.numero}
            />

            <PdfSection title="REMOÇÃO E ENCAMINHAMENTOS:">
              <PdfFieldRow label="MOTIVO DA REMOÇÃO" value={getLabels(dados.remocao.motivoRemocao, OPCOES_MOTIVO_REMOCAO, dados.remocao.outroMotivoRemocaoEspecificacao)} wrap />
              <PdfFieldRow label="ENCAMINHAMENTOS" value={getLabels(dados.remocao.encaminhamentos, OPCOES_ENCAMINHAMENTOS)} wrap />
            </PdfSection>
            
            <PdfSection title="OBSERVAÇÕES:">
              <div className="pdf-value pdf-value--box" style={{ minHeight: '200px', padding: '10px', border: '1px solid #000', marginTop: '10px', lineHeight: '1.5' }}>
                {dados.observacao.observacoes || 'Nenhuma observação registrada.'}
              </div>
            </PdfSection>

            <PdfSection title="CONCLUSÃO E GRAU DE RISCO:" style={{ marginTop: '20px' }}>
              <div className="pdf-grid-2">
                <PdfFieldRow label="GRAU DE RISCO" value={dados.grauRisco.grauRisco || 'Não definido'} style={{ fontSize: '12pt', fontWeight: 'bold' }} />
                <PdfFieldRow label="DATA DA VISTORIA" value={new Date(dados.conclusao.data).toLocaleDateString('pt-BR')} />
              </div>
            </PdfSection>

            <PdfFooter analistaTecnico={dados.conclusao.analistaTecnico} chefiaGerente={dados.conclusao.chefiaGerente} />
          </div>
        </div>

        <div className="visualizacao-footer">
          <button className="btn-baixar" onClick={handleDownload}>
            Baixar <DownloadIcon />
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VisualizacaoVistoria;
