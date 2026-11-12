import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import FormularioVistoria from './pages/FormularioVistoria';
import VisualizacaoVistoria from './pages/VisualizacaoVistoria/VisualizacaoVistoria';
import { AuthProvider, useAuthStore } from './store/useAuthStore';
import { iniciarSincronizacao } from './services';
import { ReactNode, useEffect } from 'react';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '@ionic/react/css/palettes/dark.system.css';

import './theme/variables.css';

/**
 * Configuração global do Ionic React.
 * Inicializa os estilos, animações e comportamentos padrão da biblioteca.
 * Deve ser chamado UMA ÚNICA VEZ no ponto de entrada do app.
 *
 * @see https://ionicframework.com/docs/react/your-first-app#setup-ionic-react
 */
setupIonicReact();

interface RotaProtegidaProps {
  children: ReactNode;
}

/**
 * Wrapper para rotas PRIVADAS do app.
 *
 * Comportamento:
 * - SE `isAutenticado === true` → renderiza a página filha normalmente
 * - SE `isAutenticado === false` → REDIRECIONA para `/login` usando `replace`
 *   (apaga a rota privada do histórico, impedindo "voltar" após logout)
 *
 * Usado atualmente em `/home`, e deve ser adicionado em TODAS as rotas que
 * exigem login (Vistorias, NovaVistoria, DetalhesVistoria, etc).
 *
 * @example
 * <Route
 *   path="/vistorias"
 *   element={
 *     <RotaProtegida>
 *       <Vistorias />
 *     </RotaProtegida>
 *   }
 * />
 */
const RotaProtegida = ({ children }: RotaProtegidaProps) => {
  const { isAutenticado } = useAuthStore();
  return isAutenticado ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * Wrapper para rotas PÚBLICAS do app (ex: Login, Recuperar Senha, Cadastro).
 *
 * Comportamento INVERSO à RotaProtegida:
 * - SE `isAutenticado === false` → renderiza a página normalmente (usuário ainda não logou)
 * - SE `isAutenticado === true` → REDIRECIONA para `/home` usando `replace`
 *   (evita que um usuário já logado fique vendo a tela de login sem necessidade)
 *
 * Motivação: após logar, se o usuário digitar `/login` manualmente na URL ou
 * apertar "voltar" no navegador, ele NÃO vê mais a tela de autenticação —
 * permanece na Home até clicar em "Sair".
 */
const RotaPublica = ({ children }: RotaProtegidaProps) => {
  const { isAutenticado } = useAuthStore();
  return !isAutenticado ? <>{children}</> : <Navigate to="/home" replace />;
};

/**
 * Componente interno que reúne TODAS as rotas do app.
 *
 * Mapa de rotas ATUAL:
 * | Caminho   | Acesso        | Página       |
 * |-----------|---------------|--------------|
 * | `/login`  | Pública (bloqueia se logado) | Login  |
 * | `/home`   | Protegida     | Home         |
 * | `/`       | Redirecionador inteligente  | RedirectorInicial |
 *
 * Para adicionar NOVA rota (ex: "/vistorias"):
 * 1. Crie a página em `src/pages/Vistorias/Vistorias.tsx`
 * 2. Importe aqui
 * 3. Adicione um `<Route>` envolvido em `<RotaProtegida>` (se exigir login)
 */
const AppRotas = () => {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route
          path="/login"
          element={
            <RotaPublica>
              <Login />
            </RotaPublica>
          }
        />
        <Route
          path="/home"
          element={
            <RotaProtegida>
              <Home />
            </RotaProtegida>
          }
        />
        <Route
          path="/formulario-vistoria/:id?"
          element={
            <RotaProtegida>
              <FormularioVistoria />
            </RotaProtegida>
          }
        />
        <Route
          path="/visualizacao-vistoria/:id"
          element={
            <RotaProtegida>
              <VisualizacaoVistoria />
            </RotaProtegida>
          }
        />
        <Route
          path="/"
          element={
            <RedirectorInicial />
          }
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

/**
 * Redirecionador inteligente para a rota raiz (`/`).
 *
 * Encapsula o uso de `useAuthStore()` fora do JSX inline do `<Route>` para
 * clareza e legibilidade — decide a página inicial automaticamente:
 * - Usuário JÁ AUTENTICADO → Home
 * - Usuário NÃO AUTENTICADO → Login
 *
 * Sempre usa `replace` para não deixar a rota `/` no histórico de navegação.
 */
const RedirectorInicial = () => {
  const { isAutenticado } = useAuthStore();
  return <Navigate to={isAutenticado ? '/home' : '/login'} replace />;
};

/**
 * Liga a sincronização automática da fila offline enquanto houver um
 * usuário logado, e a desliga no logout (a API exige o token do usuário).
 */
const SincronizacaoAutomatica = () => {
  const { isAutenticado } = useAuthStore();
  useEffect(() => {
    if (!isAutenticado) return;
    return iniciarSincronizacao();
  }, [isAutenticado]);
  return null;
};

/**
 * Componente RAIZ de todo o aplicativo React + Ionic.
 *
 * Ordem dos wrappers (de FORA pra DENTRO):
 * 1. `<IonApp>`          : container principal do Ionic (vida útil do app, viewport, estilos base)
 * 2.   `<AuthProvider>`  : disponibiliza o estado de autenticação global via Context API
 * 3.     `<AppRotas />`  : declara e renderiza as rotas
 *
 * ⚠️ A ORDEM IMPORTA: `AuthProvider` DEVE ficar DENTRO de `<IonApp>` e FORA do uso de `useAuthStore`
 * (que acontece dentro de RotaProtegida / RotaPublica / RedirectorInicial).
 */
const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <SincronizacaoAutomatica />
      <AppRotas />
    </AuthProvider>
  </IonApp>
);

export default App;
