
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
const campoCodigo = document.getElementById("codigo-reserva");
const botaoConsultar = document.getElementById("botao-consultar-reserva");
const resultadoReserva = document.getElementById("resultado-reserva");


// CONFIRMAÇÃO PERSONALIZADA
function pedirConfirmacao(titulo, mensagem, textoBotao) {
  return new Promise(resolve => {
    const modal = document.createElement("div");
    modal.className = "modal-reserva";

    const conteudo = document.createElement("div");
    conteudo.className = "modal-conteudo modal-confirmacao";

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "modal-fechar";
    fechar.setAttribute("aria-label", "Fechar");
    fechar.textContent = "×";

    const icone = document.createElement("span");
    icone.className = "modal-icone";
    icone.textContent = "♡";

    const tituloElemento = document.createElement("h2");
    tituloElemento.textContent = titulo;

    const mensagemElemento = document.createElement("p");
    mensagemElemento.className = "modal-mensagem";
    mensagemElemento.textContent = mensagem;

    const botoes = document.createElement("div");
    botoes.className = "modal-acoes";

    const confirmar = document.createElement("button");
    confirmar.type = "button";
    confirmar.className = "modal-copiar";
    confirmar.textContent = textoBotao;

    const voltar = document.createElement("button");
    voltar.type = "button";
    voltar.className = "modal-voltar";
    voltar.textContent = "Voltar";

    botoes.appendChild(confirmar);
    botoes.appendChild(voltar);

    conteudo.appendChild(fechar);
    conteudo.appendChild(icone);
    conteudo.appendChild(tituloElemento);
    conteudo.appendChild(mensagemElemento);
    conteudo.appendChild(botoes);

    modal.appendChild(conteudo);
    document.body.appendChild(modal);

    function finalizar(resposta) {
      modal.remove();
      resolve(resposta);
    }

    confirmar.addEventListener("click", () => finalizar(true));
    voltar.addEventListener("click", () => finalizar(false));
    fechar.addEventListener("click", () => finalizar(false));

    modal.addEventListener("click", event => {
      if (event.target === modal) {
        finalizar(false);
      }
    });
  });
}


// MOSTRAR CATEGORIAS
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


// MOSTRAR PRESENTES
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
      const confirmar = await pedirConfirmacao(
        "Um presente especial ♡",
        `Você deseja reservar "${item.name}" para os noivos?`,
        "Sim, quero presentear ♡"
      );

      if (!confirmar) return;

      botao.disabled = true;
      botao.textContent = "Reservando...";

      try {
        const { data, error } = await supabaseClient.rpc(
          "reserve_product_with_code",
          { p_product_id: item.id }
        );

        if (error) throw error;

        if (!data) {
          alert(
            "Não recebemos o código da reserva. Entre em contato com os noivos."
          );
          return;
        }

        abrirComprovante(data);
        await carregarPresentes();

      } catch (error) {
        console.error("Erro ao reservar:", error);
        alert("Não foi possível reservar: " + error.message);

      } finally {
        botao.disabled = false;
        botao.textContent = "Quero presentear";
      }
    });

    card.appendChild(botao);
    areaPresentes.appendChild(card);
  });
}


// COMPROVANTE DE RESERVA
function abrirComprovante(codigoReserva) {
  const modal = document.createElement("div");
  modal.className = "modal-reserva";

  const conteudo = document.createElement("div");
  conteudo.className = "modal-conteudo";

  conteudo.innerHTML = `
    <button type="button" class="modal-fechar" aria-label="Fechar">×</button>

    <span class="modal-icone">♡</span>

    <h2>Presente reservado!</h2>

    <p class="modal-mensagem">
      Ficamos muito felizes com seu carinho e por fazer parte
      desse momento tão especial!
    </p>

    <div class="modal-codigo-area">
      <small>Seu código de reserva</small>
      <div class="modal-codigo"></div>
      <button type="button" class="modal-copiar">
        Copiar código
      </button>
    </div>

    <p class="modal-instrucao">
      Guarde esse código com carinho! Você poderá utilizá-lo
      para consultar os detalhes da sua reserva ou cancelá-la,
      caso necessário.
    </p>

    <p class="modal-rodape">
      Muito obrigada por fazer parte da nossa história! ♡
    </p>
  `;

  conteudo.querySelector(".modal-codigo").textContent = codigoReserva;

  modal.appendChild(conteudo);
  document.body.appendChild(modal);

  const botaoFechar = conteudo.querySelector(".modal-fechar");
  const botaoCopiar = conteudo.querySelector(".modal-copiar");

  botaoFechar.addEventListener("click", () => modal.remove());

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      modal.remove();
    }
  });

  botaoCopiar.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(codigoReserva);
      botaoCopiar.textContent = "Código copiado! ♡";

    } catch (error) {
      const campoTemporario = document.createElement("textarea");
      campoTemporario.value = codigoReserva;
      campoTemporario.style.position = "fixed";
      campoTemporario.style.opacity = "0";

      document.body.appendChild(campoTemporario);
      campoTemporario.select();

      const copiou = document.execCommand("copy");
      campoTemporario.remove();

      botaoCopiar.textContent = copiou
        ? "Código copiado! ♡"
        : "Não foi possível copiar. Anote o código.";
    }
  });
}


