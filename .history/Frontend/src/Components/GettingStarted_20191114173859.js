import React, { Component } from 'react'
//import GettingStarted from './GettingStarted'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

class LandingPage extends Component {
    render() {
        return (
            <div style={{
                width: "100%",
                height: "100%",
                backgroundColor: "white",
            }}>
                <Container style={{
                    maxWidth: "100%",
                    height: "100%",
                    width: "100%",
                }}>
                    <Row>
                        <Col sm={8}>
                            <img alt="twitter" src="/Users/Keerthy/Desktop/Fall/273/Final/AAKKS/Frontend/src/Components/twitterLandingPage.png" style={{
                                width: "auto",
                                height: "auto",
                                
                            }}/>
                        </Col>
                        <Col sm={4} style={{
                            alighnItems: "center",
                        }}>
                            <GettingStarted />
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default LandingPage
