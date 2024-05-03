import { Text, View, Image } from 'react-native'
import 'react-native-gesture-handler';
import {
  SimpleLineIcons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome
} from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { DrawerItemList,createDrawerNavigator } from '@react-navigation/drawer'
import ChairmanHome from './ChairmanHome';
import SignIn from '../(auth)/sign-in';
import { useGlobalContext } from "../../context/GlobalProvider";
import { AuthContext } from "../../store/AuthContext";
import React, { useContext } from 'react';

const Drawer = createDrawerNavigator()
const COLORS = {
    primary: '#13678A',
    white: "#FFFFFF",
    gray: "#ECF0F4",
}

const ChairmanLayout = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const authCtx = useContext(AuthContext);
  const handleLogout = () => {
    // Clear user data and token
    setUser(null);
    setIsLogged(false);
    authCtx.logout();
    
  };
  return (
    
    <Drawer.Navigator>
      <Drawer.Screen
        name="ChairmanHome"
        options={{
          drawerLabel: "ChairmanHome",
          title: "ChairmanHome",
          headerShadowVisible: false,
          drawerIcon: () => (
            <SimpleLineIcons
              name="home"
              size={20}
              color={"#808080"} />
          ),
        }}
        component={ChairmanHome} 
      />
      <Drawer.Screen
        name="logout"
        component={SignIn} 
        listeners={{
          focus: handleLogout,
        }}
        options={{
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  )
}

export default ChairmanLayout