// CARREGAR PRESENTES
async function carregarPresentes() {
  areaPresentes.innerHTML = "<p>Carregando presentes...</p>";

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("is_published", true)
      .eq("status", "available");

    if (error) throw error;

    todosPresentes = data || [];
    mostrarPresentes();

  } catch (error) {
    console.error("Erro ao carregar presentes:", error);

    areaPresentes.innerHTML =
      "<p>Não foi possível carregar os presentes.</p>";
  }
}


// CONSULTAR RESERVA
botaoConsultar.addEventListener("click", async () => {
  const codigo = campoCodigo.value.trim().toUpperCase();

  if (!codigo) {
    resultadoReserva.textContent = "Digite seu código de reserva.";
    return;
  }

  botaoConsultar.disabled = true;
  botaoConsultar.textContent = "Consultando...";
  resultadoReserva.innerHTML = "";

  try {
    const { data, error } = await supabaseClient.rpc(
      "lookup_reservation",
      { p_code: codigo }
    );

    if (error) throw error;

    if (!data) {
      resultadoReserva.textContent =
        "Não encontramos uma reserva ativa com esse código. Confira se digitou corretamente.";
      return;
    }

    mostrarResultadoReserva(data);

  } catch (error) {
    console.error("Erro ao consultar:", error);

    resultadoReserva.textContent =
      "Não foi possível consultar sua reserva. Tente novamente.";

  } finally {
    botaoConsultar.disabled = false;
    botaoConsultar.textContent = "Consultar reserva";
  }
});


// MOSTRAR RESULTADO DA CONSULTA
function mostrarResultadoReserva(reserva) {
  resultadoReserva.innerHTML = "";

  const caixa = document.createElement("div");
  caixa.className = "resultado-consulta";

  const titulo = document.createElement("h3");
  titulo.textContent = "Sua reserva ♡";
  caixa.appendChild(titulo);

  const codigo = document.createElement("p");
  codigo.textContent = `Código: ${reserva.code}`;
  caixa.appendChild(codigo);

  const nome = document.createElement("p");
  nome.textContent = `Presente: ${reserva.product_name}`;
  caixa.appendChild(nome);

  const categoria = document.createElement("p");
  categoria.textContent = `Categoria: ${reserva.category}`;
  caixa.appendChild(categoria);

  if (reserva.description) {
    const descricao = document.createElement("p");
    descricao.textContent = reserva.description;
    caixa.appendChild(descricao);
  }

  const status = document.createElement("p");

  if (reserva.product_status === "purchased") {
    status.textContent =
      "Situação: presente já marcado como comprado. Muito obrigada! ♡";
  } else {
    status.textContent = "Situação: reserva ativa.";
  }

  caixa.appendChild(status);

  if (reserva.image_url) {
    const imagem = document.createElement("img");
    imagem.src = reserva.image_url;
    imagem.alt = reserva.product_name;
    imagem.style.cssText =
      "max-width:180px;width:100%;border-radius:12px;margin:12px 0;";

    caixa.appendChild(imagem);
  }

  if (reserva.product_status === "reserved") {
    const botaoCancelar = document.createElement("button");
    botaoCancelar.type = "button";
    botaoCancelar.textContent = "Cancelar minha reserva";
    botaoCancelar.className = "botao";

    botaoCancelar.addEventListener("click", async () => {
      const confirmar = await pedirConfirmacao(
        "Podemos confirmar? ♡",
        "Tem certeza de que deseja cancelar sua reserva? O presente voltará a ficar disponível na lista.",
        "Sim, cancelar reserva"
      );

      if (!confirmar) return;

      botaoCancelar.disabled = true;
      botaoCancelar.textContent = "Cancelando...";

      try {
        const { data, error } = await supabaseClient.rpc(
          "cancel_reservation_by_code",
          { p_code: reserva.code }
        );

        if (error) throw error;

        if (!data) {
          alert(
            "Não foi possível cancelar. Talvez o presente já tenha sido marcado como comprado."
          );
          return;
        }

        resultadoReserva.textContent =
          "Sua reserva foi cancelada com sucesso. O presente voltou a ficar disponível na lista. ♡";

        await carregarPresentes();

      } catch (error) {
        console.error("Erro ao cancelar:", error);
        alert("Não foi possível cancelar a reserva. Tente novamente.");

      } finally {
        botaoCancelar.disabled = false;
        botaoCancelar.textContent = "Cancelar minha reserva";
      }
    });

    caixa.appendChild(botaoCancelar);
  }

  resultadoReserva.appendChild(caixa);
}


// INICIAR SITE
mostrarCategorias();
carregarPresentes();
  
