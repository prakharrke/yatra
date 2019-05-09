import React from 'react';
import { View, Container, Header, Content, Button, Text, Form, Body, Right, Item, Input, Label, Spinner, InputGroup, List, ListItem, Left, } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { KeyboardAvoidingView, AsyncStorage, StyleSheet, Dimensions, Modal } from 'react-native'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import axios from 'axios'
import Polyline from '@mapbox/polyline'
import FontAwesome, { Icons } from 'react-native-fontawesome';

var taxiIcon = require('../../public/blue-car-icon-png-5.png')
const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const aspectRatio = width / height;
const LATITUDEDELTA = 0.0922;
const LONGITUDEDATA = aspectRatio * LATITUDEDELTA;
const carRegistrationNo_1 = ['UK-01', 'UK-02', 'UK-02', 'UK-03', 'UK-03', 'UK-04', 'UK-05', 'UK-06', 'UK-07', 'UK-08', 'UK-09', 'UK-10', 'UK-11', 'UK-12', 'UK-13', 'UK-14', 'UK-15', 'UK-16', 'UK-17', 'UK-18', 'UK-19', 'UK-20']
const carRegistrationNo_2 = ['ABG', 'ZSE', 'YRT', 'PP', 'BR', 'ZZ']
const carRegistrationNo_3 = ['7453', '1854', '9074', '1499', '2000', '7467', '3093', '8793', '0102', '1010']
export default class Main extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			userData: {},
			loading: true,
			region: {
				latitude: 37.78825,
				longitude: -122.4324,
				latitudeDelta: LATITUDEDELTA,
				longitudeDelta: LONGITUDEDATA,
			},
			locationLoaded: false,
			currentSearchInput: '',
			pickUpLocationString: '',
			dropLocationString: '',
			predictions: [],
			pickUpAddressDetails: { pickUpSet: false },
			dropAddressDetails: { dropSet: false },
			polylinePoints: [],
			distance: '',
			distanceValue: 0,
			time: '',
			modalVisible: false,
			driverLocation: {},
			driverLocationSet: false,
			driverOnWay: false,
			driverPolylinePoints: [],
			driverETA: '',
			driverReached: false,
			bookingConfirmed: false,
			rideStarted: false,
			rideFinished: false,
			bookingTimeStamp: new Date(),
			carRegistrationNo: '',
			paymentDone : false

		}
		this.mapRef = null;
		this.driverMarkerRef = null;
		this.pickUpLocationSet = false;
		this.dropLocationSet = false;
		this.origin = "";
		this.destination = "";
		this.distanceValue = 0;
	}

	componentDidMount() {
		this.setState({
			...this.state,
			userData: { ...this.props.navigation.dangerouslyGetParent().getParam('userData') }
		})
		navigator.geolocation.getCurrentPosition((location) => {


			this.setState({
				region: {
					...this.state.region,
					latitude: location.coords.latitude,
					longitude: location.coords.longitude
				},
				locationLoaded: true,
				loading: false
			})
		},
			(err) => {
				console.log(err.message)
			},
			{
				enableHighAccuracy: false,
				maximumAge: 1000,
				timeout: 20000
			})
		//this.mapView.animateToRegion(newRegion, 1000);
	}

	setSearchLocation(text) {
		if (text === '' && this.state.currentSearchInput === 'pickup') {
			this.setState({
				...this.state,

				predictions: [],
				pickUpLocationString: text
			})
			return
		}
		if (text === '' && this.state.currentSearchInput === 'drop') {
			this.setState({
				...this.state,

				predictions: [],
				dropLocationString: text
			})
			return
		}
		if (this.state.currentSearchInput === 'pickup')
			this.setState({
				...this.state,
				pickUpLocationString: text,
			})
		if (this.state.currentSearchInput === 'drop')
			this.setState({
				...this.state,
				dropLocationString: text
			})

		axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
			params: {

				key: 'GOOGLE_API_KEY',
				input: text,
				location: `${this.state.region.latitude} , ${this.state.region.longitude}`,

			}
		}).then(response => {
			this.setState({
				...this.state,
				predictions: response.data.predictions
			})
		}).catch(e => {
			alert(e.message)
		})
	}

	selectAddress(placeID) {

		axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
			params: {

				key: 'GOOGLE_API_KEY',
				placeid: placeID,


			}
		}).then(response => {


			var addressDetails = {
				formattedAddress: response.data.result.formatted_address,
				placeID: response.data.result.place_id,
				location: {
					...response.data.result.geometry.location
				}
			}

			if (this.state.currentSearchInput === 'pickup') {
				this.pickUpLocationSet = true;
				this.origin = `${addressDetails.location.lat} , ${addressDetails.location.lng}`
				this.setState({
					...this.state,
					pickUpLocationString: addressDetails.formattedAddress,
					pickUpAddressDetails: {
						pickUpSet: true,
						...addressDetails,
						location: {
							latitude: addressDetails.location.lat,
							longitude: addressDetails.location.lng
						}
					},
					predictions: [],
					region: {
						...this.state.region,
						latitude: addressDetails.location.lat,
						longitude: addressDetails.location.lng
					}
				})


			}

			if (this.state.currentSearchInput === 'drop') {
				this.dropLocationSet = true;
				this.destination = `${addressDetails.location.lat} , ${addressDetails.location.lng}`
				this.setState({
					...this.state,
					dropLocationString: addressDetails.formattedAddress,
					dropAddressDetails: {
						dropSet: true,
						...addressDetails,
						location: {
							latitude: addressDetails.location.lat,
							longitude: addressDetails.location.lng
						}
					},
					predictions: []
				})


			}


			this.mapRef.fitToSuppliedMarkers(['pickUpLocation', 'dropLocation'], { animated: true, edgePadding: { top: 400, right: 40, bottom: 40, left: 40 } })

		})
			.then(() => {
				if (this.pickUpLocationSet && this.dropLocationSet) {

					var origin = this.origin;
					var destination = this.destination;

					axios.get('https://maps.googleapis.com/maps/api/directions/json', {
						params: {
							key: 'GOOGLE_API_KEY',
							origin: origin,
							destination: destination,
							mode: 'driving'
						}
					}).then(response => {
						var overviewPolyline = response.data.routes[0].overview_polyline.points;
						var points = Polyline.decode(overviewPolyline);
						var polylinePoints = points.map((point, index) => {

							return {
								latitude: point[0],
								longitude: point[1]
							}
						})


						this.setState({
							...this.state,
							polylinePoints: polylinePoints
						})
					})
						.then(() => {
							// Promise to get time and distance
							axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
								params: {
									key: 'GOOGLE_API_KEY',
									origins: origin,
									destinations: destination,
									mode: 'driving'
								}
							}).then(response => {

								var distance = response.data.rows[0].elements[0].distance.text;
								var distanceValue = response.data.rows[0].elements[0].distance.value / 1000;
								var time = response.data.rows[0].elements[0].duration.text;
								this.distanceValue = distanceValue;
								this.setState({
									distance: distance,
									time: time,
									distanceValue: distanceValue
								})


							}).catch(e => {
								alert(e.message)
							})

						})
						.catch(e => {
							alert(e.message)
						})

				}
			})
			.catch(e => {
				alert(e.message)
			})
	}

	clearDropLocation() {
		this.dropLocationSet = false;
		this.destination = "";
		this.setState({
			...this.state,
			dropAddressDetails: {
				dropSet: false
			},
			dropLocationString: '',
			polylinePoints: new Array()
		})
	}

	clearPickUpLocation() {
		this.pickUpLocationSet = false;
		this.origin = "";
		this.setState({
			...this.state,
			pickUpAddressDetails: {
				pickUpSet: false
			},
			pickUpLocationString: '',
			polylinePoints: new Array()
		})
	}

  async	navigateToBookingConfirmation() {
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
			userData : {...userData}
		})
		console.log("!!!!!@@@@@@@@@@@@@" + this.distanceValue * 10)
		if(Math.ceil(this.distanceValue * 10) > userData.walletAmount){
			alert('You do not have sufficient amount in wallet. Minimum amount required: Rs.' + Math.ceil(this.distanceValue * 10))
			return
		}

		var latitude = this.state.pickUpAddressDetails.location.latitude;
		var longitude = this.state.pickUpAddressDetails.location.longitude;
		var carRegistrationNo = `${carRegistrationNo_1[Math.floor(Math.random() * carRegistrationNo_1.length)]} ${carRegistrationNo_2[Math.floor(Math.random() * carRegistrationNo_2.length)]} ${carRegistrationNo_3[Math.floor(Math.random() * carRegistrationNo_3.length)]}`
		var mathRandom_1 = Math.random();
		var mathRandom_2 = Math.random();
		var mathRandom_3 = Math.random();
		var fakeDriverLatitudeInMinutes = (latitude * 60) + (mathRandom_1 < 0.5 ? (- mathRandom_2) : mathRandom_3);
		var fakeDriverLatitude = fakeDriverLatitudeInMinutes / 60;

		axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
			params: {
				key: 'GOOGLE_API_KEY',
				origins: `${fakeDriverLatitude} , ${longitude}`,
				destinations: `${latitude} , ${longitude}`,
				mode: 'driving'
			}
		}).then(response => {
			var distance = response.data.rows[0].elements[0].distance.text;
			var distanceValue = response.data.rows[0].elements[0].distance.value / 1000;
			var time = response.data.rows[0].elements[0].duration.text;

			this.setState({
				...this.state,
				modalVisible: true,
				driverLocation: { latitude: fakeDriverLatitude, longitude: longitude },
				driverLocationSet: true,
				driverDistance: distance,
				driverDistanceValue: distanceValue,
				driverETA: time,
				carRegistrationNo: carRegistrationNo
			})


		})




	}

	confirmBooking() {

		this.setState({
			...this.state,
			bookingConfirmed: true,
			bookingTimeStamp: new Date()
		})


		this.mapRef.fitToSuppliedMarkers(['pickUpLocation', 'driverLocation'], { animated: true, edgePadding: { top: 400, right: 40, bottom: 40, left: 40 } })
		var origin = `${this.state.driverLocation.latitude} , ${this.state.driverLocation.longitude}`;
		var destination = `${this.state.pickUpAddressDetails.location.latitude} , ${this.state.pickUpAddressDetails.location.longitude}`;

		axios.get('https://maps.googleapis.com/maps/api/directions/json', {
			params: {
				key: 'GOOGLE_API_KEY',
				origin: origin,
				destination: destination,
				mode: 'driving'
			}
		}).then(response => {
			var overviewPolyline = response.data.routes[0].overview_polyline.points;
			var points = Polyline.decode(overviewPolyline);
			var polylinePoints = points.map((point, index) => {

				return {
					latitude: point[0],
					longitude: point[1],

				}
			})


			this.setState({
				...this.state,
				driverPolylinePoints: polylinePoints,
				driverOnWay: true,
				modalVisible: false
			})

			var interval = setInterval(() => {

				var newArray = new Array();
				if (polylinePoints.length == 1) {

					clearInterval(interval)
					this.setState({
						driverReached: true,
						driverOnWay: false,

					})
					return
				}
				newArray = polylinePoints.slice(1)
				var driverCurrentLocation = newArray[0];
				polylinePoints = new Array();
				polylinePoints = newArray;

				axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
					params: {
						key: 'GOOGLE_API_KEY',
						origins: `${driverCurrentLocation.latitude} , ${driverCurrentLocation.longitude}`,
						destinations: `${this.state.pickUpAddressDetails.location.latitude} , ${this.state.pickUpAddressDetails.location.longitude}`,
						mode: 'driving'
					}
				}).then(response => {
					var distance = response.data.rows[0].elements[0].distance.text;
					var distanceValue = response.data.rows[0].elements[0].distance.value / 1000;
					var time = response.data.rows[0].elements[0].duration.text;

					this.setState({
						...this.state,
						driverETA: time,
						driverPolylinePoints: polylinePoints,
						driverLocation: { ...driverCurrentLocation }


					})

					this.driverMarkerRef.hideCallout();
					this.driverMarkerRef.showCallout();



				})



			}, 1000);
		})

		this.driverMarkerRef.showCallout();






	}

	regionChage(obj) {

		this.setState({
			...this.state,
			region: {
				...obj
			}
		})
	}

	async startRide() {
		this.setState({
			rideStarted: true
		})
		var polylinePoints = this.state.polylinePoints;
		var interval = setInterval(async () => {


			var newArray = new Array();
			if (polylinePoints.length == 1) {

				//alert('You have reached your destination')
				clearInterval(interval)
				var postBookingDetails = {
					bookingTimeStamp: this.state.bookingTimeStamp,
					pickUpLocationString: this.state.pickUpLocationString,
					dropLocationString: this.state.dropLocationString,
					carRegistrationNo: this.state.carRegistrationNo,
					cost: Math.ceil(this.distanceValue * 10)

				};

				// * GET USERDATA AND ADD POSTBOKKINGDETAILS TO ASYNC STORAGE
				var userDataArray = new Array();

				await AsyncStorage.getItem('userDataArray').then(data => {
					if (data != null) {

						userDataArray = JSON.parse(data);
						console.log(userDataArray)
					}

				}).catch(e => {
					alert(e.message)
				})

				userDataArray.map(async (userData, index) => {

					if (userData.email === this.state.userData.email) {

						if (userData.postBookingDetailsArray == undefined) {
							var postBookingDetailsArray = new Array();
							postBookingDetailsArray.push({ ...postBookingDetails })
							userData['postBookingDetailsArray'] = postBookingDetailsArray

						} else {
							userData.postBookingDetailsArray.push({ ...postBookingDetails })
						}

						await AsyncStorage.setItem('userDataArray', JSON.stringify(userDataArray));

					}
				})

				this.pickUpLocationSet = false;
				this.dropLocationSet = false;
				this.origin = "";
				this.destination = "";
				this.setState({
					...this.state,

					currentSearchInput: '',
					pickUpLocationString: '',
					dropLocationString: '',
					predictions: [],
					pickUpAddressDetails: { pickUpSet: false },
					dropAddressDetails: { dropSet: false },
					polylinePoints: [],
					distance: '',
					distanceValue: 0,
					time: '',
					modalVisible: false,
					driverLocation: {},
					driverLocationSet: false,
					driverOnWay: false,
					driverPolylinePoints: [],
					polylinePoints : [],
					driverETA: '',
					driverReached: false,
					bookingConfirmed: false,
					rideStarted: false,
					rideFinished: true,
					


				})
				return
			}
			newArray = polylinePoints.slice(1)
			var driverCurrentLocation = newArray[0];
			polylinePoints = new Array();
			polylinePoints = newArray;

			axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
				params: {
					key: 'GOOGLE_API_KEY',
					origins: `${driverCurrentLocation.latitude} , ${driverCurrentLocation.longitude}`,
					destinations: `${this.state.dropAddressDetails.location.latitude} , ${this.state.dropAddressDetails.location.longitude}`,
					mode: 'driving'
				}
			}).then(response => {
				var distance = response.data.rows[0].elements[0].distance.text;
				var distanceValue = response.data.rows[0].elements[0].distance.value / 1000;
				var time = response.data.rows[0].elements[0].duration.text;

				this.setState({
					...this.state,
					driverETA: time,
					driverPolylinePoints: polylinePoints,
					polylinePoints: polylinePoints,
					driverLocation: { ...driverCurrentLocation }


				})

				this.driverMarkerRef.hideCallout();
				this.driverMarkerRef.showCallout();



			})



		}, 1000);
	}

	async payThroughWallet() {

		var cost = Math.ceil(this.distanceValue * 10);
		var userDataArray = new Array();

				await AsyncStorage.getItem('userDataArray').then(data => {
					if (data != null) {

						userDataArray = JSON.parse(data);
						console.log(userDataArray)
					}

				}).catch(e => {
					alert(e.message)
				})

				userDataArray.map(async (userData , index)=>{

					if(userData.email === this.state.userData.email){

						userData.walletAmount = userData.walletAmount - cost;
						await AsyncStorage.setItem('userDataArray', JSON.stringify(userDataArray));
						this.setState({
							...this.state,
							userData : {...userData},
							paymentDone : true
						})
					}

				})


	}

	navigateToHomeAfterPayment(){

		this.setState({
			...this.state,
			rideFinished : false,
			paymentDone : false,
			polylinePoints : [],
			driverPolylinePoints : []
		})
	}

	render() {
		console.disableYellowBox = true
		console.log(this.state)
		return (
			<Container style={styles.container}>

				{

					this.state.locationLoaded ?
						<MapView
							provider={PROVIDER_GOOGLE}
							style={styles.map}

							zoomEnabled={true}
							initialRegion={this.state.region}
							ref={ref => { this.mapRef = ref }}
							showsUserLocation={true}
							onRegionChangeComplete={this.regionChage.bind(this)}
						//onLayout={this.fitMarkers.bind(this)}
						>
							{this.state.pickUpAddressDetails.pickUpSet && !this.driverReached && !this.state.rideStarted &&
								<Marker
									identifier="pickUpLocation"
									coordinate={{ ...this.state.pickUpAddressDetails.location }}
									pinColor="green"
								/>}
							{this.state.dropAddressDetails.dropSet && !this.driverOnWay &&
								<Marker
									identifier="dropLocation"
									coordinate={{ ...this.state.dropAddressDetails.location }}

								/>
							}
							{this.state.driverLocationSet &&
								<Marker
									ref={ref => { this.driverMarkerRef = ref }}
									identifier="driverLocation"
									coordinate={{ ...this.state.driverLocation }}
									image={taxiIcon}
									flat={true}

								>
									<MapView.Callout>
										<Text>{this.state.rideStarted ? "Destination " : "Cab Arrival "} {this.state.driverETA}</Text>
									</MapView.Callout>
								</Marker>
							}
							{
								this.state.polylinePoints.length > 0 && !this.state.driverOnWay &&
								<MapView.Polyline
									coordinates={this.state.polylinePoints}
									strokeWidth={4}
									strokeColor="black" />
							}
							{
								this.state.driverPolylinePoints.length > 0 && this.state.driverOnWay &&
								<MapView.Polyline
									coordinates={this.state.driverPolylinePoints}
									strokeWidth={4}
									strokeColor="black" />
							}
						</MapView> : <Spinner color='black'/>
				}
				{!this.state.rideStarted &&
					<View style={styles.searchBox}>
									<View style={styles.pickUpWrapper}>
										<InputGroup>
				
											<Input
												onFocus={() => { this.setState({ ...this.state, currentSearchInput: 'pickup', predictions: [] }) }}
												onChangeText={this.setSearchLocation.bind(this)}
												value={this.state.pickUpLocationString}
												placeholder="PICK UP LOCATION" />
				
											<Button transparent
												onPress={this.clearPickUpLocation.bind(this)}
											>
												<Icon name="clear" style={{ fontSize: 40 }} />
											</Button>
				
				
										</InputGroup>
									</View>
									<View style={styles.dropWrapper}>
										<InputGroup>
				
											<Input
												onFocus={() => { this.setState({ ...this.state, currentSearchInput: 'drop', predictions: [] }) }}
												onChangeText={this.setSearchLocation.bind(this)}
												value={this.state.dropLocationString}
												placeholder="DROP LOCATION" />
				
											<Button transparent
												onPress={this.clearDropLocation.bind(this)}
											>
												<Icon name="clear" style={{ fontSize: 40 }} />
											</Button>
				
										</InputGroup>
									</View>
								</View>}
				{this.state.currentSearchInput != '' && this.state.predictions.length > 0 &&
					<View style={styles.searchResults}>
						<List
							dataArray={this.state.predictions}
							renderRow={(item) => {
								return (
									<ListItem onPress={this.selectAddress.bind(this, item.place_id)} button avatar>
										<Left style={styles.leftContainer}>
											<Icon name="location-on" style={styles.leftIcon} />
										</Left>
										<Body>
											<Text style={styles.primaryText}>{item.description}</Text>
										</Body>
									</ListItem>

								)

							}}
						/>

					</View>}

				{this.state.polylinePoints.length > 0 && !this.state.bookingConfirmed && !this.state.driverReached &&
					<View style={styles.bookingDetailsWrapper}>

						<View style={styles.bookCabWrapper}>

							<Button
								block

								onPress={this.navigateToBookingConfirmation.bind(this)}
								style={{ width: width, backgroundColor: 'black' }}><Text>Book</Text></Button>

						</View>
					</View>}

				{this.state.polylinePoints.length > 0 && this.state.bookingConfirmed && this.state.driverReached && !this.state.rideStarted &&
					<View style={styles.bookingDetailsWrapper}>

						<View style={styles.bookCabWrapper}>

							<Button
								block

								onPress={this.startRide.bind(this)}
								style={{ width: width, backgroundColor: 'black' }}><Text>Start Ride</Text></Button>

						</View>
					</View>}
				<Modal
					animationType="slide"
					transparent={false}
					visible={this.state.modalVisible}
				>
					<View style={{ marginTop: 22, }}>
						<View>

							<Left></Left>
							<Body><Text style={styles.primaryText}>Bookig Details</Text></Body>
							<Right></Right>

						</View>
						<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 120 }}>

							<View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
								<View style={{ width: width / 2, alignItems: 'flex-start' }}>
									<Text style={styles.bookingDetailsTextLeft}>Estimated Arival of Time : </Text>
								</View>
								<View style={{ width: width / 2, alignItems: 'flex-end' }}>
									<Text style={styles.bookingDetailsTextRight}>{this.state.time}</Text>
								</View>
							</View>

							<View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
								<View style={{ width: width / 2, alignItems: 'flex-start' }}>
									<Text style={styles.bookingDetailsTextLeft}>Distance : </Text>
								</View>
								<View style={{ width: width / 2, alignItems: 'flex-end', }}>
									<Text style={styles.bookingDetailsTextRight}>{this.state.distance}</Text>
								</View>
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
								<View style={{ width: width / 2, alignItems: 'flex-start' }}>
									<Text style={styles.bookingDetailsTextLeft}>Estimated Fare : </Text>
								</View>
								<View style={{ width: width / 2, alignItems: 'flex-end', }}>
									<Text style={styles.bookingDetailsTextRight}>{this.state.distanceValue * 9}/-</Text>
								</View>
							</View>

							<View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
								<View style={{ width: width / 2, alignItems: 'flex-start', }}>
									<Text style={styles.bookingDetailsTextLeft}>ETA on Driver : </Text>
								</View>
								<View style={{ width: width / 2, alignItems: 'flex-end' }}>
									<Text style={styles.bookingDetailsTextRight}>{this.state.driverETA}</Text>
								</View>
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
								<View style={{ width: width / 2, alignItems: 'flex-start', }}>
									<Text style={styles.bookingDetailsTextLeft}>Car UID : </Text>
								</View>
								<View style={{ width: width / 2, alignItems: 'flex-end' }}>
									<Text style={styles.bookingDetailsTextRight}>{this.state.carRegistrationNo}</Text>
								</View>
							</View>
						</View>
					</View>
					<View style={{ flexDirection: 'row', bottom: 0, position: 'absolute', backgroundColor: 'black' }}>
						<View>
							<Button block style={{ backgroundColor: 'black', width: width / 2 }} onPress={() => { this.setState({ modalVisible: false }) }}><Text>Cancel</Text></Button>
						</View>
						<View>
							<Button block style={{ backgroundColor: 'black', width: width / 2 }} onPress={this.confirmBooking.bind(this)}><Text>Ride Now</Text></Button>
						</View>

					</View>
				</Modal>
				<Modal
					animationType="slide"
					transparent={false}
					visible={this.state.rideFinished}
				>
					<View style={{ flex: 0.2 }}>

						<Left></Left>
						<Body><Text style={styles.primaryText}>Ride Completed!</Text></Body>
						<Right></Right>

					</View>
					{!this.state.paymentDone &&
						<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 0.6 }}>
							<Text>Total Amount Due</Text>
							<Text style={{ fontWeight: 'bold', fontSize: 30 }}>Rs. {Math.ceil(this.distanceValue * 10)}</Text>
						</View>}
					{!this.state.paymentDone &&
						<View style={{ backgroundColor: 'black', bottom: 0, position: 'absolute' }}>
							<Button
								solid
								onPress={this.payThroughWallet.bind(this)}
								style={{ backgroundColor: 'black', width: width, alignItems: 'center' }}>

								<Text>Pay Through Wallet</Text>

							</Button>
						</View>}
						{this.state.paymentDone &&
						<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 0.6 }}>
							<Text>Payment Successful!</Text>
							
						</View>}
						{this.state.paymentDone &&
						<View style={{ backgroundColor: 'black', bottom: 0, position: 'absolute' }}>
							<Button
								solid
								onPress={this.navigateToHomeAfterPayment.bind(this)}
								style={{ backgroundColor: 'black', width: width, alignItems: 'center' }}>

								<Text>Home</Text>

							</Button>
						</View>}



				</Modal>

			</Container>


		)
	}
}

