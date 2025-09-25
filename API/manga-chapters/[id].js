import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "ID do mangá é obrigatório" });
    }

    const url = `https://api.mangadex.org/manga/${id}/feed?limit=10&order[chapter]=asc`;
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
