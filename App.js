import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, View } from 'react-native';
import { Button, Provider as PaperProvider, Text, TextInput } from 'react-native-paper';



export default function App() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [test, setTest] = React.useState("");

  function loginAttempt() {
    if (username === "aryaman") {
      setTest("logged in as patient");
    } else if (username === "jason") {
      setTest("logged in as guardian");
    } else {
      setTest("incorrect username/password");
    }
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
        <Text variant="displayLarge" style={styles.goodMorning}>
          Login
        </Text>
        
        <TextInput
          style={styles.textInput}
          label="Username"
          value={username}
          onChangeText={username => setUsername(username)}
        />

        <TextInput
          style={styles.textInput}
          label="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={password => setPassword(password)}
        />
        
        <Button mode='contained' style={styles.loginButton} onPress={() => loginAttempt()}> Login </Button>
        
        <Text>
          {test}
        </Text>

        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

// COLOURS:
// Dark Purple: 6C447C
// Light Purple: D4A9CD
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: 'white',
    paddingTop: '10%',
    // paddingLeft: '5%',
    justifyContent: 'center',
  },

  goodMorning: {
    fontWeight: 'bold',
    alignSelf: 'center',
  },

  logo: {
    width: 120,
    height: 120,
    marginLeft: 'auto',
    marginRight: 'auto',

    // resizeMode: 'contain' 
  },

  textInput: {
    margin: 20,
  },

  loginButton: {
    width: 'auto',
    alignSelf: 'center',
    marginBottom: 50,
  }

});
