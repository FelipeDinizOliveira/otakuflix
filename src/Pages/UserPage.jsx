import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import axios from "axios";
import styles from "../Pages/UserPage.module.css";
import { RiLogoutBoxLine } from "react-icons/ri";
import { IoCloseCircle } from "react-icons/io5";

export function UserPage() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mangas, setMangas] = useState([]);
  const [selectedManga, setSelectedManga] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [pages, setPages] = useState([]);

  const baseUrl = "https://api.mangadex.org";
  const apiUrl = "http://localhost:3000"; // URL backend

  // Dados do usuário  JWT e rota /user/:id
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Usuário não logado");
        return;
      }

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch {
        setMessage("Token inválido");
        return;
      }

      const userId = decoded.id;
      if (!userId) {
        setMessage("ID do usuário não encontrado no token");
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      } catch (err) {
        console.error(err);
        setMessage("Erro ao buscar dados do usuário");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Busca api manga
  const fetchMangas = async (title) => {
    try {
      const response = await axios.get(`${baseUrl}/manga`, {
        params: { title, limit: 4, includes: ["cover_art"] },
      });

      const mangasData = response.data.data.map((m) => {
        const coverRel = m.relationships.find((r) => r.type === "cover_art");
        const coverUrl = coverRel
          ? `https://uploads.mangadex.org/covers/${m.id}/${coverRel.attributes.fileName}.256.jpg`
          : "https://via.placeholder.com/200x300?text=Sem+imagem";

        const description =
          m.attributes.description?.en || "Sem sinopse disponível";

        return {
          id: m.id,
          title:
            m.attributes.title["pt-br"] ||
            m.attributes.title.en ||
            Object.values(m.attributes.title)[0] ||
            "Sem título",
          cover: coverUrl,
          description,
        };
      });

      setMangas(mangasData);
    } catch (err) {
      console.error("Erro ao buscar mangas:", err);
      setMangas([]);
    }
  };

  useEffect(() => {
    fetchMangas("");
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchMangas(searchTerm), 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  //  Modal e leitor
  const openModal = (manga) => {
    setSelectedManga(manga);
    setModalOpen(true);
    setPages([]);
    setChapters([]);
    setCurrentChapterIndex(0);
  };

  const closeModal = () => {
    setSelectedManga(null);
    setModalOpen(false);
    setPages([]);
    setChapters([]);
    setCurrentChapterIndex(0);
  };

  const fetchChapters = async (mangaId) => {
    try {
      const response = await axios.get(`${baseUrl}/manga/${mangaId}/feed`, {
        params: { limit: 10, order: { chapter: "asc" } },
      });

      const chapterList = response.data.data.map((c) => ({
        id: c.id,
        title: c.attributes.title || `Capítulo ${c.attributes.chapter}`,
        chapter: c.attributes.chapter,
      }));

      setChapters(chapterList);
      if (chapterList.length > 0) fetchPages(chapterList[0].id);
    } catch (err) {
      console.error("Erro ao buscar capítulos:", err);
    }
  };

  const fetchPages = async (chapterId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/at-home/server/${chapterId}`
      );
      const baseUrlServer = response.data.baseUrl;
      const hash = response.data.chapter.hash;
      const data = response.data.chapter.data;
      const fullUrls = data.map(
        (img) => `${baseUrlServer}/data/${hash}/${img}`
      );
      setPages(fullUrls);

      const idx = chapters.findIndex((c) => c.id === chapterId);
      setCurrentChapterIndex(idx >= 0 ? idx : 0);
    } catch (err) {
      console.error("Erro ao buscar páginas do capítulo:", err);
    }
  };

  if (!user) return <p>{message || "Carregando usuário..."}</p>;

  return (
    <>
      <header className={styles.head}>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          alt="Desejar sair?"
        >
          <RiLogoutBoxLine />
          Sair
        </button>

        <span>
          <h2>otaku</h2> <h1>Flix</h1>
        </span>
        <div id={styles.classWrapper}>
          <p>Bem-vindo, {user.name}!</p>
          <p>Email: {user.email}</p>
        </div>
      </header>
      <div className={modalOpen ? styles.userPageBlur : styles.userPage}>
        <section id={styles.wrapperSearch}>
          <input
            type="text"
            placeholder="Buscar por título"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <div className={styles.mangasGrid}>
            {mangas.length > 0 ? (
              mangas.map((manga) => (
                <div
                  key={manga.id}
                  className={styles.mangaCard}
                  onClick={() => openModal(manga)}
                >
                  <div className={styles.mangaImageWrapper}>
                    <img
                      src={manga.cover}
                      alt={manga.title}
                      className={styles.mangaCover}
                    />
                    <p className={styles.mangaTitle}>{manga.title}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum mangá encontrado</p>
            )}
          </div>
        </section>
      </div>
      {modalOpen && selectedManga && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {!pages.length ? (
              <>
                <h2>{selectedManga.title}</h2>
                <img
                  src={selectedManga.cover}
                  alt={selectedManga.title}
                  className={styles.modalCover}
                />
                <p>{selectedManga.description}</p>
                <button
                  className={styles.readButton}
                  onClick={() => fetchChapters(selectedManga.id)}
                >
                  Ler Mangá
                </button>
              </>
            ) : (
              <>
                <h2>{chapters[currentChapterIndex]?.title}</h2>
                <div className={styles.chapterNavigation}>
                  <button
                    disabled={currentChapterIndex <= 0}
                    onClick={() =>
                      fetchPages(chapters[currentChapterIndex - 1].id)
                    }
                  >
                    Capítulo anterior
                  </button>
                  <button
                    disabled={currentChapterIndex >= chapters.length - 1}
                    onClick={() =>
                      fetchPages(chapters[currentChapterIndex + 1].id)
                    }
                  >
                    Próximo capítulo
                  </button>
                </div>
                <div className={styles.pagesContainer}>
                  {pages.map((page, index) => (
                    <img
                      key={index}
                      src={page}
                      alt={`Página ${index + 1}`}
                      className={styles.pageImage}
                    />
                  ))}
                </div>
              </>
            )}
            <button className={styles.closeButton} onClick={closeModal}>
              <i>
                {" "}
                <IoCloseCircle />{" "}
              </i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
