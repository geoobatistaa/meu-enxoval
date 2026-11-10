
let produtosAdmin = [];
let filtroAtual = "todos";
let produtoEmEdicao = null;

// INICIAR PAINEL E VERIFICAR ACESSO
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
  configurarFormulario();
  configurarEdicao();

  await carregarResumo();
}

// CARREGAR RESUMO
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

// FILTROS
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

// MOSTRAR CARTÕES
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

    const imagem = document.createElement("img");
    imagem.src = item.image_url || "";
    imagem.alt = item.name;
    imagem.loading = "lazy";

    if (!item.image_url) {
      imagem.style.display = "none";
    }

    card.appendChild(imagem);

    const nome = document.createElement("h3");
    nome.textContent = item.name;
    card.appendChild(nome);

    const categoria = document.createElement("p");
    categoria.textContent = item.category;
    card.appendChild(categoria);

    if (item.description) {
      const descricao = document.createElement("p");
      descricao.textContent = item.description;
      card.appendChild(descricao);
    }

    const nomesStatus = {
      available: "Preciso comprar",
      reserved: "Reservado",
      purchased: "Já comprei",
      hidden: "Oculto"
    };

    const status = document.createElement("p");
    status.textContent = nomesStatus[item.status] || item.status;
    card.appendChild(status);

    const botaoEditar = document.createElement("button");
    botaoEditar.type = "button";
    botaoEditar.className = "botao";
    botaoEditar.textContent = "Editar";

    botaoEditar.addEventListener("click", () => {
      abrirEdicao(item);
    });

    card.appendChild(botaoEditar);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "botao";
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.style.background = "#B99AC3";

    botaoExcluir.addEventListener("click", () => {
      excluirPresente(item);
    });

    card.appendChild(botaoExcluir);

    lista.appendChild(card);
  });
}

// EXCLUIR PRESENTE
async function excluirPresente(item) {
  const confirmar = confirm(
    `Tem certeza que deseja excluir "${item.name}"?`
  );

  if (!confirmar) return;

  const { error } = await supabaseClient
    .from("products")
    .delete()
    .eq("id", item.id);

  if (error) {
    console.error("Erro ao excluir:", error);
    alert("Não foi possível excluir: " + error.message);
    return;
  }

  alert("Presente excluído com sucesso! ♡");
  await carregarResumo();
}

// ELEMENTOS DO FORMULÁRIO DE CADASTRO
const botaoAdicionar = document.getElementById("adicionar-presente");
const formularioProduto = document.getElementById("form-produto");
const botaoCancelar = document.getElementById("cancelar-produto");

// ABRIR CADASTRO
botaoAdicionar.addEventListener("click", () => {
  formularioProduto.style.display = "block";

  document.getElementById("form-editar-produto").style.display = "none";

  formularioProduto.scrollIntoView({ behavior: "smooth" });
});

// CANCELAR CADASTRO
botaoCancelar.addEventListener("click", () => {
  formularioProduto.style.display = "none";
  formularioProduto.reset();
  document.getElementById("mensagem-produto").textContent = "";
});

// CADASTRAR PRESENTE
function configurarFormulario() {
  formularioProduto.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("nome-produto").value.trim();
    const categoria = document.getElementById("categoria-produto").value;
    const descricao = document.getElementById("descricao-produto").value.trim();
    const arquivo = document.getElementById("imagem-produto").files[0];
    const mensagem = document.getElementById("mensagem-produto");
    const botaoSalvar = evento.target.querySelector('button[type="submit"]');

    if (!arquivo) {
      mensagem.textContent = "Selecione uma foto para o presente.";
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      mensagem.textContent = "A imagem deve ter no máximo 5 MB.";
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      mensagem.textContent = "Use uma imagem JPG, PNG ou WEBP.";
      return;
    }

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";
    mensagem.textContent = "";

    try {
      const nomeArquivo = `${crypto.randomUUID()}-${arquivo.name}`;

      const { error: erroUpload } = await supabaseClient
        .storage
        .from("product-images")
        .upload(nomeArquivo, arquivo, {
          contentType: arquivo.type
        });

      if (erroUpload) throw erroUpload;

      const { data: imagemPublica } = supabaseClient
        .storage
        .from("product-images")
        .getPublicUrl(nomeArquivo);

      const { error: erroCadastro } = await supabaseClient
        .from("products")
        .insert({
          name: nome,
          category: categoria,
          description: descricao || null,
          image_url: imagemPublica.publicUrl,
          status: "available",
          is_published: true
        });

      if (erroCadastro) throw erroCadastro;

      mensagem.textContent = "Presente cadastrado com sucesso! ♡";
      evento.target.reset();

      await carregarResumo();

    } catch (erro) {
      console.error("Erro ao cadastrar presente:", erro);
      mensagem.textContent = erro.message || "Erro ao cadastrar.";
    } finally {
      botaoSalvar.disabled = false;
      botaoSalvar.textContent = "Salvar presente";
    }
  });
}

