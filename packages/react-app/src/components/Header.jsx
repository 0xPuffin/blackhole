import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="#" target="_blank" rel="noopener noreferrer">
       <PageHeader
        title=" "
        avatar={{src:"https://i.imgur.com/gMvjiVw.png"}}
        subTitle="Blackhole.Bet"
        style={{ cursor: "pointer", fontSize: "2em" }}
      /> 
    </a>
  );
}
