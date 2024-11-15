import { GameBoard, uiSuperGameBoard } from "./board.js";
import { PlayerType, Player } from "./player.js";

function main() {
  const p1Element = document.getElementById(PlayerType.ONE);
  const p2Element = document.getElementById(PlayerType.TWO);

  const gameBoardElement = document.querySelector(".game-board");

  const player1 = new Player(PlayerType.ONE, p1Element);
  const player2 = new Player(PlayerType.TWO, p2Element);
  const gameBoard = new GameBoard(gameBoardElement);

  const startButton = document.querySelector(".start-button");
  const sceneStart = document.querySelector(".scene-start");
  const sceneGame = document.querySelector(".scene-game");
  const superGameBoardElement = sceneGame.querySelector(".super-game-board");

  const gameInfoWrapper = document.querySelector(".game-info-wrapper");
  const playerInfoWrapper = document.querySelector(".info-board");

  let currentPlayer = player1;

  const switchToPlayer1Callback = () => switchPlayer(player2, player1);
  const switchToPlayer2Callback = () => switchPlayer(player1, player2);

  const onShapePlayer1Callback = (e) => player1.setShape(e);
  const onShapePlayer2Callback = (e) => player2.setShape(e);

  const onColorPlayer1Callback = (e) => player1.setColor(e);
  const onColorPlayer2Callback = (e) => player2.setColor(e);

  const onAttackPriorityPlayer1Callback = (e) => {
    player1.setPriority(e);
    player2.attackPriority.checked = !player1.settings.attackPriority;
    player2.settings.attackPriority = !player1.settings.attackPriority;
    player2.activateAttackPriority();
  };

  const onAttackPriorityPlayer2Callback = (e) => {
    player2.setPriority(e);
    player1.attackPriority.checked = !player2.settings.attackPriority;
    player1.settings.attackPriority = !player2.settings.attackPriority;
    player1.activateAttackPriority();
  };

  const startGame = () => changeSceneGame(sceneStart, sceneGame);

  const undoCallback = () => {
    if (canUndo) undoPlay({ last: lastCell, history: cellsHistoryArr });
  };

  const undoSuperCallback = () => {
    if (canUndo)
      undoPlay({
        last: lastBoardCell,
        history: cells9X9HistoryArr[lastBoardCell.boardIndex],
      });
  };

  const closingCallback = (e) => onPlay(e);
  const superOnPlayCallback = (e) => superOnPlay(e);

  let cellsHistoryArr = Array(9).fill("");
  let lastCell = { target: "", boardIndex: -1, cellIndex: 0 }; // [target, index]
  let canUndo = false;

  let boardHistoryArr = Array(9).fill("");
  let cells9X9HistoryArr = Array.from(Array(9), () => Array(9).fill(""));
  let lastBoardCell = { target: "", boardIndex: 0, cellIndex: 0 };

  let possibleGameBoardIndex = -1; // 초기값을 -1로 설정하여 첫 턴에 모든 보드를 허용

  // 게임의 모드를 변경
  function switchGame() {
    if (
      sceneGame.querySelector("#super-game").classList.contains("super-motion")
    ) {
      // 그냥 틱텍토 활성화
      superGameBoardElement.classList.add("hide");
      superGameBoardElement.classList.remove("grid");
      gameBoardElement.classList.remove("hide");
      sceneGame.querySelector("#super-game").classList.remove("super-motion");
      gameInfoWrapper
        .querySelector(".undo-btn")
        .addEventListener("click", undoCallback);

      superGameBoardElement.innerHTML = "";

      // undo 버튼의 이벤트 바꾸기
      gameInfoWrapper
        .querySelector(".undo-btn")
        .addEventListener("click", undoCallback);
      gameInfoWrapper
        .querySelector(".undo-btn")
        .removeEventListener("click", undoSuperCallback);

      // 기존 틱텍토 마커들 모두 제거
      for (let i = 0; i < 81; i++) {
        gameBoardElement.querySelectorAll(".board-cell")[i].innerText = "";
      }
      // 9개의 보드에 대해서 이벤트 제거
      superGameBoardElement
        .querySelectorAll(".game-board")
        .forEach((e) => e.removeEventListener("click", superOnPlayCallback));
    } else {
      // 슈퍼 틱텍토 활성화
      superGameBoardElement.classList.remove("hide");
      superGameBoardElement.classList.add("grid");
      gameBoardElement.classList.add("hide");
      sceneGame.querySelector("#super-game").classList.add("super-motion");

      // ??
      for (let i = 0; i < 9; i++) {
        superGameBoardElement.insertAdjacentHTML(
          "afterbegin",
          uiSuperGameBoard
        );
      }

      // undo 버튼의 이벤트 바꾸기
      gameInfoWrapper
        .querySelector(".undo-btn")
        .addEventListener("click", undoSuperCallback);
      gameInfoWrapper
        .querySelector(".undo-btn")
        .removeEventListener("click", undoCallback);

      // 9개의 보드에 대해서 이벤트 활성
      superGameBoardElement
        .querySelectorAll(".game-board")
        .forEach((e) => e.addEventListener("click", superOnPlayCallback));

      superGameStart();
    }
  }

  /** SUPER TIC TAC TOE */
  // 게임의 설정 초기화
  function superGameStart() {
    /* 무르기 횟수 초기화 */
    player1.activateUndoNums(3);
    player2.activateUndoNums(3);

    // 상태 정보 변수들 초기화
    cellsHistoryArr = Array(9).fill("");
    lastCell = { target: "", cellIndex: 0 }; // [target, index]
    boardHistoryArr = Array(9).fill("");
    cells9X9HistoryArr = Array.from(Array(9), () => Array(9).fill(""));
    lastBoardCell = { target: "", boardIndex: 0, cellIndex: 0 };
    possibleGameBoardIndex = -1;
    canUndo = false;

    // 기존 틱텍토 마커들 모두 제거
    for (let i = 0; i < 81; i++) {
      superGameBoardElement.querySelectorAll(".board-cell")[i].innerText = "";
    }
    for (let i = 0; i < 9; i++) {
      superGameBoardElement.getElementsByClassName("invisible")[0].remove();
      superGameBoardElement.querySelectorAll(".game-board")[i].style[
        "background-color"
      ] = "";
    }
  }

  /** SUPER TIC TAC TOE */
  function superOnPlay(e) {
    // 알럿창 UI 지워주기
    gameInfoWrapper.querySelector(".game-alert").innerText = "";

    const [boardIndex, cellIndex] = searchSuperIndex(e);

    // 만약 가능한 보드 인덱스가 설정되어 있고, 현재 클릭한 보드가 그 보드가 아니면 무효화
    if (
      possibleGameBoardIndex !== -1 &&
      possibleGameBoardIndex !== boardIndex
    ) {
      alert(`i=${possibleGameBoardIndex} 보드에서 플레이해라`);
      return;
    }

    // 선택된 보드의 특정 셀에 아무 것도 없는지 확인
    if (cells9X9HistoryArr[boardIndex][cellIndex] === "") {
      // 무르기 기능을 허용
      canUndo = true;

      // 무르기를 위해 마지막에 선택된 보드와 셀을 저장
      lastBoardCell.boardIndex = boardIndex;
      lastBoardCell.cellIndex = cellIndex;
      lastBoardCell.target = e.target;

      // 현재 플레이어의 기호로 셀을 표시
      cells9X9HistoryArr[boardIndex][cellIndex] = currentPlayer;

      // 현재 플레이어의 SVG와 색상을 가져와 셀에 적용
      const svg = currentPlayer.settings.shape;
      e.target.closest("li").innerHTML = svg.outerHTML;
      e.target.querySelector("svg").style.fill = currentPlayer.settings.color;

      // 작은 3x3 보드에서 플레이어가 승리했는지 확인
      const smallBoardState = checkWin(cells9X9HistoryArr[boardIndex]);

      // 플레이어가 작은 보드에서 승리했을 경우 전체 보드 상태 업데이트
      if (smallBoardState === player1 || smallBoardState === player2) {
        boardHistoryArr[boardIndex] = smallBoardState;
        // 필요에 따라 작은 보드를 시각적으로 승리로 표시

        const invisibleDiv = `<div class="invisible">${smallBoardState.settings.shape.outerHTML}</div>`;

        e.currentTarget.insertAdjacentHTML("afterbegin", invisibleDiv);

        e.currentTarget.querySelector("svg").style.fill =
          smallBoardState.settings.color;

        e.currentTarget.removeEventListener("click", superOnPlayCallback);
      }

      // 플레이어가 전체 게임(큰 보드)에서 승리했는지 확인
      const superBoardState = checkWin(boardHistoryArr);

      switch (superBoardState) {
        case player1:
          player1.winNums++;
          alert("플레이어 1 승!");
          // 9개의 보드에 대해서 이벤트 제거
          superGameEnd();
          break;
        case player2:
          player2.winNums++;
          alert("플레이어 2 승");
          superGameEnd();
          break;
        case "Draw":
          alert("무승부!");
          superGameEnd();
          break;
        case "Continue":
          turnChange();
          break;
        default:
          alert("superOnPlay 함수에서 오류가 발생했습니다!");
          break;
      }

      function superGameEnd() {
        superGameBoardElement
          .querySelectorAll(".game-board")
          .forEach((e) => e.removeEventListener("click", superOnPlayCallback));
        canUndo = false;
        sceneGame.querySelector(".game-again").classList.remove("hide");
      }

      // 다음 턴에서 가능한 게임 보드 인덱스를 설정
      if (boardHistoryArr[cellIndex] === "") {
        // 해당 작은 보드가 아직 승리되지 않은 경우
        superGameBoardElement.querySelectorAll(".game-board")[boardIndex].style[
          "background-color"
        ] = "";

        possibleGameBoardIndex = cellIndex;
        superGameBoardElement.querySelectorAll(".game-board")[
          possibleGameBoardIndex
        ].style["background-color"] = "#EEEEEE";
      } else {
        // 해당 작은 보드가 이미 승리되었거나 무승부인 경우
        possibleGameBoardIndex = -1; // 다음 플레이어는 자유롭게 선택 가능

        superGameBoardElement.querySelectorAll(".game-board")[boardIndex].style[
          "background-color"
        ] = "";
      }
    } else {
      alert("다른 빈 칸을 선택해 주세요!");
    }
  }

  /** SUPER TIC TAC TOE */
  function init() {
    // 초기화할 때, 게임보드 이벤트 제거
    gameBoardElement.removeEventListener("click", gameBoard.searchCellIndex);

    player1.activate();
    changeSceneGame(sceneGame, sceneStart);

    // 설정하는 주도권 넘겨줄 때, 컬러피커 눌러도 컬러피커에 이벤트전달되지 않도록 숨겨줌
    player2.colorInput.classList.add("hide");

    player2.onClick(switchToPlayer2Callback);
    player1.onShapeSelect(onShapePlayer1Callback);
    player1.onColorSelect(onColorPlayer1Callback);
    player1.onAttackPriority(onAttackPriorityPlayer1Callback);

    startButton.addEventListener("click", startGame);
    startButton.addEventListener("click", gameStart);

    possibleGameBoardIndex = -1;

    sceneGame
      .querySelector(".game-again")
      .addEventListener("click", onClickRestart);
    sceneGame
      .querySelector(".game-again")
      .addEventListener("click", onClickSuperRestart);

    sceneGame
      .querySelector("#super-game")
      .addEventListener("click", switchGame);
  }

  /**
   * 이벤트 주도권을 어떤 플레이어에게 넘겨주는지에 대한 함수
   * @param {*} nextPlayer
   */
  function switchPlayer(selectedPlayer, nextPlayer) {
    selectedPlayer.deactivate();
    nextPlayer.activate();
    selectedPlayer = nextPlayer;

    if (selectedPlayer === player1) {
      player2.onClick(switchToPlayer2Callback);
      player1.onShapeSelect(onShapePlayer1Callback);
      player1.onColorSelect(onColorPlayer1Callback);
      player1.onAttackPriority(onAttackPriorityPlayer1Callback);
      player1.removeClick(switchToPlayer1Callback);
      player2.removeShapeSelect(onShapePlayer2Callback);
      player2.removeColorSelect(onColorPlayer2Callback);
      player2.removeAttackPriority(onAttackPriorityPlayer2Callback);
    } else {
      player1.onClick(switchToPlayer1Callback);
      player2.onShapeSelect(onShapePlayer2Callback);
      player2.onColorSelect(onColorPlayer2Callback);
      player2.onAttackPriority(onAttackPriorityPlayer2Callback);
      player2.removeClick(switchToPlayer2Callback);
      player1.removeShapeSelect(onShapePlayer1Callback);
      player1.removeColorSelect(onColorPlayer1Callback);
      player1.removeAttackPriority(onAttackPriorityPlayer1Callback);
    }
  }

  function changeSceneGame(offPrev, onCurrent) {
    offPrev.classList.add("hide");
    offPrev.classList.remove("flex");

    onCurrent.classList.remove("hide");
    onCurrent.classList.add("flex");

    startButton.removeEventListener("click", startGame);
  }

  function gameStart() {
    console.log("player1", player1);
    console.log("player2", player2);
    console.log(`gameStart clicked!!`);

    // 선공 플레이어 설정
    if (player1.settings.attackPriority) {
      currentPlayer = player1;
      activateTurn(currentPlayer);
      deactivateTurn(player2);
    } else if (player2.settings.attackPriority) {
      currentPlayer = player2;
      activateTurn(currentPlayer);
      deactivateTurn(player1);
    } else {
      throw new Error("플레이어의 공격 우선권 선택이 되지 않음!");
    }
    gameInfoWrapper.querySelector(
      ".turn-info"
    ).innerText = `${currentPlayer.type}'s Turn!`;

    // 플레이어의 무르기 횟수 초기값 세팅 : 3
    player1.activateUndoNums();
    player2.activateUndoNums();

    gameBoardElement.addEventListener("click", closingCallback);
    gameInfoWrapper
      .querySelector(".undo-btn")
      .addEventListener("click", undoCallback);
    playerInfoWrapper
      .querySelector("#player1-info")
      .querySelector(".selected-shape").innerHTML =
      player1.settings.shape.outerHTML;
    playerInfoWrapper
      .querySelector("#player1-info")
      .querySelector("svg").style.fill = player1.settings.color;
    playerInfoWrapper
      .querySelector("#player2-info")
      .querySelector(".selected-shape").innerHTML =
      player2.settings.shape.outerHTML;
    playerInfoWrapper
      .querySelector("#player2-info")
      .querySelector("svg").style.fill = player2.settings.color;
  }

  function onClickRestart() {
    // 무르기 횟수 기본값으로 다시 변경
    player1.activateUndoNums(3);
    player2.activateUndoNums(3);

    cellsHistoryArr = Array(9).fill("");
    gameBoard.clearBoardCellAll();
    sceneGame
      .querySelector(".game-again")
      .removeEventListener("click", onClickRestart);
    gameStart();
    console.log("한판 더!!");
    sceneGame.querySelector(".game-again").classList.add("hide");
  }

  // 수정 중
  function onClickSuperRestart() {
    // 9개의 보드에 대해서 이벤트 활성
    superGameBoardElement
      .querySelectorAll(".game-board")
      .forEach((e) => e.addEventListener("click", superOnPlayCallback));
    superGameStart();
    console.log("한판 더!!");
    sceneGame.querySelector(".game-again").classList.add("hide");
  }

  /// 게임 보드 하나의 셀 단위를 컨트롤 해주는 함수: index 로.
  function onPlay(e) {
    // 알럿창 UI 지워주기
    gameInfoWrapper.querySelector(".game-alert").innerText = "";

    const markedCellIndex = gameBoard.searchCellIndex(e);
    canUndo = true;
    lastCell.target = e.target;
    lastCell.cellIndex = markedCellIndex;

    // 칸이 비었을 때
    if (cellsHistoryArr[markedCellIndex] === "") {
      cellsHistoryArr[markedCellIndex] = currentPlayer;
      // 플레이어의 svg 정보를 가져옴
      const svg = cellsHistoryArr[markedCellIndex].settings.shape;
      // 셀에 플레이어 마크 할당 (이미지와 색깔)
      e.target.closest("li").innerHTML = svg.outerHTML;
      e.target.querySelector("svg").style.fill =
        cellsHistoryArr[markedCellIndex].settings.color;
      // 승리 조건 확인문
      switch (checkWin(cellsHistoryArr)) {
        case player1:
          player1.winNums += 1;
          playerInfoWrapper
            .querySelector("#player1-info")
            .querySelector(".win-nums").innerText = `🏆 ${player1.winNums}`;
          gameInfoWrapper.querySelector(
            ".game-alert"
          ).innerText = `player1 승리`;
          gameBoard.onClose(closingCallback);
          sceneGame.querySelector(".game-again").classList.remove("hide");
          canUndo = false;
          break;

        case player2:
          player2.winNums += 1;
          playerInfoWrapper
            .querySelector("#player2-info")
            .querySelector(".win-nums").innerText = `🏆 ${player2.winNums}`;
          gameInfoWrapper.querySelector(
            ".game-alert"
          ).innerText = `player2 승리`;
          gameBoard.onClose(closingCallback);
          sceneGame.querySelector(".game-again").classList.remove("hide");
          canUndo = false;
          break;

        case "Draw":
          gameInfoWrapper.querySelector(".game-alert").innerText = `무승부!`;
          gameBoard.onClose(closingCallback);
          sceneGame.querySelector(".game-again").classList.remove("hide");
          canUndo = false;
          break;

        case "Continue":
          turnChange();
          break;

        default:
          alert("onPlay 함수에서 오류가 났음!");
      }

      console.log("checkWin", checkWin(cellsHistoryArr));
      console.log("history", cellsHistoryArr);
    } else {
      console.log(cellsHistoryArr[markedCellIndex]);
      gameInfoWrapper.querySelector(".game-alert").innerText =
        "다른 빈 칸을 선택해 주세요!";
    }

    // 턴이 변경되는 프로세스 -> 반복문안에서 나란히 있어야하는지, 호출되어 하는지는 고려
  }

  function checkWin(historyArr) {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const combination of winningCombinations) {
      if (
        historyArr[combination[0]] &&
        historyArr[combination[0]] === historyArr[combination[1]] &&
        historyArr[combination[1]] === historyArr[combination[2]]
      ) {
        return historyArr[combination[0]];
      }
    }

    return historyArr.includes("") ? "Continue" : "Draw"; // 모든 칸이 채워졌는지?
  }

  // 각 플레이어 대해 중복되는 구문이 너무 많음
  function undoPlay({ last, history }) {
    // 턴 변경
    if (currentPlayer === player1) {
      currentPlayer = player2;
    } else {
      currentPlayer = player1;
    }

    // 무르기 횟수를 모두 소진했을 때, 모두 소진했다고 알림을 띄우고, undoPlay() 탈출!
    if (currentPlayer.undoNums === 0) {
      gameInfoWrapper.querySelector(".game-alert").innerText =
        "무르기 횟수를 모두 사용하셨습니다.";

      if (currentPlayer === player1) {
        currentPlayer = player2;
      } else {
        currentPlayer = player1;
      }
      return; // undo가 불가능할 때 함수 종료
    }

    // 이전 플레이어로 되돌린 후, undoNums 값을 감소시킴
    currentPlayer.activateUndoNums(currentPlayer.undoNums - 1);

    activateTurn(currentPlayer);
    deactivateTurn(currentPlayer === player1 ? player2 : player1);
    canUndo = false;

    history[last.cellIndex] = "";
    last.target.innerHTML = "";

    gameInfoWrapper.querySelector(
      ".turn-info"
    ).innerText = `${currentPlayer.type}'s Turn!`;
    // super 틱텍토에서 클릭 가능한 보드 돌아가기
    possibleGameBoardIndex = last.boardIndex;
    // 현재 보드 하이라이트 제거 (super에서) 오류 무시
    superGameBoardElement.querySelectorAll(".game-board")[last.cellIndex].style[
      "background-color"
    ] = "";
    // 과거 보드 하이라이트 활성
    superGameBoardElement.querySelectorAll(".game-board")[
      possibleGameBoardIndex
    ].style["background-color"] = "#EEEEEE";
  }

  function turnChange() {
    if (currentPlayer === player1) {
      currentPlayer = player2;
      activateTurn(currentPlayer);
      deactivateTurn(player1);
    } else if (currentPlayer === player2) {
      currentPlayer = player1;
      activateTurn(currentPlayer);
      deactivateTurn(player2);
    } else {
      throw new Error("turnChange에서 오류 발생!");
    }
    gameInfoWrapper.querySelector(
      ".turn-info"
    ).innerText = `${currentPlayer.type}'s Turn!`;
  }

  function activateTurn(currentPlayer) {
    const playerInfoBox = playerInfoWrapper.querySelector(
      `#${currentPlayer.type}-info`
    );
    console.log(playerInfoBox);
    playerInfoBox.classList.add("isActive");
  }

  function deactivateTurn(deactivePlayer) {
    playerInfoWrapper
      .querySelector(`#${deactivePlayer.type}-info`)
      .classList.remove("isActive");
  }

  function searchSuperIndex(e) {
    const superboard = document.querySelector(".super-game-board");
    const superboards = superboard.querySelectorAll(".game-board");

    const curretboard = e.target.closest(".game-board");
    const currentcell = e.target.closest(".board-cell");

    let boardIndex = 0;
    let cellIndex = 0;
    for (let i = 0; i < superboards.length; i++) {
      if (curretboard === superboards[i]) {
        boardIndex = i;
        let supercells = superboards[i].querySelectorAll(".board-cell");
        for (let j = 0; j < supercells.length; j++) {
          if (currentcell === supercells[j]) {
            cellIndex = j;
            break;
          }
        }
        break;
      }
    }
    return [boardIndex, cellIndex];
  }

  document
    .querySelector(".super-game-board")
    .addEventListener("click", searchSuperIndex);
  init();
}

main();
