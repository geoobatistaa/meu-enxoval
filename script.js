
const categorias = [
  { nome: "Todos", icone: "♡" },
  { nome: "Cozinha", icone: "🍽️" },
  { nome: "Quarto", icone: "🛏️" },
  { nome: "Banheiro", icone: "🛁" },
  { nome: "Sala", icone: "🛋️" },
  { nome: "Lavanderia", icone: "🧺" },
  { nome: "Decoração", icone: "🪴" },
  { nome: "Eletrodomésticos", icone: "⌁" },
  { nome: "Outros", icone: "🎁" }
];

let categoriaSelecionada = "Todos";

const areaCategorias = document.getElementById("categorias");
const areaPresentes = document.getElementById("presentes");

// Cria o título das categorias
const tituloCategorias = document.createElement("h2");
tituloCategorias.textContent = "Explore por categoria";
tituloCategorias.style.cssText =
  "grid-column: 1 / -1; color: #80618C; font-weight: normal; margin-bottom: 8px;";

areaCategorias.appendChild(tituloCategorias);

// Cria os botões das categorias
function mostrarCategorias() {
  areaCategorias.querySelectorAll(".categoria").forEach(botao => {
    botao.remove();
  });

  categorias.forEach(categoria => {
    const botao = document.createElement("button");

    botao.className = "categoria";
    botao.type = "button";
    botao.classList.toggle(
      "ativa",
      categoriaSelecionada === categoria.nome
    );

    botao.innerHTML = `
      <span class="icone">${categoria.icone}</span>
      <span>${categoria.nome}</span>
    `;

    botao.addEventListener("click", () => {
      categoriaSelecionada = categoria.nome;
      mostrarCategorias();
      mostrarPresentes();
    });

    areaCategorias.appendChild(botao);
  });
}

// Cria a área dos presentes
function mostrarPresentes() {
  areaPresentes.innerHTML = "";

  const titulo = document.createElement("h2");
  titulo.textContent = "Nossos presentes";
  titulo.style.cssText =
    "grid-column: 1 / -1; color: #80618C; font-weight: normal; margin-bottom: 8px;";

  areaPresentes.appendChild(titulo);

  const mensagem = document.createElement("p");

  mensagem.textContent =
    "Estamos preparando nossa lista de presentes com muito carinho. Em breve, você poderá conferir todos os itens por aqui! ♡";

  mensagem.style.cssText =
    "grid-column: 1 / -1; background: white; padding: 28px; border-radius: 16px; text-align: center;";

  areaPresentes.appendChild(mensagem);
}

// Inicializa a página
mostrarCategorias();
mostrarPresentes();
