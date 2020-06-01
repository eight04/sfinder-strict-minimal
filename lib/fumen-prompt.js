const {Select} = require("enquirer");
const {decoder} = require("tetris-fumen");
const color = require("ansi-colors");
const symbols = require("enquirer/lib/symbols.js");

class FumenPrompt extends Select {
  constructor(options) {
    super(options);
    this.drawFumen();
  }
  async renderChoices() {
    const {gap, fumenScreen} = this.state;
    
    let indicator = "";
    const fieldWidth = Math.floor((this.stdout.columns - gap * 3) / 2);
    const margin = Math.floor((fieldWidth - 2) / 2);
    for (let i = 0; i < 2; i++) {
      indicator += " ".repeat(gap + margin);
      if (this.index === i) {
        indicator += this.styles.success(symbols.indicator); // FIXME: what is the width of indicator?
      } else {
        indicator += this.styles.dark(symbols.indicator);
      }
      indicator += " ".repeat(fieldWidth - margin - 2);
    }
    return fumenScreen + "\n" + indicator;
  }
  drawFumen() {
    const fumens = [];
    for (const choice of this.visible) {
      for (const fumen of choice.value) {
        fumens.push(fumen);
      }
    }
    const fields = fumens.map(f => decoder.decode(f)[0].field);
    
    const buffer = [];
    for (let i = 0; i < 20; i++) {
      buffer.push(Array(process.stdout.columns).fill(" "));
    }
    
    const gap = Math.floor((process.stdout.columns - 20 * fields.length) / (fields.length + 1));
    this.state.gap = gap;
    
    fields.forEach((field, i) => {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 20; y++) {
          const tile = field.at(x, y);
          if (tile === "_") {
            continue;
          }
          const screenX = gap + (gap + 20) * i + x * 2;
          buffer[y][screenX] = TILES[field.at(x, y)];
          buffer[y][screenX + 1] = "";
        }
      }
    });
    
    const lines = buffer.map(b => b.join(""));
    lines.reverse();
    const index = lines.findIndex(l => /\S/.test(l));
    this.state.fumenScreen = lines.slice(index).join("\n");
  }
  left() {
    super.up();
  }
  right() {
    super.down();
  }
  up() {
    this.alert();
  }
  down() {
    this.alert();
  }
  static maxFields() {
    return Math.floor(process.stdout.columns / 20);
  }
}

const TILES = {
  X: color.grey(symbols.fullBlock),
  T: color.magenta(symbols.fullBlock),
  I: color.white(symbols.fullBlock),
  O: color.yellow(symbols.fullBlock),
  L: color.cyan(symbols.fullBlock),
  J: color.blue(symbols.fullBlock),
  S: color.green(symbols.fullBlock),
  Z: color.red(symbols.fullBlock)
};

async function prompt({message, fumens}) {
  let result;
  if (fumens.some(f => f.size * 2 > FumenPrompt.maxFields())) {
    result = await new Select({
      message,
      choices: fumens.map((f, i) => ({
        name: String(i),
        message: [...f].join("\n")
      }))
    }).run();
  } else {
    result = await new FumenPrompt({
      message,
      choices: fumens.map((f, i) => ({
        name: String(i),
        value: f
      }))
    }).run();
  }
  return Number(result);
}

module.exports = {prompt};
