import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, View } from 'react-native';
import { Button, Provider as PaperProvider, Text, TextInput, FAB } from 'react-native-paper';



export default function App() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [test, setTest] = React.useState("");

  const [view, setView] = React.useState("login"); // login, patient, guardian

  function loginAttempt() {
    if (username === "aryaman") {
      setTest("logged in as patient");
      setView("patient");
    } else if (username === "jason") {
      setTest("logged in as guardian");
      setView("guardian");
    } else {
      setTest("incorrect username/password");
    }
  }

  return (
    <PaperProvider>

      { view=="login" &&
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
      }

      { view=="patient" &&
        <View style={styles.patientContainer}>
          <Text variant="titleLarge" style={styles.helloText}>
            Hi 
            <Text style={{fontWeight: 'bold'}} > Aryaman </Text> 👋
            {'\n'}
            Welcome back!
          </Text>

          <View style={styles.amountBox}>
            <Text variant="titleMedium" style={{ alignSelf: 'center', alignItems: 'center'}}> 
            Available Balance
            {'\n'}
            </Text>

            <Text variant="titleLarge" style={{ alignSelf: 'center', alignItems: 'center'}} >
            CAD $123
            {'\n'}
            </Text>

            <Text variant="titleMedium" style={{ alignSelf: 'center', alignItems: 'center'}}> 
            Daily Allowance: $1234
            {'\n'}
            </Text>
          </View>

          <View style={styles.transferBox}>
            
            <Image source={require('./assets/money.png')} />
            
            <Text variant='titleLarge' style={{ fontWeight: 'bold' }}>Pay</Text>  
          </View>

        </View>
      
      }
    </PaperProvider>
  );
}

// COLOURS:
// Dark Purple: 6C447C
// Light Purple: D4A9CD
const styles = StyleSheet.create({
  // LOGIN
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
  },

  // PATIENT
  patientContainer: {
    display: 'flex',
    paddingTop: '10%',
    paddingLeft: '5%',
    paddingRight: '5%',
  },

  amountBox: {
    display: 'flex',
    width: '100%',
    height: 'auto',
    backgroundColor: 'white',
        
    borderRadius: 5,
    marginTop: 15,
    padding: 10,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,  
    elevation: 5
  },

  transferBox: {
    display: 'flex',
    width: '100%',
    height: 'auto',
    backgroundColor: 'white',
    
    borderRadius: 5,
    marginTop: 15,
    padding: 10,

    alignSelf: 'center', 
    alignItems: 'center',
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,  
    elevation: 5
  }

});
