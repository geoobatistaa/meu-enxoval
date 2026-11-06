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

function mostrarCategorias() {
  areaCategorias.innerHTML = "";

  const titulo = document.createElement("h2");
  titulo.textContent = "Explore por categoria";
  titulo.style.cssText =
    "grid-column:1/-1;color:#80618C;font-weight:normal;margin-bottom:8px;";
  areaCategorias.appendChild(titulo);

  categorias.forEach(categoria => {
    const botao = document.createElement("button");
    botao.className = "categoria";
    botao.type = "button";
    botao.classList.toggle("ativa", categoriaSelecionada === categoria.nome);

    botao.innerHTML = `
      <span class="icone">${categoria.icone}</span>
      <span>${categoria.nome}</span>
    `;

    botao.addEventListener("click", () => {
      categoriaSelecionada = categoria.nome;
      mostrarCategorias();
      carregarPresentes();
    });

    areaCategorias.appendChild(botao);
  });
}

async function carregarPresentes() {
  areaPresentes.innerHTML = "<p>Carregando presentes...</p>";

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("status", "available");

  if (error) {
    console.error(error);
    areaPresentes.innerHTML =
      "<p>Não foi possível carregar os presentes. Tente novamente.</p>";
    return;
  }

  const presentes = categoriaSelecionada === "Todos"
    ? data
    : data.filter(item => item.category === categoriaSelecionada);

  areaPresentes.innerHTML = "";

  const titulo = document.createElement("h2");
  titulo.textContent = "Nossos presentes";
  titulo.style.cssText =
    "grid-column:1/-1;color:#80618C;font-weight:normal;margin-bottom:8px;";
  areaPresentes.appendChild(titulo);

  if (presentes.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.textContent =
      "Estamos preparando nossa lista de presentes com muito carinho. Em breve, você poderá conferir todos os itens por aqui! ♡";
    mensagem.style.cssText =
      "grid-column:1/-1;background:white;padding:28px;border-radius:16px;text-align:center;";
    areaPresentes.appendChild(mensagem);
    return;
  }
}

mostrarCategorias();
carregarPresentes();
