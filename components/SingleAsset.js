import React from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';

export default class SingleAsset extends React.Component {
    static navigationOptions = { title: 'Currency Info' };
    constructor(props) {
        super(props);
        this.state = {
            asset: '',
            currentRate: 0,
            cid: '',
            fullProfile: '',
        }
    }

    componentDidMount = () => {
        this.getProps();
    }

    getProps = () => {
        const { navigation } = this.props;
        const assetProp = navigation.getParam('asset', 'NO-ASSET');
        this.getCurrentPrice(assetProp.asset_id);
        this.getFullProfile(assetProp.asset_id);
        const cid = navigation.getParam('cid', 'NO_CID');
        this.setState({ asset: assetProp, cid: cid });
    }

    getCurrentPrice = (asset_id) => {
        const API_KEY = process.env.API_KEY;
        const url = 'https://rest.coinapi.io/v1/exchangerate/';
        fetch(url + asset_id + '/USD?apikey=' + API_KEY)
        .then(res => res.json())
        .then(data => {
            let rate = data.rate;
            this.setState({ currentRate: rate });
        }).catch(err => console.log(err));
    }

    getFullProfile = (asset) => {
        let url = 'https://min-api.cryptocompare.com/data/generateAvg?fsym=';
        let urlPart2 = '&tsym=USD&e=Coinbase,Bitfinex,Poloniex,Kraken,HitBTC';
        fetch(url + asset + urlPart2)
        .then(res => res.json())
        .then(data => {
            let display = data.DISPLAY;
            this.setState({ fullProfile: display })
        }).catch(err => console.log(err))
    }

    addCurrency = () => {
        const heroku = 'https://fantasy-coin.herokuapp.com/currencies/';
        const data = {
            collection_id: this.state.cid,
            symbol: this.state.asset.asset_id,
            name: this.state.asset.name,
        };
        fetch(heroku, {
            body: JSON.stringify(data),
            method: 'POST',
            headers: { 'content-type': 'application/json' }
        }).then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.log(err));
    }

    getChangeStyle = (percentChange) => {
        if (percentChange < 0) {
            return {
                color: '#ED2D2D'
            }
        } else {
            return {
                color: '#52E339'
            }
        }
    }

    render() {
        return (
            <View style={styles.main}>
                <ScrollView contentContainerStyle={styles.scrollView} >

                    <View style={styles.button}>
                        <Button 
                            raised 
                            title='Add to collection' 
                            onPress={() => this.addCurrency()} />
                    </View>

                    <View style={styles.profile}>
                        { this.state.asset &&
                        <Text style={styles.title}>{this.state.asset.name} ({this.state.asset.asset_id})</Text> }
                        { this.state.currentRate && 
                        <Text style={styles.price}>${this.state.currentRate.toFixed(5)}</Text> }
                        <Text style={styles.label}>Current Compound Average Price</Text>
                    </View>

                    <View style={styles.profile}>
                        <Text style={styles.high}>{this.state.fullProfile.HIGH24HOUR}</Text>
                        <Text style={styles.low}>{this.state.fullProfile.LOW24HOUR}</Text>
                        <Text style={styles.label}>24 Hour High / Low</Text>
                    </View>

                    <View style={styles.profile}>
                        <Text style={styles.volume}>{this.state.fullProfile.VOLUME24HOUR}</Text>
                        <Text style={styles.volumeTo}>{this.state.fullProfile.VOLUME24HOURTO}</Text>
                        <Text style={styles.label}>24 Hour Volume</Text> 
                    </View>

                    <View style={styles.profile}>
                        <Text style={[styles.change, this.getChangeStyle(this.state.fullProfile.CHANGEPCT24HOUR)]}
                            >{this.state.fullProfile.CHANGE24HOUR}</Text>
                        <Text style={[styles.change, this.getChangeStyle(this.state.fullProfile.CHANGEPCT24HOUR)]}
                            >{this.state.fullProfile.CHANGEPCT24HOUR}%</Text>
                        <Text style={styles.label}>24 Hour Change</Text> 
                    </View>

                    <View style={styles.profile}>
                        <Text style={styles.label}>Today's Opening Price:</Text>
                        <Text style={styles.open}>{this.state.fullProfile.OPEN24HOUR}</Text>
                        <Text style={styles.label}>Market: {this.state.fullProfile.MARKET}</Text>
                        <Text style={styles.label}>Last Updated: {this.state.fullProfile.LASTUPDATE}</Text>
                    
                    </View>        
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    scrollView: {
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingBottom: 20,
    },
    price: {
        fontSize: 34,
        alignSelf: 'center',
        color: '#E600FF'
    },
    title: {
        fontSize: 26,
        alignSelf: 'center',
        color: 'white',
    },
    button: {
        justifyContent: 'center',
        marginTop: 15,
    },
    profile: {
        backgroundColor: '#363D40',
        justifyContent: 'space-evenly',
        width: 330,
        marginTop: 15,
        maxHeight: 200,
        minHeight: 130,
        borderRadius: 8,
        alignContent: 'center',
        shadowColor: '#000000', 
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 5,
        shadowOpacity: 1.0
    },
    high: {
        fontSize: 34,
        color: '#52E339',
        alignSelf: 'center',
    },
    low: {
        fontSize: 34,
        color: '#ED2D2D',
        alignSelf: 'center',
    },
    label: {
        fontSize: 16,
        color: 'white',
        alignSelf: 'center',
    },
    volume: {
        fontSize: 30,
        color: '#63C3F2',
        alignSelf: 'center',
    },
    volumeTo: {
        fontSize: 30,
        color: '#63C3F2',
        alignSelf: 'center',
    },
    change: {
        fontSize: 30,
        alignSelf: 'center',
    },
    open: {
        fontSize: 28,
        color: '#63C3F2',
        alignSelf: 'center'
    },
})