import React from 'react';
import { StyleSheet, Text, View, Button, Alert, PickerIOS, Modal } from 'react-native';
import { List, ListItem } from 'react-native-elements';


export default class CollectionProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            collectionInfo: '',
            cid: '',
            currencies: '',
            initial_investment: 'Collection Investment',
            showModal: false,
        }
    }

    componentWillMount = () => {
        this.getProps();
    }

    toggleModal = () => {
        this.setState({ showModal: !this.state.showModal });
    }

    componentDidMount = () => { 
        this.fetchCurrencyInfo();
        this.fetchCollectionInfo();
    }

    getProps = () => {
        const { navigation } = this.props;
        const cid = navigation.getParam('cid', 'NO-CID');
        this.setState({ cid: cid });
    }

    heroku = 'https://fantasy-coin.herokuapp.com/';

    fetchCurrencyInfo = () => {
        fetch(this.heroku + 'currencies/' + this.state.cid)
        .then(response => response.json())
        .then(data => {
            let fetched = [];
            data.collection.map(curr => {
                return fetched.push(curr);
            });
            this.setState({ currencies: fetched });
        }).catch(err => console.log(err));
    }

    fetchCollectionInfo = () => {
        fetch(this.heroku + 'collections/cid/' + this.state.cid)
        .then(res => res.json())
        .then(data => {
            this.setState({ collectionInfo: data.collection });
            if (data.collection.initial_investment === 0) {
                this.toggleModal();
            } else return null;
        }).catch(err => console.log(err));
    }

    setInvestment = () => {
        let investment = this.state.initial_investment;
        let data = { investment: investment, current_USD: investment };
        fetch(this.heroku + 'collections/invest/' + this.state.cid, {
            body: JSON.stringify(data),
            method: 'PUT',
            headers: { 'content-type': 'application/json' }
        }).then(res => res.json())
        .then(data => {
            this.setState({ collectionInfo: data.collection });
            this.toggleModal();
        }).catch(err => console.log(err));
    }

    verifyDelete = () => {
        Alert.alert(
            'Are you sure?',
            'Deletion is permanent, you know.',
            [
                { text: 'Yes', onPress: () => this.deleteCollection() },
                { text: 'No', onPress: () => { return null } }
            ]
        )
    }

    deleteCollection = () => {
        fetch(this.heroku + 'collections/' + this.state.cid, {
            method: 'DELETE',
        }).catch(err => console.log(err));
        Alert.alert('This collection has been deleted.');
        this.props.navigation.navigate('Collections');
    }

    displayCurrentUSD = () => {
        let value = Number(this.state.collectionInfo.current_USD);
        let USD = value.toFixed(2);
        return USD;
    }

    investments = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

    render() {
        currencies = '';
        if (this.state.currencies) {
            this.currencies = this.state.currencies.map((curr, i) => {
                return (
                    <ListItem
                        style={styles.listItem} 
                        onPress={() => this.props.navigation.navigate('CurrencyInfo', 
                            { currency: curr, collection: this.state.collectionInfo })} 
                        title={curr.name}
                        subtitle={curr.symbol}
                        key={`curr-li-${i}`} />
                    );
                })
            }

        return (
            <View style={styles.container}>
                <Modal
                    animationType='slide'
                    transparent={false} 
                    visible={this.state.showModal}
                    onRequestClose={() => this.toggleModal()} >
                        <View style={styles.modal}>
                            <Text style={styles.message}>Choose an initial investment amount for this collection.</Text>
                            <PickerIOS
                                selectedValue={this.state.initial_investment}
                                onValueChange={(value) => this.setState({ initial_investment: value })} >
                                {this.investments.map((number, i) => {
                                    let amount = (number * 1000);
                                    return (
                                        <PickerIOS.Item  key={`item-${i}`} 
                                                        value={amount} 
                                                        label={`$${amount}`} />
                                        );
                                    })
                                }
                            </PickerIOS>
                            <View style={styles.modalButton}>
                                <Button
                                    raised
                                    onPress={() => this.setInvestment()}
                                    title='Confirm amount' />
                            </View>
                        </View>
                </Modal>
                <View style={styles.button}>
                    <Button
                        raised 
                        onPress={() => this.props.navigation.navigate('CurrencyList', { collectionInfo: this.state.collectionInfo })}
                        title='Add a new currency' />
                </View>
    
                <List style={styles.list}>
                    {this.currencies}
                </List> 
                {  this.state.collectionInfo &&                
                <View style={styles.profile}>
                    <Text style={styles.label}>Current USD</Text>
                    <Text style={styles.asset}>${this.displayCurrentUSD()}</Text>
                    <Text style={styles.label}>Initial Investment</Text>
                    <Text style={styles.asset}>${this.state.collectionInfo.initial_investment}</Text>
                </View> }

                <View style={styles.delete}>
                    <Button
                        raised
                        onPress={() => this.verifyDelete()}
                        title='Delete this collection' />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        justifyContent: 'center'
    },
    button: {
        justifyContent: 'flex-start',
        marginTop: 25
        
    },
    delete: {
        justifyContent: 'flex-end',
        flex: 6,
        marginBottom: 20   
    },
    modal: {
        flex: 1,
        paddingTop: 150
    },
    message: {
        fontSize: 20,
        marginLeft: 20,
        marginRight: 20,
        alignSelf: 'center'
    },
    modalButton: {
        flex: 1,
        justifyContent: 'center',
    },
    profile: {
        backgroundColor: '#363D40',
        justifyContent: 'space-evenly',
        width: 200,
        marginTop: 15,
        height: 130,
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
    label: {
        fontSize: 16,
        color: 'white',
        alignSelf: 'center',
    },
    asset: {
        color: 'white',
        fontSize: 24,
        alignSelf: 'center',
    },

});