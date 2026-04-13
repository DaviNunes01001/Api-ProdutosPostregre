// ========================================
// VARIÁVEIS GLOBAIS
// ========================================

let produtosEmEdicao = null; // Guarda o ID do produtos que está sendo editado (null = modo criação)

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Mostra uma mensagem modal
function mostrarMensagem(mensagem, tipo = 'info') { // Recebe texto e tipo (info, sucesso, erro)
    const modal = document.getElementById('modalMessage'); // Pega o elemento do modal
    const modalText = document.getElementById('modalText'); // Pega o texto do modal
    
    modalText.textContent = mensagem; // Define a mensagem
    modal.style.display = 'flex'; // Mostra o modal
    
    // Define a cor baseado no tipo
    if (tipo === 'sucesso') {
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Cor para sucesso
    } else if (tipo === 'erro') {
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Cor para erro (igual ao sucesso aqui)
    }
}

// Fecha o modal de mensagens
function fecharModal() {
    document.getElementById('modalMessage').style.display = 'none'; // Esconde o modal
}

// Limpa o formulário
function limparFormulario() {
    document.getElementById('produtForm').reset(); // Reseta todos os campos do form
    produtosEmEdicao = null; // Volta para modo criação
    document.querySelector('.form-section h2').textContent = 'Adicionar ou Editar Produto'; // Atualiza título
}

// Formata Preço para exibição
function formatarPreco(preco) {
    if (!preco) return ''; // Se vazio, retorna string vazia
    // Formata o preço com 2 casas decimais
    return `R$ ${parseFloat(preco).toFixed(2).replace('.', ',')}`; // Aplica formatação
}


// ========================================
// OPERAÇÕES COM A API
// ========================================

// Busca todos os produtoss
async function carregarProdutos() {
    const loadingMessage = document.getElementById('loadingMessage'); // Elemento de loading
    const emptyMessage = document.getElementById('emptyMessage'); // Mensagem de vazio
    const produtsList = document.getElementById('produtsList'); // Container da tabela
    
    loadingMessage.style.display = 'block'; // Mostra loading
    produtsList.innerHTML = ''; // Limpa lista
    
    try {
        const resposta = await fetch('/produtos'); // Faz requisição GET
        
        if (!resposta.ok) { // Se erro HTTP
            throw new Error('Erro ao buscar Produtos'); // Lança erro
        }
        
        const Produtos = await resposta.json(); // Converte resposta para JSON
        loadingMessage.style.display = 'none'; // Esconde loading
        
        if (Produtos.length === 0) { // Se lista vazia
            emptyMessage.style.display = 'block'; // Mostra mensagem
            produtsList.innerHTML = ''; // Garante lista vazia
        } else {
            emptyMessage.style.display = 'none'; // Esconde mensagem
            exibirTabela(Produtos); // Mostra tabela
        }
    } catch (erro) {
        loadingMessage.style.display = 'none'; // Esconde loading
        emptyMessage.style.display = 'block'; // Mostra erro
        console.error('Erro:', erro); // Log no console
        mostrarMensagem('Erro ao carregegar os Produtos. Tente novamente.', 'erro'); // Feedback pro usuário
    }
}

// Cria um novo produtos
async function criarProduto(dados) {
    try {
        const resposta = await fetch('/produtos', { // POST para API
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Diz que envia JSON
            },
            body: JSON.stringify(dados) // Converte objeto para JSON
        });
        
        if (!resposta.ok) { // Se erro HTTP
            const erro = await resposta.json(); // Pega erro da API
            throw new Error(erro.error || 'Erro ao criar produto'); // Lança erro
        }
        
        const novoprodutos = await resposta.json(); // Recebe produtos criado
        mostrarMensagem('Produto cadastrado com sucesso!', 'sucesso'); // Feedback
        limparFormulario(); // Limpa form
        carregarProdutos(); // Atualiza lista
        
    } catch (erro) {
        console.error('Erro:', erro); // Log
        mostrarMensagem('Erro: ' + erro.message, 'erro'); // Feedback
    }
}

// Atualiza um produtos
async function atualizarProdutos(id, dados) {
    try {
        const resposta = await fetch(`/produtos/${id}`, { // PUT com ID
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || 'Erro ao atualizar produtos');
        }
        
        const produtoAtualizado = await resposta.json(); // produtos atualizado
        mostrarMensagem('produtos atualizado com sucesso!', 'sucesso');
        limparFormulario();
        carregarProdutos();
        
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarMensagem('Erro: ' + erro.message, 'erro');
    }
}

// Deleta um produtos
async function deletarprodutos(id) {
    if (!confirm('Tem certeza que deseja deletar este Produto?')) { // Confirmação
        return; // Cancela se usuário negar
    }
    
    try {
        const resposta = await fetch(`/produtos/${id}`, { // DELETE
            method: 'DELETE'
        });
        
        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.error || 'Erro ao deletar produtos');
        }
        
        mostrarMensagem('produtos removido com sucesso!', 'sucesso');
        carregarProdutos(); // Atualiza lista
        
    } catch (erro) {
        console.error('Erro:', erro);
        mostrarMensagem('Erro: ' + erro.message, 'erro');
    }
}

// ========================================
// EXIBIÇÃO DE DADOS
// ========================================

