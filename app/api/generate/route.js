import { getStoreValue } from "@/lib/supabaseStore";
import { MANA_COMPANY_KNOWLEDGE, MANA_NARRATION_REFERENCE } from "./mana-narration-reference";

const STAFF_JOBS = {
  elf_sketch: { role: "寸劇系台本制作担当", kind: "creative", model: "gpt-5.6-terra", hiyoriReference: true },
  elf_if: { role: "もしもシリーズ系台本担当", kind: "creative", model: "gpt-5.6-terra" },
  elf_lively: { role: "にぎやか系台本制作担当", kind: "creative", model: "gpt-5.6-terra", referenceStyle: true },
  elf_jobs: { role: "求人系台本担当", kind: "creative", model: "gpt-5.6-terra" },
  mana_jobs: { role: "求人台本制作担当", organization: "マナコーポレーション", kind: "creative", model: "gpt-5.6-terra", scriptType: "求人" },
  mana_narration: { role: "語り台本制作担当", organization: "マナコーポレーション", kind: "creative", model: "gpt-5.6-terra", narrationReference: true },
  miyabis_ads: { role: "広告台本制作担当", organization: "ミヤビス", kind: "creative", model: "gpt-5.6-terra", scriptType: "広告" },
  kabayaki_script: { role: "TikTok台本制作担当", organization: "かばやき屋", kind: "creative", model: "gpt-5.6-terra", scriptType: "運用代行" },
  ryoshin_jobs: { role: "求人TikTok台本担当", organization: "合同会社良心", kind: "creative", model: "gpt-5.6-terra", scriptType: "求人" },
  ryoshin_video_editor: { role: "TikTok動画編集担当", organization: "合同会社良心", kind: "production", model: "gpt-5.6-terra" },
  yuki: { role: "YouTube台本制作", kind: "creative", model: "gpt-5.6-terra" },
  mirai: { role: "TikTok台本制作", kind: "creative", model: "gpt-5.6-terra" },
  koharu: { role: "動画編集", kind: "production", model: "gpt-5.6-terra" },
  sora: { role: "Instagram投稿制作", kind: "creative", model: "gpt-5.6-terra" },
  hinata: { role: "SNS運用戦略", kind: "analysis", model: "gpt-5.6-sol", web: true },
  nodoka: { role: "コメント・DM対応", kind: "creative", model: "gpt-5.6-luna" },
  akari: { role: "UGC動画制作", kind: "production", model: "gpt-5.6-terra" },
  aoi: { role: "ブログ記事執筆", kind: "creative", model: "gpt-5.6-terra" },
  tsumugi: { role: "サムネイルデザイン", kind: "image", model: "gpt-image-2" },
  ren: { role: "SEOリサーチ", kind: "analysis", model: "gpt-5.6-sol", web: true },
  itsuki: { role: "トレンド・ハッシュタグ調査", kind: "analysis", model: "gpt-5.6-terra", web: true },
  madoka: { role: "週次レポート作成", kind: "analysis", model: "gpt-5.6-terra" },
};

const ELF_SHOP_SETTING = `店舗名：えるふろんてぃあ
所在地：石川県金沢市片町
業態：異世界コンセプトカフェ＆バー
来店客の呼び方：勇者様
案内文：勇者様のご入国をお待ちしております
営業時間：日曜〜木曜は19時から24時、金曜・土曜は20時から24時`;

const ELF_BUSINESS_HOURS_RULE = `営業時間を台本に使う場合は、日曜〜木曜は19時開店、金曜・土曜は20時開店、閉店は全日24時を厳守する。
営業前、開店直前、閉店後などの時刻を出す場合も、設定した曜日と営業時間を矛盾させない。
曜日を決めずに具体的な開店時刻を出す場合は、日曜〜木曜の営業日として19時を使う。
朝10時など、営業時間と無関係な時刻を開店時刻として扱わない。`;
const ELF_INTERIOR_SETTING = `実際の店内:
- 木目調の直線的なカウンター
- カウンター前に黒いハイチェアが並ぶ
- 赤茶色のレンガ調の壁
- 天井付近に緑の葉と白・淡紫色の垂れ下がる花の装飾
- 床の一部に緑の人工芝と白い化粧石
- 明るい窓がある
台本で店内を扱う場合は、この写真で確認できる場所と設備を前提にする。写真で確認できない個室、ステージ、大型厨房、階段などを勝手に追加しない。`;

const ELF_CHARACTER_SETTING = `ユウ❤️：2100歳、誕生日は12月、マイペース
サラ🩵：2100歳、誕生日は6月、元気
ヒスイ💚：2100歳、誕生日は未設定、おっとり優等生
マリィ🤍：2200歳、誕生日は未設定、ふわふわ妹系`;

