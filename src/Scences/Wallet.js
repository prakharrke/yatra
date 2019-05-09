import React from 'react';
import { View, Container, Header, Content, Button, Text, Form, Body, Right, Item, Input, Label, Spinner, InputGroup, List, ListItem, Left, } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { KeyboardAvoidingView, AsyncStorage, StyleSheet, Dimensions, Modal } from 'react-native'
import { NavigationEvents } from 'react-navigation';

const width = Dimensions.get("window").width;
export default class UserWallet extends React.Component {


	constructor(props) {
		super(props);
		this.state = {
			userData: {},
			showModal: false,
			cardNumber : '',
			amount : 0,
			cvv : ''
		};
	}

	async loadWallet() {

		var currentUser = '';
		await AsyncStorage.getItem('currentUser').then(user => {
			currentUser = user

		}).catch(e => {
			alert(e.message)
		})



		var userDataArray = new Array();

		await AsyncStorage.getItem('userDataArray').then(data => {
			if (data != null) {

				userDataArray = JSON.parse(data);

			}

		}).catch(e => {
			alert(e.message)
		})

		var userData = {};

		userDataArray.map((user) => {

			if (user.email === currentUser) {

				userData = { ...user }
			}
		})

		this.setState({
			...this.state,
			userData: userData
		})

	}
	async addAmount(){

		var amount = this.state.amount;
		if(amount == 0 || amount == ''){
			alert('Enter correct amount')
			return
		}
		var userDataArray = new Array();

		await AsyncStorage.getItem('userDataArray').then(data => {
			if (data != null) {

				userDataArray = JSON.parse(data);

			}

		}).catch(e => {
			alert(e.message)
		})

		userDataArray.map(async (data, index)=>{

			if(this.state.userData.email === data.email){

				data.walletAmount = parseInt(data.walletAmount) + parseInt(amount);
				await AsyncStorage.setItem('userDataArray', JSON.stringify(userDataArray));
				this.setState({
					...this.state,
					userData : {
						...data,
						
					},
					showModal : false
				})

			}
		})
	}
	initiateAdd(){
		this.setState({
			...this.state,
			showModal : true
		})
	}
	cancel(){

		this.setState({
			...this.state,
			showModal:false
		})
	}

	render() {

		return (

			<View style={{ flex: 1 }}>
				<NavigationEvents onDidFocus={this.loadWallet.bind(this)} />

				{
					this.state.userData.walletAmount != undefined &&

					<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1 }}>

						<Text>Wallet Amount</Text>
						<Text style={{ fontWeight: 'bold', fontSize: 30 }}>Rs. {this.state.userData.walletAmount}</Text>
					</View>
				}
				{this.state.userData.walletAmount != undefined &&
					<View style={{ backgroundColor: 'black', bottom: 0, position: 'absolute' }}>
						<Button
							solid
							onPress={this.initiateAdd.bind(this)}
							style={{ backgroundColor: 'black', width: width, alignItems: 'center' }}>

							<Text>Add Money</Text>

						</Button>
					</View>

				}

				<Modal
					animationType="slide"
					transparent={false}
					visible={this.state.showModal}
				>
				<Content enableOnAndroid contentContainerStyle={{ backgroundColor: '', flex: 1, alignItems: 'stretch' }}>

				<Form >
					<Item stackedLabel last>

						<Input placeholder="Enter Amount" keyboardType = 'numeric' onChangeText={(text) => { this.setState({ amount: text }) }} />
					</Item>
					<Item stackedLabel last >

						<Input placeholder="Enter Card Number" keyboardType = 'numeric' onChangeText={(text) => { this.setState({ cardNumber: text }) }} />
					</Item>
					<Item stackedLabel last >

						<Input placeholder="Enter CVV" keyboardType = 'numeric' onChangeText={(text) => { this.setState({ cvv: text }) }} />
					</Item>
					<Button

						block

						onPress={this.addAmount.bind(this)}
						style={{ paddingTop: 2, backgroundColor: 'black' }}
					>
						<Text>Add</Text>
					</Button>
					<Button

						block

						onPress={this.cancel.bind(this)}
						style={{ paddingTop: 2, backgroundColor: 'black' }}
					>
						<Text>Cancel</Text>
					</Button>
				</Form>



			</Content>

				</Modal>

			</View>


		)
	}
}
