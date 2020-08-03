import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    NativeEventEmitter,
    NativeModules,
    Platform,
    PermissionsAndroid,
    ScrollView,
    AppState,
    FlatList,
    Dimensions,
    Button,
    SafeAreaView
} from 'react-native';
import BleManager from 'react-native-ble-manager';

const window = Dimensions.get('window');

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const App = () => {
    const [appState, setAppState] = React.useState('');
    const [scanning, setScanning] = React.useState(false);
    const [peripherals, setPeripherals] = React.useState(new Map());
    const handleAppStateChange = (nextAppState) => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
            BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
                console.log('Connected peripherals: ' + peripheralsArray.length);
            });
        }
        setAppState(nextAppState)

    };
    function getBluetoothScanPermission() {
        const granted =  PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            {
                title: 'Bluetooth Permission',
                message:
                    'In the next dialogue, Android will ask for permission for this ' +
                    'App to access your location. This is needed for being able to ' +
                    'use Bluetooth to scan your environment for peripherals.',
                buttonPositive: 'OK'
            },
        ).then(e=>{
            console.log(e)

        }).catch((e) => {
            console.log(e)
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.log('BleManager.scan will *NOT* detect any peripherals!')
            }
        })

    }
    React.useEffect(  ()=> {


            getBluetoothScanPermission()

        return function () {
            console.log('tadam')
        }


    },[] )
    React.useEffect( () => {
        BleManager.start({showAlert: false,forceLegacy: true}).then(e => console.log(e));
        AppState.addEventListener('change', handleAppStateChange);

        const handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        const handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                if (result) {
                    console.log("Permission is OK");
                } else {
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                        if (result) {
                            console.log("User accept");
                        } else {
                            console.log("User refuse");
                        }
                    });
                }
            });
        }
        return function cleanup() {
            handlerDiscover.remove();
            handlerStop.remove()
        }

    }, []);

    const retrieveConnected = () => {
        BleManager.getConnectedPeripherals([]).then((results) => {
            if (results.length === 0) {
                console.log('No connected peripherals')
            }
            console.log(results);
            var peripheralsLocal = peripherals;
            for (var i = 0; i < results.length; i++) {
                var peripheral = results[i];
                peripheral.connected = true;
                peripherals.set(peripheral.id, peripheral);
                setPeripherals(peripheralsLocal)
            }
        })
            .catch((e) => console.log(e))
    }

    const scanStart = () => {
        if (!scanning) {
            //this.setState({peripherals: new Map()});
            BleManager.scan([], 30).then((results) => {
                console.log('Scanning...');
                setScanning(true)
            });
        }
    };
    const handleStopScan = () => {
        console.log('Scan is stopped');
        setScanning(false)
    };
    const handleDiscoverPeripheral = (peripheral) => {
        let peripheralsLocal = peripherals;
        console.log('Got ble peripheral', peripheral);
        if (!peripheral.name) {
            peripheral.name = 'NO NAME';
        }
        if (peripheral && peripheral.id) {
            console.log('xxx', peripheral)
            peripheralsLocal.set(peripheral.id, peripheral);
            setPeripherals(peripheralsLocal)

        }
    };
    const list = Array.from(peripherals.values());
    const printPer = () => {
        // peripherals.set({oko:12})
        // console.log(peripherals);
        // console.log(window)
        BleManager.getDiscoveredPeripherals().then((peripherals) => {
            console.log(peripherals)
        });
        retrieveConnected()
        console.log('lista',list)
    };

     const  renderItem = (item) =>{
    const color = item.connected ? 'green' : '#fff';
    return (
        <TouchableHighlight  >
          <View style={[styles.row, {backgroundColor: color}]}>
            <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
            <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {item.rssi}</Text>
            <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20}}>{item.id}</Text>
          </View>
        </TouchableHighlight>
    );
  }

    return (
        <>
            <View style={{margin: 10, padding: 10}}>

                <Button title={'Scan'} onPress={scanStart}/>
            </View>
            <View style={{margin: 10, padding: 10}}>
                <Button title={`Scan ${scanning ? 'on' : 'off'}`} onPress={printPer}/>
            </View>
            <View>
                <Text style={{textAlign:'center', fontSize:30}}>
                    0.000
                </Text>
            </View>
            <ScrollView style={styles.scroll}>
                               {(peripherals.length === 0) &&
                          <View style={{flex: 1, margin: 20}}>
                              <Text style={{textAlign: 'center'}}>No peripherals</Text>
                          </View>
                               }
                <FlatList
                    data={list}
                    renderItem={({item}) => renderItem(item)}
                    keyExtractor={item => item.id}
                />

            </ScrollView>

            {/*<View>*/}

            {/*    <FlatList*/}
            {/*                      data={peripherals}*/}
            {/*                      renderItem={({item}) => renderItem(item)}*/}
            {/*                      keyExtractor={item => item.id}*/}
            {/*    />*/}
            {/*</View>*/}
        </>
    )
}
export default App
// export default class App extends Component {
//   constructor(){
//     super()
//
//     this.state = {
//       scanning:false,
//       peripherals: new Map(),
//       appState: ''
//     }
//
//     this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
//     this.handleStopScan = this.handleStopScan.bind(this);
//     this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
//     this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
//     this.handleAppStateChange = this.handleAppStateChange.bind(this);
//   }
//
//   componentDidMount() {
//     AppState.addEventListener('change', this.handleAppStateChange);
//
//     BleManager.start({showAlert: false});
//
//     this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
//     this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
//     this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
//     this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );
//
//
//
//     if (Platform.OS === 'android' && Platform.Version >= 23) {
//       PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
//         if (result) {
//           console.log("Permission is OK");
//         } else {
//           PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
//             if (result) {
//               console.log("User accept");
//             } else {
//               console.log("User refuse");
//             }
//           });
//         }
//       });
//     }
//
//   }
//
//   handleAppStateChange(nextAppState) {
//     if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
//       console.log('App has come to the foreground!')
//       BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
//         console.log('Connected peripherals: ' + peripheralsArray.length);
//       });
//     }
//     this.setState({appState: nextAppState});
//   }
//
//   componentWillUnmount() {
//     this.handlerDiscover.remove();
//     this.handlerStop.remove();
//     this.handlerDisconnect.remove();
//     this.handlerUpdate.remove();
//   }
//
//   handleDisconnectedPeripheral(data) {
//     let peripherals = this.state.peripherals;
//     let peripheral = peripherals.get(data.peripheral);
//     if (peripheral) {
//       peripheral.connected = false;
//       peripherals.set(peripheral.id, peripheral);
//       this.setState({peripherals});
//     }
//     console.log('Disconnected from ' + data.peripheral);
//   }
//
//   handleUpdateValueForCharacteristic(data) {
//     console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
//   }
//
//   handleStopScan() {
//     console.log('Scan is stopped');
//     this.setState({ scanning: false });
//   }
//
//   startScan() {
//     if (!this.state.scanning) {
//       //this.setState({peripherals: new Map()});
//       BleManager.scan([], 30, true).then((results) => {
//         console.log('Scanning...');
//         this.setState({scanning:true});
//       });
//     }
//   }
//
//   retrieveConnected(){
//     BleManager.getConnectedPeripherals([]).then((results) => {
//       if (results.length == 0) {
//         console.log('No connected peripherals')
//       }
//       console.log(results);
//       var peripherals = this.state.peripherals;
//       for (var i = 0; i < results.length; i++) {
//         var peripheral = results[i];
//         peripheral.connected = true;
//         peripherals.set(peripheral.id, peripheral);
//         this.setState({ peripherals });
//       }
//     });
//   }
//
//   handleDiscoverPeripheral(peripheral){
//     var peripherals = this.state.peripherals;
//     console.log('Got ble peripheral', peripheral);
//     if (!peripheral.name) {
//       peripheral.name = 'NO NAME';
//     }
//     peripherals.set(peripheral.id, peripheral);
//     this.setState({ peripherals });
//   }
//
//   test(peripheral) {
//     if (peripheral){
//       if (peripheral.connected){
//         BleManager.disconnect(peripheral.id);
//       }else{
//         BleManager.connect(peripheral.id).then(() => {
//           let peripherals = this.state.peripherals;
//           let p = peripherals.get(peripheral.id);
//           if (p) {
//             p.connected = true;
//             peripherals.set(peripheral.id, p);
//             this.setState({peripherals});
//           }
//           console.log('Connected to ' + peripheral.id);
//
//
//           setTimeout(() => {
//
//             /* Test read current RSSI value
//             BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
//               console.log('Retrieved peripheral services', peripheralData);
//               BleManager.readRSSI(peripheral.id).then((rssi) => {
//                 console.log('Retrieved actual RSSI value', rssi);
//               });
//             });*/
//
//             // Test using bleno's pizza example
//             // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
//             BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
//               console.log(peripheralInfo);
//               var service = '13333333-3333-3333-3333-333333333337';
//               var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
//               var crustCharacteristic = '13333333-3333-3333-3333-333333330001';
//
//               setTimeout(() => {
//                 BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
//                   console.log('Started notification on ' + peripheral.id);
//                   setTimeout(() => {
//                     BleManager.write(peripheral.id, service, crustCharacteristic, [0]).then(() => {
//                       console.log('Writed NORMAL crust');
//                       BleManager.write(peripheral.id, service, bakeCharacteristic, [1,95]).then(() => {
//                         console.log('Writed 351 temperature, the pizza should be BAKED');
//                         /*
//                         var PizzaBakeResult = {
//                           HALF_BAKED: 0,
//                           BAKED:      1,
//                           CRISPY:     2,
//                           BURNT:      3,
//                           ON_FIRE:    4
//                         };*/
//                       });
//                     });
//
//                   }, 500);
//                 }).catch((error) => {
//                   console.log('Notification error', error);
//                 });
//               }, 200);
//             });
//
//           }, 900);
//         }).catch((error) => {
//           console.log('Connection error', error);
//         });
//       }
//     }
//   }
//
//   renderItem(item) {
//     const color = item.connected ? 'green' : '#fff';
//     return (
//         <TouchableHighlight onPress={() => this.test(item) }>
//           <View style={[styles.row, {backgroundColor: color}]}>
//             <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
//             <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {item.rssi}</Text>
//             <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20}}>{item.id}</Text>
//           </View>
//         </TouchableHighlight>
//     );
//   }
//
//
//   render() {
//     const list = Array.from(this.state.peripherals.values());
//     const btnScanTitle = 'Scan Bluetooth (' + (this.state.scanning ? 'on' : 'off') + ')';
//
//     return (
//         <SafeAreaView style={styles.container}>
//           <View style={styles.container}>
//             <View style={{margin: 10}}>
//               <Button title={btnScanTitle} onPress={() => this.startScan() } />
//             </View>
//
//             <View style={{margin: 10}}>
//               <Button title="Retrieve connected peripherals" onPress={() => this.retrieveConnected() } />
//             </View>
//
//             <ScrollView style={styles.scroll}>
//               {(list.length == 0) &&
//               <View style={{flex:1, margin: 20}}>
//                 <Text style={{textAlign: 'center'}}>No peripherals</Text>
//               </View>
//               }
//               <FlatList
//                   data={list}
//                   renderItem={({ item }) => this.renderItem(item) }
//                   keyExtractor={item => item.id}
//               />
//
//             </ScrollView>
//           </View>
//         </SafeAreaView>
//     );
//   }
// }
//
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        width: window.width,
        height: window.height
    },
    scroll: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        margin: 10,
    },
    row: {
        margin: 10
    },
});


