
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
let todosPresentes = [];

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

function mostrarPresentes() {
  areaPresentes.innerHTML = "";

  const titulo = document.createElement("h2");
  titulo.textContent = "Nossos presentes";
  titulo.style.cssText =
    "grid-column:1/-1;color:#80618C;font-weight:normal;margin-bottom:8px;";
  areaPresentes.appendChild(titulo);

  const presentes = categoriaSelecionada === "Todos"
    ? todosPresentes
    : todosPresentes.filter(
        item => item.category === categoriaSelecionada
      );

  if (presentes.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.textContent =
      "Estamos preparando nossa lista de presentes com muito carinho. Em breve, você poderá conferir todos os itens por aqui! ♡";
    mensagem.style.cssText =
      "grid-column:1/-1;background:white;padding:28px;border-radius:16px;text-align:center;";
    areaPresentes.appendChild(mensagem);
    return;
  }

  presentes.forEach(item => {
    const card = document.createElement("article");
    card.className = "produto";

    const imagem = document.createElement("img");
    imagem.src = item.image_url || "";
    imagem.alt = item.name;
    imagem.loading = "lazy";

    if (!item.image_url) {
      imagem.style.display = "none";
    }

    const nome = document.createElement("h3");
    nome.textContent = item.name;

    const categoria = document.createElement("p");
    categoria.textContent = item.category;

    card.appendChild(imagem);
    card.appendChild(nome);
    card.appendChild(categoria);

    if (item.description) {
      const descricao = document.createElement("p");
      descricao.textContent = item.description;
      card.appendChild(descricao);
    }

    const botao = document.createElement("button");
    botao.className = "botao";
    botao.type = "button";
    botao.textContent = "Quero presentear";

    botao.addEventListener("click", async () => {
      const confirmar = window.confirm(
        `Deseja mesmo reservar "${item.name}"?`
      );

      if (!confirmar) return;

      botao.disabled = true;
      botao.textContent = "Reservando...";

      const { data, error } = await supabaseClient.rpc(
        "reserve_product_with_code",
        { p_product_id: item.id }
      );

      if (error) {
        alert("Não foi possível reservar: " + error.message);
        botao.disabled = false;
        botao.textContent = "Quero presentear";
        return;
      }

      if (!data) {
        alert("A reserva foi processada, mas não recebemos o código. Entre em contato com os noivos.");
        await carregarPresentes();
        return;
      }

      alert(
        `Presente reservado com sucesso! ♡\n\n` +
        `Seu código de reserva é:\n\n${data}\n\n` +
        `Guarde esse código! Você vai precisar dele para consultar sua reserva ou cancelá-la posteriormente.\n\n` +
        `Obrigada pelo carinho!`
      );

      await carregarPresentes();
    });

    card.appendChild(botao);
    areaPresentes.appendChild(card);
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
    console.error("Erro Supabase:", error);
    areaPresentes.innerHTML =
      "<p>Não foi possível carregar os presentes.</p>";
    return;
  }

  todosPresentes = data || [];
  mostrarPresentes();
}

mostrarCategorias();
carregarPresentes();
