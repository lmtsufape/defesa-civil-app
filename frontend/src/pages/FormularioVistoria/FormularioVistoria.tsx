import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IonContent, IonPage, useIonRouter, useIonToast } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { Button, Loading, StepIndicator } from '../../components';
import {
  ETAPAS_FORMULARIO,
  FormularioVistoria as FormularioVistoriaEntity,
  FORMULARIO_INICIAL_VAZIO,
} from '../../domain/entities';
import { ErrosEtapa, primeiraEtapaComErro, validarEtapa } from '../../domain/useCases';
import { isApiError } from '../../data';
import { formularioService, mapearErrosBackend } from '../../services';
import EtapaIdentificacao from './etapas/Etapa1';
import EtapaCaracteristicasImovel from './etapas/Etapa2';
import EtapaPadraoConstrutivo from './etapas/Etapa3';
import EtapaEstrutura from './etapas/Etapa4';
import EtapaRevestimentos from './etapas/Etapa5';
import EtapaConservacao from './etapas/Etapa6';
import EtapaDestinos from './etapas/Etapa7';
import EtapaIntervencoes from './etapas/Etapa8';
import EtapaObservacao from './etapas/Etapa9';
import EtapaRemocao from './etapas/Etapa10';
import EtapaGrauRisco from './etapas/Etapa11';
import EtapaConclusao from './etapas/Etapa12';
import FormularioConcluido from './FormularioConcluido';
import './FormularioVistoria.css';

