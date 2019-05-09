import React from 'react'

import { Container, Header, Content, Button, Text } from 'native-base';
import SignInForm from './Components/SignInForm'
import SignUpForm from './Components/SignUpForm'
import Main from './Scences/Main'
import BookingHistory from './Scences/History'
import BookingConfirmation from './Scences/BookingConfirmation'
import { createStackNavigator, createBottomTabNavigator, createAppContainer, createSwitchNavigator } from "react-navigation";
import UserWallet from './Scences/Wallet'

export const RootStack1 = createSwitchNavigator({

	Welcome: {

		screen: createBottomTabNavigator({

			SignUp: {
				screen: SignUpForm,
				navigationOptions: {

					tabBarLabel: "Sign Up",
					swipeEnabled: true

				}
			},
			SignIn: {

				screen: SignInForm,
				navigationOptions: {

					tabBarLabel: "Sign In",
					swipeEnabled: true

				}
			}
		},
			{
				gesturesEnabled: true,

			})
	},

	MainPage: {

		screen: createBottomTabNavigator({
			MainApp: {
				screen : Main,
				navigationOptions: {

					tabBarLabel: "Home",
					swipeEnabled: true

				}

			},
			History: {
				screen : BookingHistory,
				navigationOptions: {

					tabBarLabel: "History",
					swipeEnabled: true

				}

			},
			UserWallet: {
				screen : UserWallet,
				navigationOptions: {

					tabBarLabel: "Wallet",
					swipeEnabled: true

				}

			},
			
			
		},

			{
				headerMode: 'none',
				gesturesEnabled: true
			}
		)
	}
},
	{
		headerMode: 'none',
		gesturesEnabled: true
	})


export const RootStack = createAppContainer(RootStack1)

