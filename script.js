// Carrega os dados do JSON e configura toda a lógica da página
async function carregarDados() {
    try {
        const resposta = await fetch('data.json');
        const dadosJson = await resposta.json(); // Dados fixos do arquivo

        // Seleciona os elementos do DOM
        const inputBusca = document.querySelector(".search-container input");
        const datalistSugestoes = document.querySelector("#sugestoes-linguagens");
        const botaoBusca = document.getElementById('botao-busca');
        const cardContainer = document.querySelector('.card-container');

        // Campos de cadastro (se existirem no HTML)
        const inputNovoNome = document.getElementById('novo-nome');
        const inputNovoAno = document.getElementById('novo-ano');
        const inputNovoDescricao = document.getElementById('novo-descricao');
        const inputNovoLink = document.getElementById('novo-link');
        const botaoCadastrar = document.getElementById('btn-cadastrar');

        // Carrega cadastros extras salvos no navegador
        let cadastrosExtras = JSON.parse(localStorage.getItem("cadastrosExtras")) || [];

        // Sempre que precisar dos dados, junta JSON + extras
        function getTodosDados() {
            return [...dadosJson, ...cadastrosExtras];
        }

        /**
         * Função central de busca: filtra por nome ou descrição
         * e renderiza os cards.
         */
        function filtrarErenderizar() {
            const termoBusca = inputBusca.value.trim().toLowerCase();

            // Se não digitou nada, não mostra dados.json
            if (!termoBusca) {
                //cardContainer.innerHTML = '<p>Digite um termo para buscar uma tecnologia.</p>';
                return;
            }

            const resultadosFiltrados = getTodosDados().filter(dado => {
                const nome = (dado.nome || '').toLowerCase();
                const descricao = (dado.descricao || '').toLowerCase();
                return nome.includes(termoBusca) || descricao.includes(termoBusca);
            });

            renderizarCards(resultadosFiltrados);

            // Depois da busca, limpa o campo, sugestões e devolve o foco
            inputBusca.value = '';
            datalistSugestoes.innerHTML = '';
            inputBusca.focus();
        }

        /**
         * Preenche o datalist com sugestões enquanto o usuário digita.
         */
        inputBusca.addEventListener('input', () => {
            const termoBusca = inputBusca.value.trim().toLowerCase();
            datalistSugestoes.innerHTML = '';

            if (!termoBusca) return;

            const todosDados = getTodosDados();

            const sugestoesFiltradas = todosDados.filter(dado =>
                (dado.nome || '').toLowerCase().startsWith(termoBusca)
            );

            // Evita duplicar nomes no datalist
            const nomesUnicos = new Set();
            sugestoesFiltradas.forEach(dado => {
                const nome = dado.nome;
                if (nome && !nomesUnicos.has(nome)) {
                    nomesUnicos.add(nome);
                    const option = document.createElement('option');
                    option.value = nome;
                    datalistSugestoes.appendChild(option);
                }
            });
        });

        /**
         * Enter no campo de busca dispara a busca.
         */
        inputBusca.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                filtrarErenderizar();
            }
        });

        /**
         * Clique no botão "Buscar" dispara a mesma função.
         */
        botaoBusca.addEventListener('click', () => {
            filtrarErenderizar();
        });

        /**
         * Cadastro de novo item usando LocalStorage.
         * Só configura se os elementos existirem no HTML.
         */
        if (botaoCadastrar && inputNovoNome && inputNovoDescricao) {
            botaoCadastrar.addEventListener('click', () => {
                const nome = inputNovoNome.value.trim();
                const ano = inputNovoAno ? inputNovoAno.value.trim() : '';
                const descricao = inputNovoDescricao.value.trim();
                const link = inputNovoLink ? inputNovoLink.value.trim() : '';

                if (!nome || !descricao) {
                    alert("Nome e descrição são obrigatórios!");
                    return;
                }

                const novoItem = {
                    nome,
                    descricao
                };

                if (ano) novoItem.ano = ano;
                if (link) novoItem.link = link;

                // Adiciona ao array local
                cadastrosExtras.push(novoItem);

                // Salva no LocalStorage
                localStorage.setItem("cadastrosExtras", JSON.stringify(cadastrosExtras));

                // Limpa campos
                inputNovoNome.value = '';
                if (inputNovoAno) inputNovoAno.value = '';
                inputNovoDescricao.value = '';
                if (inputNovoLink) inputNovoLink.value = '';

                alert("Cadastro realizado com sucesso!");
            });
        }

        // Ao carregar a página, não mostra nenhuma tecnologia:
        //cardContainer.innerHTML = '<p>Digite um termo para buscar uma tecnologia.</p>';

    } catch (error) {
        console.error('Erro ao carregar ou processar os dados:', error);
        const cardContainer = document.querySelector('.card-container');
        cardContainer.innerHTML = `<p>Ocorreu um erro ao carregar as informações. Tente recarregar a página.</p>`;
    }
}

// Chama a função principal quando a página terminar de carregar
window.onload = carregarDados;

/**
 * Responsável por limpar o container e montar os cards
 * com os dados filtrados.
 */
function renderizarCards(dados) {
    const cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = '';

    if (!dados || dados.length === 0) {
        cardContainer.innerHTML = `<p>Nenhum resultado encontrado para a sua busca.</p>`;
        return;
    }

    for (const dado of dados) {
        const article = document.createElement('article');
        article.classList.add('card');

        const ano = dado.ano || dado.data_criacao || '-';
        const link = dado.link || '#';

        article.innerHTML = `
            <h2>${dado.nome}</h2>
            <p><strong>Ano de criação:</strong> ${ano}</p>
            <p>${dado.descricao}</p>
            <a href="${link}" target="_blank" rel="noopener noreferrer">Saiba mais</a>
        `;
        cardContainer.appendChild(article);
    }
}
