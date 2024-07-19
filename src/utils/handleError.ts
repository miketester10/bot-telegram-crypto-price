import axios from "axios";
import { Context } from "telegraf";
import { APIResponseError } from "../types/types";

export const handleError = async (err: unknown, ctx: Context, ticker?: string) => {
    if (axios.isAxiosError(err)) {
      const error = <APIResponseError>err;
      const errorName = error.response?.data.errore;
      if (errorName === "Ticker non trovato in nessuna API") {
        await ctx.reply(`Crypto *[${ticker}]* non trovata. Riprova.`, {
          parse_mode: "Markdown",
        });
      } else {
        await ctx.reply("Si è verificato un errore con il server. Riprova.");
      }
      return;
    }
  
    const error = <Error>err;
    console.log(error.message);
    ctx.reply("Si è verificato un errore. Riprova.");
  };