// Exibe a tabela de produtoss
function exibirTabela(produtoss) {
    const produtsList = document.getElementById('produtsList'); // Container
    
    let html = ` // Inicia HTML da tabela
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Categoria</th>
                    <th></th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    produtoss.forEach(produtos => { // Percorre lista
        html += `
            <tr>
                <td>#${produtos.id}</td> <!-- ID -->
                <td>${produtos.nome}</td> <!-- Nome -->
                <td>${formatarPreco(produtos.preco)}</td> <!-- preco -->
                <td>${produtos.estoque}</td> <!-- estoque -->
                <td>${produtos.categoria}</td> <!-- categoria -->
                <td class="acoes">
                    <button class="btn btn-edit" onclick="editarprodutos(${produtos.id}, '${produtos.nome}', '${produtos.preco}', '${produtos.estoque}', '${produtos.categoria}')">✏️ Editar</button> <!-- Botão editar -->
                    <button class="btn btn-danger" onclick="deletarprodutos(${produtos.id})">🗑️ Deletar</button> <!-- Botão deletar -->
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    produtsList.innerHTML = html; // Injeta HTML na página
}

// Carrega os dados do produtos no formulário para edição
function editarprodutos(id, nome, preco, estoque, categoria) {
    produtosEmEdicao = id; // Define que está editando
    
    document.getElementById('nome').value = nome; // Preenche nome
    document.getElementById('preco').value = preco; // Preenche Preço
    document.getElementById('estoque').value = estoque; // Preenche Estoque
    document.getElementById('categoria').value = categoria; // Preenche Categoria
    
    document.querySelector('.form-section h2').textContent = `Editando produtos #${id}`; // Atualiza título
    
    // Scroll até o formulário
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' }); // Leva usuário até form
}

// ========================================
// BUSCA E FILTRO
// ========================================

// Busca produtoss no backend
async function buscarprodutoss(tipo, valor) {
    const loadingMessage = document.getElementById('loadingMessage');
    const emptyMessage = document.getElementById('emptyMessage');
    const produtsList = document.getElementById('produtsList');
   
    loadingMessage.style.display = 'block'; // Mostra loading
    produtsList.innerHTML = ''; // Limpa lista
   
    try {
        let url = ''; // URL dinâmica

        if (tipo === 'nome') {
            url = `/produtos/nome/${encodeURIComponent(valor)}`; // Busca por nome (encode evita erro em URL)
        } else if (tipo === 'id') {
            url = `/produtos/${valor}`; // Busca por ID
        } else if (tipo === 'categoria') {
            url = `/produtos/categoria/${encodeURIComponent(valor)}`; // Busca por categoria
        }

        console.log(`🔍 Buscando por ${tipo}: ${valor}`);
        console.log(`📍 URL: ${url}`);

        const resposta = await fetch(url); // Requisição
       
        if (!resposta.ok) {
            throw new Error('Erro ao buscar produtos');
        }
       
        let produtos = await resposta.json(); // Resultado
        console.log(`✅ Resposta recebida:`, produtos);

        if (!Array.isArray(produtos)) { // Garante que é array
            produtos = produtos ? [produtos] : []; // Converte objeto único em array
        }
        
        console.log(`📦 Produtos encontrados: ${produtos.length}`);

        loadingMessage.style.display = 'none';
       
        if (produtos.length === 0) {
            emptyMessage.style.display = 'block';
            produtsList.innerHTML = '';
        } else {
            emptyMessage.style.display = 'none';
            exibirTabela(produtos);
        }
    } catch (erro) {
        loadingMessage.style.display = 'none';
        emptyMessage.style.display = 'block';
        console.error('Erro:', erro);
        mostrarMensagem('Erro ao buscar os produtoss. Tente novamente.', 'erro');
    }
}

// Filtra produtoss pela busca (agora busca no backend)
function filtrarprodutos() {
    const searchInput = document.getElementById('searchInput'); // Input texto
    const searchType = document.getElementById('searchType'); // Tipo (nome/id)
    const valor = searchInput.value.trim(); // Remove espaços
    
    console.log(`✏️ Campo preenchido: "${valor}"`);
    console.log(`📌 Tipo de busca selecionado: "${searchType.value}"`);
    
    if (valor === '') {
        console.warn('⚠️ Campo vazio! Carregando todos...');
        // Se vazio, carrega todos
        carregarProdutos();
    } else {
        console.log(`🔍 Iniciando busca: tipo="${searchType.value}" valor="${valor}"`);
        // Busca no backend
        buscarprodutoss(searchType.value, valor);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() { // Quando DOM carregar
    // Carrega os produtoss ao abrir a página
    carregarProdutos();
    
    // Formulário de envio
    document.getElementById('produtForm').addEventListener('submit', async function(e) {
        e.preventDefault(); // Impede reload da página
        
        const nome = document.getElementById('nome').value.trim(); // Pega nome
        const preco = document.getElementById('preco').value.trim(); // CPF
        const estoque = document.getElementById('estoque').value.trim(); // Email
        const categoria = document.getElementById('categoria').value.trim(); // Telefone
        
        // Validação básica
        if (!nome || !preco || !estoque || !categoria) { // Se algum vazio
            mostrarMensagem('Por favor, preencha todos os campos!', 'erro');
            return;
        }
        
        const dados = { nome, preco, estoque, categoria }; // Objeto
        
        if (produtosEmEdicao) { // Se está editando
            atualizarProdutos(produtosEmEdicao, dados);
        } else {
            criarProduto(dados); // Senão, cria novo
        }
    });
    
    // Botão Limpar Formulário
    document.getElementById('btnLimpar').addEventListener('click', limparFormulario);
    
    // Botão Recarregar Lista
    document.getElementById('btnRecarregar').addEventListener('click', carregarProdutos);
    
    // Botão Buscar
    document.getElementById('btnBuscar').addEventListener('click', filtrarprodutos);
    // Busca em tempo real (opcional, pode ser removido se quiser apenas botão)
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') { // Se pressionar Enter
            filtrarprodutos();
        }
    });
    
    // Fechar modal ao clicar fora
    document.getElementById('modalMessage').addEventListener('click', function(e) {
        if (e.target === this) { // Se clicou fora do conteúdo
            fecharModal();
        }
    });
});