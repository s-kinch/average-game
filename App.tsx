import React, { useReducer, useRef, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native'
import { palette, generateLevel } from './utility'

// ---Tile----------------------------------------------------------------------------------------
const Tile = ({ num, selected, handlePress }) => {
    return <TouchableOpacity style={[styles.tile, (selected && styles.tileSelected)]} onPress={handlePress}>
        <Text style={[styles.tileText, (selected && styles.tileTextSelected)]}>
            {num}
        </Text>
    </TouchableOpacity>
}

// ---App-----------------------------------------------------------------------------------------
const initialState = {
    level: generateLevel(),
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'START_NEW_LEVEL': {
            return {
                ...state,
                level: generateLevel()
            }
        }
        case 'SELECT_TILE': {
            const { num, i } = action
            const { level } = state
            const { tiles, numberOfTilesSelected, sum, goal } = level
            const newNumberOfTilesSelected = numberOfTilesSelected + 1
            const newSum = sum + num

            return {
                ...state,
                level: {
                    ...level,
                    tiles: [...tiles.slice(0, i), { ...tiles[i], selected: true }, ...tiles.slice(i + 1)],
                    numberOfTilesSelected: newNumberOfTilesSelected,
                    sum: newSum,
                    solved: newSum / newNumberOfTilesSelected === goal
                }
            }
        }
        case 'DESELECT_TILE': {
            const { num, i } = action
            const { level } = state
            const { tiles, numberOfTilesSelected, sum, goal } = level
            const newNumberOfTilesSelected = numberOfTilesSelected - 1
            const newSum = sum - num

            return {
                ...state,
                level: {
                    ...level,
                    tiles: [...tiles.slice(0, i), { ...tiles[i], selected: false }, ...tiles.slice(i + 1)],
                    numberOfTilesSelected: numberOfTilesSelected - 1,
                    sum: newSum,
                    solved: (newSum / newNumberOfTilesSelected) === goal // TODO: Does this need to be here?
                }
            }
        }
        default: {
            return state
        }
    }
}

type Level = {
    id: number,
    tiles: [
        { id: number, num: number, selected: boolean }
    ],
    goal: number,
    numberOfTilesSelected: number,
    sum: number,
    solved: boolean,
}

export default function App() {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { id, tiles, goal, solved }: Level = state.level
    const goalColor = useRef(new Animated.Value(0)) // [0, 1]

    useEffect(() => {
        if (solved) { // 'solved' goes from false to true
            Animated.timing(goalColor.current, {
                duration: 300,
                toValue: 1
            }).start()
        } else { // starting new level
            Animated.timing(goalColor.current, {
                duration: 300,
                toValue: 0
            }).start()
        }
    }, [solved])

    const tileComponents = tiles.map(({ id, selected, num }, i) => <Tile
        key={id}
        num={num}
        selected={selected}
        handlePress={() => dispatch({ type: selected ? 'DESELECT_TILE' : 'SELECT_TILE', i, num })}
    />)

    return (
        <View style={styles.container}>
            <>
                <View style={styles.instructionWrapper}>
                    <Text style={styles.instructionText}>Select the two tiles that average to your goal:</Text>
                    <View style={[styles.goalWrapper]}>
                        <Animated.View style={[styles.goal, styles.tile, {
                            backgroundColor: goalColor.current.interpolate({
                                inputRange: [0, 1],
                                outputRange: [palette.white(0.3), palette.persimmon(1)]
                            })
                        }]}>
                            <Animated.Text style={[styles.tileText, styles.goalText, {
                                color: goalColor.current.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [palette.zanah(1), palette.white(0.9)]
                                })
                            }]}>{goal}</Animated.Text>
                        </Animated.View>
                    </View>
                </View>
                <View style={styles.tileWrapper} pointerEvents={solved ? 'none' : 'auto'}>
                    {tileComponents}
                </View>
            </>
            <View style={styles.bottomButtonContainer}>
                {solved && <>
                    <Text style={styles.yay}>Yay!</Text>
                    <TouchableOpacity style={styles.nextButton} onPress={() => dispatch({ type: 'START_NEW_LEVEL' })}>
                        <Text style={styles.nextButtonText}>Next Level</Text>
                    </TouchableOpacity>
                </>}
            </View>
        </View>
    );
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
    bottomButtonContainer: {
        backgroundColor: palette.persimmon(0.8),
        width: '100%',
        flex: 1,
        shadowColor: palette.astronaut(1),
        shadowOffset: { width: -1, height: -2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    yay: {
        fontSize: 20,
        color: palette.white(0.9),
    },
    nextButton: {
        borderRadius: 10,
        backgroundColor: palette.white(0.3),
    },
    nextButtonText: {
        fontSize: 30,
        color: palette.zanah(1),
        padding: 10,
    },
});
