import "./App.css";
import LoginPage from "./components/LoginPage/LoginPage";
import Content from "./components/Content/Content";
import Header from "./components/Header/Header";
import { useState } from "react";
import Footer from "./components/Footer/Footer";

function App() {
  // Ofc this would be in the global state
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  return (
    <>
      <Header loggedIn={loggedIn}></Header>
      <Content>
        {/*Insides of Content section can be replaced by different components depending on the route*/}
        <LoginPage></LoginPage>
      </Content>
      <Footer></Footer>
    </>
  );
}

export default App;