const ELF_REFERENCE_STYLE = `参考TikTok：
第一参考：https://www.tiktok.com/@kurokano_
第二参考：https://www.tiktok.com/@ibkurfjehwl
あまねでは第二参考の「休憩時間のような、スタッフ同士のバタバタしたトーク」の雰囲気を最優先する。

参考チャンネルから取り入れる構造:
- 台本を演じている感じではなく、スタッフの日常を偶然撮ったような会話にする
- 冒頭から、食べ物を開ける、スマホを見せ合う、衣装を探す、失敗を謝るなど、目で理解できる具体的な行動を一つ始める
- 動画一つにつき事件は一つだけにし、その物や行動を最後まで話の軸にする
- 「当事者または困っている人」「からかう・割り込む人」「様子を見て最後に反応する人」という関係を作る
- 新人と先輩、注意する側とされる側、いじる側といじられる側など、その場の人間関係が笑いを動かすようにする
- 一人一文を短くし、質問、即答、割り込み、周囲の反応を重ねる。割り込みは必ず同じ事件への反応にする
- 第二参考を特に重視し、休憩中のテーブルやカウンターで全員が普通のことをしている最中に、恥ずかしい発覚、軽いいたずら、予想外の返答が起きる構成にする
- 撮影者を登場させる場合は男性。企画を説明する、質問する、指示を出す、スタッフにツッコまれる役として使う
- 第二参考に近い企画型では、男性撮影者が簡単な質問やゲームを始め、スタッフが半分困りながら参加し、回答や指さしから普段の関係性が自然に発覚する構成を使う
- 企画型のオチは、最後の質問で全員が撮影者を選ぶ、撮影者の撮り直しや無茶ぶり自体が問題だと返されるなど、企画を始めた男性へ笑いが返る形を優先する
- 男性撮影者を毎回登場させない。依頼で指定がなければ、企画型と女性スタッフだけの自然会話型を内容に合わせて使い分ける
- 女性スタッフだけの型では、休憩、準備、片付け、食べ物、私物など一つの出来事から始め、普段の関係性が出る会話と立場の逆転で終える
- 中盤は、本人の言い訳、別スタッフの暴露、周囲の反応の順で、社会的な気まずさを一段ずつ大きくする
- 最後は、いじっていた側が困る、真面目な話が harmless な悪ふざけへ変わる、隠していた事実が本人へ返るなど、立場が反転する一言で終える
- セリフで状況を説明しすぎず、人物が見ている物と直前の発言への生の反応として話す
- 10〜16行を目安に、不要な相づちや独白を削り、各行に新しい反応か状況の進展を入れる
- 「休憩中に別の用事が次々入る」という同じ型へ毎回固定しない

参考先の台本、固有キャラクター、セリフ、映像、音源は複製しない。構造とテンポだけを参考にし、えるふろんてぃあ用に完全新規制作する。`;

const HIYORI_REFERENCE_STYLE = `ひより専用の参考TikTok：
1. https://www.tiktok.com/@magical_lollipop_akb_/video/7357289365913079041
   「実際にあった接客トラブルを再現するコンカフェ寸劇」の構造を参考にする。
2. https://www.tiktok.com/@enchant_shizuoka/video/7578476928475221256
   「接客中の表向きの言動と、女の子側の本音・心の声の差を見せるショートドラマ」の構造を参考にする。
3. https://www.tiktok.com/@sleepcastle/video/7597138132458425617
   「相手を批判した本人の言動にも同じ矛盾が見つかり、最後に大きなブーメランとして返る会話コント」の構造を参考にする。

制作ルール:
- 完成尺は約1分（55〜65秒）を基準にする。セリフは自然な間を含めて14〜20行程度にし、短すぎる一発ネタで終わらせない
- えるふろんてぃあの実在する店内、既存キャラクター、営業時間など、登録済み設定へ置き換えて完全新規制作する
- 店舗は石川県金沢市片町にある異世界コンセプトカフェ＆バー。お客様は「勇者様」、来店は「入国」と呼ぶ
- 片町はJR駅から離れた繁華街なので、「終電」を定番の退出理由やオチとして使わない。土地勘に合わない交通事情を勝手に作らない
- 出演キャラクターは、ユウ❤️（2100歳・誕生日12月・マイペース）、サラ🩵（2100歳・誕生日6月・元気）、ヒスイ💚（2100歳・誕生日未設定・おっとり優等生）、マリィ🤍（2200歳・誕生日未設定・ふわふわ妹系）
- キャラクター設定を説明文として読み上げず、ユウは急かされても自分のペース、サラは明るく即反応、ヒスイは穏やかに整理して矛盾を指摘、マリィは柔らかい言葉で意外な核心を突くなど、会話と行動へ反映する
- 誕生日未設定のキャラクターについて、日付や月を勝手に作らない
- 実在する店内は、木目調の直線カウンター、黒いハイチェア、赤茶色のレンガ調壁、天井付近の緑の葉と白・淡紫色の垂れ下がる花、床の一部の緑の人工芝と白い化粧石、明るい窓を前提にする
- 写真で確認できない個室、ステージ、大型厨房、階段などを追加しない
- この店舗にチェキは存在しない。チェキ、チェキ券、チェキ撮影を台本へ出さない
- コンカフェで実際に起こりそうな一つの接客場面を選ぶ。実話風にする場合も、事実だと断定せず「再現ドラマ」または創作として扱う
- 冒頭0〜2秒で「どんな客・どんな本音・どんなトラブルか」が分かる強い見出しを出す
- お客様役とキャスト役の会話を短く往復させ、要求や違和感を一段ずつ強める
- 危険行為や迷惑行為を笑って容認せず、キャストが境界線を示す、別スタッフが助ける、店のルールで収めるなど安全な結末にする
- お客様への暴言、侮辱、蔑称、容姿批判、人格否定、威圧的な追い返し、差別表現は一切書かない
- お客様に問題行為があっても「安全のためお控えください」「ルールを守っていただけない場合は退店をお願いします」のように、冷静で丁寧な接客表現で伝える
- 笑いの対象はお客様の尊厳や属性ではなく、会話の矛盾、思い込み、状況の逆転に置く
- 本音型では「接客中に実際に言うセリフ」と「心の声・本音」を明確に区別し、表情やテロップでギャップを見せる
- 一人称の本音だけを並べず、目の前の相手の発言や行動を受けて心の声が変化するようにする
- 中盤は同じ問題を2〜3段階だけエスカレートさせ、途中で別の事件へ飛ばない
- 0〜10秒で状況と論点を提示し、10〜45秒で同じ問題を3段階に発展させ、45〜55秒で矛盾を発覚させ、最後の5〜10秒で冒頭の発言を回収する明確なオチを入れる
- 人物が指摘、反論、質問をするときは、その直前に原因となる相手の発言・行動・目に見える物を必ず置く。前触れのない話題や説明のためだけのセリフから始めない
- 最後は、キャストの切り返し、本音の漏れ、別スタッフの一言、店側のルール提示など、それまでの流れを回収する短いオチで終える。単なる説明、仲直り、注文追加だけをオチにしない
- 縦画面の顔寄り、二人の切り返し、表情アップ、強調テロップなど、少人数・店内で撮影できるカットを中心にする
- 参考元の店舗名、衣装、人物、セリフ、出来事、テロップ文言、音源はコピーしない。参考にするのは構造、テンポ、視点の切り替えだけ`;

