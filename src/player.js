export const PlayerType = Object.freeze({
  ONE: "player1",
  TWO: "player2",
});

export const ShapeType = Object.freeze({
  O: "circle",
  TRI: "triangle",
  RECT: "rectangle",
  X: "cross",
});

const randBool = Boolean(Math.round(Math.random()));

export const DefaultSetting = Object.freeze({
  [PlayerType.ONE]: {
    id: PlayerType.ONE,
    shape: ShapeType.X,
    color: "#0077ff",
    attackPriority: randBool,
  },
  [PlayerType.TWO]: {
    id: PlayerType.TWO,
    shape: ShapeType.O,
    color: "#ff5100",
    attackPriority: !randBool,
  },
});

export class Player {
  constructor(type, element) {
    this.type = type;
    this.element = element;
    this.settings = { ...DefaultSetting[type] };
    this.winNums = 0;
    this.undoNums = 3;
    this.currentView = element.querySelector(".player-current-shape");
    this.shapeOptions = element.querySelector(".shape-options");
    this.colorInput = element.querySelector(".player-color-selector");
    this.attackPriority = element.querySelector(".player-attack-priority");

    this._initUi();
  }

  /**
   * player 의 기본 설정값을 UI 로 표현해주는 메소드
   */
  _initUi() {
    const svg = this.shapeOptions.querySelector(`#${this.settings.shape}`);
    if (svg) {
      this.currentView.innerHTML = svg.outerHTML;
      this.settings.shape = svg;
      this.currentView.querySelector("svg").style.fill = this.settings.color;
      svg.closest("li").classList.add("selected");
      this.attackPriority.checked = this.settings.attackPriority;
      this.activateAttackPriority();
    }
  }

  activate() {
    this.element.classList.add("isActive");
    this.colorInput.classList.remove("hide");
  }

  deactivate() {
    this.element.classList.remove("isActive");
    this.colorInput.classList.add("hide");
  }

  setShape(e) {
    const selectedLi = e.target.closest("li");

    if (selectedLi) {
      const ui = selectedLi;

      this.currentView.innerHTML = ui.outerHTML;
      this.settings.shape = ui;
      console.log("ui", ui);
      this.currentView.querySelector("svg").style.fill = this.settings.color;
      this.activateShape(selectedLi);
    }
  }

  activateShape(target) {
    const liArray = this.shapeOptions.querySelectorAll("li");

    liArray.forEach((li) => {
      const isSelected = li.classList.contains("selected");
      if (isSelected) {
        li.classList.remove("selected");
      }
    });

    if (target) {
      target.closest("li").classList.add("selected");
    }
  }

  activateAttackPriority() {
    const label = this.attackPriority.closest("div").querySelector("#label");

    if (this.settings.attackPriority) {
      label.innerText = "First ✋";
    } else {
      label.innerText = "Second";
    }
  }

  activateUndoNums(undoNums = 3) {
    if (undoNums >= 0) {
      this.undoNums = undoNums;

      document
        .querySelector(`#${this.type}-info`)
        .querySelector(".undo-nums").innerText = `Chance: ${this.undoNums}`;
    }
  }

  setColor(e) {
    const value = e.target.value;
    this.currentView.querySelector("svg").style.fill = value;
    this.settings.color = value;
  }

  setPriority(e) {
    this.settings.attackPriority = e.target.checked;
    this.activateAttackPriority();
  }

  onShapeSelect(callback) {
    this.shapeOptions.addEventListener("click", callback);
  }

  removeShapeSelect(callback) {
    this.shapeOptions.removeEventListener("click", callback);
  }

  onColorSelect(callback) {
    this.colorInput.addEventListener("input", callback);
  }

  removeColorSelect(callback) {
    this.colorInput.removeEventListener("input", callback);
  }

  onAttackPriority(callback) {
    this.attackPriority.addEventListener("change", callback);
  }

  removeAttackPriority(callback) {
    this.attackPriority.removeEventListener("change", callback);
  }

  onClick(callback) {
    this.element.addEventListener("click", callback);
  }

  removeClick(callback) {
    this.element.removeEventListener("click", callback);
  }
}
