/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { Address, Balance, EtherInput, AddressInput } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { Alert } from "antd";
import {useExternalContractLoader, useContractReader} from "../hooks";
import { BigNumber } from "@ethersproject/bignumber";
import Timer from 'react-compound-timer';
import BlackholeABI from "../contracts/Blackhole.abi";
const BlackholeAddress = "0xa0eebc70f892c18c6c9cbc9bb336968f62e43427";// from "../contracts/Blackhole.address";


export default function ExampleUI({
  setPurposeEvents,
  address,
  mainnetProvider,
  userProvider,
  injectedProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  writeContracts,
  readContracts
}) {
  const [amount, setAmount] = useState();
  const [facetAddress, setFacetAddress] = useState();
  const [action, setAction] = useState();

  const signer = userProvider.getSigner();

  const blackholeInstance = useExternalContractLoader(mainnetProvider, BlackholeAddress, BlackholeABI);
  const currentLeader = useContractReader({Blackhole: blackholeInstance},"Blackhole", "currentLeader",[]);
  const currentBet = useContractReader({Blackhole: blackholeInstance}, "Blackhole", "currentBet", []);
  const lastBet = useContractReader({Blackhole: blackholeInstance}, "Blackhole", "lastBet", []);
 console.log(`leader ${currentLeader} currentBet ${currentBet} last ${lastBet}`);
 
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
    console.log(`${lastBet} lastbet ${new Date(lastBet*1000).toDateString()}, canClaim ${canClaim}`)
    if (now.getTime() > canClaim.getTime()) {
      return 0;
    } else {
      return (canClaim.getTime() - now.getTime());
    }
  }

  console.log(`timeTillclaim ${timeTillClaim()}`);

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      {address == currentLeader ?
       <Alert
       message={"Your In The Lead!"}
       description={(
         <div>
           {timeTillClaim() == 0 ?
           <>You Won!<br/>
            <Button onClick={() => {
              const data = blackholeInstance.interface.encodeFunctionData("win", []);
                                
              tx(
                signer.sendTransaction({
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
      <Alert
      message={"⚠️ Here there be dragons 🐉"}
      description={(
        <div>
          This game is risky, be careful anon
        </div>
      )}
      type="success"
      closable={true}
    />
      }
             
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h1>Blackhole</h1>
        <h4>A simple defi game of chicken</h4>
        <br/>
        <Divider />
        <h4>Rules:</h4>
        <p>
          - Each new bet must be at least 10% {">"} then previous bet
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
          <Button 
            onClick={() => {
              const data = blackholeInstance.interface.encodeFunctionData("bet", []);        
              tx(
                signer.sendTransaction({
                    to: BlackholeAddress,
                    data: data,
                    value: parseEther(amount),
                }),
                );
            }}
          >
            <span style={{fontSize:"large"}}>Ape The Lead</span>
          </Button>
        </div>
       
      </div>

     

    </div>
  );
}
