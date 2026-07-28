import Script from "next/script";

export default function Home() {
  return (
    <>
      <div className="office-room" aria-hidden="true">
        <div className="room-wall"></div>
        <div className="room-floor"></div>
        <div className="room-baseboard"></div>
      </div>

      <div className="bg-blobs" aria-hidden="true">
        <span className="blob blob-a"></span>
        <span className="blob blob-b"></span>
        <span className="blob blob-c"></span>
      </div>

      <div className="office-bg" aria-hidden="true">
        <div className="office-window win-a">
          <span className="win-light"></span>
          <span className="win-bar-h"></span>
          <span className="win-bar-v"></span>
        </div>
        <div className="office-window win-b">
          <span className="win-light"></span>
          <span className="win-bar-h"></span>
          <span className="win-bar-v"></span>
        </div>
        <div className="office-clock">
          <span className="clock-hand hour"></span>
          <span className="clock-hand minute"></span>
        </div>
        <div className="office-shelf">
          <span></span><span></span><span></span><span></span>
        </div>
        <div className="office-plant plant-a">
          <span className="plant-leaf l1"></span>
          <span className="plant-leaf l2"></span>
          <span className="plant-leaf l3"></span>
          <span className="plant-pot"></span>
        </div>
        <div className="office-plant plant-b">
          <span className="plant-leaf l1"></span>
          <span className="plant-leaf l2"></span>
          <span className="plant-leaf l3"></span>
          <span className="plant-pot"></span>
        </div>
      </div>

      <header className="app-header">
        <div className="header-left">
          <div className="logo">🏢</div>
          <div className="title-block">
            <h1>合同会社良心 バーチャル支店</h1>
            <p className="subtitle">音声で指示するだけ、みんなが働いてくれる</p>
          </div>
        </div>
        <div className="stats">
          <div className="stat-pill">
            <span className="stat-num" id="statTotal">13</span>
            <span className="stat-label">社員</span>
          </div>
          <div className="stat-pill working">
            <span className="stat-num" id="statWorking">0</span>
            <span className="stat-label">作業中</span>
          </div>
          <div className="stat-pill review">
            <span className="stat-num" id="statReview">0</span>
            <span className="stat-label">要確認</span>
          </div>
          <div className="stat-pill done">
            <span className="stat-num" id="statDone">0/0</span>
            <span className="stat-label">進行中の完了</span>
          </div>
          <button type="button" className="stat-pill worktime-stat" id="openWorkTimeBtn">
            <span className="stat-num">⏱️</span>
            <span className="stat-label">本日の勤務時間</span>
          </button>
          <div className="stat-pill shared-room-stat" id="sharedRoomStatus" title="同じWi-Fiから接続中">
            <span className="stat-num">● 1</span>
            <span className="stat-label">同時接続</span>
          </div>
        </div>
      </header>

      <div id="voiceWarning" className="voice-warning" hidden>
        ⚠️ このブラウザは音声入力(Web Speech API)に対応していない可能性があります。<strong>Google Chrome</strong>での利用をおすすめします。テキスト入力でも指示できます。
      </div>

      <section className="home-hero">
        <div className="home-hero-text">
          <h2>🎤 オフィスに音声で指示する</h2>
        </div>
        <button className="home-mic-btn" id="homeMicBtn" aria-label="音声で指示する">
          <span className="mic-icon">🎤</span>
          音声で指示する
        </button>
      </section>

      <section className="break-room break-room-lobby" id="breakRoom" hidden>
        <button type="button" className="enter-break-room-btn" id="enterBreakRoomBtn">🎮 休憩室</button>
      </section>

      <div className="break-room-page" id="breakRoomPage" hidden>
        <div className="arcade-wall" aria-hidden="true"><i>GAME</i><i>PLAY</i><i>休憩中</i></div>
        <header className="break-page-header">
          <button type="button" id="leaveBreakRoomBtn">← オフィスへ戻る</button>
          <div><h1>🎮 AI社員 GAME LOUNGE</h1><p><strong id="breakPageCount">休憩中 0人</strong> <span id="breakPageNames">現在メンバーはいません</span></p></div>
          <div className="break-page-actions">
            <button type="button" className="break-to-cinema-btn" id="breakToCinemaBtn">🎬 映画館へ行く</button>
            <div className="break-page-live">● LIVE</div>
          </div>
        </header>
        <main className="break-page-content">
          <section className="break-page-topbar">
            <div className="break-points-ranking">
              <button type="button" className="my-points-badge" id="pointsRankingToggle" aria-expanded="false">
                <span>あなたのポイント</span><strong id="ownerPointsDisplay">🪙 0P</strong><i>ランキングを見る ▼</i>
              </button>
              <div className="points-ranking-panel" id="pointsRankingPanel" hidden>
                <div className="break-ranking-title"><strong>🏆 全スタッフ・ポイントランキング</strong><small>毎月27日に全員へ1,000ポイント配布</small></div>
                <div className="break-ranking-list" id="breakPointsRanking"></div>
              </div>
            </div>
          <div className="break-game-list">
            <button type="button" className="break-game-entry" id="openDaifugoBtn">
              <span>🃏</span><span><strong>大富豪</strong><small>4人対戦</small></span><b>遊ぶ</b>
            </button>
            <button type="button" className="break-game-entry jiji-entry" id="openJijiBtn">
              <span>🃏</span><span><strong>ジジ抜き</strong><small>ジジは最後まで秘密</small></span><b>遊ぶ</b>
            </button>
            <button type="button" className="break-game-entry mahjong-entry" id="openMahjongBtn">
              <span>🀄</span><span><strong>麻雀</strong><small>東風ミニ対局</small></span><b>遊ぶ</b>
            </button>
            <button type="button" className="break-game-entry blackjack-entry" id="openBlackjackBtn">
              <span>♠️</span><span><strong>ブラックジャック</strong><small>演出強め</small></span><b>遊ぶ</b>
            </button>
            <button type="button" className="break-game-entry beast-entry" id="openBeastBtn">
              <span>🪲</span><span><strong>モンスターバトル</strong><small>じゃんけん必殺対戦</small></span><b>遊ぶ</b>
            </button>
          </div>
          </section>
          <section className="arcade-floor">
            <div className="lounge-counter" aria-hidden="true"><div className="counter-screen">AI GAME LOUNGE</div><span>🥤</span><span>🍿</span><span>☕</span></div>
            <div className="game-island island-left" aria-hidden="true">
              <div className="island-title">ARCADE ZONE</div>
              <div className="mini-cabinet"><i>👾</i><b>SPACE</b></div><em></em>
              <div className="mini-cabinet"><i>🏎️</i><b>RACING</b></div><em></em>
              <div className="mini-cabinet"><i>🎯</i><b>SKILL</b></div><em></em>
            </div>
            <div className="game-island island-right" aria-hidden="true">
              <div className="island-title">TABLE ZONE</div>
              <div className="mini-cabinet"><i>🃏</i><b>CARDS</b></div><em></em>
              <div className="mini-cabinet"><i>🀄</i><b>MAHJONG</b></div><em></em>
              <div className="mini-cabinet"><i>♠️</i><b>CASINO</b></div><em></em>
            </div>
            <div className="floor-table" aria-hidden="true"><span>♠</span><span>♥</span><b>休憩テーブル</b><span>♣</span><span>♦</span></div>
            <div className="floor-wayfinding" aria-hidden="true">GAME FLOOR　•　FREE DRINK　•　CARD TABLE</div>
            <div className="mascot-row break-room-row" id="breakRoomRow" />
            <div className="arcade-floor-note">キャラクターを押すとオフィスへ呼び戻せます</div>
          </section>
        </main>
      </div>

      <div className="cinema-page" id="cinemaPage" hidden>
        <header className="cinema-header">
          <button type="button" id="leaveCinemaBtn">← オフィスへ戻る</button>
          <div>
            <h1>🎬 AI社員シアター</h1>
            <p>YouTubeのURLを入れて、みんなでスクリーン鑑賞</p>
          </div>
          <span id="cinemaSharedStatus">NOW SHOWING</span>
        </header>
        <main className="cinema-room">
          <div className="cinema-curtain curtain-left" aria-hidden="true" />
          <div className="cinema-curtain curtain-right" aria-hidden="true" />
          <section className="cinema-screen-area">
            <div className="cinema-screen">
              <div className="cinema-placeholder" id="cinemaPlaceholder">
                <span>🎞️</span>
                <strong>YouTubeを映画館で検索</strong>
                <small>観たい動画を検索して選んでください</small>
              </div>
              <iframe
                id="cinemaPlayer"
                title="映画館 YouTubeプレイヤー"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                hidden
              />
            </div>
            <div className="cinema-controls">
              <label htmlFor="cinemaYoutubeSearch">YouTube検索</label>
              <input id="cinemaYoutubeSearch" type="search" placeholder="動画名・チャンネル名を入力" autoComplete="off" />
              <button type="button" id="cinemaSearchBtn">🔎 検索</button>
              <p id="cinemaMessage" aria-live="polite">検索結果から動画を押すと、スクリーンで再生します。</p>
            </div>
            <div className="cinema-search-results" id="cinemaSearchResults" aria-live="polite" />
          </section>
          <div className="cinema-aisle" aria-hidden="true" />
          <section className="cinema-audience" aria-label="鑑賞中のスタッフ">
            <strong>休憩中スタッフ</strong>
            <div className="cinema-audience-row" id="cinemaAudience" />
          </section>
          <section className="cinema-seats" aria-label="映画館の座席">
            {Array.from({ length: 16 }, (_, index) => (
              <div className="cinema-seat" key={index}><i /><b>{String.fromCharCode(65 + Math.floor(index / 8))}{index % 8 + 1}</b></div>
            ))}
          </section>
          <div className="cinema-floor-lights" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
        </main>
      </div>

      <section className="deliverable-vault" aria-labelledby="deliverableVaultTitle">
        <div className="deliverable-vault-header">
          <div className="deliverable-vault-icon">🗄️</div>
          <div>
            <h2 id="deliverableVaultTitle">完成物保管庫</h2>
            <p>スタッフが完成させたデータを自動保存。後からいつでも開いたり、ダウンロードできます。</p>
          </div>
          <span className="deliverable-vault-count" id="deliverableVaultCount">0件保存</span>
          <button type="button" className="deliverable-vault-toggle" id="deliverableVaultToggle" aria-expanded="false">
            完成物を見る
          </button>
        </div>
        <div className="deliverable-vault-grid" id="deliverableVaultGrid">
          <p className="deliverable-vault-empty">完成物はまだありません。スタッフの作業が完了すると、ここへ自動保存されます。</p>
        </div>
      </section>
      <button type="button" className="deliverable-vault-backdrop" id="deliverableVaultBackdrop" aria-label="保管庫を閉じる" hidden></button>

      <div className="modal-overlay" id="workTimeOverlay" hidden>
        <div className="modal worktime-modal" role="dialog" aria-modal="true" aria-labelledby="workTimeTitle">
          <button className="modal-close" id="workTimeClose" aria-label="閉じる">✕</button>
          <div className="worktime-heading">
            <span>⏱️</span>
            <div><h3 id="workTimeTitle">本日の勤務時間</h3><p>本日、成果物を実際に生成していた処理時間のみ</p></div>
          </div>
          <div className="worktime-summary" id="workTimeSummary"></div>
          <div className="worktime-list" id="workTimeList"></div>
        </div>
      </div>

      <div className="modal-overlay" id="spiOverlay" hidden>
        <div className="modal spi-modal" role="dialog" aria-modal="true" aria-labelledby="spiTitle">
          <button className="modal-close" id="spiClose" aria-label="閉じる">✕</button>
          <div className="spi-heading">
            <div id="spiStaffAvatar"></div>
            <div><span id="spiStaffRole">SPIテスト担当者</span><h3 id="spiTitle">れいなの適性テスト</h3><p id="spiSubtitle">言語・非言語・性格傾向を順番に実施します</p></div>
          </div>
          <div id="spiWelcome">
            <div className="spi-guide"><b>受検前のご案内</b><p id="spiGuideText">全12問・制限時間12分です。能力問題8問と性格質問4問を出題します。</p></div>
            <label className="interview-label" htmlFor="spiCandidateName">受検者名</label>
            <input className="interview-input" id="spiCandidateName" placeholder="例：山田 花子" />
            <label className="interview-label" htmlFor="spiCandidateJob">応募職種</label>
            <input className="interview-input" id="spiCandidateJob" placeholder="例：営業担当" />
            <label className="interview-label" htmlFor="spiCandidateAge">年齢</label>
            <input className="interview-input" id="spiCandidateAge" type="number" min="15" max="100" inputMode="numeric" placeholder="例：28" />
            <button type="button" className="btn-done-lg spi-start-btn" id="spiStart">テストを開始</button>
          </div>
          <div id="spiSession" hidden>
            <div className="spi-progress-head"><span id="spiCategory">言語問題</span><strong id="spiTimer">12:00</strong></div>
            <div className="spi-progress-track"><div id="spiProgressBar"></div></div>
            <div className="spi-question-count" id="spiQuestionCount">1 / 12</div>
            <div className="spi-question" id="spiQuestion"></div>
            <div className="spi-options" id="spiOptions"></div>
            <div className="spi-actions"><button type="button" className="btn-secondary" id="spiPrevious">前の問題</button><button type="button" className="btn-primary" id="spiNext" disabled>次の問題</button></div>
          </div>
          <div id="spiResult" hidden>
            <div className="spi-result-mark">📊</div>
            <h3 id="spiResultTitle">テスト結果</h3>
            <div id="spiResultBody"></div>
            <p className="spi-disclaimer">このテストは社内用の練習・参考評価です。正式な検査や採用判断を代替するものではありません。</p>
            <button type="button" className="btn-done-lg" id="spiFinish">結果を保存して閉じる</button>
          </div>
        </div>
      </div>

      <nav className="office-room-switcher" aria-label="部屋を切り替える">
        <button type="button" className="active" data-office-room="operations">
          <span>🤝</span><strong>採用・経理</strong>
        </button>
        <button type="button" data-office-room="tiktok">
          <span>🎬</span><strong>TikTok運用</strong>
        </button>
      </nav>

      <main className="layout">
        <section className="office-floor" id="officeFloor" aria-label="チーム一覧" />

        <aside className="activity-log" aria-label="業務ログ">
          <h2>📋 業務ログ</h2>
          <div className="log-list" id="logList">
            <p className="log-empty">まだログはありません。社員のマスコットを押して指示を出してみましょう!</p>
          </div>
        </aside>
      </main>

      {/* instruction modal */}
      <div className="modal-overlay" id="modalOverlay" hidden>
        <div className="modal mic-modal" role="dialog" aria-modal="true">
          <button className="modal-close" id="modalClose" aria-label="閉じる">✕</button>
          <div className="modal-mascot" id="modalMascot"></div>
          <h3 id="modalStaffName"></h3>
          <p className="modal-role" id="modalStaffRole">話し終えたら「完了」を押してください</p>

          <div className="mic-stage">
            <button className="mic-big" id="modalMicBtn" aria-label="マイクで話す">
              <span className="mic-icon">🎤</span>
              <span className="mic-ring"></span>
            </button>
            <p className="mic-hint" id="modalMicHint">🔴 聞き取り中…</p>
          </div>

          <div className="transcript-box" id="modalTranscript">
            <span className="transcript-placeholder">ここに話した内容が表示されます…</span>
          </div>

          <div className="modal-footer-btns">
            <button className="btn-cancel-lg" id="modalCancelBtn">キャンセル</button>
            <button className="btn-done-lg" id="modalDoneBtn">✓ 完了</button>
          </div>

          <details className="text-fallback-details">
            <summary>またはテキストで入力する</summary>
            <div className="text-fallback">
              <input type="text" id="modalTextInput" placeholder="指示内容を入力…" />
              <button id="modalTextSend">送信</button>
            </div>
          </details>

          <details className="prompt-input-details" id="promptInputDetails">
            <summary>作業内容のプロンプトを入力</summary>
            <div className="prompt-input-panel">
              <div id="promptTextFields">
                <label htmlFor="modalPromptInput">作ってほしい成果物の詳しい内容</label>
                <textarea
                  id="modalPromptInput"
                  rows={6}
                  placeholder={"例：20代女性向けのTikTok台本を作成。\n冒頭3秒で興味を引き、明るく親しみやすい口調にする。\n動画の長さは30秒。最後に行動を促す一言を入れる。\nハッシュタグ：#美容 #時短 #おすすめ"}
                ></textarea>
                <p className="prompt-help">構成・口調・対象者・長さ・入れたい言葉やハッシュタグなどを自由に書けます。</p>
              </div>
              <button type="button" id="modalPromptSend">この内容で作業を依頼</button>
            </div>
          </details>
        </div>
      </div>

      <div className="modal-overlay" id="daifugoOverlay" hidden>
        <div className="modal daifugo-modal" role="dialog" aria-modal="true" aria-labelledby="daifugoTitle">
          <button className="modal-close" id="daifugoClose" aria-label="閉じる">✕</button>
          <div className="game-work-notice" id="gameWorkNotice" hidden>
            <div id="gameWorkNoticeCharacter"></div>
            <div>
              <strong>作業完了のお知らせ</strong>
              <p id="gameWorkNoticeText"></p>
            </div>
            <button type="button" id="gameWorkNoticeClose" aria-label="通知を閉じる">✕</button>
          </div>
          <div className="daifugo-title-row">
            <span>🃏</span>
            <div>
              <h3 id="daifugoTitle">福利厚生ルーム・大富豪</h3>
              <p>スタッフを3人呼んで遊びましょう</p>
            </div>
            <button type="button" className="game-bgm-toggle" id="gameBgmToggle" aria-pressed="true">🎵 BGMオン</button>
          </div>
          <div className="youtube-bgm-player" id="youtubeBgmPlayer" hidden></div>
          <div id="daifugoSetup">
            <div className="game-lounge-banner">
              <span>☕</span>
              <div><strong>休憩中のスタッフだけ参加できます</strong><small>一緒に遊ぶスタッフを3人選んでください</small></div>
            </div>
            <div className="game-staff-grid" id="gameStaffGrid"></div>
            <div className="game-wager-panel">
              <label htmlFor="daifugoBet">🪙 1人あたりの掛けポイント</label>
              <input id="daifugoBet" type="number" min="1" step="1" defaultValue="10" />
              <span id="daifugoPotPreview">合計40ポイントを1位が獲得</span>
            </div>
            <button type="button" className="btn-done-lg game-start-btn" id="startDaifugoBtn" disabled>3人選ぶとゲーム開始</button>
          </div>
          <div id="daifugoGame" hidden>
            <div className="game-opponents" id="gameOpponents"></div>
            <div className="game-table">
              <p id="gameTurnLabel">ゲーム開始！</p>
              <div className="game-talk" id="gameTalk">
                <span>🃏</span>
                <p>みんなで楽しく遊ぼう！</p>
              </div>
              <div className="table-card" id="tableCard">場札なし</div>
              <p className="game-message" id="gameMessage"></p>
            </div>
            <div className="player-area">
              <div className="player-heading"><strong>あなたの手札</strong><span id="playerCardCount"></span></div>
              <div className="player-hand" id="playerHand"></div>
              <div className="game-actions">
                <button type="button" className="btn-secondary" id="gamePassBtn">パス</button>
                <button type="button" className="btn-primary" id="gamePlayBtn" disabled>選んだカードを出す</button>
              </div>
            </div>
            <details className="game-rules">
              <summary>かんたんルール</summary>
              <p>同じ数字なら2枚・3枚・4枚をまとめて出せます。場と同じ枚数で、より強い数字を出してください。強さは3→4→…→K→A→2。8切り、4枚出しの革命、全員パス後の場流しに対応しています。最初に手札がなくなった人が大富豪です。</p>
            </details>
            <button type="button" className="game-restart-btn" id="gameRestartBtn">メンバーを選び直す</button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="jijiOverlay" hidden>
        <div className="modal daifugo-modal jiji-modal" role="dialog" aria-modal="true" aria-labelledby="jijiTitle">
          <button className="modal-close" id="jijiClose" aria-label="閉じる">✕</button>
          <div className="daifugo-title-row">
            <span>🃏</span>
            <div><h3 id="jijiTitle">福利厚生ルーム・ジジ抜き</h3><p>抜かれたカードは最後まで誰にも分かりません</p></div>
            <button type="button" className="game-bgm-toggle" id="jijiBgmToggle" aria-pressed="true">🎵 BGMオン</button>
          </div>
          <div className="youtube-bgm-player" id="jijiYoutubePlayer" hidden></div>
          <div id="jijiSetup">
            <div className="game-lounge-banner">
              <span>☕</span><div><strong>休憩中のスタッフだけ参加できます</strong><small>一緒に遊ぶスタッフを3人選んでください</small></div>
            </div>
            <div className="game-staff-grid" id="jijiStaffGrid"></div>
            <div className="game-wager-panel">
              <label htmlFor="jijiBet">🪙 1人あたりの掛けポイント</label>
              <input id="jijiBet" type="number" min="1" step="1" defaultValue="10" />
              <span id="jijiPotPreview">合計40ポイントを1位が獲得</span>
            </div>
            <button type="button" className="btn-done-lg game-start-btn" id="startJijiBtn" disabled>3人選ぶとゲーム開始</button>
          </div>
          <div id="jijiGame" hidden>
            <div className="jiji-secret">
              <span className="mystery-card">?</span>
              <div><strong>抜かれたジジ</strong><small id="jijiSecretText">ゲーム終了まで秘密</small></div>
            </div>
            <div className="game-opponents" id="jijiOpponents"></div>
            <div className="jiji-table">
              <p id="jijiTurnLabel"></p>
              <div className="game-talk" id="jijiTalk"><span>🃏</span><p>誰がジジを持っているかな…？</p></div>
              <div className="jiji-draw-area" id="jijiDrawArea"></div>
              <p className="game-message" id="jijiMessage"></p>
            </div>
            <div className="player-area">
              <div className="player-heading"><strong>あなたの手札</strong><span id="jijiPlayerCount"></span></div>
              <div className="player-hand" id="jijiPlayerHand"></div>
            </div>
            <button type="button" className="game-restart-btn" id="jijiRestartBtn">メンバーを選び直す</button>
          </div>
          <div className="escape-celebration" id="escapeCelebration" hidden>
            <div className="confetti">🎉 ✨ 🎊 ✨ 🎉</div>
            <div id="escapeCharacter"></div>
            <h3 id="escapeTitle"></h3><p id="escapeText"></p>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="interviewOverlay" hidden>
        <div className="modal interview-modal" role="dialog" aria-modal="true" aria-labelledby="interviewTitle">
          <button className="modal-close" id="interviewClose" aria-label="閉じる">✕</button>
          <div className="interview-header">
            <div id="interviewAsuka"></div>
            <div>
              <span>面接担当者</span>
              <h3 id="interviewTitle">あすかのAI面接</h3>
              <p>回答に合わせて質問を進めます</p>
            </div>
          </div>

          <div id="interviewWelcome">
            <div className="interview-note">
              <strong>面接を始める前に</strong>
              <p>SPI・漢字・算数の完了後に面接へ進みます。マイクを使って対話し、音声が使えない場合はテキストでも回答できます。</p>
            </div>
            <div className="interview-criteria" id="interviewCriteria" hidden>
              <strong>📌 あすかに設定された採用基準</strong>
              <p id="interviewCriteriaText">採用基準が未設定です。あすかの歯車から設定できます。</p>
            </div>
            <div className="interview-person-fields">
              <div>
                <label className="interview-label" htmlFor="interviewCandidateName">応募者名</label>
                <input className="interview-input" id="interviewCandidateName" placeholder="例：山田 花子" />
              </div>
              <div>
                <label className="interview-label" htmlFor="interviewJob">応募職種</label>
                <input className="interview-input" id="interviewJob" placeholder="例：SNS運用担当" />
              </div>
              <div>
                <label className="interview-label" htmlFor="interviewCandidateAge">年齢</label>
                <input className="interview-input" id="interviewCandidateAge" type="number" min="15" max="100" inputMode="numeric" placeholder="例：28" />
              </div>
            </div>
            <p className="interview-age-note">年齢はレポートの記録欄にのみ表示し、AIの採点には使用しません。</p>
            <label className="interview-record-consent">
              <input type="checkbox" id="interviewRecordConsent" />
              <span><strong>面接映像の録画に同意する</strong><small>録画はこのMac内だけに保存され、人間の採用担当者による確認用です。</small></span>
            </label>
            <button type="button" className="btn-done-lg interview-start" id="interviewStart">🎙️ 面接を開始</button>
          </div>

          <div id="interviewSession" hidden>
            <div className="interview-video-stage" id="interviewVideoStage">
              <div className="interview-video-room" aria-hidden="true">
                <span className="interview-window"></span>
                <span className="interview-desk"></span>
                <span className="interview-plant">🪴</span>
              </div>
              <div className="interview-video-asuka" id="interviewVideoAsuka"></div>
              <video className="interview-candidate-video" id="interviewCandidateVideo" autoPlay muted playsInline hidden></video>
              <div className="interview-live-badge"><i></i> LIVE 面接</div>
              <div className="interview-video-name"><strong>あすか</strong><span>面接担当者</span></div>
              <div className="interview-video-caption" id="interviewQuestion">面接開始後、あすかが最初の質問をします</div>
            </div>
            <div className="interview-call-controls">
              <div className="interview-answer-status" id="interviewAnswerStatus">質問の読み上げ後に自動で聞き取りを開始します</div>
              <button type="button" className="interview-mic" id="interviewMic">🎤<span>マイクで回答</span></button>
              <textarea className="interview-answer" id="interviewAnswer" rows={4} hidden></textarea>
              <button type="button" className="btn-done-lg interview-end-btn" id="interviewNext">面接を終了</button>
            </div>
          </div>

          <div id="interviewReport" hidden>
            <div className="interview-report-title">📋 面接評価レポート</div>
            <div id="interviewReportBody"></div>
            <p className="interview-human-note">この評価はAIによる推奨です。正式な合否は人間の採用担当者が確認してください。</p>
            <div className="interview-recording-review" id="interviewRecordingReview" hidden>
              <strong>🎥 人間による映像確認</strong>
              <p>この映像はAI評価には使われていません。職務に関係する回答内容だけを人間が確認してください。</p>
              <video id="interviewRecordedVideo" controls playsInline></video>
              <button type="button" className="btn-secondary" id="interviewDownloadRecording">録画をMacに保存</button>
            </div>
            <button type="button" className="btn-primary interview-finish" id="interviewFinish">面接を終了</button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="blackjackOverlay" hidden>
        <div className="modal daifugo-modal blackjack-modal" role="dialog" aria-modal="true">
          <button className="modal-close" id="blackjackClose" aria-label="閉じる">✕</button>
          <div className="daifugo-title-row"><span>♠️</span><div><h3>ブラックジャック</h3><p>休憩中のスタッフを誘ってみんなで勝負</p></div></div>
          <div className="youtube-bgm-player" id="blackjackYoutubePlayer" hidden></div>
          <div id="blackjackSetup">
            <div className="game-lounge-banner"><span>🪙</span><div><strong id="blackjackDealerInfo">参加スタッフを選んでください</strong><small>休憩中のスタッフを1〜4人まで誘えます</small></div></div>
            <div className="game-staff-grid" id="blackjackStaffGrid"></div>
            <div className="game-wager-panel"><label htmlFor="blackjackBet">今回の掛けポイント</label><input id="blackjackBet" type="number" min="1" step="1" defaultValue="10" /><span id="blackjackBetInfo"></span></div>
            <button type="button" className="btn-done-lg game-start-btn" id="startBlackjackBtn">ゲーム開始</button>
          </div>
          <div id="blackjackGame" hidden>
            <div className="blackjack-players-strip" id="blackjackPlayersStrip"></div>
            <div className="blackjack-control-bar">
              <span id="blackjackControlHint">カードを配っています…</span>
              <div className="game-actions"><button className="btn-secondary" id="blackjackHit" disabled>ヒット</button><button className="btn-primary" id="blackjackStand" disabled>スタンド</button></div>
              <button className="blackjack-exit-btn" id="blackjackEnd">ゲーム終了</button>
            </div>
            <div className="blackjack-table" id="blackjackTable">
              <div className="blackjack-marquee" aria-hidden="true"><span>◆</span><span>●</span><span>◆</span><span>●</span><span>◆</span><span>●</span><span>◆</span><span>●</span></div>
              <div className="blackjack-stage-flash" id="blackjackStageFlash" hidden></div>
              <div className="blackjack-side"><div className="blackjack-dealer-character" id="blackjackDealerCharacter"></div><strong id="blackjackDealerName">ディーラー</strong><span id="dealerScore"></span><div className="blackjack-hand" id="dealerHand"></div></div>
              <div className="blackjack-center"><b>BLACKJACK</b><div className="blackjack-chips">🪙 🟣 🟡 🔵 🪙</div><span id="blackjackPot"></span><h3 id="blackjackMessage">勝負！</h3></div>
              <div className="blackjack-side"><strong>あなた</strong><span id="playerScore"></span><div className="blackjack-hand" id="blackjackPlayerHand"></div></div>
            </div>
            <button className="game-restart-btn" id="blackjackRestart" hidden>もう一度遊ぶ</button>
          </div>
          <div className="blackjack-celebration" id="blackjackCelebration" hidden><span className="cracker left">🎉</span><strong id="blackjackCelebrateText"></strong><span className="cracker right">🎉</span><i>✨ 🎊 ✨ 🎊 ✨</i><div id="blackjackParticles"></div></div>
        </div>
      </div>

      <div className="modal-overlay" id="mahjongOverlay" hidden>
        <div className="modal daifugo-modal mahjong-modal" role="dialog" aria-modal="true">
          <button className="modal-close" id="mahjongClose" aria-label="閉じる">✕</button>
          <div className="daifugo-title-row"><span>🀄</span><div><h3>麻雀・東風ミニ対局</h3><p>休憩中のスタッフ3名とポイント勝負</p></div></div>
          <div className="youtube-bgm-player" id="mahjongYoutubePlayer" hidden></div>
          <div id="mahjongSetup">
            <div className="game-lounge-banner"><span>☕</span><div><strong id="mahjongMembers">対局メンバーを確認中</strong><small>休憩中の3名を自動招集します</small></div></div>
            <div className="game-wager-panel"><label htmlFor="mahjongBet">1人あたりの掛けポイント</label><input id="mahjongBet" type="number" min="1" step="1" defaultValue="10" /><span id="mahjongBetInfo"></span></div>
            <button type="button" className="btn-done-lg game-start-btn" id="startMahjongBtn">対局開始</button>
          </div>
          <div id="mahjongGame" hidden>
            <div className="mahjong-table" id="mahjongTable"></div>
            <h3 className="mahjong-message" id="mahjongMessage">配牌中…</h3>
            <button className="game-restart-btn" id="mahjongRestart">もう一度対局する</button>
          </div>
        </div>
      </div>

      <div className="modal-overlay" id="beastOverlay" hidden>
        <div className="modal beast-modal" role="dialog" aria-modal="true" aria-labelledby="beastTitle">
          <button className="modal-close" id="beastClose" aria-label="閉じる">✕</button>
          <div className="beast-header">
            <span>⚡</span><div><h3 id="beastTitle">MONSTER CLASH ARENA</h3><p>じゃんけんに勝って必殺技を叩き込め！</p></div><span>⚡</span>
          </div>
          <div id="beastSetup">
            <div className="beast-setup-row">
              <label>対戦相手<select id="beastOpponent"></select></label>
              <label>掛けポイント<input id="beastBet" type="number" min="1" step="1" defaultValue="10" /></label>
              <span id="beastPotInfo"></span>
            </div>
            <h4>相棒モンスターを選択</h4>
            <div className="beast-monster-grid" id="beastMonsterGrid"></div>
            <button type="button" className="btn-done-lg game-start-btn" id="startBeastBtn" disabled>モンスターを選んでください</button>
          </div>
          <div id="beastGame" hidden>
            <div className="beast-stage" id="beastStage">
              <div className="beast-round-hud"><span id="beastRoundLabel">ROUND 1</span><b>MONSTER CLASH</b><span id="beastPotHud">POT 0P</span></div>
              <div className="beast-flash" id="beastFlash" hidden></div>
              <div className="beast-fighter player" id="beastPlayer"></div>
              <div className="beast-versus">VS</div>
              <div className="beast-fighter enemy" id="beastEnemy"></div>
              <div className="beast-effect-layer" id="beastEffectLayer"></div>
              <div className="beast-round-message" id="beastMessage">技を選べ！</div>
              <div className="beast-rps" id="beastRps">
                <button type="button" data-hand="rock"><b>✊</b><span>グー</span><small>ブレイクスマッシュ</small></button>
                <button type="button" data-hand="scissors"><b>✌️</b><span>チョキ</span><small>クロスラッシュ</small></button>
                <button type="button" data-hand="paper"><b>✋</b><span>パー</span><small>エナジーバースト</small></button>
              </div>
            </div>
            <div className="beast-actions">
              <button type="button" className="game-restart-btn" id="beastRestart" hidden>もう一度対戦</button>
              <button type="button" className="blackjack-exit-btn" id="beastEnd">ゲーム終了</button>
            </div>
          </div>
        </div>
      </div>

      {/* result / review modal */}
      <div className="modal-overlay" id="resultOverlay" hidden>
        <div className="modal result-modal" role="dialog" aria-modal="true">
          <button className="modal-close" id="resultClose" aria-label="閉じる">✕</button>
          <div className="modal-avatar" id="resultAvatar"></div>
          <h3 id="resultStaffName"></h3>
          <p className="result-badge">✅ 完了しました・確認をお願いします</p>
          <div className="deliverable-box" id="deliverableBox"></div>
          <div className="result-data-actions" aria-label="完成データの操作">
            <button className="result-open-btn" id="openDeliverableBtn">↗ その場で大きく開く</button>
            <button className="result-download-btn" id="downloadDeliverableBtn">⬇ データをダウンロード</button>
          </div>
          <div className="result-actions">
            <button className="btn-secondary" id="copyBtn">📋 コピー</button>
            <button className="btn-secondary" id="pdfBtn">📄 PDFで保存</button>
            <button className="btn-primary" id="approveBtn">👍 確認しました</button>
          </div>
        </div>
      </div>

      {/* per-staff prompt / strengths settings modal (no API/model config here — see .env.local) */}
      <div className="modal-overlay" id="staffSettingsOverlay" hidden>
        <div className="modal settings-modal" role="dialog" aria-modal="true">
          <button className="modal-close" id="staffSettingsClose" aria-label="閉じる">✕</button>
          <div className="modal-mascot" id="staffSettingsMascot"></div>
          <h3 id="staffSettingsName"></h3>
          <p className="modal-role" id="staffSettingsRole"></p>

          <label className="settings-label" id="staffPromptLabel" htmlFor="staffPromptInput">🗒️ カスタムプロンプト(この社員への指示・性格設定)</label>
          <textarea id="staffPromptInput" className="settings-textarea" rows={4} placeholder="例: 明るくテンポの良い口調で、10代〜20代向けにわかりやすく台本を書いてください。"></textarea>
          <p className="asuka-prompt-help" id="asukaPromptHelp" hidden>ここに書いた詳細を引用し、応募職種と組み合わせて、あすか専用の面接プロンプトを自動作成します。</p>
          <div className="interview-practical-task interview-video-prompt" id="asukaVideoPromptSettings" hidden>
            <strong>🎥 動画評価プロンプト</strong>
            <p>録画から確認する職務上の実演内容・手順・採点基準を設定します。</p>
            <textarea className="settings-textarea" id="interviewVideoEvaluationPrompt" rows={4} placeholder="例：商品説明の実演を確認。特徴を2つ説明できたか、対象者を明示したか、60秒以内に完了したかを評価してください。"></textarea>
            <small>容姿・表情・視線・緊張などは評価対象にできません。</small>
          </div>

          <div className="settings-row" id="staffTraitsSettings">
            <div className="settings-col">
              <label className="settings-label" htmlFor="staffStrengthsInput">💪 得意なこと</label>
              <textarea id="staffStrengthsInput" className="settings-textarea" rows={2} placeholder="例: テンポの良いフック作り、トレンド分析"></textarea>
            </div>
            <div className="settings-col">
              <label className="settings-label" htmlFor="staffWeaknessesInput">🌀 苦手なこと</label>
              <textarea id="staffWeaknessesInput" className="settings-textarea" rows={2} placeholder="例: 長尺の台本、専門的な法律用語"></textarea>
            </div>
          </div>

          <div className="modal-footer-btns">
            <button className="btn-cancel-lg" id="staffSettingsCancel">キャンセル</button>
            <button className="btn-done-lg" id="staffSettingsSave">💾 保存</button>
          </div>
        </div>
      </div>

      {/* accounting department */}
      <div className="modal-overlay accounting-overlay" id="accountingOverlay" hidden>
        <div className="modal accounting-modal" role="dialog" aria-modal="true" aria-labelledby="accountingTitle">
          <button className="modal-close" id="accountingClose" aria-label="閉じる">✕</button>
          <header className="accounting-header">
            <div className="accounting-avatar">🧾</div>
            <div>
              <span>経理部・請求書担当</span>
              <h3 id="accountingTitle">みさきの請求書デスク</h3>
              <p>音声またはテキストから、送付しやすい高画質の請求書画像を作成します</p>
            </div>
          </header>

          <nav className="accounting-tabs" aria-label="経理メニュー">
            <button type="button" className="active" data-accounting-tab="clients">クライアント一覧・登録</button>
            <button type="button" data-accounting-tab="settings">設定</button>
            <button type="button" data-accounting-tab="history">履歴</button>
          </nav>

          <section className="accounting-panel" data-accounting-panel="create" hidden>
            <div className="accounting-voice-box">
              <div>
                <strong>音声・自然文で依頼</strong>
                <small>言い直しがある場合は、最後に話した内容を採用します</small>
              </div>
              <button type="button" id="accountingMicBtn">🎤 音声入力</button>
              <textarea id="accountingInstruction" rows={3} placeholder="例：株式会社山田工業、動画編集費5万円、税込み。請求日は今日、支払いは来月末。"></textarea>
              <button type="button" className="btn-primary" id="accountingParseBtn">内容を読み取る</button>
              <p id="accountingParseStatus" aria-live="polite"></p>
            </div>

            <div className="invoice-selected-client">
              <span>音声で選択された請求先</span>
              <strong id="invoiceSelectedClientName">まだ選択されていません</strong>
              <small>送り先は「請求先管理」で事前登録し、上の音声指示で会社名・略称・呼び名を伝えてください。</small>
              <select id="invoiceClientSelect" hidden aria-hidden="true"><option value="">未選択</option></select>
            </div>

            <div className="invoice-form-grid">
              <label>請求日
                <input id="invoiceDate" type="date" />
              </label>
              <label>支払期限
                <input id="invoiceDueDate" type="date" />
              </label>
              <label>締め日
                <input id="invoiceClosingDate" type="date" />
              </label>
              <label>対象期間
                <input id="invoicePeriod" placeholder="例：2026年7月分" />
              </label>
              <label>税区分
                <select id="invoiceTaxMode"><option value="included">税込</option><option value="excluded">税抜</option></select>
              </label>
            </div>

            <div className="invoice-items-heading">
              <strong>請求明細</strong>
              <button type="button" id="invoiceAddItem">＋ 明細を追加</button>
            </div>
            <div className="invoice-items" id="invoiceItems"></div>
            <div className="invoice-form-grid invoice-bottom-fields">
              <label>値引き
                <input id="invoiceDiscount" type="number" min="0" defaultValue="0" />
              </label>
              <label>請求書番号（空欄で自動採番）
                <input id="invoiceNumber" placeholder="INV-YYYYMMDD-001" />
              </label>
              <label className="wide">備考
                <textarea id="invoiceNote" rows={2}></textarea>
              </label>
            </div>
            <div className="invoice-live-total" id="invoiceLiveTotal">ご請求予定額：¥0</div>
            <button type="button" className="btn-done-lg invoice-create-button" id="invoiceCreatePdf">請求書画像を作成</button>
          </section>

          <section className="accounting-panel active" data-accounting-panel="clients">
            <div className="accounting-split">
              <div>
                <div className="accounting-section-title"><strong>登録済みクライアント</strong><button type="button" id="newAccountingClient">＋ クライアント追加</button></div>
                <p className="client-list-help">登録済みの名前を押すと、右側で内容を修正できます。</p>
                <div id="accountingClientList" className="accounting-list"></div>
              </div>
              <form id="accountingClientForm" className="accounting-card">
                <input type="hidden" id="clientId" />
                <h4 id="accountingClientFormTitle">新しいクライアントを追加</h4>
                <p className="client-single-entry-help">法人名または個人名、郵便番号、住所、担当者、呼び名、支払条件などを、分けずにまとめて話すか入力してください。LINEグループ内でその請求先を指定すると、そのグループが請求書の送信先として自動登録されます。</p>
                <button type="button" id="clientRegistrationMic" className="client-registration-mic">🎤 音声でまとめて入力</button>
                <textarea id="clientRegistrationText" className="client-single-entry" rows={12} required placeholder="法人の例：株式会社山田工業。郵便番号920-0000、住所は石川県金沢市〇〇1-2-3。営業部の山田太郎さん。月末締め翌月末払い。&#10;&#10;個人の例：山田太郎。個人の請求先。郵便番号920-0000、住所は石川県金沢市〇〇1-2-3。"></textarea>
                <p id="clientRegistrationStatus" className="client-registration-status" aria-live="polite"></p>
                <div className="accounting-form-actions"><button type="button" className="btn-secondary" id="deleteAccountingClient">無効化</button><button type="submit" className="btn-primary">この内容で登録・保存</button></div>
              </form>
            </div>
          </section>

          <section className="accounting-panel" data-accounting-panel="settings">
            <div className="accounting-settings-grid">
              <div className="accounting-card">
                <h4>請求元情報</h4>
                <label>会社名<input id="issuerCompanyName" /></label>
                <div className="two-cols"><label>郵便番号<input id="issuerPostalCode" /></label><label>代表者役職<input id="issuerRepresentativeTitle" /></label></div>
                <label>住所<input id="issuerAddress" /></label>
                <label>代表者名<input id="issuerRepresentativeName" /></label>
                <div className="two-cols"><label>電話番号<input id="issuerPhone" /></label><label>メール<input id="issuerEmail" /></label></div>
                <label>適格請求書発行事業者登録番号<input id="issuerRegistrationNumber" /></label>
              </div>
              <div className="accounting-card">
                <h4>振込先・請求書設定</h4>
                <label>金融機関名<input id="bankName" /></label>
                <label>支店名<input id="bankBranchName" /></label>
                <div className="two-cols"><label>預金種別<input id="bankAccountType" /></label><label>口座番号<input id="bankAccountNumber" /></label></div>
                <label>口座名義<input id="bankAccountName" /></label>
                <div className="two-cols"><label>消費税率<input id="invoiceDefaultTaxRate" type="number" /></label><label>請求番号接頭文字<input id="invoiceNumberPrefix" /></label></div>
                <label>振込手数料の定型文<textarea id="invoiceFeeNote" rows={3}></textarea></label>
              </div>
            </div>
            <button type="button" className="btn-done-lg accounting-save-settings" id="accountingSaveSettings">設定を保存</button>
          </section>

          <section className="accounting-panel" data-accounting-panel="history">
            <div className="accounting-section-title"><strong>請求書履歴</strong><span id="accountingHistoryCount"></span></div>
            <div id="accountingHistoryList" className="accounting-history"></div>
          </section>
        </div>
      </div>

      <Script src="/app.js?v=20260728-line-group-routing" strategy="afterInteractive" />
    </>
  );
}
