
const formulario = document.getElementById("form-login");
const mensagem = document.getElementById("mensagem-login");

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  mensagem.textContent = "Verificando acesso...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
    mensagem.textContent = "E-mail ou senha incorretos. Tente novamente.";
    return;
  }

  const { data: administradora, error: erroPermissao } =
    await supabaseClient
      .from("site_admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

  if (erroPermissao || !administradora) {
    await supabaseClient.auth.signOut();
    mensagem.textContent = "Você não tem autorização para acessar esta área.";
    return;
  }

  mensagem.textContent = "Login realizado com sucesso! ♡";
});
