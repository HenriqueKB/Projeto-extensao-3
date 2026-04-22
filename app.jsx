// ============================================================
// REACT: importamos os "hooks" que vamos usar
// useState = guarda estado (dados que mudam na tela)
// ============================================================
import { useState } from "react";

// ============================================================
// COMPONENTE RAIZ - é o ponto de entrada da aplicação
// Todo componente React é uma função que retorna JSX (HTML+JS)
// ============================================================
export default function App() {
  // useState retorna [valorAtual, funçãoParaMudar]
  // "dashboard" é o valor inicial da aba selecionada
  const [abaAtiva, setAbaAtiva] = useState("dashboard");

  // Array de objetos descrevendo cada aba (dados separados da UI)
  const abas = [
    { id: "dashboard",   label: "Dashboard",   icone: "◈" },
    { id: "prontuario",  label: "Prontuário",  icone: "✦" },
    { id: "financeiro",  label: "Financeiro",  icone: "◆" },
  ];

  return (
    // Fragment <> </> evita div desnecessária no DOM
    <>
      {/* Barra de navegação com as abas */}
      <nav style={estilos.nav}>
        <div style={estilos.logoArea}>
          <span style={estilos.logoMarca}>✚</span>
          <span style={estilos.logoTexto}>ClínicaOS</span>
        </div>

        {/* .map() transforma um array em elementos JSX */}
        <div style={estilos.abas}>
          {abas.map((aba) => (
            // key é obrigatório quando renderizamos listas
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}   // atualiza o estado ao clicar
              style={{
                ...estilos.botaoAba,
                // spread condicional: adiciona estilo extra se for a aba ativa
                ...(abaAtiva === aba.id ? estilos.botaoAbaAtivo : {}),
              }}
            >
              <span style={{ fontSize: 12 }}>{aba.icone}</span>
              {aba.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Conteúdo principal - renderização condicional com && */}
      <main style={estilos.main}>
        {abaAtiva === "dashboard"  && <Dashboard />}
        {abaAtiva === "prontuario" && <Prontuario />}
        {abaAtiva === "financeiro" && <Financeiro />}
      </main>
    </>
  );
}

// ============================================================
// COMPONENTE: Dashboard
// Componentes são funções independentes e reutilizáveis
// ============================================================
function Dashboard() {
  // Dados estáticos (em produção viriam de uma API)
  const metricas = [
    { label: "Pacientes hoje",    valor: 12,   cor: "#0F766E" },
    { label: "Consultas pendentes", valor: 4,  cor: "#B45309" },
    { label: "Faturamento mês",   valor: "R$ 18.400", cor: "#1D4ED8" },
    { label: "Taxa de retorno",   valor: "84%", cor: "#7C3AED" },
  ];

  const proximasConsultas = [
    { hora: "09:00", paciente: "Ana Souza",    convenio: "Unimed",    status: "Confirmado" },
    { hora: "10:30", paciente: "Carlos Lima",  convenio: "Bradesco",  status: "Aguardando" },
    { hora: "11:00", paciente: "Marta Dias",   convenio: "Particular",status: "Confirmado" },
    { hora: "14:00", paciente: "João Neto",    convenio: "SulAmérica",status: "Aguardando" },
  ];

  return (
    <section>
      <Cabecalho titulo="Dashboard" subtitulo="Visão geral do dia" />

      {/* Grade de métricas usando CSS Grid */}
      <div style={estilos.grade4}>
        {metricas.map((m) => (
          <CartaoMetrica key={m.label} {...m} />  // spread props: passa todas as propriedades
        ))}
      </div>

      <h2 style={estilos.tituloSecao}>Próximas Consultas</h2>
      <div style={estilos.cartao}>
        <table style={estilos.tabela}>
          <thead>
            <tr>
              {["Horário", "Paciente", "Convênio", "Status"].map((col) => (
                <th key={col} style={estilos.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {proximasConsultas.map((c) => (
              <tr key={c.hora + c.paciente} style={estilos.tr}>
                <td style={estilos.td}><Badge texto={c.hora} cor="#E0F2FE" txtCor="#075985" /></td>
                <td style={estilos.td}>{c.paciente}</td>
                <td style={estilos.td}>{c.convenio}</td>
                <td style={estilos.td}>
                  <Badge
                    texto={c.status}
                    cor={c.status === "Confirmado" ? "#DCFCE7" : "#FEF9C3"}
                    txtCor={c.status === "Confirmado" ? "#166534" : "#854D0E"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ============================================================
// COMPONENTE: Prontuário
// Demonstra formulário controlado com useState
// ============================================================
function Prontuario() {
  // Estado do campo de busca — formulário controlado
  const [busca, setBusca] = useState("");

  const pacientes = [
    { id: "P001", nome: "Ana Souza",    idade: 32, ultima: "10/04/2026", diagnostico: "Hipertensão" },
    { id: "P002", nome: "Carlos Lima",  idade: 45, ultima: "08/04/2026", diagnostico: "Diabetes T2" },
    { id: "P003", nome: "Marta Dias",   idade: 28, ultima: "01/04/2026", diagnostico: "Ansiedade" },
    { id: "P004", nome: "João Neto",    idade: 60, ultima: "28/03/2026", diagnostico: "Artrite" },
    { id: "P005", nome: "Luisa Ferreira", idade: 37, ultima: "15/03/2026", diagnostico: "Enxaqueca" },
  ];

  // .filter() filtra o array baseado no texto digitado
  // toLowerCase() torna a busca insensível a maiúsculas
  const filtrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <section>
      <Cabecalho titulo="Prontuário" subtitulo="Histórico e fichas dos pacientes" />

      {/* Formulário controlado: o estado React controla o valor do input */}
      <div style={estilos.barraBusca}>
        <input
          type="search"
          placeholder="Buscar paciente..."
          value={busca}                           // valor vem do estado
          onChange={(e) => setBusca(e.target.value)} // atualiza estado a cada tecla
          style={estilos.inputBusca}
        />
        <span style={estilos.resultados}>{filtrados.length} paciente(s)</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Renderização condicional com ternário */}
        {filtrados.length === 0 ? (
          <p style={{ color: "#6B7280", textAlign: "center", padding: "2rem" }}>
            Nenhum paciente encontrado.
          </p>
        ) : (
          filtrados.map((p) => <CartaoPaciente key={p.id} paciente={p} />)
        )}
      </div>
    </section>
  );
}

// ============================================================
// COMPONENTE: CartaoPaciente
// Recebe "props" (propriedades) do componente pai
// Props são como parâmetros de função — só leitura!
// ============================================================
function CartaoPaciente({ paciente }) {  // desestruturação de props
  // Estado local: apenas este cartão sabe se está expandido
  const [expandido, setExpandido] = useState(false);

  const iniciais = paciente.nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div style={{ ...estilos.cartao, cursor: "pointer" }} onClick={() => setExpandido(!expandido)}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Avatar com iniciais */}
        <div style={estilos.avatar}>{iniciais}</div>
        <div style={{ flex: 1 }}>
          <p style={estilos.nomePaciente}>{paciente.nome}</p>
          <p style={estilos.infoPaciente}>{paciente.idade} anos · Última consulta: {paciente.ultima}</p>
        </div>
        <Badge texto={paciente.diagnostico} cor="#EDE9FE" txtCor="#5B21B6" />
        <span style={{ color: "#9CA3AF", fontSize: 12 }}>{expandido ? "▲" : "▼"}</span>
      </div>

      {/* Renderiza detalhes só se expandido — short-circuit evaluation */}
      {expandido && (
        <div style={estilos.detalhes}>
          <div style={estilos.grade2}>
            <Campo label="ID" valor={paciente.id} />
            <Campo label="Diagnóstico" valor={paciente.diagnostico} />
            <Campo label="Última Consulta" valor={paciente.ultima} />
            <Campo label="Idade" valor={`${paciente.idade} anos`} />
          </div>
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 13, color: "#6B7280" }}>Anamnese</p>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
              Paciente relata sintomas há aproximadamente 6 meses. Sem alergias conhecidas.
              Em uso de medicação contínua. Retorno marcado em 30 dias.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTE: Financeiro
// Demonstra useState com objetos e arrays mais complexos
// ============================================================
function Financeiro() {
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const lancamentos = [
    { id: 1, descricao: "Consulta - Ana Souza",    valor: 350,  tipo: "entrada", data: "10/04" },
    { id: 2, descricao: "Consulta - Carlos Lima",  valor: 280,  tipo: "entrada", data: "08/04" },
    { id: 3, descricao: "Aluguel consultório",     valor: -2800, tipo: "saida",  data: "05/04" },
    { id: 4, descricao: "Consulta - Marta Dias",   valor: 350,  tipo: "entrada", data: "01/04" },
    { id: 5, descricao: "Material médico",         valor: -430, tipo: "saida",   data: "28/03" },
    { id: 6, descricao: "Consulta - João Neto",    valor: 350,  tipo: "entrada", data: "28/03" },
    { id: 7, descricao: "Software gestão",         valor: -180, tipo: "saida",   data: "01/04" },
  ];

  // .reduce() calcula totais acumulando valores
  const totalEntradas = lancamentos.filter(l => l.tipo === "entrada").reduce((acc, l) => acc + l.valor, 0);
  const totalSaidas   = lancamentos.filter(l => l.tipo === "saida").reduce((acc, l) => acc + Math.abs(l.valor), 0);
  const saldo         = totalEntradas - totalSaidas;

  const filtrados = filtroTipo === "todos"
    ? lancamentos
    : lancamentos.filter((l) => l.tipo === filtroTipo);

  const botoesFiltro = [
    { id: "todos",   label: "Todos" },
    { id: "entrada", label: "Entradas" },
    { id: "saida",   label: "Saídas" },
  ];

  return (
    <section>
      <Cabecalho titulo="Financeiro" subtitulo="Controle de receitas e despesas" />

      <div style={estilos.grade3}>
        <CartaoMetrica label="Total Entradas" valor={`R$ ${totalEntradas.toLocaleString("pt-BR")}`} cor="#166534" />
        <CartaoMetrica label="Total Saídas"   valor={`R$ ${totalSaidas.toLocaleString("pt-BR")}`}  cor="#991B1B" />
        <CartaoMetrica label="Saldo do Mês"   valor={`R$ ${saldo.toLocaleString("pt-BR")}`}        cor="#1D4ED8" />
      </div>

      {/* Filtros — estado controla qual botão está ativo */}
      <div style={estilos.filtros}>
        {botoesFiltro.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltroTipo(f.id)}
            style={{
              ...estilos.botaoFiltro,
              ...(filtroTipo === f.id ? estilos.botaoFiltroAtivo : {}),
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={estilos.cartao}>
        {filtrados.map((l) => (
          <div key={l.id} style={estilos.linhaLancamento}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: l.tipo === "entrada" ? "#16A34A" : "#DC2626",
              flexShrink: 0,
            }} />
            <span style={{ flex: 1, fontSize: 14, color: "#374151" }}>{l.descricao}</span>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>{l.data}</span>
            <span style={{
              fontSize: 14, fontWeight: 600, minWidth: 80, textAlign: "right",
              color: l.tipo === "entrada" ? "#16A34A" : "#DC2626",
            }}>
              {l.tipo === "entrada" ? "+" : "-"} R$ {Math.abs(l.valor).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// COMPONENTES MENORES (reutilizáveis em vários lugares)
// Isso é o poder do React: componente = bloco de LEGO
// ============================================================

// Cabeçalho de seção
function Cabecalho({ titulo, subtitulo }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h1 style={estilos.titulo}>{titulo}</h1>
      <p style={estilos.subtitulo}>{subtitulo}</p>
    </div>
  );
}

// Cartão de métrica numérica
function CartaoMetrica({ label, valor, cor }) {
  return (
    <div style={estilos.cartaoMetrica}>
      <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: cor ?? "#111827", margin: "4px 0 0" }}>{valor}</p>
    </div>
  );
}

// Badge colorido (pastilha de status/categoria)
function Badge({ texto, cor, txtCor }) {
  return (
    <span style={{ background: cor, color: txtCor, fontSize: 11, fontWeight: 600,
      padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {texto}
    </span>
  );
}

// Campo label + valor (usado em detalhes do prontuário)
function Campo({ label, valor }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>{label}</p>
      <p style={{ fontSize: 14, color: "#111827", margin: "2px 0 0", fontWeight: 500 }}>{valor}</p>
    </div>
  );
}

// ============================================================
// ESTILOS — objeto JS em vez de CSS externo
// Em React, "style" recebe um objeto (camelCase, não kebab-case)
// Ex: "background-color" → "backgroundColor"
// ============================================================
const TEAL = "#0F766E";
const TEAL_CLARO = "#F0FDFA";

const estilos = {
  nav: {
    display: "flex", alignItems: "center", gap: 24,
    padding: "0 24px", height: 56, background: "#fff",
    borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10,
  },
  logoArea: { display: "flex", alignItems: "center", gap: 8 },
  logoMarca: { fontSize: 18, color: TEAL },
  logoTexto: { fontSize: 15, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" },
  abas: { display: "flex", gap: 2 },
  botaoAba: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "6px 14px", border: "none", background: "transparent",
    borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#6B7280",
    fontWeight: 500, transition: "all 0.15s",
  },
  botaoAbaAtivo: {
    background: TEAL_CLARO, color: TEAL,
  },
  main: { padding: "28px 32px", maxWidth: 960, margin: "0 auto" },
  titulo: { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 },
  subtitulo: { fontSize: 14, color: "#6B7280", margin: "4px 0 0" },
  tituloSecao: { fontSize: 15, fontWeight: 600, color: "#374151", margin: "28px 0 12px" },
  grade4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  grade3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 },
  grade2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  cartaoMetrica: {
    background: "#F9FAFB", borderRadius: 10, padding: "14px 16px",
    border: "1px solid #F3F4F6",
  },
  cartao: {
    background: "#fff", borderRadius: 12, padding: "16px 20px",
    border: "1px solid #E5E7EB",
  },
  tabela: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280",
    padding: "8px 12px", borderBottom: "1px solid #F3F4F6", textTransform: "uppercase" },
  td: { fontSize: 14, color: "#374151", padding: "10px 12px" },
  tr: { borderBottom: "1px solid #F9FAFB" },
  barraBusca: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  inputBusca: {
    flex: 1, padding: "9px 14px", border: "1px solid #E5E7EB",
    borderRadius: 8, fontSize: 14, outline: "none",
  },
  resultados: { fontSize: 13, color: "#9CA3AF" },
  avatar: {
    width: 40, height: 40, borderRadius: "50%", background: TEAL_CLARO,
    color: TEAL, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  nomePaciente: { fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 },
  infoPaciente: { fontSize: 12, color: "#9CA3AF", margin: "2px 0 0" },
  detalhes: {
    marginTop: 16, paddingTop: 16, borderTop: "1px solid #F3F4F6",
  },
  filtros: { display: "flex", gap: 8, marginBottom: 16 },
  botaoFiltro: {
    padding: "6px 14px", borderRadius: 8, border: "1px solid #E5E7EB",
    background: "#fff", fontSize: 13, cursor: "pointer", color: "#6B7280",
  },
  botaoFiltroAtivo: {
    background: TEAL_CLARO, borderColor: TEAL, color: TEAL, fontWeight: 600,
  },
  linhaLancamento: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 0", borderBottom: "1px solid #F9FAFB",
  },
};
