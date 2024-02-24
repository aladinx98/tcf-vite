import React, { useEffect, useState } from "react";
import "./style.css";
import logo from "../../images/TCF.png";
import Abi from "../../Helpers/abi.json";
import TokenAbi from "../../Helpers/token.json";
import TokenModal from "./TokenModal";
import { list } from "../../Helpers/tokenlist";
import toast from "react-hot-toast";
import { Web3Button } from "@web3modal/react";
import { useAccount } from 'wagmi';
import Web3 from "web3";
import { prepareWriteContract, writeContract, waitForTransaction } from "@wagmi/core";

const isValid = ( regex ) => ( input ) => regex.test( input );
const numberRegex = /^\d*\.?\d*$/;
const isValidNumber = isValid( numberRegex );

const MainSection = () =>
{
  const { isConnected, address } = useAccount();

  const cAddress = "0xF69f714BB3F5366F97Dc8818e757A50Fa4a71f3F";
  const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
  const DEFAULT_GAS_PRICE_GWEI = "7"; // Default gas price in Gwei

  const [ selectedAmount, setSelectedAmount ] = useState( "" );

  const [ data, setData ] = useState( {
    bnb: "",
    gart: "",
    referralAddress: "",
  } );
  const [ open, setOpen ] = React.useState( false );
  const [ currentToken, setCurrentToken ] = useState( list[ 0 ] );
  const handleOpen = () => setOpen( true );
  const handleClose = () => setOpen( false );
  const gartVal = 453;
  const referralAddress = data.referralAddress || "";


  const webSupply_Binance = new Web3( "https://bsc-dataseed1.binance.org:443" );

  const buyWithUsdt = async () => {
    if (!data.bnb || !data.gart) {
      toast.error("Please enter the correct value.");
      return;
    }
  
    try {
      const contract = new webSupply_Binance.eth.Contract(Abi, cAddress);
      const tokenContract = new webSupply_Binance.eth.Contract(TokenAbi, usdtAddress);
      let bnbValue = webSupply_Binance.utils.toWei(data.bnb.toString());
  
      const bnbValueNumber = Number(bnbValue);
      let value = bnbValueNumber;
  
      const allowance = await tokenContract.methods.allowance(address, cAddress).call();
  
      if (allowance >= value) {
        // No need to approve, proceed with the buy transaction
        const buyTransaction = await prepareWriteContract({
          address: cAddress,
          abi: Abi,
          functionName: "buyWithReferral",
          args: [value, referralAddress],
          from: address,
          gas: 2_000_000n,
        });
  
        const toastId = toast.loading("Processing Transaction..");
        await writeContract(buyTransaction);
  
        toast.success("Transaction completed successfully", { id: toastId });
        setData({ bnb: "", gart: "", referralAddress: "" });
      } else {
        // Proceed with the approval transaction
        const approvalTransaction = await prepareWriteContract({
          address: usdtAddress,
          abi: TokenAbi,
          functionName: 'approve',
          args: [cAddress, value],
          from: address,
          gas: 2_000_000n,
        });
  
        const toastId = toast.loading("Transaction approve..");
        const hash = await writeContract(approvalTransaction);
  
        toast.loading("Processing Transaction..", { id: toastId });
  
        // Wait for the approval transaction to be mined
        await waitForTransaction(hash);
  
        // Introduce a time interval (e.g., 5 seconds) before executing the buy transaction
        const intervalDuration = 15000; // 15 seconds
        setTimeout(async () => {
          // Check allowance again after approval
          const updatedAllowance = await tokenContract.methods.allowance(address, cAddress).call();
  
          if (updatedAllowance >= value) {
            // Approval successful, proceed with the buy transaction
            const buyTransaction = await prepareWriteContract({
              address: cAddress,
              abi: Abi,
              functionName: "buyWithReferral",
              args: [value, referralAddress],
              from: address,
              gas: 2_000_000n,
            });
  
            await writeContract(buyTransaction);
  
            toast.success("Transaction completed successfully", { id: toastId });
            setData({ bnb: "", gart: "", referralAddress: "" });
          } else {
            // Approval failed
            toast.error("Insufficient allowance. Please approve a higher amount.");
          }
        }, intervalDuration);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something is wrong!");
    }
  };
  
  const buyToken = async () =>
  {
    if ( isConnected )
    {
      if ( currentToken.name === "USDT" )
      {
        buyWithUsdt();
      }
    } else
    {
      toast.error( "Please connect your wallet." );
    }
  };

  return (
    <>
      <br></br>
      <br></br>
      <div className='main-section'>
        <p className='headings'>The Crypto Factory (TCF)</p>
        <p style={ { fontSize: "17px", color: "#ffffff", margin: "5px" } }>(Round 2 - Price 0.0022$)</p>
        <p style={ { fontSize: "17px", color: "#feaf22", margin: "5px" } }>Next Round Start From 1st Mar with 0.0033$</p>
        <div className='main-section-form'>
          <p style={ { fontSize: "17px", color: "#feaf22", marginBottom: "5px" } }>Get 5% Referral Bonus</p>
          <p className='mb-6'>
            1 { currentToken.name } = { gartVal } TCF
          </p>

          <p className='mgtp'>Pay with</p>
          <div className='form-group'>
            <select
              id='bnb'
              className='text-black'
              value={ data.bnb }
              onChange={ ( e ) =>
              {
                const selectedOption = e.target.value;
                const usdtAmount = selectedOption === "Max" ? 1000 : parseInt( selectedOption, 10 );
                setData( {
                  ...data,
                  buyOption: selectedOption,
                  bnb: usdtAmount,
                  gart: usdtAmount * gartVal,
                } );
              } }
            >
              <option value=''>Select USDT</option>
              <option value='50'>Buy 50 USDT</option>
              <option value='100'>Buy 100 USDT</option>
              <option value='150'>Buy 150 USDT</option>
              <option value='200'>Buy 200 USDT</option>
              <option value='250'>Buy 250 USDT</option>
              <option value='500'>Buy 500 USDT</option>
              <option value='1000'>Buy 1000 USDT</option>
            </select>

            <div
              onClick={ handleOpen }
              className=' cursor-pointer items-center flex'
            >
              <img
                src={ currentToken.icon }
                alt='snk'
              />
              <p>{ currentToken.name }</p>
            </div>
          </div>
          <p className='mgtp'>You will get</p>
          <div className='form-group'>
            <input
              type='text'
              className='text-black'
              value={ data.gart }
              onChange={ ( e ) =>
              {
                const val = e.target.value
                  .split( "" )
                  .filter( ( el ) => isValidNumber( el ) )
                  .join( "" );
                setData( {
                  ...data,
                  gart: val,
                  bnb: val / gartVal,
                } );
              } }
            />
            <div>
              <img
                src={ logo }
                alt='snk'
              />
              <p>TCF</p>
            </div>
          </div>

          <p className='mgtp'>Add Referral Address <span style={ { fontSize: "12px", color: "#feaf22" } }>( Use only BEP20 USDT address )</span></p>
          <div className='form-group'>
            <input
              type='text'
              className='text-black'
              value={ data.referralAddress }
              onChange={ ( e ) =>
              {
                const val = e.target.value;
                // You can update the state for referralAddress here
                setData( {
                  ...data,
                  referralAddress: val,
                } );
              } }
              placeholder='Enter Referral Address'
            />
          </div>

          <div style={ { textAlign: "center", margin: "0.5em 0" } }>
            <button
              className='buy'
              onClick={ buyToken }
              style={ { margin: "1px" } }
            >
              { isConnected ? "Buy" : "Connect" }
            </button>

          </div>

          <div className='smart'>
            
           <p style={ { fontSize: "17px", color: "#feaf22", margin: "5px" } }><i class="fa-brands fa-youtube fa-bounce"></i> <a href="https://www.youtube.com/watch?v=RqRXyrsK2Yc" target="_blank">How to Buy TCF Token</a></p>
          </div>
        </div>

        <TokenModal
          open={ open }
          setOpen={ setOpen }
          handleOpen={ handleOpen }
          handleClose={ handleClose }
          currentChain={ currentToken }
          setCurrentChain={ setCurrentToken }
          setData={ setData }
        />
      </div>
    </>
  );
};

export default MainSection;