const HIYORI_TRANSCRIPT_ANALYSIS = `参考動画の文字起こしから抽出した構成:

【型A：接客トラブル再現・反復エスカレート型】
1. 第三者または同僚が、問題客の行動パターンへ最初に気づき、動画の論点を一言で提示する
2. お客様役が髪飾りなど目に見える物を褒めながら手を伸ばす
3. キャストがその場ですぐ制止し、店のルールを短く明確に伝える
4. お客様役が「触るつもりではない」と偶然を装って言い訳する
5. 別スタッフが「見るだけなら手を伸ばす必要はない」のように、言い訳の矛盾を具体的に指摘する
6. 注文など通常接客へ一度戻し、別の商品や店内設備に関わる場面で同じ問題が再発する
7. 周囲のスタッフが次の行動を予測し、視聴者へ「また起きる」と期待させる
8. 距離が近づく場面では、立ち位置や間隔など安全ルールを先に説明する
9. それでも再発したら、謝罪や言い訳だけで流さず、退店・出入り禁止など店側の結論を明確にする
10. 最後に第三者が「コンカフェの接客は大変」のような短い客観コメントを添えて締められる

同じやり取りをただ繰り返さない。各反復で「対象物」「距離が近づく理由」「店側の警戒」「結末」を一段ずつ進める。
再現ドラマ型は依頼に合わせて45〜90秒も使用できる。問題客の行為を面白く推奨せず、キャストの安全と店の境界線を明確にする。

【型B：表向きの接客と本音の交互型】
1. キャストが短く名乗る、または通常接客を始める
2. 好みのお客様など、キャストの心が動く出来事を見た瞬間の本音を、最初のフックとして出す
3. 表向きには恋人の有無など自然な質問をする
4. お客様の返答を受け、口には出さない喜び・期待・計算を心の声で即座に返す
5. お客様の自慢話や何気ない発言には、接客上の受け答えと本音の温度差を作る
6. 別スタッフが退店時刻など現実的な情報を伝え、楽しい時間に制限を入れる
7. キャストの「もっといてほしい」という本音を出し、その気持ちが延長や推しの提案など次の行動へつながる
8. 最後は、それまで隠していた本音が選択や一言に表れた瞬間で締める

心の声は必ず直前の相手の発言への反応にし、単独の説明ナレーションにしない。
台本では「口に出すセリフ」「心の声」「第三者のセリフ」を明記する。表向きと本音を交互に置き、ギャップが一読で分かるようにする。
本音型は20〜40秒を基本にし、心の声が実際の行動へつながる因果関係を作る。

型A・型B・型Cのうち依頼内容に合う一つだけを選び、一つの動画へ複数の型を詰め込まない。`;

