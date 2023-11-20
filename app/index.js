import { StyleSheet, Text, View } from "react-native";
import ImageViewer from "./components/common/ImageViewer";
import { Link } from "expo-router";

const PlaceholderImage = require("../assets/images/background-image.png");

export default function Page() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer placeholderImageSource={PlaceholderImage} />
      </View>
      <View style={styles.main}>
        <View style={styles.title}>
          <Text style={styles.title_text}>Hello World</Text>
        </View>
        <View style={styles.link_btns}>
          <Link href="/components/auth/" style={styles.link_btn}>Login</Link>
          <Link href="/components/dashboard" style={styles.link_btn}>Dashboard</Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 18,
   // backgroundColor: "yellow",
  },
  imageContainer: {
    height: "auto",
    paddingTop: 40,
    // backgroundColor: "blue",
  },
  main: {
    flex:1,
    alignItems: "center",
    maxWidth: 960,
    marginTop:50,
    marginHorizontal: "auto",
  },
  title: {
    backgroundColor: 'transparent',
  },
  title_text:{
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",

  },
  link_btns: {
    fontSize: 36,
    marginTop:20,
    flexDirection:'row',
    gap:20
  },
  link_btn:{
    borderWidth:2,
    borderColor:'green',
    borderRadius:10,
    padding:10,
    width:100,
    textAlign:'center',
    fontWeight:'700',
    backgroundColor:'mediumseagreen',
    color:'white'
  }
});
