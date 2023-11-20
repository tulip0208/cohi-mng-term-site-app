import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import he from 'he';


export default function DashBoard() {

  const [title, setTitle] = useState('');
  const [usd, setUsd]=useState(null);
  const [gbp, setGbp] = useState(null);

  const router = useRouter();

  useEffect(()=>{

    const getData = async()=>{

      await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json')
              .then(res=>{
                const bpi_data = res.data.bpi;
                setTitle(res.data.chartName);
                setUsd(bpi_data.USD);
                setGbp(bpi_data.GBP);
                // console.log('res ',bpi_data.USD);
              })
              .catch(error=>{
                console.log('err ',error);
              });
    };

    getData();
  },[])

  const goScreen = () => {
    router.replace("/");
  };

  const formatSymbol=(symbol_str)=>{
    const symbol = he.decode(symbol_str);
    // console.log(symbol); // Output: $
    return symbol;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.title_txt}>DashBoard: {title}</Text>
      </View>
      <View style={styles.body}>
         {usd?
         <>
         <Text style={styles.content}> {usd.code} : {formatSymbol(usd.symbol)} </Text>
         <Text style={styles.content}> {usd.description} </Text>
         <Text style={styles.content}> {usd.rate_float} </Text>
         </>:<></>}
      </View>
      <View style={styles.btns}>        
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
  body:{

  },
  content:{
    fontSize: 20,
    fontWeight: "bold",
    color:'black'
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