// ABRIR FORMULÁRIO DE EDIÇÃO
function abrirEdicao(item) {
  produtoEmEdicao = item;

  formularioProduto.style.display = "none";

  const formularioEdicao =
    document.getElementById("form-editar-produto");

  formularioEdicao.style.display = "block";

  document.getElementById("editar-nome").value = item.name;
  document.getElementById("editar-categoria").value = item.category;
  document.getElementById("editar-descricao").value =
    item.description || "";

  document.getElementById("editar-imagem").value = "";
  document.getElementById("mensagem-edicao").textContent = "";

  formularioEdicao.scrollIntoView({ behavior: "smooth" });
}

// CONFIGURAR EDIÇÃO
function configurarEdicao() {
  const formularioEdicao =
    document.getElementById("form-editar-produto");

  const botaoCancelarEdicao =
    document.getElementById("cancelar-edicao");

  botaoCancelarEdicao.addEventListener("click", () => {
    formularioEdicao.style.display = "none";
    formularioEdicao.reset();
    produtoEmEdicao = null;

    document.getElementById("mensagem-edicao").textContent = "";
  });

  formularioEdicao.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!produtoEmEdicao) return;

    const nome = document.getElementById("editar-nome").value.trim();
    const categoria = document.getElementById("editar-categoria").value;
    const descricao = document.getElementById("editar-descricao").value.trim();
    const arquivo = document.getElementById("editar-imagem").files[0];

    const mensagem = document.getElementById("mensagem-edicao");
    const botaoSalvar = evento.target.querySelector('button[type="submit"]');

    if (!nome) {
      mensagem.textContent = "O nome não pode ficar vazio.";
      return;
    }

    if (arquivo && arquivo.size > 5 * 1024 * 1024) {
      mensagem.textContent = "A imagem deve ter no máximo 5 MB.";
      return;
    }

    if (
      arquivo &&
      !["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)
    ) {
      mensagem.textContent = "Use uma imagem JPG, PNG ou WEBP.";
      return;
    }

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";
    mensagem.textContent = "";

    try {
      let imagemUrl = produtoEmEdicao.image_url;

      // ENVIAR NOVA FOTO, SE FOI ESCOLHIDA
      if (arquivo) {
        const nomeArquivo =
          `${crypto.randomUUID()}-${arquivo.name}`;

        const { error: erroUpload } = await supabaseClient
          .storage
          .from("product-images")
          .upload(nomeArquivo, arquivo, {
            contentType: arquivo.type
          });

        if (erroUpload) throw erroUpload;

        const { data: imagemPublica } = supabaseClient
          .storage
          .from("product-images")
          .getPublicUrl(nomeArquivo);

        imagemUrl = imagemPublica.publicUrl;
      }

      // ATUALIZAR DADOS DO PRESENTE
      const { error: erroAtualizacao } = await supabaseClient
        .from("products")
        .update({
          name: nome,
          category: categoria,
          description: descricao || null,
          image_url: imagemUrl
        })
        .eq("id", produtoEmEdicao.id);

      if (erroAtualizacao) throw erroAtualizacao;

      mensagem.textContent = "Presente atualizado com sucesso! ♡";

      produtoEmEdicao = null;

      await carregarResumo();

      formularioEdicao.reset();
      formularioEdicao.style.display = "none";

    } catch (erro) {
      console.error("Erro ao editar presente:", erro);
      mensagem.textContent = erro.message || "Não foi possível atualizar.";
    } finally {
      botaoSalvar.disabled = false;
      botaoSalvar.textContent = "Salvar alterações";
    }
  });
}

// INICIAR
iniciarPainel();
