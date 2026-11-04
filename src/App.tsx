import { useEffect, useRef, useState } from "react";
import "./App.css";

type Song = {
  title: string;
  info: string;
  begin: string;
};

const DATA_URL = "https://kalz2q.github.io/gakufu006/";

const shuffleSongs = (items: Song[]) => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getAudioUrl = (title: string) =>
  `${DATA_URL}${encodeURIComponent(title)}.mp3`;

const getScoreUrl = (title: string) =>
  `${DATA_URL}${encodeURIComponent(title)}.svg`;

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = songs[currentIndex];

  useEffect(() => {
    fetch(`${DATA_URL}songs.json`)
      .then((response) => {
        if (!response.ok) throw new Error("曲データを取得できません");
        return response.json();
      })
      .then((data: Song[]) => {
        setSongs(shuffleSongs(data));
        setLoading(false);
      })
      .catch(() => {
        setError(
          "曲データを読み込めませんでした。通信状態を確認してください。",
        );
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (shouldPlay && audioRef.current) {
      audioRef.current.play().catch(() => {
        setShouldPlay(false);
        setError("音声を再生できませんでした。");
      });
    }
  }, [currentIndex, shouldPlay]);

  const previousSong = () => {
    setCurrentIndex((index) => (index - 1 + songs.length) % songs.length);
  };

  const nextSong = () => {
    setCurrentIndex((index) => (index + 1) % songs.length);
  };

  const togglePlay = () => {
    if (shouldPlay) {
      audioRef.current?.pause();
      setShouldPlay(false);
    } else {
      setError("");
      setShouldPlay(true);
    }
  };

  if (loading) {
    return <main className="app">曲データを読み込んでいます...</main>;
  }

  if (error && songs.length === 0) {
    return <main className="app">{error}</main>;
  }

  if (!currentSong) {
    return <main className="app">曲がありません。</main>;
  }

  return (
    <main className="app">
      {/* <header className="header">
        <h1>Music Box</h1>
        <p>{songs.length} 曲</p>
      </header> */}

      <section className="player">
        {/* <div className="song-number">
          {currentIndex + 1} / {songs.length}
        </div> */}

        {/* <h2 className="song-title">{currentSong.title}</h2> */}
        <p className="song-info">
          {"musicbox "}
          {songs.length}
          {"曲 "}
          {currentSong.title} {currentSong.info}{" "}
          {currentSong.begin && <b>歌い出し:{currentSong.begin}</b>}
        </p>

        {/* {currentSong.begin && (
          <p className="song-begin">歌い出し：{currentSong.begin}</p>
        )} */}

        <audio
          ref={audioRef}
          src={getAudioUrl(currentSong.title)}
          onEnded={nextSong}
          onError={() => setError("音声ファイルを読み込めませんでした。")}
        />

        <div className="controls">
          <button onClick={previousSong}>前へ</button>
          <button onClick={togglePlay} className="play-button">
            {shouldPlay ? "一時停止" : "再生"}
          </button>
          <button onClick={nextSong}>次へ</button>
        </div>

        {error && <p className="error">{error}</p>}
      </section>

      <section className="score">
        <img
          src={getScoreUrl(currentSong.title)}
          alt={`${currentSong.title}の楽譜`}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      </section>
    </main>
  );
}

export default App;