const HIYORI_BOOMERANG_ANALYSIS = `【型C：特大ブーメラン会話型】
1. お客様役またはキャスト役が、相手の仕事、言動、建前など一つの論点を軽く指摘する
2. 指摘された側は短く説明し、論点をずらさず返す
3. 指摘した側がさらに理由を重ね、自分は例外だと思っていることが伝わる発言をする
4. 別スタッフまたは相手が、その人自身にも同じ矛盾がある事実を一つだけ明かす
5. 指摘した側が言い訳し、その言い訳によって矛盾がさらに大きくなる
6. 最後は短い一言で「最初に批判したことが本人へ返った」と分かるオチにする

約1分の中で、前振り、言い分の強まり、矛盾の証拠、言い逃れ、ブーメランの順に段階を作る。
オチは直前に急に追加した情報ではなく、冒頭か中盤に見せた発言・物・行動を再利用して成立させる。
元動画の暴言や強い侮辱は模倣しない。お客様を笑いものにせず、えるふろんてぃあで自然に起こる注文、推し、SNS、営業時間などの軽い話題へ置き換える。
接客中は最後まで丁寧語を保つ。問題行為への注意も冷静で明確な表現にする。
型A・型B・型Cから依頼に最も合う一つだけを選び、複数の型を無理に混ぜない。`;

const AMANE_SETTING_APPLICATION = `あまねは「えるふろんてぃあの裏側」を見せる台本を作る。
- 基本場面はカウンター付近での短い休憩時間。食べる、スマホを見せる、小物を確認する、衣装を探す、失敗を謝るなど、誰でも分かる一つの行動を起点にする
- 会話は「具体的な行動→小さな問題の発覚→本人の反応→別スタッフの割り込みまたは暴露→周囲の反応→立場が逆転する回収」の順で作る
- キャストは3名を基本にし、当事者、からかう・割り込む人、観察して最後に効く反応をする人の役割を持たせる
- 男性撮影者を使う場合は話者名を「男性撮影者」にし、女性キャストとして数えない。撮影者は画面外から企画を振り、スタッフの自然な反応を引き出す
- 忙しさではなく、普段から知っているスタッフ同士だからできる軽いいじり、気まずさ、素の反応でバタバタ感を作る
- 「勇者様」「入国」「異世界」などの世界観ワードは原則使わない。依頼テーマに直接必要な場合だけ自然に使う
- 店舗紹介や宣伝文句を会話へ無理に入れない
- 実際のカウンター、黒いハイチェア、レンガ調の壁、植物と花の装飾などを、裏側の日常が起きる場所として扱う
- 出演者は必要最小限の2〜3名を基本にする
- ユウはマイペースで短くズレた返答をする
- サラは元気に話を進め、反応を一段大きくする
- ヒスイはおっとりした言葉で状況を整理し、優等生らしく訂正する
- マリィはふわふわした妹らしい受け取り方で、素直な一言を返す
- 出演しない人物の設定は無理に入れない
- 年齢、誕生日、営業時間は依頼テーマに必要な場合だけ使い、設定紹介のためだけに言わせない
- キャラクター名を入れ替えても成立する台本は禁止。少なくとも二人の性格が展開そのものに影響するようにする`;

const AMANE_VARIATIONS = [
  "全員同時回答型：男性撮影者の簡単な質問に全員が一斉に答え、回答の食い違いから普段の関係性が見え、最後は撮影者へツッコミが返る",
  "すれ違い連鎖型：一人の短いお願いを別々の意味で受け取り、訂正するたびに別の人が割り込み、最後に最初のお願いの意味が一言で確定する",
  "共同作業崩壊型：片付け・掃除・開店準備など一つの目的へ協力するが、性格ごとの進め方が噛み合わず、意外な人だけ目的を達成する",
  "静かな爆弾発言型：普通の会話の中で一人がさらっと核心を言い、全員が一拍遅れて同時に反応し、その後の短い応酬で笑いを広げる",
  "多数決・指さし型：二択や担当決めを全員で行い、予想外の全員一致や本人だけ違う回答からオチへ進む",
  "本人だけ未察知型：周囲は目の前の違和感に気づいているが本人だけ普通に話し続け、ヒントへの反応がズレたまま最後に本人が気づく",
  "軽いブーメラン型：誰かが別の人を注意するが、会話の途中で注意した本人も同じことをしていたと分かる。暴露の連続にはせず一発で返す",
  "即興ルール追加型：その場の簡単なゲームや順番決めを始め、回答のたびに自然なルールが一つずつ増え、最初に始めた人が最後に困る",
];
let lastAmaneVariationIndex = -1;

function nextAmaneVariation() {
  const offset = 1 + Math.floor(Math.random() * (AMANE_VARIATIONS.length - 1));
  lastAmaneVariationIndex = (lastAmaneVariationIndex + offset + AMANE_VARIATIONS.length)
    % AMANE_VARIATIONS.length;
  return AMANE_VARIATIONS[lastAmaneVariationIndex];
}

