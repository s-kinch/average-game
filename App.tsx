import React, {useReducer} from 'react';
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
      const {tiles, numberOfTilesSelected, currentAverage, goal} = game
      const newCurrentAverage = currentAverage === null ? num : (currentAverage * numberOfTilesSelected + num) / (numberOfTilesSelected + 1)
      return {
        ...state,
        game: {
          ...game,
          tiles: [...tiles.slice(0, i), {...tiles[i], selected: true}, ...tiles.slice(i + 1)],
          numberOfTilesSelected: numberOfTilesSelected + 1,
          currentAverage: newCurrentAverage,
          solved: newCurrentAverage === goal
        }
      }
    }
    case 'DESELECT_TILE': {
      const {num, i} = action
      const {game} = state
      const {tiles, numberOfTilesSelected, currentAverage, goal} = game
      const newCurrentAverage = numberOfTilesSelected - 1 === 0 ? null : (currentAverage * numberOfTilesSelected - num) / (numberOfTilesSelected - 1)
      return {
        ...state,
        game: {
          ...game,
          tiles: [...tiles.slice(0, i), {...tiles[i], selected: false}, ...tiles.slice(i + 1)],
          numberOfTilesSelected: numberOfTilesSelected - 1,
          currentAverage: newCurrentAverage,
          solved: newCurrentAverage === goal // TODO: Does this need to be here?
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
  const goal = 70
  const x = 20
  const a = 3
  const b = 66

  const tiles = [goal - x, goal + x, a, b].map(num => ({id: uuidv4(), num, selected: false}))
  shuffleArray(tiles)

  return {
    timer: 0,
    tiles,
    goal,
    numberOfTilesSelected: 0,
    currentAverage: null,
    solved: false,
  }
}
const initialState = {
  game: generateGame()
}

const Tile = ({num, selected, handlePress}) => {
  return <TouchableOpacity style={[styles.tile, (selected && styles.tileSelected)]} onPress={handlePress}>
    <Text style={[styles.tileText, (selected && styles.tileTextSelected)]}>
      {num}
    </Text>
  </TouchableOpacity>
}

export default function App() {

  // Where should selected state go?
  // Harder: gotta pick more than two tiles

  const [state, dispatch] = useReducer(reducer, initialState)
  console.log(state)
  const {game: {timer, tiles, goal, solved, currentAverage}} = state
  const tileComponents = tiles.map(({id, selected, num}, i) => <Tile 
    key={id} 
    num={num}
    selected={selected}
    handlePress={() => dispatch({type: selected ? 'DESELECT_TILE' : 'SELECT_TILE', i, num})}
  />)

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>Select the two tiles that average to your goal.</Text>
      <View style={styles.tileWrapper}>
        {tileComponents}
      </View>
      <View style={styles.goal}>
        <Text style={styles.tileText}>{goal}</Text>
      </View>
      <Button onPress={() => dispatch({type: 'START_NEW_GAME'})} title="Start New Game"/>
      <Text>CURRENT AVERAGE: {currentAverage}</Text>
      <Text>SOLVED: {solved.toString()}</Text>
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
});
