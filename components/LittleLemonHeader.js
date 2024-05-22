import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LogoTitle = () => {
  return (
    <Image style={headerStyles.logo} source={require('../assets/littleLemonLogo.png')} />
  );
}

export default function LittleLemonHeader() {
  return (
    <View style={headerStyles.container}>
      <LogoTitle />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  subText: {
    paddingTop: 50,
    paddingBottom: 10,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
  },
  logo: {
    height: 30,
    padding: 30,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});
