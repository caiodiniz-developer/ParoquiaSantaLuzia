import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * O Express 4 nao captura excecao de funcao async: uma promise rejeitada
 * dentro da rota vira "unhandled rejection" e a requisicao fica pendurada ate
 * o timeout do navegador. Este involucro liga o `catch` ao `next`, que e o que
 * leva o erro ate o tratador central.
 */
export function assincrono(manipulador: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(manipulador(req, res, next)).catch(next);
  };
}