const ELF_STANDARD_SCRIPT_FORMAT = `出演者はテーマに合う1〜4名を選び、各キャラクターの性格をセリフとリアクションへ反映する。
追加指示がなければ尺は20〜40秒。縦画面で実際に撮影できる内容にする。
基本構成:
1. 冒頭で事件や違和感が分かるフック
2. 会話と動きで状況を見せる
3. 一つの意外な展開で盛り上げる
4. それまでの流れから理解できるオチで終える

出力形式:
- タイトル
- 狙い／想定尺
- 出演キャスト
- 「【絵コンテ 1｜0〜2秒】」形式で、各カットの画面構図、人物配置、表情、動き、カメラ、セリフ、テロップ、効果音
- 撮影用の詳細台本
- 撮影時の注意
- 投稿キャプション案
- ハッシュタグ案`;

const ELF_LIVELY_SCRIPT_FORMAT = `出演者は基本3名を選び、各キャラクターの性格を会話へ自然に反映する。
追加指示がなければ20〜40秒、12〜18行程度の会話量にする。

展開ルール:
1. カウンター付近での短い休憩時間を基本にし、全員が関われる一つの具体的な行動と一つの社会的な事件へ絞る
2. 台本を書く前に、現実の行動を時間順に並べる。例：座る→プリンの蓋を開ける→スプーンがないと気づく→周囲を探す→スタッフへ聞く。必要な動作や発見を飛ばさない
3. 最初のセリフは「あれ、スプーンないじゃん」のように、その生活動作の途中で本人が自然に気づいたことから始める
4. セリフだけでも、直前に何をしようとして、何が足りず、なぜ次の発言になったか分かるようにする
5. 各セリフは必ず直前のセリフへの返答・反応・質問のいずれかにする
6. 中盤では当事者の言い訳、別スタッフの暴露、周囲の反応を重ね、気まずさや立場の変化を段階的に上げる
7. 新しい人物、物、ルール、過去の出来事を説明なしで途中から出さない
8. 登場人物の知っていること、知らないこと、目的を途中で矛盾させない
9. 最後は冒頭または中盤の情報を回収し、初見でも理由が分かる短いオチにする
10. 一つの台本に複数の事件や設定を詰め込まない

出力はセリフのみ。各行を必ず「ユウ：セリフ」または「男性撮影者：セリフ」の形式にする。
タイトル、説明、秒数、場面設定、ト書き、動作、表情、カメラ、テロップ、効果音、絵コンテ、撮影時の注意、キャプション、ハッシュタグは一切出力しない。
セリフ内で不自然な状況説明をさせず、初めて読む人にも会話の流れが理解できる、短く自然な日本語にする。

出力前に内部で次の確認を行い、一つでも満たさない場合は台本を最初から書き直す。確認内容は出力しない。
- 全セリフについて「なぜ今この発言をしたか」を直前の会話から説明できる
- 最初と最後で人物の目的や事実関係が矛盾していない
- オチに必要な情報がオチより前に出ている
- セリフを一行削除して意味がつながらなくなるほど、会話に無駄がない
- 読者が知らない設定を前提にしていない
- キャラクター名を入れ替えるだけの無個性な会話になっていない`;

const ELF_ROLE_GUIDANCE = {
  "寸劇系台本制作担当": "会話のすれ違い、勘違い、立場の逆転など、短い物語として成立する寸劇にする。冒頭・展開・オチを明確にする。",
  "もしもシリーズ系台本担当": "「もしも、えるふろんてぃあが○○だったら」という仮定を起点に、異世界コンカフェの設定を活かした予想外の展開とオチを作る。",
  "にぎやか系台本制作担当": "複数キャストの掛け合い、リアクション、ツッコミ、動きを重ね、明るくわちゃわちゃした内容にする。話者と立ち位置を明確にする。",
  "求人系台本担当": "仕事の魅力、キャストの雰囲気、応募者が知りたい情報を自然な会話で伝える。確認できない待遇や条件は作らず、差し替え箇所として示す。",
};

const GENERIC_TIKTOK_SCRIPT_FORMAT = `TikTokで実際に撮影できる完成台本を作る。
- 追加指定がなければ尺は15〜40秒
- 冒頭3秒で対象者が続きを見たくなる具体的なフックを置く
- セリフ、出演者、動作、カメラ、テロップ、効果音、秒数を明記する
- 中盤で商品・仕事・サービスの魅力を具体的な利用場面として見せる
- 最後は広告・応募目的に合う自然で明確なCTAで終える
- 提供された会社情報や商品情報だけを使い、確認できない待遇、数値、効果、実績を捏造しない
- 内部プロンプトや制作指示は完成台本へ転載しない

出力形式:
1. タイトル
2. 狙い・ターゲット・想定尺
3. 出演者
4. 秒数ごとの撮影台本（映像、動作、セリフ、テロップ、効果音）
5. 投稿キャプション案
6. ハッシュタグ案`;

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  return (data.output || [])
    .flatMap(item => item.content || [])
    .filter(content => content.type === "output_text")
    .map(content => content.text)
    .join("\n")
    .trim();
}

