import React from 'react';
import { View, Container, Header, Content, Button, Text, Form, Item, Input, Label, Spinner } from 'native-base';
import { KeyboardAvoidingView, AsyncStorage } from 'react-native'
export default class SignInForm extends React.Component {

	constructor(props) {

		super(props);

		this.state = {
			email: '',
			password: ''
		};
	}

	async signIn() {

		if (this.state.email === '') {
			alert('Please Enter Email Address')
			return
		}
		if (this.state.password === '') {
			alert('Please Enter Password')
			return
		}

		var userData = {
			...this.state
		}
		var userDataArray = new Array();

		 await AsyncStorage.getItem('userDataArray').then(data => {
			if (data != null) {

				userDataArray = JSON.parse(data);
				
			}

		}).catch(e => {
			alert(e.message)
		})

		var notRegistered = true;
		var userDataFromMem = {};
		userDataArray.map(data => {
			console.log(data)
			if (data.email === this.state.email) {
				notRegistered = false;
				userDataFromMem = { ...data }
			}
		})

		if (notRegistered) {
			alert("Email not registered. Please Sign Up");
		} else {

			if (this.state.password != userDataFromMem.password) {
				alert("Incorrect Password")
				return
			} else {
				await AsyncStorage.setItem('currentUser', userDataFromMem.email)
				this.props.navigation.navigate('MainPage',{
					userData : {...userDataFromMem}
				});
			}



		}

	}
	render() {

		return (

			<Content enableOnAndroid contentContainerStyle={{ backgroundColor: '', flex: 1, alignItems: 'stretch' }}>

				<Form >
					<Item stackedLabel last>

						<Input placeholder="Email" onChangeText={(text) => { this.setState({ email: text }) }} />
					</Item>
					<Item stackedLabel last >

						<Input placeholder="Password" onChangeText={(text) => { this.setState({ password: text }) }} />
					</Item>
					<Button

						block

						onPress={this.signIn.bind(this)}
						style={{ paddingTop: 2, backgroundColor: 'black' }}
					>
						<Text>Sign In</Text>
					</Button>
				</Form>



			</Content>

		)
	}


}