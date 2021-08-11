
import React, { useState } from "react";
import { shortenAddress, standardizeLink } from "../helpers";

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import {useExternalContractLoader, useContractReader} from "../hooks";
import ERC721Abi from "../contracts/ERC721.abi";
import BookingFactoryFacetAbi from "../contracts/BookingFactoryFacet.abi";
import BookingFactoryFacetAddress from "../contracts/BookingFactoryFacet.address";
import BookingAbi from "../contracts/Booking.abi";



import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin, Tooltip } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { Address, Balance, EtherInput, AddressInput } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { Alert } from "antd";
import axios from "axios";
  
const x0 = "0x0000000000000000000000000000000000000000";

function getUrlVars() {
  const vars = {};
  const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {vars[key] = value;});
  return vars;
}

/* eslint-disable jsx-a11y/accessible-emoji */

export default function BookingUI({
  setPurposeEvents,
  address,
  mainnetProvider,
  injectedProvider,
  userProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  writeContracts,
}) {
  const [amount, setAmount] = useState();
  const [facetAddress, setFacetAddress] = useState();
  const [action, setAction] = useState();

  const signer = userProvider.getSigner();

  //const data = writeContracts.DeFiFacet.interface.encodeFunctionData("zappify", [parseEther("1000")]);


  const [perDiem, setPerDiem] = React.useState();
  const [collateral, setCollateral] = React.useState();
  const [maxRental, setMaxRental] = React.useState();
  const nftAddress = getUrlVars()["nft"];
  const id = getUrlVars()["id"];
  const nftInstance = useExternalContractLoader(injectedProvider, nftAddress, ERC721Abi);
  const uri = useContractReader({ERC721: nftInstance},"ERC721", "tokenURI",[id]);
  const nftBackupName = useContractReader({ERC721: nftInstance},"ERC721", "name",[]);
  const [nftData, setNFTData] = React.useState();

  const factoryInstance = useExternalContractLoader(injectedProvider, BookingFactoryFacetAddress, BookingFactoryFacetAbi);
  const bookingAddress = useContractReader({BookingFactoryFacet: factoryInstance},"BookingFactoryFacet", "getBooking",[nftAddress, id]);
  
  const bookingInstance = useExternalContractLoader(injectedProvider, bookingAddress, BookingAbi);
  const owner = useContractReader({Booking: bookingInstance},"Booking", "owner",[]);
  const bookingData = useContractReader({Booking: bookingInstance},"Booking", "getRentalData",[]);
  const renter = useContractReader({Booking: bookingInstance},"Booking", "renter",[]);

  const isApprovedForAll = useContractReader({ERC721: nftInstance}, "ERC721", "isApprovedForAll", [owner, bookingAddress]);

  const [inited, setInited] = React.useState();
  const [loadedURI, setLoadedURI] = React.useState();
  const [loadedBooking, setLoadedBooking] = React.useState();
  const [rented, setRented] = React.useState();
  const [returnBlock, setReturnBlock] = React.useState();
  const [currentBlock, setCurrentBlock] = React.useState();
  const [currentBlockTimestamp, setCurrentBlockTimestamp] = React.useState();
  
  const [approvalPending, setApprovalPending] = React.useState();


  const [bookingLength, setBookingLength] = React.useState();

  React.useEffect(() => {
      const asyncInit = async () => {
        setInited(true);
        setNFTData({
            image: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/96dabfd2-9198-4e81-89bc-f65dc34c8613/d9ospke-5cbf474c-a9a9-4710-8b00-ab86ef85c223.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwic3ViIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsImF1ZCI6WyJ1cm46c2VydmljZTpmaWxlLmRvd25sb2FkIl0sIm9iaiI6W1t7InBhdGgiOiIvZi85NmRhYmZkMi05MTk4LTRlODEtODliYy1mNjVkYzM0Yzg2MTMvZDlvc3BrZS01Y2JmNDc0Yy1hOWE5LTQ3MTAtOGIwMC1hYjg2ZWY4NWMyMjMuZ2lmIn1dXX0.3TGUITwSNJ-pL96gV6WdDUdqIpUXUWHaOPjtWKO3k0I",
            name: "Loading NFT...",
            description: ""
          });
          console.log(nftInstance);
        setPerDiem("0.000001");
        setCollateral("0.1");
        setMaxRental("12600");
        setRented(false);
      }
      const getMetaData = async () => {
        setLoadedURI(true);
        var d = await axios.get(standardizeLink(uri));
        console.log(`got metadata ${d}`);
        console.log(d);
        setNFTData(d.data);
      }

      const tryGetBooking = async () => {
        var d = await axios.get(standardizeLink(uri));
        console.log(`got metadata ${d}`);
        console.log(d);
        setNFTData(d.data);
      }

    if (!inited) {
        asyncInit();
    }
    if (!loadedURI && uri) {
        getMetaData();
    }

    console.log(`isApprovedForAll ${isApprovedForAll}`);
    console.log(`address is  ${address} renter is ${renter} owner is ${owner}`);
   console.log(writeContracts);
   if (writeContracts) {

    console.log(writeContracts.BookingFactoryFacet);
   }

    if (foundBooking()) {
        //load existing booking
        console.log("loading existing booking...");
        console.log(bookingData);
        console.log(formatEther(bookingData[0].toString()));
        setPerDiem(formatEther(bookingData[0].toString()));
        setCollateral(formatEther(bookingData[1].toString()));
        setMaxRental(bookingData[2].toString());
        setRented(bookingData[3] != x0);
        setReturnBlock(bookingData[5].toString());
        setCurrentBlock(bookingData[6].toString());
        setCurrentBlockTimestamp(bookingData[7].toString());
        if (!loadedBooking) {
            setLoadedURI(true);
            setBookingLength(parseInt(bookingData[2].toString())/2);
        }

        if (!isApproved() && !approvalPending && isApprovedForAll != undefined && !rented && renter != address) {
            console.log(`isApprovedFor all ${isApprovedForAll}`);
            setApprovalPending(true);
            console.log("trigger approve tx");
            const data = nftInstance.interface.encodeFunctionData("setApprovalForAll", [bookingAddress, true]);
                   
            tx(
                signer.sendTransaction({
                  to: nftAddress,
                  data: data,
                  value: 0,
                }),
              );
        }
    }

}, [ setPurposeEvents,
    address,
    mainnetProvider,
    userProvider,
    localProvider,
    yourLocalBalance,
    injectedProvider,
    price,
    tx,
    writeContracts,]);

    function isApproved() {
        return bookingAddress != x0 && isApprovedForAll;
    }
  

  function showOwner() {
    if (owner != "") {
      return  <h4>Holder:  
                 <a target="_" href={`https://etherscan.io/address/${owner}`}>{shortenAddress(owner)}</a>
              </h4>
   
    } else {
      return <></>
    }
  }

  function foundBooking() {
    return (bookingAddress != undefined && bookingAddress != "" && bookingAddress != x0 && bookingData);
  }

  function showBookingStatus(owner) {
    if (foundBooking()) {
        if (rented) {
            if (returnBlock > currentBlock) {
                const now = new Date();
                const expires = new Date((currentBlockTimestamp*100) + (13.6 * returnBlock-currentBlock));
                console.log(`block difference is ${returnBlock-currentBlock}, ${returnBlock} ${currentBlock}. expiration: ${expires.toDateString()}`);
                
                return   <Tooltip title={expires.toString()}>
                <span>💸 | Rented Until {expires.toLocaleString()}</span>
              </Tooltip>;
            } else {
                //rental expired owner can take collateral
                if (owner) {
                    return <>💰 | Rental Expired, NFT Not Returned Yet  
                    <u style={{cursor: "pointer"}}
                    onClick={() =>{
                        const data = bookingInstance.interface.encodeFunctionData("defaulted", []);
                    
                          tx(
                            signer.sendTransaction({
                                to: bookingAddress,
                                data: data,
                                value: 0,
                            }),
                            );
                    }}>
                          click here to claim collateral
                    </u></>
                } else {
                    return <> Rental Expired, Press the "Return NFT" Button below to get your collateral back</>
                }
            }
        } else {
            if (isApproved()) {
                return `🟢 | Listed For Booking`;
            } else {
                return <>🔴 | Approval Required</>;
            }
        }
       
    } else {
        return "🙈 | Not Listed Yet";
    }
  }

  function showRentalData() {
      if (foundBooking) {
        return <>
                <h4>Collateral Required: {collateral}♦</h4>
                <h4>Price/Block: {perDiem}♦ (~{perDiem*6300}♦/day)</h4>
                <h4>Max Rental: {maxRental} (~{maxRental/6300} days)</h4>

        </>;
      } else {
          return <></>
      }
  }

  function showName() {
    return nftData != null ? (nftData.name != undefined ? nftData.name : `${nftBackupName} #${id}`) : "";
  }

  function totalDue() {
      return (parseFloat(collateral)+(perDiem*bookingLength));
  }

  function showBookingForm() {
    return nftData != null ? ( 
        foundBooking() ? (

       
        !rented ? ( <Popup trigger={ 
        <Button 
        size="large"
        shape="round"
        type="primary"
        
        >
        Book it
        </Button> 
        } modal>
        <div style={{padding: "2%", textAlign: "center"}}>
        <h3>Book {showName()}</h3>
        
        <div style={{padding: "2%", textAlign: "left"}}>
            {showRentalData()}


            <label>Booking Length (1 Day ≈ 6300 Blocks):</label>
            <div className="slidecontainer">
                <input type="range" min="1" max={maxRental} value={bookingLength} className="slider" onChange={(e)=>setBookingLength(e.target.value)}/>
                <p>~ {(bookingLength/6300).toFixed(3)} days</p> 
            </div>

            <h4>Total Payemnt: {totalDue().toFixed(5)}♦</h4>
            <hr/>
         
        </div>
        <br/>
        <p style={{textAlign: "center"}}>If you do not return the NFT within the rental period your collateral may be not be refundable</p>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
        <Button 
        size="large"
        shape="round"
        type="primary"
        onClick={() => handleRentalButtonClick()}
        >
        Book it
        </Button> 
       
            </div>
        
        
        </div>
    </Popup>
     ) :  
     (address == renter ?
        showRentalManagement()
        :

     <Button size="large" shape="round" type="primary">Booked</Button>
        )
     ) : 
     <Button size="large" shape="round" type="primary">Not Listed Yet</Button>) 
     : 
    <Button size="large" shape="round" type="primary">Loading...</Button> 

  }

  function showListingManagement() {
    return  <Popup trigger={ <b><u style={{cursor: "pointer"}}>Listing Management</u></b>  
        } modal>
        <div style={{padding: "2%", textAlign: "center"}}>
        <h3>Listing Management</h3>

        <h5 ><span style={{opacity: "90%"}}>STATUS:</span> <b>{showBookingStatus(true)}</b></h5>
        <div style={{padding: "2%", textAlign: "left"}}>

        <label>ETH/Block:
        <input type="text" placeholder="0.000001" value={perDiem} onChange={e=>setPerDiem(e.target.value)}/>
        </label> 

        <br/>
        <label>Collateral:
        <input type="text" placeholder="0.1" value={collateral} onChange={e=>setCollateral(e.target.value)}/>
        </label> 
        <br/>
        <label>Max Rental Blocks (1 Day ≈ 6300 Blocks):
        <input type="text" placeholder="12600" value={maxRental} onChange={e=>setMaxRental(e.target.value)}/>
        </label> 
        </div>
        <br/>
        <p style={{textAlign: "center"}}>When your NFT is rented out by a user there is no guarantee to get it back. It may not be returned at the end of the rental period, make sure to <b>set the collateral high enough to make up for loss of property</b>.</p>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
        
        <Button 
                size="large"
                shape="round" onClick={async ()=> {
                    if (foundBooking()) {
                        //save updated booking
                        const data = bookingInstance.interface.encodeFunctionData("update", [parseEther(perDiem), parseEther(collateral), maxRental]);
                        console.log(`type of value is: ${typeof(parseEther(`${totalDue()}`))}`); 
                        tx(
                            signer.sendTransaction({
                            to: bookingAddress,
                            data: data,
                            value: 0,
                            }),
                        );
                    } else {
                        console.log("creating new booking");
                        //create new booking
                    const data = writeContracts.BookingFactoryFacet.interface.encodeFunctionData("createBooking", [nftAddress, id,  parseEther(perDiem), parseEther(collateral), maxRental]);
                    
                    await  tx(
                        signer.sendTransaction({
                            to: writeContracts.BookingFactoryFacet.address,
                            data: data,
                            value: 0,
                        }),
                        );
                    }

            //createBooking(context.account, address, id, perDiem, collateral, maxRental);
        }}>
            {foundBooking() ? "Save 💾" : "Create 📡"}
        
        </Button>

        </div>

        
        </div>
        </Popup>

  }

  function showRentalManagement() {
    return  <Popup trigger={ 
        <Button size="large" shape="round" type="primary">Manage Rental</Button>  
        } modal>
        <div style={{padding: "2%", textAlign: "center"}}>
        <h3>Rental Management</h3>

        <h5 ><span style={{opacity: "90%"}}>STATUS:</span> <b>{showBookingStatus(false)}</b></h5>
        
        <p>Contract Approved to return NFT: {isApproved() ? <>✅</> : <>🔴 Not Yet</>}</p>
     
       
        <br/>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
        {isApproved() ?
         <Button 
         size="large"
         shape="round" onClick={async ()=> {
             const data = bookingInstance.interface.encodeFunctionData("returnNFT", []);
             
             await  tx(
                 signer.sendTransaction({
                     to: bookingAddress,
                     data: data,
                     value: 0,
                 }),
                 );
             } }>
            {"Return NFT"}
        
        </Button>

        :
        <Button 
        size="large"
        shape="round" onClick={async ()=> {
            const data = nftInstance.interface.encodeFunctionData("setApprovalForAll", [bookingAddress, true]);    
            tx(
                signer.sendTransaction({
                  to: nftAddress,
                  data: data,
                  value: 0,
                }),
            );
        }}>
        {"Approve"}
        </Button>

        }
       
        </div>

        
        </div>
        </Popup>

  }


  function handleRentalButtonClick() {
      if (rented) {
          alert("This NFT is already Rented")
      } else {
          if (foundBooking()) {
            const data = bookingInstance.interface.encodeFunctionData("rent", [`${bookingLength}`]);
                    console.log(`type of value is: ${typeof(parseEther(`${totalDue()}`))}`); 
             tx(
                signer.sendTransaction({
                  to: bookingAddress,
                  data: data,
                  value: parseEther(`${totalDue()}`),
                }),
              );
          } else {
              alert("This NFT is not listed for rent yet");
          }
      }
  }

  return (

    <div style={{display: "flex", flexDirection: "column", padding: "2%"}}>
            
     <div className="row">
    
             <img src={standardizeLink(nftData != null ? nftData.image : "")} style={{maxWidth: "100%", height: "auto"}}/>
            <div style={{display: "flex", flexDirection: "column", padding: "2%"}}>
              <h1>{showName()}</h1>
              {showOwner()}
              <hr/>
              <p><b>{nftData != null ?nftData["description"] : ""}</b></p>
                <br/>
              <hr/> 
                {showRentalData()}


                {showBookingForm()}
             
            </div>
      </div>  
      
      <p style={{textAlign:"center"}}>
       
      {injectedProvider && address != "" ?
       (address === owner ?  
            showListingManagement()
        : <></>)
      : <span><b>Is this your NFT?</b> Connect Wallet to manage this page!</span>} 
      </p>
      </div>
  
    );
}


