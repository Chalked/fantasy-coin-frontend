import React from 'react';
import { View, 
         ScrollView, 
         Text, 
         TextInput, 
         StyleSheet, 
         Alert, 
         Button, 
         Modal, 
         PickerIOS } from 'react-native';

export default class CurrencyInfo extends React.Component {
    static navigationOptions = { title: 'Currency Info' };
        constructor(props) {
        super(props);
        this.state = {
            currency: '',
            collection: '',
            currentRate: '',
            fullProfile: '',
            buyModal: false,
            sellModal: false,
            investment: '',
            sale: '',
        }
    }

    componentDidMount = () => {
        this.getProps();
    }

    getProps = () => {
        const { navigation } = this.props;
        const currency = navigation.getParam('currency', 'NO-CURR');
        const collection = navigation.getParam('collection', 'NO-COLLECTION');
        this.getCurrentPrice(currency.symbol);
        this.getFullProfile(currency.symbol);
        this.setState({ currency: currency, collection: collection });
    }

    toggleBuyModal = () => {
        this.setState({ buyModal: !this.state.buyModal });
    }

    toggleSellModal = () => {
        this.setState({ sellModal: !this.state.sellModal });
    }

    getFullProfile = (asset) => {
        let url = 'https://min-api.cryptocompare.com/data/generateAvg?fsym=';
        let secondUrl = '&tsym=USD&e=Coinbase,Bitfinex,Poloniex,Kraken,HitBTC'
        fetch(url + asset + secondUrl)
        .then(res => res.json())
        .then(data => {
            let display = data.DISPLAY;
            this.setState({ fullProfile: display });
        }).catch(err => console.log(err));
    }

    getCurrentPrice = (asset) => {
        if (this.state.currentRate) return null;
        const API_KEY = process.env.API_KEY;
        const url = 'https://rest.coinapi.io/v1/exchangerate/';
        fetch(url + asset + '/USD?apikey=' + API_KEY)
        .then(res => res.json())
        .then(data => {
            let rate = data.rate;
            this.setState({ currentRate: rate });
        }).catch(err => console.log(err));
    }

    removeConfirm = () => {
        Alert.alert(
            'Remove this currency?',
            'Please confirm to continue',
            [
                { text: 'Yes', onPress: () => this.removeCurrency() },
                { text: 'No', onPress: () => { return null } }
            ]
        )
    }

    heroku = 'https://fantasy-coin.herokuapp.com/';

    removeCurrency = () => {
        fetch(this.heroku + 'currencies/' + this.state.currency.currency_id, {
            method: 'DELETE',
        }).catch(err => console.log(err));
        Alert.alert('Currency removed')
        this.props.navigation.navigate('CollectionProfile');
    }

    updateHandler = (data, route, id, state) => {
        fetch(this.heroku + route + id, {
            body: JSON.stringify(data),
            method: 'PUT',
            headers: { 'content-type': 'application/json' }
        }).then(res => res.json())
        .then(data => this.setState({ [state]: data[state] }))
        .catch(err => console.log(err));
    }

    verifySale = () => {
        let amount = parseInt(this.state.sale);
        if (amount > this.state.currency.coin_amount) {
            Alert.alert('Insufficient funds');
            return null;
        } else {
            this.sendSale();
        }
    }

    sendSale = () => {
        let amount = Number(this.state.sale);
        let oldTotal = this.getNumericalCoinAmount();
        let newTotal = (oldTotal - amount).toFixed(5);
        let saleValue = (amount * this.state.currentRate).toFixed(5);
        let parsedSaleValue = Number(saleValue);
        let current_USD = Number(this.state.collection.current_USD);
        let newUSDTotal = (current_USD + parsedSaleValue).toFixed(5);
        let currencyData = { coin_amount: newTotal };
        let collectionData = { current_USD: newUSDTotal };
        this.updateHandler(currencyData, 'currencies/sell/', this.state.currency.currency_id, 'currency');
        this.updateHandler(collectionData, 'collections/update/', this.state.collection.cid, 'collection');
        this.toggleSellModal();
    }

    verifyInvestment = () => {
        let amount = parseInt(this.state.investment);
        if (amount > this.state.collection.current_USD) {
            Alert.alert('Insufficient funds');
            return null;
        } else {
            this.sendInvestment();
        }
    }

    sendInvestment = () => {
        let rate = (this.state.currentRate).toFixed(5);
        let amount = parseInt(this.state.investment);
        let oldTotal = parseFloat(this.state.collection.current_USD);
        let newTotal = oldTotal - amount;
        let coinAmount = (amount / this.state.currentRate).toFixed(5);
        let collectionData = { current_USD: newTotal };
        let currencyData = { buy_rate: rate, coin_amount: coinAmount }
        this.updateHandler(currencyData, 'currencies/buy/', this.state.currency.currency_id, 'currency');
        this.updateHandler(collectionData, 'collections/update/', this.state.collection.cid, 'collection');
        this.toggleBuyModal();
    }

    getNumericalCoinAmount = () => {
        let coin = parseFloat(this.state.currency.coin_amount);
        let shortCoin = coin.toFixed(5);
        return shortCoin;
    }

