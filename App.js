import React from 'react';
import { StyleSheet, Text, View, Button, Alert, AsyncStorage, Image } from 'react-native';
import { Facebook } from 'expo';
import Config from 'react-native-config';
import Collections from './components/Collections';
import { createStackNavigator } from 'react-navigation';
import CollectionProfile from './components/CollectionProfile';
import CurrencyInfo from './components/CurrencyInfo';
import CurrencyList from './components/CurrencyList';
import SingleAsset from './components/SingleAsset';

class App extends React.Component { 
    constructor(props) {
        super(props);
        this.state = { userName: '' }
    }

    login = async () => {
        const options = { permissions: ['public_profile'] };
        const { type, token } = await Facebook.logInWithReadPermissionsAsync(process.env.APP_ID, options);
        if (type === 'success') {
            const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
            Alert.alert('Logged in!');
            let displayName = (await response.json()).name;
            this.setState({ userName: displayName });
            this.props.navigation.navigate('Collections', { userName: this.state.userName });
        }
    }

    async checkForId () {
        try {
            const savedID = await AsyncStorage.getItem('@Fantasy:uid');
            if (savedID !== null) {
                this.props.navigation.navigate('Collections');
            } else if (savedID == null) {
                Alert.alert('Sorry, please login through Facebook.')
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Oops! Something went wrong. Please try again!');
        } 
    }

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.moon} source={require('./moon-coin.jpg')} />
                <View style={styles.text}>
                    <Text style={styles.welcome}>Welcome to Fantasy Coin!</Text>
                    <Button
                    raised
                    onPress={this.login}
                    title='Login with Facebook' />
                    <Button
                    raised
                    onPress={() => this.checkForId()}
                    title='I already have an account' />
                </View>
            </View>
        );
    }
}

export default createStackNavigator(
    {
        Landing: App,
        Collections: Collections,
        CollectionProfile: CollectionProfile,
        CurrencyInfo: CurrencyInfo,
        CurrencyList: CurrencyList,
        SingleAsset: SingleAsset
    },
    {
        initialRouteName: 'Landing'
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    moon: {
        justifyContent: 'flex-start',
        marginTop: 40
    },
    welcome: {
        fontSize: 30,
        marginBottom: 10
    },
    text: {
        flex: 2,
        marginTop: 60
    },
});