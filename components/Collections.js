import React from 'react';
import { StyleSheet, Text, Button, AsyncStorage, Modal, TextInput, View, Alert } from 'react-native';
import { List, ListItem } from 'react-native-elements';

export default class Collections extends React.Component {
    static navigationOptions = { title: 'Your Collections', headerLeft: null };
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            userCollections: '',
            showModal: false,
            title: '',
        }
    }

    componentDidMount = () => {
        this.checkForId();
    }

    toggleModal = () => {
        this.setState({ showModal: !this.state.showModal });
    }

    loadUserCollections = (uid) => {
        fetch(this.heroku + 'collections/' + uid)
        .then(res => res.json())
        .then(data => {
            if (data.collections.length === 0) return null;
            let userCollections = [];
            data.collections.map(collection => {
                return userCollections.push(collection);
            });
            this.setState({ userCollections: userCollections });
        }).catch(err => console.log(err));
    }

    async checkForId () {
        try {
            const savedID = await AsyncStorage.getItem('@Fantasy:uid');
            if (savedID !== null) {
                parsedId = parseInt(savedID);
                this.loadUserCollections(parsedId);
                this.setState({ userId: parsedId });
            } else if (savedID == null) {
                this.createNewUser();
            }
        } catch (error) {
            console.log('Error retrieving UID' + error);
        } 
    }

    async saveUserId (uid) {
        try {
            await AsyncStorage.setItem('@Fantasy:uid', `${uid}`);
        } catch (error) {
            console.log('Error saving UID' + error);
        }
    }

    heroku = 'https://fantasy-coin.herokuapp.com/';

    createCollection = () => {
        const userData = { user_id: this.state.userId, title: this.state.title };
        fetch(this.heroku + 'collections/', {
            body: JSON.stringify(userData),
            method: 'POST',
            headers: { 'content-type':'application/json' }
        }).then(response => response.json())
        .then(data => {
            let newCollections = [...this.state.userCollections];
            newCollections.push(data.collection);
            this.setState({ userCollections: newCollections });
            this.toggleModal();
        }).catch(err => console.log(err));
    }

    createNewUser = () => {
        const { navigation } = this.props;
        const userName = navigation.getParam('userName', 'NO-USERNAME');
        let data = { name: userName };
        fetch(this.heroku + 'users/', {
            body: JSON.stringify(data),
            method: 'POST',
            headers: { 'content-type':'application/json' }
        }).then(response => response.json())
        .then(data => {
            let id = data.user.id;
            this.setState({ userId: id });
            this.saveUserId(id);
        }).catch(err => console.log(err));
    }

    verifyTitle = () => {
        if (this.state.title === '') {
            Alert.alert('Please enter a title');
        } else {
            this.createCollection();
        }
    }

    render() {
        collections = '';
        if (this.state.userCollections) {
            this.collections = this.state.userCollections.map((collection, i) => {
                return (
                    <ListItem 
                    key={`highlight-${i}`}
                    style={styles.collection}
                    onPress={() => this.props.navigation.navigate('CollectionProfile', { cid: this.state.userCollections[i].cid })}
                    title={collection.title}
                    subtitle={`Created ${collection.collection_created.slice(0, 10)}`} /> 
                );
            });
        }

        return (
            <View style={styles.view}>
                <List style={styles.container}>
                    {this.collections} 
                    <Button 
                        style={styles.button}
                        raised
                        onPress={() => this.toggleModal()}
                        title='Add a collection' />
                </List>
                <Modal
                    animationType='slide'
                    transparent={false}
                    visible={this.state.showModal}>
                    <View style={styles.modal}>
                        <Text style={styles.modalText}>Title your new collection</Text>
                        <TextInput
                            style={{ height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
                            onChangeText={(text) => this.setState({ title: text })}
                            vale={this.state.title} />
                        <Button
                            raised
                            title='confirm title'
                            onPress={() => this.verifyTitle()} />
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    view: {
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: '#bbb',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    collection: {
        flex: 2,
        alignItems: 'center',
    },
    button: {
        flex: 4
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
    }
});