    renderPercentChange = () => {
        if (((this.state.currentRate - this.state.currency.buy_rate) / this.state.currency.buy_rate).toFixed(2) >= 0) {
            return {
                color: '#52E339'
            }
        } else {
            return {
                color: '#ED2D2D'
            }
        }
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
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollView}>
            
                    <View style={styles.profile}>
                        { this.state.currency &&
                        <Text style={styles.title}>{this.state.currency.name} ({this.state.currency.symbol})</Text> }
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
                    <View style={styles.transactors}>
                        <View style={styles.buyButton}>
                            <Button
                                color='white'
                                raised
                                title='buy'
                                onPress={() => this.toggleBuyModal()} />
                        </View>
                        <View style={styles.buyButton}>
                            <Button
                                color='white'
                                raised
                                title='sell'
                                onPress={() => this.toggleSellModal()} />
                        </View>
                    </View>

                    {(this.state.currency.coin_amount > 0) &&
                    <View style={styles.investment}>
                        <Text style={styles.label}>Your Assets</Text>
                        <Text style={styles.asset}>{(this.state.currency.coin_amount)} {this.state.currency.symbol}</Text>
                        <Text style={styles.label}>Current Rate </Text>
                        { this.state.currentRate &&
                        <Text style={styles.asset}>${this.state.currentRate.toFixed(5)}</Text>}
                        <Text style={styles.label}>Purchase Value</Text>
                        <Text style={styles.asset}>${(this.getNumericalCoinAmount() * this.state.currency.buy_rate).toFixed(5)}</Text>
                        <Text style={styles.label}>Current Value </Text>
                        <Text style={styles.asset}>${(this.getNumericalCoinAmount() * this.state.currentRate).toFixed(5)}</Text>
                        <Text style={styles.label}>Percent Change</Text>
                        <Text style={[styles.asset, this.renderPercentChange()]}>
                            {((this.state.currentRate - this.state.currency.buy_rate) / this.state.currency.buy_rate).toFixed(2)}%</Text>
                    </View> }
                    <View style={styles.remove}>
                        <Button
                            raised
                            title='remove currency'
                            onPress={() => this.removeConfirm()} />
                    </View>

                    <Modal
                        animationType='slide'
                        transparent={false}
                        visible={this.state.buyModal}>
                        <View style={styles.modal}>
                            <Text style={styles.modalText}>How much to invest?</Text>
                            <Text style={styles.modalText}>Available funds: ${this.state.collection.current_USD}</Text>
                            <TextInput
                                style={{height: 40, width: 100, borderColor: 'gray', borderWidth: 1}}
                                onChangeText={(text) => this.setState({ investment: text })}
                                value={this.state.investment} />
                            <Button
                                raised
                                title='confirm purchase'
                                onPress={() => this.verifyInvestment()} />
                            <Button
                                raised
                                title='cancel'
                                onPress={() => this.toggleBuyModal()} />
                        </View>
                    </Modal>

                    <Modal
                        animationType='slide'
                        transparent={false}
                        visible={this.state.sellModal}>
                        <View style={styles.modal}>
                            <Text style={styles.modalText}>How much to sell?</Text>
                            <Text style={styles.modalText}>Available assets: {this.state.currency.coin_amount} 
                                {this.state.currency.symbol}</Text>
                            <Text style={styles.modalText}>Sale value = ${(this.state.sale * this.state.currentRate).toFixed(5)}</Text>
                            <TextInput
                                style={{height: 40, width: 100, borderColor: 'gray', borderWidth: 1}}
                                onChangeText={(text) => this.setState({ sale: text })}
                                value={this.state.sale} />
                            <Button
                                raised
                                title='confirm sale'
                                onPress={() => this.verifySale()} />
                            <Button
                                raised
                                title='cancel'
                                onPress={() => this.toggleSellModal()} />
                        </View>
                    </Modal>
                
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
    
    },
    title: {
        fontSize: 26,
        alignSelf: 'center',
        color: 'white',
    },
    price: {
        fontSize: 34,
        alignSelf: 'center',
        color: '#E600FF',
    },
    profile: {
        backgroundColor: '#363D40',
        flex: 5,
        justifyContent: 'space-evenly',
        width: 330,
        marginTop: 15,
        height: 135,
        borderRadius: 8,
        alignContent: 'center',
        alignSelf: 'center',
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
    investment: {
        backgroundColor: '#363D40',
        flex: 5,
        justifyContent: 'space-evenly',
        width: 300,
        marginTop: 15,
        height: 350,
        borderRadius: 8,
        alignContent: 'center',
        alignSelf: 'center',
        shadowColor: '#000000', 
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 5,
        shadowOpacity: 1.0
    },
    remove: {
        paddingTop: 15,
        paddingBottom: 15,
    },
    modal: {
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flex: 1
    },
    modalText: {
        fontSize: 20,
        marginLeft: 15,
        marginRight: 15,
    },
    buyButton: {
        backgroundColor: '#363D40',
        justifyContent: 'space-evenly',
        width: 120,
        marginTop: 15,
        height: 60,
        borderRadius: 8,
        alignContent: 'center',
        alignSelf: 'center',
        shadowColor: '#000000', 
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 5,
        shadowOpacity: 1.0
    },
    asset: {
        color: 'white',
        fontSize: 24,
        alignSelf: 'center',
    },
    transactors: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    }
});