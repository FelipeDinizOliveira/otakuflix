import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { chapterId } = req.query;

    if (!chapterId) {
      return res.status(400).json({ error: "ID do capítulo é obrigatório" });
    }

    const url = `https://api.mangadex.org/at-home/server/${chapterId}`;
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
