
import React, { Component } from 'react'
import axios from 'axios';
import { Redirect } from 'react-router'
import rooturl from './../../Config/settings.js'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import './../../CSS/SignupPage.css'

class Signup extends Component {

    constructor(props) {
        super(props)
        this.state = {
            buyerName: "",
            buyerEmailId: "",
            buyerPassword: "",
            buyerPhone: "",
            buyerAddress: "",
            finishedSignUp: false,
            message: ""
        }

        this.buyerNameChangeHandler = this.buyerNameChangeHandler.bind(this)
        this.emailIdChangeHandler = this.emailIdChangeHandler.bind(this)
        this.passwordChangeHandler = this.passwordChangeHandler.bind(this)
        this.phoneNumberChangeHandler = this.phoneNumberChangeHandler.bind(this)
        this.submitSignUp = this.submitSignUp.bind(this)
        this.addressChangeHandler = this.addressChangeHandler.bind(this)
    }
    buyerNameChangeHandler = (e) => {
        this.setState({
            buyerName: e.target.value
        })
    }
    emailIdChangeHandler = (e) => {
        this.setState({
            buyerEmailId: e.target.value
        })
    }
    passwordChangeHandler = (e) => {
        this.setState({
            buyerPassword: e.target.value
        })
    }

    phoneNumberChangeHandler = (e) => {
        this.setState({
            buyerPhone: e.target.value
        })
    }

    addressChangeHandler = (e) => {
        this.setState({
            buyerAddress: e.target.value
        })
    }

    submitSignUp = (e) => {
        //console.log("in submit ")
        e.preventDefault();
        console.log(this.state.message)
        const data = {
            buyerName: this.state.buyerName,
            buyerEmailId: this.state.buyerEmailId,
            buyerPassword: this.state.buyerPassword,
            buyerPhone: this.state.buyerPhone.substring(1, 4),
            buyerAddress: this.state.buyerAddress,
        }

        console.log("data is..")
        console.log(data);

        this.setState({
            message: "Buyer already exists"
        })

        axios.defaults.withCredentials = true;
        axios.post('http://' + rooturl + ':3001/signup', data)
            .then(response => {
                console.log("frontend")
                //console.log("Status Code : ", response.status);
                console.log("Response from Sign Up " + response);
                console.log(response);
                //console.log(response.message)
                if (response.data.responseMessage === "Successfully Added!") {
                    this.setState({
                        finishedSignUp: true,
                        message: "Buyer signed up successfully"
                    })
                } else {
                    this.setState({
                        finishedSignUp: false,
                        message: "Buyer already exists"
                    })
                }
            });
    }

    render() {
        var nextpage = null
        if (this.state.finishedSignUp === true) {
            nextpage = <Redirect to="/BuyerSignIn" />
        }
        return (
            <div>
                {nextpage}


                <br></br>
                <center>
                    <Card style={{ width: '24rem' }} >
                        <br></br>
                        <span className="fab fa-twitter" style={{
                            marginRight: "10px",
                            fontSize: "1.5rem",
                            color: "rgba(29,161,242,1.00)"
                        }}></span>



                        <h3>Create your account</h3>
                        <br></br>
                        <center>
                            <Form style={{ width: '20rem' }}>
                                <Form.Group controlId="formGridName" >
                                    <Row>
                                        <Col>
                                            <Form.Control placeholder="First name" />
                                        </Col>
                                        <Col>
                                            <Form.Control placeholder="Last name" />
                                        </Col>
                                    </Row>
                                </Form.Group>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label className="fontColor">Email address</Form.Label>
                                    <Form.Control required type="email" placeholder="Enter email" name="buyerEmailId" onChange={this.emailIdChangeHandler} />
                                </Form.Group>

                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" required placeholder="Password" required name="buyerPassword" onChange={this.passwordChangeHandler} />
                                </Form.Group>
                                <Form.Group controlId="formGridPhoneNumber">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control required placeholder="### ### ####" input type="text" name="buyerPhone" maxLength="15" onChange={this.phoneNumberChangeHandler} />
                                </Form.Group>
                                <Form.Group controlId="formGridAddress1">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control placeholder="1234 Main St, city, state" required input type="text" name="address" onChange={this.addressChangeHandler} />
                                </Form.Group>
                                <Button variant="primary" type="submit" onClick={this.submitSignUp}>
                                    Create your account
                            </Button>

                            </Form>
                            <br></br>
                        </center>
                    </Card>
                </center>
            </div>
        )
    }
}

export default Signup