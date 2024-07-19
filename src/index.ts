import axios, { AxiosResponse } from "axios";
import { Telegraf, Context } from "telegraf";
import { APIResponse, APIResponseError } from "./types/types";
import { createCanvas } from "canvas";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { ApiError } from "telegraf/typings/core/types/typegram";
dotenv.config();

const TOKEN = <string>process.env.BOT_TOKEN;
const bot: Telegraf = new Telegraf(TOKEN);

const generateImage = async (
  symbol: string,
  price: string
): Promise<Buffer> => {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext("2d");

  // Background color
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text settings
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 180px Sans-Serif";
  ctx.fillText(symbol, 50, 200);

  ctx.font = "bold 80px Arial";
  ctx.fillText(`$${price}`, 50, 350);

  return canvas.toBuffer();
};

bot.start(async (ctx: Context) => {
  // await ctx.replyWithMarkdownV2("```Ciao```"); formato codice
  // await ctx.replyWithMarkdownV2("*Ciao*"); formato testo
  const userId = ctx.message?.from.id;
  const name = ctx.message?.from.first_name;
  // await ctx.reply(
  //   `Benvenuto ${name} ${userId}. Inserisci il ticker della crypto es. BTC, ETH..`
  // );
  await ctx.reply(
    `
    Hey ${name} ${userId}. Nice to meet you!
    
    Get your first crypto price update.
    
    💬 Say: */p btc* or other ticker.

    Format: /p <ticker> 
    
    Awesome! 🚀`,
    { parse_mode: "Markdown" }
  );
});

// bot.on("message", async (ctx: Context) => {
//   const message = ctx.text;
//   const ticker = message?.toUpperCase();

//   try {
//     const response: AxiosResponse<APIResponse> = await axios.get(
//       `http://localhost:8080/api/v1/ticker/${ticker}`
//     );
//     const price = response.data.price;

//     // await ctx.replyWithPhoto(
//     //   { source: path.resolve(__dirname, `./stock.png`) },
//     //   {
//     //     caption: `Il prezzo di *[${ticker}]* è ${price} $`,
//     //     parse_mode: "Markdown",
//     //   }
//     // );

//     await ctx.reply(`Il prezzo di *[${ticker}]* è ${price} $`, {
//       parse_mode: "Markdown",
//     });
//   } catch (err: unknown) {
//     if (axios.isAxiosError(err)) {
//       const nameError = (<APIResponseError>err.response?.data).errore;
//       console.log(nameError);
//       //   await ctx.replyWithPhoto(
//       //     {
//       //         source: path.resolve(__dirname, `./error.png`),
//       //     //   url: "https://thumbs.dreamstime.com/b/error-rubber-stamp-word-error-inside-illustration-109026446.jpg",
//       //     },
//       //     {
//       //       caption: `Crypto *[${ticker}]* non trovata. Riprova.`,
//       //       parse_mode: "Markdown",
//       //     }
//       //   );
//       await ctx.reply(`Crypto *[${ticker}]* non trovata. Riprova.`, {
//         parse_mode: "Markdown",
//       });
//     }
//   }
// });

bot.command("p", async (ctx: Context) => {
  const message = ctx.text;
  const ticker = message?.split(" ")[1]?.toUpperCase();
  console.log(ticker);

  if (ticker) {
    try {
      const response: AxiosResponse<APIResponse> = await axios.get(
        `http://localhost:8080/api/v1/ticker/${ticker}`
      );
      const price = response.data.price;
      const buffer = await generateImage(ticker, price);
      const filePath = path.resolve(__dirname, "crypto.png");
      console.log(filePath);
      fs.writeFileSync(filePath, buffer);
      await ctx.replyWithPhoto(
        { source: filePath },
        {
          // caption: `Il prezzo di [${ticker}](https://it.tradingview.com/symbols/${ticker}USD/) è ${price} $`,
          // parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "TradingView 📈",
                  url: `https://it.tradingview.com/symbols/${ticker}USD/`,
                },
                {
                  text: "Exchanges 🤝",
                  url: `https://www.coingecko.com/en/exchanges`,
                },
              ],
            ],
          },
        }
      );
    } catch (err: unknown) {
      handleError(err, ctx, ticker);
    }
  }
});

const handleError = async (err: unknown, ctx: Context, ticker?: string) => {
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

bot.launch();
