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
    case 'TICK': {
      return {
        ...state,
        game: {
          ...state.game,
          timer: state.game.timer + 1,
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
    timer: 0,
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
  timer: number,
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
  const {id, timer, tiles, goal, solved, sum, numberOfTilesSelected} : Game = state.game
  let timerRef = useRef(null)
  // TODO: Harder: gotta pick more than two tiles

  // Tick timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      dispatch({type: 'TICK'})
    }, 1000);

    return () => clearInterval(timerRef.current)
  }, [id]);

  // Stop timer when solved
  useEffect(() => {
    if (solved) {
      clearInterval(timerRef.current)
    }
  }, [solved])

  
  const tileComponents = tiles.map(({id, selected, num}, i) => <Tile 
    key={id} 
    num={num}
    selected={selected}
    handlePress={() => dispatch({type: selected ? 'DESELECT_TILE' : 'SELECT_TILE', i, num})}
  />)

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>Select the two tiles that average to your goal.</Text>
      {solved ? <>
        <Text style={styles.currentAverage}>Yay you did it.</Text>
        <Button color={'hotpink'} onPress={() => dispatch({type: 'START_NEW_GAME'})} title="Start New Game"/>
        </> : 
        <>
          <View style={styles.tileWrapper}>
            {tileComponents}
          </View>
          <View style={styles.goal}>
            <Text style={styles.tileText}>{goal}</Text>
          </View>
          <Text style={styles.currentAverage}>CURRENT SUM: {sum}</Text>
          <Text style={styles.currentAverage}>CURRENT # TILES SELECTED: {numberOfTilesSelected}</Text>
          <Text style={styles.currentAverage}>CURRENT AVERAGE: {sum / numberOfTilesSelected}</Text>
          <Text style={[styles.solvedText, (solved && styles.solvedTextSolved)]}>SOLVED: {solved.toString()}</Text>
        </>
      }
      <Text style={styles.currentAverage}>{timer}</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'aqua',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 45,
    color: 'fuchsia',
    margin: 10,
    backgroundColor: 'violet',
  },
  tileWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'teal',
  },
  tile: {
    backgroundColor: 'hotpink',
    width: 120,
    height: 120,
    margin: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileSelected: {
    backgroundColor: 'yellow',
  },
  tileText: {
    fontSize: 75,
    color: 'lime',
  },
  tileTextSelected: {
    color: 'white',
  },
  goal: {
    backgroundColor: 'purple',
    margin: 10,
    display: 'flex',
    // flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
});
