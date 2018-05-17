import React from 'react';
import {  StyleSheet, FlatList } from 'react-native';
import { List, ListItem, SearchBar, keyExtractor } from 'react-native-elements';

export default class CurrencyList extends React.Component {
    static navigationOptions = { title: 'Currency List' };
    constructor(props) {
        super(props);
        this.state = {
            assets: null,
            showList: false,
            collectionInfo: '',
        }
    }

    componentDidMount = () => {
        this.getAssets();
        this.getProps();
    }

    getProps = () => {
        const { navigation } = this.props;
        const collectionInfo = navigation.getParam('collectionInfo', 'NO-COLLECTION');
        this.setState({ collectionInfo: collectionInfo });
    }

    API_KEY = process.env.API_KEY;

    getAssets = () => {
        let url = 'https://rest.coinapi.io/v1/assets/?apikey=';
        fetch(url + this.API_KEY)
        .then(res => res.json())
        .then(data => {
            let sorted = [];
            data.map(asset => {
                if (asset.type_is_crypto === 1) {
                    return sorted.push(asset);
                }
            });
            this.setState({ assets: sorted, showList: true });
        }).catch(err => console.log(err));
    }

    renderHeader = () => {
        return <SearchBar placeholder='Search currencies...' lightTheme />
    }

    render() {
        return (
            <List style={styles.container}>
                { this.state.showList &&
                <FlatList
                  ListHeaderComponent={this.renderHeader}
                  data={this.state.assets}
                  renderItem={({ item }) => 
                    <ListItem 
                      onPress={() => this.props.navigation.navigate('SingleAsset', { asset: item, cid: this.state.collectionInfo.cid })}
                      title={item.name}
                      subtitle={item.asset_id} /> }
                  keyExtractor={item => item.asset_id}
                /> }
            </List>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    list: {
        padding: 10,
        fontSize: 18,
        height: 44
    }
});