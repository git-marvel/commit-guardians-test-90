export const uiSuperGameBoard = `
<div class="game-board">
          <ul class="board-matrix">
            <li class="board-cell"></li>
            <li class="board-cell"></li>
            <li class="board-cell"></li>
            <li class="board-cell"></li>
            <li class="board-cell"></li>
            <li class="board-cell"></li>
            <li class="board-cell"></li>
            <li class="board-cell"></li>
            <li class="board-cell"></li>
          </ul>
          </div>
`;

/// 3 X 3 보드판 = 9
export class GameBoard {
  constructor() {
    this.matrix = Array(9).fill(null); // 각 셀의 상태를 저장하는 배열
    this.element = document.querySelector(".game-board"); // 게임보드 DOM 요소
    this.uiCells = this.element.querySelectorAll(".board-cell"); // 각 셀의 DOM 요소들
  }

  /** 보드판 전체를 초기화 */
  clearBoardCellAll() {
    this.uiCells.forEach((cell, i) => {
      cell.innerHTML = "";
      this.matrix[i] = null;
    });
  }

  /** 특정 셀만 초기화 */
  clearCellOnly(i) {
    if (i >= 0 && i < this.uiCells.length) {
      this.uiCells[i].innerHTML = "";
      this.matrix[i] = null;
    }
  }

  /** 이벤트 종료 시, 이벤트 리스너 제거 */
  onClose(callback) {
    this.element.removeEventListener("click", callback);
  }

  /** 게임보드 DOM에 이벤트 추가 */
  addBoardEvent(callback) {
    this.element.addEventListener("click", callback);
  }

  /** 게임보드의 특정 셀에 이벤트 추가 */
  addCellEvent(callback) {
    this.uiCells.forEach((cell) => {
      cell.addEventListener("click", callback);
    });
  }

  /** 셀의 인덱스를 탐색 */
  searchCellIndex(e) {
    for (let i = 0; i < this.uiCells.length; i++) {
      if (e.target === this.uiCells[i]) {
        return i;
      }
    }
    return -1; // 셀이 발견되지 않으면 -1 반환
  }

  /** 현재 보드의 상태를 기준으로 승리 여부 확인 */
  checkWin() {
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
        this.matrix[combination[0]] &&
        this.matrix[combination[0]] === this.matrix[combination[1]] &&
        this.matrix[combination[1]] === this.matrix[combination[2]]
      ) {
        return this.matrix[combination[0]];
      }
    }

    return this.matrix.includes(null) ? "Continue" : "Draw";
  }

  /** 보드의 상태를 설정 (Super Tic-Tac-Toe에서 사용 가능) */
  setCellState(index, player) {
    if (index >= 0 && index < this.matrix.length) {
      this.matrix[index] = player;
    }
  }

  /** UI에 플레이어의 모양을 적용 */
  applyPlayerShape(index, player) {
    if (index >= 0 && index < this.uiCells.length) {
      const svg = player.settings.shape;
      this.uiCells[index].innerHTML = svg.outerHTML;
      this.uiCells[index].querySelector("svg").style.fill =
        player.settings.color;
    }
  }
}
