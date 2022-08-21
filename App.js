import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Image, View, TouchableWithoutFeedback } from 'react-native';
import { Button, Provider as PaperProvider, Text, TextInput, IconButton } from 'react-native-paper';


const transactionAmount = 521;


export default function App() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [test, setTest] = React.useState("");

  const [view, setView] = React.useState("patient"); // login, patient, manager, hold, await, success

  // Outputs for Patient View
  const [dailyLimit, setDailyLimit] = React.useState(0);
  const [remainingDailyLimit, setRemainingDailyLimit] = React.useState(0);
  const [managedBalance, setManagedBalance] = React.useState(0);

  const [paymentApproved, setPaymentApproved] = React.useState(false);

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

  const getRemainingDailyLimit = () => {
    fetch('https://ht6-heimwallet.herokuapp.com/get_remaining_daily_limit?patient=fjones')
      .then(response => response.json())
      .then(json => {
        console.log(json);
        setRemainingDailyLimit(json.remaining_spend_limit);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getManagedBalance = () => {
    fetch('https://ht6-heimwallet.herokuapp.com/get_managed_balance?patient=fjones')
      .then(response => response.json())
      .then(json => {
        console.log(json);
        setManagedBalance(json.managed_balance);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const makePurchase = () => {
    fetch(`https://ht6-heimwallet.herokuapp.com/make_purchase?patient=fjones&price=${transactionAmount}&longitude=-80.51589796397006&latitude=43.47040761593818`)
      .then(response => response.json())
      .then(json => {
        console.log(json);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const checkForAuth = () => {
    fetch('https://ht6-heimwallet.herokuapp.com/check_for_auth?patient=fjones')
      .then(response => response.json())
      .then(json => {
        if (json.status === "approved") {
          setPaymentApproved(true);
        } else {
          setPaymentApproved(false);
        }
        console.log(json);
      })
      .catch((error) => {
        console.error(error);
      });
  };


  // LOGIN / VIEW API CALLS --------
  function loginAttempt() {
    if (username === "frank") {
      // setTest("logged in as patient");
      setView("patient");
    } else if (username === "colleen") {
      // setTest("logged in as guardian");
      setView("manager");
    } else {
      setTest("Incorrect Username or Password!");
    }
  }

  if (view === "patient") {
    getDailyLimit();
    getRemainingDailyLimit();
  } else if (view === "hold") {
    makePurchase();
  } else if (view === "await") {
    checkForAuth();
  } else if (view === "success") {
    checkForAuth();
  }

  else if (view === "manager") {
    getDailyLimit();
    getRemainingDailyLimit();
    getManagedBalance();
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

          <Text style={{ alignItems: 'center', alignSelf: 'center' }}>
            {test}
          </Text>

          <StatusBar style="auto" />
        </View>
      }

      {view == "patient" &&
        <View style={styles.patientContainer}>
          <Text variant="titleLarge" style={styles.helloText}>
            Hi
            <Text style={{ fontWeight: 'bold' }} > Frank </Text> 👋
            {'\n'}
            Welcome back!
          </Text>

          <View style={styles.amountBox}>
            <Text variant="titleMedium" style={{ alignSelf: 'center', alignItems: 'center' }}>
              Available Balance
              {'\n'}
            </Text>

            <Text variant="titleLarge" style={{ alignSelf: 'center', alignItems: 'center', fontWeight: 'bold' }} >
              <Text style={{ fontWeight: 'normal'}}>CAD</Text> ${remainingDailyLimit}
              {'\n'}
            </Text>

            <Text variant="titleSmall" style={{marginLeft: 10}}>
              Daily Allowance: ${dailyLimit}
              <Text>                        21 Aug 2022</Text>
              {'\n'}
            </Text>
          </View>

          <TouchableWithoutFeedback onPress={() => { setView("hold") }}>
            <View style={styles.transferBox}>

              <Image source={require('./assets/money3.png')} style={{ backgroundColor: 'white', width: 85, height: 85, resizeMode: 'contain' }} />

              <Text variant='titleLarge' style={{ fontWeight: 'bold' }}>Pay</Text>
            </View>
          </TouchableWithoutFeedback>

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

          <View style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center', paddingTop: 40 }}>
           <IconButton iconColor="#000000" icon="home" onPress={() => { setView("login") }} />
          </View>

        </View>
      }

      {view == "hold" &&
        <TouchableWithoutFeedback onPress={() => {
          if (transactionAmount <= remainingDailyLimit) {
            setView("success");
          } else {
            setView("await");
          }
        }}>
          <View style={styles.holdContainer}>
            <Image source={require('./assets/hold_phone.png')} style={{ margin: 25 }} />
            <Text variant="titleLarge" style={{ fontWeight: 'bold', textAlign: 'center' }} >Hold your phone over payment terminal...</Text>
          </View>
        </TouchableWithoutFeedback>
      }

      {view == "await" &&
        <TouchableWithoutFeedback onPress={() => { setView("success") }}>
          <View style={styles.holdContainer}>
            <ActivityIndicator size="large" color='#6C447C' style={{ margin: 25 }} />
            <Text variant="titleLarge" style={{ fontWeight: 'bold', textAlign: 'center' }} >Awaiting Confirmation from Colleen Jones</Text>
            <Text style={{ textAlign: 'center'}}> Transaction of ${transactionAmount} greater than remaining daily limit of ${remainingDailyLimit} </Text>
          </View>
        </TouchableWithoutFeedback>
      }

      {view == "success" &&
        <TouchableWithoutFeedback onPress={() => { setView("patient") }}>
          <View style={styles.holdContainer}>
            {paymentApproved && <Image source={require('./assets/success.png')} style={{ margin: 25 }} />}
            <Text variant="titleLarge" style={{ fontWeight: 'bold', textAlign: 'center' }} >Payment of ${transactionAmount} {paymentApproved ? "authorized!" : "not authorized."}</Text>
          </View>
        </TouchableWithoutFeedback>
      }

      {view == "manager" &&
        <View style={styles.managerContainer}>
          <Text variant="titleLarge" style={styles.helloText}>
            Hi
            <Text style={{ fontWeight: 'bold' }} > Colleen </Text> 👋
            {'\n'}
            Welcome back!
          </Text>

          <View style={styles.amountManagerBox}>
            <Text variant="titleMedium">
              Frank's Report
              {'\n'}
            </Text>

            <View style={styles.splitAmounts}>
              <View style={styles.splitAmountItem}>
                <Text>Allowance remaining</Text>
                <Text variant="titleLarge" style={{ color: '#6C447C', fontWeight: 'bold' }}>${remainingDailyLimit}</Text>

              </View>
              <View style={styles.splitAmountItem}>
                <Text>Daily allowance</Text>
                <Text variant="titleLarge" style={{ color: '#6C447C', fontWeight: 'bold' }}>${dailyLimit}</Text>
              </View>
            </View>

            <Text variant="labelSmall" style={{ textAlign: 'right' }}> 21 Aug 2022 </Text>

          </View>

          <View style={styles.accountBalanceBox}>
            <View style={styles.splitAmounts}>
              <View style={styles.splitAmountItem}>
                <Text variant="titleSmall">Account Balance</Text>
              </View>
              <View style={styles.splitAmountItem}>
                <Text variant="titleSmall">${managedBalance}</Text>
              </View>
            </View>
            <View alignItems='center'>
              <Button mode='elevated' buttonColor='white' style={{ margin: 10 }}>
                <Text color='black'>
                  Manage Allowance
                </Text>
              </Button>
            </View>
          </View>

          <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
            Transaction History
          </Text>

          <View style={styles.transactionItemBox}>
            <View style={styles.splitAmounts}>
              <View style={styles.splitAmountItem}>
                <Text>Groceries</Text>
                <Text style={{ color: '#878A8B' }}>Whole Foods Market</Text>
              </View>
              <View style={styles.splitAmountItem}>
                <Text style={{ color: '#F06363', textAlign: 'right', fontWeight: 'bold' }}>-$32.41</Text>
                <Text style={{ color: '#878A8B', textAlign: 'right' }}>19 Aug 2022</Text>
              </View>
            </View>
          </View>

          <View style={styles.transactionItemBox}>
            <View style={styles.splitAmounts}>
              <View style={styles.splitAmountItem}>
                <Text>Bank Transfer</Text>
                <Text style={{ color: '#878A8B' }}>Colleen Jones</Text>
              </View>
              <View style={styles.splitAmountItem}>
                <Text style={{ color: '#41863B', textAlign: 'right', fontWeight: 'bold' }}>+$1000.00</Text>
                <Text style={{ color: '#878A8B', textAlign: 'right' }}>17 Aug 2022</Text>
              </View>
            </View>
          </View>

          <View style={styles.transactionItemBox}>
            <View style={styles.splitAmounts}>
              <View style={styles.splitAmountItem}>
                <Text>Transportation</Text>
                <Text style={{ color: '#878A8B' }}>Waterloo Taxi</Text>
              </View>
              <View style={styles.splitAmountItem}>
                <Text style={{ color: '#F06363', textAlign: 'right', fontWeight: 'bold' }}>-$121.66</Text>
                <Text style={{ color: '#878A8B', textAlign: 'right' }}>15 Aug 2022</Text>
              </View>
            </View>
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', alignSelf: 'center', paddingTop: 40 }}>
            <IconButton iconColor="#000000" icon="home" onPress={() => { setView("login") }} />
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
  },

  // HOLD, AWAIT and SUCCESS
  holdContainer: {
    display: 'flex',
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingLeft: '10%',
    paddingRight: '10%',
    alignItems: 'center',
    textAlign: 'center',
  },

  // MANAGER
  managerContainer: {
    display: 'flex',
    paddingTop: '15%',
    paddingLeft: '5%',
    paddingRight: '5%',
  },

  amountManagerBox: {
    display: 'flex',
    width: '100%',
    height: 'auto',
    backgroundColor: 'white',

    borderRadius: 5,
    marginTop: 25,
    padding: 10,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5
  },

  splitAmounts: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },

  splitAmountItem: {
    width: '50%',
  },

  accountBalanceBox: {
    display: 'flex',
    width: '100%',
    height: 'auto',
    backgroundColor: '#F5F5F5',

    borderRadius: 5,
    marginTop: 25,
    marginBottom: 25,
    padding: 10,
  },

  transactionItemBox: {
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
});
