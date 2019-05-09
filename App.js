/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
//import {Platform, StyleSheet, Text, View} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
//import SignInForm from './src/Components/SignInForm'
import { Container, Header, Body, Title, Content, Left, Right, Button, Text, Form, Item, Input, Label, Spinner, View } from 'native-base';
import { KeyboardAvoidingView, Modal } from 'react-native'
import { RootStack } from './src/Routes'
import { createStackNavigator, createTabNavigator, createAppContainer } from "react-navigation";
import DeviceInfo from 'react-native-device-info';
import * as Constants from 's2s/constants'
import * as S2S from 's2s/s2sAuthorization'
import axios from 'axios';

const DEVICE_UNIQUE_ID = DeviceInfo.getUniqueID();

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
     
      loading: true,
      showInvalidModal : false,
      showExpiredModal : false,
      licenseValidated : false
    }
   

  }


   componentDidMount(){
      
       S2S.validateLicense(DEVICE_UNIQUE_ID).then(response => {
         console.log(response)
        if(response == '401'){
          console.log(response)
        this.setState({
          ...this.state,
          licenseValidated : false,
          showInvalidModal : true,
          showExpiredModal : false,
          loading : false
        })
        }

        if(response == '201'){
          console.log(response)  
        this.setState({
          ...this.state,
          licenseValidated : false,
          showInvalidModal : false,
          showExpiredModal : true,
          loading : false
        })
        }

        if(response == '200'){
          console.log(response)
        this.setState({
          ...this.state,
          licenseValidated : true,
          showInvalidModal : false,
          showExpiredModal : false,
          loading : false
        })
        }

    }).catch(e => {
      console.log(e)
      alert(e)
    }) 
   
   }

  render() {
    return (

      <Container >

        {!this.state.loading && this.state.licenseValidated &&
          <Header androidStatusBarColor="black" style={{ backgroundColor: 'black' }}>
            <Left />
            <Body>
              <Title>
                YATRA
                    </Title>
            </Body>
            <Right />
          </Header>}

        {!this.state.loading && this.state.licenseValidated &&
          <RootStack />}
        {
          this.state.loading &&
          <Spinner color={'black'} />
        }

        {
          !this.state.loading && !this.state.licenseValidated && this.state.showInvalidModal &&
          <Modal
            animationType="slide"
          transparent={false}
          visible={this.state.showInvalidModal}
          >
            <View style={{flex : 1, flexDirection : 'row', justifyContent : 'center', alignItems : 'center'}}>

                <Text>Device does not have a valid license for YATRA. Please contact S2S Projects to purchase this application with license. Shop No-11, Near Anuj Medical Store, Ramnagar, Roorkee, 247667 - +91 - 9720255525 | +91 - 9720155525</Text>

              </View>
          </Modal>
        }

        {
          !this.state.loading && !this.state.licenseValidated && this.state.showExpiredModal &&
          <Modal
            animationType="slide"
          transparent={false}
          visible={this.state.showExpiredModal}
          >
            <View style={{flex : 1, flexDirection : 'row', justifyContent : 'center', alignItems : 'center'}}>

                <Text>License for YATRA has expired. Please contact S2S Projects to purchase this application with license. Shop No-11, Near Anuj Medical Store, Ramnagar, Roorkee, 247667 - +91 - 9720255525 | +91 - 9720155525</Text>

              </View>
          </Modal>
        }

      </Container>


    );
  }
}

/*const styles = StyleSheet.create({
  container: {
   ...StyleSheet.absoluteFillObject,
   flex : 1,
   justifyContent: 'flex-end',
   alignItems: 'center',
 },
 map: {
   ...StyleSheet.absoluteFillObject,
 },
});*/

const AppNavigator = createStackNavigator({

  Home: {
    screen: App
  }
},
  {
    headerMode: 'none',
    gesturesEnabled: true
  })
export default createAppContainer(AppNavigator);