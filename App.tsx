import React, {useReducer, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
const uuidv4 = require('uuid/v4');

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

const reducer = (state, action) => {
  switch(action.type){
    case 'START_NEW_GAME': 
      return {
        ...state,
        game: generateGame()
      }
    case 'SELECT_TILE': {
      const {num, i} = action
      const {game} = state
      const {tiles, numberOfTilesSelected, sum, goal} = game
      const newNumberOfTilesSelected = numberOfTilesSelected + 1
      const newSum = sum + num
      
      return {
        ...state,
        game: {
          ...game,
          tiles: [...tiles.slice(0, i), {...tiles[i], selected: true}, ...tiles.slice(i + 1)],
          numberOfTilesSelected: newNumberOfTilesSelected,
          sum: newSum,
          solved: newSum / newNumberOfTilesSelected === goal
        }
      }
    }
    case 'DESELECT_TILE': {
      const {num, i} = action
      const {game} = state
      const {tiles, numberOfTilesSelected, sum, goal} = game
      const newNumberOfTilesSelected = numberOfTilesSelected - 1
      const newSum = sum - num
      
      return {
        ...state,
        game: {
          ...game,
          tiles: [...tiles.slice(0, i), {...tiles[i], selected: false}, ...tiles.slice(i + 1)],
          numberOfTilesSelected: numberOfTilesSelected - 1,
          sum: newSum,
          solved: (newSum / newNumberOfTilesSelected) === goal // TODO: Does this need to be here?
        }
      }
    }
    default:
      return state
  }
}

const generateGame = () => {
  // TODO: randomize goal
  // TODO: randomize x, a, b
  // const goal = 70
  // const x = 20
  // const a = 3
  // const b = 66

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
const initialState = {
  game: generateGame(), // TODO: change 'game' to 'level'
  // TODO: points
}

const Tile = ({num, selected, handlePress}) => {
  return <TouchableOpacity style={[styles.tile, (selected && styles.tileSelected)]} onPress={handlePress}>
    <Text style={[styles.tileText, (selected && styles.tileTextSelected)]}>
      {num}
    </Text>
  </TouchableOpacity>
}

type Game = {
  id: number,
  tiles: [
    {id: number, num: number, selected: boolean}
  ],
  goal: number,
  numberOfTilesSelected: number,
  sum: number,
  solved: boolean,
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const {id, tiles, goal, solved, sum, numberOfTilesSelected} : Game = state.game
  // TODO: Harder: gotta pick more than two tiles
  
  const tileComponents = tiles.map(({id, selected, num}, i) => <Tile 
    key={id} 
    num={num}
    selected={selected}
    handlePress={() => dispatch({type: selected ? 'DESELECT_TILE' : 'SELECT_TILE', i, num})}
  />)

  return (
    <View style={styles.container}>
        <>
          <View style={styles.instructionWrapper}>
            <Text style={styles.instructionText}>Select the two tiles that average to your goal:</Text>
            <View style={styles.goalWrapper}>
              <View style={[styles.goal, styles.tile]}>
                <Text style={[styles.tileText, styles.goalText]}>{goal}</Text>
              </View>
            </View>
          </View>
          <View style={styles.tileWrapper} pointerEvents={solved ? 'none' : 'auto'}>
            {tileComponents}
          </View>
        </>
      <View style={styles.bottomThing}>
      {solved && <>
        <Text style={styles.currentAverage}>Yay you did it.</Text>
        <Button color={'hotpink'} onPress={() => dispatch({type: 'START_NEW_GAME'})} title="Start New Game"/>
      </>}
      </View>
    </View>
  );
}

const palette = {
  zanah: (a: number) => `rgba(223,237,211,${a})`,
  astronaut: (a: number) => `rgba(36,70,109,${a})`,
  persimmon: (a: number) => `rgba(229,99,66,${a})`,
  white: (a: number) => `rgba(255,255,255,${a})`,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.zanah(1),
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  instructionWrapper: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.astronaut(1),
    width: '100%',
    shadowColor: palette.astronaut(1),
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  instructionText: {
    fontSize: 30,
    color: palette.zanah(1),
    marginTop: 70,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
  tileWrapper: {
    flex: 3,
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    width: '100%',
  },
  tile: {
    backgroundColor: palette.white(0.3),
    width: 120,
    height: 120,
    margin: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  tileSelected: {
    backgroundColor: palette.persimmon(1),
  },
  tileText: {
    fontSize: 75,
    color: palette.astronaut(1),
  },
  tileTextSelected: {
    color: palette.white(0.9),
  },
  goalWrapper: {
    marginBottom: 20,
  },
  goal: {
    margin: 10,
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalText: {
    color: palette.zanah(1),
  },
  currentAverage: {
    fontSize: 30,
    color: 'blue',
    backgroundColor: 'yellow',
  },
  solvedText: {
    fontSize: 45,
    color: 'gray',
  },
  solvedTextSolved: {
    color: 'lemonchiffon',
    backgroundColor: 'forestgreen',
  },
  bottomThing: {
    backgroundColor: palette.persimmon(0.8),
    width: '100%',
    flex: 1,
    shadowColor: palette.astronaut(1),
    shadowOffset: { width: -1, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
});
