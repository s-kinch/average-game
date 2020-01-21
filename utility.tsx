import uuidv4 from 'uuid/v4'

export const palette = {
    zanah: (a: number) => `rgba(223,237,211,${a})`,
    astronaut: (a: number) => `rgba(36,70,109,${a})`,
    persimmon: (a: number) => `rgba(229,99,66,${a})`,
    white: (a: number) => `rgba(255,255,255,${a})`,
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export const shuffleArray = (array: Array<any>) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export const generateLevel = () => {
    // TODO: Harder: gotta pick more than two tiles
    const goal = Math.floor(Math.random() * 98) + 2 // [2-98]
    const x = Math.abs(Math.floor(Math.random() * Math.min(Math.abs(goal - 1), Math.abs(goal - 100))))
    const a = Math.floor(Math.random() * 100) + 1 // [1-100]
    const b = Math.floor(Math.random() * 100) + 1 // [1-100]
  
    const tiles = [goal - x, goal + x, a, b].map(num => ({id: uuidv4(), num, selected: false}))
    shuffleArray(tiles)
  
    return {
      id: uuidv4(),
      tiles,
      goal,
      numberOfTilesSelected: 0,
      sum: 0,
      solved: false,
    }
  }