const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const NextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FormularioVistoria = () => {
  const router = useIonRouter();
  const { id } = useParams<{ id: string }>();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [presentToast] = useIonToast();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dadosFormulario, setDadosFormulario] = useState<FormularioVistoriaEntity>(
    FORMULARIO_INICIAL_VAZIO
  );
  const [erros, setErros] = useState<ErrosEtapa>({});
  const [isSalvando, setIsSalvando] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConcluido, setShowConcluido] = useState(false);
  const [idVistoriaCriada, setIdVistoriaCriada] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const form = await formularioService.obterPorVistoriaId(id);
      if (form) {
        setDadosFormulario(form);
        setIdVistoriaCriada(id);
      } else {
        avisar('Não foi possível carregar os dados para edição.', 'danger');
      }
    } catch (e) {
      console.error(e);
      avisar('Erro ao carregar os dados da vistoria.', 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const totalEtapas = useMemo(() => ETAPAS_FORMULARIO.length, []);
  const infoEtapaAtual = useMemo(
    () => ETAPAS_FORMULARIO[etapaAtual - 1],
    [etapaAtual]
  );
  const estaNaPrimeiraEtapa = etapaAtual === 1;
  const estaNaUltimaEtapa = etapaAtual === totalEtapas;

  const handleFechar = () => {
    router.push('/home', 'root', 'replace');
  };

  const handleVoltar = () => {
    if (estaNaPrimeiraEtapa) {
      handleFechar();
      return;
    }
    setErros({});
    setEtapaAtual((e) => Math.max(1, e - 1));
    contentRef.current?.scrollToTop(400);
  };

  const avisar = (message: string, color: 'success' | 'warning' | 'danger') =>
    presentToast({ message, color, duration: 3500, position: 'top' });

  const irParaEtapaComErros = (etapa: number, novosErros: ErrosEtapa) => {
    setEtapaAtual(etapa);
    setErros(novosErros);
  };

  const enviarFormulario = async () => {
    const pendente = primeiraEtapaComErro(dadosFormulario);
    if (pendente) {
      irParaEtapaComErros(pendente.etapa, pendente.erros);
      avisar('Corrija os campos destacados antes de concluir.', 'warning');
      return;
    }

    setIsSalvando(true);
    try {
      const { enviado, id } = await formularioService.enviar(dadosFormulario, idVistoriaCriada);
      avisar(
        enviado
          ? 'Formulário enviado com sucesso!'
          : 'Sem conexão: o formulário foi salvo e será enviado quando houver internet.',
        enviado ? 'success' : 'warning'
      );
      
      if (id) {
        setIdVistoriaCriada(id);
        setShowConcluido(true);
      } else {
        router.push('/home', 'root', 'replace');
      }
    } catch (e) {
      const errosBackend = isApiError(e) && e.status === 422 ? mapearErrosBackend(e.errors) : null;
      if (errosBackend) {
        irParaEtapaComErros(errosBackend.etapa, errosBackend.erros);
        avisar('O servidor recusou alguns campos. Verifique os campos destacados.', 'danger');
      } else {
        avisar(isApiError(e) ? e.message : 'Não foi possível enviar o formulário.', 'danger');
      }
    } finally {
      setIsSalvando(false);
    }
  };

  const handleProxima = async () => {
    const novosErros = validarEtapa(etapaAtual, dadosFormulario);
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});

    if (estaNaUltimaEtapa) {
      await enviarFormulario();
      return;
    }

    setEtapaAtual((e) => Math.min(totalEtapas, e + 1));
    contentRef.current?.scrollToTop(400);
  };

  const atualizarSecao =
    <K extends keyof FormularioVistoriaEntity>(secao: K) =>
    (novos: FormularioVistoriaEntity[K]) => {
      setDadosFormulario((anterior) => ({ ...anterior, [secao]: novos }));
      if (Object.keys(erros).length > 0) {
        setErros({});
      }
    };

  const handleVisualizarDocumento = () => {
    if (idVistoriaCriada) {
      router.push(`/visualizacao-vistoria/${idVistoriaCriada}`, 'forward', 'push');
    }
  };

  const handleVoltarHomeConcluido = () => {
    router.push('/home', 'root', 'replace');
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <EtapaIdentificacao
            dados={dadosFormulario.identificacao}
            onChange={atualizarSecao('identificacao')}
            erros={erros}
          />
        );
      case 2:
        return (
          <EtapaCaracteristicasImovel
            dados={dadosFormulario.caracteristicasImovel}
            onChange={atualizarSecao('caracteristicasImovel')}
            erros={erros}
          />
        );
      case 3:
        return (
          <EtapaPadraoConstrutivo
            dados={dadosFormulario.padraoConstrutivo}
            onChange={atualizarSecao('padraoConstrutivo')}
            erros={erros}
          />
        );
      case 4:
        return (
          <EtapaEstrutura
            dados={dadosFormulario.estrutura}
            onChange={atualizarSecao('estrutura')}
          />
        );
      case 5:
        return (
          <EtapaRevestimentos
            dados={dadosFormulario.revestimentos}
            onChange={atualizarSecao('revestimentos')}
          />
        );
      case 6:
        return (
          <EtapaConservacao
            dados={dadosFormulario.conservacao}
            onChange={atualizarSecao('conservacao')}
          />
        );
      case 7:
        return (
          <EtapaDestinos
            dados={dadosFormulario.destinos}
            onChange={atualizarSecao('destinos')}
          />
        );
      case 8:
        return (
          <EtapaIntervencoes
            dados={dadosFormulario.intervencoes}
            onChange={atualizarSecao('intervencoes')}
          />
        );
      case 9:
        return (
          <EtapaObservacao
            dados={dadosFormulario.observacao}
            onChange={atualizarSecao('observacao')}
          />
        );
      case 10:
        return (
          <EtapaRemocao
            dados={dadosFormulario.remocao}
            onChange={atualizarSecao('remocao')}
          />
        );
      case 11:
        return (
          <EtapaGrauRisco
            dados={dadosFormulario.grauRisco}
            onChange={atualizarSecao('grauRisco')}
          />
        );
      case 12:
        return (
          <EtapaConclusao
            dados={dadosFormulario.conclusao}
            onChange={atualizarSecao('conclusao')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <IonPage className="formulario-page">
      <IonContent scrollY className="formulario-content" ref={contentRef} scrollEvents={true}>
        <div className="formulario-topo">
          <header className="formulario-header">
            <button
              type="button"
              className="formulario-header__btn-fechar"
              onClick={handleFechar}
              aria-label="Fechar formulário e voltar para Home"
              title="Fechar"
            >
              <CloseIcon />
            </button>
            <h1 className="formulario-header__titulo">Formulario</h1>
          </header>

          <StepIndicator
            etapaAtual={etapaAtual}
            totalEtapas={totalEtapas}
            tituloEtapa={infoEtapaAtual?.titulo}
            concluido={showConcluido}
          />
        </div>

        <section className="formulario-corpo">
          <div className="formulario-corpo__inner">
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Loading label="Carregando dados..." size="md" color="orange" />
              </div>
            ) : (
              renderEtapa()
            )}
          </div>
        </section>

        <footer className="formulario-rodape">
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<BackIcon />}
            className="formulario-rodape__btn"
            onClick={handleVoltar}
            disabled={showConcluido}
          >
            {estaNaPrimeiraEtapa ? 'Fechar' : 'Voltar'}
          </Button>

          <Button
            variant="primary"
            size="lg"
            rightIcon={<NextIcon />}
            className="formulario-rodape__btn"
            onClick={handleProxima}
            loading={isSalvando}
            disabled={showConcluido}
          >
            {estaNaUltimaEtapa ? 'Concluir' : 'Próxima etapa'}
          </Button>
        </footer>

        {showConcluido && (
          <FormularioConcluido 
            onVisualizarDocumento={handleVisualizarDocumento} 
            onVoltarHome={handleVoltarHomeConcluido}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default FormularioVistoria;
