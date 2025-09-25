import axios from "axios";

export default async function handler(req, res) {
  try {
    // Recebe parâmetros da query string (ex: title=naruto&limit=4)
    const { title = "", limit = 4 } = req.query;

    const response = await axios.get("https://api.mangadex.org/manga", {
      params: {
        title,
        limit,
        "includes[]": "cover_art",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: "Erro ao buscar mangas", error: error.message });
  }
}
