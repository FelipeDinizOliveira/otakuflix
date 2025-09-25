import axios from "axios";

export default async function handler(req, res) {
  const { title = "" } = req.query;

  try {
    const response = await axios.get(`https://api.mangadex.org/manga`, {
      params: { title, limit: 4, includes: ["cover_art"] },
    });

    // retorna sempre data
    res.status(200).json({ data: response.data.data || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ data: [] });
  }
}
