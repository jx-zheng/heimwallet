import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, View } from 'react-native';
import { Button, Provider as PaperProvider, Text, TextInput, IconButton } from 'react-native-paper';


export default function App() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [test, setTest] = React.useState("");

  const [view, setView] = React.useState("patient"); // login, patient, manager

  // Outputs for Patient View
  const [dailyLimit, setDailyLimit] = React.useState(0);

  // API CALLS --------
  const getDailyLimit = () => {
    fetch('https://ht6-heimwallet.herokuapp.com/get_daily_limit?patient=fjones')
    .then(response => response.json())
    .then(json => {
      console.log(json);
      setDailyLimit(json.daily_limit);
    })
    .catch((error) => {
      console.error(error);
    });
  };

  // LOGIN / VIEW --------
  function loginAttempt() {
    if (username === "aryaman") {
      // setTest("logged in as patient");
      setView("patient");
    } else if (username === "jason") {
      // setTest("logged in as guardian");
      setView("manager");
    } else {
      setTest("Incorrect Username or Password!");
    }
  }

  if (view === "patient") {
    getDailyLimit();
  }

  return (
    <PaperProvider>
      {view == "login" &&
        <View style={styles.container}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Text variant="displayMedium" style={styles.goodMorning}>
            HeimWallet
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

          <Text style={{ alignItems: 'center', alignSelf: 'center'}}>
            {test}
          </Text>

          <StatusBar style="auto" />
        </View>
      }

      {view == "patient" &&
        <View style={styles.patientContainer}>
          <Text variant="titleLarge" style={styles.helloText}>
            Hi
            <Text style={{ fontWeight: 'bold' }} > Aryaman </Text> 👋
            {'\n'}
            Welcome back!
          </Text>

          <View style={styles.amountBox}>
            <Text variant="titleMedium" style={{ alignSelf: 'center', alignItems: 'center' }}>
              Available Balance
              {'\n'}
            </Text>

            <Text variant="titleLarge" style={{ alignSelf: 'center', alignItems: 'center', fontWeight: 'bold' }} >
              CAD $123
              {'\n'}
            </Text>

            <Text variant="titleSmall" style={{ alignSelf: 'center', alignItems: 'center' }}>
              Daily Allowance: ${dailyLimit}
              {'\n'}
            </Text>
          </View>

          <View style={styles.transferBox}>

            <Image source={require('./assets/money.png')} />

            <Text variant='titleLarge' style={{ fontWeight: 'bold' }}>Pay</Text>
          </View>

          <View style={styles.sosBox}>

            <Text variant="titleMedium" style={{ alignSelf: 'center', alignItems: 'center' }}>
              Are you in an emergency?
              {'\n'}
            </Text>

            <Button mode='contained' buttonColor='#F06363' style={{ borderRadis: '10', width: '100%' }}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold', color: 'white' }}> Hold for SOS </Text></Button>
            <Text />
            <Button mode='elevated' style={{ width: '100%' }}> Send location to contacts</Button>

          </View>

          <View style={{ display: 'flex', flexDirection: 'row', alignSelf:'center', paddingTop: 40}}>
          <IconButton iconColor="#6C447C" icon="home" onPress={() => {setView("login")}} />
          <IconButton iconColor="#6C447C" icon="menu" onPress={() => {setView("login")}} />

          </View>

        </View>
      }

      {view == ""

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
    paddingTop: '15%',
    paddingLeft: '5%',
    paddingRight: '5%',
  },

  amountBox: {
    display: 'flex',
    width: '100%',
    height: 'auto',
    backgroundColor: 'white',

    borderRadius: 5,
    marginTop: 25,
    padding: 5,

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
    marginTop: 25,
    padding: 20,

    alignSelf: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5
  },

  sosBox: {
    display: 'flex',
    width: '100%',
    height: 'auto',
    backgroundColor: 'white',

    borderRadius: 5,
    marginTop: 25,
    padding: 20,

    alignSelf: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5
  }

});
