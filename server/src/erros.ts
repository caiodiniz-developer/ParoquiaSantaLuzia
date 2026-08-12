/**
 * Erros com status HTTP embutido. As rotas so lancam; quem traduz para
 * resposta e o tratador registrado no fim do app.ts.
 */
export class ErroHttp extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroHttp";
  }
}

export class NaoAutorizado extends ErroHttp {
  constructor(mensagem = "Sessao invalida ou expirada.") {
    super(401, mensagem);
  }
}

export class NaoEncontrado extends ErroHttp {
  constructor(mensagem = "Registro nao encontrado.") {
    super(404, mensagem);
  }
}

export class DadosInvalidos extends ErroHttp {
  constructor(mensagem = "Dados invalidos.") {
    super(400, mensagem);
  }
}
