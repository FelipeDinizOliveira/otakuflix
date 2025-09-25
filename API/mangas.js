import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { title = "" } = req.query;

    const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(
      title
    )}&limit=4&includes[]=cover_art`;
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
