export { default as Transactor } from "./Transactor";
export function shortenAddress(address) {
    if (address) {
        return `${address.substring(0, 6)}...${address.substring(
            address.length - 4
          )}`;
    } else {
        return "";
    }
    
  };
  
  export function standardizeLink (link) {  
    if (link) {
        link = link.replace("ipfs://ipfs/", "https://ipfs.io/ipfs/")
        return link.replace("ipfs://", "https://ipfs.io/ipfs/");
    } else {
        return "";
    }
  };