const styles = StyleSheet.create({
	container: {
		//...StyleSheet.absoluteFillObject,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	map: {
		//flex: 1,
		...StyleSheet.absoluteFillObject,
	},

	searchBox: {
		top: 0,
		position: "absolute",

		width: width,
	},
	pickUpWrapper: {
		backgroundColor: 'white',
		marginLeft: 20,
		marginRight: 20,
		borderRadius: 7,
		marginTop: 20,
		marginBottom: 0,
		opacity: 0.9
	},
	dropWrapper: {
		backgroundColor: 'white',
		marginLeft: 20,
		marginRight: 20,
		borderRadius: 7,
		marginTop: 0,
		marginBottom: 0,
		opacity: 0.9
	},
	searchResults: {
		top: 130,
		position: 'absolute',
		width: width,
		height: 1000,
		backgroundColor: 'white',
		opacity: 0.9
	},
	primaryText: {
		fontWeight: 'bold',
		color: '#373737'
	},
	leftContainer: {
		flexWrap: 'wrap',
		alignItems: 'flex-start',
		borderLeftColor: '#7D7D7D'
	},
	rightContainer: {
		flexWrap: 'wrap',
		alignItems: 'flex-end',
		borderLeftColor: '#7D7D7D'
	},
	leftIcon: {
		fontSize: 20,
		color: '#7D7D7D'
	},
	bookingDetailsWrapper: {

		bottom: 0,
		position: "absolute",

		width: width,

	},
	fareDistTimeWrapper: {
		backgroundColor: 'white',
		marginLeft: 20,
		marginRight: 20,
		borderRadius: 7,
		marginTop: 20,
		marginBottom: 0,
		opacity: 0.9,
		flexDirection: 'row',
		justifyContent: 'space-between'

	},
	fareWrapper: {
		backgroundColor: 'white',
		marginLeft: 20,
		marginRight: 20,
		borderRadius: 7,
		marginTop: 0,
		marginBottom: 0,
		opacity: 0.9,
		flexDirection: 'row',
		justifyContent: 'center'

	},
	bookCabWrapper: {
		backgroundColor: 'white',

		borderRadius: 7,
		marginTop: 0,
		marginBottom: 0,
		opacity: 0.9,
		flexDirection: 'row',
		justifyContent: 'center'

	},

	bookingDetailsTextRight: {
		marginRight: 5
	},
	bookingDetailsTextLeft: {
		marginLeft: 5
	}
});