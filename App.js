import React from 'react';
import {StyleSheet, Picker, Button, View, Text, ActivityIndicator, AppRegistry, TextInput } from 'react-native';
import { createStackNavigator } from 'react-navigation';

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isMoonshardSystem: true};

  }

 timeoutPromise = (timeout, err, promise) => {
  return new Promise(function(resolve,reject) {
    promise.then(resolve,reject);
    setTimeout(reject.bind(null,err), timeout);
  });
}
  handleSubmit = () =>{
    const ipAddress = this.state.ipAddress;
    this.timeoutPromise(10, new Error('Timed Out!'), fetch('http://' + ipAddress + ':80/api/verification', {
      timeout: 0
    }))
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson.name == "Moonshard"){
          fetch('http://' + ipAddress + ':80/api/devices', {
           timeout: 0
         })
           .then((response) => response.json())
           .then((responseJson) => {
             this.props.navigation.navigate('DevicesList', {
               NumberOfDevices: responseJson.NumberOfDevices,
               IpAddresses: responseJson.Devices,
             });
           })

        } else {
          this.setState({
            isMoonshardSystem: false
          }, function(){

          });
        }

      })
      .catch((error) =>{
          this.setState({
            isMoonshardSystem: false
          }, function(){

          });
        });
  }

  moonshardValidation = () => {
    if(this.state.isMoonshardSystem == false){
      return <Text style={{color: 'red',
      fontSize: 15,
      marginTop: 15,
      fontWeight: '600'
}}> Invalid Moonshard host! </Text>;
    }
  }

  render() {

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>


      <Text style={{padding: 15}}>Enter host IP address:</Text>

      <TextInput
      style={{height: 40}}
      placeholder="Type host's ip address here!"
      onChangeText={(ipAddress) => this.setState({ipAddress})}
      />

      <Button
      title="Connect"
      onPress={this.handleSubmit}
      />

      { this.moonshardValidation() }

      </View>
    );
  }
}

class DevicesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {SelectedIpAddress: "192.168.1.51"};

  }
  handleSubmit = () => {
    const ipAddress = this.state.SelectedIpAddress;
    this.props.navigation.navigate('ControlButton', {
      SelectedIpAddress: ipAddress,
    });
  }

  render() {

    const { navigation } = this.props;
    const NumberOfDevices = navigation.getParam('NumberOfDevices', '0');
    const IpAddresses = navigation.getParam('IpAddresses', '');

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

      <Picker
      selectedValue={this.state.SelectedIpAddress}
      style={{ height: 150, width: 200 }}
      onValueChange={(itemValue, itemIndex) => this.setState({SelectedIpAddress: itemValue})}>
      {IpAddresses.map((item, index) => {
        return (< Picker.Item label={item} value={item.toString()} key={index} />);
      })}
      </Picker>


      <Button
      title="Connect"
      onPress={this.handleSubmit}
      />
      </View>
      );
    }
  }


class ButtonBasics extends React.Component {
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {SelectedIpAddress: navigation.getParam('SelectedIpAddress', '0')};
  }
  render() {

    return (
      <View style={styles.container}>
      <Text> {this.state.SelectedIpAddress} </Text>
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => {
                fetch('http://' + this.state.SelectedIpAddress + '/RELAY=ON')
            }}
            title="On"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => {
                fetch('http://' + this.state.SelectedIpAddress + '/RELAY=OFF')
            }}
            title="Off"
            color="#841584"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'center',
  },
  buttonContainer: {
    margin: 20
  }
});


  const RootStack = createStackNavigator(
    {
      Home: HomeScreen,
      DevicesList: DevicesList,
      ControlButton: ButtonBasics,
    },
    {
      initialRouteName: 'Home',
    }
  );

  export default class App extends React.Component {
    render() {
      return <RootStack />;
    }
  }
