import { createCanvas } from "canvas";

export const generateImage = async (
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