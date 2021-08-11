import React from "react";
import { Button } from "antd";
import Address from "./Address";
import Balance from "./Balance";
import Wallet from "./Wallet";
import { shortenAddress } from "../helpers";

export default function Account({
  address,
  userProvider,
  localProvider,
  mainnetProvider,
  price,
  minimized,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
}) {
  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
       
        <Button
          key="logoutbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          onClick={logoutOfWeb3Modal}
        >
          <b style={{color: "#C43737"}}> {shortenAddress(address)}</b>
        </Button>,
      );
    } else {
      modalButtons.push(
        <Button
          key="loginbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          /*type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time*/
          onClick={loadWeb3Modal}
        >
          connect
        </Button>,
      );
    }
  }

  const display = minimized ? (
    ""
  ) : (
    false ? 
    <span>
       {address ? <Address value={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} /> : "Connecting..."}
      <Wallet address={address} provider={userProvider} ensProvider={mainnetProvider} price={price} />
     </span> : ""
  );

  return (
    <div>
      {display}
      {modalButtons}
    </div>
  );
}
