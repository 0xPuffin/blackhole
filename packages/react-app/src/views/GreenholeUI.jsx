/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { Address, Balance, EtherInput, AddressInput } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { Alert } from "antd";
import { useExternalContractLoader, useContractReader, useBalance } from "../hooks";
import { BigNumber } from "@ethersproject/bignumber";
import Timer from 'react-compound-timer';
import GreenholeABI from "../contracts/Greenhole.abi";
const GreenholeAddress = "0x45a4250c80d08f9ae31afceb3c168e394c8d095d";// from "../contracts/Blackhole.address";


export default function GreenholeUI({
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
 

  const instance = useExternalContractLoader(mainnetProvider, GreenholeAddress, GreenholeABI);
  const currentLeader = useContractReader({ Greenhole: instance }, "Greenhole", "currentLeader", []);
  const currentBet = useContractReader({ Greenhole: instance }, "Greenhole", "currentBet", []);
  const lastBet = useContractReader({ Greenhole: instance }, "Greenhole", "lastBet", []);
  const tvl = useBalance(mainnetProvider, GreenholeAddress);

  function minimumBet() {
    if (currentBet) {
      return BigNumber.from(currentBet).add(BigNumber.from(currentBet).div(10))
    } else {
      return BigNumber.from("100");
    }
  }

  function timeTillClaim() {
    var now = new Date();
    var canClaim = new Date(new Date(lastBet * 1000).getTime() + ((60 * 60) * 1000));
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
                <>You Won!<br />
                  <Button onClick={() => {
                    const data = instance.interface.encodeFunctionData("win", []);

                    tx(
                      userProvider.sendTransaction({
                        to: GreenholeAddress,
                        data: data,
                        value: 0,
                      }),
                    );
                  }}>
                    Click To Claim The Pool
                  </Button></>
                : <>You win in:
                  <> {parseInt(Math.floor((timeTillClaim() / 1000) / 60))} minutes!</></>}
            </div>
          )}
          type="success"
          closable={true}
        />
        :
        <></>
      }

      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h1 style={{ color: "green", fontWeight: "900" }}>Greenhole</h1>
        <h5><i>Everyone's a winner</i></h5>
        <h3>TVL: <b style={{ fontWeight: "bolder" }}>{formatEther(tvl ? tvl : "0")} ETH</b></h3>

        <br />
        <Divider />
        <h4>Rules:</h4>
        <p>
          - Each new bet must be greater than previous bet
          <br />  <br />
          - Leader wins and gets 64.9% of $ in the pot if they remain in the lead for 1 hour
          <br />  <br />
          - 35% of total pot is divided evenly among everyone that doesn't win
          <br /> <br />
          - Winner of the previous game gets 0.1% off all bets made in next game. <i>"to those that have everything more will be given"</i>
        </p>
        <Divider />
        <h3>Last Bet: {formatEther(currentBet ? `${currentBet}` : "0")}ETH</h3>
        <br />
        {timeTillClaim() != 0 ?
          <>{parseInt((Math.floor(timeTillClaim() / 1000) / 60))} minutes until game ends!</>
          : <></>}
        <br />
        <Address value={currentLeader} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
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
          <br />
          {
            userProvider ?
            <Button size="large"
            onClick={() => {
              const data = instance.interface.encodeFunctionData("bet", []);        
              tx(
                userProvider.sendTransaction({
                    to: GreenholeAddress,
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
