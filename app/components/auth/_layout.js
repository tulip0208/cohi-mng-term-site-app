import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Link, useRouter } from "expo-router";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const onSubmit = async () => {
    if (!email) {
      Alert.alert("", "メールアドレスを入力してください");
      return;
    }
    if (!password) {
      Alert.alert("", "パスワードを入力してください");
      return;
    }

    alert("API testing...");
  };

  const goScreen = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.title_txt}> ログイン </Text>
      </View>
      <TextInput
        value={email}
        style={styles.input}
        placeholder="メールアドレス"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize={"none"}
      />
      <TextInput
        value={email}
        style={styles.input}
        placeholder="パスワード"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize={"none"}
      />
      <View style={styles.btns}>
        <TouchableOpacity
          style={[styles.btn, styles.btn_ok]}
          onPress={onSubmit}
        >
          <Text style={styles.txt_btn_ok}>ログイン</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btn_cancel]}
          onPress={goScreen}
        >
          <Text style={styles.txt_btn_cancel}>戻 る</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: 30,
  },
  title_txt: {
    fontSize: 30,
    fontWeight: "bold",
    color:'mediumseagreen'
  },
  input: {
    height: 44,
    width: 200,
    borderRadius: 3,
    backgroundColor: "#ECECEC",
    paddingVertical: 0,
    fontSize: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  btns: {
    flexDirection: "row",
    marginTop: 50,
    bottom: 30,
    width: 200,
    alignSelf: "center",
    justifyContent: "space-around",
    alignItems: "center",
  },
  btn: {
    height: 40,
    width: 90,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  btn_ok: {
    backgroundColor: "mediumseagreen",
  },
  txt_btn_ok: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  btn_cancel: {
    borderWidth: 2,
    borderColor: "mediumseagreen",
  },
  txt_btn_cancel: {
    color: "mediumseagreen",
    fontSize: 13,
    fontWeight: "bold",
  },
});
