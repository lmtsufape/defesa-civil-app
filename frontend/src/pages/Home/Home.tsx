import { useCallback, useEffect, useMemo, useState } from 'react';
import { IonContent, IonPage, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import {
  Button,
  ConfirmModal,
  FilterTabs,
  Loading,
  SearchBar,
  StatsBadge,
  UserHeader,
  VistoriaCard,
} from '../../components';
import { useAuthStore } from '../../store/useAuthStore';
import { Vistoria, ContagemVistorias } from '../../domain/entities';
import {
  buscarVistorias,
  contarVistoriasPorStatus,
  filtrarVistoriasPorStatus,
  FiltroStatus,
  ListarVistoriasUseCase,
} from '../../domain/useCases';
import { vistoriaService } from '../../services';
import { syncEngine } from '../../sync';
import './Home.css';

const PlusIcon = () => (
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
    <path d="M12 5v14" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Home = () => {
  const router = useIonRouter();
  const { usuario, logout, isLoading: isLoggingOut } = useAuthStore();

  const listarUseCase = useMemo(
    () => new ListarVistoriasUseCase(vistoriaService),
    []
  );

  const [todasVistorias, setTodasVistorias] = useState<Vistoria[]>([]);
  const [contagem, setContagem] = useState<ContagemVistorias>({
    pendentes: 0,
    concluidas: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<FiltroStatus>('TODOS');
  const [modalLogoutAberto, setModalLogoutAberto] = useState(false);

  const carregarDados = useCallback(async () => {
    if (!usuario?.id) return; // Evita carregar se não houver usuário
    setIsLoading(true);
    try {
      const lista = await listarUseCase.executar(usuario.id);
      setTodasVistorias(lista);
      setContagem(contarVistoriasPorStatus(lista));
    } catch (e) {
      console.warn('Não foi possível carregar as vistorias.', e);
    } finally {
      setIsLoading(false);
    }
  }, [listarUseCase, usuario?.id]);

  // Carrega os dados IMEDIATAMENTE quando o usuário é detectado
  useEffect(() => {
    if (usuario?.id) {
      carregarDados();
    }
  }, [usuario?.id, carregarDados]);

  // Toda vez que a Home aparece (inclusive ao voltar do formulário).
  useIonViewWillEnter(() => {
    carregarDados();
  }, [carregarDados]);

  // Recarrega a lista quando a fila offline consegue enviar algo.
  useEffect(
    () =>
      syncEngine.assinar((resultado) => {
        if (resultado.sucessos > 0) carregarDados();
      }),
    [carregarDados]
  );

  const vistoriasFiltradas = useMemo(() => {
    const porStatus = filtrarVistoriasPorStatus(todasVistorias, filtro);
    return buscarVistorias(porStatus, busca);
  }, [todasVistorias, filtro, busca]);

  const handleLogout = async () => {
    setModalLogoutAberto(false);
    await logout();
    router.push('/login', 'root', 'replace');
  };

  const handleAbrirModalLogout = () => setModalLogoutAberto(true);
  const handleFecharModalLogout = () => setModalLogoutAberto(false);

  const handleNovaVistoria = () => {
    router.push('/formulario-vistoria', 'forward', 'push');
  };

  // Navega para a tela de continuação/edição da vistoria selecionada.
  const handleContinuar = (v: Vistoria) => {
    router.push(`/formulario-vistoria/${v.id}`, 'forward', 'push');
  };

  const handleVerDetalhes = (v: Vistoria) => {
    router.push(`/visualizacao-vistoria/${v.id}`, 'forward', 'push');
  };

  return (
    <IonPage className="home-page">
      <IonContent scrollY className="home-content">
        <section className="home-topo">
          <div className="home-topo__linha-superior">
            <UserHeader nome={usuario?.nome || 'Agente'} />
            <button
              type="button"
              className="home-topo__btn-logout"
              onClick={handleAbrirModalLogout}
              aria-label="Sair"
              title="Sair"
            >
              <LogoutIcon />
            </button>
          </div>

          <div className="home-topo__corpo">
            <div className="home-topo__info">
              <h1 className="home-topo__titulo">Minhas Vistorias</h1>
              <p className="home-topo__sub">
                Acompanhe seus atendimentos e continue de onde parou
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusIcon />}
              className="home-topo__btn-nova"
              onClick={handleNovaVistoria}
            >
              Nova Vistoria
            </Button>
          </div>

          <StatsBadge contagem={contagem} />
        </section>

        <section className="home-lista">
          <SearchBar
            value={busca}
            onChange={setBusca}
            placeholder="Buscar por nome ou protocolo"
          />

          <FilterTabs filtroAtivo={filtro} onChange={setFiltro} />

          {isLoading ? (
            <div className="home-lista__loading">
              <Loading label="Carregando vistorias..." size="md" color="orange" />
            </div>
          ) : vistoriasFiltradas.length === 0 ? (
            <div className="home-lista__vazia">
              <p className="home-lista__vazia-msg">
                Nenhuma vistoria encontrada para os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="home-lista__cards">
              {vistoriasFiltradas.map((v) => (
                <VistoriaCard
                  key={v.id}
                  vistoria={v}
                  onContinuar={handleContinuar}
                  onVerDetalhes={handleVerDetalhes}
                />
              ))}
            </div>
          )}
        </section>

        {(isLoading || isLoggingOut) && (
          <Loading
            variant="overlay"
            label={isLoggingOut ? 'Saindo...' : 'Carregando...'}
            size="md"
            color="orange"
          />
        )}

        <ConfirmModal
          isOpen={modalLogoutAberto}
          title="Deseja realmente sair?"
          message="Você será redirecionado para a tela de login e precisará informar suas credenciais novamente para acessar o sistema."
          confirmLabel="Sair"
          cancelLabel="Cancelar"
          confirmVariant="danger"
          onConfirm={handleLogout}
          onCancel={handleFecharModalLogout}
          isLoading={isLoggingOut}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
