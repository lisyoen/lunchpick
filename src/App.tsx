import { Button, Top } from "@toss/tds-mobile";
import "./App.css";

function App() {
  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>오늘 뭐 먹지</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            단톡방에서 30초 만에 점심 메뉴를 정하세요.
          </Top.SubtitleParagraph>
        }
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "24px",
        }}
      >
        <Button
          variant="primary"
          onClick={() => {
            // Phase 1에서 방 만들기 기능 구현 예정
          }}
        >
          방 만들기
        </Button>
        <Button
          variant="weak"
          onClick={() => {
            // Phase 1에서 방 참여 기능 구현 예정
          }}
        >
          방 코드로 참여
        </Button>
      </div>
    </>
  );
}

export default App;