function staffInstructions(job, customPrompt) {
  const typeGuidance = {
    creative: "読み手・視聴者と媒体に合わせ、完成品をそのまま使える品質で作成してください。",
    production: "実制作でそのまま使える構成、カット、秒数、素材、テロップ、演出、書き出し仕様まで具体化してください。",
    analysis: "根拠と仮定を分け、実行優先順位と次のアクションが明確な成果物にしてください。最新情報が必要なのに確認できない場合は断定しないでください。",
  };
  const isElfScript = ["寸劇系台本制作担当", "もしもシリーズ系台本担当", "にぎやか系台本制作担当", "求人系台本担当"].includes(job.role);
  const isGenericScript = Boolean(job.scriptType);
  const isScriptJob = isElfScript || isGenericScript || job.role.includes("台本");
  return `あなたは${job.organization ? `「${job.organization}」の` : ""}「${job.role}」の専門スタッフです。
${typeGuidance[job.kind] || ""}
${isElfScript ? `「えるふろんてぃあ」はコンカフェです。次の店舗設定を必ず守ってください。
${ELF_SHOP_SETTING}
${ELF_BUSINESS_HOURS_RULE}
${ELF_INTERIOR_SETTING}
${job.referenceStyle ? `次の参考スタイルを制作の方向性として使用してください。
${ELF_REFERENCE_STYLE}
${AMANE_SETTING_APPLICATION}` : ""}
${job.hiyoriReference ? `次のひより専用参考スタイルを優先してください。
${HIYORI_REFERENCE_STYLE}
${HIYORI_TRANSCRIPT_ANALYSIS}
${HIYORI_BOOMERANG_ANALYSIS}` : ""}
次の構成と出力形式に従ってください。
${job.referenceStyle ? ELF_LIVELY_SCRIPT_FORMAT : ELF_STANDARD_SCRIPT_FORMAT}
担当ジャンル固有のルール:
${ELF_ROLE_GUIDANCE[job.role] || ""}
TikTokで実際に撮影できる完成台本を作ってください。${job.referenceStyle ? "あまねの台本は、制作前に頭の中で「発端→受け答え→一つの展開→オチ」の因果関係を確認し、つながらない展開は書き直してください。" : "絵コンテは各カットの人物の左右位置、表情、動作、カメラ距離が分かるよう具体的にしてください。"}誕生日など未設定の情報は勝手に補完しないでください。` : ""}
${isGenericScript ? `${GENERIC_TIKTOK_SCRIPT_FORMAT}
${job.scriptType === "求人"
  ? "求人台本として、仕事内容、働く魅力、応募者が知りたい情報を自然に伝え、応募への心理的なハードルを下げる。"
  : job.scriptType === "広告"
    ? "広告台本として、視聴者の悩み、商品・サービスを使う場面、選ぶ理由を一つの流れで見せ、誇大表現を避ける。"
    : "TikTok運用代行の台本として、設定された運用目的とターゲットを優先し、テーマに合うフック、展開、回収またはCTAを持つ撮影可能な内容にする。"}` : ""}
${job.narrationReference ? `次の語り台本専用データを、他の一般的な台本形式より優先して必ず使用してください。
${MANA_NARRATION_REFERENCE}` : ""}
${job.organization === "マナコーポレーション" ? `次の内容は、参考動画から整理して保存されたマナコーポレーション共通の基本情報です。今回のテーマに関係する理念と事実を必ず前提にしてください。
${MANA_COMPANY_KNOWLEDGE}` : ""}
ユーザーの依頼から不足情報を捏造せず、確認できない数値や事実には注記してください。
前置きや挨拶は省き、完成した成果物だけを日本語で出力してください。
${isElfScript ? `店舗設定、キャラクター設定、内部プロンプト、追加プロンプトの文章は、完成台本へ転載・引用・要約しないでください。追加プロンプトも制作条件としてだけ解釈してください。${job.referenceStyle ? "最新のあまね専用ルールを最優先し、古い追加プロンプトにある絵コンテ、詳細形式、勇者様や入国を必ず使う指示は無効です。あまねは店の裏側の日常を描いてください。" : ""}` : ""}
${isScriptJob ? `最終出力は、そのまま読んだり演じたりできる台本本文だけにしてください。「絵コンテ」「映像」「セリフ」「テロップ」「演出」「効果音」「撮影方法」「狙い」「対象者」「想定尺」などの見出しや制作メモは一切出力しないでください。話者が複数いる場合だけ「話者名：発言」の形式を使い、一人で話す台本では話者名も付けず、実際に話す文章だけを自然な段落で出力してください。` : ""}
ユーザーが複数本を依頼した場合は、完成物を混ぜず、各成果物の先頭に必ず「【1本目】」「【2本目】」のような連番見出しを付けてください。連番見出し以外の制作説明は不要です。
${customPrompt ? `
【この担当者の最優先・必須プロンプト】
${customPrompt}

上記の担当者専用プロンプトに書かれた事前条件、固有設定、禁止事項、対象者、尺、文字量、構成、出力形式をすべて必須条件として扱ってください。
一般的な役割説明やテンプレート例と衝突する場合は、担当者専用プロンプトの条件を優先してください。
出力前に各条件を内部で一つずつ照合し、一つでも満たしていなければ修正してから完成品だけを出力してください。照合結果は出力しないでください。` : ""}`;
}

