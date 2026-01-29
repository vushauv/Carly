import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="SearchTab"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (<Ionicons name="search" size={size} color={color} />),
          }} 
      />
      <Tabs.Screen name="HomeTab"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (<Ionicons name="home" size={size} color={color} />),
          }} 
      />
      <Tabs.Screen name="LikedCarsTab" 
        options={{
          title: "Liked",
          tabBarIcon: ({ color, size }) => (<Ionicons name="heart" size={size} color={color} />),
          }} 
      />
    </Tabs>
  );
}
