import React, { Component } from "react";
import { Row, Col } from 'react-bootstrap'
import axios from "axios";
import swal from 'sweetalert';
import { connect } from 'react-redux';
import {getBookmarkTweets} from '../JS/Actions/tweetAction';
import ReplyModal from './ReplyModal';
import TweetModal from './TweetModal';
import TweetComponent from './TweetComponent.js';
const settings = require("../Config/settings.js");
const getUserName=localStorage.getItem("username");

export class BookmarkTweets extends Component {
    componentDidMount() {
        let postURL = "http://"+settings.hostname+":"+settings.port+"/getBookmarks/getBookmarks";
        //TODO :get userId from local storage
        //TODO :or get followers list from local storage and send it
        let username = getUserName;
        let data = {username};
        let dataObj = {data,  url : postURL};
        axios.defaults.withCredentials = true;
        this.props.getBookmarkTweets(dataObj);
    }

   render(){
       //debugger;
       let allTweets = this.props.bookmarkedTweets;
       let tweetsMarkup = [];
       if(allTweets && allTweets.length > 0){
           let i=0;
           for( i= 0; i< allTweets.length; i++){
            tweetsMarkup.push(<TweetComponent key={i} tweet = { allTweets[i] }/>);
           }
           tweetsMarkup.push(<ReplyModal key={i+1}/>)
           tweetsMarkup.push(<TweetModal key={i+2}/>)
           return tweetsMarkup;
       } else {
           return (<div>
            <h4 style={{ textAlign: "center" ,marginTop:"70px",marginBottom:"2px"}}>
              <b> You haven’t added any Tweets to your Bookmarks yet</b>
            </h4>
            <h6 style={{ textAlign: "center",color:"#808080" }}>When you do, it’ll show up here.</h6>
          </div>);
       }
   }
}

const mapStateToProps = (state, ownProps) => {
    return{
        bookmarkedTweets : state.tweetReducer.bookmarkedTweets
    }
}

const mapDispatchToProps = function(dispatch){
    return {
        getBookmarkTweets : (dataObj) => dispatch(getBookmarkTweets(dataObj))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BookmarkTweets);