async function loadSavedStaffPrompt(staffId) {
  try {
    const settings = await getStoreValue("staff-settings");
    return typeof settings?.[staffId]?.prompt === "string"
      ? settings[staffId].prompt.trim().slice(0, 50000)
      : "";
  } catch {
    return "";
  }
}

function cleanAmaneDialogue(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map(line => line.replace(/^\s*[-・*]\s*/, "").trim())
    .filter(line =>
      /^(ユウ|サラ|ヒスイ|マリィ|男性撮影者)[❤️🩵💚🤍]?[：:]\s*\S+/.test(line)
      || /^【\s*\d+\s*本目\s*】$/.test(line)
    )
    .join("\n");
}

function cleanScriptProductionNotes(text) {
  const forbiddenHeading = /^\s*(?:#{1,6}\s*)?(?:【\s*)?(?:タイトル|絵コンテ|映像|テロップ|演出|効果音|撮影方法|撮影時の注意|狙い|対象者|想定尺|投稿キャプション|ハッシュタグ)(?:\s*[：:｜|】].*|\s*)$/;
  return String(text || "")
    .replace(/^```[^\n]*\n?/gm, "")
    .replace(/```$/gm, "")
    .split(/\r?\n/)
    .filter(line => !forbiddenHeading.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanNarrationScript(text) {
  return cleanScriptProductionNotes(text)
    .split(/\r?\n/)
    .filter(line => !/^\s*※/.test(line))
    .map(line => line.replace(/^\s*(?:代表|社長|演者|ナレーション)[：:]\s*/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function requestTextResponse(job, instructions, input, effort = "low") {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: job.model,
      instructions,
      input,
      reasoning: { effort },
      max_output_tokens: 5000,
      ...(job.web ? { tools: [{ type: "web_search" }] } : {}),
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "成果物を生成できませんでした。");
  return extractOutputText(data);
}

async function generateText(job, instruction, customPrompt) {
  const effectiveCharacterSettings = ["寸劇系台本制作担当", "もしもシリーズ系台本担当", "にぎやか系台本制作担当", "求人系台本担当"].includes(job.role) ? ELF_CHARACTER_SETTING : "";
  const amaneVariation = job.referenceStyle ? nextAmaneVariation() : "";
  const inputText = `${instruction}
${effectiveCharacterSettings ? `\n出演キャラクター設定:\n${effectiveCharacterSettings}` : ""}
${amaneVariation ? `\n今回だけ使用する構成（次回は別構成にする）:\n${amaneVariation}` : ""}`;
  const generated = await requestTextResponse(
    job,
    staffInstructions(job, customPrompt),
    inputText,
    job.referenceStyle ? "high" : job.kind === "analysis" ? "medium" : "low"
  );
  let content = job.referenceStyle ? cleanAmaneDialogue(generated) : generated;
  if (job.referenceStyle && content) {
    const edited = await requestTextResponse(
      job,
      `あなたはショートコント専門の厳しい構成作家です。
次のあまね台本を、参考チャンネルの高レベルなエンタメ構造に合わせて全面的に編集してください。

必須基準:
1. 今回指定された構成を守り、休憩中の発覚・言い訳・暴露・立場逆転という定番型へ勝手に戻さない
2. まず現実の行動順序を内部で作り、物を手に取る前に探したことになったり、問題に気づく前に解決を求めたりする前後逆転をなくす
3. 1行目から質問、同時回答、お願い、作業中の一言、さらっとした爆弾発言など、今回の構成に合う強い発端を置く。「物がない」という気づきに固定しない
4. 全てのセリフが直前の発言への自然な返答になっている
5. 3〜4名を基本に、短い即答、割り込み、二人同時の反応、ツッコミへの追いツッコミを重ね、中盤に最低2回は会話の温度を上げる。ただし大声の記号や無関係な発言でごまかさない
6. 各キャラクターの性格が、言葉遣いだけでなく展開を動かす
7. 最後は冒頭か中盤を回収するが、立場逆転だけに固定しない。全員一致、本人だけ未察知、無言の間、撮影者への返し、意外な人の勝利など、今回の構成に合う強いオチにする
8. 14〜22行、基本3〜4人、一人一文は短くする。少なくとも一度は3人以上が連続して即反応するワイワイした応酬を入れる
9. 不条理、唐突な新情報、無関係な発言、寒い言葉遊び、大声だけのオチは禁止
10. 見本のセリフや固有設定はコピーしない
11. 具体的な行動、スタッフ間の関係、事件の引き金、反応の拡大、立場の逆転が全部そろっている
12. 「用事が次々入る」だけの既存パターンへ固定せず、説明のためだけのセリフを削る
13. 撮影者が登場する場合は必ず男性とし、スタッフを巻き込んだ企画が最後に男性撮影者へ返る構造を候補にする
14. 男性撮影者を毎回出さず、依頼に合う場合は女性スタッフだけの会話で完結させる
15. 時刻を出す場合は、曜日と営業時間（日曜〜木曜19時、金曜・土曜20時、全日24時閉店）が一致している
16. ただ仲良く会話して終わる、注意して謝って終わる、説明して納得して終わる台本は不合格。最後の一言で視聴者が状況を再解釈できる笑いを作る
17. 「え？」「ちょっと待って」「なんで？」だけを増やしてワイワイ感を作らない。各発言に新しい情報、選択、反応、関係性の変化のどれかを持たせる

設定:
${ELF_SHOP_SETTING}
${ELF_BUSINESS_HOURS_RULE}
${ELF_INTERIOR_SETTING}
${ELF_CHARACTER_SETTING}
${ELF_REFERENCE_STYLE}
${AMANE_SETTING_APPLICATION}

今回の構成:
${amaneVariation}

内部で「辻褄」「テンポ」「ワイワイ感」「笑い」「オチ」「過去の定番型からの変化」を各100点で採点し、どれか一つでも85点未満なら全面的に再構成してください。採点は出力しません。
最終出力は「話者名：セリフ」だけにしてください。`,
      `元の依頼:\n${instruction}\n\n編集前の台本:\n${content}`,
      "high"
    );
    content = cleanAmaneDialogue(edited) || content;
  }
  if (customPrompt && content.trim()) {
    try {
      const checked = await requestTextResponse(
        job,
        `あなたは完成物の条件照合担当です。
担当者専用プロンプトの事前条件、固有設定、禁止事項、尺、文字量、構成、出力形式を一つずつ内部で照合してください。
違反が一つでもあれば、元の依頼の意図を保ったまま完成物を修正してください。すべて満たしていれば内容を変えずに返してください。
分析、採点、確認結果、前置きは出力せず、使用可能な完成物だけを返してください。

【担当者専用プロンプト】
${customPrompt}`,
        `元の依頼:\n${instruction}\n\n照合対象の完成物:\n${content}`,
        "low"
      );
      content = job.referenceStyle ? (cleanAmaneDialogue(checked) || content) : (checked.trim() || content);
    } catch (error) {
      console.error("Custom prompt verification error:", job.role, error);
    }
  }
  if (job.scriptType || job.role.includes("台本") || job.role.includes("寸劇")) {
    content = cleanScriptProductionNotes(content);
  }
  if (job.narrationReference) {
    content = cleanNarrationScript(content);
  }
  if (!content.trim()) throw new Error("台本の会話形式を確認できなかったため、生成をやり直してください。");
  return { type: "text", content, model: job.model };
}

async function generateImage(job, instruction, customPrompt) {
  const prompt = `プロのサムネイルデザイナーとして、次の依頼に合う横長のサムネイル画像を完成させてください。
視認性が高く、主役が明確で、小さい表示でも内容が伝わる構図にしてください。
日本語文字を入れる場合は短く正確にしてください。
依頼: ${instruction}
${customPrompt ? `追加デザイン指示: ${customPrompt}` : ""}`;
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: job.model,
      prompt,
      size: "1536x1024",
      quality: "medium",
      output_format: "png",
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "画像を生成できませんでした。");
  const imageBase64 = data.data?.[0]?.b64_json;
  if (!imageBase64) throw new Error("生成画像を受け取れませんでした。");
  return {
    type: "image",
    content: `サムネイル画像を生成しました。\n\n制作指示: ${instruction}`,
    image: `data:image/png;base64,${imageBase64}`,
    model: job.model,
  };
}

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OPENAI_API_KEYが設定されていません。" }, { status: 503 });
  }

  const {
    staffId,
    instruction = "",
    customPrompt = "",
  } = await request.json();
  const job = STAFF_JOBS[staffId];
  if (!job) return Response.json({ error: "このスタッフの生成APIは未設定です。" }, { status: 400 });
  if (!String(instruction).trim()) return Response.json({ error: "作業指示がありません。" }, { status: 400 });

  try {
    const savedPrompt = await loadSavedStaffPrompt(staffId);
    const effectivePrompt = savedPrompt || String(customPrompt).trim().slice(0, 50000);
    const result = job.kind === "image"
      ? await generateImage(job, String(instruction).slice(0, 12000), effectivePrompt)
      : await generateText(
          job,
          String(instruction).slice(0, 12000),
          effectivePrompt
        );
    return Response.json({
      ...result,
      role: job.role,
      promptApplied: Boolean(effectivePrompt || job.narrationReference),
      promptCharacters: effectivePrompt.length
        + (job.narrationReference ? MANA_NARRATION_REFERENCE.length : 0)
        + (job.organization === "マナコーポレーション" ? MANA_COMPANY_KNOWLEDGE.length : 0),
    });
  } catch (error) {
    console.error("Staff generation API error:", staffId, error);
    return Response.json({ error: error.message || "成果物生成に失敗しました。" }, { status: 502 });
  }
}
