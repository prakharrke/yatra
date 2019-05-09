import React from 'react';
import { View, Container, Header, Content, Button, Text, Form, Body, Right, Item, Input, Label, Spinner, InputGroup, List, ListItem, Left, } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { KeyboardAvoidingView, AsyncStorage, StyleSheet, Dimensions, Modal } from 'react-native'
import { NavigationEvents } from 'react-navigation';
export default class BookingHistory extends React.Component {


	constructor(props) {
		super(props);



		this.state = {
			userData: {}
		}
	}


	async loadList() {

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


	render() {

		console.log('!!!!')
		console.log(this.state.userData)
		return (
			<Content>
				<NavigationEvents onDidFocus={this.loadList.bind(this)} />
				{this.state.userData.postBookingDetailsArray != undefined &&


					<List
						dataArray={this.state.userData.postBookingDetailsArray}
						renderRow={(item) => {
							return (
								<ListItem>
									<Body>
										<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
											<Text style={{ fontWeight: 'bold', fontSize: 20 }}>{item.carRegistrationNo}</Text>
											<Text style={{ fontWeight: 'italic', fontStyle: 'italic' }}>Ride Completed!</Text>
										</View>
										<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
											<Text>{`${new Date(item.bookingTimeStamp).getDate()}-${new Date(item.bookingTimeStamp).getMonth() + 1}-${new Date(item.bookingTimeStamp).getFullYear()} ${new Date(item.bookingTimeStamp).getHours() + 1}:${new Date(item.bookingTimeStamp).getMinutes() + 1}:${new Date(item.bookingTimeStamp).getSeconds() + 1}`}</Text>
											<Text>{item.cost}/-</Text>
										</View>
									</Body>
								</ListItem>

							)

						}}

					/>}

				{
					this.state.userData.postBookingDetailsArray == undefined &&
					<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1 }}>

						<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
							<Text style={{ fontWeight: 'bold', color: '#373737' }}>
								You have not availed our services yet!
							</Text>
						</View>

					</View>
				}


			</Content>
		)

	}


}