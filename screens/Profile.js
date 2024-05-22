import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ValidateEmail } from '../utils/ValidateEmail';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import AuthContext from '../AuthContext';
import _ from 'lodash';
import {
    Text,
    Image,
    View,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Pressable,
    StyleSheet,
    ScrollView,
} from 'react-native';
import CheckBox from 'react-native-check-box';
import { dropTable } from '../database';

const Profile = () => {
    const navigation = useNavigation();

    const logoutFunc = async () => {
        await AsyncStorage.clear();
        navigation.replace('Onboarding');
    }

    const { user, setUser, logout, isLoggedIn } = useContext(AuthContext);

    const [formData, setFormData] = useState(user);

    const [avatarImage, setAvatarImage] = useState(formData.avatar);
    const [newFirstName, setNewFirstName] = useState(formData.firstName);
    const [newLastName, setNewLastName] = useState(formData.lastName);
    const [newEmail, setNewEmail] = useState(formData.email);
    const [phoneNumber, setPhoneNumber] = useState(formData.phoneNumber);
    const [checkedItems, setCheckedItems] = useState(formData.notification);
    const [changesUser, setChangesUser] = useState(user);

    const [isFirstNameValid, setIsFirstNameValid] = useState(false);
    const [isLastNameValid, setIsLastNameValid] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);

    const handleReset = async () => {
        setFormData(user);
        try {
            await AsyncStorage.setItem('userData', JSON.stringify(user));
        } catch (error) {
            console.error(error);
        } finally {
            Alert.alert('Reset the user data to origin.')
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const items = [
        { id: 1, label: 'Order statuses' },
        { id: 2, label: 'Password changes' },
        { id: 3, label: 'Special offers' },
        { id: 4, label: 'Newsletter' }
    ];

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFormData({
                ...formData,
                avatar: result.assets[0].uri
            })
        }
    };

    const clearImage = () => {
        setFormData({
            ...formData,
            avatar: ''
        })
    };

    const handleFirstNameValid = (field, input) => {
        handleInputChange(field, input);
        if (input.length > 0) {
            setIsFirstNameValid(true);
        } else {
            setIsFirstNameValid(false);
        }
    };

    const handleLastNameValid = (field, input) => {
        handleInputChange(field, input);
        if (input.length > 0) {
            setIsLastNameValid(true);
        } else {
            setIsLastNameValid(false);
        }
    };

    const handleEmailChange = (field, input) => {
        handleInputChange(field, input);
        if (input != '' && ValidateEmail(input)) {
            setIsEmailValid(true);
        } else {
            setIsEmailValid(false);
        }
    };

    const handlePhoneNumberValid = (field, input) => {
        handleInputChange(field, input);
        if (input.length > 0) {
            setIsPhoneNumberValid(true);
        } else {
            setIsPhoneNumberValid(false);
        }
    };

    const handleCheckBoxChange = (item) => {
        setFormData({
            ...formData,
            notification: {
                ...formData.notification,
                [item]: !formData.notification[item]
            }
        });
    };

    const handleLogout = async () => {
        await dropTable();
        logout();
    };

    useEffect(() => {
        if (formData == null && !isLoggedIn) {
            navigation.navigate('Onboarding');
        }
        setFormData(formData);
    }, [formData, isLoggedIn]);

    const checkPermission = () => {
        (async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            } else {
                pickImage();
            }
        })();
    };

    const renderPlaceholder = () => {
        if (formData.avatar === '') {
            const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
            return (
                <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'gray', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 40, color: 'white' }}>{initials}</Text>
                </View>
            );
        } else {
            return <Image source={{ uri: formData.avatar }} style={{ width: 100, height: 100, borderRadius: 50 }} />;
        }
    };

    const savingData = async () => {
        try {
            const changesUser = {
                avatar: formData.avatar,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                notification: formData.notification
            };
            setFormData(changesUser);
            setUser(changesUser);
            await AsyncStorage.setItem('userData', JSON.stringify(changesUser));
        } catch (error) {
            console.error(error);
        } finally {
            Alert.alert('User data is successfully changed.')
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView keyboardDismissMode='on-drag' >
                <View style={{ margin: 10, borderColor: 'gray', borderWidth: 0.2, borderRadius: 15, padding: 20 }}>

                    <Text style={styles.title}>Personal Information</Text>

                    <View style={styles.rowContainer}>
                        <View style={{ flex: 1, }}>
                            {renderPlaceholder()}
                        </View>
                        <View style={{ flex: 1, }}>
                            <Pressable style={styles.imagePickerBtn} onPress={checkPermission}>
                                <Text style={styles.btnText}>Change</Text>
                            </Pressable>
                        </View>

                        <View style={{ flex: 1, }}>
                            <Pressable style={styles.removeImageBtn} onPress={clearImage}>
                                <Text style={styles.removeBtnText}>Remove</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>First Name*</Text>
                    <TextInput style={styles.input}
                        value={formData.firstName}
                        onChangeText={text => handleFirstNameValid('firstName', text)}
                        clearButtonMode='always' />

                    <Text style={styles.inputLabel}>Last Name*</Text>
                    <TextInput style={styles.input}
                        value={formData.lastName}
                        onChangeText={text => handleLastNameValid('lastName', text)}
                        clearButtonMode='always' />

                    <Text style={styles.inputLabel}>Email*</Text>
                    <TextInput style={styles.input}
                        value={formData.email}
                        onChangeText={text => handleEmailChange('email', text)}
                        keyboardType='email-address'
                        clearButtonMode='always' />

                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput style={styles.input}
                        value={formData.phoneNumber}
                        onChangeText={text => handlePhoneNumberValid('phoneNumber', text)}
                        keyboardType='phone-pad'
                        clearButtonMode='always' />

                    <Text style={styles.subTitle}>Email Notifications</Text>

                    {items.map((item) => (
                        <CheckBox
                            key={item.id}
                            style={{ flex: 1, marginVertical: 5 }}
                            onClick={() => handleCheckBoxChange(item.id)}
                            isChecked={formData.notification[item.id]}
                            rightText={item.label}
                        />
                    ))}

                    <Pressable style={styles.logoutBtn}
                        onPress={handleLogout}>
                        <Text style={styles.logoutBtnText}>Log out</Text>
                    </Pressable>

                    <View style={styles.saveDiscardContainer}>
                        <View style={{ flex: 1, }}>
                            <Pressable style={styles.discardBtn} onPress={() => {
                                if (!_.isEqual(user, formData)) {
                                    handleReset();
                                } else {
                                    Alert.alert('Nothing have to be change!')
                                }
                            }}>
                                <Text style={styles.removeBtnText}>Discard Changes</Text>
                            </Pressable>
                        </View>
                        <View style={{ flex: 1, }}>
                            <Pressable style={styles.saveBtn} onPress={() => {
                                if (formData.firstName != '' && formData.lastName != '' && formData.email != '' && ValidateEmail(formData.email)) {
                                    savingData();
                                } else {
                                    Alert.alert(`You must have to fill the FirstName, LastName, or Email field. \n Please check again!`);
                                }
                            }}>
                                <Text style={styles.btnText}>Save Changes</Text>
                            </Pressable>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
        alignSelf: 'flex-start',
        fontStyle: 'normal',
        fontWeight: '700',
        margin: 0,
    },
    subTitle: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
        alignSelf: 'flex-start',
        fontStyle: 'normal',
        fontWeight: '700',
        marginVertical: 10,
        margin: 0,
    },
    inputLabel: {
        marginTop: 5,
        fontSize: 16,
    },
    input: {
        height: 40,
        borderWidth: .3,
        padding: 10,
        fontSize: 15,
        borderColor: '#000',
        backgroundColor: 'white',
        marginVertical: 5,
        borderRadius: 10,
    },
    logoutDisable: {
        backgroundColor: 'gray',
        borderRadius: 10,
        paddingStart: 30,
        paddingEnd: 30,
        marginVertical: 100,
        alignSelf: 'flex-end',
        margin: 20,
    },
    logoutBtn: {
        backgroundColor: '#F4CE14',
        borderRadius: 10,
        padding: 10,
        borderColor: 'orange',
        marginVertical: 20,
        borderWidth: 1,
        bottom: 0,
    },
    imagePickerBtn: {
        backgroundColor: '#495E57',
        borderRadius: 10,
        padding: 10,
        borderColor: '#495E57',
        borderWidth: 1,
        marginHorizontal: 10,
    },
    removeImageBtn: {
        borderRadius: 10,
        borderWidth: 1,
        padding: 10,
        borderColor: '#495E57',
        borderWidth: 1,
        marginHorizontal: 10,
    },
    saveBtn: {
        backgroundColor: '#495E57',
        borderRadius: 10,
        padding: 10,
        borderColor: '#495E57',
        borderWidth: 1,
    },
    discardBtn: {
        borderRadius: 10,
        borderWidth: 1,
        padding: 10,
        borderColor: '#495E57',
    },
    btnText: {
        color: '#fff',
        textAlign: 'center',
    },
    logoutBtnText: {
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    removeBtnText: {
        color: '#000',
        textAlign: 'center',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 0,
        alignItems: 'center',
        marginVertical: 10,
    },
    saveDiscardContainer: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 0,
        justifyContent: 'space-between',
        gap: 10
    },
    item: {
        flex: 1,
        alignItems: 'center',
    },
});

export default Profile;