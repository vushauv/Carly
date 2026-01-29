import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";


export default function HomeTab() {
  const router = useRouter();

  const onLogoutPress = () => {
    // later: clear auth state / token here
    router.replace("/");
  };

  return (
    <View>
      <Text>This is HomeTab</Text>

      <Pressable onPress={onLogoutPress}>
        <Text>Log out</Text>
      </Pressable>
    </View>
  );
}
