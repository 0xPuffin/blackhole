/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { Address, Balance, EtherInput, AddressInput } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { Alert } from "antd";
import {useContractLoader, useContractReader, useBalance} from "../hooks";
import { BigNumber } from "@ethersproject/bignumber";
import Timer from 'react-compound-timer';
import BlackholeABI from "../contracts/Blackhole.abi";
const BlackholeAddress = "0xa0eebc70f892c18c6c9cbc9bb336968f62e43427";// from "../contracts/Blackhole.address";


export default function LegacyUI({
  setPurposeEvents,
  address,
  mainnetProvider,
  userSigner,
  injectedProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  writeContracts,
  readContracts
}) {
  const [amount, setAmount] = useState();


  const blackholeInstance = useContractLoader(mainnetProvider, BlackholeAddress, BlackholeABI);
  const currentLeader = useContractReader({Blackhole: blackholeInstance},"Blackhole", "currentLeader",[]);
  const currentBet = useContractReader({Blackhole: blackholeInstance}, "Blackhole", "currentBet", []);
  const lastBet = useContractReader({Blackhole: blackholeInstance}, "Blackhole", "lastBet", []);
  const tvl = useBalance(mainnetProvider, BlackholeAddress);
 
  function minimumBet() {
    if (currentBet) {
      return BigNumber.from(currentBet).add(BigNumber.from(currentBet).div(10))
    } else {
      return BigNumber.from("100");
    }
  }

  function timeTillClaim() {
    var now = new Date();
    var canClaim = new Date(new Date(lastBet*1000).getTime()+((60*60*24*2)*1000));
    if (now.getTime() > canClaim.getTime()) {
      return 0;
    } else {
      return (canClaim.getTime() - now.getTime());
    }
  }


  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      {address == currentLeader ?
       <Alert
       message={"You're In The Lead!"}
       description={(
         <div>
           {timeTillClaim() == 0 ?
           <>You Won!<br/>
            <Button onClick={() => {
              const data = blackholeInstance.interface.encodeFunctionData("win", []);
                                
              tx(
                userSigner.sendTransaction({
                    to: BlackholeAddress,
                    data: data,
                    value: 0,
                }),
                );
            }}>
              Click To Claim The Pool
            </Button></>
          : <>You win in:
          <> {parseInt(Math.floor((timeTillClaim()/1000)/60))} minutes!</></>}
         </div>
       )}
       type="success"
       closable={true}
     />
      :
     <></>
      }
             
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h1>Blackhole</h1>
        <h5>Classic</h5>
        <h3>TVL: <b style={{fontWeight: "bolder"}}>{formatEther(tvl ? tvl : "0")} ETH</b></h3>

        <br/>
        <Divider />
        <h4>Rules:</h4>
        <p>
          - Each new bet must be at least 10% {">"} than previous bet
          <br/>  <br/>
          - Leader can claim all of the money in the blackhole if they remain in the lead for 48 hours straight
          <br/>  <br/>
          - Winner of the previous game gets 0.1% off all bets made in next game. <i>"to those that have everything more will be given"</i>
        </p>
        <Divider/>
        <h3>Last Bet: {formatEther(currentBet ? `${currentBet}` : "0")}ETH</h3>
        <br/>
        {timeTillClaim() != 0 ?
         <>{parseInt((Math.floor(timeTillClaim()/1000)/60))} minutes until game ends!</>
        :<></>}
        <br/>
        <Address value={currentLeader} ensProvider={mainnetProvider} fontSize={16}  />
        <Divider/>
        <div style={{ margin: 8 }}>
          <EtherInput
            price={price}
            placeholder={`Minimum: ${formatEther(minimumBet())}`}
            value={amount}
            onChange={value => {
              setAmount(value);
            }}
          />
          <br />
          <br/> 
          {
            userSigner ?
            <Button size="large"
            onClick={() => {
              const data = blackholeInstance.interface.encodeFunctionData("bet", []);        
              tx(
                userSigner.sendTransaction({
                    to: BlackholeAddress,
                    data: data,
                    value: parseEther(amount),
                }),
                );
            }}
          >
            Place Your Bet
          </Button>
       
            :
            <p>Connect Your Wallet First</p>
          }
         </div>
          
      </div>

     

    </div>
  );
}
