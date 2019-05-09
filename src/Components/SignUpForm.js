import React from 'react';
import { View, Container, Header, Content, Button, Text, Form, Item, Input, Label, Spinner } from 'native-base';
import {KeyboardAvoidingView, AsyncStorage} from 'react-native'
//import {AsyncStorage} from '@react-native-community/async-storage'
export default class SignUpForm extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      missingField : ''
    };
  }

  async signUp(){
    if(this.state.firstName === ''){
      alert('Please Enter First Name')
      return
    }
    if(this.state.lastName === ''){
      alert('Please Enter Last Name')
      return
    }
    if(this.state.email === ''){
      alert('Please Enter Email Address')
      return
    }
    if(this.state.password === ''){
      alert('Please Enter Password')
      return
    }

    var userData = {
      ...this.state,
      walletAmount : 0
    }
    var userDataArray = new Array()
   await  AsyncStorage.getItem('userDataArray').then(data=>{
      if(data != null){
        
        userDataArray = JSON.parse(data);
        console.log(userDataArray)
      }
        
    }).catch(e=>{
      alert(e.message)
    })
    var alreadyRegistered = false;
    userDataArray.map(userData=>{
      if(this.state.email === userData.email){
        alert('Email Already Registered. Please Sign In')
        alreadyRegistered = true;
      }
    })

    if(!alreadyRegistered){
    userDataArray.push(userData)

    await AsyncStorage.setItem('userDataArray', JSON.stringify(userDataArray) );
    await AsyncStorage.setItem('currentUser', userData.email)
    this.props.navigation.navigate('MainPage', {
      userData : {...userData}
    });

  }
  }

  render() {
    console.disableYellowBox = true

    return (
      
      <Content enableOnAndroid  contentContainerStyle={{ backgroundColor: '', flex: 1, alignItems: 'stretch' }}>

        <Form >
          <Item  stackedLabel last>
            
            <Input placeholder="First Name" onChangeText={(text) => { this.setState({ firstName: text }) }} />
          </Item>
          <Item  stackedLabel last >
            
            <Input placeholder="Last Name" onChangeText={(text) => { this.setState({ lastName: text }) }} />
          </Item>
          <Item stackedLabel  last >
            
            <Input  placeholder= "Email" onChangeText={(text) => { this.setState({ email: text }) }} />
          </Item>
          <Item  stackedLabel last >
            
            <Input   placeholder="Password" onChangeText={(text) => { this.setState({ password: text }) }} />
          </Item>
          <Button
          
          block
          
          
          onPress={this.signUp.bind(this)}
          style={{ paddingTop: 2, backgroundColor : 'black' }}
        >
          <Text>Sign Up</Text>
        </Button>
        </Form>

        

      </Content>
      
    )
  }


}