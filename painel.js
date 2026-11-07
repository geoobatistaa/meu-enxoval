
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

  const produtos = data || [];

  const total = produtos.length;
  const disponiveis = produtos.filter(
    item => item.status === "available"
  ).length;
  const reservados = produtos.filter(
    item => item.status === "reserved"
  ).length;
  const comprados = produtos.filter(
    item => item.status === "purchased"
  ).length;

  document.getElementById("total-produtos").textContent = total;
  document.getElementById("total-disponiveis").textContent = disponiveis;
  document.getElementById("total-reservados").textContent = reservados;
  document.getElementById("total-comprados").textContent = comprados;

  mostrarListaAdmin(produtos);
}

function mostrarListaAdmin(produtos) {
  const lista = document.getElementById("lista-admin");
  lista.innerHTML = "";

  produtos.forEach(item => {
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
  .getElementById("adicionar-presente")
  .addEventListener("click", () => {
    alert("O cadastro de presentes será implementado na próxima etapa. ♡");
  });

iniciarPainel();
