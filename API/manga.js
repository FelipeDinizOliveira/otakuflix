import axios from "axios";

export default async function handler(req, res) {
  const { title = "", limit = 4 } = req.query;

  try {
    // Busca os mangás na API oficial do MangaDex
    const response = await axios.get("https://api.mangadex.org/manga", {
      params: {
        title,
        limit,
        includes: ["cover_art"],
      },
    });

    // Retorna a resposta com a mesma estrutura esperada pelo front
    res.status(200).json({
      data: response.data.data || [],
    });
  } catch (err) {
    console.error("Erro na API MangaDex:", err.message);
    res.status(500).json({ data: [] });
  }
}
