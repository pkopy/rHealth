/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    DeviceInfo,
    View,
    Alert,
    Text,
    Settings,
    StatusBar,
    TextInput,
    TouchableOpacity
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import {
    Header,
    LearnMoreLinks,
    Colors,
    DebugInstructions,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import BleManagerX from 'react-native-ble-manager'
// import React from 'react';
import { Platform,Button } from 'react-native';
import NativeDeviceInfo from "react-native/Libraries/Utilities/NativeDeviceInfo";
const device1 = require('react-native-device-info')
const HelloWorldApp = () => {
    const [text, setText] = React.useState(Platform.OS)
    const [mac, setMac] = React.useState('')
    // const manager = new BleManager()
    BleManagerX.enableBluetooth()
        .then(() => {
            // Success code
            console.log('The bluetooth is already enabled or the user confirm');
            // this.setState({ isBluetooth: true })
            // BleManagerX.scan().then(() => {
            //   // Success code
            //   console.log("Scan started");
            // });
        })
        .catch((error) => {
            //Failure code
            console.log(error)
            Alert.alert('', 'Please turn on your bluetooth',
                [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    {
                        text: 'Settings', onPress: () => {

                        }
                    },
                ])
            return;
        });

    const start = () => {BleManagerX.start({forceLegacy:true}).then((e) => {
        // Success code
        console.log("Module initialized");
        console.log(e)
    })}

    const scan = () => {
        BleManagerX.scan([], 20, true).then((e) => {
            // Success code
            console.log(e)
            console.log("Scan started");
        }).catch((e) => console.log(e))
    }
    // React.useEffect(() => {
    //   const subscription = manager.onStateChange((state) => {
    //     if (state === 'PoweredOn') {
    //       scanAndConnect();
    //       subscription.remove();
    //     }
    //   },true)
    //
    // }, [])
    // const device = new Device(NativeDeviceInfo, BleManager)
    // const scanAndConnect = () =>{
    //   manager.startDeviceScan(null, null, (error, device) => {
    //     if (error) {
    //       // Handle error (scanning will be stopped automatically)
    //       // device1.getMacAddress().then((e) => console.log(e))
    //       //
    //       // console.log(error)
    //       return
    //     }
    //     console.log(device.name)
    //     // Check if it is a device you are looking for based on advertisement data
    //     // or other criteria.
    //     if (device.name === 'TI BLE Sensor Tag' ||
    //         device.name === 'SensorTag') {
    //
    //       // Stop scanning as it's not necessary if you are scanning for one device.
    //       manager.stopDeviceScan();
    //
    //       // Proceed with connection.
    //     }
    //   });
    // }
    // React.useEffect(() => {
    //   scanAndConnect()
    // })

    return (
        <>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Button title='Press' onPress = {start} >

                </Button>
                <Button title='Scan' onPress = {scan} >

                </Button>
                <Text>{text}</Text>
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1
                    }}
                    onChange = {(e) => {
                        console.log('e')
                        setText(e.nativeEvent.text)

                    }}
                    defaultValue="You can type in me"
                />
                <TouchableOpacity
                    accessible={true}
                    accessibilityLabel="Tap me!"
                >
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Press me!</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View accessible={true}>
                <Text>text one</Text>
                <Text>text two</Text>
            </View>
        </>
    );
}

export default HelloWorldApp;

// const App: () => React$Node = () => {
//   return (
//     <>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView>
//         <ScrollView
//           contentInsetAdjustmentBehavior="automatic"
//           style={styles.scrollView}>
//           <Header />
//           {global.HermesInternal == null ? null : (
//             <View style={styles.engine}>
//               <Text style={styles.footer}>Engine: Hermes</Text>
//             </View>
//           )}
//           <View style={styles.body}>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Step One</Text>
//               <Text style={styles.sectionDescription}>
//                 Edit <Text style={styles.highlight}>App.js</Text> to change this
//                 screen and then come back to see your edits.
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>See Your Changes</Text>
//               <Text style={styles.sectionDescription}>
//                 <ReloadInstructions />
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Debug</Text>
//               <Text style={styles.sectionDescription}>
//                 <DebugInstructions />
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Learn More</Text>
//               <Text style={styles.sectionDescription}>
//                 Read the docs to discover what to do next:
//               </Text>
//             </View>
//             <LearnMoreLinks />
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </>
//   );
// };

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: Colors.lighter,
    },
    engine: {
        position: 'absolute',
        right: 0,
    },
    body: {
        backgroundColor: Colors.white,
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.black,
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: Colors.dark,
    },
    highlight: {
        fontWeight: '700',
    },
    footer: {
        color: Colors.dark,
        fontSize: 12,
        fontWeight: '600',
        padding: 4,
        paddingRight: 12,
        textAlign: 'right',
    },
});

// export default App;