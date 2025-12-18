import "./App.css";
import LoginPage from "./components/LoginPage/LoginPage";
import KPIPage from "./components/KPIPage/KPIPage";
import Content from "./components/Content/Content";
import Header from "./components/Header/Header";
import { useState } from "react";
import Footer from "./components/Footer/Footer";

function App() {
  // Ofc this would be in the global state
  const [loggedIn, setLoggedIn] = useState<boolean>(true); //for testing purposes set to true (should be false ofc)

  return (
    <>
      <Header loggedIn={loggedIn}></Header>
      <Content>
        {/*Insides of Content section can be replaced by different components depending on the route*/}
        <KPIPage></KPIPage>
      </Content>
      <Footer></Footer>
    </>
  );
}

export default App;
