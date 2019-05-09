import React from 'react';
import { View, Container, Header, Content, Button, Text, Form, Body, Right, Item, Input, Label, Spinner, InputGroup, List, ListItem, Left, } from 'native-base';


export default class BookingConfrmation extends React.Component {

	constructor(props) {

		super(props);

		this.state={

		}
	}

	componentDidMount(){

		var pickUpLocation = this.props.navigation.getParam('pickUpLocation')
		var latitude = pickUpLocation.latitude;
		var longitude = pickUpLocation.longitude;
		console.log(pickUpLocation)
		var fakeDriverLatitudeInMinutes = (latitude * 60) + (Math.random()  < 0.5 ? (- Math.random()) : Math.random);
		var fakeDriverLatitude = fakeDriverLatitudeInMinutes / 60;

		this.props.navigation.getParam('getDriverLocation')({latitude : fakeDriverLatitude, longitude : pickUpLocation.longitude})



			}

	render(){

		return(

			<View >

			</View>

			)
	}
}