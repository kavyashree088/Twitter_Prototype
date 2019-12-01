import React, { Component }  from 'react';
import {
    Card,
    CardImg,
    CardText,
    CardBody,
    CardTitle,
    CardSubtitle,
    CardLink
  } from "reactstrap";

export const processTweetText = (tweetText) => {
    debugger;
    let hyperLinkExp = /http:\/\/[\w\.\/]*/g;
    let textArr = tweetText.split(' ');
    for(let i=0; i<textArr.length; i++){
        let text = textArr[i];
        let match = hyperLinkExp.exec(text);
        if(match){
            let http = /http:\/\//g;
            text = text.replace(http,"") + " ";
            textArr[i] = <CardLink key={i} href={textArr[i]} target = "_blank">{text}</CardLink>
        } else {
            textArr[i] = textArr[i] + " ";
        }
    }
    return <CardText> {textArr} </CardText>;
 }
export const getUserFullName = () => {
    //TODO : combine localstorage firstname + " "+ lastname
    return 'Anjali Bandaru';
}
export const getUserName =() => {
    //TODO : get from local storage
    return 'anjali';
}
export const TWEETCHARLIMIT = '280';