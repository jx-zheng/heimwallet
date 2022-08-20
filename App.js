import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.goodMorning}>Good Morning, Aryaman!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

// COLOURS:
// Dark Purple: 6C447C
// Light Purple: D4A9CD
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#D4A9CD',
    // alignItems: 'center',
    justifyContent: 'center',
  },

  goodMorning: {
    // does nothing...,
  }
});
