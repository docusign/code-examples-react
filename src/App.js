import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { ToastContainer, toast } from 'react-toastify';
import OAuthImplicit from './OAuthImplicit';

import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accessToken: undefined,
            expires: undefined,
            name: undefined,
            email: undefined,
            externalAccountId: undefined,
            accountName: undefined,
            accountId: undefined,
            baseUri: undefined,
            page: 'welcome', // initial page. Pages: welcome|loggedIn
            working: false,
            workingMessage: '',
            responseErrorMsg: undefined,
            responseEnvelopeId: undefined,
            responseAvailableApiRequests: undefined,
            responseApiRequestsReset: undefined,
            responseSuccess: undefined,
            responseTraceId: undefined,
            formName: '',
            formEmail: '',  
        };
        this.oAuthImplicit = new OAuthImplicit(this);
        //this.docusign = new DocuSign(this);
        this.logout = this.logout.bind(this);
        this.startAuthentication = this.startAuthentication.bind(this);
        this.formNameChange = this.formNameChange.bind(this);
        this.formEmailChange = this.formEmailChange.bind(this);
        this.sendEnvelope = this.sendEnvelope.bind(this);
    }
  
    async componentDidMount() {
        const hash = window.location.hash;
        if (!hash) {return}
        // possible OAuth response
        this.setState({working: true, workingMessage: 'Authenticating'});
        await this.oAuthImplicit.completeLogin();
        this.setState({working: false});        
    }
  
    componentWillUnmount() {
    }
      
    startAuthentication() {
      this.oAuthImplicit.startLogin();
    }
    
    /**
     * Is the accessToken ok to use?
     * @returns boolean accessTokenIsGood
     */
    checkToken() {
      if (
        !this.state.accessToken ||
        this.state.expires === undefined ||
        new Date() > this.state.expires
      ) {
        // Need new login. Only clear auth, don't clear the state (leave form contents);
        this.clearAuth();
        this.setState({ page: 'welcome', working: false });
        toast.error('Your login session has ended.\nPlease login again', {
          autoClose: 8000,
        });
        return false;
      }
      return true;
    }
  
    /**
     * This method clears this app's authentication information.
     * But there may still be an active login session cookie
     * from the IdP. Your IdP may have an API method for clearing
     * the login session.
     */
    logout() {
      this.clearAuth();
      this.clearState();
      this.setState({ page: 'welcome' });
      toast.success('You have logged out.', { autoClose: 1000 });
    }
  
    /**
     * Clear authentication-related state
     */
    clearAuth() {
      this.setState({
        accessToken: undefined,
        expires: undefined,
        accountId: undefined,
        externalAccountId: undefined,
        accountName: undefined,
        baseUri: undefined,
        name: undefined,
        email: undefined,
      })
    }
  
    /**
     * Clear the app's form and related state
     */
    clearState() {
      this.setState({
        formName: '',
        formEmail: '',
        working: false,
        responseErrorMsg: undefined,
        responseEnvelopeId: undefined,
        responseAvailableApiRequests: undefined,
        responseApiRequestsReset: undefined,
        responseSuccess: undefined,
        responseTraceId: undefined,
      });
    }
  
    /**
     * Process the oauth results.
     * This method is called by the OAuthImplicit class
     * @param results
     */
    oAuthResults(results) {
      this.setState({
        accessToken: results.accessToken, expires: results.expires, 
        name: results.name, externalAccountId: results.externalAccountId,
        email: results.email, accountId: results.accountId,
        accountName: results.accountName, baseUri: results.baseUri,
        page: 'loggedIn',
        formName: results.name, // default: set to logged in user
        formEmail: results.email,
      });
  
      toast.success(`Welcome ${results.name}, you are now logged in`);
    }
  
    formNameChange(event) {
      this.setState({ formName: event.target.value });
    }
  
    formEmailChange(event) {
      this.setState({ formEmail: event.target.value });
    }
  
    async sendEnvelope() {
      this.setState({
        responseErrorMsg: undefined,
        responseEnvelopeId: undefined,
        responseAvailableApiRequests: undefined,
        responseApiRequestsReset: undefined,
        responseSuccess: undefined,
        responseTraceId: undefined,
      });
      if (!this.checkToken()) {
        return; // Problem! The user needs to login
      }
      if (!this.state.formEmail || this.state.formEmail.length < 5) {
        toast.error("Problem: Enter the signer's email address");
        return;
      }
      if (!this.state.formName || this.state.formName.length < 5) {
        toast.error("Problem: Enter the signer's name");
        return;
      }
    
      this.setState({ working: true });
      const results = await this.docusign.sendEnvelope();
      const { apiRequestsReset } = results;
      const responseApiRequestsReset = apiRequestsReset
        ? new Date(apiRequestsReset) : undefined;
      this.setState({
        working: false,
        responseSuccess: results.success,
        responseErrorMsg: results.errorMsg,
        responseEnvelopeId: results.envelopeId,
        responseAvailableApiRequests: results.availableApiRequests,
        responseTraceId: results.traceId,
        responseApiRequestsReset,
      });
    }
  
    render() {
        let pagebody;
        switch (this.state.page) {
            case 'welcome': // not logged in
                pagebody = this.Welcome();
                break;
            case 'loggedIn':
                pagebody = this.LoggedIn();
                break;
            default:
                pagebody = this.Welcome();
        };
        let nameBlock;
        if (this.state.accessToken) {
            nameBlock = (
                <Navbar.Text>
                    {this.state.name}<br/>
                    {this.state.accountName} ({this.state.externalAccountId})
                <Nav>
                    <Nav.Link href="#" onClick={()=> this.logout()}>Logout</Nav.Link>
                </Nav>
                </Navbar.Text>
            )
            } else {
                nameBlock = null;
            }

        return (
            <>
            <Navbar fixed="top" bg="primary" variant="dark" >
                <Navbar.Brand>DocuSign Code Example</Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                    {nameBlock}
                </Navbar.Collapse>
            </Navbar>
            <ToastContainer />
            <Container fluid className='bodyMargin' style={{ display: this.state.working ? 'block' : 'none' }}>
                <Row className='justify-content-center'>
                    <div className="spinner" />
                </Row>
                <Row className='justify-content-center'>
                    <h3>{this.state.workingMessage}…</h3>
                </Row>
            </Container>
            {pagebody}
            </>
        )
    }
  
    LoggedIn() {
      const resetTime = this.state.responseApiRequestsReset;
      const resetTimeString = resetTime
        ? new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'full',
          }).format(resetTime)
        : undefined;
      return (
        <Container fluid className='bodyMargin'>
          <div>
            <h1>Send an Envelope with an embedded signing ceremony</h1>
            <form>
              <label>
                Name:
                <input
                  type="text"
                  value={this.state.formName}
                  onChange={this.formNameChange}
                />
              </label>
              <label>
                Email:
                <input
                  type="text"
                  value={this.state.formEmail}
                  onChange={this.formEmailChange}
                />
              </label>
            </form>
            <div>
              <button type="button" onClick={this.sendEnvelope}>
                Send Envelope
              </button>
            </div>
            <h1>Results</h1>
            <h1>
              {this.state.responseSuccess !== undefined ? (
                this.state.responseSuccess ? (
                  <>✅ Success!</>
                ) : (
                  <>❌ Problem!</>
                )
              ) : null}
            </h1>
            {this.state.responseErrorMsg ? (
              <p>Error message: {this.state.responseErrorMsg}</p>
            ) : null}
            {this.state.responseEnvelopeId ? (
              <p>Envelope ID: {this.state.responseEnvelopeId}</p>
            ) : null}
            {this.state.responseAvailableApiRequests ? (
              <p>
                Available API requests: {this.state.responseAvailableApiRequests}
              </p>
            ) : null}
            {resetTimeString ? (
              <p>API requests reset time: {resetTimeString}</p>
            ) : null}
            {this.state.responseTraceId ? (
              <p>
                Trace ID: {this.state.responseTraceId}. Please include with all
                customer service questions.
              </p>
            ) : null}
          </div>
          </Container>
      );
    }
  
    Welcome() {
        return (
    <Container fluid className='welcomeMargin'>
        <Row>
            <Col>
                <Jumbotron>
                    <h1>React Example with OAuth Authentication</h1>
                    <p>
                        In this example the user authenticates with DocuSign via the OAuth Implicit grant flow.
                        Since the app will then have an access token for the user, the app can call any 
                        DocuSign eSignature REST API method.
                    </p>
                    <p>
                        Use this example for apps used by the staff of your organization who have 
                        DocuSign accounts. For example, an application could pull data from multiple
                        sources and then send an envelope that includes the data.
                    </p>
                    <p>
                        Login with your DocuSign Developer (Demo) credentials.
                    </p>
                    <p>
                        <Button variant="primary" onClick={this.startAuthentication}>Login</Button>
                    </p>
                </Jumbotron>
            </Col>
        </Row>
    </Container>
    )
    }
}
export default App;
