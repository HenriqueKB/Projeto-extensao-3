const { useState, useEffect } = React;

const API_URL = 'https://rickandmortyapi.com/api/character';

function App() {
  const [personagens, setPersonagens] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [textoBusca, setTextoBusca] = useState('');
  const [detalhePersonagem, setDetalhePersonagem] = useState(null);

  // Busca os personagens quando a páginaAtual muda
  useEffect(() => {
    async function buscarPersonagensAsync() {
      try {
        const response = await fetch(`${API_URL}?page=${paginaAtual}`);
        if (!response.ok) throw new Error('Erro HTTP: ' + response.status);
        
        const data = await response.json();
        setPersonagens(data.results);
        setTotalPaginas(data.info.pages);
      } catch (error) {
        console.error('Falha ao buscar personagens:', error);
      }
    }
    buscarPersonagensAsync();
  }, [paginaAtual]);

  // Filtro
  const personagensFiltrados = personagens.filter(personagem =>
    personagem.name.toLowerCase().includes(textoBusca.toLowerCase())
  );

  // Função de detalhes
  const mostrarDetalhes = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar detalhes');
        const personagem = await response.json();
        setDetalhePersonagem(personagem);
    } catch (error) {
        console.error('Falha ao carregar detalhes:', error);
    }
  };

  // Navegação
  const mudarPagina = (direcao) => {
    if (direcao === 'anterior' && paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    } else if (direcao === 'proxima' && paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  return (
    <div>
      {!detalhePersonagem ? (
        <div id="lista-view">
          <h1 style={{textAlign: 'center'}}>Personagens de Rick and Morty (Em React)</h1>

          <div className="search-container">
            <input 
              type="text" 
              id="busca"
              placeholder="Buscar personagem..."
              value={textoBusca}
              onChange={(e) => setTextoBusca(e.target.value)} 
            />
          </div>

          <main id="personagens-container" className="container">
            {personagensFiltrados.map(personagem => (
              <article 
                key={personagem.id} 
                className="card" 
                onClick={() => mostrarDetalhes(personagem.id)}
              > 
                <img src={personagem.image} alt={personagem.name} />
                <div className="card-info">
                  <h3>{personagem.name}</h3>
                  <p>Status: {personagem.status}</p>
                  <p>Espécie: {personagem.species}</p>
                </div>
              </article>
            ))}
          </main>
          
          <div className="navegacao">
            <button className="btn-nav" onClick={() => mudarPagina('anterior')} disabled={paginaAtual === 1}>
              &lt;--
            </button>
            <span id="pagina-atual">Página {paginaAtual}</span>
            <button className="btn-nav" onClick={() => mudarPagina('proxima')} disabled={paginaAtual === totalPaginas}>
              --&gt;
            </button>
          </div>
        </div>
      ) : (
        <div id="detalhe-container" className="container detalhe-view" style={{marginTop: '20px'}}>
           <article className="card" style={{width: '400px', cursor: 'default', margin: '0 auto'}}>
              <button className="btn-nav" onClick={() => setDetalhePersonagem(null)} style={{margin: '15px'}}>
                &lt;-- Voltar
              </button>
              <img src={detalhePersonagem.image} alt={detalhePersonagem.name} />
              <div className="card-info">
                  <h2>{detalhePersonagem.name}</h2>
                  <p><strong>Status:</strong> {detalhePersonagem.status}</p>
                  <p><strong>Espécie:</strong> {detalhePersonagem.species}</p>
                  <p><strong>Gênero:</strong> {detalhePersonagem.gender}</p>
                  <p><strong>Origem:</strong> {detalhePersonagem.origin.name}</p>
                  <p><strong>Localização Atual:</strong> {detalhePersonagem.location.name}</p>
              </div>
          </article>
        </div>
      )}
    </div>
  );
}

// Renderizando o App dentro da div "root"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);