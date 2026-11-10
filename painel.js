
let produtosAdmin = [];
let filtroAtual = "todos";

async function iniciarPainel() {
  const { data: sessaoData, error: erroSessao } =
    await supabaseClient.auth.getSession();

  const usuario = sessaoData?.session?.user;

  if (erroSessao || !usuario) {
    window.location.href = "admin.html";
    return;
  }

  const { data: administradora, error: erroPermissao } =
    await supabaseClient
      .from("site_admins")
      .select("user_id")
      .eq("user_id", usuario.id)
      .maybeSingle();

  if (erroPermissao || !administradora) {
    await supabaseClient.auth.signOut();
    window.location.href = "admin.html";
    return;
  }

  configurarFiltros();
  await carregarResumo();
}

async function carregarResumo() {
  const { data, error } = await supabaseClient
    .rpc("get_admin_products");

  if (error) {
    console.error("Erro ao carregar produtos:", error);
    alert("Não foi possível carregar os produtos.");
    return;
  }

  produtosAdmin = data || [];

  document.getElementById("total-produtos").textContent =
    produtosAdmin.length;

  document.getElementById("total-disponiveis").textContent =
    produtosAdmin.filter(item => item.status === "available").length;

  document.getElementById("total-reservados").textContent =
    produtosAdmin.filter(item => item.status === "reserved").length;

  document.getElementById("total-comprados").textContent =
    produtosAdmin.filter(item => item.status === "purchased").length;

  mostrarListaAdmin();
}

function configurarFiltros() {
  const botoes = document.querySelectorAll(".filtro-admin");

  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      filtroAtual = botao.dataset.filtro;

      botoes.forEach(item => {
        item.classList.toggle("ativo", item === botao);
      });

      mostrarListaAdmin();
    });
  });
}

function mostrarListaAdmin() {
  const lista = document.getElementById("lista-admin");
  lista.innerHTML = "";

  const produtosFiltrados = filtroAtual === "todos"
    ? produtosAdmin
    : produtosAdmin.filter(item => item.status === filtroAtual);

  if (produtosFiltrados.length === 0) {
    lista.textContent = "Nenhum presente encontrado nesta categoria. ♡";
    return;
  }

  produtosFiltrados.forEach(item => {
    const card = document.createElement("article");
    card.className = "produto";

    const nome = document.createElement("h3");
    nome.textContent = item.name;

    const categoria = document.createElement("p");
    categoria.textContent = item.category;

    const status = document.createElement("p");

    const nomesStatus = {
      available: "Preciso comprar",
      reserved: "Reservado",
      purchased: "Já comprei",
      hidden: "Oculto"
    };

    status.textContent = nomesStatus[item.status] || item.status;

    card.appendChild(nome);
    card.appendChild(categoria);
    card.appendChild(status);

    lista.appendChild(card);
  });
}

document
  const botaoAdicionar = document.getElementById("adicionar-presente");
const formularioProduto = document.getElementById("form-produto");
const botaoCancelar = document.getElementById("cancelar-produto");

botaoAdicionar.addEventListener("click", () => {
  formularioProduto.style.display = "block";
  formularioProduto.scrollIntoView({ behavior: "smooth" });
});

botaoCancelar.addEventListener("click", () => {
  formularioProduto.style.display = "none";
  formularioProduto.reset();
});
document.getElementById("form-produto").addEventListener("submit", async (evento) => {
